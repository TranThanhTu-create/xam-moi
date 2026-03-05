import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans text-gray-800 selection:bg-[#D45D79] selection:text-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D45D79] rounded-full flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#D45D79]">BeautyAI</span>
          </div>
          <button className="text-sm font-medium text-gray-500 hover:text-[#D45D79]">
            Liên hệ
          </button>
        </div>
      </nav>
      
      <main className="max-w-md mx-auto min-h-[calc(100vh-64px)] relative">
        {children}
      </main>

      <footer className="bg-white py-8 border-t border-pink-100 mt-auto">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for Beauty Spas
          </p>
        </div>
      </footer>
    </div>
  );
}
