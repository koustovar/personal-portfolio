import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User, Package, Calendar, Clock, ExternalLink, Mail, Shield, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';

const Account = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'orders'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );
                const querySnapshot = await getDocs(q);
                setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchOrders();
        }
    }, [user, authLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-medium animate-pulse">Authenticating...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-12 bg-surface/20 rounded-[2.5rem] border border-white/5 backdrop-blur-xl max-w-md w-full"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Secret Access</h2>
                    <p className="text-gray-400 mb-8">Please log in to your account to view your project dashboard and order history.</p>
                    <div className="grid grid-cols-1 gap-4">
                        <Link to="/login">
                            <Button className="w-full py-4 text-lg">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="outline" className="w-full py-4 text-lg">Create Account</Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-background">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Sidebar / Profile Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-surface/30 p-8 rounded-3xl border border-white/5 backdrop-blur-xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName} className="w-24 h-24 rounded-full border-2 border-primary shadow-lg shadow-primary/20" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                                            <User className="w-10 h-10 text-primary" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-[#050505]" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">{user.displayName}</h2>
                                <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>

                                <div className="w-full pt-6 border-t border-white/5 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Account Type</span>
                                        <span className="text-primary font-bold uppercase tracking-wider text-[10px] bg-primary/10 px-2 py-1 rounded border border-primary/20 flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Customer
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Member Since</span>
                                        <span className="text-white">{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => logout()}
                                    className="w-full mt-8 border-red-500/20 text-red-400 hover:bg-red-500/10"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content / Orders */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface/30 p-8 rounded-3xl border border-white/5 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Package className="w-6 h-6 text-primary" /> My Orders
                                </h3>
                                <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-gray-400">
                                    {orders.length} total orders
                                </span>
                            </div>

                            {loading ? (
                                <div className="py-20 text-center">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400">Loading your orders...</p>
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="group p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all duration-300">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-lg font-bold text-white">{order.templateTitle}</h4>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                            'bg-green-500/10 text-green-500 border border-green-500/20'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {order.timestamp?.toDate().toLocaleDateString() || 'Recently'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            ID: {order.id.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-6">
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Amount</p>
                                                        <p className="text-xl font-bold text-white">${order.price}</p>
                                                    </div>
                                                    <Button variant="outline" className="p-2 h-10 w-10">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <ShoppingBag className="w-10 h-10 text-gray-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2">Collection Empty</h4>
                                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">Explore our premium templates and start your next project today.</p>
                                    <Link to="/marketplace" className="inline-block">
                                        <Button variant="primary" className="px-10">
                                            Browse Marketplace
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Account;
