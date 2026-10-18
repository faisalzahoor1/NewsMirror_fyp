import { NavLink } from "react-router-dom";

const categories = [
    "sports",
    "entertainment",
    "business",
    "politics",
    "technology",
    "health",
    "science",
    "world",
    "education",
    "gaming",
];
export const CategoryMenu = () => {
    return (
        <div className="w-full overflow-x-auto py-4">
            <div className="flex gap-4 min-w-max">

                {/* All categories (the Categories page) */}
                <NavLink
                    to="/categories"
                    end
                    className={({ isActive }) =>
                        `px-5 py-2 rounded-full transition-all duration-300 whitespace-nowrap

                        ${isActive
                            ? "bg-purple-700 text-white"
                            : "bg-gray-900 text-gray-300 hover:bg-purple-900"
                        }`
                    }
                >
                    All
                </NavLink>

                {categories.map((category, index) => (
                    <NavLink
                        key={index}
                        to={`/categories/${category}`}
                        className={({ isActive }) =>
                            `px-5 py-2 rounded-full capitalize transition-all duration-300 whitespace-nowrap
                            
                            ${isActive
                                ? "bg-purple-700 text-white"
                                : "bg-gray-900 text-gray-300 hover:bg-purple-900"
                            }`
                        }
                    >
                        {category}
                    </NavLink>
                ))}
            </div>
        </div>
    )
}
