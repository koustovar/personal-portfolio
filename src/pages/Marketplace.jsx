import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Layout, Smartphone, Globe, Filter, Search, Loader2, ArrowRight, ShieldCheck, Zap, HandCoins, Eye, Star, MessageSquare, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

const Marketplace = () => {
    const navigate = useNavigate();
    const { user, loginWithGoogle } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [ordering, setOrdering] = useState(null);

    // Mock initial data if Firestore is empty
    const initialTemplates = [
        {
            id: 't1',
            title: 'Modern Portfolio Luxe',
            category: 'portfolio',
            price: 49,
            image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop',
            description: 'A premium, ultra-fast portfolio template for creatives and developers.',
            features: ['Vite + React', 'Framer Motion', 'Tailwind CSS', 'Responsive'],
            rating: 4.9
        },
        {
            id: 't2',
            title: 'E-Shop Pro',
            category: 'ecommerce',
            price: 99,
            image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2089&auto=format&fit=crop',
            description: 'Full-featured e-commerce solution with cart, search, and dashboard.',
            features: ['Stripe Ready', 'Inventory Mgmt', 'SEO Optimized', 'Fast Load'],
            rating: 4.8
        },
        {
            id: 't3',
            title: 'SaaS Launchpad',
            category: 'business',
            price: 79,
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
            description: 'Convert visitors into customers with this high-converting SaaS landing page.',
            features: ['Pricing Tables', 'User Dashboard', 'Analytics', 'Blog Ready'],
            rating: 5.0
        }
    ];

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'templates'));
                if (querySnapshot.empty) {
                    setTemplates(initialTemplates);
                } else {
                    setTemplates(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
                setIsError(true);
                setTemplates(initialTemplates);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleBuy = (template) => {
        if (!user) {
            setOrdering(template);
            return;
        }
        if (template.deliveryType === 'query') {
            navigate(`/custom-query?template=${encodeURIComponent(template.title)}`);
        } else {
            navigate(`/checkout/${template.id}`);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const title = t.title || "";
        const category = t.category || "";
        const matchesFilter = filter === 'all' || category === filter;
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#050505]">
            {/* Hero Section */}
            <div className="container mx-auto px-6 mb-16">
                <div className="max-w-3xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Premium <span className="text-primary">Assets</span> for Forward Thinkers
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 mb-8"
                    >
                        Ready-to-deploy high-performance websites and custom digital solutions. Secure your next project in seconds.
                    </motion.p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface/30 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-2 p-1.5 bg-black/50 rounded-2xl border border-white/5">
                        {['all', 'portfolio', 'ecommerce', 'business'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Find your template..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Template Grid */}
            <div className="container mx-auto px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-gray-600 font-medium font-mono uppercase tracking-[0.3em]">Syncing Marketplace...</p>
                    </div>
                ) : isError && templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <ShieldCheck className="w-16 h-16 text-red-500/50 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Sync Interrupted</h3>
                        <p className="text-gray-500 max-w-sm mb-8">We couldn't connect to the marketplace. Please check your connection or try again later.</p>
                        <Button onClick={() => window.location.reload()}>Retry Connection</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredTemplates.map((template, index) => (
                                <motion.div
                                    key={template.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="group flex flex-col bg-surface/20 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-primary/20 transition-all duration-500 hover:translate-y-[-10px] shadow-2xl"
                                >
                                    {/* Image Container */}
                                    <Link to={`/marketplace/${template.id}`} className="relative h-64 overflow-hidden block">
                                        <img
                                            src={template.thumbnail || template.image ? `${(template.thumbnail || template.image).split('?')[0]}?q=80&w=600&auto=format&fm=webp&fit=crop` : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'}
                                            alt={template.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-black/60 backdrop-blur-md text-white border border-white/10">
                                                {template.category}
                                            </span>
                                            {template.deliveryType === 'query' ? (
                                                <div className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/80 text-white flex items-center gap-1 backdrop-blur-md uppercase">
                                                    <MessageSquare className="w-3 h-3" /> Build Request
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 rounded-full text-[10px] font-black bg-yellow-500/80 text-black flex items-center gap-1 backdrop-blur-md">
                                                    <Star className="w-3 h-3 fill-current" /> {template.rating || '5.0'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute bottom-6 right-6">
                                            <div className="bg-primary text-white font-black px-6 py-2 rounded-2xl text-xl shadow-2xl transform group-hover:scale-110 transition-transform">
                                                ${template.price}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <Link to={`/marketplace/${template.id}`}>
                                            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary transition-colors leading-tight">{template.title}</h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{template.description}</p>

                                        {/* Features List */}
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
                                            {(template.features || []).slice(0, 4).map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> {f}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex gap-3">
                                            <Link to={`/marketplace/${template.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full py-3.5 rounded-2xl border-white/5 hover:border-primary text-sm flex items-center justify-center gap-2">
                                                    <Eye className="w-4 h-4" /> Details
                                                </Button>
                                            </Link>
                                            <Button
                                                onClick={() => handleBuy(template)}
                                                className={`flex-[1.5] py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-black ${template.deliveryType === 'query' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                            >
                                                {template.deliveryType === 'query' ? (
                                                    <>
                                                        Send Query <Send className="w-4 h-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Buy Now <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Custom Project CTA */}
            <div className="container mx-auto px-6 mt-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-primary/10 border border-primary/20 rounded-[3rem] p-12 text-center relative overflow-hidden group"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-colors" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">Got a <span className="text-primary underline decoration-primary/30">Custom</span> Legend?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
                            If you need something built from scratch that isn't in our marketplace, let's negotiate a custom deal tailored to your exact vision.
                        </p>
                        <Link to="/custom-query">
                            <Button className="px-10 py-5 text-xl font-black rounded-2xl shadow-[0_10px_30px_rgba(222,28,28,0.2)]">
                                Send Project Query <ArrowRight className="ml-2 w-6 h-6" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Auth Modal requirement */}
            <AnimatePresence>
                {ordering && !user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center px-6"
                    >
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setOrdering(null)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#0a0a0a] p-10 md:p-12 rounded-[3rem] border border-white/10 max-w-lg w-full text-center shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <HandCoins className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">AUTHENTICATION <span className="text-primary">REQUIRED</span></h2>
                            <p className="text-gray-500 mb-10 leading-relaxed">
                                Join the elite circle of digital creators. Please sign in to proceed with the acquisition of <span className="text-white font-bold">"{ordering.title}"</span>.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            await loginWithGoogle();
                                            setOrdering(null);
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                    className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                                    Sign In with Google
                                </button>
                                <button
                                    onClick={() => setOrdering(null)}
                                    className="w-full py-2 text-gray-600 font-bold hover:text-white transition-colors text-xs uppercase tracking-widest"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Marketplace;
