from fastapi import APIRouter, Query
from typing import Literal, Optional
from app.controllers.ArticleController import get_articles

articleRouter = APIRouter()

# --- Scraped News Articles ---
# /api/articles?category=sports&page=1&limit=12&sort=published|scraped
@articleRouter.get("")
def list_articles(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=60),
    sort: Literal["published", "scraped"] = Query("published"),
):
    return get_articles(category, page, limit, sort)
