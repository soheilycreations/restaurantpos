"use client";

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { 
  Search, Filter, Plus, Edit2, 
  Trash2, X, Package, CheckCircle2,
  ChevronLeft, ChevronRight, Upload,
  MoreVertical, Box, ArrowUpRight,
  Database, AlertCircle
} from 'lucide-react';
import { productsApi, categoriesApi } from '../../lib/api';
import { formatPrice } from '../../../../pos/src/lib/utils';
import { useToast } from '../../components/BikoToast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pData, cData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll()
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showToast('System connectivity error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        categoryId: product.categoryId || '',
        description: product.description || '',
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        categoryId: categories[0]?.id || '',
        description: '',
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        showToast('Inventory asset optimized', 'success');
      } else {
        await productsApi.create(payload);
        showToast('New asset indexed successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Deployment transaction failed', 'error');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, image: `http://localhost:3001${data.url}` }));
      showToast('Visual asset indexed', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Asset upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset from the catalog?')) return;
    try {
      await productsApi.delete(id);
      showToast('Asset decommissioned', 'success');
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Decommissioning failed', 'error');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0e14]">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto flex flex-col custom-scrollbar bg-[#0b101a]">
        {/* Header */}
        <header className="px-10 py-10 flex items-center justify-between border-b border-white/[0.05] bg-[#0b101a]/80 backdrop-blur-xl sticky top-0 z-30 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6c5ce7] to-transparent opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#6c5ce7]/10 flex items-center justify-center border border-[#6c5ce7]/20">
                  <Box className="w-6 h-6 text-[#6c5ce7]" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Catalog Assets</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black tracking-widest uppercase rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Direct Node Storage Active
                    </span>
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                      SQLite Synchronization: 100%
                    </span>
                  </div>
               </div>
            </div>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={() => handleOpenModal()}
               className="flex items-center gap-3 bg-[#6c5ce7] text-white px-8 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-[0.95] shadow-2xl shadow-[#6c5ce7]/40 group border border-white/10"
             >
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> Index New Asset
             </button>
             
             <button 
              onClick={() => document.getElementById('excelImport')?.click()}
              className="flex items-center gap-3 bg-white/[0.05] text-gray-400 border border-white/10 px-6 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/[0.08] hover:text-white"
             >
                <Upload className="w-4 h-4" /> Import Excel
             </button>
             <input 
               id="excelImport"
               type="file" 
               className="hidden" 
               accept=".xlsx,.xls"
               onChange={async (e) => {
                 const file = e.target.files?.[0];
                 if (!file) return;
                 
                 const formData = new FormData();
                 formData.append('file', file);
                 const params = new URLSearchParams(window.location.search);
                 const restaurantId = params.get('restaurantId') || "16ae97cd-c992-4103-9e58-f7c0671cc29d";
                 formData.append('restaurantId', restaurantId);

                 try {
                   setIsImporting(true);
                   showToast('Importing products...', 'info');
                   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                   const res = await fetch(`${apiUrl}/import/excel`, {
                     method: 'POST',
                     body: formData
                   });
                   const data = await res.json();
                   if (res.ok) {
                     showToast(`Import successful! ${data.count} items added.`, 'success');
                     fetchData();
                   } else {
                     throw new Error(data.message || 'Import failed');
                   }
                 } catch (err: any) {
                   showToast(err.message || 'Import failed', 'error');
                 } finally {
                   setIsImporting(false);
                 }
               }}
             />
          </div>
        </header>

        {isImporting && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-[#0b101a] border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center gap-6 shadow-2xl">
                 <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Database className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
                 <div className="text-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Processing Catalog</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Synchronizing data with secure node storage...</p>
                 </div>
              </div>
           </div>
        )}

        <div className="p-10 space-y-12 animate-premium-fade">
           {/* Top Filter Buttons */}
           <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-1">Global Taxonomy</h3>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Filter system assets by logical categorization</p>
                </div>
                <div className="relative group">
                   <div className="absolute inset-0 bg-[#6c5ce7]/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c5ce7] transition-colors" />
                   <input 
                    type="text" 
                    placeholder="Search designation..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="relative bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white placeholder:text-gray-700 focus:outline-none focus:border-[#6c5ce7]/50 w-80 transition-all uppercase tracking-widest focus:bg-white/[0.04]"
                   />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                 <button 
                  onClick={() => setSelectedCategory('All')}
                  className={`px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all border ${
                    selectedCategory === 'All' 
                    ? 'bg-white text-[#0b101a] border-white shadow-2xl shadow-white/10 scale-105' 
                    : 'bg-white/[0.02] text-gray-500 border-white/[0.05] hover:bg-white/[0.05] hover:text-white'
                  }`}
                 >
                    Full Index
                 </button>
                 {categories.map(cat => (
                   <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedCategory === cat.id 
                      ? 'bg-[#6c5ce7] text-white border-transparent shadow-2xl shadow-[#6c5ce7]/30 scale-105' 
                      : 'bg-white/[0.02] text-gray-500 border-white/[0.05] hover:bg-white/[0.05] hover:text-white'
                    }`}
                   >
                      {cat.name}
                   </button>
                 ))}
              </div>
           </div>

           {/* Asset Grid */}
           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {[1,2,3,4,5,6,7,8].map(n => (
                   <div key={n} className="h-[28rem] rounded-[3rem] bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
                ))}
             </div>
           ) : filtered.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-40 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] flex items-center justify-center mb-8 border border-white/[0.05] shadow-inner">
                   <Box className="w-10 h-10 text-gray-800" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase">Null Index</h3>
                <p className="text-gray-600 text-xs mt-3 uppercase tracking-[0.2em] font-black">No assets found in current logical sector</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filtered.map(product => (
                  <div key={product.id} className="premium-card group relative p-4 rounded-[3rem] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 border border-white/[0.06] hover:border-[#6c5ce7]/30">
                     {/* Card Image Area */}
                     <div className="aspect-square relative overflow-hidden rounded-[2.5rem] bg-black/40">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20">
                             <Package className="w-16 h-16 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b101a] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        
                        <div className="absolute top-5 left-5">
                           <span className="px-4 py-2 bg-[#0b101a]/80 backdrop-blur-md rounded-xl text-[9px] font-black border border-white/10 text-[#a29bfe] uppercase tracking-[0.2em]">
                              {categories.find(c => c.id === product.categoryId)?.name || 'General'}
                           </span>
                        </div>
                     </div>

                     {/* Info Area */}
                     <div className="p-6 pt-8 space-y-6">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="text-xl font-black text-white tracking-tighter uppercase mb-2 group-hover:text-[#a29bfe] transition-colors">{product.name}</h3>
                              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest line-clamp-1 italic">
                                 UID: {product.id.split('-')[0]}
                              </p>
                           </div>
                           <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-gray-700 group-hover:text-[#6c5ce7] transition-all group-hover:border-[#6c5ce7]/20 shadow-inner">
                              <ArrowUpRight className="w-5 h-5" />
                           </div>
                        </div>
                        
                        <div className="flex items-end justify-between border-t border-white/[0.05] pt-6 mt-auto">
                           <div>
                              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-2">Market Value</p>
                              <p className="text-2xl font-black text-white italic tracking-tighter">
                                 <span className="text-[11px] text-gray-600 not-italic mr-1.5 font-bold uppercase">LKR</span>
                                 {formatPrice(product.price)}
                              </p>
                           </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleOpenModal(product)}
                                 className="w-12 h-12 rounded-[1.25rem] bg-white/[0.03] border border-white/[0.05] text-gray-500 hover:text-white hover:bg-[#6c5ce7] hover:border-[#6c5ce7] transition-all shadow-xl hover:shadow-[#6c5ce7]/30 flex items-center justify-center group/btn"
                               >
                                  <Edit2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                               </button>
                               <button 
                                 onClick={() => handleDelete(product.id)}
                                 className="w-12 h-12 rounded-[1.25rem] bg-white/[0.03] border border-white/[0.05] text-gray-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all shadow-xl hover:shadow-rose-500/30 flex items-center justify-center group/btn"
                               >
                                  <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                               </button>
                            </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </main>

      {/* Optimized Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[#0b101a]/95 backdrop-blur-2xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#0b101a] border border-white/[0.1] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] w-full max-w-5xl overflow-hidden animate-premium-fade ring-1 ring-white/5">
              <div className="p-16">
                 <div className="flex justify-between items-start mb-16">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                           <div className="w-14 h-14 rounded-[1.5rem] bg-[#6c5ce7] flex items-center justify-center shadow-2xl shadow-[#6c5ce7]/50 border border-white/20">
                              <Database className="w-7 h-7 text-white" />
                           </div>
                           <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">{editingProduct ? 'Update Node' : 'Register Asset'}</h3>
                        </div>
                        <p className="text-[12px] text-gray-500 uppercase tracking-[0.4em] font-black pl-1.5">Intelligence Access Layer v4.0</p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)} 
                      className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-[1.25rem] flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 transition-all group active:scale-90"
                    >
                      <X className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                 </div>

                 <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-16">
                    <div className="col-span-2 space-y-10">
                        {/* Image Upload Area */}
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Visual Recognition Patch</label>
                           <div 
                             onDragEnter={handleDrag}
                             onDragLeave={handleDrag}
                             onDragOver={handleDrag}
                             onDrop={handleDrop}
                             className={`relative aspect-square rounded-[3rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${
                               dragActive 
                                 ? 'border-[#6c5ce7] bg-[#6c5ce7]/10 scale-[1.02]' 
                                 : 'border-white/[0.08] bg-white/[0.01] hover:border-[#6c5ce7]/30 hover:bg-white/[0.02]'
                             }`}
                             onClick={() => document.getElementById('fileInput')?.click()}
                           >
                              {formData.image ? (
                                <>
                                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                     <Upload className="w-8 h-8 text-[#6c5ce7] animate-bounce" />
                                     <p className="text-[10px] font-black text-white uppercase tracking-widest text-center px-6">Inject New Stream</p>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center p-10 space-y-4 transition-transform group-hover:scale-110 duration-500">
                                   <div className="w-20 h-20 rounded-3xl bg-[#6c5ce7]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#6c5ce7] transition-all duration-500">
                                      {uploading ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload className="w-8 h-8 text-[#6c5ce7] group-hover:text-white transition-colors" />}
                                   </div>
                                   <h4 className="text-sm font-black text-white uppercase tracking-widest">Link Visual Node</h4>
                                   <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider leading-relaxed">
                                      Drop high-res JPG/PNG here<br />or click to browse local files
                                   </p>
                                </div>
                              )}
                              <input 
                                id="fileInput"
                                type="file" 
                                className="hidden" 
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                accept="image/*"
                              />
                           </div>
                        </div>
                    </div>

                    <div className="col-span-3 space-y-12">
                        <div className="grid grid-cols-2 gap-10">
                           <div className="space-y-4">
                              <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Unique Designation</label>
                              <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-white font-black focus:outline-none focus:border-[#6c5ce7] focus:bg-white/[0.04] transition-all placeholder:text-gray-800 uppercase tracking-widest text-sm italic shadow-inner"
                                placeholder="e.g. CORE.BEEF.MIX"
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Valuation (LKR)</label>
                              <input 
                                type="number" 
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-[#6c5ce7] font-black text-2xl focus:outline-none focus:border-[#6c5ce7] focus:bg-white/[0.04] transition-all italic tracking-tighter shadow-inner"
                                placeholder="0,000"
                              />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Taxonomy Sector</label>
                           <div className="relative">
                              <select 
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-gray-300 font-black focus:outline-none focus:border-[#6c5ce7] focus:bg-white/[0.04] transition-all appearance-none uppercase text-xs tracking-[0.2em] shadow-inner"
                              >
                                 <option value="">SELECT LOGICAL CLASS</option>
                                 {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0b101a]">{c.name}</option>)}
                              </select>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                 <ChevronRight className="w-5 h-5 rotate-90" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Technical Specifications</label>
                           <textarea 
                             rows={6}
                             value={formData.description}
                             onChange={(e) => setFormData({...formData, description: e.target.value})}
                             className="w-full bg-white/[0.02] border border-white/[0.08] rounded-3xl px-6 py-6 text-gray-400 font-bold focus:outline-none focus:border-[#6c5ce7] focus:bg-white/[0.04] transition-all resize-none text-[13px] leading-relaxed uppercase tracking-tighter placeholder:text-gray-800 shadow-inner"
                             placeholder="Provide detailed narrative for asset history and composition protocols..."
                           />
                        </div>

                        <div className="pt-6">
                           <button 
                             type="submit" 
                             disabled={uploading}
                             className="group w-full py-8 bg-white text-[#0b101a] rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 border border-white disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {uploading ? 'Processing Stream...' : (editingProduct ? 'Commit Node Update' : 'Initialize Indexing')}
                              <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                           </button>
                        </div>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
