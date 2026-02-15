import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Package, X, Loader2, Upload, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const AddTemplateModal = ({ isOpen, onClose, onRefresh, editingTemplate = null }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'portfolio',
        price: '',
        thumbnail: '',
        images: [''],
        description: '',
        features: '',
        deliveryLink: '',
        deliveryType: 'instant',
        rating: 5.0
    });

    useEffect(() => {
        if (editingTemplate) {
            setFormData({
                ...editingTemplate,
                thumbnail: editingTemplate.thumbnail || editingTemplate.image || '',
                images: editingTemplate.images || [editingTemplate.image] || [''],
                features: Array.isArray(editingTemplate.features) ? editingTemplate.features.join(', ') : editingTemplate.features,
                deliveryLink: editingTemplate.deliveryLink || '',
                deliveryType: editingTemplate.deliveryType || 'instant'
            });
        } else {
            setFormData({
                title: '',
                category: 'portfolio',
                price: '',
                thumbnail: '',
                images: [''],
                description: '',
                features: '',
                deliveryLink: '',
                deliveryType: 'instant',
                rating: 5.0
            });
        }
    }, [editingTemplate, isOpen]);

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        if (formData.images.length < 20) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
        }
    };

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages.length > 0 ? newImages : [''] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanImages = formData.images.filter(img => img.trim() !== '');
            const templateData = {
                ...formData,
                thumbnail: formData.thumbnail || cleanImages[0] || '',
                images: cleanImages,
                image: formData.thumbnail || cleanImages[0] || '', // Primary image for backward compatibility
                price: parseFloat(formData.price) || 0,
                rating: parseFloat(formData.rating) || 5.0,
                features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
                updatedAt: serverTimestamp()
            };

            if (editingTemplate) {
                const docRef = doc(db, 'templates', editingTemplate.id);
                await updateDoc(docRef, templateData);
            } else {
                await addDoc(collection(db, 'templates'), {
                    ...templateData,
                    createdAt: serverTimestamp()
                });
            }

            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error saving template:", error);
            alert("Failed to save template. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTemplate ? "Update Template" : "Add New Template"}
            icon={Package}
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Title</label>
                    <input
                        required
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Modern Portfolio Luxe"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none appearance-none"
                        >
                            <option value="portfolio">Portfolio</option>
                            <option value="ecommerce">E-Commerce</option>
                            <option value="business">Business</option>
                            <option value="saas">SaaS</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price (USD)</label>
                        <input
                            required
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="49"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Delivery Protocol</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'instant' }))}
                            className={`py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.deliveryType === 'instant' ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            <span className="font-black text-[10px] uppercase tracking-tighter">⚡ Instant Delivery</span>
                            <span className="text-[9px] opacity-60">Buy & Download Now</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'query' }))}
                            className={`py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.deliveryType === 'query' ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            <span className="font-black text-[10px] uppercase tracking-tighter">📩 Query System</span>
                            <span className="text-[9px] opacity-60">Send Deal Request</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <span>📸 Marketplace Thumbnail</span>
                        <span className="text-[9px] text-gray-600 normal-case tracking-normal">(Main card image)</span>
                    </label>
                    <div className="space-y-3">
                        <input
                            required
                            name="thumbnail"
                            value={formData.thumbnail}
                            onChange={handleChange}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                        />
                        {formData.thumbnail && (
                            <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                <img
                                    src={formData.thumbnail}
                                    alt="Thumbnail Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                        Asset Gallery (Max 20)
                        <span>{formData.images.length}/20</span>
                    </label>

                    <div className="space-y-3">
                        {formData.images.map((img, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            required
                                            value={img}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            placeholder={`Image URL #${index + 1}`}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                                        />
                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeImageField(index)}
                                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    {img && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {formData.images.length < 20 && (
                        <button
                            type="button"
                            onClick={addImageField}
                            className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-xs font-bold text-gray-500 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" /> Add Gallery Image
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                    <textarea
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Short compelling description..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none"
                    />
                </div>

                {formData.deliveryType === 'instant' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Delivery / Download Link (Sent to Customer)</label>
                        <input
                            required
                            name="deliveryLink"
                            value={formData.deliveryLink}
                            onChange={handleChange}
                            placeholder="e.g. https://drive.google.com/..."
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Features (comma separated)</label>
                    <input
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        placeholder="Vite + React, Framer Motion, Tailwind..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        className="flex-[2] py-4 rounded-2xl flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingTemplate ? "Update Asset" : "Deploy Asset"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTemplateModal;
