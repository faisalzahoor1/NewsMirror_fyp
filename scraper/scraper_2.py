"""
scraper.py – Hum News Production Scraper
=========================================

DOM structure on humnews.pk category pages:

  div.block-content
    └── article.l-post
          ├── div.media
          │     └── <a class="image-link"
          │              href="https://humnews.pk/..."
          │              title="Full article headline">   ← PRIMARY TARGET
          │              > <img …> </a>
          └── div.post-info  (or similar)
                └── h2 / h3 > a   (same headline, same href)

Strategy:
  • Select `div.block-content article.l-post a.image-link` on the listing page.
  • Read headline from the `title` attribute of the anchor.
    Fallback: visible `.text` inside the anchor if `title` is absent.
  • Read URL from `href`.
  • No article-page visits needed — all data is on the listing page.
  • Fallback selector chain handles future DOM changes.
  • Heuristic URL filter rejects nav / tag / category / author links.
"""

import logging
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager

from config_2 import (
    SECTIONS,
    ARTICLES_PER_SECTION,
    JSON_OUTPUT_FILE,
    PAGE_LOAD_TIMEOUT,
    ELEMENT_WAIT_TIMEOUT,
    MAX_RETRIES,
    RETRY_DELAY,
    PAGE_READY_SENTINEL,
    PRIMARY_ANCHOR_SELECTOR,
    FALLBACK_ANCHOR_SELECTORS,
    VALID_DOMAIN,
    SKIP_PATH_PREFIXES,
    MIN_HEADLINE_LENGTH,
)
from storage import JsonStorage

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("humnews_scraper")


# ===========================================================================
# 1. build_driver
# ===========================================================================

def build_driver() -> webdriver.Chrome:
    """
    Return a configured headless Chrome WebDriver.

    Uses ChromeDriverManager with os_type forced to win64 to avoid
    WinError 193 caused by a cached 32-bit chromedriver on 64-bit Windows.
    Falls back to auto-detection if the forced install fails.
    """
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
    opts.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )

    # Force win64 chromedriver to avoid WinError 193 (wrong arch in cache).
    # If your Chrome is genuinely 32-bit, change "win64" → "win32".
    try:
        from webdriver_manager.core.os_manager import ChromeType
        driver_path = ChromeDriverManager(os_type="win64").install()
        logger.debug("ChromeDriver path (win64 forced): %s", driver_path)
    except Exception:                       # noqa: BLE001
        logger.warning("win64 forced install failed — falling back to auto-detect.")
        driver_path = ChromeDriverManager().install()

    service = Service(driver_path)
    driver  = webdriver.Chrome(service=service, options=opts)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)

    # Mask navigator.webdriver to reduce bot-detection triggers
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"},
    )

    logger.debug("WebDriver initialised.")
    return driver


# ===========================================================================
# 2. safe_get
# ===========================================================================

def safe_get(
    driver: webdriver.Chrome,
    url: str,
    retries: int = MAX_RETRIES,
) -> bool:
    """
    Navigate to *url* with exponential-backoff retry.
    Returns True on success, False after all attempts fail.
    """
    for attempt in range(1, retries + 1):
        try:
            logger.debug("  GET %s  (attempt %d/%d)", url, attempt, retries)
            driver.get(url)
            return True
        except WebDriverException as exc:
            logger.warning(
                "  Load failed [%d/%d] %s – %s", attempt, retries, url, exc
            )
            if attempt < retries:
                delay = RETRY_DELAY * attempt      # 2 s, 4 s, 6 s …
                logger.debug("  Retrying in %ds …", delay)
                time.sleep(delay)

    logger.error("  Giving up on %s after %d attempts.", url, retries)
    return False


# ===========================================================================
# 3. Helpers
# ===========================================================================

def _wait_for_css(
    driver: webdriver.Chrome,
    selector: str,
    timeout: int = ELEMENT_WAIT_TIMEOUT,
) -> bool:
    """Wait until *selector* is present in DOM. Returns False on timeout."""
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
        )
        return True
    except TimeoutException:
        return False


def _is_valid_article_url(url: str) -> bool:
    """
    Return True only for genuine article URLs on humnews.pk.

    Rejects:
      • empty / JS-void hrefs
      • links to other domains
      • category / tag / author / page index links
    """
    if not url or not isinstance(url, str):
        return False
    if url.startswith("javascript:") or url.strip() == "#":
        return False
    if VALID_DOMAIN not in url:
        return False

    try:
        path = urlparse(url).path.rstrip("/")
        for prefix in SKIP_PATH_PREFIXES:
            # Strip trailing slash from prefix too before comparing
            if path.startswith(prefix.rstrip("/")):
                return False
    except Exception:                # noqa: BLE001
        return False

    return True


def _resolve_anchors(driver: webdriver.Chrome) -> tuple[list, str]:
    """
    Try selectors in priority order.
    Returns (elements, selector_used) for the first non-empty match,
    or ([], "") if nothing matches.
    """
    all_selectors = [PRIMARY_ANCHOR_SELECTOR, *FALLBACK_ANCHOR_SELECTORS]
    for selector in all_selectors:
        elements = driver.find_elements(By.CSS_SELECTOR, selector)
        if elements:
            logger.debug(
                "  Selector matched: '%s' → %d elements", selector, len(elements)
            )
            return elements, selector

    return [], ""


# ===========================================================================
# 4. extract_cards  (main per-section scraper)
# ===========================================================================

def extract_cards(
    driver: webdriver.Chrome,
    section_name: str,
    section_url: str,
    limit: int,
) -> list[dict]:
    """
    Load *section_url* and return up to *limit* article dicts.

    Each dict: { section, headline, url, scraped_at }

    No article-page visits — all data extracted from the listing page.
    """
    logger.info("── %s  →  %s", section_name.upper(), section_url)

    if not safe_get(driver, section_url):
        logger.error("  Could not load section '%s' — skipping.", section_name)
        return []

    # Wait for article cards to render
    rendered = _wait_for_css(driver, PAGE_READY_SENTINEL, timeout=ELEMENT_WAIT_TIMEOUT)
    if not rendered:
        logger.warning(
            "  Sentinel '%s' not found — page may be partially rendered.",
            PAGE_READY_SENTINEL,
        )

    anchors, used_selector = _resolve_anchors(driver)

    if not anchors:
        logger.error(
            "  No article anchors found on '%s'. "
            "DOM may have changed — update selectors in config.py.",
            section_url,
        )
        return []

    logger.info("  Selector '%s' → %d anchors found.", used_selector, len(anchors))

    articles:  list[dict] = []
    seen_urls: set[str]   = set()

    for anchor in anchors:
        if len(articles) >= limit:
            break

        try:
            href = (anchor.get_attribute("href")  or "").strip()
            title = (anchor.get_attribute("title") or "").strip()

            # Normalise root-relative URLs (defensive)
            if href.startswith("/"):
                href = "https://humnews.pk" + href

            # ── URL filter ────────────────────────────────────────────────
            if not _is_valid_article_url(href):
                logger.debug("  Skipped (invalid URL): %s", href)
                continue

            if href in seen_urls:
                logger.debug("  Skipped (duplicate): %s", href)
                continue

            # ── Headline resolution ───────────────────────────────────────
            # 1st choice: `title` attribute on the <a> tag (most reliable)
            headline = title
            # 2nd choice: visible text inside the anchor
            if not headline:
                headline = anchor.text.strip().split("\n")[0]
            # 3rd choice: try sibling post-info heading via JS
            if not headline:
                try:
                    headline = driver.execute_script(
                        """
                        var a = arguments[0];
                        var article = a.closest('article');
                        if (!article) return '';
                        var h = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
                        return h ? h.textContent.trim() : '';
                        """,
                        anchor,
                    )
                except Exception:   # noqa: BLE001
                    headline = ""

            if not headline or len(headline) < MIN_HEADLINE_LENGTH:
                logger.debug(
                    "  Skipped (headline too short or empty: %r): %s",
                    headline, href,
                )
                continue

            # ── Collect ───────────────────────────────────────────────────
            seen_urls.add(href)
            articles.append({
                "section":    section_name,
                "headline":   headline,
                "url":        href,
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("  [%d] %s", len(articles), headline[:90])

        except Exception as exc:    # noqa: BLE001
            logger.debug("  Anchor skipped due to error: %s", exc)
            continue

    logger.info(
        "  Collected %d / %d articles from '%s'.",
        len(articles), limit, section_name,
    )
    return articles


# ===========================================================================
# 5. scrape_article  (optional — placeholder for future use)
# ===========================================================================

def scrape_article(driver: webdriver.Chrome, url: str) -> dict:
    """
    Optional lightweight article-page visit for extra metadata.

    Currently a no-op — the listing page supplies all required fields.
    Uncomment the body below once article-page DOM is confirmed.
    """
    metadata: dict = {}
    # if not safe_get(driver, url):
    #     return metadata
    # _wait_for_css(driver, "div.post-detail", timeout=10)
    # try:
    #     date_el = driver.find_element(
    #         By.CSS_SELECTOR, "time[datetime], span.post-date"
    #     )
    #     metadata["published_at"] = (
    #         date_el.get_attribute("datetime") or date_el.text.strip()
    #     )
    # except Exception:
    #     pass
    return metadata


# ===========================================================================
# 6. run_scraper  (orchestrator)
# ===========================================================================

def run_scraper(
    articles_per_section: int = ARTICLES_PER_SECTION,
    output_file: str = JSON_OUTPUT_FILE,
) -> list[dict]:
    """
    Main entry point.
    Spins up one WebDriver, iterates all sections, saves to JSON.
    Returns the full article list.
    """
    logger.info("═══════════════════════════════════════════")
    logger.info("  Hum News Scraper — starting")
    logger.info("  Sections : %d", len(SECTIONS))
    logger.info("  Limit    : %d articles / section", articles_per_section)
    logger.info("  Output   : %s", output_file)
    logger.info("═══════════════════════════════════════════")

    driver       = build_driver()
    all_articles: list[dict] = []
    section_counts: dict[str, int] = {}

    try:
        for section_name, section_url in SECTIONS.items():
            try:
                section_articles = extract_cards(
                    driver,
                    section_name,
                    section_url,
                    articles_per_section,
                )
                all_articles.extend(section_articles)
                section_counts[section_name] = len(section_articles)

            except Exception as exc:    # noqa: BLE001
                # One broken section must NOT abort the entire run
                logger.error(
                    "  Section '%s' failed unexpectedly: %s — continuing.",
                    section_name, exc,
                )
                section_counts[section_name] = 0

    finally:
        driver.quit()
        logger.info("WebDriver closed.")

    # ── Persist to JSON ──────────────────────────────────────────────────────
    JsonStorage(output_file).save(all_articles)

    # ── Per-section summary ──────────────────────────────────────────────────
    logger.info("═══════════════════════════════════════════")
    logger.info("  SCRAPE COMPLETE")
    for sec, count in section_counts.items():
        status = "✓" if count > 0 else "✗"
        logger.info("    %s  %-16s  %d articles", status, sec, count)
    logger.info("  TOTAL : %d articles  →  %s", len(all_articles), output_file)
    logger.info("═══════════════════════════════════════════")

    return all_articles


# ===========================================================================
# CLI
# ===========================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Hum News listing-page scraper")
    parser.add_argument(
        "--limit",
        type=int,
        default=ARTICLES_PER_SECTION,
        metavar="N",
        help="Max articles per section (default: %(default)s)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=JSON_OUTPUT_FILE,
        metavar="FILE",
        help="Output JSON file path (default: %(default)s)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable DEBUG-level logging for verbose output",
    )
    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    results = run_scraper(
        articles_per_section=args.limit,
        output_file=args.output,
    )
    print(f"\n✅  Done. {len(results)} articles scraped across {len(SECTIONS)} sections.")