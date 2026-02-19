// Generador de SKU para Lotes: LOTE-AAAA-NNNN (Año-Número secuencial)
const generateLoteSKU = (index) => {
  const year = new Date().getFullYear();
  const seq = String(index + 1).padStart(4, '0');
  return `LOTE-${year}-${seq}`;
};

// Generador de SKU para Unidades: RES-AAAA-NNNN-T (T = tipo: R=Res, M=Media, CD=Cuarto Del, CT=Cuarto Tras)
const generateUnidadSKU = (loteSKU, index, tipo) => {
  const seq = String(index + 1).padStart(3, '0');
  const tipoCode = {
    'Res Entera': 'R',
    'Media Res': 'M',
    'Cuarto Delantero': 'CD',
    'Cuarto Trasero': 'CT'
  }[tipo] || 'X';
  return `${loteSKU}-${seq}-${tipoCode}`;
};

export const FRIGORIFICOS = [
  { id: 'FR001', nombre: 'Frigorífico Norte', ubicacion: 'Buenos Aires' },
  { id: 'FR002', nombre: 'Carnes del Sur', ubicacion: 'Córdoba' },
  { id: 'FR003', nombre: 'La Pampa Premium', ubicacion: 'Santa Fe' }
];

export const DIRECCIONES = [
  { id: 1, calle: 'Av. Corrientes 1234', ciudad: 'CABA', provincia: 'Buenos Aires' },
  { id: 2, calle: 'San Martín 567', ciudad: 'Rosario', provincia: 'Santa Fe' }
];

// LOTES con SKU
export const LOTES_INICIALES = [
  {
    sku: 'LOTE-2024-0001',
    id: 'lote-001',
    frigorifico: 'FR001',
    fecha_faena: '2024-01-15',
    dias_maduracion: 21,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1544025162-d76690b60944?w=800&q=80',
    unidades: [
      {
        sku: 'LOTE-2024-0001-001-R',
        id: 'res-001-a',
        tipo: 'Res Entera',
        peso: 450,
        precio_ajustado: 4500,
        grasa_calidad: 1,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1607623814075-e51df1bd6565?w=800&q=80',
        parent_sku: null
      },
      {
        sku: 'LOTE-2024-0001-002-R',
        id: 'res-001-b',
        tipo: 'Res Entera',
        peso: 465,
        precio_ajustado: 4500,
        grasa_calidad: 2,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1607623814075-e51df1bd6565?w=800&q=80',
        parent_sku: null
      }
    ]
  },
  {
    sku: 'LOTE-2024-0002',
    id: 'lote-002',
    frigorifico: 'FR002',
    fecha_faena: '2024-01-20',
    dias_maduracion: 14,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    unidades: [
      {
        sku: 'LOTE-2024-0002-001-M',
        id: 'res-002-a',
        tipo: 'Media Res',
        peso: 225,
        precio_ajustado: 4600,
        grasa_calidad: 1,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1544025162-d76690b60944?w=800&q=80',
        parent_sku: null
      },
      {
        sku: 'LOTE-2024-0002-002-M',
        id: 'res-002-b',
        tipo: 'Media Res',
        peso: 230,
        precio_ajustado: 4600,
        grasa_calidad: 2,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1544025162-d76690b60944?w=800&q=80',
        parent_sku: null
      }
    ]
  }
];

// Export legacy para compatibilidad (NO USAR - deprecado)
export const INITIAL_UNIDADES = [];

// Helper para obtener todas las unidades planas (para el comprador)
export const getAllUnidades = (lotes) => {
  return lotes.flatMap(lote => 
    lote.unidades.map(unidad => ({
      ...unidad,
      lote_id: lote.id,
      lote_sku: lote.sku,
      frigorifico: lote.frigorifico,
      dias_maduracion: lote.dias_maduracion,
      fecha_faena: lote.fecha_faena
    }))
  );
};

// Helper para calcular precio de lote completo
export const calcularPrecioLote = (lote) => {
  const pesoTotal = lote.unidades.reduce((sum, u) => sum + u.peso, 0);
  const precioPromedio = lote.unidades.reduce((sum, u) => sum + u.precio_ajustado, 0) / lote.unidades.length;
  const descuentoLote = 0.95; // 5% descuento por compra de lote completo
  return Math.round(pesoTotal * precioPromedio * descuentoLote);
};

// Generadores exportados para usar en componentes
export { generateLoteSKU, generateUnidadSKU };