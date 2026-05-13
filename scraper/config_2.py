"""
config.py – Central configuration for Hum News Scraper.
All tunable settings in one place — no need to touch scraper.py for changes.
"""

# ---------------------------------------------------------------------------
# Target sections  (display name → URL)
# ---------------------------------------------------------------------------
SECTIONS: dict[str, str] = {
    "pakistan":      "https://humenglish.com/pakistan/",
    "world":         "https://humenglish.com/world/",
    "business":      "https://humenglish.com/business/",
    "sports":        "https://humenglish.com/sport/",
    "technology":    "https://humenglish.com/technology/",
    "latest":        "https://humenglish.com/latest/",
    "entertainment": "https://humenglish.com/entertainment/",
}

# Max articles to scrape per section
ARTICLES_PER_SECTION: int = 8

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
JSON_OUTPUT_FILE: str = "humnews_articles.json"

# ---------------------------------------------------------------------------
# Selenium / network
# ---------------------------------------------------------------------------
PAGE_LOAD_TIMEOUT: int    = 30   # seconds before page load gives up
ELEMENT_WAIT_TIMEOUT: int = 15   # seconds for WebDriverWait
MAX_RETRIES: int          = 3    # retry attempts per URL
RETRY_DELAY: int          = 2    # base seconds between retries (× attempt)

# ---------------------------------------------------------------------------
# Hum News DOM selectors
# (derived from site DOM — update here if site structure changes)
# ---------------------------------------------------------------------------

# Sentinel
PAGE_READY_SENTINEL: str = "div.card__post__title h5 a"

# Primary selector
PRIMARY_ANCHOR_SELECTOR: str = "div.card__post__title h5 a"

# Fallback selectors
FALLBACK_ANCHOR_SELECTORS: list[str] = [
    "div.card__post__title a[href][title]",
    "div.card__post__title a[href]",
    "h5 a[href][title]",
    "h5 a[href]",
    "a.truncate[href]",
]

# Domain
VALID_DOMAIN: str = "humenglish.com"

# Skip paths
SKIP_PATH_PREFIXES: list[str] = [
    "/category/", "/tag/", "/author/", "/page/",
    "/live/", "/about", "/contact", "/advertise", "/privacy",
]

# Minimum headline length in characters — skips empty nav labels
MIN_HEADLINE_LENGTH: int = 10