import { NewsCard } from "../components/NewsCard";



const sportsArticles = [
    {
        category: "Sports",
        title: "Pakistan wins thrilling cricket series finale",
        summary:
            "Pakistan secured a dramatic victory in the final over after an intense batting performance and strong bowling attack.",
        image:
            "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
        bias: "Center",
        sentiment: "Positive",
    },

    {
        category: "Sports",
        title: "Football championship reaches exciting semifinals",
        summary:
            "Top clubs battle for a place in the finals as fans witness one of the most competitive seasons in recent years.",
        image:
            "https://images.unsplash.com/photo-1518604666860-9ed391f76460",
        bias: "Left",
        sentiment: "Neutral",
    },

    {
        category: "Sports",
        title: "Olympic preparations begin for national athletes",
        summary:
            "Athletes intensify training camps ahead of international competitions scheduled later this year.",
        image:
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
        bias: "Right",
        sentiment: "Positive",
    },

    {
        category: "Sports",
        title: "Basketball league sees record-breaking attendance",
        summary:
            "The latest basketball season attracted massive crowds and increased sponsorship opportunities.",
        image:
            "https://images.unsplash.com/photo-1546519638-68e109498ffc",
        bias: "Center",
        sentiment: "Positive",
    },

    {
        category: "Sports",
        title: "Tennis star advances to world championship final",
        summary:
            "An outstanding performance secured a place in the grand final after defeating the top-ranked opponent.",
        image:
            "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6",
        bias: "Center",
        sentiment: "Positive",
    },

    {
        category: "Sports",
        title: "New coaching strategy improves team performance",
        summary:
            "Analysts praise the tactical changes introduced by the management during the recent tournament.",
        image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b",
        bias: "Left",
        sentiment: "Neutral",
    },

    {
        category: "Sports",
        title: "International racing event attracts global audience",
        summary:
            "Millions tuned in worldwide as drivers competed in a high-speed championship showdown.",
        image:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
        bias: "Right",
        sentiment: "Positive",
    },

    {
        category: "Sports",
        title: "Local athletes receive government recognition",
        summary:
            "Outstanding performers were honored for their contribution to international sporting success.",
        image:
            "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
        bias: "Center",
        sentiment: "Positive",
    },

    {
        category: "Sports",
        title: "Esports tournament breaks streaming records",
        summary:
            "Competitive gaming continues its rapid growth with millions watching live championship events.",
        image:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        bias: "Center",
        sentiment: "Neutral",
    },

    {
        category: "Sports",
        title: "Youth sports initiatives launched nationwide",
        summary:
            "New programs aim to encourage participation and talent development among young athletes.",
        image:
            "https://images.unsplash.com/photo-1517466787929-bc90951d0974",
        bias: "Left",
        sentiment: "Positive",
    },
];
export const Sports = () => {
  return (
     <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-8">
                Sports News
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {sportsArticles.map((article, index) => (
                    <NewsCard key={index} article={article} />
                ))}
            </div>
        </div>
  )
}
