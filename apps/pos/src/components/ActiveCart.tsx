import React, { useState, useEffect } from 'react';
import { usePOSStore } from '../lib/store';
import { 
  ShoppingCart, X, Minus, Plus, Trash2, MapPin, Printer, ArrowRight, 
  ShoppingBag, Truck, Flame, Ticket, ShieldCheck, Percent, Banknote, CheckCircle2, MessageSquare, Receipt
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { generateLankaQRString } from '../lib/lankaqr';
import { useNotify } from './NotificationProvider';
import { ordersApi } from '../lib/api';

export function ActiveCart() {
  const { 
    tableCarts, 
    tableDiscounts,
    tableInvoiced,
    activeTableId, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    setPaymentModalOpen,
    setActiveTable,
    markAsPrinted,
    applyDiscount,
    removeDiscount,
    setTableInvoiced,
    setTableOrderId,
    tableOrderIds,
    setPrintData,
    tables
  } = usePOSStore();
  
  const { notify } = useNotify();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  
  // Local states for inputs
  const [staffDiscountValue, setStaffDiscountValue] = useState('10');
  const [customFixedValue, setCustomFixedValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');

  const cart = activeTableId ? (tableCarts[activeTableId] || []) : [];
  const discountInfo = activeTableId ? tableDiscounts[activeTableId] : null;
  const isInvoiced = activeTableId ? tableInvoiced[activeTableId] : false;
  
  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const isTakeaway = activeTableId === 'takeaway';
  const isDelivery = activeTableId === 'delivery';

  // Calculate Discount
  let discountAmount = 0;
  if (discountInfo) {
    if (discountInfo.type === 'percent') {
      discountAmount = (subtotal * discountInfo.value) / 100;
    } else {
      discountAmount = discountInfo.value;
    }
  }

  const serviceCharge = (subtotal - discountAmount) * ((isTakeaway || isDelivery) ? 0 : 0.1);
  const total = subtotal - discountAmount + serviceCharge;

  const hasUnprinted = cart.some(item => !item.isPrinted);
  const currentTable = tables.find(t => t.id === activeTableId);

  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const tenantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || "16ae97cd-c992-4103-9e58-f7c0671cc29d";

    fetch(`${apiUrl}/restaurant`, {
      headers: { 'x-tenant-id': tenantId }
    })
    .then(res => res.json())
    .then(data => setRestaurant(data));
  }, []);

  const handleBillOut = () => {
    if (!activeTableId || cart.length === 0) return;
    setIsProcessing(true);
    
    // Generate LankaQR for the draft
    const draftQr = generateLankaQRString({
      merchantName: 'WebPOS',
      merchantCity: 'Colombo',
      merchantId: '1234567890',
      amount: total,
      reference: `INV-${activeTableId.slice(-4).toUpperCase()}`
    });

    const draftData = {
      restaurantName: restaurant?.name || 'WebPOS',
      address: restaurant?.address || '',
      phone: restaurant?.phone || '',
      logoUrl: restaurant?.logoUrl || null,
      orderId: activeTableId,
      date: new Date().toLocaleString(),
      table: isTakeaway ? 'TAKEAWAY' : isDelivery ? 'DELIVERY' : `Table ${currentTable?.number || '...'}`,
      items: [...cart], // Deep copy to ensure binding
      subtotal: subtotal,
      discount: discountAmount,
      serviceCharge: serviceCharge,
      total: total,
      paymentMethod: 'QR (Draft)',
      qrString: draftQr,
      isFinal: false
    };

    // Trigger Centralized Print
    setPrintData(draftData);
    setTableInvoiced(activeTableId, true);
    
    // EARLY PERSISTENCE: Save to DB as PENDING for Admin Visibility (Only if not already created)
    if (!tableOrderIds[activeTableId]) {
      ordersApi.create({
        totalAmount: total,
        tableId: (isTakeaway || isDelivery) ? null : activeTableId,
        status: 'PENDING',
        discountAmount: discountAmount,
        taxAmount: serviceCharge,
        items: cart.map((i: any) => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price
        }))
      })
      .then(order => setTableOrderId(activeTableId, order.id))
      .catch(err => console.error('Early Persistence Failed:', err));
    }

    setTimeout(() => {
       window.print();
       setPrintData(null); // Clear buffer after print
    }, 250);

    setIsProcessing(false);
    notify('Invoice Issued Successfully', 'info');
  };

  const handlePrintKOT = () => {
    if (!activeTableId || cart.length === 0) return;
    
    const unprintedItems = cart.filter(item => !item.isPrinted);
    if (unprintedItems.length === 0) {
      notify('All items already printed', 'info');
      return;
    }

    setIsProcessing(true);

    const kotData = {
      restaurantName: restaurant?.name || 'WebPOS',
      type: 'KOT',
      orderId: activeTableId,
      date: new Date().toLocaleString(),
      table: isTakeaway ? 'TAKEAWAY' : isDelivery ? 'DELIVERY' : `Table ${currentTable?.number || '...'}`,
      items: unprintedItems,
      subtotal: 0,
      serviceCharge: 0,
      total: 0,
      paymentMethod: 'KOT'
    };

    setPrintData(kotData);
    
    // EARLY PERSISTENCE: Save to DB as PENDING on KOT (Only if not already created)
    if (!tableOrderIds[activeTableId]) {
      ordersApi.create({
        totalAmount: total,
        tableId: (isTakeaway || isDelivery) ? null : activeTableId,
        status: 'PENDING',
        discountAmount: discountAmount,
        taxAmount: serviceCharge,
        items: cart.map((i: any) => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price
        }))
      })
      .then(order => setTableOrderId(activeTableId, order.id))
      .catch(err => console.error('Early Persistence Failed:', err));
    }

    setTimeout(() => {
      window.print();
      setPrintData(null);
      markAsPrinted(activeTableId);
      setIsProcessing(false);
      notify('KOT Sent to Kitchen', 'success');
    }, 250);
  };

  const handleVerifyManager = () => {
    if (authCode === (restaurant?.managerCode || '8888')) {
      setAuthError(false);
      setShowAuth(false);
      setShowDiscountForm(true);
      setAuthCode('');
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 1000);
    }
  };

  const handleApplyDiscount = (type: 'fixed' | 'percent', value: number) => {
    if (!activeTableId || !discountReason.trim()) return;
    applyDiscount(activeTableId, type, value, discountReason.trim());
    setShowDiscountForm(false);
    setDiscountReason('');
  };

  return (
    <aside className="w-full bg-white dark:bg-[#0b101a] flex flex-col h-full transition-colors duration-300 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 dark:border-white/[0.03]">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Bill Summary</h2>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mt-1.5 flex items-center gap-2">
             {cart.length} delicacies
             {isInvoiced && <span className="text-[8px] bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]/20 px-1.5 py-0.5 rounded-full">INVOICED OUT</span>}
          </p>
        </div>
        {cart.length > 0 && !isInvoiced && (
          <button
            onClick={() => clearCart()}
            className="w-10 h-10 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 flex items-center justify-center transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table/Takeaway Context */}
      <div className="px-5 mt-6">
        {activeTableId ? (
          <div className={`flex items-center gap-3 border rounded-2xl px-4 py-3 ${
            isTakeaway 
            ? 'bg-[#6c5ce7]/5 border-[#6c5ce7]/20' 
            : isDelivery
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-emerald-500/5 dark:bg-white/[0.05] border-emerald-500/20 border-opacity-50 shadow-sm'
          }`}>
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-lg ${
                isTakeaway ? 'bg-[#6c5ce7] shadow-[#6c5ce7]/20' : 
                isDelivery ? 'bg-amber-500 shadow-amber-500/20' : 
                'bg-emerald-500 shadow-emerald-500/20'
            }`}>
               {isTakeaway ? <ShoppingBag className="w-4 h-4" /> : isDelivery ? <Truck className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left min-w-0">
               <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 leading-none mb-1 truncate">
                 {(isTakeaway || isDelivery) ? 'Service Mode' : 'Serving At'}
               </p>
               <p className={`text-xs font-bold truncate ${isTakeaway ? 'text-[#6c5ce7]' : isDelivery ? 'text-amber-600' : 'text-emerald-500 dark:text-emerald-400'}`}>
                 {isTakeaway ? 'Takeaway Order' : isDelivery ? 'Delivery Order' : `Table ${usePOSStore.getState().tables.find(t => t.id === activeTableId)?.number || '...'}`}
               </p>
            </div>
            {!isInvoiced && (
               <button
                  onClick={() => setActiveTable(null)}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0"
               >
                  Switch
               </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-white/[0.02] border-2 border-dashed border-gray-100 dark:border-white/[0.05] rounded-3xl py-8 px-4 text-center group cursor-pointer hover:border-[#6c5ce7]/30 transition-all transition-colors shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.04] flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-gray-300 group-hover:text-[#6c5ce7]" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Status Offline</p>
             <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-snug">Select a table or "Takeaway" to start</p>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-10">
            <ShoppingCart className="w-16 h-16 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Waiting for Order</p>
          </div>
        ) : (
          cart.map((item: any) => (
            <div
              key={`${item.id}-${item.isPrinted}`}
              className={`flex items-center gap-4 group transition-all p-3 rounded-2xl border ${
                item.isPrinted 
                ? 'opacity-60 bg-gray-50/10 border-transparent' 
                : 'bg-emerald-500/[0.02] border-emerald-500/10 dark:border-emerald-500/5'
              }`}
            >
              <div className="relative w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/[0.04] flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/[0.05]">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                   <div className="text-[#6c5ce7]/30"><Printer className="w-6 h-6" /></div>
                )}
                {!item.isPrinted && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0b101a] animate-pulse" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 text-left">
                   <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                   {item.isPrinted && <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 rounded uppercase tracking-tighter">KOT</span>}
                </div>
                <p className="text-[10px] font-medium text-gray-400 mb-2 italic text-left">Rs. {formatPrice(item.price)}</p>
                
                {!item.isPrinted && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center hover:text-red-500 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-black tracking-tighter">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center hover:text-[#6c5ce7] transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className={`text-sm font-black tracking-tighter ${item.isPrinted ? 'text-gray-400' : 'text-[#6c5ce7] dark:text-[#a29bfe]'}`}>
                    Rs.{formatPrice(item.price * item.quantity)}
                </p>
                {!item.isPrinted && !isInvoiced && (
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 mt-2 transition-all"><X className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settlement Section */}
      <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05] space-y-6">
        
        {/* Bill Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-gray-900 dark:text-white font-black">Rs. {formatPrice(subtotal)}</span>
          </div>

          {/* Discount Line */}
          {discountAmount > 0 ? (
            <div className="flex flex-col gap-1">
               <div className="flex justify-between items-center text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-left">
                     {!isInvoiced && <button onClick={() => removeDiscount(activeTableId!)} className="text-rose-500 hover:scale-110 transition-transform flex-shrink-0"><X className="w-3 h-3" /></button>}
                     <div className="truncate pr-2">Discount ({discountInfo?.type === 'percent' ? `${discountInfo.value}%` : 'Fixed'})</div>
                  </span>
                  <span className="font-black flex-shrink-0 whitespace-nowrap">- Rs. {formatPrice(discountAmount)}</span>
               </div>
               {discountInfo?.reason && (
                  <div className="flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 italic font-bold ml-4">
                     <MessageSquare className="w-2.5 h-2.5" />
                     {discountInfo.reason}
                  </div>
               )}
            </div>
          ) : (
             !isInvoiced && (
                <button 
                  onClick={() => setShowAuth(true)}
                  disabled={!activeTableId || cart.length === 0}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#6c5ce7] transition-colors disabled:opacity-0"
                >
                   <Ticket className="w-3.5 h-3.5" />
                   Add Discount / Coupon
                </button>
             )
          )}

          <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Service Charge {(isTakeaway || isDelivery) ? '0%' : '10%'}</span>
            <span className="text-gray-900 dark:text-white font-black">Rs. {formatPrice(serviceCharge)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-white/[0.08]">
            <span className="text-xs font-black uppercase tracking-widest text-[#6c5ce7]">Total Payable</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">Rs. {formatPrice(total)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
            {hasUnprinted && (
               <button
                  onClick={handlePrintKOT}
                  disabled={isProcessing}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
               >
                  {isProcessing ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <Printer className="w-4 h-4" />
                  )}
                  Print KOT
               </button>
            )}

            {!isTakeaway && !isDelivery && !isInvoiced ? (
               <button
                  onClick={handleBillOut}
                  disabled={cart.length === 0 || !activeTableId || hasUnprinted || isProcessing}
                  className="group relative w-full py-5 bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.1] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-xl hover:bg-gray-50 dark:hover:bg-white/[0.08] active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3 overflow-hidden"
               >
                  {isProcessing ? <div className="w-4 h-4 border-b-2 border-[#6c5ce7] rounded-full animate-spin" /> : <Receipt className="w-4 h-4 text-[#6c5ce7]" />}
                  Bill Out (Print)
               </button>
            ) : (
               <button
                  onClick={() => setPaymentModalOpen(true)}
                  disabled={cart.length === 0 || !activeTableId || (hasUnprinted && !isTakeaway && !isDelivery) || isProcessing}
                  className="group relative w-full py-5 bg-[#6c5ce7] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-[#6c5ce7]/30 hover:shadow-[#6c5ce7]/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Settle Payment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            )}
        </div>
      </div>

      {/* OVERLAY: MANAGER AUTH */}
      {showAuth && (
        <div className="absolute inset-0 z-50 bg-[#0b101a]/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-[240px] bg-white dark:bg-[#111723] rounded-3xl p-6 shadow-2xl border border-white/[0.05] text-center">
             <div className="w-12 h-12 rounded-2xl bg-[#6c5ce7]/10 flex items-center justify-center text-[#6c5ce7] mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Manager Required</h3>
             <p className="text-[10px] font-medium text-gray-400 mb-6 uppercase tracking-widest">Enter Auth Code</p>
             
             <input 
               type="password" 
               maxLength={4}
               autoFocus
               value={authCode}
               onChange={(e) => setAuthCode(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') handleVerifyManager();
               }}
               className={`w-full bg-gray-50 dark:bg-white/[0.03] border-2 rounded-2xl py-3 text-center text-xl font-black tracking-[0.5em] focus:outline-none transition-all ${
                 authError ? 'border-rose-500 text-rose-500 animate-shake' : 'border-transparent focus:border-[#6c5ce7]/30'
               }`}
               placeholder="****"
             />

             <div className="grid grid-cols-2 gap-2 mt-6">
                <button onClick={() => setShowAuth(false)} className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]">Cancel</button>
                <button onClick={handleVerifyManager} className="py-3 rounded-xl bg-[#6c5ce7] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6c5ce7]/20">Verify</button>
             </div>
          </div>
        </div>
      )}

      {/* OVERLAY: DISCOUNT SELECTOR REFINED WITH REASON */}
      {showDiscountForm && (
        <div className="absolute inset-0 z-50 bg-[#0b101a]/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
           <div className="w-full max-w-[280px] bg-white dark:bg-[#111723] rounded-3xl p-6 shadow-2xl border border-white/[0.05]">
             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-500" /> 
                Apply Discount
             </h3>

             <div className="mb-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2 ml-1">Reason for Discount *</p>
                <textarea 
                   autoFocus
                   value={discountReason}
                   onChange={(e) => setDiscountReason(e.target.value)}
                   placeholder="Enter reason (e.g., Staff Meal, Customer Complaint...)"
                   className="w-full bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white border-2 border-transparent focus:border-[#6c5ce7]/30 rounded-2xl p-4 text-xs font-medium focus:outline-none min-h-[80px] resize-none transition-all"
                />
             </div>

             <div className={`space-y-4 transition-opacity duration-300 ${!discountReason.trim() ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Staff Discount (%)</p>
                   <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={staffDiscountValue}
                          onChange={(e) => setStaffDiscountValue(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white border-transparent rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-[#6c5ce7]/30 focus:outline-none"
                        />
                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <button 
                        onClick={() => handleApplyDiscount('percent', parseFloat(staffDiscountValue) || 0)}
                        className="w-12 h-14 rounded-2xl bg-[#6c5ce7] text-white flex items-center justify-center hover:bg-[#5a4cc7] transition-all"
                      >
                         <CheckCircle2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Fixed Discount (Rs.)</p>
                   <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rs.</span>
                        <input 
                          type="number"
                          value={customFixedValue}
                          onChange={(e) => setCustomFixedValue(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white border-transparent rounded-2xl py-4 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <button 
                        onClick={() => handleApplyDiscount('fixed', parseFloat(customFixedValue) || 0)}
                        className="w-12 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all"
                      >
                         <CheckCircle2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <button 
                  onClick={() => handleApplyDiscount('percent', 100)}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] text-gray-400 hover:text-rose-500 hover:border-rose-500/20 transition-all group"
                >
                  <Ticket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Complimentary (100%)</span>
                </button>
             </div>

             <button onClick={() => { setShowDiscountForm(false); setDiscountReason(''); }} className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Close</button>
           </div>
        </div>
      )}
    </aside>
  );
}
