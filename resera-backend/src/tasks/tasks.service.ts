import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ListingsService } from '../listings/listings.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly listingsService: ListingsService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Cada hora: expirar publicaciones con expiresAt vencido.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expireStaleListings(): Promise<void> {
    try {
      const count = await this.listingsService.expireStale();
      if (count > 0) {
        this.logger.log(`[CRON] ${count} publicación(es) expirada(s) automáticamente.`);
      }
    } catch (err) {
      this.logger.error('[CRON] Error al expirar publicaciones:', err);
    }
  }

  /**
   * Cada 30 minutos: expirar pedidos cuya seña no fue pagada en 24hs.
   * Devuelve la publicación al catálogo y penaliza el score del comprador.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async expireOverdueSeñas(): Promise<void> {
    try {
      const count = await this.ordersService.expireOverdueSeñas();
      if (count > 0) {
        this.logger.warn(`[CRON] ${count} pedido(s) vencido(s) por seña no pagada.`);
      }
    } catch (err) {
      this.logger.error('[CRON] Error al expirar señas vencidas:', err);
    }
  }
}
