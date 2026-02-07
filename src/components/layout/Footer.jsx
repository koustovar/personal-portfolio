import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-surface py-12 border-t border-primary/10">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">Furious</h3>
                    <p className="text-gray-400 text-sm">Building digital experiences that matter.</p>
                    <a href="mailto:furious.arko@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                        furious.arko@gmail.com
                    </a>
                </div>

                <div className="flex items-center gap-6">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                    <a href="https://github.com/koustovar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
                    <a href="https://www.youtube.com/@koustovar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">YouTube</a>
                </div>

                <div className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
