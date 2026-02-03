import { db } from './firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const projects = [
    {
        title: "E-Commerce Dashboard",
        category: "Web Application",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        description: "A comprehensive analytics dashboard for online retailers with real-time data visualization.",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/example/ecommerce-dashboard",
        featured: true,
        order: 1
    },
    {
        title: "SaaS Landing Page",
        category: "Marketing Website",
        image: "https://images.unsplash.com/photo-1481487484168-9b930d5b7d93?q=80&w=2662&auto=format&fit=crop",
        description: "High-conversion landing page designed for a modern SaaS startup with 3D elements.",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/example/saas-landing",
        featured: true,
        order: 2
    },
    {
        title: "AI Image Generator",
        category: "AI/ML",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2664&auto=format&fit=crop",
        description: "A web application that generates images from text prompts using DALL-E API.",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/example/ai-gen",
        featured: true,
        order: 3
    }
];

const siteConfig = {
    siteName: "Furious",
    tabTitle: "Furious-Portfolio",
    author: "Koustav",
    email: "koustavarko@gmail.com",
    socials: {
        github: "https://github.com/koustovar",
        linkedin: "https://linkedin.com/in/koustovar",
        twitter: "https://twitter.com/koustovar"
    }
};

export const seedDatabase = async () => {
    try {
        console.log("Starting database seeding...");

        // 1. Seed Projects
        const projectsCol = collection(db, 'projects');
        for (const project of projects) {
            await addDoc(projectsCol, project);
            console.log(`Added project: ${project.title}`);
        }

        // 2. Seed Site Config
        await setDoc(doc(db, 'site_config', 'main'), siteConfig);
        console.log("Added site configuration");

        // 3. Create placeholder for messages
        // (Just creating the collection by adding a dummy doc then deleting it, or just leave it)
        // In Firestore, collections exist as soon as they have one document.

        console.log("Seeding completed successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding database:", error);
        return false;
    }
};
