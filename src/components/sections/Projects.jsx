import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const ProjectCard = ({ project, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
        >
            {/* Image with zoom effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-primary text-sm font-medium tracking-wider uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {project.category}
                    </span>
                    <h3 className="text-3xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-300 mb-6 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        {project.description}
                    </p>

                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 translate-y-4 group-hover:translate-y-0">
                        {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="primary" className="py-2 px-4 text-sm h-10 w-auto">
                                    View Live <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                        )}
                        {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="py-2 px-4 text-sm h-10 w-auto">
                                    Source <Github className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const q = query(
                    collection(db, 'projects'),
                    where('featured', '==', true),
                    orderBy('order', 'asc')
                );
                const querySnapshot = await getDocs(q);
                const projectsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projectsData);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <section id="projects" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Selected Works</h2>
                        <p className="text-gray-400 text-lg max-w-xl">
                            A collection of projects attempting to push the boundaries of web development.
                        </p>
                    </div>
                    <Link to="/all-projects">
                        <Button variant="outline">View All Projects</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            {projects.filter((_, i) => i % 2 === 0).map((project, index) => (
                                <ProjectCard key={project.id} project={project} index={index} />
                            ))}
                        </div>
                        <div className="space-y-8 lg:pt-24">
                            {projects.filter((_, i) => i % 2 !== 0).map((project, index) => (
                                <ProjectCard key={project.id} project={project} index={index + 1} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects;
