"use client";

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { 
  ShoppingBag, Search, Filter, Eye, 
  CheckCircle2, Clock, XCircle, ArrowUpRight,
  ChevronRight, Calendar, DollarSign, ListOrdered,
  X, Printer, RefreshCw
} from 'lucide-react';
import { ordersApi } from '../../lib/api';
import { useToast } from '../../components/BikoToast';
import { useSocket } from '../../hooks/useSocket';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // Show everything by default
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Real-time synchronization
  const tenantId = "16ae97cd-c992-4103-9e58-f7c0671cc29d";
  
  const onNewOrder = React.useCallback((order: any) => {
    showToast(`New Order Received: #${order.id.slice(0, 8).toUpperCase()}`, 'info');
    fetchOrders(true); // Silent refresh
  }, []);

  useSocket(tenantId, onNewOrder);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      showToast('Order list retrieval failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      showToast(`Order updated: ${newStatus}`, 'success');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        if (newStatus === 'PAID') {
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      showToast('Status synchronization failed', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Unpaid';
      case 'PAID': return 'Settled';
      case 'READY': return 'Ready';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'PAID': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'READY': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'CANCELLED': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + (o.totalAmount || 0), 0)
  };

  // Helper to calculate bill totals
  const calculateBill = (order: any) => {
    const subtotal = order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;
    const tax = order.taxAmount || 0;
    const discount = order.discountAmount || 0;
    const total = (subtotal + tax) - discount;
    return { subtotal, tax, discount, total };
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b101a]">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto flex flex-col custom-scrollbar bg-[#0b101a]">
        {/* Header */}
        <header className="px-10 py-10 flex items-center justify-between border-b border-white/[0.05] bg-[#0b101a]/80 backdrop-blur-xl sticky top-0 z-30 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6c5ce7] to-transparent opacity-50" />
          <div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#6c5ce7]/10 flex items-center justify-center border border-[#6c5ce7]/20">
                  <ShoppingBag className="w-6 h-6 text-[#6c5ce7]" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Bill Management</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-[#6c5ce7]/10 text-[#a29bfe] text-[9px] font-black tracking-widest uppercase rounded-lg border border-[#6c5ce7]/20 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7] animate-pulse"></div>
                        Live Transaction Feed
                    </span>
                  </div>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={fetchOrders}
               className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-xl"
             >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
             </button>
             <div className="h-10 w-px bg-white/[0.05] mx-2" />
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#6c5ce7] transition-colors" />
                <input 
                  type="text"
                  className="bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] pl-14 pr-8 py-4 text-[11px] font-black text-white placeholder:text-gray-700 focus:outline-none focus:border-[#6c5ce7] focus:bg-white/[0.04] transition-all w-80 uppercase tracking-widest"
                />
             </div>
          </div>
        </header>

        <div className="p-10 space-y-12 animate-premium-fade">
           {/* Stats Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="premium-card group bg-gradient-to-br from-white/[0.05] to-transparent">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Total Orders</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none">{stats.total}<span className="text-lg not-italic text-gray-700 ml-2 uppercase">Processed</span></h3>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:bg-[#6c5ce7]/20 group-hover:text-[#6c5ce7] border-white group-hover:border-[#6c5ce7]/30 transition-all duration-500 transform group-hover:rotate-12">
                       <ListOrdered className="w-7 h-7" />
                    </div>
                 </div>
              </div>
              <div className="premium-card group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] -mr-16 -mt-16" />
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Pending Bills</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-amber-500 italic tracking-tighter leading-none">{stats.pending}<span className="text-lg not-italic text-gray-700 ml-2 uppercase">Unpaid</span></h3>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:bg-amber-500/20 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all duration-300 transform group-hover:scale-110">
                       <Clock className="w-7 h-7" />
                    </div>
                 </div>
              </div>
              <div className="premium-card group">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Total Revenue</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-emerald-500 italic tracking-tighter leading-none">Rs. {stats.revenue.toLocaleString()}<span className="text-lg not-italic text-gray-700 ml-2 uppercase">Total</span></h3>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-500 transform group-hover:-rotate-12">
                       <DollarSign className="w-7 h-7" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Filter Bar */}
           <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/[0.05] rounded-3xl w-fit">
              {['ALL', 'PENDING', 'PAID', 'READY', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === tab 
                      ? 'bg-[#6c5ce7] text-white shadow-xl shadow-[#6c5ce7]/30' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
           </div>

           {/* Transaction Ledger */}
           <div className="premium-card !p-0 overflow-hidden border-white/[0.05] shadow-2xl">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source / Table</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order Time</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {loading && orders.length === 0 ? (
                         [1,2,3,4,5].map(n => (
                           <tr key={n} className="animate-pulse">
                              <td colSpan={6} className="px-8 py-4 h-16 bg-white/[0.01]"></td>
                           </tr>
                         ))
                       ) : filteredOrders.length === 0 ? (
                         <tr>
                            <td colSpan={6} className="px-8 py-20 text-center">
                               <p className="text-xl font-black text-gray-800 uppercase tracking-[0.5em]">No Intercepts Found</p>
                            </td>
                         </tr>
                       ) : (
                         filteredOrders.map((order) => (
                           <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-4">
                                 <span className="text-[11px] font-mono text-gray-600 uppercase">#{order.id.slice(0, 8).toUpperCase()}</span>
                              </td>
                              <td className="px-8 py-4">
                                 <div>
                                    <p className="text-[14px] font-bold text-white uppercase tracking-tight leading-none">{order.customerName || (order.table?.number ? `Table ${order.table.number}` : 'Takeaway')}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                       <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
                                          <div className={`w-1 h-1 rounded-full ${order.table ? 'bg-[#6c5ce7]' : 'bg-amber-400'}`}></div>
                                          {order.table ? `Dining` : 'Takeaway'}
                                       </p>
                                       <p className="text-[9px] text-[#a29bfe] font-bold uppercase tracking-[0.1em] bg-[#6c5ce7]/10 px-2 py-0.5 rounded-md border border-[#6c5ce7]/10">
                                          {order.items?.[0]?.product?.name || 'Items'} 
                                          {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-4">
                                 <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                    <span className="text-[11px] font-bold">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-4">
                                 <span className="text-base font-bold text-white tracking-tighter leading-none">Rs. {order.totalAmount.toLocaleString()}</span>
                              </td>
                              <td className="px-8 py-4">
                                 <span className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                 </span>
                              </td>
                              <td className="px-8 py-4">
                                 <button 
                                   onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                   className="w-12 h-12 rounded-[1rem] bg-white/[0.03] border border-white/[0.05] text-gray-500 hover:text-white hover:bg-[#6c5ce7] hover:border-[#6c5ce7] shadow-xl transition-all flex items-center justify-center group/btn"
                                 >
                                    <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                 </button>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </main>

      {/* Simple Professional Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#0b0f17] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-up">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-[#6c5ce7]" />
                    <h3 className="text-lg font-bold text-white tracking-tight">Order Details</h3>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-gray-400 uppercase tracking-wider">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors group"><X className="w-5 h-5 text-gray-500 group-hover:text-white" /></button>
              </div>

              <div className="p-6 space-y-8">
                 {/* Metadata Grid */}
                 <div className="grid grid-cols-3 gap-6">
                    <div>
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Customer / Table</p>
                       <p className="text-sm font-semibold text-white">
                          {selectedOrder.customerName || (selectedOrder.table?.number ? `Table ${selectedOrder.table.number}` : 'Direct Order')}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Date & Time</p>
                       <p className="text-sm font-medium text-gray-300">
                          {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Payment & Status</p>
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusColor(selectedOrder.status)}`}>
                             {getStatusLabel(selectedOrder.status)}
                          </span>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                             {selectedOrder.payment?.method === 'CASH' && <Banknote className="w-3 h-3 text-emerald-500" />}
                             {selectedOrder.payment?.method === 'CARD' && <CreditCard className="w-3 h-3 text-blue-500" />}
                             {selectedOrder.payment?.method === 'QR' && <QrCode className="w-3 h-3 text-amber-500" />}
                             <span className="text-[10px] font-bold text-white uppercase tracking-tighter italic">
                                {selectedOrder.payment?.method || 'Unpaid'}
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Items Table */}
                 <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Order Breakdown</p>
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                       <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-white/5 border-b border-white/5">
                             <tr>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item Description</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Qty</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Price</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03]">
                             {selectedOrder.items?.map((item: any, idx: number) => (
                               <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-5 py-4 font-semibold text-gray-200">{item.product?.name}</td>
                                  <td className="px-5 py-4 font-mono text-center text-gray-400">{item.quantity}</td>
                                  <td className="px-5 py-4 text-right text-gray-400">Rs. {item.price.toLocaleString()}</td>
                                  <td className="px-5 py-4 text-right font-bold text-white italic tracking-tighter">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Final Calculations */}
                 <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div className="space-y-4">
                       <button 
                         onClick={() => window.print()}
                         className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                       >
                          <Printer className="w-3.5 h-3.5" />
                          Generate Receipt
                       </button>
                    </div>
                    <div className="w-64 space-y-2">
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-600">
                          <span>Subtotal</span>
                          <span className="text-gray-300">Rs. {calculateBill(selectedOrder).subtotal.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-600">
                          <span>Tax</span>
                          <span className="text-gray-300">Rs. {calculateBill(selectedOrder).tax.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-base font-black italic tracking-tighter text-white pt-2 border-t border-white/5">
                          <span className="text-emerald-500 uppercase tracking-[0.2em] text-[10px] not-italic mt-1">Total Payable</span>
                          <span className="text-2xl">Rs. {calculateBill(selectedOrder).total.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
