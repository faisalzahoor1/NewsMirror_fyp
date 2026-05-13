"""
storage.py – Storage backend for Hum News Scraper.

JSON-only implementation.
MongoDB is included as a ready-to-activate placeholder.
"""

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("humnews_scraper.storage")


# ===========================================================================
# JSON Storage  (active)
# ===========================================================================

class JsonStorage:
    """Writes the article list to a pretty-printed JSON file."""

    def __init__(self, filepath: str) -> None:
        self._path = Path(filepath)

    def save(self, articles: list[dict[str, Any]]) -> None:
        """Overwrite *filepath* with the full article list."""
        self._path.write_text(
            json.dumps(articles, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        logger.info("[JSON] %d records saved → %s", len(articles), self._path)

    def load(self) -> list[dict[str, Any]]:
        """Return existing articles from file, or [] if file is absent."""
        if not self._path.exists():
            return []
        return json.loads(self._path.read_text(encoding="utf-8"))


# ===========================================================================
# MongoDB Storage  (OPTIONAL — uncomment to activate)
# ===========================================================================
#
# To enable:
#   1. pip install pymongo
#   2. Add MONGO_URI / MONGO_DB / MONGO_COLLECTION to config.py
#   3. Uncomment the class below
#   4. In scraper.py → run_scraper(), import MongoStorage and
#      call mongo.upsert(article) inside the article loop.
#
# class MongoStorage:
#     """Upserts articles into MongoDB, deduplicated by URL."""
#
#     def __init__(self, uri: str, db_name: str, collection_name: str) -> None:
#         from pymongo import MongoClient, ASCENDING
#         self._client = MongoClient(uri, serverSelectionTimeoutMS=5_000)
#         self._client.admin.command("ping")           # fail fast if unreachable
#         self._col = self._client[db_name][collection_name]
#         self._col.create_index([("url", ASCENDING)], unique=True)
#         logger.info("[MongoDB] Ready → %s.%s", db_name, collection_name)
#
#     def upsert(self, article: dict[str, Any]) -> bool:
#         from pymongo.errors import PyMongoError
#         try:
#             result = self._col.update_one(
#                 {"url": article["url"]},
#                 {"$set": article},
#                 upsert=True,
#             )
#             action = "INSERT" if result.upserted_id else "UPDATE"
#             logger.info("  [DB] %s → %s", action, article["url"])
#             return True
#         except PyMongoError as exc:
#             logger.error("  [DB] FAILED for %s: %s", article["url"], exc)
#             return False
#
#     def close(self) -> None:
#         self._client.close()