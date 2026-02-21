import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { WorkflowStatus } from '../common/workflow-status';

@Injectable()
export class DashboardService {
  constructor(private readonly ordersService: OrdersService) {}

  getOverview() {
    const orders = this.ordersService.findAll();
    const dailySales = orders.reduce((sum, order) => sum + order.amount, 0);

    return {
      dailySales,
      monthlySalesEstimate: dailySales * 24,
      topServices: ['Wash', 'Dry', 'Fold'],
      readyForPickup: orders.filter((order) => order.status === WorkflowStatus.Ready).length,
    };
  }
}
