"""
GeoNews Scraper
===============
Scrapes Latest, Sports, and Showbiz sections from Geo News.

DOM structure (confirmed via DevTools inspection):
  div.video-list[data-vr-zone]
    └── div.singleBlock
          └── div.list
                └── ul
                      └── li.border-box
                            └── <a class="open-section"
                                   href="https://www.geo.tv/..."
                                   title="Full headline text">

We read `href` and `title` directly from the <a> tag on the listing page.
No article page visits needed → much faster scraping.
"""

import logging
import time
from datetime import datetime, timezone
from typing import Optional

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager

from config import (
    SECTIONS,
    ARTICLES_PER_SECTION,
    JSON_OUTPUT_FILE,
    MONGO_URI,
    MONGO_DB,
    MONGO_COLLECTION,
    PAGE_LOAD_TIMEOUT,
    ELEMENT_WAIT_TIMEOUT,
    MAX_RETRIES,
    RETRY_DELAY,
)
from storage import MongoStorage, JsonStorage

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("geonews_scraper")


# ---------------------------------------------------------------------------
# DOM selectors (derived directly from DevTools screenshot)
# ---------------------------------------------------------------------------

# The <a> tags inside li.border-box carry both href and title attributes.
# Primary selector — most specific, least likely to over-match:
PRIMARY_ANCHOR_SELECTOR = "li.border-box a.open-section"

# Fallback selectors tried in order if primary finds nothing:
FALLBACK_ANCHOR_SELECTORS = [
    "li.border-box a[title]",          # same <li>, any <a> with title
    "div.singleBlock a.open-section",  # one level up
    "div.list a[title][href]",         # list container
    "a[data-vr-contentbox]",           # VR attribute present on every card anchor
]

# Sentinel that confirms the listing page has rendered its cards:
READY_SENTINEL = "li.border-box"


# ---------------------------------------------------------------------------
# Driver factory
# ---------------------------------------------------------------------------

def build_driver() -> webdriver.Chrome:
    """Return a configured headless Chrome WebDriver."""
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return driver


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def safe_get(driver: webdriver.Chrome, url: str, retries: int = MAX_RETRIES) -> bool:
    """Navigate to *url* with exponential-backoff retry. Returns True on success."""
    for attempt in range(1, retries + 1):
        try:
            logger.debug("GET %s (attempt %d/%d)", url, attempt, retries)
            driver.get(url)
            return True
        except WebDriverException as exc:
            logger.warning("Load failed – %s [attempt %d/%d]: %s", url, attempt, retries, exc)
            if attempt < retries:
                time.sleep(RETRY_DELAY * attempt)   # 2s, 4s, 6s …
    logger.error("Giving up on %s after %d attempts.", url, retries)
    return False


def wait_for_css(
    driver: webdriver.Chrome,
    selector: str,
    timeout: int = ELEMENT_WAIT_TIMEOUT,
) -> bool:
    """Return True once *selector* is present in the DOM, False on timeout."""
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
        )
        return True
    except TimeoutException:
        return False


# ---------------------------------------------------------------------------
# Section scraper  (listing-page only — no article visits)
# ---------------------------------------------------------------------------

def scrape_section(
    driver: webdriver.Chrome,
    section_name: str,
    section_url: str,
    limit: int,
) -> list[dict]:
    """
    Load *section_url* and extract up to *limit* articles.

    Each article dict contains:
        section, headline (from <a title="…">), url (from <a href="…">), scraped_at
    """
    logger.info("── Section: %s  →  %s", section_name.upper(), section_url)

    if not safe_get(driver, section_url):
        logger.error("Could not load section page: %s", section_url)
        return []

    # Wait for cards to render
    if not wait_for_css(driver, READY_SENTINEL, timeout=ELEMENT_WAIT_TIMEOUT):
        logger.warning(
            "Sentinel '%s' not found on %s – page may not have loaded.",
            READY_SENTINEL, section_url
        )

    # Resolve which anchor selector works on this page
    anchors = []
    used_selector = None

    for selector in [PRIMARY_ANCHOR_SELECTOR, *FALLBACK_ANCHOR_SELECTORS]:
        candidates = driver.find_elements(By.CSS_SELECTOR, selector)
        if candidates:
            anchors = candidates
            used_selector = selector
            logger.debug("Anchor selector '%s' matched %d elements.", selector, len(candidates))
            break

    if not anchors:
        logger.error("No article anchors found on %s. Check selectors.", section_url)
        return []

    logger.info("Using selector '%s' – %d anchors found.", used_selector, len(anchors))

    articles: list[dict] = []
    seen_urls: set[str] = set()

    for anchor in anchors:
        if len(articles) >= limit:
            break

        try:
            href  = anchor.get_attribute("href") or ""
            title = anchor.get_attribute("title") or ""

            # Normalise relative URLs (defensive)
            if href.startswith("/"):
                href = "https://www.geo.tv" + href

            # Skip non-article links (navigation, ads, etc.)
            if not href or "geo.tv" not in href:
                continue

            # Skip duplicates
            if href in seen_urls:
                continue

            # Headline comes from the title attribute
            headline = title.strip()
            if not headline:
                # Last-resort: visible text inside the anchor
                headline = anchor.text.strip().split("\n")[0]
            if not headline:
                logger.debug("Skipping anchor with no headline: %s", href)
                continue

            seen_urls.add(href)
            articles.append({
                "section":    section_name,
                "headline":   headline,
                "url":        href,
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("  [%d] %s", len(articles), headline[:90])

        except Exception as exc:  # noqa: BLE001
            logger.debug("Skipping anchor due to unexpected error: %s", exc)

    logger.info("Collected %d articles from '%s'.", len(articles), section_name)
    return articles


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def run_scraper(
    articles_per_section: int = ARTICLES_PER_SECTION,
    output_file: str = JSON_OUTPUT_FILE,
    use_mongo: bool = True,
) -> list[dict]:
    """
    Scrape all configured sections and persist results.
    Returns the full list of article dicts.
    """
    driver = build_driver()
    all_articles: list[dict] = []

    # MongoDB (optional)
    mongo: Optional[MongoStorage] = None
    if use_mongo:
        try:
            mongo = MongoStorage(MONGO_URI, MONGO_DB, MONGO_COLLECTION)
            logger.info("MongoDB connection established → %s.%s", MONGO_DB, MONGO_COLLECTION)
        except Exception as exc:  # noqa: BLE001
            logger.warning("MongoDB unavailable – skipping DB storage. (%s)", exc)

    db_success = 0
    db_failed = 0

    try:
        for section_name, section_url in SECTIONS.items():
            section_articles = scrape_section(
                driver, section_name, section_url, articles_per_section
            )

            for article in section_articles:
                all_articles.append(article)
                if mongo:
                    ok = mongo.upsert(article)
                    if ok:
                        db_success += 1
                    else:
                        db_failed += 1

    finally:
        driver.quit()
        logger.info("WebDriver closed.")

    # Persist to JSON
    JsonStorage(output_file).save(all_articles)

    logger.info("Total scraped : %d articles", len(all_articles))
    if mongo:
        logger.info("MongoDB saved : %d  |  failed: %d", db_success, db_failed)
    logger.info("JSON saved    : %s", output_file)

    return all_articles


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="GeoNews listing-page scraper")
    parser.add_argument(
        "--limit",
        type=int,
        default=ARTICLES_PER_SECTION,
        help="Max articles per section (default: %(default)s)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=JSON_OUTPUT_FILE,
        help="Output JSON file path (default: %(default)s)",
    )
    parser.add_argument(
        "--no-mongo",
        action="store_true",
        help="Skip MongoDB insertion",
    )
    args = parser.parse_args()

    results = run_scraper(
        articles_per_section=args.limit,
        output_file=args.output,
        use_mongo=not args.no_mongo,
    )
    print(f"\n✅  Done. {len(results)} articles scraped across {len(SECTIONS)} sections.")