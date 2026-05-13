import { NewsCard } from "../components/NewsCard";

const scienceArticles = [
    {
        category: "Science",
        title: "Researchers discover promising energy solution",
        summary:
            "Scientists developed innovative methods for sustainable and renewable energy production.",
        image:
            "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Science",
        title: "Space agencies prepare for lunar missions",
        summary:
            "Upcoming projects aim to establish long-term research operations on the moon.",
        image:
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
        bias: "Right",
        sentiment: "Positive",
    },
    {
        category: "Science",
        title: "Climate studies reveal changing weather patterns",
        summary:
            "Experts warned about environmental shifts impacting ecosystems worldwide.",
        image:
            "https://images.unsplash.com/photo-1473448912268-2022ce9509d8",
        bias: "Left",
        sentiment: "Negative",
    },
];
export const Science = () => {
  return (
          <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Science News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {scienceArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
