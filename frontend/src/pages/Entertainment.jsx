import { NewsCard } from "../components/NewsCard";

const entertainmentArticles = [
    {
        category: "Entertainment",
        title: "New blockbuster movie dominates global box office",
        summary:
            "The latest action thriller achieved record-breaking ticket sales during its opening weekend worldwide.",
        image:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Entertainment",
        title: "Music festival attracts thousands of fans",
        summary:
            "Artists from around the world performed live in one of the biggest entertainment events of the year.",
        image:
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
        bias: "Left",
        sentiment: "Positive",
    },
    {
        category: "Entertainment",
        title: "Streaming platforms compete for exclusive releases",
        summary:
            "Major companies continue investing heavily in original content to attract subscribers globally.",
        image:
            "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4",
        bias: "Right",
        sentiment: "Neutral",
    },
];
export const Entertainment = () => {
  return (
            <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Entertainment News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {entertainmentArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
