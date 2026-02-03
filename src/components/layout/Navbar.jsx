import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import LoginModal from '../ui/LoginModal';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ShoppingBag, LogIn } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Projects', href: '/#projects' },
        { name: 'Features', href: '/#features' },
    ];

    const handleScrollLink = (e, href) => {
        if (href.startsWith('/#')) {
            if (location.pathname === '/') {
                e.preventDefault();
                const id = href.replace('/#', '');
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                }
            }
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-primary/50 py-4 shadow-[0_4px_20px_rgba(222,28,28,0.1)]' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold tracking-tighter cursor-pointer flex items-center gap-2">
                        <span className="text-primary">F</span>urious
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={(e) => handleScrollLink(e, link.href)}
                                className={`text-sm font-medium transition-colors cursor-pointer ${location.pathname === link.href ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user && (
                            <Link
                                to="/orders"
                                className={`text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/orders' ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
                            >
                                <ShoppingBag className="w-4 h-4" /> My Orders
                            </Link>
                        )}

                        {loading ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                                <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <Link to="/account" className="flex items-center gap-3 group">
                                    <span className="hidden lg:block text-sm font-medium text-gray-300 group-hover:text-primary transition-colors">
                                        {user.displayName?.split(' ')[0]}
                                    </span>
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName}
                                            className="w-9 h-9 rounded-full border-2 border-primary/20 group-hover:border-primary transition-all duration-300 object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary transition-all duration-300">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="text-gray-400 hover:text-primary transition-colors p-2 bg-white/5 rounded-lg hover:bg-primary/10 border border-white/5"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setLoginModalOpen(true)}
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" /> Login
                                </button>
                                <Link to="/marketplace">
                                    <Button variant="primary" className="text-sm px-6 py-2 rounded-full">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-background border-b border-white/5 overflow-hidden"
                        >
                            <div className="flex flex-col p-6 gap-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="text-2xl font-bold text-gray-300 hover:text-primary"
                                        onClick={(e) => {
                                            handleScrollLink(e, link.href);
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {user && (
                                    <Link
                                        to="/orders"
                                        className={`text-2xl font-bold ${location.pathname === '/orders' ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                )}
                                {user ? (
                                    <div className="flex items-center gap-4 py-4 border-t border-white/5">
                                        <Link to="/account" className="flex items-center gap-4 flex-1" onClick={() => setMobileMenuOpen(false)}>
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-primary/30 object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                                                    <User className="w-6 h-6 text-primary" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white font-bold text-lg">{user.displayName}</p>
                                                <p className="text-gray-500 text-xs tracking-wider uppercase font-medium">View Dashboard</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="text-primary p-3 bg-primary/10 rounded-2xl border border-primary/20 active:scale-95 transition-transform"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                setLoginModalOpen(true);
                                            }}
                                            className="w-full py-4 text-center font-bold text-gray-300 border border-white/10 rounded-2xl flex items-center justify-center gap-2"
                                        >
                                            <LogIn className="w-5 h-5" /> Login
                                        </button>
                                        <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full py-4 rounded-2xl">Get Started</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </>
    );
};

export default Navbar;
