export type ServiceType = 'Wash' | 'Dry' | 'Fold';
export type PaymentType = 'Cash' | 'Card' | 'Online';

export type WorkflowStatus =
  | 'Pending'
  | 'Washing'
  | 'Drying'
  | 'Ready'
  | 'Picked up';

export interface Service {
  name: ServiceType;
  pricePerKg: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  ordersCount: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  services: ServiceType[];
  weightKg: number;
  amount: number;
  paymentMethod: PaymentType;
  status: WorkflowStatus;
  createdAt: string;
}
