import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Star,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle,
    Eye,
    Package
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import Button from '../../components/ui/Button';

const AdminSelectedWorks = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [selectedWorks, setSelectedWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const MAX_SELECTED = 4;

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all templates
            const templatesSnap = await getDocs(collection(db, 'templates'));
            const templatesData = templatesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTemplates(templatesData);

            // Fetch current selected works (featured projects)
            const projectsQuery = query(
                collection(db, 'projects'),
                where('featured', '==', true)
            );
            const projectsSnap = await getDocs(projectsQuery);
            const selectedData = projectsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSelectedWorks(selectedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isSelected = (templateId) => {
        return selectedWorks.some(work => work.templateId === templateId);
    };

    const handleToggleSelection = async (template) => {
        if (isSelected(template.id)) {
            // Remove from selected works
            setSaving(true);
            try {
                // Find and delete the project document
                const workToRemove = selectedWorks.find(w => w.templateId === template.id);
                if (workToRemove) {
                    await deleteDoc(doc(db, 'projects', workToRemove.id));
                    setSelectedWorks(prev => prev.filter(w => w.templateId !== template.id));
                }
            } catch (error) {
                console.error("Error removing from selected works:", error);
                alert(`Failed to remove: ${error.message}`);
            } finally {
                setSaving(false);
            }
        } else {
            // Add to selected works (if under limit)
            if (selectedWorks.length >= MAX_SELECTED) {
                alert(`You can only select up to ${MAX_SELECTED} products for Selected Works.`);
                return;
            }

            setSaving(true);
            try {
                // Create a new project document
                const projectData = {
                    templateId: template.id,
                    title: template.title,
                    description: template.description,
                    category: template.category,
                    image: template.thumbnail || template.image,
                    featured: true,
                    order: selectedWorks.length, // Order by selection sequence
                    liveUrl: `/marketplace/${template.id}`,
                    githubUrl: null // Optional: can be added later
                };

                // Use template ID as document ID for consistency
                await setDoc(doc(db, 'projects', template.id), projectData);

                setSelectedWorks(prev => [...prev, { id: template.id, ...projectData }]);
            } catch (error) {
                console.error("Error adding to selected works:", error);
                alert(`Failed to add: ${error.message}`);
            } finally {
                setSaving(false);
            }
        }
    };

    const filteredTemplates = templates.filter(template =>
        (template.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (template.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

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
                                Selected <span className="text-primary">Works</span>
                            </h1>
                            <p className="text-gray-500 font-medium mt-2">
                                Choose up to {MAX_SELECTED} products to showcase on homepage
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-surface/20 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-xl">
                                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Selected</p>
                                <p className="text-2xl font-black text-primary">
                                    {selectedWorks.length}/{MAX_SELECTED}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-2xl border-white/5"
                                onClick={fetchData}
                            >
                                <Loader2 className="w-4 h-4 mr-2" /> Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mb-8 bg-primary/5 border border-primary/20 rounded-2xl p-6">
                    <div className="flex gap-4">
                        <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-1">How it works</h4>
                            <p className="text-xs text-gray-400">
                                Click on any product card below to add it to "Selected Works" section on your homepage.
                                You can select up to {MAX_SELECTED} products. Click again to remove them.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface/20 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary/50 backdrop-blur-xl"
                    />
                </div>

                {loading ? (
                    <div className="p-20 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => {
                                const selected = isSelected(template.id);
                                return (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`relative rounded-[2rem] overflow-hidden border transition-all cursor-pointer group ${selected
                                                ? 'border-primary ring-4 ring-primary/20 bg-primary/5'
                                                : 'border-white/5 hover:border-primary/50 bg-surface/20'
                                            }`}
                                        onClick={() => !saving && handleToggleSelection(template)}
                                    >
                                        {/* Selected Badge */}
                                        {selected && (
                                            <div className="absolute top-4 right-4 z-10 bg-primary text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Featured
                                            </div>
                                        )}

                                        {/* Image */}
                                        <div className="aspect-video overflow-hidden bg-white/5">
                                            <img
                                                src={template.thumbnail || template.image || ''}
                                                alt={template.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><div class="text-gray-600"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg></div></div>';
                                                }}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                                                    {template.category || 'General'}
                                                </span>
                                                <span className="text-gray-500 text-sm font-bold">
                                                    ${template.price || 0}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                                                {template.title || 'Untitled'}
                                            </h3>
                                            <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                                                {template.description || 'No description available'}
                                            </p>

                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/marketplace/${template.id}`, '_blank');
                                                    }}
                                                    className="text-gray-500 hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-lg"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <div className={`text-xs font-bold uppercase tracking-wider ${selected ? 'text-primary' : 'text-gray-500 group-hover:text-white'
                                                    }`}>
                                                    {selected ? 'Click to Remove' : 'Click to Add'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Loading Overlay */}
                                        {saving && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <AlertCircle className="w-10 h-10 text-gray-600 mb-4 mx-auto" />
                                <p className="text-gray-500 font-medium">
                                    {searchQuery ? 'No products matching your search.' : 'No products available. Add products first from the Products page.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSelectedWorks;
