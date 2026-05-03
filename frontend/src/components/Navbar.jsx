import { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import favicon from '../assets/favicon.svg'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

export const Navbar = () => {
    const navigate = useNavigate();
    const { token, setToken } = useContext(AppContext)
    const [activeItem, setActiveItem] = useState("home");

    const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
        navigate('/login');
        toast.error("Logout")
    }

    return token && (
        <div className='flex items-center justify-between text-sm px-4 py-4 mb-5 border-b border-b-gray-400'>
            <div className="flex items-center gap-4">
                <img className="w-10 h-10 object-contain cursor-pointer" src={favicon} alt="" />
                <p className="w-10 h-10 flex items-center justify-center">
                    NewsMirror
                </p>
            </div>
            <div className="flex-1 flex justify-center">
                <ul className="hidden md:flex items-start gap-5 font-medium">
                    <NavLink to="/" className="flex flex-col items-center" onClick={() => setActiveItem("home")}>

                        <li className="py-1">HOME</li>
                        <hr
                            className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "home" ? "block" : "hidden"
                                }`}
                        />
                    </NavLink>

                    <NavLink to="/about" className="flex flex-col items-center" onClick={() => setActiveItem("about")}>
                        <li className="py-1">ABOUT</li>
                        <hr
                            className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "about" ? "block" : "hidden"
                                }`}
                        />

                    </NavLink>


                    <div className="relative group" onClick={() => setActiveItem("category")}>

                        <div className="flex flex-col items-center cursor-pointer">
                            <li className="py-1">CATEGORIES</li>
                            <hr
                                className={`border-none h-0.5 bg-purple-900 w-3/5 transition-all duration-300 ${activeItem === "category" ? "block" : "hidden"
                                    }`}
                            />
                            { activeItem == "category" ? (
                                <div className="absolute top-10 bg-black border border-gray-700 rounded-md shadow-lg w-40 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <NavLink className="block px-4 py-2 hover:bg-purple-800">Politics</NavLink>
                                    <NavLink className="block px-4 py-2 hover:bg-purple-800">Sports</NavLink>
                                </div>
                            ): ''
                            }


                        </div>
                    </div>
                </ul>
            </div>
            <div>
                <button className='bg-purple-700 text-white w-full py-2 px-4 rounded-md text-base cursor-pointer transition-transform duration-300 hover:scale-105' onClick={logout}>Logout</button>
            </div>
        </div>
    )
}