// ================================================
// RESERA — Enums globales del sistema
// ================================================

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',     // Matadero / Faenador
  BUYER = 'buyer',       // Carnicería
}

export enum UserStatus {
  PENDING = 'pending',       // Cuenta creada, esperando aprobación admin
  ACTIVE = 'active',         // Operativa
  SUSPENDED = 'suspended',   // Suspendida por deuda vencida (auto o manual)
  BLOCKED = 'blocked',       // Bloqueada por admin (múltiples incumplimientos)
  REJECTED = 'rejected',     // Rechazada en proceso de aprobación
}

// -----------------------------------------------
// Scoring
// -----------------------------------------------
export enum ScoreCategory {
  EXCELLENT = 'excellent',   // 80-100 → 0% seña
  REGULAR = 'regular',       // 40-79  → 30% seña
  RISKY = 'risky',           // 0-39   → 50% o rechazo
}

export enum ScoreEventType {
  PAYMENT_ON_TIME = 'payment_on_time',           // +5
  PAYMENT_LATE_1_3 = 'payment_late_1_3',         // -8
  PAYMENT_LATE_4_7 = 'payment_late_4_7',         // -15
  PAYMENT_VERY_LATE = 'payment_very_late',        // -25
  ORDER_COMPLETED = 'order_completed',            // +3
  POSITIVE_RATING = 'positive_rating',            // +5
  NEGATIVE_RATING = 'negative_rating',            // -10
  ACCOUNT_SUSPENDED = 'account_suspended',        // -20
  DISPUTE_LOST = 'dispute_lost',                  // -15
  DISPUTE_WON = 'dispute_won',                    // +5
  MANUAL_ADJUSTMENT = 'manual_adjustment',        // admin
}

// -----------------------------------------------
// Listings (Publicaciones de Reses/Lotes)
// -----------------------------------------------
export enum AnimalSpecies {
  BEEF = 'vacuno',
  PORK = 'cerdo',
  LAMB = 'cordero',
  OTHER = 'otro',
}

export enum AnimalBreed {
  ANGUS = 'angus',
  HEREFORD = 'hereford',
  SHORTHORN = 'shorthorn',
  BRAHMAN = 'brahman',
  CRIOLLO = 'criollo',
  CRUZA = 'cruza',
  OTHER = 'otro',
}

export enum ListingType {
  WHOLE_RES = 'res_entera',
  HALF_RES = 'media_res',
  CUT_LOT = 'lote_cortes',
}

export enum ListingStatus {
  DRAFT = 'borrador',
  ACTIVE = 'publicado',
  RESERVED = 'reservado',
  SOLD = 'vendido',
  PAUSED = 'pausado',
  EXPIRED = 'vencido',
}

// -----------------------------------------------
// Orders (Pedidos)
// -----------------------------------------------
export enum OrderStatus {
  PENDING_SEÑA = 'esperando_seña',       // Esperando pago de seña
  SEÑA_PAID = 'seña_pagada',             // Seña cobrada, confirmado
  IN_PREPARATION = 'en_preparacion',
  DISPATCHED = 'despachado',
  DELIVERED = 'entregado',
  CANCELLED = 'cancelado',
  DISPUTED = 'en_disputa',
  EXPIRED = 'vencido',                   // Timer de seña vencido
}

export enum PaymentMethod {
  MERCADO_PAGO = 'mercado_pago',
  TRANSFER = 'transferencia',
  CASH = 'efectivo',
  CHECK = 'cheque',
  CUENTA_CORRIENTE = 'cuenta_corriente',
}

export enum PaymentStatus {
  PENDING = 'pendiente',
  PAID = 'pagado',
  OVERDUE = 'vencido',
  REFUNDED = 'reembolsado',
  IN_DISPUTE = 'en_disputa',
}

// -----------------------------------------------
// Ratings (Calificaciones)
// -----------------------------------------------
export enum RatingDirection {
  BUYER_TO_VENDOR = 'comprador_a_vendedor',
  VENDOR_TO_BUYER = 'vendedor_a_comprador',
}

// -----------------------------------------------
// Payments (Mercado Pago)
// -----------------------------------------------
export enum MercadoPagoStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}
