import React from 'react';
import { usePOSStore } from '../lib/store';
import {
  LayoutGrid, Clock, Users,
  Settings, LogOut, ChefHat, BarChart2
} from 'lucide-react';

const navItems = [
  { icon: LayoutGrid, label: 'Menu' },
  { icon: Clock,      label: 'Orders' },
  { icon: BarChart2,  label: 'Analytics' },
  { icon: Users,      label: 'Customers' },
  { icon: ChefHat,    label: 'KOT' },
];
import { ThemeHandler } from './ThemeHandler';

export function Sidebar({ isDark = false, activeTab, onSelectTab }: {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  isDark?: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}) {
  const incomingOrders = usePOSStore((state) => state.incomingOrders);
  const [restaurant, setRestaurant] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('http://localhost:3001/restaurant', {
      headers: { 'x-tenant-id': '16ae97cd-c992-4103-9e58-f7c0671cc29d' }
    })
    .then(res => res.json())
    .then(data => setRestaurant(data));
  }, []);

  return (
    <div className="flex h-full overflow-hidden select-none">
      {/* COMPACT NAVIGATION RAIL */}
      <aside className="w-[80px] bg-white dark:bg-[#0b101a] border-r border-gray-100 dark:border-white/[0.05] flex flex-col items-center py-8 gap-6 z-20 transition-colors duration-300">
        <ThemeHandler restaurant={restaurant} />
        
        {/* LOGO / HOME */}
        <div className="w-12 h-12 rounded-2xl bg-[#6c5ce7] flex items-center justify-center mb-4 shadow-xl shadow-[#6c5ce7]/20 group relative cursor-pointer active:scale-95 transition-all overflow-hidden border border-white/10">
          {restaurant?.logoUrl ? (
            <img src={restaurant.logoUrl} className="w-full h-full object-cover" />
          ) : (
            <ChefHat className="w-6 h-6 text-white" />
          )}
          <div className="absolute left-full ml-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all transform -translate-x-2 group-hover:translate-x-0 shadow-xl">
             {restaurant?.name || 'WebPOS'}
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => onSelectTab(item.label)}
                className={`w-[52px] h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group ${
                  isActive
                    ? 'bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/30 scale-110'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-[#6c5ce7]/5 dark:hover:bg-white/[0.04] hover:text-[#6c5ce7]'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                
                {/* TOOLTIP */}
                <div className="absolute left-full ml-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all transform -translate-x-2 group-hover:translate-x-0 shadow-xl">
                  {item.label}
                </div>

                {/* ACTIVE INDICATOR DOT (Left) */}
                {isActive && (
                  <div className="absolute -left-3 w-1.5 h-6 bg-[#6c5ce7] rounded-r-full shadow-[0_0_10px_#6c5ce7]" />
                )}

                {/* NOTIFICATION DOT */}
                {item.label === 'Orders' && incomingOrders.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0b101a] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="mt-auto flex flex-col gap-4 border-t border-gray-100 dark:border-white/[0.05] pt-8">
          <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-[#6c5ce7] transition-all group relative">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <div className="absolute left-full ml-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all transform -translate-x-2 group-hover:translate-x-0">
              Settings
            </div>
          </button>
          <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all group relative">
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <div className="absolute left-full ml-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all transform -translate-x-2 group-hover:translate-x-0">
              Logout
            </div>
          </button>
        </div>
      </aside>
    </div>
  );
}

