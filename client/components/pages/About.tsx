'use client';

import { motion } from 'framer-motion';
import { Download, Film, Play, Mail } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background text-foreground flex items-center justify-center px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl w-full mx-auto space-y-10 sm:space-y-16"
      >
        <div className="text-center space-y-4 sm:space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            About <span className="text-primary">DreamClick</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base text-muted-foreground leading-relaxed sm:text-xl max-w-2xl mx-auto"
          >
            A platform designed to share stunning visuals — from breathtaking photos available for free download to exclusive VN video editing templates you can purchase and use in your own projects.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm"
        >
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Our Goal is Simple</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To make creativity accessible. Whether you're a creator, brand, or filmmaker, you'll find resources here that inspire and elevate your storytelling.
              </p>
              <div className="pt-1 sm:pt-2">
                 <p className="italic text-sm sm:text-base font-medium border-l-4 border-primary pl-3 sm:pl-4 py-1 text-foreground/90">
                   "Creativity is limitless when passion meets technology."
                 </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mt-2 md:mt-0">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">What We Offer</h2>
              <ul className="space-y-4 sm:space-y-5">
                {[
                  { icon: Download, text: 'High-quality images for free download' },
                  { icon: Film, text: 'Exclusive templates for professional video editing' },
                  { icon: Play, text: 'Preview sample videos before purchase' },
                  { icon: Mail, text: 'Simple, email-based checkout — no account needed' },
                ].map((feature, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.4 }}
                    className="flex items-start gap-4 text-muted-foreground"
                  >
                    <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base leading-snug">{feature.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
