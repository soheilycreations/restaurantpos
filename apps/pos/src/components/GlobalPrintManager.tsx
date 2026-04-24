"use client";
import React from 'react';
import { usePOSStore } from '../lib/store';
import { PrintReceipt } from '../components/PrintReceipt';

export function GlobalPrintManager() {
  const printData = usePOSStore((state) => state.printData);

  if (!printData) return null;

  return (
    <div id="global-print-portal" className="print-only">
       <PrintReceipt orderData={printData} />
    </div>
  );
}
