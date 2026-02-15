import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CustomCursor from './components/effects/CustomCursor';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdBlockDetector from './components/utils/AdBlockDetector';
import AdminRoute from './components/auth/AdminRoute';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const AllProjects = lazy(() => import('./pages/AllProjects'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const TemplateDetail = lazy(() => import('./pages/TemplateDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminSelectedWorks = lazy(() => import('./pages/admin/AdminSelectedWorks'));
const AdminQueries = lazy(() => import('./pages/admin/AdminQueries'));
const CustomQuery = lazy(() => import('./pages/CustomQuery'));
const Chat = lazy(() => import('./pages/Chat'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="antialiased text-white bg-background min-h-screen selection:bg-primary/30 selection:text-white">
          <AdBlockDetector />
          <CustomCursor />
          <Navbar />
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/all-projects" element={<AllProjects />} />
                <Route path="/custom-query" element={<CustomQuery />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<TemplateDetail />} />
                <Route path="/checkout/:id" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/selected-works"
                  element={
                    <AdminRoute>
                      <AdminSelectedWorks />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/queries"
                  element={
                    <AdminRoute>
                      <AdminQueries />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
