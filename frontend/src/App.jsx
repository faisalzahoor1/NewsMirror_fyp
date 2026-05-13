import { ToastContainer } from 'react-toastify'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { About } from './pages/About'
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import MainLayout from './layouts/MainLayout'
import { Categories } from './pages/Categories'
import { Sports } from './pages/Sports'
import { Business } from './pages/Business'
import { Education } from './pages/Education'
import { Science } from './pages/Science'
import { Technology } from './pages/Technology'
import { Health } from './pages/Health'
import { World } from './pages/World'
import { Gaming } from './pages/Gaming'
import { Politics } from './pages/Politics'
import { Entertainment } from './pages/Entertainment'
import { MyProfile } from './pages/MyProfile'
import { FakeNews } from './pages/FakeNews'
import { MultiPerspective } from './pages/MultiPerspective'

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Categories />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/sports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Sports />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/business"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Business />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/education"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Education />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/science"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Science />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/technology"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Technology />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/health"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Health />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/world"
          element={
            <ProtectedRoute>
              <MainLayout>
                <World />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/gaming"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Gaming />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/politics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Politics />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/entertainment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Entertainment />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/fake"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FakeNews />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/multi"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MultiPerspective />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <MainLayout>
                <About />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App
