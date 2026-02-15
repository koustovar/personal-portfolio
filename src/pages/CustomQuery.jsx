import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
    Send,
    FileText,
    MessageSquare,
    Banknote,
    Link as LinkIcon,
    User,
    CheckCircle,
    Loader2,
    ArrowRight,
    HandCoins
} from 'lucide-react';
import Button from '../components/ui/Button';

const InputField = ({ label, icon: Icon, type = "text", ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <input
                {...props}
                type={type}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary focus:outline-none transition-all focus:bg-white/10 group-hover:border-white/20"
            />
        </div>
    </div>
);

const CustomQuery = () => {
    const { user, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const prefilledTitle = queryParams.get('template') || '';

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [formData, setFormData] = useState({
        title: prefilledTitle,
        description: '',
        budget: '',
        contact: user?.email || '',
        links: ''
    });

    useEffect(() => {
        if (prefilledTitle) {
            setFormData(prev => ({ ...prev, title: prefilledTitle }));
        }
    }, [prefilledTitle]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'queries'), {
                ...formData,
                contact: user.email,
                userId: user.uid,
                userName: user.displayName || 'Guest User',
                userPhoto: user.photoURL || '',
                budgetWithCurrency: `${currency} ${formData.budget}`,
                status: 'pending',
                timestamp: serverTimestamp()
            });
            setSubmitted(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error("Error submitting query:", error);
            alert("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center bg-surface/30 p-12 rounded-[3rem] border border-white/10 backdrop-blur-xl"
                >
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">SUCCESSFULLY <span className="text-primary">SENT</span></h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Your project query has been received. Our team will review your requirements and reach out to you via your registered email <span className="text-white font-bold">{user?.email}</span> shortly.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                        Redirecting to home <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505]">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                    >
                        START A <span className="text-primary">DEAL</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 max-w-2xl mx-auto"
                    >
                        Have a vision for a custom project? Tell us your requirements and let's build something exceptional together.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface/20 rounded-[3rem] border border-white/5 p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden"
                >
                    {/* Background glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        <InputField
                            label="Work Title"
                            icon={FileText}
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleInput}
                            placeholder="e.g. Modern E-commerce Dashboard"
                        />

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                Project Description
                            </label>
                            <div className="relative group">
                                <div className="absolute left-6 top-6 text-gray-500 group-focus-within:text-primary transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInput}
                                    rows={5}
                                    placeholder="Tell us everything about the project requirements..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 focus:border-primary focus:outline-none transition-all focus:bg-white/10 group-hover:border-white/20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                Budget Range
                            </label>
                            <div className="flex gap-4">
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <option value="USD" className="bg-[#050505]">USD ($)</option>
                                    <option value="INR" className="bg-[#050505]">INR (₹)</option>
                                </select>
                                <div className="relative flex-1 group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInput}
                                        placeholder="500"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary focus:outline-none transition-all focus:bg-white/10 group-hover:border-white/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <InputField
                            label="Image Links / Useful Links"
                            icon={LinkIcon}
                            name="links"
                            value={formData.links}
                            onChange={handleInput}
                            placeholder="Drop a link to your inspiration or references"
                        />

                        <div className="pt-6">
                            <Button
                                disabled={loading}
                                className="w-full py-5 text-xl font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(222,28,28,0.3)] group"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        SEND QUERY <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-gray-600 text-[10px] mt-6 font-bold uppercase tracking-[0.2em]">
                                We typically respond within 12-24 hours.
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Login Modal */}
            <AnimatePresence>
                {showLoginModal && !user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center px-6"
                    >
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setShowLoginModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#0a0a0a] p-10 md:p-12 rounded-[3rem] border border-white/10 max-w-lg w-full text-center shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <HandCoins className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 italic tracking-tighter uppercase font-mono">AUTHENTICATION <span className="text-primary">REQUIRED</span></h2>
                            <p className="text-gray-500 mb-10 leading-relaxed text-sm">
                                Please sign in to initiate a custom project deal. This helps us secure your contact details and project requirements.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            await loginWithGoogle();
                                            setShowLoginModal(false);
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                    className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                                    Sign In with Google
                                </button>
                                <button
                                    onClick={() => setShowLoginModal(false)}
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

export default CustomQuery;
