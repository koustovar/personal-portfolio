import React from 'react';
import Button from '../ui/Button';
import MagneticButton from '../ui/MagneticButton';
import { Mail, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
    return (
        <section id="contact" className="py-24 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start your project?</h2>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Contact me today and let's discuss how we can help you achieve your goals.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <MagneticButton>
                        <a href="mailto:furious.arko@gmail.com">
                            <Button className="px-8 py-4 text-lg bg-white text-black hover:bg-gray-200 min-w-[240px]">
                                <Mail className="w-5 h-5 mr-2" />
                                Send an Email
                            </Button>
                        </a>
                    </MagneticButton>

                    <MagneticButton>
                        <Link to="/custom-query">
                            <Button className="px-8 py-4 text-lg bg-primary text-white hover:bg-primary/90 min-w-[240px] shadow-[0_10px_30px_rgba(222,28,28,0.2)]">
                                <Send className="w-5 h-5 mr-2" />
                                Custom Project
                            </Button>
                        </Link>
                    </MagneticButton>
                </div>

                <div className="mt-24 pt-12 border-t border-primary/10 flex flex-wrap justify-center gap-12 text-gray-400">
                    <a href="https://www.instagram.com/koustov_adhikari" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">Instagram <ArrowRight className="w-4 h-4 -rotate-45" /></a>
                    <a href="https://www.youtube.com/channel/UCTrilW6zObSj-pqRS6txgSA" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">YouTube <ArrowRight className="w-4 h-4 -rotate-45" /></a>
                    <a href="https://x.com/Mr_Adhikari07" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">Twitter <ArrowRight className="w-4 h-4 -rotate-45" /></a>
                    <a href="https://github.com/koustovar" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">GitHub <ArrowRight className="w-4 h-4 -rotate-45" /></a>
                </div>
            </div>
        </section>
    );
};

export default Contact;
