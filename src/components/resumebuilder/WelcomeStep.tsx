import React from 'react';
import { motion } from 'framer-motion';

const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center bg-black rounded-[4rem] overflow-hidden">
      {/* The "Portal" Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 30%, #1e1b4b 0%, #000 70%)",
              "radial-gradient(circle at 80% 70%, #1e1b4b 0%, #000 70%)",
              "radial-gradient(circle at 20% 30%, #1e1b4b 0%, #000 70%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 text-center space-y-12">
        <motion.div
          initial={{ letterSpacing: "1.5em", opacity: 0, filter: "blur(20px)" }}
          animate={{ letterSpacing: "0.2em", opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <h1 className="text-white text-7xl font-thin uppercase tracking-tighter">
            Architect <br />
            <span className="font-black tracking-normal">Your Identity</span>
          </h1>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1, letterSpacing: "0.4em" }}
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className="px-12 py-4 border border-white/30 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md hover:bg-white hover:text-black transition-all duration-700"
        >
          Initialize
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomeStep;