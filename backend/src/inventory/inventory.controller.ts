import { Controller, Get } from '@nestjs/common';

@Controller('inventory')
export class InventoryController {
  @Get()
  list() {
    return [
      { item: 'Detergent', stock: 42, unit: 'liters' },
      { item: 'Laundry Bags', stock: 180, unit: 'pcs' },
      { item: 'Fabric Softener', stock: 21, unit: 'liters' },
    ];
  }
}
