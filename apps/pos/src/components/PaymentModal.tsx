import React, { useState, useEffect } from 'react';
import { usePOSStore } from '../lib/store';
import { X, QrCode, CreditCard, Banknote, CheckCircle2, Loader2, Printer } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { ordersApi, tablesApi } from '../lib/api';
import { generateLankaQRString } from '../lib/lankaqr';
import { useNotify } from './NotificationProvider';

export function PaymentModal({ socket }: { socket: any }) {
  const { 
    tableCarts, 
    tableDiscounts,
    tableInvoiced,
    tableOrderIds,
    activeTableId, 
    setPaymentModalOpen, 
    clearCart, 
    setTableStatus,
    setActiveTable,
    setPrintData,
    tables
  } = usePOSStore();
  
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const id = activeTableId ? (window.location.search.includes('restaurantId') ? new URLSearchParams(window.location.search).get('restaurantId') : process.env.NEXT_PUBLIC_RESTAURANT_ID) : process.env.NEXT_PUBLIC_RESTAURANT_ID;
    const finalId = id || "16ae97cd-c992-4103-9e58-f7c0671cc29d";
    
    fetch(`${apiUrl}/restaurant`, {
      headers: { 'x-tenant-id': finalId }
    })
    .then(res => res.json())
    .then(data => setRestaurant(data));
  }, [activeTableId]);
  
  const { notify } = useNotify();

  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  const [status, setStatus] = useState<'selecting' | 'processing' | 'confirmed'>('selecting');
  const [qrString, setQrString] = useState<string | undefined>(undefined);
  const [shouldPrint, setShouldPrint] = useState(true); // Paper saving toggle

  const cart = activeTableId ? (tableCarts[activeTableId] || []) : [];
  const discountInfo = activeTableId ? tableDiscounts[activeTableId] : null;
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate Discount
  let discountAmount = 0;
  if (discountInfo) {
    if (discountInfo.type === 'percent') {
      discountAmount = (subtotal * discountInfo.value) / 100;
    } else {
      discountAmount = discountInfo.value;
    }
  }

  const isTakeaway = activeTableId === 'takeaway';
  const isDelivery = activeTableId === 'delivery';
  
  const serviceCharge = (subtotal - discountAmount) * ((isTakeaway || isDelivery) ? 0 : 0.1);
  const total = subtotal - discountAmount + serviceCharge;

  const currentTable = tables.find(t => t.id === activeTableId);

  // Generate LankaQR string if method is QR
  useEffect(() => {
    if (selectedMethod === 'qr' && total > 0) {
      const qrBody = generateLankaQRString({
        merchantName: 'WebPOS',
        merchantCity: 'Colombo',
        merchantId: '1234567890',
        amount: total,
        reference: isTakeaway ? `TK-${new Date().getTime().toString().slice(-4)}` : 
                   isDelivery ? `DL-${new Date().getTime().toString().slice(-4)}` : 
                   `TBL-${currentTable?.number || '?'}`
      });
      setQrString(qrBody);
    } else {
      setQrString(undefined);
    }
  }, [selectedMethod, total, activeTableId]);

  const handleFinalSettlement = async () => {
    if (!activeTableId || cart.length === 0) return;
    
    setStatus('processing');
    try {
      // 1. Submit Final PAID order to backend
      const activeOrderId = activeTableId ? tableOrderIds[activeTableId] : null;

      if (activeOrderId) {
        // Update existing record
        await ordersApi.updateStatus(activeOrderId, 'PAID', selectedMethod.toUpperCase());
      } else {
        // Create fresh record (e.g., Takeaway with no prior KOT/Bill)
        await ordersApi.create({
          totalAmount: total,
          tableId: (isTakeaway || isDelivery) ? null : activeTableId,
          status: 'PAID',
          paymentMethod: selectedMethod.toUpperCase(),
          discountAmount: discountAmount,
          taxAmount: serviceCharge,
          items: cart.map((i: any) => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price
          }))
        });
      }

      // 2. Conditional Printing (Singleton)
      if (shouldPrint) {
        const finalReceiptData = {
          restaurantName: restaurant?.name || 'WebPOS',
          address: restaurant?.address || '',
          phone: restaurant?.phone || '',
          logoUrl: restaurant?.logoUrl || null,
          orderId: activeTableId,
          date: new Date().toLocaleString(),
          table: isTakeaway ? 'TAKEAWAY' : isDelivery ? 'DELIVERY' : `Table ${currentTable?.number || '...'}`,
          items: [...cart], // Deep copy
          subtotal: subtotal,
          discount: discountAmount,
          serviceCharge: serviceCharge,
          total: total,
          paymentMethod: selectedMethod.toUpperCase(),
          qrString: qrString,
          isFinal: true,
          marketingUrl: 'https://biko.rest/rate-us'
        };

        setPrintData(finalReceiptData);
        
        setTimeout(() => {
          window.print();
          setPrintData(null); // Clear buffer
        }, 250);
      }

      // 3. Set table to CLEANING
      if (!isTakeaway && !isDelivery) {
        await tablesApi.updateStatus(activeTableId!, 'CLEANING');
        setTableStatus(activeTableId!, 'CLEANING');
      }
      
      // 4. Clear local cart
      clearCart(activeTableId!);

      setStatus('confirmed');
      notify('Settlement Completed!', 'success');
      
      setTimeout(() => {
        setPaymentModalOpen(false);
        setPrintData(null); // Clear singleton after use
        if (isTakeaway || isDelivery) setActiveTable(null);
      }, 3000);

    } catch (err: any) {
      console.error('Settlement Failed:', err);
      notify(err.message || 'Payment Settlement Failed', 'error');
      setStatus('selecting');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => status !== 'processing' && setPaymentModalOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#111723] border border-gray-100 dark:border-white/[0.08] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-up">
        
        {status === 'processing' && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#6c5ce7]/10 overflow-hidden">
            <div className="h-full bg-[#6c5ce7] animate-progress" style={{ width: '40%' }} />
          </div>
        )}

        <div className="p-8">
          {status !== 'processing' && (status !== 'confirmed') && (
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-red-500 transition-all font-black"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {status === 'selecting' || status === 'processing' ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Final Settlement</h2>
                <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mt-1 tracking-widest leading-none">
                   Select payment method to close session
                </p>
              </div>

              {/* Total Card */}
              <div className="bg-[#6c5ce7] rounded-3xl p-6 text-white shadow-2xl shadow-[#6c5ce7]/30 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex justify-between items-center opacity-80 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">
                   <span>Amount to Pay</span>
                   <span>{isTakeaway ? 'Takeaway' : isDelivery ? 'Delivery' : `Table #${currentTable?.number || '...'}`}</span>
                </div>
                <div className="text-4xl font-black italic tracking-tighter relative z-10 font-mono">
                  Rs. {formatPrice(total)}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                 {/* Paper Saving Toggle */}
                <button
                  onClick={() => setShouldPrint(!shouldPrint)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                    shouldPrint 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600' 
                    : 'border-gray-50 dark:border-white/[0.03] text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-xl ${shouldPrint ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/[0.05]'}`}>
                        <Printer className="w-4 h-4" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest">Print Physical Receipt</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${shouldPrint ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shouldPrint ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>

                {[
                  { id: 'cash', label: 'Cash Payment', icon: Banknote, desc: 'Settle with physical cash' },
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                  { id: 'qr',   label: 'Digital QR Pay', icon: QrCode, desc: 'LankaQR, HelaPay, etc.' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                      selectedMethod === m.id
                        ? 'border-[#6c5ce7] bg-[#6c5ce7]/5 dark:bg-[#6c5ce7]/10'
                        : 'border-gray-50 dark:border-white/[0.03] hover:border-gray-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      selectedMethod === m.id ? 'bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/30' : 'bg-gray-100 dark:bg-white/[0.05] text-gray-400 group-hover:text-[#6c5ce7]'
                    }`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-black uppercase tracking-widest text-[10px] ${selectedMethod === m.id ? 'text-[#6c5ce7] dark:text-[#a29bfe]' : 'text-gray-900 dark:text-gray-300'}`}>
                        {m.label}
                      </p>
                      <p className="text-[9px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleFinalSettlement}
                disabled={status === 'processing'}
                className="group relative w-full py-5 rounded-2xl bg-gray-900 dark:bg-[#6c5ce7] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {status === 'processing' ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                   <>
                     <CheckCircle2 className="w-4 h-4" />
                     {shouldPrint ? 'Settle & Print' : 'Settle Only'}
                   </>
                )}
              </button>
            </div>
          ) : (
            <div className="py-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="relative">
                 <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 relative z-10">
                    <CheckCircle2 className="w-12 h-12" />
                 </div>
                 <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Settled Successfully</h2>
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-6 uppercase tracking-widest leading-relaxed text-center">
                   Payment confirmed. <br/>Session finalized.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
