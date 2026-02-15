import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    Settings,
    Plus,
    Search,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2,
    MessageSquare
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import Button from '../../components/ui/Button';

import AddTemplateModal from '../../components/admin/AddTemplateModal';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
                <Icon className={`w-6 h-6 text-${color}-500`} />
            </div>
            {trend && (
                <span className={`text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <TrendingUp className="w-3 h-3" /> {trend}%
                </span>
            )}
        </div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        revenue: '$0',
        orders: '0',
        customers: '0',
        templates: '0',
        queries: '0'
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch Recent Orders
            const ordersQuery = query(collection(db, 'orders'), orderBy('timestamp', 'desc'), limit(10));
            const ordersSnap = await getDocs(ordersQuery);
            const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentOrders(ordersData);

            // Calculate Stats
            const allOrdersSnap = await getDocs(collection(db, 'orders'));
            const totalRevenue = allOrdersSnap.docs.reduce((sum, doc) => sum + (doc.data().price || 0), 0);

            const customersSnap = await getDocs(collection(db, 'users'));
            const templatesSnap = await getDocs(collection(db, 'templates'));
            const queriesSnap = await getDocs(collection(db, 'queries'));

            setStats({
                revenue: `$${totalRevenue.toLocaleString()}`,
                orders: allOrdersSnap.size.toString(),
                customers: customersSnap.size.toString(),
                templates: templatesSnap.size.toString(),
                queries: queriesSnap.size.toString()
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [refreshTrigger]);

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to delete this order record?")) {
            try {
                await deleteDoc(doc(db, 'orders', orderId));
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const filteredOrders = recentOrders.filter(order =>
        (order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (order.userEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (order.templateTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505] px-6">
            <AddTemplateModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTemplate(null);
                }}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                editingTemplate={editingTemplate}
            />

            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Admin <span className="text-primary">Terminal</span></h1>
                        <p className="text-gray-500 font-medium">Monitoring Furious.in ecosystem performance.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="rounded-2xl border-white/5" onClick={() => fetchDashboardData()}>
                            <Clock className="w-4 h-4 mr-2" /> Sync Data
                        </Button>
                        <Button className="rounded-2xl" onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> New Template
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 text-nowrap">
                    <StatCard title="Total Revenue" value={stats.revenue} icon={TrendingUp} trend={12} color="primary" />
                    <StatCard title="Active Orders" value={stats.orders} icon={ShoppingCart} trend={8} color="blue" />
                    <StatCard title="Total Users" value={stats.customers} icon={Users} trend={15} color="purple" />
                    <StatCard title="Live Assets" value={stats.templates} icon={Package} color="yellow" />
                    <StatCard title="Project Queries" value={stats.queries} icon={MessageSquare} color="green" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-primary" /> Recent Transactions
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/40 border border-white/5 rounded-xl py-2 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">
                                            <th className="px-8 py-5">Customer</th>
                                            <th className="px-8 py-5">Product</th>
                                            <th className="px-8 py-5">Amount</th>
                                            <th className="px-8 py-5">Email Status</th>
                                            <th className="px-8 py-5">Order Status</th>
                                            <th className="px-8 py-5">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-center">
                                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5 text-left">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{order.customerName || 'Guest User'}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{order.userEmail}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs text-gray-300 font-medium">{order.templateTitle}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm font-bold text-primary">${order.price}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center">
                                                        {order.emailSent ? (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                                                <CheckCircle className="w-3 h-3" /> Delivered
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-pulse">
                                                                <AlertCircle className="w-3 h-3" /> Failed
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center">
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                                            <CheckCircle className="w-3 h-3" /> {order.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <AlertCircle className="w-10 h-10 text-gray-600 mb-4" />
                                                        <p className="text-gray-500 font-medium">No transactions matching your search.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / System Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem]">
                            <h3 className="text-lg font-bold text-white mb-6">Service Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Firebase Auth</span>
                                    <span className="flex items-center gap-2 text-green-500 font-bold">
                                        Active <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Firestore DB</span>
                                    <span className="flex items-center gap-2 text-green-500 font-bold">
                                        Stable <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Razorpay API</span>
                                    <span className="flex items-center gap-2 text-primary font-bold">
                                        Live <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface/20 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all text-center"
                                >
                                    View Users
                                </button>
                                <button
                                    onClick={() => navigate('/admin/products')}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all text-center"
                                >
                                    Manage Products
                                </button>
                                <button
                                    onClick={() => navigate('/admin/selected-works')}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all text-center"
                                >
                                    Selected Works
                                </button>
                                <button
                                    onClick={() => navigate('/admin/queries')}
                                    className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all text-center flex flex-col items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Project Queries</span>
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all text-center"
                                >
                                    Add Asset
                                </button>
                                <button
                                    onClick={() => window.open('https://dashboard.razorpay.com/', '_blank')}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all text-center"
                                >
                                    Razorpay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
