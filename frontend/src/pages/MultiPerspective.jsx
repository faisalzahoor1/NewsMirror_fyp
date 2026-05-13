
export const MultiPerspective = () => {
  const article1 = {
        channel: "BBC News",
        title: "Global Climate Summit Ends With New Agreements",
        summary:
            "World leaders agreed on new environmental targets and renewable energy investments during the international climate summit.",
        image:
            "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
        bias: "Center",
        sentiment: "Positive",
    };

    const article2 = {
        channel: "Fox News",
        title: "Nations Debate Economic Impact of Climate Policies",
        summary:
            "Several countries raised concerns about the financial burden of strict environmental regulations discussed at the summit.",
        image:
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
        bias: "Right",
        sentiment: "Neutral",
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 md:px-16 py-14">

            {/* Heading */}
            <div className="text-center mb-14">

                <h1 className="text-5xl font-bold mb-5">
                    Multi-Perspective{" "}
                    <span className="text-purple-500">
                        Analysis
                    </span>
                </h1>

                <p className="text-gray-400 max-w-4xl mx-auto text-lg leading-8">
                    Compare how different news channels report the same story.
                    Analyze bias, sentiment, viewpoints, and AI-generated
                    similarity scores to understand multiple perspectives.
                </p>
            </div>

            {/* Compare Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Article 1 */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">

                    {/* Image */}
                    <img
                        src={article1.image}
                        alt=""
                        className="w-full h-72 object-cover"
                    />

                    {/* Content */}
                    <div className="p-8">

                        {/* Channel */}
                        <div className="flex justify-between items-center mb-5">

                            <span className="bg-purple-700 px-4 py-2 rounded-full text-sm">
                                {article1.channel}
                            </span>

                            <span className="bg-green-700 px-4 py-2 rounded-full text-sm">
                                {article1.sentiment}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold mb-5 leading-snug">
                            {article1.title}
                        </h2>

                        {/* Summary */}
                        <p className="text-gray-400 leading-8 mb-8">
                            {article1.summary}
                        </p>

                        {/* Bias */}
                        <div>

                            <div className="flex justify-between mb-3">

                                <span>Bias Meter</span>

                                <span className="text-purple-400">
                                    {article1.bias}
                                </span>
                            </div>

                            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">

                                <div className="w-2/4 h-full bg-green-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article 2 */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">

                    {/* Image */}
                    <img
                        src={article2.image}
                        alt=""
                        className="w-full h-72 object-cover"
                    />

                    {/* Content */}
                    <div className="p-8">

                        {/* Channel */}
                        <div className="flex justify-between items-center mb-5">

                            <span className="bg-purple-700 px-4 py-2 rounded-full text-sm">
                                {article2.channel}
                            </span>

                            <span className="bg-yellow-600 px-4 py-2 rounded-full text-sm">
                                {article2.sentiment}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold mb-5 leading-snug">
                            {article2.title}
                        </h2>

                        {/* Summary */}
                        <p className="text-gray-400 leading-8 mb-8">
                            {article2.summary}
                        </p>

                        {/* Bias */}
                        <div>

                            <div className="flex justify-between mb-3">

                                <span>Bias Meter</span>

                                <span className="text-purple-400">
                                    {article2.bias}
                                </span>
                            </div>

                            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">

                                <div className="w-3/4 h-full bg-red-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similarity Analysis */}
            <div className="mt-14 bg-gray-900 border border-gray-800 rounded-3xl p-10">

                <h2 className="text-3xl font-bold mb-10">
                    AI Similarity Analysis
                </h2>

                {/* Similarity Score */}
                <div className="mb-10">

                    <div className="flex justify-between mb-4">

                        <span className="text-lg">
                            Similarity Score
                        </span>

                        <span className="text-2xl font-bold text-purple-400">
                            78%
                        </span>
                    </div>

                    <div className="w-full h-5 bg-gray-700 rounded-full overflow-hidden">

                        <div className="w-[78%] h-full bg-purple-600 rounded-full" />
                    </div>
                </div>

                {/* AI Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Common Points */}
                    <div className="bg-gray-800 rounded-2xl p-6">

                        <h3 className="text-xl font-semibold mb-4 text-green-400">
                            Common Points
                        </h3>

                        <ul className="space-y-3 text-gray-400">

                            <li>
                                • Both discuss climate summit agreements
                            </li>

                            <li>
                                • Both mention international participation
                            </li>

                            <li>
                                • Renewable energy discussed in both articles
                            </li>
                        </ul>
                    </div>

                    {/* Differences */}
                    <div className="bg-gray-800 rounded-2xl p-6">

                        <h3 className="text-xl font-semibold mb-4 text-red-400">
                            Perspective Differences
                        </h3>

                        <ul className="space-y-3 text-gray-400">

                            <li>
                                • BBC focuses on environmental progress
                            </li>

                            <li>
                                • Fox highlights economic concerns
                            </li>

                            <li>
                                • Tone and framing differ significantly
                            </li>
                        </ul>
                    </div>

                    {/* AI Verdict */}
                    <div className="bg-gray-800 rounded-2xl p-6">

                        <h3 className="text-xl font-semibold mb-4 text-purple-400">
                            AI Verdict
                        </h3>

                        <p className="text-gray-400 leading-7">
                            Both articles report the same event but frame the
                            story differently based on editorial priorities and
                            political perspective.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
