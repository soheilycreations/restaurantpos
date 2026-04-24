"use client";

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StatusPage({ params }: { params: { orderId: string } }) {
  const [status, setStatus] = useState<'PENDING' | 'PREPARING' | 'READY'>('PENDING');
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  useEffect(() => {
    if (!restaurantId) return;

    const socket = io('http://localhost:3001');
    socket.emit('join_restaurant', { restaurantId });

    socket.on('order_ready', (data) => {
       if (data.id === params.orderId || true) { // For demo purposes matching any
          setStatus('READY');
       }
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, params.orderId]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6">
       <motion.div 
         animate={{ scale: status === 'READY' ? 1.1 : 1 }}
         className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl ${
           status === 'READY' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-600 shadow-blue-500/50 animate-pulse'
         }`}
       >
          <span className="text-5xl">{status === 'READY' ? '✓' : '👨‍🍳'}</span>
       </motion.div>
       <h1 className="mt-8 text-3xl font-bold tracking-wider">
         {status === 'READY' ? 'ORDER READY!' : 'PREPARING...'}
       </h1>
       <p className="mt-4 text-gray-400 text-center max-w-sm">
         {status === 'READY' 
           ? 'Your food is ready to be collected at the counter.' 
           : 'The kitchen has received your order and is preparing it.'}
       </p>
    </div>
  );
}
