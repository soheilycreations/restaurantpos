"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Users, 
  Settings, Package, PieChart, ChefHat,
  ChevronRight, LogOut, Grid, Layers,
  Building2
} from 'lucide-react';
import { ThemeHandler } from './ThemeHandler';

const menu = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'Restaurants', icon: Building2, path: '/restaurants' },
  { title: 'Orders', icon: ShoppingBag, path: '/orders' },
  { title: 'Tables', icon: Grid, path: '/tables' },
  { title: 'Categories', icon: Layers, path: '/categories' },
  { title: 'Inventory', icon: Package, path: '/products' },
  { title: 'Customers', icon: Users, path: '/customers' },
  { title: 'Analytics', icon: PieChart, path: '/analytics' },
  { title: 'Settings', icon: Settings, path: '/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [restaurant, setRestaurant] = React.useState<any>(null);

  React.useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const tenantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || "16ae97cd-c992-4103-9e58-f7c0671cc29d";

    fetch(`${apiUrl}/restaurant`, {
      headers: { 'x-tenant-id': tenantId }
    })
    .then(res => res.json())
    .then(data => setRestaurant(data));
  }, []);

  return (
    <aside className="w-72 bg-[#0b101a] border-r border-white/[0.05] h-full flex flex-col relative z-40 transition-all duration-300">
      <ThemeHandler restaurant={restaurant} />
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 group cursor-pointer active:scale-95 transition-all overflow-hidden border border-white/10">
            {restaurant?.logoUrl ? (
              <img src={restaurant.logoUrl} className="w-full h-full object-cover" />
            ) : (
              <ChefHat className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none mb-1.5 truncate max-w-[120px]">
              {restaurant?.name || 'WebPOS'}
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] truncate">OS Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
        {menu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.title}
              href={item.path}
              className={`w-full group flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all duration-300 border ${
                isActive 
                  ? 'bg-primary text-white border-transparent shadow-2xl shadow-primary/20 scale-[1.02]' 
                  : 'text-gray-500 border-transparent hover:bg-white/[0.03] hover:text-white hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[11px] font-black uppercase tracking-wider">{item.title}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-6 border-t border-white/[0.05]">
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-[1.5rem] hover:bg-white/[0.04] transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-black text-sm border border-white/[0.05] shadow-inner">
               A
             </div>
             <div>
                <p className="text-[11px] font-black text-white uppercase tracking-wider leading-tight">Admin System</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Manager Mode</p>
             </div>
          </div>
          <LogOut className="w-4 h-4 text-gray-700 group-hover:text-rose-500 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
