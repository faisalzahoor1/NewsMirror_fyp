import { useArticles } from "../hooks/useArticles";
import { NewsCard } from "./NewsCard";

// Grid of scraped articles from /api/articles (all categories, or one category)
export const ArticleGrid = ({ category, pageSize = 12, showLoadMore = true }) => {
    const { articles, hasMore, error, loading, loadMore } = useArticles({ category, pageSize });

    if (loading && articles.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                        <div className="h-52 bg-gray-800" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 w-24 bg-gray-800 rounded-full" />
                            <div className="h-5 bg-gray-800 rounded" />
                            <div className="h-4 bg-gray-800 rounded w-5/6" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error && articles.length === 0) {
        return <p className="text-red-400">{error}</p>;
    }

    if (articles.length === 0) {
        return (
            <p className="text-gray-400">
                No {category ? `${category} ` : ""}news yet. New articles appear here after the next scrape.
            </p>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                ))}
            </div>

            {error && <p className="text-red-400 mt-6">{error}</p>}

            {showLoadMore && hasMore && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="border border-gray-700 hover:border-purple-600 px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-60"
                    >
                        {loading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    );
};
