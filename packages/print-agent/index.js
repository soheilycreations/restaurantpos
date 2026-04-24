const io = require('socket.io-client');
const escpos = require('escpos');
// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');

const RESTAURANT_ID = process.env.RESTAURANT_ID || 'dummy-tenant-123';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const PRINT_AGENT_KEY = process.env.PRINT_AGENT_KEY || 'secret-agent-key';

console.log('Starting Print Agent for Restaurant:', RESTAURANT_ID);

const socket = io(SERVER_URL, {
  auth: { token: PRINT_AGENT_KEY }
});

socket.on('connect', () => {
  console.log('Connected to Cloud API Gateway.');
  socket.emit('join_restaurant', { restaurantId: RESTAURANT_ID, role: 'PRINT_AGENT' });
});

socket.on('PRINT_ORDER', (payload) => {
  console.log('\n--- Received PRINT_ORDER Event ---');
  console.log('Payload Type:', payload.type);
  console.log('Order ID:', payload.orderId);
  executePrint(payload);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server. Retrying...');
});

function executePrint(payload) {
  try {
    // Select the USB printer
    const device  = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(function(error){
      if(error) {
         console.error('Failed to open USB Printer device:', error);
         return;
      }

      printer
        .font('a')
        .align('ct')
        .style('b');

      if (payload.type === 'KOT') {
        // Kitchen Order Ticket
        printer
          .size(2, 2)
          .text('K. O. T.')
          .text(`Table: ${payload.tableId || 'Takeaway'}`)
          .size(1, 1)
          .text('--------------------------------');
          
        printer.align('lt');
        payload.items.forEach(item => {
           printer.text(`${item.quantity}x  ${item.name}`); // BIG FORMATTING FOR KITCHEN
        });

      } else {
        // CUSTOMER RECEIPT
        printer
          .size(2, 2)
          .text('WEBSHOPPING.LK')
          .size(1, 1)
          .text('--------------------------------')
          .align('lt');

        if (payload.customerName) {
           printer.text(`Customer: ${payload.customerName}`);
        }
        printer.text(`Order ID: ${payload.orderId.substring(0, 8)}`);
        printer.text('--------------------------------');

        payload.items.forEach(item => {
           printer.text(`${item.quantity}x ${item.name} ... $${(item.price * item.quantity).toFixed(2)}`);
        });

        printer
          .text('--------------------------------')
          .align('rt')
          .text(`TOTAL: $${payload.total.toFixed(2)}`)
          .align('ct')
          .text('--------------------------------');

        if (payload.transactionId) {
           printer.text(`Paid via PayHere`);
           printer.text(`TXN: ${payload.transactionId}`);
        }
        
        printer
          .text('')
          .align('ct')
          .style('normal')
          .text('Thank you for dining with us!')
          .text('Powered by Webshopping RMS');
      }

      printer
        .cut()
        .close();
        
      console.log('Print job dispatched successfully.');
    });
  } catch (err) {
    console.error('Printer execution error (Is printer connected?):', err.message);
  }
}
