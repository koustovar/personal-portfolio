import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    className,
    onClick,
    ...props
}) => {
    const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group";

    const variants = {
        primary: "bg-primary text-white hover:bg-red-700 border border-transparent shadow-[0_0_20px_rgba(222,28,28,0.3)] hover:shadow-[0_0_30px_rgba(222,28,28,0.5)]",
        outline: "bg-transparent text-white border border-white/10 hover:border-primary hover:text-primary hover:bg-white/5",
        ghost: "bg-transparent text-gray-400 hover:text-primary hover:bg-white/5"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={twMerge(baseStyles, variants[variant], className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
