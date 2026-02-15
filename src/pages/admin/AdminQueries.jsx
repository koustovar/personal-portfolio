import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
    MessageSquare,
    Clock,
    Banknote,
    Link as LinkIcon,
    Trash2,
    CheckCircle,
    ShieldCheck,
    User,
    ExternalLink,
    Filter,
    Calendar,
    Mail,
    Search as SearchIcon,
    X,
    MoreVertical
} from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminQueries = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuery, setSelectedQuery] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'queries'), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const queryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQueries(queryData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching queries:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, 'queries', id), { status });
            if (selectedQuery?.id === id) {
                setSelectedQuery({ ...selectedQuery, status });
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteQuery = async (id) => {
        if (!window.confirm("Are you sure you want to delete this query?")) return;
        try {
            await deleteDoc(doc(db, 'queries', id));
            if (selectedQuery?.id === id) setSelectedQuery(null);
        } catch (error) {
            console.error("Error deleting query:", error);
        }
    };

    const filteredQueries = queries.filter(q => {
        const matchesFilter = filter === 'all' || q.status === filter;
        const matchesSearch = q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'contacted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505]">
            <div className="container mx-auto px-6 max-w-[1400px]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter">PROJECT <span className="text-primary">QUERIES</span></h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Monitor and manage custom project requests</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search queries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-primary/50 w-64 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                            {['all', 'pending', 'contacted', 'completed'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Syncing Terminal...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* List View */}
                        <div className={`${selectedQuery ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
                            {filteredQueries.length === 0 ? (
                                <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                    <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-500">No queries found</h3>
                                </div>
                            ) : (
                                filteredQueries.map((q) => (
                                    <motion.div
                                        key={q.id}
                                        layoutId={q.id}
                                        onClick={() => setSelectedQuery(q)}
                                        className={`group relative p-6 rounded-[2rem] border transition-all cursor-pointer ${selectedQuery?.id === q.id ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/10' : 'bg-surface/30 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                    {q.userPhoto ? <img src={q.userPhoto} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-500" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold leading-none mb-1 group-hover:text-primary transition-colors">{q.title}</h3>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{q.userName}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(q.status)}`}>
                                                {q.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-primary" /> {q.budgetWithCurrency}</div>
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {q.timestamp?.toDate().toLocaleDateString()}</div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Detail View */}
                        <AnimatePresence>
                            {selectedQuery && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="lg:col-span-8 flex flex-col"
                                >
                                    <div className="sticky top-32 bg-surface/40 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-2xl overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8">
                                            <button onClick={() => setSelectedQuery(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-12">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <MessageSquare className="w-8 h-8 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white italic tracking-tight">{selectedQuery.title}</h2>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedQuery.status)}`}>
                                                        {selectedQuery.status}
                                                    </span>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">ID: {selectedQuery.id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                            <div className="space-y-8">
                                                <section>
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Description</h4>
                                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-gray-300 leading-relaxed text-sm">
                                                        {selectedQuery.description}
                                                    </div>
                                                </section>

                                                {selectedQuery.links && (
                                                    <section>
                                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Inspiration Links</h4>
                                                        <a
                                                            href={selectedQuery.links.startsWith('http') ? selectedQuery.links : `https://${selectedQuery.links}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl text-primary transition-all group"
                                                        >
                                                            <LinkIcon className="w-4 h-4" />
                                                            <span className="text-sm font-bold truncate flex-1">{selectedQuery.links}</span>
                                                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                        </a>
                                                    </section>
                                                )}
                                            </div>

                                            <div className="space-y-8">
                                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Client Matrix</h4>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                                                <User className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Client Name</p>
                                                                <p className="text-white font-bold">{selectedQuery.userName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                                                                <Mail className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Contact Matrix</p>
                                                                <p className="text-white font-bold">{selectedQuery.contact}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-green-500">
                                                                <Banknote className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Budget Protocol</p>
                                                                <p className="text-white font-black text-xl">{selectedQuery.budgetWithCurrency}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Action Matrix</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => updateStatus(selectedQuery.id, 'contacted')}
                                                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" /> Contacted
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(selectedQuery.id, 'completed')}
                                                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Finalize
                                                        </button>
                                                        <button
                                                            onClick={() => deleteQuery(selectedQuery.id)}
                                                            className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all mt-3"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Purge from System
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminQueries;
