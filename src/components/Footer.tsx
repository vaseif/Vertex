import { motion } from 'motion/react';
import { Logo } from './Logo';

export default function Footer() {
  return (
    <footer className="py-6 border-t border-border bg-background">
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col items-center mb-0">
          <Logo className="scale-90" />
        </div>
      </div>
    </footer>
  );
}
