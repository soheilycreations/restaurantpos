"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function OrderPage({ params }: { params: { restaurantId: string, tableId: string } }) {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const products = [
    { id: '1', name: 'Deluxe Burger', price: 12.99, image: '/burger.jpg' },
    { id: '2', name: 'Cola Large', price: 2.99, image: '/cola.jpg' },
  ];

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const submitOrder = async () => {
     router.push(`/order/status/fake-order-123?restaurantId=${params.restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
      <header className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
         <h1 className="text-xl font-bold">Webshopping.lk</h1>
         <button onClick={() => setIsCartOpen(true)} className="relative p-2">
            🛒
            {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
         </button>
      </header>
      
      <main className="p-4 grid gap-4">
         <p className="text-gray-400">Ordering from Table {params.tableId}</p>
         {products.map(p => (
           <div key={p.id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center border border-white/10">
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-blue-400">${p.price.toFixed(2)}</p>
              </div>
              <button className="bg-blue-600 px-4 py-2 rounded-lg" onClick={() => addToCart(p)}>Add</button>
           </div>
         ))}
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-50 bg-black/95 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">Your Cart</h2>
               <button onClick={() => setIsCartOpen(false)} className="text-3xl text-gray-400">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {cart.map(item => (
                 <div key={item.id} className="flex justify-between mb-4 pb-4 border-b border-white/10">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                 </div>
              ))}
            </div>
            
            <button 
              className="mt-4 w-full bg-blue-600 font-bold py-4 rounded-xl shadow-lg shadow-blue-500/50"
              onClick={submitOrder}
            >
              Checkout - ${cart.reduce((a,c) => a + c.price*c.quantity, 0).toFixed(2)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
