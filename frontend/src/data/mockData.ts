import type { Customer, Order, Service } from '../types';

export const services: Service[] = [
  { name: 'Wash', pricePerKg: 3 },
  { name: 'Dry', pricePerKg: 2 },
  { name: 'Fold', pricePerKg: 1.5 },
];

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Anna Cruz', phone: '555-1001', loyaltyPoints: 20, ordersCount: 12 },
  { id: 'c2', name: 'Ben Gomez', phone: '555-1002', loyaltyPoints: 8, ordersCount: 4 },
  { id: 'c3', name: 'Cara Lim', phone: '555-1003', loyaltyPoints: 15, ordersCount: 7 },
];

export const initialOrders: Order[] = [
  {
    id: 'L-1001',
    customerId: 'c1',
    customerName: 'Anna Cruz',
    services: ['Wash', 'Dry'],
    weightKg: 5,
    amount: 25,
    paymentMethod: 'Card',
    status: 'Washing',
    createdAt: '2026-02-19 09:12',
  },
  {
    id: 'L-1002',
    customerId: 'c2',
    customerName: 'Ben Gomez',
    services: ['Wash', 'Dry', 'Fold'],
    weightKg: 3,
    amount: 19.5,
    paymentMethod: 'Cash',
    status: 'Ready',
    createdAt: '2026-02-19 10:02',
  },
];
