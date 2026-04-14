import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ListingsModule } from '../listings/listings.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ListingsModule, OrdersModule],
  providers: [TasksService],
})
export class TasksModule {}
