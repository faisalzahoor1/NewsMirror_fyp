import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";

export const NewsCard = ({ article }) => {
  const navigate = useNavigate();
    const [imageFailed, setImageFailed] = useState(false);

    const handleNavigate = () => {
        navigate(`/categories/${article.category.toLowerCase()}`);
    };

    return (
        <div
            onClick={handleNavigate}
            className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-600 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col"
        >

            {/* Image */}
            {article.image && !imageFailed ? (
                <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    className="w-full h-52 object-cover"
                />
            ) : (
                <div className="w-full h-52 bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center text-5xl font-bold text-purple-300/60">
                    {article.category.charAt(0)}
                </div>
            )}

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">

                {/* Category + Sentiment */}
                <div className="flex justify-between items-center mb-3">

                    <span className="bg-purple-700 text-sm px-3 py-1 rounded-full capitalize">
                        {article.category}
                    </span>

                    {article.sentiment && (
                        <span
                            className={`text-xs px-3 py-1 rounded-full

                                ${
                                    article.sentiment === "Positive"
                                        ? "bg-green-700"
                                        : article.sentiment === "Negative"
                                        ? "bg-red-700"
                                        : "bg-yellow-600"
                                }
                            `}
                        >
                            {article.sentiment}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {article.title}
                </h2>

                {/* Summary */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.summary}
                </p>

                {/* Source + Time */}
                {(article.source || article.published_at) && (
                    <p className="text-xs text-gray-500 mb-4">
                        {article.source}
                        {article.source && article.published_at && " · "}
                        {timeAgo(article.published_at)}
                    </p>
                )}

                {/* Bias Meter */}
                {article.bias && (
                    <div className="mb-4">

                        <div className="flex justify-between text-sm mb-2">
                            <span>Bias Meter</span>

                            <span className="capitalize text-purple-400">
                                {article.bias}
                            </span>
                        </div>

                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">

                            <div
                                className={`h-full rounded-full

                                    ${
                                        article.bias === "Left"
                                            ? "bg-blue-500 w-1/4"
                                            : article.bias === "Center"
                                            ? "bg-green-500 w-2/4"
                                            : "bg-red-500 w-3/4"
                                    }
                                `}
                            />
                        </div>
                    </div>
                )}

                {/* Opens the original story on the news channel's website */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-auto block text-center w-full bg-purple-700 hover:bg-purple-800 py-2 rounded-lg transition-all duration-300"
                >
                    Read More
                </a>
            </div>
        </div>
    )
}
