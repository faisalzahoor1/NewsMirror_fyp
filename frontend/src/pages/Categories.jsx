import { CategoryMenu } from '../components/CategoryMenu'
import { NewsCard } from '../components/NewsCard';

const categoryArticles = [
  {
    category: "Sports",
    title: "Pakistan wins thrilling cricket series finale",
    summary:
      "Pakistan secured a dramatic victory in the final over after an intense batting performance.",
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
    bias: "Center",
    sentiment: "Positive",
  },

  {
    category: "Technology",
    title: "AI innovation transforms software industry",
    summary:
      "Developers are rapidly adopting artificial intelligence tools to improve productivity.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
    bias: "Left",
    sentiment: "Positive",
  },

  {
    category: "Politics",
    title: "Government announces major policy reforms",
    summary:
      "Officials introduced several initiatives aimed at economic and social development.",
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620",
    bias: "Right",
    sentiment: "Neutral",
  },

  {
    category: "Entertainment",
    title: "New blockbuster movie dominates global box office",
    summary:
      "The latest action thriller achieved record-breaking ticket sales worldwide.",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
    bias: "Center",
    sentiment: "Positive",
  },

  {
    category: "Business",
    title: "Global markets show signs of economic recovery",
    summary:
      "Investors reacted positively after new reports indicated stable growth.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
    bias: "Left",
    sentiment: "Positive",
  },

  {
    category: "Health",
    title: "Doctors encourage healthier lifestyle habits",
    summary:
      "Medical experts emphasized exercise and balanced diets for wellbeing.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    bias: "Center",
    sentiment: "Positive",
  },

  {
    category: "Science",
    title: "Researchers discover promising energy solution",
    summary:
      "Scientists developed innovative methods for renewable energy production.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    bias: "Right",
    sentiment: "Positive",
  },

  {
    category: "World",
    title: "International summit focuses on global cooperation",
    summary:
      "World leaders gathered to discuss economic growth and humanitarian issues.",
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
    bias: "Center",
    sentiment: "Neutral",
  },

  {
    category: "Gaming",
    title: "Esports industry continues rapid expansion",
    summary:
      "Professional gaming tournaments attracted millions of online viewers.",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    bias: "Left",
    sentiment: "Positive",
  },

  {
    category: "Education",
    title: "Universities introduce AI-focused programs",
    summary:
      "Institutions expanded courses related to AI and data science.",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    bias: "Center",
    sentiment: "Positive",
  },
];
export const Categories = () => {
    return (
        <div className="min-h-screen bg-black text-white px-6 py-8">
            <h1 className="text-4xl font-bold text-purple-500 mb-6">
                Categories
            </h1>
            <CategoryMenu />


                  {/* Trending News */}
                  <section className="px-6 md:px-16 py-10">
            
                    <div className="flex justify-between items-center mb-10">
            
                      <h2 className="text-4xl font-bold">
                        Trending News
                      </h2>
            
                      <button className="text-purple-400 hover:text-purple-300">
                        View All →
                      </button>
                    </div>
            
                    {/* News Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
                      {categoryArticles.map((article, index) => (
                        <NewsCard key={index} article={article} />
                      ))}
                    </div>
                  </section>
        </div>
    )
}
