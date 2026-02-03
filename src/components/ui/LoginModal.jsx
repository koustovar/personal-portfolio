import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LogIn, X, Mail } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            onClose();
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-6"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-[#0a0a0a] p-8 md:p-12 rounded-[2.5rem] border border-white/10 max-w-md w-full text-center shadow-2xl overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                            <LogIn className="w-10 h-10 text-primary" />
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-400 mb-10 leading-relaxed">
                            Sign in to access your dashboard, track your orders, and explore premium digital assets.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                        Continue with Google
                                    </>
                                )}
                            </button>

                            <div className="pt-6">
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                                    Trusted by developers worldwide
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
