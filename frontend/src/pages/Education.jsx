import { NewsCard } from "../components/NewsCard";

const educationArticles = [
    {
        category: "Education",
        title: "Universities introduce AI-focused programs",
        summary:
            "Educational institutions expanded courses related to artificial intelligence and data science.",
        image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
        bias: "Center",
        sentiment: "Positive",
    },
    {
        category: "Education",
        title: "Students benefit from digital learning platforms",
        summary:
            "Online resources continue improving accessibility and flexible learning opportunities.",
        image:
            "https://images.unsplash.com/photo-1509062522246-3755977927d7",
        bias: "Left",
        sentiment: "Positive",
    },
    {
        category: "Education",
        title: "Schools adopt modern classroom technologies",
        summary:
            "Interactive teaching tools are helping educators improve student engagement.",
        image:
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
        bias: "Center",
        sentiment: "Neutral",
    },
];
export const Education = () => {
  return (
            <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Education News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {educationArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
