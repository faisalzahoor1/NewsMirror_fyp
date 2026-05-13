import { NewsCard } from "../components/NewsCard";

const gamingArticles = [
    {
        category: "Gaming",
        title: "New multiplayer game breaks download records",
        summary:
            "Gamers worldwide joined the latest online release within hours of launch.",
        image:
            "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Gaming",
        title: "Esports industry continues rapid expansion",
        summary:
            "Professional gaming tournaments attracted millions of online viewers globally.",
        image:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        bias: "Left",
        sentiment: "Positive",
    },
    {
        category: "Gaming",
        title: "Virtual reality gaming gains popularity",
        summary:
            "Developers introduced immersive experiences using advanced VR technologies.",
        image:
            "https://images.unsplash.com/photo-1511512578047-dfb367046420",
        bias: "Right",
        sentiment: "Positive",
    },
];
export const Gaming = () => {
  return (
          <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Gaming News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {gamingArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
