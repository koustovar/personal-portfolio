import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    ChevronRight,
    CreditCard,
    MapPin,
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
    const location = useLocation();
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
        deliveryEmail: user?.email || '',
        deliveryEmailConfirm: ''
    });
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        if (!user && !loading) {
            navigate('/login', { state: { from: location } });
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

    const handleRazorpayPayment = async () => {
        if (!template) {
            alert("Product information is still loading. Please try again in a moment.");
            return;
        }
        setIsSubmitting(true);

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

        console.log("Initializing Razorpay with Key:", razorpayKey ? `${razorpayKey.substring(0, 8)}...` : "UNDEFINED");

        if (!razorpayKey || razorpayKey === 'undefined') {
            const errorMsg = "Razorpay Key ID is missing. Please check your .env file and ensure VITE_RAZORPAY_KEY_ID is set, then restart your dev server.";
            console.error(errorMsg);
            alert(errorMsg);
            setIsSubmitting(false);
            return;
        }

        const options = {
            key: razorpayKey,
            amount: (template.price || 0) * 100, // Razorpay works in paise
            currency: "USD", // Or "INR" if applicable, but prices seem to be in USD
            name: "Furious.in",
            description: `Purchase of ${template?.title || 'Digital Template'}`,
            image: "https://razorpay.com/favicon.png", // Use Razorpay logo as fallback
            handler: async function (response) {
                // Payment successful
                try {
                    const orderData = {
                        userId: user.uid,
                        userEmail: user.email,
                        deliveryEmail: formData.deliveryEmail,
                        customerName: `${formData.firstName} ${formData.lastName}`.trim() || user.displayName || 'Guest',
                        templateId: template.id,
                        templateTitle: template.title || 'Premium Template',
                        price: template.price || 0,
                        status: 'completed',
                        timestamp: serverTimestamp(),
                        paymentMethod: 'Razorpay',
                        paymentId: response.razorpay_payment_id
                    };

                    const orderRef = await addDoc(collection(db, 'orders'), orderData);

                    // Update User Profile
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, {
                        lastDeliveryEmail: formData.deliveryEmail
                    }, { merge: true });

                    navigate('/orders');
                } catch (error) {
                    console.error("Order creation failed:", error);
                    alert("Payment successful but order creation failed. Please contact support.");
                } finally {
                    setIsSubmitting(false);
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.deliveryEmail,
            },
            notes: {
                address: "Digital Delivery"
            },
            theme: {
                color: "#6366f1" // primary color
            },
            modal: {
                ondismiss: function () {
                    setIsSubmitting(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Step 1: Contact
        if (step === 1) {
            if (formData.deliveryEmail !== formData.deliveryEmailConfirm) {
                setEmailError('Delivery emails do not match');
                return;
            }
            setEmailError('');
            nextStep();
            return;
        }

        // Step 2: Delivery
        if (step === 2) {
            nextStep();
            return;
        }

        // Step 3: Payment (Razorpay)
        if (step === 3) {
            handleRazorpayPayment();
            return;
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

                        <div className="flex items-center gap-4 mb-12">
                            {[1, 2, 3].map((s) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-2 ${step >= s ? 'text-primary' : 'text-gray-600'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-primary text-white' : 'bg-white/5 border border-white/10'}`}>
                                            {s}
                                        </div>
                                        <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">
                                            {s === 1 ? 'Contact' : s === 2 ? 'Delivery' : 'Payment'}
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
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 text-primary animate-pulse">Delivery Email</label>
                                                    <input
                                                        required
                                                        name="deliveryEmail"
                                                        value={formData.deliveryEmail}
                                                        onChange={handleInput}
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 text-primary animate-pulse">Confirm Delivery Email</label>
                                                    <input
                                                        required
                                                        name="deliveryEmailConfirm"
                                                        value={formData.deliveryEmailConfirm}
                                                        onChange={handleInput}
                                                        type="email"
                                                        placeholder="Re-enter email"
                                                        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary focus:outline-none transition-colors ${emailError ? 'border-red-500 bg-red-500/5' : ''}`}
                                                    />
                                                    {emailError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">{emailError}</p>}
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
                                        <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl text-center">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                                <CheckCircle className="w-10 h-10 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Confirm Delivery Email</h3>
                                            <p className="text-gray-400 mb-8">Please confirm that your digital assets should be sent to the email address below.</p>

                                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 inline-block mx-auto min-w-[300px]">
                                                <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-2">Selected Email</p>
                                                <p className="text-xl font-bold text-primary">{formData.deliveryEmail}</p>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                                Verified & Encrypted Delivery
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
                                        <div className="bg-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl text-center">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                                <ShieldCheck className="w-10 h-10 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Final Step: Secure Payment</h3>
                                            <p className="text-gray-400 mb-8">Click the button below to complete your purchase using Razorpay. Your transaction is secure and encrypted.</p>

                                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 inline-block mx-auto min-w-[300px]">
                                                <div className="flex justify-between items-center gap-12 mb-2">
                                                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Total Amount</p>
                                                    <p className="text-xl font-bold text-primary">${template.price}</p>
                                                </div>
                                                <div className="flex justify-between items-center gap-12 pt-2 border-t border-white/5">
                                                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Product</p>
                                                    <p className="text-sm font-bold text-white">{template.title}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/10 max-w-sm mx-auto">
                                                <div className="flex -space-x-2">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="w-8 h-8 rounded-full bg-white p-1" alt="PayPal" />
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 border border-gray-200">
                                                        <img src="https://razorpay.com/favicon.png" className="w-4 h-4" alt="Razorpay" />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-left">Supporting UPI, Cards, Netbanking & Wallets via Razorpay</p>
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
                                    ) : step === 2 ? (
                                        <>Confirm & Proceed <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    ) : (
                                        <>Continue to Delivery <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
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
            </div >
        </div >
    );
};

export default Checkout;
