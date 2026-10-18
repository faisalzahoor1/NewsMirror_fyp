import { CategoryMenu } from '../components/CategoryMenu'
import { ArticleGrid } from '../components/ArticleGrid';

export const Categories = () => {
    return (
        <div className="min-h-screen bg-black text-white px-6 py-8">
            <h1 className="text-4xl font-bold text-purple-500 mb-6">
                Categories
            </h1>
            <CategoryMenu />


                  {/* Latest News from every category */}
                  <section className="px-6 md:px-16 py-10">

                    <div className="flex justify-between items-center mb-10">

                      <h2 className="text-4xl font-bold">
                        Latest News
                      </h2>
                    </div>

                    {/* News Cards (scraped articles from the database) */}
                    <ArticleGrid pageSize={12} />
                  </section>
        </div>
    )
}
