import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="flex items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl text-center space-y-4 sm:space-y-6"
      >
        <h1 className="text-3xl font-bold sm:text-4xl">About DreamClick</h1>

        <p className="text-base leading-relaxed sm:text-lg sm:leading-relaxed">
          Welcome to <span className="font-semibold">DreamClick</span> 
        </p>

        <p className="text-base leading-relaxed sm:text-lg sm:leading-relaxed">
          This platform is designed to share stunning visuals — from breathtaking photos
          available for free download to exclusive <span className="font-medium">VN video editing templates </span>
          you can purchase and use in your own projects.
        </p>

        <p className="text-base leading-relaxed sm:text-lg sm:leading-relaxed">
          Our goal is simple: to make creativity accessible. Whether you're a creator, brand, or
          filmmaker, you'll find resources here that inspire and elevate your storytelling.
        </p>

        <div className="pt-4 sm:pt-6">
          <h2 className="text-xl font-semibold sm:text-2xl">What We Offer</h2>
          <ul className="list-disc text-left mx-auto mt-3 sm:mt-4 space-y-2 max-w-md text-sm sm:text-base">
            <li>High-quality images for free download</li>
            <li>Exclusive VN templates for professional video editing</li>
            <li>Preview sample videos before purchase</li>
            <li>Simple, email-based checkout — no account needed</li>
          </ul>
        </div>

        <p className="pt-4 italic text-sm sm:text-base sm:pt-6">
          “Creativity is limitless when passion meets technology.”
        </p>
      </motion.div>
    </div>
  );
};

export default About;