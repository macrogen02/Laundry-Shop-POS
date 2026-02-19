import { Injectable } from '@nestjs/common';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
}

@Injectable()
export class CustomersService {
  private readonly customers: Customer[] = [
    { id: 'c1', name: 'Anna Cruz', phone: '555-1001', loyaltyPoints: 20 },
    { id: 'c2', name: 'Ben Gomez', phone: '555-1002', loyaltyPoints: 8 },
    { id: 'c3', name: 'Cara Lim', phone: '555-1003', loyaltyPoints: 15 },
  ];

  findAll() {
    return this.customers;
  }
}
