"""
storage_1.py – Storage backend for ARY News Scraper.

Currently implements JSON-only storage.
MongoDB placeholder is included and ready to activate.
"""

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("arynews_scraper.storage")


# ===========================================================================
# JSON Storage
# ===========================================================================

class JsonStorage:
    """Writes article list to a pretty-printed JSON file."""

    def __init__(self, filepath: str) -> None:
        self._path = Path(filepath)

    def save(self, articles: list[dict[str, Any]]) -> None:
        """Overwrite file with *articles*."""
        self._path.write_text(
            json.dumps(articles, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        logger.info("[JSON] Saved %d records → %s", len(articles), self._path)

    def load(self) -> list[dict[str, Any]]:
        """Load existing articles (returns [] if file absent)."""
        if not self._path.exists():
            return []
        return json.loads(self._path.read_text(encoding="utf-8"))


# ===========================================================================
# MongoDB Storage  (OPTIONAL — uncomment to activate)
# ===========================================================================
#
# To enable:
#   1. pip install pymongo
#   2. Set MONGO_URI / MONGO_DB / MONGO_COLLECTION in config_1.py
#   3. Uncomment the class below
#   4. Import MongoStorage in scraper_1.py and pass it to run_scraper()
#
# ---------------------------------------------------------------------------
#
# class MongoStorage:
#     """Upserts articles into MongoDB, deduplicated by URL."""
#
#     def __init__(self, uri: str, db_name: str, collection_name: str) -> None:
#         from pymongo import MongoClient, ASCENDING
#
#         self._client = MongoClient(uri, serverSelectionTimeoutMS=5_000)
#         self._client.admin.command("ping")   # fail fast if unreachable
#
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