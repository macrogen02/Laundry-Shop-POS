import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsArray, IsIn, IsNumber, IsString, Min } from 'class-validator';
import { OrdersService } from './orders.service';

class CreateOrderDto {
  @IsString()
  customerName!: string;

  @IsArray()
  services!: string[];

  @IsNumber()
  @Min(1)
  weightKg!: number;

  @IsNumber()
  amount!: number;

  @IsIn(['Cash', 'Card', 'Online'])
  paymentMethod!: 'Cash' | 'Card' | 'Online';
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  create(@Body() body: CreateOrderDto) {
    return this.ordersService.create(body);
  }

  @Patch(':id/advance')
  advance(@Param('id') id: string) {
    return this.ordersService.advance(id);
  }
}
