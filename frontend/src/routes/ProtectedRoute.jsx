import { Navigate } from "react-router-dom";
import { AppContext } from '../context/AppContext'
import { useContext } from 'react';

const ProtectedRoute = ({ children }) => {
    const {token} = useContext(AppContext)

    return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;


// import { Navigate } from "react-router-dom";
// import { AppContext } from '../context/AppContext'
// import { useContext } from 'react';

// const ProtectedRoute = ({ children }) => {
//     const { user, loading } = useContext(AppContext);

//     if (loading) return null;

//     return user ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;