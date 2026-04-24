"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Palette, 
  Printer, CheckCircle2, Save, Loader2, RefreshCw, 
  ShieldCheck, ChevronRight, Lock, Upload, Image 
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { ThemeHandler } from '../../components/ThemeHandler';

const PRESET_COLORS = [
  { name: 'Royal Purple', hex: '#6c5ce7' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Classic Crimson', hex: '#ef4444' },
  { name: 'Ocean Blue', hex: '#3b82f6' },
  { name: 'Golden Amber', hex: '#f59e0b' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    primaryColor: '#6c5ce7',
    printLogo: true,
    managerCode: '8888',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'printing' | 'security'>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:3001/restaurant', {
        headers: {
          'x-tenant-id': '16ae97cd-c992-4103-9e58-f7c0671cc29d'
        }
      });
      const data = await res.json();
      if (data) setSettings(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch failed:', err);
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo too large! Please keep it under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Use relative origin if needed, but for now explicitly port 3001
      const API_URL = 'http://localhost:3001/restaurant'; 
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '16ae97cd-c992-4103-9e58-f7c0671cc29d'
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Server error');
      }
      setSaveSuccess(true);
      // Update local theme immediately
      document.documentElement.style.setProperty('--brand-primary', settings.primaryColor);
      setTimeout(() => setSaveSuccess(false), 3000);
      setSaving(false);
    } catch (err: any) {
      console.error('Save failed:', err);
      setSaving(false);
      alert(`Save Failed: ${err.message || 'Check if API is running on port 3001'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b101a]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
           <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
           <p className="text-xs font-black uppercase tracking-[0.3em]">Synching settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b101a] overflow-hidden">
      <AdminSidebar />
      <ThemeHandler restaurant={settings} />

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-3">System Control</h1>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Configure restaurant identity & security</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl disabled:opacity-50 ${
                saveSuccess ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:scale-105 active:scale-95'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Synchronizing...' : saveSuccess ? 'Saved Successfully' : 'Commit Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { id: 'general',  label: 'General Info', icon: Building2 },
                { id: 'branding', label: 'Identity & Theme', icon: Palette },
                { id: 'security', label: 'Security & Access', icon: ShieldCheck },
                { id: 'printing', label: 'Printing Prefs', icon: Printer },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all border ${
                    activeTab === tab.id 
                      ? 'bg-primary/10 border-primary/20 text-white shadow-xl' 
                      : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && <ChevronRight className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </div>

            {/* Console Content */}
            <div className="lg:col-span-3">
              <div className="bg-[#111723] border border-white/[0.05] rounded-[3rem] p-12 shadow-2xl space-y-12 relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] -mr-40 -mt-40" />
                
                {activeTab === 'general' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Restaurant Name</label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors group-focus-within:text-primary" />
                          <input 
                            className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-primary/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all placeholder:text-gray-800"
                            placeholder="e.g. Soheilys Kitchen"
                            value={settings.name}
                            onChange={(e) => setSettings({...settings, name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Support Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors group-focus-within:text-primary" />
                          <input 
                            className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-primary/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all placeholder:text-gray-800"
                            placeholder="admin@restaurant.com"
                            value={settings.email || ''}
                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Physical Address</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors group-focus-within:text-primary" />
                        <input 
                          className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-primary/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all placeholder:text-gray-800"
                          placeholder="Store address..."
                          value={settings.address || ''}
                          onChange={(e) => setSettings({...settings, address: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Telephone Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors group-focus-within:text-primary" />
                          <input 
                            className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-primary/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all placeholder:text-gray-800"
                            placeholder="+94 7X XXX XXXX"
                            value={settings.phone || ''}
                            onChange={(e) => setSettings({...settings, phone: e.target.value})}
                          />
                        </div>
                      </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Visual Identity / Logo URL</label>
                      <div className="flex items-start gap-8">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center relative group overflow-hidden shadow-inner cursor-pointer">
                          {settings.logoUrl ? (
                             <img src={settings.logoUrl} className="w-full h-full object-cover" />
                          ) : (
                             <Image className="w-8 h-8 text-gray-800" />
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Upload className="w-5 h-5 text-white" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                          </label>
                        </div>
                        <div className="space-y-4 flex-1">
                           <p className="text-xs font-bold text-gray-400">Brand Icon (PNG/JPG/SVG)</p>
                           <button 
                             onClick={() => document.getElementById('logoInput')?.click()}
                             className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2"
                           >
                              <Upload className="w-3.5 h-3.5" />
                              Select Image File
                           </button>
                           <input 
                              id="logoInput"
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleLogoUpload}
                           />
                           <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest leading-relaxed">
                              Uploaded logos are optimized for sidebars <br/> and digital receipt headers.
                           </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">System Primary Color</label>
                       <div className="grid grid-cols-5 gap-6">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color.hex}
                              onClick={() => setSettings({...settings, primaryColor: color.hex})}
                              className={`group relative h-16 rounded-[1.5rem] transition-all border-2 flex items-center justify-center overflow-hidden ${
                                settings.primaryColor === color.hex ? 'border-white scale-[1.08] shadow-2xl' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            >
                              {settings.primaryColor === color.hex && (
                                 <div className="bg-white rounded-full p-1.5 shadow-lg">
                                   <CheckCircle2 className="w-4 h-4 text-black" />
                                 </div>
                              )}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                          <Lock className="w-6 h-6" />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">POS Authorization Control</h3>
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                            Configure the 4-digit numeric code required for high-privileged <br/> actions such as applying discounts or voiding items.
                          </p>
                       </div>
                    </div>

                    <div className="max-w-[320px] space-y-4">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Active Manager Code</label>
                       <div className="relative group">
                          <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary" />
                          <input 
                            type="password"
                            maxLength={4}
                            className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-primary/30 rounded-[1.5rem] py-5 pl-14 pr-6 text-2xl font-black tracking-[0.5em] text-white outline-none transition-all placeholder:text-gray-800"
                            placeholder="****"
                            value={settings.managerCode || ''}
                            onChange={(e) => setSettings({...settings, managerCode: e.target.value.replace(/\D/g, '')})}
                          />
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'printing' && (
                   <div className="space-y-10 animate-in fade-in duration-500">
                      <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.05]">
                        <div className="space-y-2">
                           <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">Branded Receipts</h3>
                           <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Display restaurant logo on thermal printed bills</p>
                        </div>
                        <button 
                          onClick={() => setSettings({...settings, printLogo: !settings.printLogo})}
                          className={`w-16 h-9 rounded-full relative transition-all shadow-inner ${settings.printLogo ? 'bg-primary' : 'bg-gray-800'}`}
                        >
                           <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${settings.printLogo ? 'left-8' : 'left-1.5'}`} />
                        </button>
                      </div>

                      <div className="aspect-video border-2 border-dashed border-white/[0.03] rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.01]">
                         <Printer className="w-12 h-12 text-gray-800 mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-800">Advanced Print Controller \ Offline</p>
                      </div>
                   </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
