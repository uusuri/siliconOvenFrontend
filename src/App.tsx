import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import ProductsSection from './components/ProductsSection';
import InfoRow from './components/InfoRow';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartDrawer from './components/CartDrawer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

const HomePage: React.FC = () => (
  <>
    <Hero />
    <Ticker />
    <ProductsSection />
    <InfoRow />
  </>
);

const App: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="page">
              <Header onCartOpen={() => setCartOpen(true)} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/profile" element={<UserPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
              <Footer />
            </div>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

