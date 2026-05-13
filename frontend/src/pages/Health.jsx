import { NewsCard } from "../components/NewsCard";

const healthArticles = [
    {
        category: "Health",
        title: "Doctors encourage healthier lifestyle habits",
        summary:
            "Medical experts emphasized exercise and balanced diets for long-term wellbeing.",
        image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Health",
        title: "Hospitals adopt advanced medical technologies",
        summary:
            "Healthcare facilities continue modernizing equipment to improve patient care services.",
        image:
            "https://images.unsplash.com/photo-1584982751601-97dcc096659c",
        bias: "Left",
        sentiment: "Positive",
    },
    {
        category: "Health",
        title: "Mental health awareness campaigns gain momentum",
        summary:
            "Organizations launched initiatives promoting support and awareness for mental wellbeing.",
        image:
            "https://images.unsplash.com/photo-1493836512294-502baa1986e2",
        bias: "Center",
        sentiment: "Positive",
    },
];
export const Health = () => {
  return (
          <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Health News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {healthArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
