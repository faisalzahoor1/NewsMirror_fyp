import { AppContext } from '../context/AppContext'
import { Navigate } from "react-router-dom";
import { useContext } from 'react';

const PublicRoute = ({ children }) => {
  const {token} = useContext(AppContext)

  return !token ? children : <Navigate to="/" />;
};

export default PublicRoute;





// import { AppContext } from '../context/AppContext'
// import { Navigate } from "react-router-dom";
// import { useContext } from 'react';


// const PublicRoute = ({ children }) => {
//   const { user, loading } = useContext(AppContext);

//   if (loading) return null; // or loader

//   return !user ? children : <Navigate to="/" />;
// };

// export default PublicRoute;








