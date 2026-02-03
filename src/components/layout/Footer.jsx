import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-surface py-12 border-t border-white/5">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">Furious</h3>
                    <p className="text-gray-400 text-sm">Building digital experiences that matter.</p>
                </div>

                <div className="flex items-center gap-6">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                </div>

                <div className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
