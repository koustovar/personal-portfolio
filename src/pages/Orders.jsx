import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { Package, Calendar, Clock, ExternalLink, ArrowLeft, Search, Filter, CheckCircle, Clock4, AlertCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const Orders = () => {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

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
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchOrders();
        }
    }, [user, authLoading]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.templateTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-background px-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-8">You need to be logged in to view your orders. Please sign in to continue.</p>
                    <Link to="/marketplace">
                        <Button className="w-full">Return to Marketplace</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505]">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-sm group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                        </motion.button>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold text-white"
                        >
                            My <span className="text-primary">Orders</span>
                        </motion.h1>
                        <p className="text-gray-500 mt-2">Track and manage your purchased templates and assets.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors w-full md:w-64"
                            />
                        </div>
                        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                            {['all', 'pending', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === status ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-32 bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-[3rem]">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShieldCheck className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Permission Denied</h2>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                            We encountered a security restriction while fetching your orders. Please ensure your Firestore rules allow read access to the 'orders' collection.
                        </p>
                        <Button onClick={() => window.location.reload()} className="px-10 py-4 text-lg">Retry Sync</Button>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-surface/20 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/20 transition-all duration-300"
                                >
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                                                <Package className="w-8 h-8 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{order.templateTitle}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.2em] border ${order.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {order.timestamp?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        Order ID: #{order.id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                                            <div className="text-left md:text-right hidden sm:block">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Customer</p>
                                                <p className="text-sm font-bold text-white">{order.customerName || user.displayName}</p>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Investment</p>
                                                <p className="text-3xl font-black text-white">${order.price}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-white/10 hover:border-primary group/btn">
                                                    <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed breakdown for 'Real' marketplace experience */}
                                    {(order.shippingAddress || order.deliveryEmail) && (
                                        <div className="px-8 pb-8 pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white/[0.01] border-t border-white/5">
                                            {order.deliveryEmail && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Delivery Email</p>
                                                    <p className="text-sm text-gray-300 font-medium">{order.deliveryEmail}</p>
                                                </div>
                                            )}
                                            {order.shippingAddress && (
                                                <div className="space-y-1 col-span-1 sm:col-span-2">
                                                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Delivery Address</p>
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Progress line for status */}
                                    <div className="h-1 w-full bg-white/5 relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: order.status === 'completed' ? '100%' : '30%' }}
                                            className={`h-full absolute left-0 top-0 ${order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem]"
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Package className="w-12 h-12 text-gray-700" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">No Orders Found</h2>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                            It looks like you haven't placed any orders yet. Head over to our marketplace to find your perfect website template.
                        </p>
                        <Link to="/marketplace">
                            <Button className="px-10 py-4 text-lg">Browse Marketplace</Button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Orders;
