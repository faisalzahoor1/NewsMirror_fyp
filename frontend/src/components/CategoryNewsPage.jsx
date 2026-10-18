import { ArticleGrid } from "./ArticleGrid";
import { CategoryMenu } from "./CategoryMenu";

// Page layout shared by all category pages (Sports, Business, ...)
export const CategoryNewsPage = ({ category, title }) => {
    return (
        <div className="min-h-screen bg-black text-white px-6 py-8">

            <h1 className="text-4xl font-bold text-purple-500 mb-4">
                {title}
            </h1>

            {/* Category bar so users can jump straight to another category */}
            <div className="mb-6">
                <CategoryMenu />
            </div>

            <ArticleGrid category={category} />
        </div>
    )
}
