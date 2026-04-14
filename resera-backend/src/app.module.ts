import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// ── Entities ───────────────────────────────────────────────────────────────
import { User }       from './users/entities/user.entity';
import { Listing }    from './listings/entities/listing.entity';
import { Order }      from './orders/entities/order.entity';
import { Payment }    from './payments/entities/payment.entity';
import { ScoreEvent } from './scoring/entities/score-event.entity';
import { Rating }     from './ratings/entities/rating.entity';

// ── Feature Modules ────────────────────────────────────────────────────────
import { AuthModule }     from './auth/auth.module';
import { UsersModule }    from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { OrdersModule }   from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ScoringModule }  from './scoring/scoring.module';
import { RatingsModule }  from './ratings/ratings.module';
import { TasksModule }    from './tasks/tasks.module';

@Module({
  imports: [
    // ── Configuración global ─────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate Limiting ─────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ([{
        ttl:   60_000,                                         // 60 segundos
        limit: config.get<number>('THROTTLE_LIMIT', 60),
      }]),
      inject: [ConfigService],
    }),

    // ── Cron Jobs ─────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Event Bus (para comunicación entre módulos) ───────────
    EventEmitterModule.forRoot(),

    // ── Base de Datos (Supabase / PostgreSQL) ─────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const isProd    = config.get<string>('NODE_ENV') === 'production';
        const dbUrl     = config.get<string>('DATABASE_URL');
        const useSSL    = isProd || config.get<string>('DB_SSL') === 'true';
        const sslConfig = useSSL ? { rejectUnauthorized: false } : false;

        // Log de diagnóstico (solo en desarrollo)
        if (!isProd) {
          console.log('[DB] DATABASE_URL:', dbUrl ? `${dbUrl.slice(0, 40)}...` : '⚠️  NO DEFINIDA — verificá tu .env');
        }

        // Si hay DATABASE_URL (Supabase pooler), usarla directamente
        if (dbUrl) {
          return {
            type: 'postgres' as const,
            url: dbUrl,
            entities: [User, Listing, Order, Payment, ScoreEvent, Rating],
            synchronize: !isProd,
            logging:  config.get<string>('DB_LOGGING') === 'true',
            ssl: sslConfig,
            extra: { max: 10 },
          };
        }

        // Fallback: variables individuales (DB_HOST, DB_PORT, etc.)
        return {
          type: 'postgres' as const,
          host:     config.get<string>('DB_HOST', 'localhost'),
          port:     config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_DATABASE', 'resera_db'),
          entities: [User, Listing, Order, Payment, ScoreEvent, Rating],
          synchronize: !isProd,
          logging:  config.get<string>('DB_LOGGING') === 'true',
          ssl: sslConfig,
          extra: { max: 10 },
        };
      },
      inject: [ConfigService],
    }),

    // ── Feature Modules ───────────────────────────────────────
    AuthModule,
    UsersModule,
    ListingsModule,
    OrdersModule,
    PaymentsModule,
    ScoringModule,
    RatingsModule,
    TasksModule,
  ],

  providers: [
    // Rate limiting aplicado globalmente
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}