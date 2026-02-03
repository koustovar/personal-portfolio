import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    ChevronRight,
    CreditCard,
    MapPin,
    Phone,
    User,
    ShieldCheck,
    ArrowLeft,
    Lock,
    CheckCircle,
    Loader2,
    Calendar,
    ShoppingCart
} from 'lucide-react';
import Button from '../components/ui/Button';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: user?.displayName?.split(' ')[0] || '',
        lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    useEffect(() => {
        if (!user && !loading) {
            navigate('/marketplace');
            return;
        }

        const fetchTemplate = async () => {
            try {
                // Check if id is a mock ID or firestore ID
                const docRef = doc(db, 'templates', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTemplate({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // Mock data fallback
                    const mockTemplates = {
                        't1': { title: 'Modern Portfolio Luxe', price: 49, image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop' },
                        't2': { title: 'E-Shop Pro', price: 99, image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2089&auto=format&fit=crop' },
                        't3': { title: 'SaaS Launchpad', price: 79, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop' }
                    };
                    if (mockTemplates[id]) {
                        setTemplate({ id, ...mockTemplates[id] });
                    } else {
                        navigate('/marketplace');
                    }
                }
            } catch (error) {
                console.error("Error fetching template:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [id, user, navigate]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) {
            nextStep();
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create Order
            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                customerName: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip
                },
                templateId: template.id,
                templateTitle: template.title,
                price: template.price,
                status: 'pending',
                timestamp: serverTimestamp(),
                paymentMethod: 'Credit Card (Mock)'
            };

            const orderRef = await addDoc(collection(db, 'orders'), orderData);

            // 2. Update User Profile with address (optional)
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                lastAddress: formData.address,
                lastPhone: formData.phone
            }, { merge: true });

            // 3. Success redirect
            navigate('/orders');
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Something went wrong with your order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Template Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-xs text-center">The template you're looking for doesn't exist or is currently unavailable.</p>
                <Link to="/marketplace">
                    <Button>Return to Marketplace</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#050505]">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left: Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="mb-12">
                            <Link to={`/marketplace/${id}`} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-sm">
                                <ArrowLeft className="w-4 h-4" /> Back to Product
                            </Link>
                            <h1 className="text-4xl font-black text-white">Complete Your <span className="text-primary">Order</span></h1>
                        </div>

                        {/* Stepper Progress */}
                        <div className="flex items-center gap-4 mb-12">
                            {[1, 2, 3].map((s) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-2 ${step >= s ? 'text-primary' : 'text-gray-600'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-primary text-white' : 'bg-white/5 border border-white/10'}`}>
                                            {s}
                                        </div>
                                        <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">
                                            {s === 1 ? 'Contact' : s === 2 ? 'Shipping' : 'Payment'}
                                        </span>
                                    </div>
                                    {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-primary' : 'bg-white/5'}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                <User className="w-5 h-5 text-primary" /> Contact Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">First Name</label>
                                                    <input required name="firstName" value={formData.firstName} onChange={handleInput} type="text" placeholder="John" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Last Name</label>
                                                    <input required name="lastName" value={formData.lastName} onChange={handleInput} type="text" placeholder="Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                                                    <input required name="email" value={formData.email} disabled type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 opacity-50 cursor-not-allowed" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input required name="phone" value={formData.phone} onChange={handleInput} type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-primary" /> Delivery Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Street Address</label>
                                                    <input required name="address" value={formData.address} onChange={handleInput} type="text" placeholder="123 Digital Way" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">City</label>
                                                        <input required name="city" value={formData.city} onChange={handleInput} type="text" placeholder="Tech City" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">State</label>
                                                        <input required name="state" value={formData.state} onChange={handleInput} type="text" placeholder="NY" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Zip Code</label>
                                                        <input required name="zip" value={formData.zip} onChange={handleInput} type="text" placeholder="10001" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Card Number</label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input required name="cardNumber" value={formData.cardNumber} onChange={handleInput} type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Expiry Date</label>
                                                        <input required name="expiry" value={formData.expiry} onChange={handleInput} type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">CVC</label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input required name="cvc" value={formData.cvc} onChange={handleInput} type="password" placeholder="***" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary focus:outline-none transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        variant="outline"
                                        className="flex-1 py-4 rounded-2xl"
                                        disabled={isSubmitting}
                                    >
                                        Previous
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    className="flex-[2] py-4 rounded-2xl text-lg font-black group"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : step === 3 ? (
                                        <>Complete Purchase <CheckCircle className="w-5 h-5" /></>
                                    ) : (
                                        <>Continue to {step === 1 ? 'Shipping' : 'Payment'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                                <div className="flex gap-4 mb-6">
                                    <img src={template.image} className="w-20 h-20 rounded-2xl object-cover border border-white/5" alt={template.title} />
                                    <div>
                                        <h4 className="text-white font-bold leading-tight mb-1">{template.title}</h4>
                                        <p className="text-xs text-gray-500">Professional License</p>
                                        <p className="text-primary font-black mt-1">${template.price}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 py-6 border-y border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-white">${template.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Service Fee</span>
                                        <span className="text-white">$0.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold pt-2">
                                        <span className="text-white">Total</span>
                                        <span className="text-primary">${template.price}</span>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Payment
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        <Calendar className="w-4 h-4 text-primary" /> Delivery in {template.deliveryTime || '24h'}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                                    <ShoppingCart className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-xs text-gray-400">Join over <span className="text-white font-bold">5,000+</span> developers building with Furious.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
