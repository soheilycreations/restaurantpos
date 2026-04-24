import React, { useEffect, useState, useRef } from 'react';
import { usePOSStore, TableStatus } from '../lib/store';
import { Users, Receipt, Sparkles, Check, ShoppingBag, Loader2, Truck, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { tablesApi } from '../lib/api';
import { useNotify } from './NotificationProvider';

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  AVAILABLE: { 
    bg: 'bg-emerald-500/5', 
    text: 'text-emerald-500', 
    dot: 'bg-emerald-500',
    label: 'Available'
  },
  OCCUPIED: { 
    bg: 'bg-rose-500/5', 
    text: 'text-rose-500', 
    dot: 'bg-rose-500',
    label: 'Occupied'
  },
  RESERVED: { 
    bg: 'bg-blue-500/5', 
    text: 'text-blue-500', 
    dot: 'bg-blue-500',
    label: 'Reserved'
  },
  CLEANING: { 
    bg: 'bg-amber-500/5', 
    text: 'text-amber-500', 
    dot: 'bg-amber-500',
    label: 'Cleaning'
  },
};

export function TableGrid() {
  const { 
    activeTableId, 
    setActiveTable, 
    tableCarts, 
    tableStatuses, 
    setTableStatus,
    tables,
    setTables
  } = usePOSStore();
  
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await tablesApi.getAll();
        setTables(data);
      } catch (err) {
        console.error('Failed to fetch tables:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [setTables]);

  const handleSetClean = async (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    try {
      // Sync with backend
      await tablesApi.updateStatus(tableId, 'AVAILABLE');
      // Update local store
      setTableStatus(tableId, 'AVAILABLE');
      notify(`Table ${tables.find(t => t.id === tableId)?.number} is now Available`, 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to update table status', 'error');
    }
  };

  const handleTableClick = (t: any) => {
    const status = tableStatuses[t.id] || t.status || 'AVAILABLE';
    
    // If it's cleaning, clicking it should trigger the cleaning process
    if (status === 'CLEANING') {
      const syntheticEvent = { stopPropagation: () => {} } as React.MouseEvent;
      handleSetClean(syntheticEvent, t.id);
      return;
    }

    setActiveTable(t.id);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-10 pt-2 selection:bg-none relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-[#6c5ce7]/10 flex items-center justify-center text-[#6c5ce7]">
              <LayoutGrid className="w-4 h-4" />
           </div>
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Table Plan</h2>
        </div>
        <div className="flex items-center gap-2">
            {/* Scroll Navigation Controls */}
            <div className="flex items-center gap-2 mr-2">
              <button 
                onClick={() => scroll('left')}
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-[#6c5ce7] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-[#6c5ce7] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activeTableId && (
              <button
                  onClick={() => setActiveTable(null)}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-all active:scale-95"
              >
                  Clear Selection
              </button>
            )}
        </div>
      </div>

      {/* Main Grid Section with Sticky Controls */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-0 overflow-x-auto pb-6 scrollbar-hide"
      >
        
        {/* STICKY SERVICE MODES SECTION */}
        <div className="sticky left-0 z-20 flex gap-2.5 flex-shrink-0 bg-[#f0f0f8] dark:bg-[#0f1621] pl-0.5 pr-4 pb-6 -mb-6 transition-colors duration-300 relative before:absolute before:inset-y-0 before:-right-4 before:w-4 before:bg-gradient-to-r before:from-[#f0f0f8] before:to-transparent dark:before:from-[#0f1621]">
          {/* TAKEAWAY */}
          <button
            onClick={() => setActiveTable('takeaway')}
            className={`flex-shrink-0 w-28 py-4 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all relative group overflow-hidden ${
              activeTableId === 'takeaway'
                ? 'border-[#6c5ce7] bg-[#6c5ce7]/10 shadow-xl shadow-[#6c5ce7]/10 scale-[1.02]'
                : 'border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-[#151c2c] hover:border-[#6c5ce7]/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTableId === 'takeaway' ? 'bg-[#6c5ce7] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-[#6c5ce7]'
            }`}>
               <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-center text-center">
               <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 ${
                  activeTableId === 'takeaway' ? 'text-[#6c5ce7]' : 'text-gray-500'
               }`}>Takeaway</span>
               <span className="text-[8px] font-bold opacity-30 uppercase tracking-tighter text-gray-400">Walk-in</span>
            </div>
            {activeTableId === 'takeaway' && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#6c5ce7] rounded-full animate-pulse" />}
          </button>

          {/* DELIVERY */}
          <button
            onClick={() => setActiveTable('delivery')}
            className={`flex-shrink-0 w-28 py-4 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all relative group overflow-hidden ${
              activeTableId === 'delivery'
                ? 'border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/10 scale-[1.02]'
                : 'border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-[#151c2c] hover:border-amber-500/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTableId === 'delivery' ? 'bg-amber-500 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-amber-500'
            }`}>
               <Truck className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-center text-center">
               <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 ${
                  activeTableId === 'delivery' ? 'text-amber-600' : 'text-gray-500'
               }`}>Delivery</span>
               <span className="text-[8px] font-bold opacity-30 uppercase tracking-tighter text-gray-400">External</span>
            </div>
            {activeTableId === 'delivery' && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
          </button>
          
          <div className="w-px h-12 my-auto bg-gray-100 dark:bg-white/5 flex-shrink-0" />
        </div>

        {/* SCROLLABLE TABLE GRID */}
        <div className="flex gap-4 px-4 items-center">
          {loading && tables.length === 0 ? (
            <div className="flex items-center gap-4 px-10 opacity-30">
               <Loader2 className="w-6 h-6 animate-spin" />
               <span className="text-xs font-bold uppercase tracking-widest">Fetching Tables...</span>
            </div>
          ) : (
            tables.map((t) => {
              const isActive = activeTableId === t.id;
              const status = tableStatuses[t.id] || t.status || 'AVAILABLE';
              const cfg = statusConfig[status] || statusConfig.AVAILABLE;
              const cartItems = tableCarts[t.id] || [];
              const isOccupied = cartItems.length > 0 || status === 'OCCUPIED';
              
              return (
                <button
                  key={t.id}
                  onClick={() => handleTableClick(t)}
                  className={`flex-shrink-0 w-28 py-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all relative group overflow-hidden ${
                    isActive
                      ? 'border-[#6c5ce7] bg-[#6c5ce7]/5 dark:bg-[#6c5ce7]/10 shadow-xl shadow-[#6c5ce7]/10'
                      : status === 'CLEANING'
                      ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                      : isOccupied
                      ? 'border-rose-500/10 bg-rose-500/[0.02] hover:border-rose-500/30'
                      : 'border-gray-100 dark:border-white/[0.05] bg-white dark:bg-[#151c2c] hover:border-[#6c5ce7]/30 hover:scale-[1.02]'
                  }`}
                >
                  {/* Number */}
                  <div className="flex flex-col items-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-40 ${
                      isActive ? 'text-[#6c5ce7]' : 'text-gray-500'
                    }`}>Table</span>
                    <span className={`text-2xl font-black italic tracking-tighter leading-none ${
                        isActive ? 'text-[#6c5ce7]' : 
                        status === 'CLEANING' ? 'text-amber-500' :
                        isOccupied ? 'text-rose-500/80' : 
                        'text-gray-800 dark:text-gray-200'
                    }`}>
                        {t.number}
                    </span>
                  </div>
                  
                  {/* Capacity */}
                  <div className="flex items-center gap-1 py-0.5 px-2 bg-gray-50 dark:bg-white/[0.04] rounded-full text-gray-400 dark:text-gray-600">
                    <Users className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold tracking-tight">{t.capacity}</span>
                  </div>

                  {/* Status Pill */}
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-current text-[8px] font-black uppercase tracking-tight transition-all ${
                    isActive ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : `${cfg.bg} ${cfg.text} border-opacity-10`
                  }`}>
                    {cfg.label}
                  </div>

                  {/* CLEANING OVERLAY */}
                  {status === 'CLEANING' && (
                     <div className="absolute inset-0 bg-amber-500/90 dark:bg-amber-600/95 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-all duration-300">
                        <Check className="w-6 h-6" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Mark Clean</span>
                     </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
