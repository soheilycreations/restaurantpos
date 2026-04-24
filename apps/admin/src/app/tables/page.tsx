"use client";

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { 
  Plus, Search, Edit2, Trash2, Users, 
  ChevronRight, LayoutGrid, CheckCircle2, X,
  ArrowUpRight, Database, Monitor
} from 'lucide-react';
import { tablesApi } from '../../lib/api';
import { useToast } from '../../components/BikoToast';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [formData, setFormData] = useState({ number: '', capacity: 4 });
  const { showToast } = useToast();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await tablesApi.getAll();
      setTables(data);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      showToast('Seating inventory sync failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table: any = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({ number: table.number.toString(), capacity: table.capacity });
    } else {
      setEditingTable(null);
      setFormData({ number: (tables.length + 1).toString(), capacity: 4 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        number: parseInt(formData.number),
        capacity: formData.capacity
      };

      if (editingTable) {
        await tablesApi.update(editingTable.id, payload);
        showToast('Configuration updated', 'success');
      } else {
        await tablesApi.create(payload);
        showToast('New table indexed', 'success');
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Initialization failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this table?')) return;
    try {
      await tablesApi.delete(id);
      showToast('Resource decommissioned', 'success');
      fetchTables();
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Resource is currently locked', 'error');
    }
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
                  <LayoutGrid className="w-6 h-6 text-[#6c5ce7]" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Spatial Units</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-[#6c5ce7]/10 text-[#a29bfe] text-[9px] font-black tracking-widest uppercase rounded-lg border border-[#6c5ce7]/20 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7] animate-pulse"></div>
                        Zone Monitor Active
                    </span>
                  </div>
               </div>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 bg-[#6c5ce7] text-white px-8 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-[0.95] shadow-2xl shadow-[#6c5ce7]/40 group border border-white/10"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> Index New Unit
          </button>
        </header>

        <div className="p-10 space-y-12 animate-premium-fade">
           {/* Stats Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="premium-card group">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Total Inventory</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-white italic tracking-tighter">{tables.length}<span className="text-lg not-italic text-gray-700 ml-2 uppercase">Units</span></h3>
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:bg-[#6c5ce7]/20 group-hover:text-[#6c5ce7] group-hover:border-[#6c5ce7]/30 transition-all duration-500 transform group-hover:rotate-12">
                       <LayoutGrid className="w-7 h-7" />
                    </div>
                 </div>
              </div>
              <div className="premium-card group">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Guest Capacity</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-emerald-500 italic tracking-tighter">{tables.reduce((acc, t) => acc + t.capacity, 0)}<span className="text-lg not-italic text-gray-700 ml-2 uppercase">Posts</span></h3>
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-500 transform group-hover:-rotate-12">
                       <CheckCircle2 className="w-7 h-7" />
                    </div>
                 </div>
              </div>
              <div className="premium-card group">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Infrastructure</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#a29bfe] italic tracking-tighter">Stable<span className="text-lg not-italic text-gray-700 ml-2 uppercase">Core</span></h3>
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 group-hover:bg-[#a29bfe]/20 group-hover:text-[#a29bfe] group-hover:border-[#a29bfe]/30 transition-all duration-500 transform group-hover:scale-110">
                       <Database className="w-7 h-7" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Unit Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {loading ? (
              [1,2,3,4].map(n => <div key={n} className="h-[18rem] rounded-[3rem] bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>)
            ) : tables.length === 0 ? (
              <div className="col-span-full py-40 text-center">
                 <h3 className="text-2xl font-black text-gray-800 uppercase tracking-[0.5em]">Null Units</h3>
              </div>
            ) : (
              tables.map((t) => (
                <div key={t.id} className="premium-card group relative p-8 flex flex-col justify-between hover:border-[#6c5ce7]/30">
                   <div>
                      <div className="flex justify-between items-start mb-8">
                         <div className="w-16 h-16 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-600 group-hover:text-[#6c5ce7] group-hover:bg-[#6c5ce7]/10 group-hover:border-[#6c5ce7]/20 transition-all duration-700">
                            <LayoutGrid className="w-8 h-8" />
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenModal(t)}
                              className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-white hover:bg-[#6c5ce7] hover:border-[#6c5ce7] transition-all shadow-xl flex items-center justify-center"
                            >
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(t.id)}
                              className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all shadow-xl flex items-center justify-center"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                      <h4 className="text-4xl font-black text-white group-hover:text-[#6c5ce7] transition-colors mb-2 uppercase tracking-tighter italic">UNIT {t.number}</h4>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Capacity: <span className="text-white italic">{t.capacity} Souls</span></p>
                   </div>
                   
                   <div className="mt-12 pt-8 border-t border-white/[0.05] flex items-center justify-between group-hover:border-[#6c5ce7]/20 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full shadow-lg ${t.status === 'OCCUPIED' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20 animate-pulse'}`}></div>
                         <span className={`text-[10px] font-black tracking-widest uppercase ${t.status === 'OCCUPIED' ? 'text-amber-500' : 'text-emerald-500'}`}>{t.status || 'AVAILABLE'}</span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-800 group-hover:text-white transition-all transform group-hover:rotate-45" />
                   </div>
                </div>
              ))
            )}
           </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0b0e14]/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#1a1f2e] border border-white/[0.08] rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up">
              <div className="p-12">
                 <div className="flex justify-between items-start mb-12 text-left">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 rounded-2xl bg-[#6c5ce7] flex items-center justify-center shadow-2xl shadow-[#6c5ce7]/40">
                              <LayoutGrid className="w-5 h-5 text-white" />
                           </div>
                           <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{editingTable ? 'Recalibrate Unit' : 'Index Unit'}</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-black pl-1">Seating Architecture Protocol</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors"><X className="w-7 h-7 text-gray-500" /></button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-10 text-left">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Unit Designation (Number)</label>
                       <input 
                         type="number" 
                         required
                         value={formData.number}
                         onChange={(e) => setFormData({...formData, number: e.target.value})}
                         className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-5 text-white font-black italic text-2xl focus:outline-none focus:border-[#6c5ce7] focus:bg-white/[0.04] transition-all"
                         placeholder="01"
                       />
                    </div>
                    
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Payload Capacity (Guests)</label>
                       <div className="grid grid-cols-4 gap-4">
                          {[2, 4, 6, 8].map(cap => (
                            <button
                              key={cap}
                              type="button"
                              onClick={() => setFormData({...formData, capacity: cap})}
                              className={`py-5 rounded-2xl border-2 font-black transition-all text-sm ${
                                formData.capacity === cap ? 'bg-[#6c5ce7] border-[#6c5ce7] text-white shadow-2xl shadow-[#6c5ce7]/30 scale-[1.05]' : 'bg-white/[0.02] border-white/[0.05] text-gray-500 hover:text-white'
                              }`}
                            >
                              {cap}
                            </button>
                          ))}
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      className="group w-full py-7 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#6c5ce7]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4"
                    >
                       {editingTable ? 'Commit Configuration' : 'Confirm Deployment'}
                       <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
