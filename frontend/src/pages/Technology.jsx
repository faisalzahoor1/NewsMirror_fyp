import { NewsCard } from "../components/NewsCard";

const technologyArticles = [
    {
        category: "Technology",
        title: "AI innovation transforms software industry",
        summary:
            "Developers are rapidly adopting artificial intelligence tools to improve productivity and automation.",
        image:
            "https://images.unsplash.com/photo-1518770660439-4636190af475",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Technology",
        title: "Cybersecurity experts warn about new threats",
        summary:
            "Researchers highlighted increasing risks associated with sophisticated online attacks.",
        image:
            "https://images.unsplash.com/photo-1510511459019-5dda7724fd87",
        bias: "Right",
        sentiment: "Negative",
    },
    {
        category: "Technology",
        title: "Smartphone industry unveils next-generation devices",
        summary:
            "Companies showcased advanced camera systems and AI-powered features in new launches.",
        image:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        bias: "Left",
        sentiment: "Positive",
    },
];
export const Technology = () => {
  return (
          <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Technology News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {technologyArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
