"""
config_1.py – Central configuration for ARY News Scraper.
All tunable settings in one place.
"""

# ---------------------------------------------------------------------------
# Target sections  (name → URL)
# ---------------------------------------------------------------------------
SECTIONS: dict[str, str] = {
    "pakistan":      "https://arynews.tv/category/pakistan/",
    "international": "https://arynews.tv/category/international/",
    "business":      "https://arynews.tv/category/business/",
    "sports":        "https://arynews.tv/category/sports/",
    "sci-tech":      "https://arynews.tv/category/sci-tech/",
    "health":        "https://arynews.tv/category/health/",
}

# Max articles to scrape per section
ARTICLES_PER_SECTION: int = 8

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
JSON_OUTPUT_FILE: str = "ary_news.json"

# ---------------------------------------------------------------------------
# Selenium / network
# ---------------------------------------------------------------------------
PAGE_LOAD_TIMEOUT: int    = 30   # seconds before page load gives up
ELEMENT_WAIT_TIMEOUT: int = 15   # seconds for WebDriverWait
MAX_RETRIES: int          = 3    # retry attempts per URL
RETRY_DELAY: int          = 2    # base seconds between retries (× attempt)

# ---------------------------------------------------------------------------
# ARY News DOM selectors
# (derived from DevTools inspection — update here if site structure changes)
# ---------------------------------------------------------------------------

# Sentinel: wait for this before extracting, confirms JS render is done
PAGE_READY_SENTINEL: str = "div.container div.post-info"

# ── Primary selector chain ──────────────────────────────────────────────────
# DOM path confirmed from screenshot:
#   div.col-md-4.col-p > article > div.post-info > h3 > a
#
# The <a> inside h3.post-info carries BOTH the headline text AND the href.
PRIMARY_ANCHOR_SELECTOR: str   = "div.container div.post-info h3 a"

# ── Fallback selector chain (tried in order if primary yields nothing) ──────
FALLBACK_ANCHOR_SELECTORS: list[str] = [
    "article div.post-info a",       # same container, any <a>
    "article h3 a",                  # h3 anywhere inside article
    "div.col-md-4 article a[href]",  # any link inside article card
    "div.main-content article a",    # broader article container
    "div.post-body a[href]",         # post-body fallback
]

# ── Heuristic filters ────────────────────────────────────────────────────────
# Only keep URLs that match this domain fragment
VALID_DOMAIN: str = "arynews.tv"

# URL path segments that indicate navigation / non-article links to skip
SKIP_PATH_PREFIXES: list[str] = [
    "/category/", "/tag/", "/author/", "/page/",
    "/about", "/contact", "/advertise", "/privacy",
]

# Minimum headline length (chars) — skip empty or nav labels
MIN_HEADLINE_LENGTH: int = 15