import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { Categories } from './pages/Categories';
import { Search } from './pages/Search';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Saved } from './pages/Saved';
import { Notifications } from './pages/Notifications';
import { Admin } from './pages/Admin';
export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/search" element={<Search />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:id" element={<Profile />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster position="top-center" />
      </AppProvider>
    </ErrorBoundary>);

}