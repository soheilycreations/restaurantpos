import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePOSStore } from '../lib/store';
import { useNotify } from '../components/NotificationProvider';

export function useSocket(restaurantId: string) {
  const socketRef = useRef<Socket | null>(null);
  const addIncomingOrder = usePOSStore((state) => state.addIncomingOrder);
  const { notify } = useNotify();
  
  useEffect(() => {
    // Connect to the NestJS Gateway
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket Server:', socket.id);
      socket.emit('join_restaurant', { restaurantId });
    });

    socket.on('new_order', (orderData) => {
      console.log('Incoming Web Order:', orderData);
      
      // Play Audio Alert
      try {
         const audio = new Audio('/sounds/notification.mp3');
         audio.play();
      } catch (e) {
         console.warn('Audio playback failed', e);
      }
      
      // Add to sidebar
      addIncomingOrder(orderData);
      
      // Notify Cashier with Premium Toast
      notify(`New Order Received (#${orderData.id.slice(-6).toUpperCase()})`, 'success');
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, addIncomingOrder, notify]);

  return socketRef.current;
}
