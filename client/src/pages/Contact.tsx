import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Instagram, Copy } from "lucide-react";

const Contact = () => {
  const email = "dreamclick0823@gmail.com";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  return (
    <div className="text-foreground flex items-center justify-center px-4 py-16 sm:px-6 sm:py-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-center space-y-6 sm:space-y-8"
      >
        <h1 className="text-3xl font-bold sm:text-4xl">Get in Touch</h1>

        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          Have a project in mind, want to collaborate, or just say hi?
          I'd love to hear from you! Feel free to reach out through email or Instagram.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8">
          {/* Email Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = `mailto:${email}`}
            className="bg-card hover:bg-accent/50 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 transition-all duration-300 cursor-pointer"
          >
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h2 className="text-lg font-semibold sm:text-xl">Email</h2>
            <p className="text-muted-foreground text-sm sm:text-base break-all">{email}</p>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the mailto link
                handleCopy();       
              }}
              className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium hover:underline"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              {copied ? "Copied!" : "Copy Email"}
            </button>
          </motion.div>

          {/* Instagram Card */}
          <motion.a
            href="https://www.instagram.com/dream_.click/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="bg-card hover:bg-accent/50 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 transition-all duration-300"
          >
            <Instagram className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h2 className="text-lg font-semibold sm:text-xl">Instagram</h2>
            <p className="text-muted-foreground text-sm sm:text-base">@dream_.click</p>
          </motion.a>
        </div>

        <p className="pt-8 sm:pt-10 text-xs sm:text-sm text-muted-foreground italic">
          "Let's create something beautiful together."
        </p>
      </motion.div>
    </div>
  );
};

export default Contact;