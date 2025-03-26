'use client';
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToLogin() {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/login');
    }

    redirectToLogin();
  }, [router]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <motion.svg
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
            className="h-24 w-24 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mt-6 text-3xl font-bold text-white"
        >
          Loading...
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-2 text-white text-opacity-75"
        >
          Redirecting to login
        </motion.p>

        {/* Additional animated elements */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex justify-center space-x-4"
        >
          {[1, 2, 3].map((dot) => (
            <motion.span
              key={dot}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: dot * 0.2
              }}
              className="h-4 w-4 bg-white rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}