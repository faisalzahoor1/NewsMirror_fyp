"""
news_config.py – Configuration for the NewsMirror English news scraper.

Sources : Geo News, HUM News English, SAMAA, Dunya News, The Express Tribune
Output  : MongoDB newsmirror.articles  (headline, summary, category, source, url, image, published_at)

Edit values here to customise behaviour without touching news_scraper.py.
"""

# ---------------------------------------------------------------------------
# Categories NewsMirror shows (anything else is not stored)
# ---------------------------------------------------------------------------
CATEGORIES: list[str] = [
    "Sports", "Entertainment", "Business", "Politics", "Technology",
    "Health", "Science", "World", "Education", "Gaming",
]

# No site has dedicated Education / Gaming pages, and Politics / Science are rare,
# so these are picked out of general sections (Pakistan, Sci-Tech, ...) by keywords.
# Order = priority when two categories get the same number of keyword hits.
AUTO_CATEGORIES: list[str] = ["Gaming", "Science", "Education", "Politics"]

# Keywords matched as whole words/phrases (case-insensitive). A headline hit scores 2, a hit in
# the feed's summary scores 1, and a category needs 2+ points. Best score wins; ties follow
# AUTO_CATEGORIES order.
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Gaming": [
        "gaming", "gamer", "gamers", "video game", "video games", "esports", "e-sports",
        "playstation", "xbox", "nintendo", "pubg", "fortnite", "gta", "call of duty",
        "minecraft", "roblox", "steam deck", "game console", "valorant", "tekken",
    ],
    "Education": [
        "education", "educational", "university", "universities", "school", "schools",
        "student", "students", "exam", "exams", "examination", "matric", "board results",
        "hec", "college", "colleges", "admission", "admissions", "scholarship", "scholarships",
        "teacher", "teachers", "curriculum", "campus", "literacy", "degree programme",
    ],
    "Science": [
        "science", "scientist", "scientists", "nasa", "suparco", "astronaut",
        "astronauts", "astronomers", "telescope", "planet", "asteroid", "comet", "spacecraft",
        "space agency", "space mission", "moon mission", "mars", "fossil", "dinosaur", "species",
        "physics", "milky way", "eclipse", "genome", "study finds", "new study",
    ],
    "Politics": [
        "politics", "political", "politician", "election", "elections", "by-election",
        "parliament", "senate", "national assembly", "provincial assembly", "pti", "pml-n",
        "ppp", "mqm", "jui-f", "imran khan", "shehbaz", "nawaz", "bilawal", "maryam nawaz",
        "zardari", "cabinet", "prime minister", "opposition", "governor's rule", "chief minister",
        "constitutional amendment", "ecp", "coalition government", "democracy",
    ],
}

# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------
# Each section is read from an RSS feed ("rss") or a listing page ("html" + CSS "links").
#   category  – category for articles from this section (None = keep only keyword matches)
#   classify  – categories the keyword classifier may assign instead of `category`
#   scan      – how many listing items to look at (default: all of them)
#
# article_pattern – regex a link must match to count as an article of that site
# title_suffixes  – site names stripped from the end of page titles
SOURCES: dict[str, dict] = {
    "geo": {
        "name": "Geo News",
        "article_pattern": r"geo\.tv/latest/\d+",
        "title_suffixes": ["Geo News", "Geo TV"],
        "sections": [
            {"category": "Sports",        "rss": "https://www.geo.tv/rss/1/4"},
            {"category": "Entertainment", "rss": "https://www.geo.tv/rss/1/5", "classify": ["Gaming"]},
            {"category": "Business",      "rss": "https://www.geo.tv/rss/1/3"},
            {"category": "Health",        "rss": "https://www.geo.tv/rss/1/6"},
            {"category": "World",         "rss": "https://www.geo.tv/rss/1/2"},
            {"category": "Technology",    "html": "https://www.geo.tv/category/sci-tech",
             "links": "li.border-box a[href]", "classify": ["Gaming", "Science"]},
            {"category": None, "rss": "https://www.geo.tv/rss/1/1",
             "classify": AUTO_CATEGORIES, "scan": 20},
        ],
    },
    "hum": {
        "name": "HUM News English",
        "article_pattern": r"humenglish\.com/[a-z-]+/[a-z0-9-]{15,}",
        "title_suffixes": ["HUM News English", "HUM News"],
        "sections": [
            {"category": "Sports",        "rss": "https://humenglish.com/sport/feed/"},
            {"category": "Entertainment", "rss": "https://humenglish.com/entertainment/feed/",
             "classify": ["Gaming"]},
            {"category": "Business",      "rss": "https://humenglish.com/business/feed/"},
            {"category": "Politics",      "rss": "https://humenglish.com/politics/feed/"},
            {"category": "Technology",    "rss": "https://humenglish.com/technology/feed/",
             "classify": ["Gaming", "Science"]},
            {"category": "World",         "rss": "https://humenglish.com/world/feed/"},
            {"category": None, "rss": "https://humenglish.com/pakistan/feed/",
             "classify": AUTO_CATEGORIES, "scan": 20},
            {"category": None, "rss": "https://humenglish.com/life/feed/",
             "classify": AUTO_CATEGORIES, "scan": 20},
        ],
    },
    "samaa": {
        "name": "SAMAA",
        "article_pattern": r"samaa\.tv/\d{8,}-",
        "title_suffixes": ["SAMAA", "Samaa TV"],
        "sections": [
            {"category": "Sports",        "html": "https://www.samaa.tv/sports"},
            {"category": "Entertainment", "html": "https://www.samaa.tv/lifestyle", "classify": ["Gaming"]},
            {"category": "Business",      "html": "https://www.samaa.tv/money"},
            {"category": "Technology",    "html": "https://www.samaa.tv/tech",
             "classify": ["Gaming", "Science"]},
            {"category": "Health",        "html": "https://www.samaa.tv/health"},
            {"category": "World",         "html": "https://www.samaa.tv/global"},
            {"category": None, "html": "https://www.samaa.tv/pakistan",
             "classify": AUTO_CATEGORIES, "scan": 21},
        ],
        # Main article list only (skips the "headlines" ticker and sidebars)
        "links": "article h4.post-title a[href], article h3 a[href]",
    },
    "dunya": {
        "name": "Dunya News",
        "article_pattern": r"dunyanews\.tv/(index\.php/)?en/[A-Za-z]+/\d+",
        "title_suffixes": ["Dunya News"],
        "sections": [
            {"category": "Sports",        "html": "https://dunyanews.tv/en/Sports",
             "links": "a[href*='/en/Sports/']"},
            {"category": "Entertainment", "html": "https://dunyanews.tv/en/Entertainment",
             "links": "a[href*='/en/Entertainment/']", "classify": ["Gaming"]},
            {"category": "Business",      "html": "https://dunyanews.tv/en/Business",
             "links": "a[href*='/en/Business/']"},
            {"category": "Technology",    "html": "https://dunyanews.tv/en/Technology",
             "links": "a[href*='/en/Technology/']", "classify": ["Gaming", "Science"]},
            {"category": "Health",        "html": "https://dunyanews.tv/en/Health",
             "links": "a[href*='/en/Health/']"},
            {"category": "World",         "html": "https://dunyanews.tv/en/World",
             "links": "a[href*='/en/World/']"},
            {"category": None, "html": "https://dunyanews.tv/en/Pakistan",
             "links": "a[href*='/en/Pakistan/']", "classify": AUTO_CATEGORIES, "scan": 30},
        ],
    },
    "tribune": {
        "name": "The Express Tribune",
        "article_pattern": r"tribune\.com\.pk/story/\d+",
        "title_suffixes": ["The Express Tribune"],
        "sections": [
            {"category": "Sports",        "rss": "https://tribune.com.pk/feed/sports"},
            {"category": "Entertainment", "rss": "https://tribune.com.pk/feed/entertainment",
             "classify": ["Gaming"]},
            {"category": "Business",      "rss": "https://tribune.com.pk/feed/business"},
            {"category": "Technology",    "rss": "https://tribune.com.pk/feed/technology",
             "classify": ["Gaming", "Science"]},
            {"category": "Health",        "rss": "https://tribune.com.pk/feed/health"},
            {"category": "World",         "rss": "https://tribune.com.pk/feed/world"},
            {"category": None, "rss": "https://tribune.com.pk/feed/pakistan",
             "classify": AUTO_CATEGORIES, "scan": 40},
        ],
    },
}

# ---------------------------------------------------------------------------
# Limits
# ---------------------------------------------------------------------------
ARTICLES_PER_SECTION: int = 10     # max articles kept per category per section per run
MAX_ARTICLE_AGE_DAYS: int = 7      # older stories (feeds sometimes list old ones) are skipped
MAX_SUMMARY_CHARS: int = 300       # summaries longer than this are trimmed at a sentence/word

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
JSON_OUTPUT_FILE: str = "news_articles.json"
LOG_DIR: str = "logs"
LOG_FILE: str = "news_scraper.log"
LOG_BACKUP_DAYS: int = 14          # daily log files kept

# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------
MONGO_URI: str = "mongodb://localhost:27017/"
MONGO_DB: str = "newsmirror"
MONGO_COLLECTION: str = "articles"
MONGO_LOG_COLLECTION: str = "scrape_logs"   # one summary document per run

# ---------------------------------------------------------------------------
# Network
# ---------------------------------------------------------------------------
REQUEST_TIMEOUT: int = 20          # seconds per request
MAX_RETRIES: int = 2               # retries for failed requests (with backoff)
REQUEST_DELAY: float = 0.4         # pause between requests to the same site (be polite)
USER_AGENT: str = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)
