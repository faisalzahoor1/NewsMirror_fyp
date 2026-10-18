from app.config.MongoConnection import articles_collection
from fastapi import HTTPException
from datetime import datetime, timezone

# Same list as scraper/news_config.py — only these categories are shown on the site
CATEGORIES = [
    "Sports", "Entertainment", "Business", "Politics", "Technology",
    "Health", "Science", "World", "Education", "Gaming",
]


def _iso(value):
    # MongoDB returns naive UTC datetimes; mark them as UTC so browsers show the right local time
    if isinstance(value, datetime):
        return value.replace(tzinfo=value.tzinfo or timezone.utc).isoformat()
    return value


def _serialize(article):
    return {
        "id": str(article["_id"]),
        "title": article["headline"],
        "summary": article.get("summary", ""),
        "category": article["category"],
        "source": article.get("source"),
        "url": article["url"],
        "image": article.get("image"),
        "published_at": _iso(article.get("published_at")),
        "scraped_at": _iso(article.get("first_seen_at") or article.get("scraped_at")),
    }


# "published": newest stories first; "scraped": newest additions to NewsMirror first
SORT_ORDERS = {
    "published": [("published_at", -1), ("scraped_at", -1)],
    "scraped": [("first_seen_at", -1), ("published_at", -1)],
}


def get_articles(category: str = None, page: int = 1, limit: int = 12, sort: str = "published"):
    query = {"category": {"$in": CATEGORIES}}

    # Category from the URL is lowercase ("sports"), stored names are capitalised ("Sports")
    if category:
        match = next((c for c in CATEGORIES if c.lower() == category.lower()), None)
        if not match:
            raise HTTPException(status_code=404, detail="Unknown category")
        query["category"] = match

    total = articles_collection.count_documents(query)

    # Newest first; articles without a date go last
    cursor = (
        articles_collection.find(query)
        .sort(SORT_ORDERS[sort])
        .skip((page - 1) * limit)
        .limit(limit)
    )

    return {
        "success": True,
        "articles": [_serialize(a) for a in cursor],
        "total": total,
        "page": page,
        "has_more": page * limit < total,
    }
