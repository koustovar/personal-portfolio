import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, CheckCircle, Globe, Layout, ShieldCheck, Zap, ShoppingCart, Star, Clock, Smartphone } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const TemplateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);

    const initialTemplates = [
        {
            id: 't1',
            title: 'Modern Portfolio Luxe',
            category: 'portfolio',
            price: 49,
            image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop',
            description: 'A premium, ultra-fast portfolio template for creatives and developers. Designed to showcase your work with high-impact animations and sleek typography.',
            features: ['Vite + React', 'Framer Motion', 'Tailwind CSS', 'Next.js Compatible', 'SEO Optimized', 'Mobile First Design'],
            longDescription: 'Elevate your online presence with Modern Portfolio Luxe. This template is crafted for professionals who demand speed and style. It includes pre-built sections for work experience, project galleries, testimonials, and a dynamic contact form. Fully customizable and optimized for lighthouse scores.',
            rating: 4.9,
            reviews: 124,
            deliveryTime: '24-48 Hours'
        },
        {
            id: 't2',
            title: 'E-Shop Pro',
            category: 'ecommerce',
            price: 99,
            image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2089&auto=format&fit=crop',
            description: 'Full-featured e-commerce solution with cart, search, and dashboard. Ready to scale your business to the next level.',
            features: ['Stripe Integration', 'Inventory Management', 'User Authentication', 'Admin Dashboard', 'Analytics Tracking', 'Responsive Cart'],
            longDescription: 'E-Shop Pro is a powerhouse for online retailers. It features a complete shopping experience from product browsing to secure checkout. The backend is structured for easy inventory management and order tracking. Perfect for fashion, electronics, or digital goods.',
            rating: 4.8,
            reviews: 89,
            deliveryTime: '3-5 Days'
        },
        {
            id: 't3',
            title: 'SaaS Launchpad',
            category: 'business',
            price: 79,
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
            description: 'Convert visitors into customers with this high-converting SaaS landing page. Includes everything you need to launch your startup.',
            features: ['Pricing Tables', 'User Dashboard', 'Feature Grids', 'Blog System', 'Waitlist Integration', 'Fast Page Load'],
            longDescription: 'SaaS Launchpad is designed for conversion. With its clean layout and strategic CTA placements, it helps startups explain complex products simply. It includes multiple landing page variants, a pricing section with monthly/yearly toggles, and a robust FAQ section.',
            rating: 5.0,
            reviews: 56,
            deliveryTime: '2-3 Days'
        }
    ];

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const docRef = doc(db, 'templates', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTemplate({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // Fallback to initial data if not in firestore
                    const found = initialTemplates.find(t => t.id === id);
                    if (found) {
                        setTemplate(found);
                    } else {
                        navigate('/marketplace');
                    }
                }
            } catch (error) {
                console.error("Error fetching template:", error);
                const found = initialTemplates.find(t => t.id === id);
                if (found) setTemplate(found);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] px-6">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                    <Zap className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-xs text-center">We couldn't retrieve the details for this project. Please check back later or contact support.</p>
                <Link to="/marketplace">
                    <Button>Return to Marketplace</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505]">
            <div className="container mx-auto px-6">
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Image & Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl">
                            <img
                                src={template.image}
                                alt={template.title}
                                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="rounded-2xl overflow-hidden border border-white/5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                    <img src={template.image} alt="" className="w-full h-24 object-cover" />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Info & Purchase */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-[10px] uppercase font-black bg-primary/10 text-primary border border-primary/20 tracking-widest">
                                    {template.category}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold">{template.rating}</span>
                                    <span className="text-gray-500 text-xs text-nowrap">({template.reviews} reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                {template.title}
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8">
                                {template.description}
                            </p>
                        </div>

                        <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <p className="text-gray-500 text-sm uppercase font-bold tracking-widest mb-1">One-time Investment</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-white">${template.price}</span>
                                        <span className="text-gray-500 line-through font-medium">$199</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-green-500 font-bold mb-1">
                                        <Clock className="w-4 h-4" /> {template.deliveryTime || 'Instant'}
                                    </div>
                                    <p className="text-gray-500 text-xs">Handover Time</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Link to={`/checkout/${template.id}`}>
                                    <Button className="w-full py-4 text-xl rounded-2xl flex items-center justify-center gap-3 shadow-xl">
                                        <ShoppingCart className="w-6 h-6" /> Buy Template Now
                                    </Button>
                                </Link>
                                <p className="text-center text-gray-500 text-xs">
                                    100% Secure Checkout • Instant Access • Full Source Code
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" /> Core Features
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {template.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom: Tabs/Description */}
                <div className="mt-24">
                    <div className="border-b border-white/10 mb-12">
                        <div className="flex gap-12">
                            <button className="pb-4 border-b-2 border-primary text-white font-bold">Project Overview</button>
                            <button className="pb-4 text-gray-500 hover:text-white transition-colors">Documentation</button>
                            <button className="pb-4 text-gray-500 hover:text-white transition-colors">Customization</button>
                        </div>
                    </div>
                    <div className="max-w-4xl">
                        <h2 className="text-3xl font-bold text-white mb-8">Detailed Information</h2>
                        <div className="prose prose-invert prose-lg max-w-none text-gray-400">
                            <p className="leading-relaxed mb-6">
                                {template.longDescription}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <Smartphone className="w-8 h-8 text-primary mb-4" />
                                    <h4 className="text-white font-bold mb-2">Fully Responsive</h4>
                                    <p className="text-sm">Optimized for every screen size, from mobile to desktop ultra-wide.</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <Layout className="w-8 h-8 text-primary mb-4" />
                                    <h4 className="text-white font-bold mb-2">Modern Stack</h4>
                                    <p className="text-sm">Built with the latest technologies for performance and maintainability.</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                                    <h4 className="text-white font-bold mb-2">Clean Code</h4>
                                    <p className="text-sm">Properly commented and structured code for easy modifications.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;
