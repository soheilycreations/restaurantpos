"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, MapPin, Phone, Mail, 
  ExternalLink, Copy, CheckCircle2, ShieldCheck,
  ChevronRight, Loader2, Store, Settings
} from 'lucide-react';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    managerCode: '8888',
    logoUrl: ''
  });

  const fetchRestaurants = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/restaurant/all`);
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', address: '', phone: '', email: '', managerCode: '8888', logoUrl: '' });
        fetchRestaurants();
      }
    } catch (err) {
      console.error('Failed to add restaurant:', err);
    }
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/restaurant/${showSettingsModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowSettingsModal(null);
        fetchRestaurants();
      }
    } catch (err) {
      console.error('Failed to update restaurant:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isSettings = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formDataUpload
      });
      const data = await res.json();
      if (data.url) {
        const fullUrl = `${apiUrl}${data.url}`;
        setFormData(prev => ({ ...prev, logoUrl: fullUrl }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const launchPOS = (id: string) => {
    const posUrl = process.env.NEXT_PUBLIC_POS_URL || 'http://localhost:3002';
    window.open(`${posUrl}?restaurantId=${id}`, '_blank');
  };

  const openSettings = (shop: any) => {
    setFormData({
      name: shop.name,
      address: shop.address || '',
      phone: shop.phone || '',
      email: shop.email || '',
      managerCode: shop.managerCode || '8888',
      logoUrl: shop.logoUrl || ''
    });
    setShowSettingsModal(shop);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Restaurant Network
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Manage multiple storefronts and POS instances</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', address: '', phone: '', email: '', managerCode: '8888', logoUrl: '' });
            setShowAddModal(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Onboard New Shop
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 opacity-40">
           <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
           <p className="text-xs font-black uppercase tracking-[0.2em]">Synchronizing Network...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {restaurants.map((shop) => (
            <div key={shop.id} className="premium-card rounded-[2.5rem] p-8 flex flex-col gap-6 group relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-colors" />
               
               <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-primary shadow-inner overflow-hidden">
                     {shop.logoUrl ? (
                       <img src={shop.logoUrl} className="w-full h-full object-cover" />
                     ) : (
                       <Store className="w-8 h-8" />
                     )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase border border-emerald-500/20">
                       <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                       Active
                    </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-xl font-black text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{shop.name}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-1">{shop.address || 'No address provided'}</p>
               </div>

               <div className="space-y-3 py-4 border-y border-white/[0.03]">
                  <div className="flex items-center gap-3 text-gray-400">
                     <div className="w-8 h-8 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5"><Phone className="w-3.5 h-3.5 text-primary/60" /></div>
                     <span className="text-xs font-bold">{shop.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                     <div className="w-8 h-8 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5"><ShieldCheck className="w-3.5 h-3.5 text-primary/60" /></div>
                     <span className="text-xs font-bold">Code: {shop.managerCode}</span>
                  </div>
               </div>

               <div className="mt-auto pt-2 space-y-4">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Restaurant Tenant ID</label>
                     <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-2 group/id">
                        <code className="text-[10px] text-gray-400 font-mono truncate flex-1">{shop.id}</code>
                        <button 
                          onClick={() => copyToClipboard(shop.id)}
                          className="text-gray-600 hover:text-white transition-colors"
                        >
                           {copiedId === shop.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <button 
                        onClick={() => openSettings(shop)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/[0.05] hover:text-white transition-all"
                     >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                     </button>
                     <button 
                        onClick={() => window.location.href = `/?restaurantId=${shop.id}`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/30 hover:text-white transition-all"
                     >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Manage
                     </button>
                  </div>
                  <button 
                     onClick={() => launchPOS(shop.id)}
                     className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:shadow-primary/30 transition-all mt-3"
                  >
                     <ExternalLink className="w-3.5 h-3.5" />
                     Launch POS
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals Container */}
      {(showAddModal || showSettingsModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-[#0b101a] border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setShowSettingsModal(null);
                  }} 
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-rose-500/20 transition-all"
                >
                   <Plus className="w-6 h-6 rotate-45" />
                </button>
             </div>

             <div className="mb-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  {showAddModal ? 'Onboard New Shop' : 'Shop Settings'}
                </h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                  {showAddModal ? 'Create a new instance for your POS network' : `Configuring ${showSettingsModal?.name}`}
                </p>
             </div>

             <form onSubmit={showAddModal ? handleAddRestaurant : handleUpdateRestaurant} className="space-y-6">
                {/* Logo Upload Section */}
                <div className="flex flex-col items-center mb-4">
                   <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all">
                         {formData.logoUrl ? (
                            <img src={formData.logoUrl} className="w-full h-full object-cover" />
                         ) : (
                            <div className="flex flex-col items-center gap-1 opacity-40">
                               <Plus className="w-5 h-5" />
                               <span className="text-[8px] font-black uppercase">Logo</span>
                            </div>
                         )}
                         {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                               <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                         )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Restaurant Name *</label>
                   <input 
                     required
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     placeholder="e.g. Gourmet Central"
                     className="w-full bg-white/[0.02] border-2 border-white/5 focus:border-primary/30 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Full Address</label>
                   <input 
                     value={formData.address}
                     onChange={(e) => setFormData({...formData, address: e.target.value})}
                     placeholder="123 Luxury Ave, Colombo"
                     className="w-full bg-white/[0.02] border-2 border-white/5 focus:border-primary/30 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none transition-all"
                   />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Contact Phone</label>
                      <input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full bg-white/[0.02] border-2 border-white/5 focus:border-primary/30 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Manager PIN</label>
                      <input 
                        maxLength={4}
                        value={formData.managerCode}
                        onChange={(e) => setFormData({...formData, managerCode: e.target.value})}
                        placeholder="8888"
                        className="w-full bg-white/[0.02] border-2 border-white/5 focus:border-primary/30 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none transition-all"
                      />
                   </div>
                </div>

                <div className="pt-6">
                   <button 
                     type="submit"
                     disabled={uploading}
                     className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50"
                   >
                     {showAddModal ? 'Complete Onboarding' : 'Save Changes'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
