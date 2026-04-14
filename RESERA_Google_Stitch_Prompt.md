# 🎨 RESERA — Prompt para Google Stitch (UX/UI Design)

> Copiá y pegá este prompt directamente en Google Stitch para generar el diseño UX/UI completo de la plataforma RESERA.

---

## PROMPT PARA GOOGLE STITCH

```
Design a complete UX/UI system for "RESERA" — a premium B2B meat platform for professionals.

BRAND IDENTITY:
- Brand name: RESERA
- Tagline: "El origen del corte: res entera para expertos" (The origin of the cut: whole beef for experts)
- Logo: Black bull silhouette with a dark red shield/collar shape
- Primary colors: Deep charcoal black (#1A1A1A), crimson red (#8B1A1A), warm white (#F5F0EB)
- Accent: Gold/amber (#C9963E) for premium highlights
- Typography: Bold sans-serif for headings (similar to Impact or Bebas Neue), clean readable sans-serif for body text
- Mood: Premium, professional, bold, artisanal — like a high-end butcher meets modern B2B SaaS

TARGET USERS:
1. Professional butchers and meat shops (carnicerías)
2. Restaurants and chefs
3. Meat distributors and wholesalers
4. Internal RESERA administrators

PLATFORM OVERVIEW:
A full-stack web platform with:
- Public landing page
- Customer portal (B2B ordering)
- Admin dashboard
- Mobile-responsive design

---

SCREENS TO DESIGN:

1. LANDING PAGE
- Hero section: Full-bleed dark background with bull/cow silhouette, bold headline "Res entera para expertos", CTA buttons "Comprar ahora" and "Ver catálogo"
- Value proposition section: 3 cards — "Calidad premium", "Trazabilidad total", "Entrega directa"
- Featured cuts section: Grid of premium beef cuts with dark photography, name, weight range, price per kg
- How it works: 3-step process (Elegí tu res → Seleccioná los cortes → Recibí en tu negocio)
- Testimonials from professional butchers
- Footer with logo, contact, social links

2. AUTHENTICATION SCREENS
- Login page: Dark elegant design, email + password, "Acceder" button
- Register page: Business registration form (empresa, CUIT, rubro, contacto)
- Forgot password flow

3. CUSTOMER DASHBOARD (B2B Portal)
- Sidebar navigation: Dashboard, Catálogo, Mis Pedidos, Historial, Perfil, Soporte
- Home dashboard: Welcome message, active orders summary cards (En proceso, Entregados, Pendientes), quick order button
- Stats overview: Monthly spend, total orders, most ordered cuts — displayed as clean metric cards

4. PRODUCT CATALOG — CUTS CATALOG
- Grid layout with high-quality dark photography of each cut
- Each card shows: cut name (Spanish), category (vacío, lomo, costilla, etc.), weight range (kg), price per kg, availability badge
- Filter sidebar: Category, weight range, price range, availability
- Search bar prominent at top
- Product detail modal/page: Large image, full description, nutritional/technical specs, quantity selector, "Agregar al pedido" button

5. ORDER FLOW
- Cart/shopping bag sidebar
- Order summary page: Items, quantities, weights, subtotal, delivery date picker
- Checkout: Delivery address, delivery date, payment method (cuenta corriente / transferencia), notes
- Order confirmation: Success state with order number and estimated delivery

6. ORDER MANAGEMENT (Customer)
- Orders list table: Order #, date, items, total kg, total price, status badge (Pendiente/En proceso/Despachado/Entregado)
- Order detail page: Timeline of order status, item breakdown, delivery info

7. ADMIN DASHBOARD
- Stats overview: Daily/weekly/monthly sales, active orders, low stock alerts, top customers
- Charts: Revenue line chart, orders by category bar chart, top products
- Quick actions: New product, process order, add inventory

8. ADMIN — INVENTORY & CATTLE (RESES)
- Reses (Cattle) management table: ID, breed, weight (kg), purchase date, status (En depósito/En proceso/Despachado), origin
- Add/Edit cattle form: Weight, breed, origin farm, purchase price, entry date
- Desposte tracking: For each cattle, show which cuts have been extracted, kg used, kg remaining
- Stock levels per cut type with low-stock warning indicators

9. ADMIN — PRODUCTS/CUTS MANAGEMENT
- Products table with inline edit: Name, category, price/kg, available stock (kg), status toggle
- Add/Edit product form: Rich details with image upload
- Bulk price update tool

10. ADMIN — ORDERS MANAGEMENT
- Orders kanban board OR table with status columns
- Order detail with ability to: Update status, assign delivery date, add tracking notes, print invoice

11. ADMIN — CUSTOMERS
- Customer list: Business name, CUIT, contact, total orders, total spend, account type
- Customer detail: Full profile, order history, credit limit, notes

12. MOBILE VIEWS (responsive)
- Mobile nav: Bottom tab bar with icons
- Mobile catalog: Single column card grid
- Mobile order tracking: Simplified timeline view

---

DESIGN SYSTEM REQUIREMENTS:

Colors:
- Background: #0F0F0F (dark mode primary), #1A1A1A (cards/panels)
- Surface: #242424 (elevated elements)
- Primary accent: #8B1A1A (crimson red)  
- Secondary accent: #C9963E (gold/amber)
- Text primary: #F5F0EB (warm white)
- Text secondary: #9E9E9E (muted gray)
- Success: #4CAF50, Warning: #FF9800, Error: #F44336
- Status badges: colored pills on dark background

Typography scale:
- Display: 48-64px bold (hero headings)
- H1: 36px bold
- H2: 28px semibold
- H3: 22px semibold
- Body: 16px regular
- Caption: 13px regular
- All text on dark backgrounds should be high contrast

Components needed:
- Navigation sidebar (desktop) + bottom nav (mobile)
- Product cards (dark photography style)
- Status badges/pills
- Data tables with pagination
- Modal/drawer overlays
- Form inputs (dark theme)
- Metric/KPI cards
- Charts and graphs
- Toast notifications
- Loading skeletons
- Empty states
- Confirmation dialogs

VISUAL STYLE:
- Overall: Premium dark theme (not pure black, use warm dark tones)
- Photography style references: High-contrast beef/meat photography, dramatic lighting
- UI density: Medium — not too sparse, not cluttered
- Micro-interactions: Subtle hover states, smooth transitions
- Icons: Outline style, consistent set (Lucide or Heroicons style)
- Border radius: 8px for cards, 4px for inputs, 24px for pills/badges
- Shadows: Subtle, warm-tinted (not pure black shadows)

SPECIFIC UX REQUIREMENTS:
- The catalog must make it easy to see price per kg and available stock at a glance
- Order process should be max 3 steps for professional users
- Admin inventory view must show cattle → cuts traceability clearly
- All forms should be minimal — professionals don't want complex flows
- Mobile must work well for on-the-go ordering by restaurant/butcher staff

Please create a complete, production-ready design system and all screens listed above. Use a consistent dark premium aesthetic throughout. Include hover states and interactive elements. The platform should feel like a premium B2B tool built specifically for serious meat industry professionals.
```

---

## 📋 Notas adicionales para Stitch

- **Estilo de referencia**: Combinar la estética de plataformas como **Draftbit**, **Shopify (dark mode)** y el look premium de **Porter** o **Linear**
- **Fotografía**: Si Stitch permite assets, usar imágenes de cortes de res con fondo oscuro y iluminación dramática
- **Idioma**: La plataforma es en español (Argentina), mantener todos los textos de UI en español
- **Prioridad de pantallas**: Landing → Catálogo → Dashboard Admin → Gestión de Pedidos → Inventario/Reses

---

## 🗂️ Arquitectura de pantallas sugerida para Stitch

```
RESERA App
├── Public
│   ├── Landing Page
│   ├── Login
│   └── Register
├── Customer Portal
│   ├── Dashboard
│   ├── Catálogo de Cortes
│   │   └── Detalle de Producto
│   ├── Carrito / Nuevo Pedido
│   ├── Checkout
│   ├── Mis Pedidos
│   │   └── Detalle de Pedido
│   └── Mi Perfil
└── Admin Panel
    ├── Dashboard Admin
    ├── Reses (Inventario de ganado)
    │   └── Detalle de Res
    ├── Productos / Cortes
    ├── Pedidos
    │   └── Detalle de Pedido
    └── Clientes
```
