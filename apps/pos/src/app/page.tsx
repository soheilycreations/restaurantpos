"use client";

import React, { useState, useEffect } from 'react';
import { usePOSStore } from '../lib/store';
import { useSocket } from '../hooks/useSocket';
import { Sidebar } from '../components/Sidebar';
import { ProductGrid } from '../components/ProductGrid';
import { TableGrid } from '../components/TableGrid';
import { ActiveCart } from '../components/ActiveCart';
import { PaymentModal } from '../components/PaymentModal';
import { Moon, Sun, Search } from 'lucide-react';

export default function POSDashboard() {
  const [restaurantId, setRestaurantId] = useState<string>("");
  
  useEffect(() => {
    // Priority: Query Param > Env Var > Default
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('restaurantId');
    const idFromEnv = process.env.NEXT_PUBLIC_RESTAURANT_ID;
    const defaultId = "16ae97cd-c992-4103-9e58-f7c0671cc29d";
    
    setRestaurantId(idFromUrl || idFromEnv || defaultId);
  }, []);

  const socket = useSocket(restaurantId);
  const { paymentModalOpen } = usePOSStore();
  const [activeTab, setActiveTab] = useState('Menu');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);

  if (!restaurantId) return null; // Wait for ID to be resolved

  // Persist preference
  useEffect(() => {
    const saved = localStorage.getItem('pos-theme');
    if (saved === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('pos-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Menu':
        return (
          <>
            <TableGrid />
            <ProductGrid 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery} 
            />
          </>
        );
      case 'Orders':
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
             <div className="w-20 h-20 rounded-3xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-xl">
                <Search className="w-10 h-10 text-[#6c5ce7]" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-[0.2em]">Order History</h2>
             <p className="text-sm font-bold text-gray-500 mt-2">Live order management coming in v1.1</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-20 text-center px-10">
             <h2 className="text-lg font-black uppercase tracking-[0.2em]">{activeTab} Section</h2>
             <p className="text-sm font-bold text-gray-500 mt-2 italic">Building the future of restaurant management...</p>
          </div>
        );
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} fixed inset-0 overflow-hidden`}>
      <div className="flex h-full w-full bg-white dark:bg-[#0f1621] transition-colors duration-300">
        
        {/* LEFT: Icon Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar 
            activeTab={activeTab} 
            onSelectTab={setActiveTab} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
            isDark={isDark} 
          />
        </div>

        {/* CENTER */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#f0f0f8] dark:bg-[#0f1621]">

          {/* TOP BAR */}
          <div className="flex items-center gap-4 px-8 py-5 transition-colors duration-300">
            {/* Search */}
            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search items or type code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/[0.07] rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7] transition-all shadow-sm"
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#6c5ce7] dark:hover:text-[#a29bfe] hover:border-[#6c5ce7]/30 transition-all shadow-sm group"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Notification bell */}
              <button className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#6c5ce7] transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#6c5ce7]/30 cursor-pointer">
                A
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
            {renderContent()}
          </div>
        </main>


        {/* RIGHT: Cart Panel */}
        <div className="flex-shrink-0 w-[320px] h-full border-l border-gray-100 dark:border-white/[0.07]">
          <ActiveCart socket={socket} />
        </div>

        {/* MODALS */}
        {paymentModalOpen && <PaymentModal socket={socket} />}
      </div>
    </div>
  );
}
