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
    <div className="text-foreground flex items-center justify-center px-6 py-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-center space-y-8"
      >
        <h1 className="text-4xl font-bold">Get in Touch</h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Have a project in mind, want to collaborate, or just say hi?
          I’d love to hear from you! Feel free to reach out through email or Instagram.
        </p>

        <div className="grid sm:grid-cols-2 gap-8 pt-8">
          {/* Email Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-card hover:bg-accent/50 border border-border shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 transition-all duration-300"
          >
            <Mail className="w-10 h-10 text-primary" />
            <h2 className="text-xl font-semibold">Email</h2>
            <p className="text-muted-foreground">{email}</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Email"}
            </button>
          </motion.div>

          {/* Instagram Card */}
          <motion.a
            href="https://www.instagram.com/dream_.click/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="bg-card hover:bg-accent/50 border border-border shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 transition-all duration-300"
          >
            <Instagram className="w-10 h-10 text-primary" />
            <h2 className="text-xl font-semibold">Instagram</h2>
            <p className="text-muted-foreground">@dream_.click</p>
          </motion.a>
        </div>

        <p className="pt-10 text-sm text-muted-foreground italic">
          “Let’s create something beautiful together.”
        </p>
      </motion.div>
    </div>
  );
};

export default Contact;
