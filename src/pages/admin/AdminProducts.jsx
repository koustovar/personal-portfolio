import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package,
    Search,
    ArrowLeft,
    Trash2,
    Edit,
    AlertCircle,
    Loader2,
    DollarSign,
    Eye,
    Plus
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Button from '../../components/ui/Button';
import AddTemplateModal from '../../components/admin/AddTemplateModal';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const templatesSnap = await getDocs(collection(db, 'templates'));
            const templatesData = templatesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by creation date if available
            templatesData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            });

            setTemplates(templatesData);
        } catch (error) {
            console.error("Error fetching templates:", error);
            alert("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleDeleteTemplate = async (templateId, templateTitle) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete this product?\n\nTitle: ${templateTitle}\n\nThis action cannot be undone!`
        );

        if (!confirmDelete) return;

        setDeleting(templateId);
        try {
            await deleteDoc(doc(db, 'templates', templateId));
            alert("Product deleted successfully!");
            await fetchTemplates();
        } catch (error) {
            console.error("Error deleting template:", error);
            alert(`Failed to delete product: ${error.message}`);
        } finally {
            setDeleting(null);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleRefresh = () => {
        fetchTemplates();
    };

    const filteredTemplates = templates.filter(template =>
        (template.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (template.category?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (template.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalProducts = templates.length;
    const totalValue = templates.reduce((sum, t) => sum + (t.price || 0), 0);
    const avgPrice = totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : 0;

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505] px-6">
            <AddTemplateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onRefresh={handleRefresh}
                editingTemplate={editingTemplate}
            />

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
                                Product <span className="text-primary">Management</span>
                            </h1>
                            <p className="text-gray-500 font-medium mt-2">
                                Edit, update, and manage all marketplace products
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="rounded-2xl border-white/5"
                                onClick={fetchTemplates}
                            >
                                <Loader2 className="w-4 h-4 mr-2" /> Refresh
                            </Button>
                            <Button
                                className="rounded-2xl"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Products</p>
                                <h3 className="text-3xl font-black text-white">{totalProducts}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Value</p>
                                <h3 className="text-3xl font-black text-white">${totalValue}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface/20 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <DollarSign className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Avg Price</p>
                                <h3 className="text-3xl font-black text-white">${avgPrice}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-surface/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Package className="w-5 h-5 text-primary" /> All Products
                        </h3>
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search products..."
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
                                        <th className="px-8 py-5">Product</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5">Price</th>
                                        <th className="px-8 py-5">Rating</th>
                                        <th className="px-8 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredTemplates.length > 0 ? (
                                        filteredTemplates.map((template) => (
                                            <motion.tr
                                                key={template.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                                                            <img
                                                                src={template.thumbnail || template.image || ''}
                                                                alt={template.title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><Package class="w-6 h-6 text-gray-600" /></div>';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-white truncate">
                                                                {template.title || 'Untitled'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 font-medium truncate max-w-[300px]">
                                                                {template.description || 'No description'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20 inline-block">
                                                        {template.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-green-500" />
                                                        <span className="text-lg font-bold text-white">
                                                            {template.price || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500">⭐</span>
                                                        <span className="text-sm font-bold text-gray-300">
                                                            {template.rating || 5.0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => window.open(`/marketplace/${template.id}`, '_blank')}
                                                            className="text-gray-600 hover:text-blue-500 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
                                                            title="View product"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditTemplate(template)}
                                                            className="text-gray-600 hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-lg"
                                                            title="Edit product"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTemplate(template.id, template.title)}
                                                            disabled={deleting === template.id}
                                                            className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete product"
                                                        >
                                                            {deleting === template.id ? (
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
                                                        {searchQuery ? 'No products matching your search.' : 'No products found in the marketplace.'}
                                                    </p>
                                                    {!searchQuery && (
                                                        <Button
                                                            className="mt-6 rounded-2xl"
                                                            onClick={() => setIsModalOpen(true)}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" /> Add Your First Product
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
