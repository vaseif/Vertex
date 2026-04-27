import { motion } from 'motion/react';
import { Logo } from './Logo';

export default function Navbar() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="hidden md:block sticky top-0 z-50 glass backdrop-blur-md md:backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-center">
        <Logo />
      </div>
    </motion.header>
  );
}