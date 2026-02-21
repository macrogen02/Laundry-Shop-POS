import { Injectable } from '@nestjs/common';
import { WorkflowStatus } from '../common/workflow-status';

export interface LaundryOrder {
  id: string;
  customerName: string;
  services: string[];
  weightKg: number;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  status: WorkflowStatus;
}

@Injectable()
export class OrdersService {
  private readonly orders: LaundryOrder[] = [
    {
      id: 'L-1001',
      customerName: 'Anna Cruz',
      services: ['Wash', 'Dry'],
      weightKg: 5,
      amount: 25,
      paymentMethod: 'Card',
      status: WorkflowStatus.Washing,
    },
  ];

  findAll() {
    return this.orders;
  }

  create(order: Omit<LaundryOrder, 'id' | 'status'>) {
    const next = {
      ...order,
      id: `L-${1000 + this.orders.length + 1}`,
      status: WorkflowStatus.Pending,
    };
    this.orders.unshift(next);
    return next;
  }

  advance(id: string) {
    const order = this.orders.find((item) => item.id === id);
    if (!order) return null;

    const workflow = [
      WorkflowStatus.Pending,
      WorkflowStatus.Washing,
      WorkflowStatus.Drying,
      WorkflowStatus.Ready,
      WorkflowStatus.PickedUp,
    ];

    const index = workflow.indexOf(order.status);
    if (index < workflow.length - 1) {
      order.status = workflow[index + 1];
    }

    return order;
  }
}
