import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Github, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AllProjects = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary transition-colors mb-6 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">All Projects</h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Showcasing specialized <span className="text-white">Frontend Engineering</span> projects that bridge the gap between complex logic and premium aesthetics.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search projects or categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-primary/10 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:border-primary/50 transition-colors shadow-[0_0_20px_rgba(222,28,28,0.05)]"
                        />
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="h-full flex flex-col p-0 overflow-hidden border-primary/5 hover:border-primary/20">
                                    <div className="relative h-60 overflow-hidden group">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">
                                            {project.category}
                                        </span>
                                        <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                                        <p className="text-gray-400 text-sm mb-8 line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="mt-auto flex gap-4">
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                <Button variant="primary" className="w-full py-2.5 text-sm">
                                                    Live <ExternalLink className="w-4 h-4 ml-2" />
                                                </Button>
                                            </a>
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                <Button variant="outline" className="w-full py-2.5 text-sm">
                                                    Code <Github className="w-4 h-4 ml-2" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredProjects.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24"
                    >
                        <h3 className="text-2xl font-semibold text-gray-500 mb-2">No projects found</h3>
                        <p className="text-gray-600">Try searching with a different keyword.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AllProjects;
