import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import MagneticButton from '../ui/MagneticButton';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

const Hero = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Subtle background movement effect using GSAP
        const ctx = gsap.context(() => {
            gsap.to(".bg-noise", {
                backgroundPosition: "100% 100%",
                duration: 20,
                repeat: -1,
                ease: "linear"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-background z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 bg-noise" />
            </div>

            <div className="container relative z-10 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-400 mb-6 backdrop-blur-sm">
                        Available for freelance work
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-white"
                >
                    Building Digital <br />
                    <span className="text-primary drop-shadow-[0_0_15px_rgba(222,28,28,0.5)]">Masterpieces</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Specializing in high-performance <span className="text-white font-medium">Frontend Engineering</span>. I craft immersive web experiences with a focus on motion, pixel-perfection, and clean logic.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                >
                    <MagneticButton>
                        <Link to="/all-projects">
                            <Button className="min-w-[160px]">View Projects</Button>
                        </Link>
                    </MagneticButton>
                    <MagneticButton>
                        <a href="#contact">
                            <Button variant="outline" className="min-w-[160px]">Contact Me</Button>
                        </a>
                    </MagneticButton>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
            </motion.div>
        </section>
    );
};

export default Hero;
