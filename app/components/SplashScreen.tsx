"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // يختفي بعد 4 ثواني
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[999] bg-[#000000] flex flex-col items-center justify-center text-white"
        >
          {/* اللوجو */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-5xl md:text-7xl font-serif tracking-widest mb-4"
          >
            La Béllé
          </motion.h1>
          
          {/* الجملة التعريفية */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-sm md:text-lg tracking-[0.3em] text-gray-400 font-sans"
          >
            Women's Fashion Boutique
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}