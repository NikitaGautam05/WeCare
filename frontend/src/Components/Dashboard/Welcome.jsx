import React from "react";
import { motion } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Welcome = ({ onEnter }) => {
    const navigate = useNavigate();
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[rgb(30,30,30)] text-white flex flex-col justify-between items-center">

      {/* 🌌 Grey Cinematic Background */}
      <motion.div
        className="absolute inset-0 -z-20 opacity-60"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, #f5f5f5, #999999)",
            "radial-gradient(circle at 80% 70%, #e0e0e0, #aaaaaa)",
            "radial-gradient(circle at 50% 50%, #dddddd, #bbbbbb)"
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Floating Grey Light Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-[rgba(200,200,200,0.2)] rounded-full blur-[180px] -z-10"
        animate={{ x: [-200, 200, -200], y: [-100, 100, -100] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-[rgba(160,160,160,0.2)] rounded-full blur-[160px] -z-10 right-0 bottom-0"
        animate={{ x: [200, -200, 200], y: [100, -100, 100] }}
        transition={{ duration: 22, repeat: Infinity }}
      />

      {/* 🔝 Top Text */}
      <div className="pt-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold tracking-wide bg-gradient-to-r from-[#f5f5f5] via-[#cccccc] to-[#f5f5f5] bg-clip-text text-transparent"
        >
          Welcome
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-[rgb(200,200,200)] text-lg"
        >
          Your caregiving journey starts here
        </motion.p>
      </div>

      {/* 🧊 Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_60px_rgba(255,255,255,0.08)] rounded-3xl px-14 py-16 text-center"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-[rgb(180,180,180)] text-[rgb(40,40,40)] flex items-center justify-center text-3xl font-bold shadow-lg">
          CS
        </div>

        <h2 className="mt-6 text-2xl font-semibold tracking-wide text-[rgb(220,220,220)]">
          Caregiver System
        </h2>
        <p className="text-[rgb(200,200,200)] mt-2 text-sm">
          Manage profiles, services, and care with ease.
        </p>
      </motion.div>

      {/* ⬆️ Swipe Up / Enter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mb-10 flex flex-col items-center cursor-pointer"
        // onClick={onEnter}
         onClick={() => navigate("/CareGiverDash")}
      >
        <p className="text-[rgb(180,180,180)] text-sm mb-2"> Click to continue</p>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="bg-[rgb(240,240,240)] text-[rgb(30,30,30)] p-3 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.6)]"
        >
          <FaArrowUp />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
