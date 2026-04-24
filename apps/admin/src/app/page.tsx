"use client";

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { 
  TrendingUp, TrendingDown, Users, 
  Package, ShoppingBag, DollarSign,
  Search, Bell, MoreHorizontal, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { analyticsApi } from '../lib/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    activeOrders: 0,
    menuItems: 0,
    todayGuests: 0,
    salesGrowth: "0.0"
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [categorySplit, setCategorySplit] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summary, trend, split, items] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getSalesTrend(),
          analyticsApi.getCategorySplit(),
          analyticsApi.getRecentItems()
        ]);

        setMetrics(summary);
        setSalesTrend(trend);
        setCategorySplit(split);
        setRecentItems(items);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
    // Refresh every 30 seconds for real-time feel
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    { label: "Today's Sales", value: `Rs. ${metrics.todaySales.toLocaleString()}`, icon: TrendingUp, trend: `${parseFloat(metrics.salesGrowth) >= 0 ? '+' : ''}${metrics.salesGrowth}% Growth`, up: parseFloat(metrics.salesGrowth) >= 0, color: "#6c5ce7" },
    { label: "Live Tables", value: `${metrics.activeOrders} Orders`, icon: ShoppingBag, trend: "Busy Flow", up: true, color: "#00b894" },
    { label: "Menu Items", value: metrics.menuItems.toLocaleString(), icon: Package, trend: "Status: OK", up: true, color: "#0984e3" },
    { label: "Daily Footfall", value: `${metrics.todayGuests} Guests`, icon: Users, trend: "+5% Peak Time", up: true, color: "#fdcb6e" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0b101a] text-white font-black uppercase tracking-widest animate-pulse">
        Initializing Realtime Dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b101a]">
       <AdminSidebar />
       
       <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Header */}
          <header className="glass-effect px-10 py-6 flex items-center justify-between sticky top-0 z-30 bg-[#0b101a]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Operations Dashboard</h2>
              <span className="px-3 py-1 bg-[#6c5ce7]/10 text-[#a29bfe] text-[10px] font-black tracking-[0.2em] uppercase rounded-full border border-[#6c5ce7]/20 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7] animate-pulse"></div>
                 Live System Active
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative hidden lg:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Find invoices, dishes, or staff..." 
                  className="bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold text-gray-300 focus:outline-none focus:border-[#6c5ce7]/50 focus:bg-white/[0.04] transition-all w-72 uppercase tracking-widest placeholder:text-gray-700"
                />
              </div>
              <button className="relative w-11 h-11 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b101a]"></span>
              </button>
              <div className="w-px h-6 bg-white/[0.08]"></div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-white tracking-wider uppercase leading-none mb-1">HQ Command</p>
                  <p className="text-[9px] text-[#6c5ce7] font-black uppercase tracking-[0.2em]">Store Manager</p>
                </div>
                <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white font-black text-sm shadow-2xl shadow-[#6c5ce7]/30 border border-white/10 relative group cursor-pointer transition-transform active:scale-95">
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-black/10 rounded-b-[1.25rem]" />
                  <span className="relative z-10 italic">A</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-10 max-w-[1800px] mx-auto space-y-10 animate-premium-fade">
             
             {/* Key Metrics */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {metricCards.map((m, i) => (
                  <div key={i} className="premium-card group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-[#6c5ce7]/20 group-hover:border-[#6c5ce7]/30 transition-all duration-500">
                        <m.icon className="w-7 h-7" />
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${m.up ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {m.trend}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{m.label}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter italic">{m.value}</h3>
                  </div>
                ))}
             </div>

             {/* Main Analytics Section */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 premium-card">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase">Weekly Sales Performance</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Revenue Growth Analytics (LKR)</p>
                    </div>
                    <div className="flex p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                       {['Day', 'Week', 'Month'].map(t => (
                         <button key={t} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Week' ? 'bg-[#6c5ce7] text-white shadow-xl shadow-[#6c5ce7]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesTrend}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} 
                          dy={15}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} 
                        />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#111723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', fontSize: '12px', fontWeight: 900, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}}
                          itemStyle={{color: '#fff'}}
                          cursor={{stroke: '#6c5ce7', strokeWidth: 2}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#6c5ce7" 
                          strokeWidth={6}
                          fillOpacity={1} 
                          fill="url(#colorSales)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Popular Categories Bar Chart */}
                <div className="premium-card">
                   <h3 className="text-xl font-black text-white tracking-tighter uppercase mb-2">Popular Categories</h3>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-10">Revenue by Food Group</p>
                   <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categorySplit} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}}
                          width={120}
                        />
                        <Tooltip 
                          cursor={{fill: 'rgba(255,255,255,0.02)'}}
                          contentStyle={{backgroundColor: '#111723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px'}}
                        />
                        <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={24}>
                          {categorySplit.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={['#6c5ce7', '#a29bfe', '#00b894', '#0984e3', '#fdcb6e'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                   </div>
                   <div className="mt-10 space-y-4">
                      {categorySplit.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all group">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full shadow-lg" style={{backgroundColor: ['#6c5ce7', '#a29bfe', '#00b894', '#0984e3', '#fdcb6e'][i % 5], boxShadow: `0 0 10px #6c5ce740`}}></span>
                            <span className="text-[11px] font-black text-gray-400 group-hover:text-white uppercase tracking-wider transition-colors">{c.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-white italic">{c.percentage}%</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Inventory Tracking */}
             <div className="premium-card">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase">Quick Stock Status</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Recently Updated Items</p>
                   </div>
                   <button className="flex items-center gap-3 px-6 py-3.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[10px] font-black text-[#6c5ce7] uppercase tracking-widest hover:text-white hover:bg-[#6c5ce7] hover:border-[#6c5ce7] transition-all active:scale-95 group">
                      View All Items <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] border-b border-white/[0.05]">
                            <th className="pb-6">Item Name</th>
                            <th className="pb-6">Category</th>
                            <th className="pb-6">Rate (LKR)</th>
                            <th className="pb-6 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-white/[0.02]">
                         {recentItems.map((p: any, i: number) => (
                           <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                              <td className="py-6 font-black text-white group-hover:text-[#6c5ce7] transition-colors uppercase tracking-tight">{p.name}</td>
                              <td className="py-6">
                                 <span className="px-3 py-1.5 bg-white/[0.02] border border-white/5 text-gray-500 rounded-xl text-[9px] font-black tracking-widest uppercase group-hover:text-white transition-colors">{p.category?.name || 'N/A'}</span>
                              </td>
                              <td className="py-6 font-black text-white italic text-base">
                                 <span className="text-[10px] text-gray-700 not-italic mr-1.5 font-bold">LKR</span>
                                 {p.price.toLocaleString()}
                              </td>
                              <td className="py-6 text-right">
                                 <button className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-gray-600 hover:text-white hover:bg-[#6c5ce7]/20 hover:border-[#6c5ce7]/30 transition-all active:scale-90">
                                    <MoreHorizontal className="w-5 h-5" />
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </main>
    </div>
  );
}
