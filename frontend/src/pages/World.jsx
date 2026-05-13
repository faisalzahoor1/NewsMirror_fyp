import { NewsCard } from "../components/NewsCard";

const worldArticles = [
    {
        category: "World",
        title: "International summit focuses on global cooperation",
        summary:
            "World leaders gathered to discuss economic growth and humanitarian challenges.",
        image:
            "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "World",
        title: "Tourism industry rebounds after travel growth",
        summary:
            "Countries reported increased visitor numbers and stronger tourism revenues.",
        image:
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
        bias: "Left",
        sentiment: "Positive",
    },
    {
        category: "World",
        title: "Global organizations respond to humanitarian crisis",
        summary:
            "Aid groups coordinated relief efforts to support affected communities.",
        image:
            "https://images.unsplash.com/photo-1469571486292-b53601020f53",
        bias: "Right",
        sentiment: "Neutral",
    },
];

export const World = () => {
  return (
          <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                World News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {worldArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
