import { NewsCard } from "../components/NewsCard";

const businessArticles = [
    {
        category: "Business",
        title: "Global markets show signs of economic recovery",
        summary:
            "Investors reacted positively after new economic reports indicated stable growth across major sectors.",
        image:
            "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Business",
        title: "Tech companies expand investment strategies",
        summary:
            "Several major corporations announced billion-dollar investments into artificial intelligence projects.",
        image:
            "https://images.unsplash.com/photo-1556740749-887f6717d7e4",
        bias: "Left",
        sentiment: "Positive",
    },
    {
        category: "Business",
        title: "Small businesses face rising operational costs",
        summary:
            "Owners expressed concerns about inflation and supply chain disruptions affecting profits.",
        image:
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
        bias: "Right",
        sentiment: "Negative",
    },
];
export const Business = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Business News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {businessArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
