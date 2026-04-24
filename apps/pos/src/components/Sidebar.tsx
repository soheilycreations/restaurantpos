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

export function Sidebar({ isDark = false }: {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  isDark?: boolean;
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
      <aside className="w-[72px] bg-white dark:bg-[#0b101a] border-r border-gray-100 dark:border-white/[0.05] flex flex-col items-center py-6 gap-4 z-20 transition-colors duration-300">
        <ThemeHandler restaurant={restaurant} />
        {/* LOGO */}
        <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/20 group relative cursor-pointer active:scale-90 transition-all overflow-hidden border border-gray-100 dark:border-white/10">
          {restaurant?.logoUrl ? (
            <img src={restaurant.logoUrl} className="w-full h-full object-cover" />
          ) : (
            <ChefHat className="w-5 h-5 text-white" />
          )}
          <div className="absolute left-full ml-4 bg-gray-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all transform -translate-x-2 group-hover:translate-x-0">
             {restaurant?.name || 'WebPOS'}
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item, i) => (
            <button
              key={item.label}
              className={`w-[52px] h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group ${
                i === 0
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-primary/5 dark:hover:bg-white/[0.04] hover:text-primary'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              {item.label === 'Orders' && incomingOrders.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0b101a]" />
              )}
            </button>
          ))}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="mt-auto flex flex-col gap-4 border-t border-gray-100 dark:border-white/[0.05] pt-6 text-[10px] font-black uppercase text-gray-400">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-[#6c5ce7] transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </div>
  );
}
