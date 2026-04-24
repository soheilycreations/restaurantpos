"use client";

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ChefHat, Clock, CheckCircle2, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function KDSDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = "dummy-tenant-123";

  useEffect(() => {
    // Initial fetch of active orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/orders`, {
          headers: { 'x-tenant-id': restaurantId }
        });
        const data = await res.json();
        // Filter for PENDING or IN_PREPARATION
        const activeOrders = data.filter((o: any) => o.status === 'PENDING' || o.status === 'IN_PREPARATION');
        setOrders(activeOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const socket = io(API_URL);

    socket.on('connect', () => {
      socket.emit('join_restaurant', { restaurantId });
    });

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on('order_updated', (updatedOrder) => {
        if (updatedOrder.status === 'READY' || updatedOrder.status === 'CANCELLED') {
            setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
        } else {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': restaurantId 
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Status update failed');
      
      const updatedOrder = await res.json();
      
      if (status === 'READY') {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-4 text-left">
           <div className="p-3 bg-orange-600 rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.4)]">
              <ChefHat className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight italic">KITCHEN.live</h1>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Active Station: Hot Kitchen</p>
           </div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 px-6 py-3 rounded-2xl flex items-center space-x-8">
           <div className="text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Workload</p>
              <p className="text-xl font-black text-white">{orders.length} ACTIVE</p>
           </div>
           <div className="w-px h-8 bg-white/5" />
           <div className="text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Status</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter">ONLINE</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
             <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-30">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-xl font-black uppercase tracking-[0.2em]">Synchronizing Pantry...</p>
             </div>
        ) : orders.map(order => (
          <div key={order.id} className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in">
            <div className={`p-5 border-b border-white/5 flex justify-between items-center ${
                order.status === 'IN_PREPARATION' ? 'bg-orange-500/10' : 'bg-white/[0.02]'
            }`}>
               <div className="text-left">
                  <p className="text-2xl font-black italic tracking-tighter">#{order.id.slice(-4).toUpperCase()}</p>
                  <div className="flex items-center text-[10px] font-bold text-zinc-500 uppercase mt-0.5">
                     <Clock className="w-3 h-3 mr-1" />
                     {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
               </div>
               <div className="text-right">
                  {order.tableId && (
                    <div className="bg-white/5 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 mb-1">
                        Table {order.tableId.replace('t', '')}
                    </div>
                  )}
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      order.status === 'IN_PREPARATION' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                      {order.status}
                  </span>
               </div>
            </div>

            <div className="p-6 flex-1 space-y-4 text-left">
               {order.items.map((item: any, idx: number) => (
                 <div key={idx} className="flex justify-between items-start border-b border-white/[0.03] pb-3 last:border-0">
                    <div className="flex items-baseline space-x-3">
                       <span className="text-xl font-black text-orange-500">{item.quantity}x</span>
                       <span className="text-lg font-bold text-zinc-200 tracking-tight">{item.product?.name || "Premium Item"}</span>
                    </div>
                 </div>
               ))}
            </div>

            {/* Actions */}
            <div className="p-4 bg-zinc-800/50 space-y-2">
               {order.status === 'PENDING' ? (
                  <button 
                  onClick={() => updateStatus(order.id, 'IN_PREPARATION')}
                  className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(234,88,12,0.3)]"
                 >
                    <PlayCircle className="w-5 h-5" />
                    <span>Start Cooking</span>
                 </button>
               ) : (
                  <button 
                  onClick={() => updateStatus(order.id, 'READY')}
                  className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
                 >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Mark Ready</span>
                 </button>
               )}
               
               <button className="w-full py-3 rounded-xl bg-zinc-900/50 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-colors flex items-center justify-center space-x-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Report An Issue</span>
               </button>
            </div>
          </div>
        ))}

        {!loading && orders.length === 0 && (
          <div className="col-span-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] text-zinc-800 animate-pulse">
             <ChefHat className="w-20 h-20 mb-4 opacity-5" />
             <p className="text-xl font-black uppercase tracking-[0.2em] opacity-5">All Stations Clear</p>
          </div>
        )}
      </div>
    </div>
  );
}
