import { useContext, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import favicon from '../assets/favicon.svg'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, setToken, user, notifications, unreadCount, markAsRead, markAllAsRead, setIsInboxOpen, unreadDmCount, openChatWithUser } = useContext(AppContext)
    const [showNotifications, setShowNotifications] = useState(false);
    // const [activeItem, setActiveItem] = useState("home");

    const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
        navigate('/login');
        toast.error("Logout")
    }

    // Active Route Logic
    const isHomeActive = location.pathname === "/";

    const isCategoryActive =
        location.pathname === "/categories" ||
        location.pathname.startsWith("/category/");

    const isAboutActive = location.pathname === "/about";
    const isFakeActive = location.pathname === "/fake";
    const isCommunityActive = location.pathname === "/community";
    const isMultiActive = location.pathname === "/multi";

    return token && (
        <div className='flex items-center justify-between text-sm px-4 py-4 mb-5 border-b border-b-gray-400'>

            {/* Logo */}
            <div className="flex items-center gap-4">

                <img
                    className="w-10 h-10 object-contain cursor-pointer"
                    src={favicon}
                    alt=""
                    onClick={() => navigate('/')}
                />

                <p className="font-semibold text-lg">
                    NewsMirror
                </p>
            </div>

            {/* Navbar */}
            <div className="flex-1 flex justify-center">

                <ul className="hidden md:flex items-start gap-8 font-medium">

                    {/* HOME */}
                    <NavLink
                        to="/"
                        className="flex flex-col items-center"
                    >
                        <li className="py-1 list-none cursor-pointer">
                            HOME
                        </li>

                        <hr
                            className={`border-none h-0.5 bg-purple-700 w-3/5 transition-all duration-300
                                
                                ${isHomeActive
                                    ? "block"
                                    : "hidden"
                                }
                            `}
                        />
                    </NavLink>

                    {/* CATEGORIES */}
                    <NavLink
                        to="/categories"
                        className="flex flex-col items-center"
                    >
                        <li className="py-1 list-none cursor-pointer">
                            CATEGORIES
                        </li>

                        <hr
                            className={`border-none h-0.5 bg-purple-700 w-3/5 transition-all duration-300
                                
                                ${isCategoryActive
                                    ? "block"
                                    : "hidden"
                                }
                            `}
                        />
                    </NavLink>
                    {/* Fake News */}
                    <NavLink
                        to="/fake"
                        className="flex flex-col items-center"
                    >
                        <li className="py-1 list-none cursor-pointer">
                            FAKE NEWS DETECTION
                        </li>

                        <hr
                            className={`border-none h-0.5 bg-purple-700 w-3/5 transition-all duration-300
                                
                                ${isFakeActive
                                    ? "block"
                                    : "hidden"
                                }
                            `}
                        />
                    </NavLink>

                    {/* MultiPerspective */}
                    <NavLink
                        to="/multi"
                        className="flex flex-col items-center"
                    >
                        <li className="py-1 list-none cursor-pointer">
                            MULTI-PERSPECTIVE ANALYSIS
                        </li>

                        <hr
                            className={`border-none h-0.5 bg-purple-700 w-3/5 transition-all duration-300
                                
                                ${isMultiActive
                                    ? "block"
                                    : "hidden"
                                }
                            `}
                        />
                    </NavLink>

                    {/* Communiy discussion */}
                    <NavLink
                        to="/community"
                        className="flex flex-col items-center"
                    >
                        <li className="py-1 list-none cursor-pointer">
                            COMMUNITY DISCUSSION
                        </li>

                        <hr
                            className={`border-none h-0.5 bg-purple-700 w-3/5 transition-all duration-300
                                
                                ${isCommunityActive
                                    ? "block"
                                    : "hidden"
                                }
                            `}
                        />
                    </NavLink>

                    {/* ABOUT */}
                    <NavLink
                        to="/about"
                        className="flex flex-col items-center"
                    >
                        <li className="py-1 list-none cursor-pointer">
                            ABOUT
                        </li>

                        <hr
                            className={`border-none h-0.5 bg-purple-700 w-3/5 transition-all duration-300
                                
                                ${isAboutActive
                                    ? "block"
                                    : "hidden"
                                }
                            `}
                        />
                    </NavLink>
                </ul>
            </div>

            {/* Logout */}
            {/* <div>
                <button
                    className='bg-purple-700 text-white py-2 px-5 rounded-md text-base cursor-pointer transition-transform duration-300 hover:scale-105'
                    onClick={logout}
                >
                    Logout
                </button>
            </div> */}

            <div className="flex items-center gap-3 sm:gap-4">
                {/* Inbox Button */}
                <button
                    onClick={() => setIsInboxOpen(prev => !prev)}
                    className="relative w-10 h-10 rounded-full bg-zinc-850 hover:bg-zinc-800 flex items-center justify-center text-lg text-white transition-all cursor-pointer border border-zinc-700 hover:border-purple-600 shadow-md"
                    title="Direct Messages Inbox"
                >
                    <span>✉️</span>
                    {unreadDmCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-purple-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse shadow">
                            {unreadDmCount > 9 ? '9+' : unreadDmCount}
                        </span>
                    )}
                </button>

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(prev => !prev)}
                        className="relative w-10 h-10 rounded-full bg-zinc-850 hover:bg-zinc-800 flex items-center justify-center text-lg text-white transition-all cursor-pointer border border-zinc-700 hover:border-purple-600 shadow-md"
                        title="Notifications"
                    >
                        <span>🔔</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse shadow">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white text-sm">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-purple-900/60 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-700 font-mono">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                                {notifications && notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            onClick={() => {
                                                if (!notif.is_read) markAsRead(notif._id);
                                                setShowNotifications(false);
                                                if (notif.type === 'dm') {
                                                    openChatWithUser({ _id: notif.sender_id, name: notif.sender_name });
                                                } else {
                                                    navigate('/community');
                                                }
                                            }}
                                            className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-zinc-800/60 ${
                                                notif.is_read ? 'opacity-70 bg-transparent' : 'bg-purple-950/30'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs font-medium text-white leading-snug">
                                                    {notif.message}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1 shadow-sm shadow-purple-400"></span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-zinc-500 mt-1.5 block">
                                                {new Date(notif.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-xs text-zinc-500">
                                        No notifications yet
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Image & Menu */}
                <div className="relative group">
                    <div className="w-11 h-11 rounded-full bg-purple-700 flex items-center justify-center cursor-pointer overflow-hidden border border-gray-600 shadow">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-lg font-semibold text-white">
                                {user?.name?.charAt(0)}
                            </span>
                        )}
                    </div>

                    {/* Dropdown */}
                    <div
                        className="absolute right-0 top-12 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-300 z-50"
                    >
                        <div className="p-4 border-b border-gray-700">
                            <p className="font-semibold text-white">
                                {user?.name}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                                {user?.email}
                            </p>
                        </div>

                        <div className="py-2">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full text-left px-4 py-3 hover:bg-purple-800 transition-all duration-200"
                            >
                                My Info
                            </button>
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-3 hover:bg-red-700 transition-all duration-200 text-red-400"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}









// <div className='flex items-center justify-between text-sm px-4 py-4 mb-5 border-b border-b-gray-400'>
//     <div className="flex items-center gap-4">
//         <img className="w-10 h-10 object-contain cursor-pointer" src={favicon} alt="" />
//         <p className="w-10 h-10 flex items-center justify-center">
//             NewsMirror
//         </p>
//     </div>
//     <div className="flex-1 flex justify-center">
//         <ul className="hidden md:flex items-start gap-5 font-medium">
//             <NavLink to="/" className="flex flex-col items-center" onClick={() => setActiveItem("home")}>

//                 <li className="py-1">HOME</li>
//                 <hr
//                     className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "home" ? "block" : "hidden"
//                         }`}
//                 />
//             </NavLink>


//             <NavLink to="/categories" className="flex flex-col items-center" onClick={() => setActiveItem("categories")}>
//                 <li className="py-1">Categories</li>
//                 <hr
//                     className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "categories" ? "block" : "hidden"
//                         }`}
//                 />

//             </NavLink>

//             <NavLink to="/about" className="flex flex-col items-center" onClick={() => setActiveItem("about")}>
//                 <li className="py-1">ABOUT</li>
//                 <hr
//                     className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "about" ? "block" : "hidden"
//                         }`}
//                 />

//             </NavLink>



//             {/* <div className="relative group" onClick={() => setActiveItem("category")}>

//                 <div className="flex flex-col items-center cursor-pointer">
//                     <li className="py-1">CATEGORIES</li>
//                     <hr
//                         className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "category" ? "block" : "hidden"
//                             }`}
//                     />
//                     { activeItem == "category" ? (
//                         <div className="absolute top-10 bg-black border border-gray-700 rounded-md shadow-lg w-40 opacity-0 group-hover:opacity-100 transition-all duration-300">
//                             <NavLink className="block px-4 py-2 hover:bg-purple-800">Politics</NavLink>
//                             <NavLink className="block px-4 py-2 hover:bg-purple-800">Sports</NavLink>
//                         </div>
//                     ): ''
//                     }


//                 </div>
//             </div> */}
//         </ul>
//     </div>
//     <div>
//         <button className='bg-purple-700 text-white w-full py-2 px-4 rounded-md text-base cursor-pointer transition-transform duration-300 hover:scale-105' onClick={logout}>Logout</button>
//     </div>
// </div>