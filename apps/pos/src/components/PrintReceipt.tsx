import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatPrice } from '../lib/utils';

interface ReceiptProps {
  orderData: {
    restaurantName: string;
    address: string;
    phone: string;
    orderId: string;
    date: string;
    table?: string;
    items: any[];
    subtotal: number;
    discount?: number;
    serviceCharge: number;
    total: number;
    paymentMethod: string;
    qrString?: string;
    isFinal?: boolean;
    type?: 'RECEIPT' | 'KOT';
    marketingUrl?: string;
  } | null;
}

export function PrintReceipt({ orderData }: ReceiptProps) {
  const [qrBlob, setQrBlob] = useState<string | null>(null);
  const [marketingQrBlob, setMarketingQrBlob] = useState<string | null>(null);

  useEffect(() => {
    if (!orderData) return;

    // Payment QR (LankaQR)
    if (orderData.qrString) {
      QRCode.toDataURL(orderData.qrString, { margin: 1, width: 256 })
        .then(url => setQrBlob(url))
        .catch(err => console.error('Payment QR Error:', err));
    }
    
    // Marketing QR
    if (orderData.isFinal && orderData.marketingUrl) {
      QRCode.toDataURL(orderData.marketingUrl, { margin: 1, width: 256 })
        .then(url => setMarketingQrBlob(url))
        .catch(err => console.error('Marketing QR Error:', err));
    }
  }, [orderData]);

  if (!orderData) return null;

  return (
    <div id="thermal-receipt" className="receipt-container">
      {/* 
          CRITICAL FIX: 
          1. Removed the '*' selector that was making the style tag itself visible.
          2. Fixed flexbox breakdown by removing broad 'display: block' overrides.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #thermal-receipt { display: none !important; }
        }
        @media print {
          body * { visibility: hidden !important; }
          #thermal-receipt, #thermal-receipt div, #thermal-receipt span, #thermal-receipt p, #thermal-receipt h1, #thermal-receipt img { 
            visibility: visible !important; 
          }
          #thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 72mm !important;
            padding: 2mm !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            display: block !important;
          }
          .receipt-center { text-align: center !important; }
          .receipt-divider { border-top: 1px dashed #000 !important; margin: 3mm 0 !important; height: 0 !important; width: 100% !important; }
          .receipt-item { display: flex !important; justify-content: space-between !important; margin-bottom: 1mm !important; width: 100% !important; }
          .receipt-total-row { display: flex !important; justify-content: space-between !important; font-weight: bold !important; width: 100% !important; }
          .receipt-grand-total { font-size: 14px !important; font-weight: 800 !important; border-top: 1px solid #000 !important; padding-top: 2mm !important; margin-top: 2mm !important; }
          .qr-container { display: flex !important; flex-direction: column !important; align-items: center !important; margin-top: 3mm !important; width: 100% !important; }
          .qr-image { width: 30mm !important; height: 30mm !important; display: block !important; margin: 0 auto !important; }
          .receipt-badge { 
             display: inline-block !important; 
             padding: 1mm 2mm !important; 
             border: 1px solid black !important; 
             font-size: 9px !important; 
             font-weight: bold !important; 
             margin-bottom: 2mm !important;
          }
          style { display: none !important; } /* Safeguard to never show the style tag content */
        }
      `}} />

      <div className="receipt-center">
        {orderData.type === 'KOT' ? (
          <h1 style={{ fontSize: '20px', margin: '0 0 1mm 0', fontWeight: '900', textDecoration: 'underline' }}>KITCHEN ORDER</h1>
        ) : (
          <>
            <h1 style={{ fontSize: '16px', margin: '0 0 1mm 0', fontWeight: 'bold' }}>{orderData.restaurantName}</h1>
            <p style={{ margin: 0 }}>{orderData.address}</p>
            <p style={{ margin: 0 }}>Tel: {orderData.phone}</p>
          </>
        )}
      </div>

      <div className="receipt-divider" />

      <div className="receipt-item">
        <span>Order:</span>
        <span style={{ fontWeight: 'bold' }}>#{orderData.orderId.slice(-6).toUpperCase()}</span>
      </div>
      <div className="receipt-item">
        <span>Date:</span>
        <span>{orderData.date}</span>
      </div>
      {orderData.table && (
        <div className="receipt-item">
          <span>Table:</span>
          <span style={{ fontWeight: 'bold' }}>{orderData.table}</span>
        </div>
      )}

      <div className="receipt-divider" />

      {/* Items Section */}
      <div style={{ marginBottom: '1mm', fontWeight: 'bold', fontSize: '9px' }}>
        <div className="receipt-item">
          <span style={{ flex: 1.5, textAlign: 'left' }}>ITEM</span>
          <span style={{ flex: 0.5, textAlign: 'center' }}>QTY</span>
          {orderData.type !== 'KOT' && <span style={{ flex: 1, textAlign: 'right' }}>PRICE</span>}
        </div>
      </div>

      {orderData.items && orderData.items.length > 0 ? (
        orderData.items.map((item, idx) => (
          <div key={idx} className="receipt-item">
            <span style={{ flex: 2, textAlign: 'left', fontSize: orderData.type === 'KOT' ? '14px' : '11px', fontWeight: orderData.type === 'KOT' ? '900' : 'normal' }}>
               {idx + 1}. {item.name}
            </span>
            <span style={{ flex: 0.5, textAlign: 'center', fontSize: '14px', fontWeight: '900' }}>x{item.quantity}</span>
            {orderData.type !== 'KOT' && <span style={{ flex: 1, textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</span>}
          </div>
        ))
      ) : (
        <div className="receipt-center">-- NO ITEMS --</div>
      )}

      {orderData.type !== 'KOT' && (
        <>
          <div className="receipt-divider" />

          <div className="receipt-item">
            <span>Subtotal:</span>
            <span>{formatPrice(orderData.subtotal)}</span>
          </div>
          {orderData.discount && orderData.discount > 0 && (
            <div className="receipt-item">
              <span>Discount:</span>
              <span>- {formatPrice(orderData.discount)}</span>
            </div>
          )}
          <div className="receipt-item">
            <span>Service:</span>
            <span>{formatPrice(orderData.serviceCharge)}</span>
          </div>

          <div className="receipt-grand-total receipt-total-row">
            <span>TOTAL:</span>
            <span>Rs. {formatPrice(orderData.total)}</span>
          </div>

          <div className="receipt-center" style={{ marginTop: '3mm' }}>
            <p style={{ fontSize: '9px', margin: 0 }}>Payment: <span style={{ fontWeight: 'bold' }}>{orderData.paymentMethod}</span></p>
          </div>
        </>
      )}

      {/* Draft QR */}
      {!orderData.isFinal && qrBlob && (
        <div className="qr-container">
           <p style={{ fontSize: '8px', margin: '0 0 1mm 0', fontWeight: 'bold' }}>SCAN TO PAY (LankaQR)</p>
           <img src={qrBlob} alt="LankaQR" className="qr-image" />
        </div>
      )}

      {/* Final Message & Marketing QR */}
      {orderData.isFinal && (
        <div className="receipt-center" style={{ marginTop: '4mm' }}>
           <p style={{ fontWeight: 'bold', fontSize: '11px', margin: '0 0 1mm 0' }}>THANK YOU, COME AGAIN!</p>
           
           {marketingQrBlob && (
              <div className="qr-container">
                 <p style={{ fontSize: '9px', fontStyle: 'italic', marginBottom: '1mm' }}>Rate us or Order Online</p>
                 <img src={marketingQrBlob} alt="Marketing" className="qr-image" style={{ width: '25mm', height: '25mm' }} />
              </div>
           )}
        </div>
      )}

      <div className="receipt-divider" />

      <div className="receipt-center" style={{ fontSize: '9px' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>Soheilys Kitchen</p>
        <p style={{ fontSize: '7px', opacity: 0.6, margin: 0 }}>Developed by WebShopping POS Solutions</p>
      </div>
    </div>
  );
}
