"""
NewsMirror English News Scraper
===============================
Scrapes English news from Geo News, HUM News English, SAMAA, Dunya News and
The Express Tribune for the categories in news_config.CATEGORIES, and stores
each article's headline, summary and category in MongoDB (newsmirror.articles).

How it works (each source runs in its own thread, one request at a time per site):
  1. Read every section's RSS feed or listing page  -> article links + headlines
  2. Pick the category: the section's own category, or a keyword match for
     general sections (Pakistan, Sci-Tech, ...) to find Politics/Education/Gaming/Science
  3. Open each article page and read og:title, og:description (the site's own
     short summary), og:image and the publish time
  4. Upsert into MongoDB by URL, save a JSON copy, and log everything to
     logs/news_scraper.log plus one run summary in newsmirror.scrape_logs

Usage:
  python news_scraper.py                       # all sources
  python news_scraper.py --sources geo dunya   # only some sources
  python news_scraper.py --limit 5 --no-mongo  # quick test, no DB writes
"""

import argparse
import json
import logging
import re
import sys
import time
import xml.etree.ElementTree as ET
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from news_config import (
    ARTICLES_PER_SECTION,
    CATEGORIES,
    CATEGORY_KEYWORDS,
    JSON_OUTPUT_FILE,
    LOG_BACKUP_DAYS,
    LOG_DIR,
    LOG_FILE,
    MAX_ARTICLE_AGE_DAYS,
    MAX_RETRIES,
    MAX_SUMMARY_CHARS,
    MONGO_COLLECTION,
    MONGO_DB,
    MONGO_LOG_COLLECTION,
    MONGO_URI,
    REQUEST_DELAY,
    REQUEST_TIMEOUT,
    SOURCES,
    USER_AGENT,
)

BASE_DIR = Path(__file__).resolve().parent
PAKISTAN_TZ = timezone(timedelta(hours=5))
MAX_LOGGED_ERRORS = 50

logger = logging.getLogger("news_scraper")


# ---------------------------------------------------------------------------
# Logging  (console + daily rotating file in logs/)
# ---------------------------------------------------------------------------

def setup_logging(verbose: bool = False) -> Path:
    # Headlines contain characters the Windows console can't always print
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="replace")
        except AttributeError:
            pass

    log_dir = BASE_DIR / LOG_DIR
    log_dir.mkdir(exist_ok=True)
    log_path = log_dir / LOG_FILE

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s – %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    file_handler = TimedRotatingFileHandler(
        log_path, when="midnight", backupCount=LOG_BACKUP_DAYS, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(logging.DEBUG if verbose else logging.INFO)
    root.handlers = [file_handler, console_handler]
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    return log_path


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

class SiteClient:
    """One HTTP session per site, with retries and a polite delay between requests."""

    def __init__(self) -> None:
        self.session = requests.Session()
        retry = Retry(
            total=MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        self.session.headers["User-Agent"] = USER_AGENT
        self._last_request = 0.0

    def get(self, url: str) -> requests.Response:
        wait = REQUEST_DELAY - (time.monotonic() - self._last_request)
        if wait > 0:
            time.sleep(wait)
        try:
            resp = self.session.get(url, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp
        finally:
            self._last_request = time.monotonic()


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

SENTENCE_END = (".", "!", "?", '"', "'", "”", "’")


def clean_text(text: Optional[str]) -> str:
    """Strip HTML and extra whitespace; fix "Friday.The" -> "Friday. The"."""
    if not text:
        return ""
    if "<" in text:
        text = BeautifulSoup(text, "html.parser").get_text(" ")
    text = re.sub(r"\s+", " ", text).strip()
    return re.sub(r"(?<=[a-z0-9][.!?])(?=[A-Z])", " ", text)


def make_summary(text: Optional[str], max_chars: int = MAX_SUMMARY_CHARS) -> str:
    """Short summary that ends cleanly: at a sentence end, or at a word followed by '…'."""
    text = clean_text(text)
    # A trailing "..." means the site cut the text, so it doesn't end a sentence
    truncated = text.endswith(("...", "…"))
    text = text.rstrip(".…") if truncated else text
    if len(text) <= max_chars and not truncated and text.endswith(SENTENCE_END):
        return text

    # Some sites cut their description mid-word; drop the broken last sentence
    window = text[:max_chars]
    ends = [m.end() for m in re.finditer(r"[.!?][\"'”’]?(?=\s|$)", window)]
    if ends and ends[-1] >= 60:
        return window[:ends[-1]]
    if len(text) <= max_chars and not truncated:
        return text
    cut = window[:window.rfind(" ")] if len(text) > max_chars else window
    return cut.rstrip(",;:-–") + "…"


def pick_headline(page_title: str, listing_title: str) -> str:
    """Prefer the page title, unless the listing/RSS title is a longer version of it
    (some sites cut og:title, others cut the listing text)."""
    if not page_title:
        return listing_title
    if listing_title.lower().startswith(page_title.lower()) and len(listing_title) > len(page_title):
        return listing_title
    return page_title


def clean_title(title: str, suffixes: list[str]) -> str:
    """Remove the site name from the end of a page title ("... | Dunya News")."""
    title = clean_text(title)
    for suffix in suffixes:
        title = re.sub(r"\s*[|\-–—]\s*" + re.escape(suffix) + r"\s*$", "", title, flags=re.I)
    return title.strip()


def parse_date(value: Optional[str]) -> Optional[datetime]:
    """Parse RSS (RFC 822), ISO or Dunya-style ("18 Oct 26, 08:53:04 PKT") dates into UTC."""
    if not value:
        return None
    value = value.strip()
    try:
        dt = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            try:
                dt = datetime.strptime(value.removesuffix("PKT").strip(), "%d %b %y, %H:%M:%S")
            except ValueError:
                return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=PAKISTAN_TZ)
    return dt.astimezone(timezone.utc)


def is_too_old(published: Optional[datetime]) -> bool:
    """Feeds sometimes list stories from months or years ago; NewsMirror only wants recent news."""
    return published is not None and datetime.now(timezone.utc) - published > timedelta(days=MAX_ARTICLE_AGE_DAYS)


# ---------------------------------------------------------------------------
# Category classifier (keywords, for general sections)
# ---------------------------------------------------------------------------

_KEYWORD_PATTERNS = {
    category: re.compile(r"\b(?:" + "|".join(re.escape(w) for w in words) + r")\b", re.I)
    for category, words in CATEGORY_KEYWORDS.items()
}


def classify(title: str, summary: str, candidates: list[str]) -> Optional[str]:
    """Return the candidate category with the best keyword score (ties: earlier candidate).

    A headline hit scores 2 and a summary hit 1; a category needs at least 2, so one
    stray word in a long feed description isn't enough on its own.
    """
    title, summary = title.replace("’", "'"), summary.replace("’", "'")
    best, best_score = None, 1
    for category in candidates:
        pattern = _KEYWORD_PATTERNS.get(category)
        if not pattern:
            continue
        score = 2 * len(pattern.findall(title)) + len(pattern.findall(summary))
        if score > best_score:
            best, best_score = category, score
    return best


# ---------------------------------------------------------------------------
# Readers
# ---------------------------------------------------------------------------

def normalise_url(url: str) -> str:
    return url.split("#")[0].split("?")[0].replace("/index.php/", "/").strip()


def read_rss(client: SiteClient, url: str, pattern: str) -> list[dict]:
    root = ET.fromstring(client.get(url).content)
    items = []
    for item in root.iter("item"):
        link = normalise_url(item.findtext("link") or "")
        if not re.search(pattern, link):
            continue
        items.append({
            "url": link,
            "title": clean_text(item.findtext("title")),
            "summary": clean_text(item.findtext("description")),
            "published": item.findtext("pubDate"),
            "from_rss": True,
        })
    return items


def read_listing(client: SiteClient, url: str, selector: str, pattern: str) -> list[dict]:
    resp = client.get(url)
    soup = BeautifulSoup(resp.text, "html.parser")
    items, seen = [], set()
    for anchor in soup.select(selector):
        link = normalise_url(urljoin(resp.url, anchor["href"]))
        if link in seen or not re.search(pattern, link):
            continue
        title = clean_text(anchor.get("title") or anchor.get_text(" "))
        if len(title) < 15:
            # Image-only link; the headline link for the same article comes next
            continue
        seen.add(link)
        items.append({"url": link, "title": title, "summary": "", "published": None, "from_rss": False})
    return items


def read_article(client: SiteClient, url: str) -> dict:
    resp = client.get(url)
    soup = BeautifulSoup(resp.text, "html.parser")

    def meta(*names: str) -> str:
        for name in names:
            tag = soup.find("meta", attrs={"property": name}) or soup.find("meta", attrs={"name": name})
            if tag and tag.get("content"):
                return tag["content"].strip()
        return ""

    published = meta("article:published_time", "og:published_time", "pubdate")
    if not published:
        match = re.search(r'"datePublished"\s*:\s*"([^"]+)"', resp.text)
        published = match.group(1) if match else ""
    if not published:
        time_tag = soup.find("time")
        if time_tag:
            published = time_tag.get_text(" ", strip=True) or time_tag.get("datetime", "")

    image = meta("og:image", "twitter:image")
    return {
        "title": meta("og:title", "twitter:title") or (soup.title.get_text() if soup.title else ""),
        "summary": meta("og:description", "description", "twitter:description"),
        "image": urljoin(resp.url, image) if image else None,
        "published": published,
    }


# ---------------------------------------------------------------------------
# Source scraper
# ---------------------------------------------------------------------------

def scrape_source(key: str, cfg: dict, limit: int) -> tuple[list[dict], dict]:
    """Scrape one site. Returns (articles, stats)."""
    name = cfg["name"]
    client = SiteClient()
    stats = {
        "name": name, "sections_ok": 0, "sections_failed": 0, "listed": 0, "too_old": 0,
        "scraped": 0, "skipped": 0, "failed": 0, "by_category": Counter(), "errors": [],
    }
    logger.info("══ %s: %d sections", name, len(cfg["sections"]))

    # 1-2. Listing pages / feeds -> candidates with a category (first section wins)
    candidates: dict[str, dict] = {}
    for section in cfg["sections"]:
        url = section.get("rss") or section["html"]
        label = section["category"] or "auto"
        try:
            if "rss" in section:
                items = read_rss(client, url, cfg["article_pattern"])
            else:
                selector = section.get("links") or cfg["links"]
                items = read_listing(client, url, selector, cfg["article_pattern"])
        except Exception as exc:  # noqa: BLE001
            stats["sections_failed"] += 1
            stats["errors"].append(f"section {url}: {exc}")
            logger.error("[%s] Section %s failed (%s): %s", name, label, url, exc)
            continue

        stats["sections_ok"] += 1
        stats["listed"] += len(items)
        # Each category gets its own quota, so keyword matches (e.g. Gaming inside a
        # Technology feed) are still picked up after the section's own quota is full
        kept = Counter()
        too_old = 0
        for item in items[:section.get("scan", len(items))]:
            if item["url"] in candidates:
                continue
            if is_too_old(parse_date(item["published"])):
                too_old += 1
                continue
            category = section["category"]
            if section.get("classify"):
                category = classify(item["title"], item["summary"], section["classify"]) or category
            if category is None or kept[category] >= limit:
                continue
            candidates[item["url"]] = {**item, "category": category}
            kept[category] += 1

        if not items:
            logger.warning("[%s] Section %s returned no articles (%s) – check the selector/feed", name, label, url)
        logger.info(
            "[%s] Section %-13s listed %3d, kept %2d%s%s  (%s)",
            name, label, len(items), sum(kept.values()),
            f" {dict(kept)}" if len(kept) > 1 or (kept and label == "auto") else "",
            f", {too_old} older than {MAX_ARTICLE_AGE_DAYS}d skipped" if too_old else "",
            url,
        )
        stats["too_old"] += too_old

    # 3. Article pages -> headline, summary, image, publish time
    articles = []
    for cand in candidates.values():
        try:
            page = read_article(client, cand["url"])
        except Exception as exc:  # noqa: BLE001
            stats["failed"] += 1
            stats["errors"].append(f"article {cand['url']}: {exc}")
            logger.warning("[%s] Article failed %s: %s", name, cand["url"], exc)
            continue

        page_title = clean_title(page["title"], cfg["title_suffixes"])
        listing_title = clean_title(cand["title"], cfg["title_suffixes"])
        # RSS titles are clean; listing-page link text can carry dates/labels, so only
        # let RSS titles replace a page title that was cut short
        headline = pick_headline(page_title, listing_title) if cand["from_rss"] else (page_title or listing_title)
        summary = make_summary(page["summary"])
        if not summary or summary.lower() == headline.lower():
            summary = make_summary(cand["summary"]) or summary
        if not headline or not summary:
            stats["skipped"] += 1
            logger.warning("[%s] Skipped (no %s): %s", name, "headline" if not headline else "summary", cand["url"])
            continue

        published = parse_date(page["published"]) or parse_date(cand["published"])
        if is_too_old(published):
            stats["too_old"] += 1
            logger.info("[%s] Skipped (older than %dd): %s", name, MAX_ARTICLE_AGE_DAYS, headline[:80])
            continue

        articles.append({
            "headline": headline,
            "summary": summary,
            "category": cand["category"],
            "source": name,
            "source_key": key,
            "url": cand["url"],
            "image": page["image"],
            "published_at": published,
        })
        stats["scraped"] += 1
        stats["by_category"][cand["category"]] += 1
        logger.info("[%s] %-13s %s", name, cand["category"], headline[:90])

    logger.info(
        "══ %s done: %d scraped, %d skipped, %d failed, %d/%d sections OK",
        name, stats["scraped"], stats["skipped"], stats["failed"],
        stats["sections_ok"], len(cfg["sections"]),
    )
    return articles, stats


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------

class ArticleStore:
    """MongoDB: articles upserted by URL, plus one summary document per run."""

    def __init__(self) -> None:
        from pymongo import ASCENDING, DESCENDING, MongoClient

        self._client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5_000)
        self._client.admin.command("ping")
        db = self._client[MONGO_DB]
        self.articles = db[MONGO_COLLECTION]
        self.logs = db[MONGO_LOG_COLLECTION]
        self.articles.create_index([("url", ASCENDING)], unique=True)
        self.articles.create_index([("category", ASCENDING), ("published_at", DESCENDING)])
        self.articles.create_index([("first_seen_at", DESCENDING)])
        logger.info("MongoDB ready → %s.%s", MONGO_DB, MONGO_COLLECTION)

    def save(self, article: dict, now: datetime) -> str:
        """Returns "inserted" or "updated"."""
        result = self.articles.update_one(
            {"url": article["url"]},
            {
                "$set": {**article, "scraped_at": now},
                "$setOnInsert": {"first_seen_at": now},
            },
            upsert=True,
        )
        return "inserted" if result.upserted_id else "updated"

    def save_run_log(self, run_log: dict) -> None:
        self.logs.insert_one(run_log)

    def close(self) -> None:
        self._client.close()


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def run_scraper(
    source_keys: list[str],
    limit: int = ARTICLES_PER_SECTION,
    use_mongo: bool = True,
    output_file: str = JSON_OUTPUT_FILE,
) -> dict:
    started = datetime.now(timezone.utc)
    logger.info("Run started: sources=%s, up to %d articles per section", ", ".join(source_keys), limit)

    store: Optional[ArticleStore] = None
    run_errors: list[str] = []
    if use_mongo:
        try:
            store = ArticleStore()
        except Exception as exc:  # noqa: BLE001
            run_errors.append(f"MongoDB unavailable: {exc}")
            logger.error("MongoDB unavailable – articles will only be saved to JSON. (%s)", exc)

    # Sites are scraped in parallel; each site gets one request at a time
    results: dict[str, tuple[list[dict], dict]] = {}
    with ThreadPoolExecutor(max_workers=len(source_keys)) as pool:
        futures = {key: pool.submit(scrape_source, key, SOURCES[key], limit) for key in source_keys}
        for key, future in futures.items():
            try:
                results[key] = future.result()
            except Exception as exc:  # noqa: BLE001
                logger.exception("Source %s crashed", key)
                results[key] = ([], {"name": SOURCES[key]["name"], "errors": [f"crashed: {exc}"]})

    # Store
    all_articles = [a for articles, _ in results.values() for a in articles]
    now = datetime.now(timezone.utc)
    db_counts = Counter()
    if store:
        for article in all_articles:
            try:
                db_counts[store.save(article, now)] += 1
            except Exception as exc:  # noqa: BLE001
                db_counts["failed"] += 1
                run_errors.append(f"db {article['url']}: {exc}")
                logger.error("[DB] FAILED %s: %s", article["url"], exc)

    json_path = BASE_DIR / output_file
    json_path.write_text(json.dumps(all_articles, indent=2, ensure_ascii=False, default=str), encoding="utf-8")

    # Run summary
    finished = datetime.now(timezone.utc)
    by_category = Counter(a["category"] for a in all_articles)
    source_summary = {}
    for key, (_, stats) in results.items():
        errors = stats.get("errors", [])
        run_errors.extend(f"{stats.get('name', key)}: {e}" for e in errors)
        source_summary[key] = {
            k: (dict(v) if isinstance(v, Counter) else v)
            for k, v in stats.items() if k != "errors"
        } | {"error_count": len(errors)}

    run_log = {
        "started_at": started,
        "finished_at": finished,
        "duration_seconds": round((finished - started).total_seconds(), 1),
        "status": "success" if not run_errors else ("partial" if all_articles else "failed"),
        "total_scraped": len(all_articles),
        "db_inserted": db_counts["inserted"],
        "db_updated": db_counts["updated"],
        "db_failed": db_counts["failed"],
        "by_category": {c: by_category.get(c, 0) for c in CATEGORIES},
        "sources": source_summary,
        "errors": run_errors[:MAX_LOGGED_ERRORS],
        "error_count": len(run_errors),
    }
    if store:
        try:
            store.save_run_log(dict(run_log))
        except Exception as exc:  # noqa: BLE001
            logger.error("Could not save run log to MongoDB: %s", exc)
        store.close()

    logger.info("──────── Run summary ────────")
    logger.info("Status        : %s (%d errors)", run_log["status"], run_log["error_count"])
    logger.info("Duration      : %.1fs", run_log["duration_seconds"])
    logger.info("Total scraped : %d articles", len(all_articles))
    for key, summary in source_summary.items():
        logger.info("  %-20s %3d", summary.get("name", key), summary.get("scraped", 0))
    logger.info("By category   : %s", ", ".join(f"{c} {n}" for c, n in run_log["by_category"].items()))
    if store:
        logger.info("MongoDB       : %d new, %d updated, %d failed",
                    db_counts["inserted"], db_counts["updated"], db_counts["failed"])
    logger.info("JSON saved    : %s", json_path)
    return run_log


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NewsMirror English news scraper")
    parser.add_argument("--sources", nargs="+", choices=list(SOURCES), default=list(SOURCES),
                        help="Sources to scrape (default: all)")
    parser.add_argument("--limit", type=int, default=ARTICLES_PER_SECTION,
                        help="Max articles per section (default: %(default)s)")
    parser.add_argument("--no-mongo", action="store_true", help="Skip MongoDB, only write JSON")
    parser.add_argument("--output", default=JSON_OUTPUT_FILE, help="JSON output file (default: %(default)s)")
    parser.add_argument("--verbose", action="store_true", help="Debug logging")
    args = parser.parse_args()

    log_file = setup_logging(args.verbose)
    result = run_scraper(args.sources, args.limit, not args.no_mongo, args.output)
    print(f"\nDone: {result['total_scraped']} articles ({result['status']}). Log file: {log_file}")
    sys.exit(0 if result["total_scraped"] else 1)
