import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  isPrinted?: boolean;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
}

interface TableDiscount {
  type: 'fixed' | 'percent';
  value: number;
  reason: string;
}

interface POSState {
  tableCarts: Record<string, CartItem[]>;
  tableStatuses: Record<string, TableStatus>;
  tableDiscounts: Record<string, TableDiscount>;
  tableInvoiced: Record<string, boolean>;
  tableOrderIds: Record<string, string>;
  incomingOrders: any[];
  tables: Table[];
  activeTableId: string | null;
  paymentModalOpen: boolean;
  printData: any | null; // For the Singleton Print Component
  
  // Actions
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: (tableId?: string) => void;
  markAsPrinted: (tableId: string) => void;
  
  setTableInvoiced: (tableId: string, status: boolean) => void;
  setTableOrderId: (tableId: string, orderId: string) => void;
  setPrintData: (data: any | null) => void;
  
  applyDiscount: (tableId: string, type: 'fixed' | 'percent', value: number, reason: string) => void;
  removeDiscount: (tableId: string) => void;
  
  setTableStatus: (tableId: string, status: TableStatus) => void;
  
  addIncomingOrder: (order: any) => void;
  setActiveTable: (id: string | null) => void;
  setTables: (tables: Table[]) => void;
  setPaymentModalOpen: (isOpen: boolean) => void;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set) => ({
      tableCarts: {},
      tableStatuses: {},
      tableDiscounts: {},
      tableInvoiced: {},
      tableOrderIds: {},
      incomingOrders: [],
      tables: [],
      activeTableId: null,
      paymentModalOpen: false,
      printData: null,

      addToCart: (product) => set((state) => {
        if (!state.activeTableId) return state;
        const tableId = state.activeTableId;
        const currentCart = state.tableCarts[tableId] || [];
        const existing = currentCart.find((item) => item.id === product.id && !item.isPrinted);
        
        let newCart;
        if (existing) {
          newCart = currentCart.map((i) => 
            (i.id === product.id && !i.isPrinted) ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newCart = [...currentCart, { ...product, quantity: 1, isPrinted: false }];
        }

        return { tableCarts: { ...state.tableCarts, [tableId]: newCart } };
      }),

      removeFromCart: (id) => set((state) => {
        if (!state.activeTableId) return state;
        const tableId = state.activeTableId;
        const currentCart = state.tableCarts[tableId] || [];
        const newCart = currentCart.filter((i) => !(i.id === id && !i.isPrinted));
        return { tableCarts: { ...state.tableCarts, [tableId]: newCart } };
      }),

      updateQuantity: (id, delta) => set((state) => {
        if (!state.activeTableId) return state;
        const tableId = state.activeTableId;
        const currentCart = state.tableCarts[tableId] || [];
        const newCart = currentCart.map((i) => {
          if (i.id === id && !i.isPrinted) {
            return { ...i, quantity: Math.max(0, i.quantity + delta) };
          }
          return i;
        }).filter(i => i.quantity > 0);
        return { tableCarts: { ...state.tableCarts, [tableId]: newCart } };
      }),

      clearCart: (tableId) => set((state) => {
        const id = tableId || state.activeTableId;
        if (!id) return state;
        const newCarts = { ...state.tableCarts }; delete newCarts[id];
        const newDiscounts = { ...state.tableDiscounts }; delete newDiscounts[id];
        const newInvoices = { ...state.tableInvoiced }; delete newInvoices[id];
        const newOrderIds = { ...state.tableOrderIds }; delete newOrderIds[id];
        return { 
            tableCarts: newCarts, 
            tableDiscounts: newDiscounts,
            tableInvoiced: newInvoices,
            tableOrderIds: newOrderIds
        };
      }),

      markAsPrinted: (tableId) => set((state) => {
        const currentCart = state.tableCarts[tableId] || [];
        const newCart = currentCart.map(i => ({ ...i, isPrinted: true }));
        const newStatuses = { ...state.tableStatuses };
        if (!['takeaway', 'delivery'].includes(tableId)) newStatuses[tableId] = 'OCCUPIED';
        return { tableCarts: { ...state.tableCarts, [tableId]: newCart }, tableStatuses: newStatuses };
      }),

      setTableInvoiced: (tableId, status) => set((state) => ({
        tableInvoiced: { ...state.tableInvoiced, [tableId]: status }
      })),
      
      setTableOrderId: (tableId, orderId) => set((state) => ({
        tableOrderIds: { ...state.tableOrderIds, [tableId]: orderId }
      })),

      setPrintData: (data) => set({ printData: data }),

      applyDiscount: (tableId, type, value, reason) => set((state) => ({
        tableDiscounts: { ...state.tableDiscounts, [tableId]: { type, value, reason } }
      })),

      removeDiscount: (tableId) => set((state) => {
        const newDiscounts = { ...state.tableDiscounts };
        delete newDiscounts[tableId];
        return { tableDiscounts: newDiscounts };
      }),

      setTableStatus: (tableId, status) => set((state) => ({
        tableStatuses: { ...state.tableStatuses, [tableId]: status }
      })),

      addIncomingOrder: (order) => set((state) => ({ incomingOrders: [order, ...state.incomingOrders] })),
      setActiveTable: (id) => set({ activeTableId: id }),
      setTables: (tables) => set({ tables }),
      setPaymentModalOpen: (isOpen) => set({ paymentModalOpen: isOpen })
    }),
    {
      name: 'pos-multi-table-store-v3',
      partialize: (state) => ({ 
        tableCarts: state.tableCarts, 
        tableStatuses: state.tableStatuses,
        tableDiscounts: state.tableDiscounts,
        tableInvoiced: state.tableInvoiced,
        tableOrderIds: state.tableOrderIds,
        activeTableId: state.activeTableId,
        tables: state.tables
      }),
    }
  )
);
