import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-scree flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl text-center space-y-6"
      >
        <h1 className="text-4xl font-bold ">About DreamClick</h1>

        <p className="text-lg leading-relaxed">
          Welcome to <span className="font-semibold">DreamClick</span> 
        </p>

        <p className="text-lg leading-relaxed">
          This platform is designed to share stunning visuals — from breathtaking photos
          available for free download to exclusive <span className="font-medium">VN video editing templates </span>
          you can purchase and use in your own projects.
        </p>

        <p className="text-l leading-relaxed">
          Our goal is simple: to make creativity accessible. Whether you're a creator, brand, or
          filmmaker, you'll find resources here that inspire and elevate your storytelling.
        </p>

        <div className="pt-6">
          <h2 className="text-2xl font-semibold">What We Offer</h2>
          <ul className="list-disc text-left mx-auto mt-4 space-y-2 max-w-md">
            <li>High-quality images for free download</li>
            <li>Exclusive VN templates for professional video editing</li>
            <li>Preview sample videos before purchase</li>
            <li>Simple, email-based checkout — no account needed</li>
          </ul>
        </div>

        <p className="pt-6italic">
          “Creativity is limitless when passion meets technology.”
        </p>
      </motion.div>
    </div>
  );
};

export default About;
