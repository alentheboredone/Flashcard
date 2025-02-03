// app/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Speech, 
  MessageCircle, 
  Clock, 
  Users, 
  BookOpen,
  Presentation 
} from 'lucide-react';

const levels = [
  { 
    id: 'A1.1', 
    title: 'Beginner I', 
    description: 'Basic greetings and introductions',
    icon: Speech
  },
  { 
    id: 'A1.2', 
    title: 'Beginner II', 
    description: 'Simple conversations and daily routines',
    icon: MessageCircle
  },
  { 
    id: 'A2.1', 
    title: 'Elementary I', 
    description: 'Past experiences and future plans',
    icon: Clock
  },
  { 
    id: 'A2.2', 
    title: 'Elementary II', 
    description: 'Describing people and places',
    icon: Users
  },
  { 
    id: 'B1.1', 
    title: 'Intermediate I', 
    description: 'Complex opinions and discussions',
    icon: BookOpen
  },
  { 
    id: 'B1.2', 
    title: 'Intermediate II', 
    description: 'Abstract topics and media',
    icon: Presentation
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <GraduationCap size={48} className="text-white" />
            <h1 className="text-5xl font-bold text-white">DeutschCards</h1>
          </div>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Master German vocabulary through interactive flashcards. Choose your level and start learning today.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {levels.map((level) => {
            const Icon = level.icon;
            return (
              <motion.div
                key={level.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-colors"
                onClick={() => router.push(`/flashcards/${level.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={24} className="text-white" />
                  <span className="text-2xl font-bold text-white">{level.id}</span>
                  <div className="h-6 w-px bg-white/50" />
                  <span className="text-lg font-medium text-white">{level.title}</span>
                </div>
                <p className="text-white/90">{level.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-white">
            Start your journey to German fluency with our carefully curated flashcard sets.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
