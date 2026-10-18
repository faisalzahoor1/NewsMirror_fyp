import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

// Loads scraped articles from /api/articles page by page.
// sort: "published" (newest stories first) or "scraped" (newest additions first)
export const useArticles = ({ category, sort = "published", pageSize = 12 } = {}) => {
    const { backend_url } = useContext(AppContext);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ key: "", articles: [], total: 0, hasMore: false, error: "" });

    // While the result for the current request hasn't arrived, we're loading
    const requestKey = `${category || "all"}:${sort}:${page}:${pageSize}`;
    const loading = result.key !== requestKey;

    useEffect(() => {
        let cancelled = false;

        axios.get(`${backend_url}/api/articles`, { params: { category, sort, page, limit: pageSize } })
            .then(({ data }) => {
                if (cancelled) return;
                setResult(prev => ({
                    key: requestKey,
                    articles: page === 1 ? data.articles : [...prev.articles, ...data.articles],
                    total: data.total,
                    hasMore: data.has_more,
                    error: "",
                }));
            })
            .catch((error) => {
                if (cancelled) return;
                console.error("Failed to load articles:", error);
                setResult(prev => ({ ...prev, key: requestKey, error: "Could not load the news. Please try again later." }));
            });

        return () => { cancelled = true; };
    }, [backend_url, category, sort, page, pageSize, requestKey]);

    return {
        articles: result.articles,
        total: result.total,
        hasMore: result.hasMore,
        error: result.error,
        loading,
        loadMore: () => setPage(p => p + 1),
    };
};
