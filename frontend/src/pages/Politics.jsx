import { NewsCard } from "../components/NewsCard";

const politicsArticles = [
    {
        category: "Politics",
        title: "Government announces new policy reforms",
        summary:
            "Officials introduced several initiatives aimed at improving economic and social development.",
        image:
            "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620",
        bias: "Center",
        sentiment: "Neutral",
    },
    {
        category: "Politics",
        title: "Election campaigns intensify across the country",
        summary:
            "Political parties increased rallies and public outreach ahead of upcoming national elections.",
        image:
            "https://images.unsplash.com/photo-1541872703-74c5e44368f9",
        bias: "Left",
        sentiment: "Neutral",
    },
    {
        category: "Politics",
        title: "International leaders discuss regional security",
        summary:
            "Diplomatic meetings focused on cooperation and conflict prevention strategies.",
        image:
            "https://images.unsplash.com/photo-1494172961521-33799ddd43a5",
        bias: "Right",
        sentiment: "Positive",
    },
];
export const Politics = () => {
  return (
          <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Political News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {politicsArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
