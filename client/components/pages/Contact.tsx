'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Instagram, Copy, CheckCircle2, ExternalLink } from "lucide-react";

const Contact = () => {
  const email = "dreamclick0823@gmail.com";
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background flex items-center justify-center px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full text-center space-y-10 sm:space-y-16"
      >
        <div className="space-y-4 sm:space-y-6">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base text-muted-foreground leading-relaxed sm:text-xl max-w-xl mx-auto px-2"
          >
            Have a project in mind, want to collaborate, or just say hi?
            I'd love to hear from you.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Email Card */}
          <div
            className="group relative bg-card/60 hover:bg-accent/30 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center space-y-4 sm:space-y-5 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 relative z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Email</h2>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">{email}</p>
            </div>
            
            <button
              onClick={handleCopy}
              className="mt-2 sm:mt-3 relative z-10 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-secondary/60 hover:bg-secondary text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-foreground">Copy Address</span>
                </>
              )}
            </button>
          </div>

          {/* Instagram Card */}
          <a
            href="https://www.instagram.com/dream_.click/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-card/60 hover:bg-accent/30 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center space-y-4 sm:space-y-5 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 relative z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Instagram</h2>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">@dream_.click</p>
            </div>
            
            <div className="mt-2 sm:mt-3 relative z-10 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-secondary/60 group-hover:bg-secondary text-xs sm:text-sm font-medium transition-colors">
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
              <span className="text-foreground">Visit Profile</span>
            </div>
          </a>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="pt-8 text-sm sm:text-base text-muted-foreground/70 italic font-medium"
        >
          "Let's create something beautiful together."
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Contact;
