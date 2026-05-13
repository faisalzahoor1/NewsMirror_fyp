
export const Community = () => {
    const articles = [
        {
            id: 1,
            title: "AI Detects Bias in Political Coverage",
            source: "Global News",
            content:
                "NewsMirror AI analyzed multiple political articles and identified differences in sentiment and framing.",
            likes: 120,
            dislikes: 12,
            comments: [
                {
                    user: "Faisal",
                    text: "This comparison feature is actually useful for understanding bias.",
                },
                {
                    user: "Ayesha",
                    text: "Would love to see more sources included.",
                },
            ],
        },
        {
            id: 2,
            title: "Sports News Sentiment Analysis Released",
            source: "Sports Daily",
            content:
                "The platform analyzed emotional trends in sports journalism using NLP models.",
            likes: 87,
            dislikes: 5,
            comments: [
                {
                    user: "Ali",
                    text: "The AI summaries save a lot of time.",
                },
            ],
        },
    ];
    return (
        <div className="min-h-screen bg-black text-white px-6 py-10">

            {/* PAGE TITLE */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-purple-500">
                    Community Discussions
                </h1>

                <p className="mt-2 text-gray-400 max-w-2xl">
                    Explore community opinions, react to articles, participate in
                    discussions, and interact with the AI assistant.
                </p>
            </div>

            {/* MAIN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT SIDE → ARTICLES */}
                <div className="flex-[1.5] space-y-8">

                    {articles.map((article) => (
                        <div
                            key={article.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-all duration-300"
                        >

                            {/* ARTICLE HEADER */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-purple-400">
                                        {article.title}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Source: {article.source}
                                    </p>
                                </div>

                                <span className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-700">
                                    Community Article
                                </span>
                            </div>

                            {/* ARTICLE CONTENT */}
                            <p className="text-gray-300 leading-7 mb-6">
                                {article.content}
                            </p>

                            {/* LIKE / DISLIKE */}
                            <div className="flex items-center gap-4 mb-6">
                                <button className="bg-green-700 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg font-medium">
                                    👍 Like ({article.likes})
                                </button>

                                <button className="bg-red-700 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg font-medium">
                                    👎 Dislike ({article.dislikes})
                                </button>
                            </div>

                            {/* COMMENTS */}
                            <div>
                                <h3 className="text-lg font-semibold text-purple-300 mb-3">
                                    Comments
                                </h3>

                                <div className="space-y-3 mb-4">
                                    {article.comments.map((comment, index) => (
                                        <div
                                            key={index}
                                            className="bg-black border border-zinc-800 rounded-lg p-3"
                                        >
                                            <p className="font-semibold text-purple-400">
                                                {comment.user}
                                            </p>

                                            <p className="text-gray-300 mt-1">
                                                {comment.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* ADD COMMENT */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                                    />

                                    <button className="bg-purple-700 hover:bg-purple-800 transition-all duration-300 px-4 rounded-lg font-medium">
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

                {/* RIGHT SIDE → AI BOT */}
                <div className="flex-1">

                    <div className="sticky top-6 bg-zinc-900 border border-purple-700 rounded-2xl p-5 shadow-xl h-[85vh] flex flex-col">

                        <h2 className="text-2xl font-semibold text-purple-400 mb-4">
                            🤖 AI News Assistant
                        </h2>

                        {/* CHAT AREA */}
                        <div className="flex-1 bg-black rounded-xl p-4 overflow-y-auto border border-zinc-800 text-sm text-gray-300 space-y-4">

                            <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                Hello! I can summarize articles, detect bias, explain sentiment,
                                and answer questions.
                            </div>

                            <div className="bg-purple-900/30 p-3 rounded-lg ml-auto w-fit max-w-[80%]">
                                Explain media bias.
                            </div>

                            <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                Media bias occurs when news sources present information with
                                partiality or framing that influences audience perception.
                            </div>

                        </div>

                        {/* INPUT */}
                        <div className="mt-4 flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask AI about news..."
                                className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-3 outline-none focus:border-purple-600"
                            />

                            <button className="bg-purple-700 hover:bg-purple-800 transition-all duration-300 px-5 rounded-lg font-medium">
                                Send
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}
