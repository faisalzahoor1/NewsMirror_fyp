import { useState } from "react";
import { AppContext } from "./AppContext";
// import { useState } from "react";
// import axios from "axios";

const AppContextProvider = (props) => {

    const backend_url = import.meta.env.VITE_BACKEND_URL
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')

    // const [user, setUser] = useState(null);
    // const [loading, setLoading] = useState(true);

    // const fetchUser = async () => {
    //     console.log("hello")
    //     try {
    //         const res = await axios.get(
    //             backend_url + "/api/user/me",
    //             { withCredentials: true }
    //         );

    //         if (res.data.loggedIn) {
                
    //             setUser(res.data.user);
    //         } else {
                
    //             setUser(null);
    //         }
    //     } catch {
    //         setUser(null);
    //     }
        
    //     setLoading(false);
    // };

    const value = {
        backend_url,
        token,
        setToken
        
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider