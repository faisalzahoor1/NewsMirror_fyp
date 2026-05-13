"""
storage.py – Storage backends for GeoNews Scraper.

Provides:
  MongoStorage  – upserts articles into MongoDB (deduplication by URL)
  JsonStorage   – writes/appends articles to a JSON file
"""

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("geonews_scraper.storage")


# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------

class MongoStorage:
    """Thin wrapper around pymongo for article persistence."""

    def __init__(self, uri: str, db_name: str, collection_name: str) -> None:
        from pymongo import MongoClient, ASCENDING
        from pymongo.errors import ConnectionFailure

        self._client = MongoClient(uri, serverSelectionTimeoutMS=5_000)
        # Ping to confirm connectivity at construction time
        self._client.admin.command("ping")

        self._col = self._client[db_name][collection_name]

        # Unique index on URL ensures no duplicate articles
        self._col.create_index([("url", ASCENDING)], unique=True)
        logger.info("MongoStorage ready: db=%s  collection=%s", db_name, collection_name)

    def upsert(self, article: dict[str, Any]) -> bool:
        """
        Insert or update an article document, keyed by URL.
        Returns True on success, False on failure.
        Logs every outcome at INFO level so results are always visible.
        """
        from pymongo.errors import PyMongoError

        try:
            result = self._col.update_one(
                {"url": article["url"]},
                {"$set": article},
                upsert=True,
            )
            if result.upserted_id:
                logger.info("  [DB] INSERT → %s", article["url"])
            else:
                logger.info("  [DB] UPDATE → %s", article["url"])
            return True
        except PyMongoError as exc:
            logger.error("  [DB] FAILED upsert for %s: %s", article["url"], exc)
            return False
        except Exception as exc:  # noqa: BLE001
            logger.error("  [DB] Unexpected error for %s: %s", article["url"], exc)
            return False

    def close(self) -> None:
        self._client.close()


# ---------------------------------------------------------------------------
# JSON
# ---------------------------------------------------------------------------

class JsonStorage:
    """Writes a list of article dicts to a JSON file."""

    def __init__(self, filepath: str) -> None:
        self._path = Path(filepath)

    def save(self, articles: list[dict[str, Any]]) -> None:
        """Overwrite the file with *articles* (pretty-printed)."""
        self._path.write_text(
            json.dumps(articles, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        logger.info("JSON saved to %s (%d records)", self._path, len(articles))

    def load(self) -> list[dict[str, Any]]:
        """Load and return articles from an existing JSON file."""
        if not self._path.exists():
            return []
        return json.loads(self._path.read_text(encoding="utf-8"))