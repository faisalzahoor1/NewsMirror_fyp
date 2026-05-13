"""
config.py – Central configuration for GeoNews Scraper.
Edit values here to customise behaviour without touching scraper logic.
"""

# ---------------------------------------------------------------------------
# Target sections
# ---------------------------------------------------------------------------
SECTIONS: dict[str, str] = {
    "latest":  "https://www.geo.tv/latest-news",
    "sports":  "https://www.geo.tv/category/sports",
    "showbiz": "https://www.geo.tv/category/showbiz",
    "world": "https://www.geo.tv/category/world",
    "pakistan": "https://www.geo.tv/category/pakistan"
}

# Max articles to scrape per section
ARTICLES_PER_SECTION: int = 8

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
JSON_OUTPUT_FILE: str = "geonews_articles.json"

# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------
MONGO_URI: str = "mongodb://localhost:27017/"
MONGO_DB: str = "newsmirror"
MONGO_COLLECTION: str = "articles"

# ---------------------------------------------------------------------------
# Selenium / network
# ---------------------------------------------------------------------------
PAGE_LOAD_TIMEOUT: int = 30       # seconds before page load gives up
ELEMENT_WAIT_TIMEOUT: int = 15    # seconds WebDriverWait uses
MAX_RETRIES: int = 3              # retries for failed loads
RETRY_DELAY: int = 2              # base seconds between retries (multiplied by attempt)