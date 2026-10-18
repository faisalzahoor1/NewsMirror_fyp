import { useNavigate } from 'react-router-dom'
import { ArticleGrid } from '../components/ArticleGrid'
// import { CategoryMenu } from '../components/CategoryMenu'


export const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="px-6 md:px-16 py-20 border-b border-gray-800">

        <div className="max-w-5xl">

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Discover News From Every
            <span className="text-purple-500"> Perspective</span>
          </h1>

          <p className="text-gray-400 text-lg leading-8 max-w-3xl">
            NewsMirror is an AI-powered news aggregation and analysis
            platform that provides balanced news, bias detection,
            sentiment analysis, and intelligent summaries from
            multiple trusted sources.
          </p>

          <div className="flex gap-4 mt-8">

            <button className="bg-purple-700 hover:bg-purple-800 px-6 py-3 rounded-xl transition-all duration-300">
              Explore News
            </button>

            <button className="border border-gray-700 hover:border-purple-600 px-6 py-3 rounded-xl transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="px-6 md:px-16 py-10">

        <div className="flex justify-between items-center mb-10">

          <h2 className="text-4xl font-bold">
            Latest News
          </h2>

          <button
            onClick={() => navigate('/categories')}
            className="text-purple-400 hover:text-purple-300"
          >
            View All →
          </button>
        </div>

        {/* News Cards (scraped articles from the database) */}
        <ArticleGrid pageSize={9} showLoadMore={false} />
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-20 bg-gray-950">

        <h2 className="text-4xl font-bold text-center mb-14">
          Why Choose NewsMirror?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">📰</div>

            <h3 className="text-xl font-semibold mb-3">
              News Aggregation
            </h3>

            <p className="text-gray-400">
              Collects articles from multiple trusted sources.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">⚖️</div>

            <h3 className="text-xl font-semibold mb-3">
              Bias Detection
            </h3>

            <p className="text-gray-400">
              Analyze political leaning and media bias instantly.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">🤖</div>

            <h3 className="text-xl font-semibold mb-3">
              AI Summaries
            </h3>

            <p className="text-gray-400">
              Read concise summaries powered by AI models.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">💬</div>

            <h3 className="text-xl font-semibold mb-3">
              Community Discussion
            </h3>

            <p className="text-gray-400">
              Participate in intelligent discussions about news.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
