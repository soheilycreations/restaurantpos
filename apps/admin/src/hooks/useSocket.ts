import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useSocket(restaurantId: string, onNewOrder?: (order: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    // Connect to the NestJS Gateway
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin Connected to WebSocket Server:', socket.id);
      socket.emit('join_restaurant', { restaurantId });
    });

    if (onNewOrder) {
      socket.on('new_order', (orderData) => {
        console.log('Real-time Order Detected:', orderData);
        onNewOrder(orderData);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, onNewOrder]);

  return socketRef.current;
}
