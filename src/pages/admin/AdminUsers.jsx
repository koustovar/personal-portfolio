import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    ArrowLeft,
    Trash2,
    Mail,
    Calendar,
    AlertCircle,
    Loader2,
    UserCheck,
    Shield
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { deleteUser as deleteAuthUser } from 'firebase/auth';
import Button from '../../components/ui/Button';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleting, setDeleting] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersData = usersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt || null
            }));

            // Sort by creation date (newest first)
            usersData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            });

            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, userEmail) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete this user?\n\nEmail: ${userEmail}\n\nThis will:\n• Delete user from Firestore\n• Delete user from Firebase Authentication\n• This action cannot be undone!`
        );

        if (!confirmDelete) return;

        setDeleting(userId);
        try {
            // Delete from Firestore
            await deleteDoc(doc(db, 'users', userId));

            // Note: Deleting from Firebase Auth requires admin privileges
            // In production, this should be done via a Cloud Function with Admin SDK
            console.log(`User ${userId} deleted from Firestore. Auth deletion requires backend.`);

            alert("User deleted successfully from Firestore.\n\nNote: To fully delete from Firebase Authentication, you'll need to implement a Cloud Function with Admin SDK.");

            // Refresh the list
            await fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(`Failed to delete user: ${error.message}`);
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const filteredUsers = users.filter(user =>
        (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.lastDeliveryEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalUsers = users.length;
    const usersWithOrders = users.filter(u => u.lastDeliveryEmail).length;

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505] px-6">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                                User <span className="text-primary">Management</span>
                            </h1>
                            <p className="text-gray-500 font-medium mt-2">
                                View and manage all registered users
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-2xl border-white/5"
                            onClick={fetchUsers}
                        >
                            <Loader2 className="w-4 h-4 mr-2" /> Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Users</p>
                                <h3 className="text-3xl font-black text-white">{totalUsers}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <UserCheck className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Customers</p>
                                <h3 className="text-3xl font-black text-white">{usersWithOrders}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                                <Shield className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">New Users</p>
                                <h3 className="text-3xl font-black text-white">
                                    {users.filter(u => u.createdAt && (Date.now() - u.createdAt.toMillis() < 30 * 24 * 60 * 60 * 1000)).length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-surface/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" /> All Users
                        </h3>
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-black/40 border border-white/5 rounded-xl py-2 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 w-full md:w-80"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                        <th className="px-8 py-5">User</th>
                                        <th className="px-8 py-5">Email</th>
                                        <th className="px-8 py-5">Registered</th>
                                        <th className="px-8 py-5">Last Delivery Email</th>
                                        <th className="px-8 py-5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                            <span className="text-primary font-bold text-sm">
                                                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">
                                                                {user.displayName || 'No Name'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 font-medium">
                                                                ID: {user.id.slice(0, 8)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-300 font-medium">
                                                            {user.email || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-400">
                                                            {formatDate(user.createdAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm text-gray-400">
                                                        {user.lastDeliveryEmail || 'No orders yet'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                                            disabled={deleting === user.id}
                                                            className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete user"
                                                        >
                                                            {deleting === user.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <AlertCircle className="w-10 h-10 text-gray-600 mb-4" />
                                                    <p className="text-gray-500 font-medium">
                                                        {searchQuery ? 'No users matching your search.' : 'No users found in the database.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info Banner */}
                <div className="mt-8 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
                    <div className="flex gap-4">
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-yellow-500 mb-1">Important Note</h4>
                            <p className="text-xs text-gray-400">
                                User deletion from Firestore is immediate. However, deleting users from Firebase Authentication
                                requires backend implementation with Admin SDK (Cloud Functions). Consider implementing a proper
                                user deletion endpoint for production use.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
