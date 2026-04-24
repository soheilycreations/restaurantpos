import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_restaurant')
  handleJoinRestaurant(@MessageBody() data: { restaurantId: string, role?: string }, @ConnectedSocket() client: Socket) {
    const room = `restaurant_${data.restaurantId}`;
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
    
    // Extensional Logic: Track Print Agent Status
    if (data.role === 'PRINT_AGENT') {
      client.join(`${room}_agents`); // Join isolated agent namespace
      this.server.to(room).emit('printer_status', { online: true });
      client.on('disconnect', () => {
         this.server.to(room).emit('printer_status', { online: false });
      });
    }

    return { event: 'joined', room };
  }

  broadcastNewOrder(restaurantId: string, orderData: any) {
    this.server.to(`restaurant_${restaurantId}`).emit('new_order', orderData);
  }

  broadcastOrderReady(restaurantId: string, orderData: any) {
    this.server.to(`restaurant_${restaurantId}`).emit('order_ready', orderData);
  }

  // Bridging the cloud APIs to physical local Agent execution block
  triggerPrint(restaurantId: string, payload: { orderId: string, items: any[], total: number, customerName?: string, type: 'KOT' | 'CUSTOMER_RECEIPT', transactionId?: string, tableId?: string }) {
    this.server.to(`restaurant_${restaurantId}_agents`).emit('PRINT_ORDER', payload);
  }
}
