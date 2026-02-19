import React, { useState, useMemo } from 'react';
import { ShoppingCart, Shield } from 'lucide-react';
import Filtros from '../components/Comprador/Filtros';
import ProductoGrid from '../components/Comprador/ProductoGrid';
import Carrito from '../components/Comprador/Carrito';
import LotesGrid from '../components/Comprador/LotesGrid'; // Nuevo componente
import { LOTES_INICIALES, DIRECCIONES, getAllUnidades, calcularPrecioLote } from '../data/mockData';

export default function CompradorView({ showToast, carrito, setCarrito }) {
  const [lotes, setLotes] = useState(LOTES_INICIALES);
  const [vista, setVista] = useState('lotes'); // 'lotes' | 'unidades'
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  
  const [filtros, setFiltros] = useState({
    frigorifico: '',
    diasMaduracion: '',
    pesoMin: '',
    pesoMax: '',
    tipo: ''
  });

  const [checkoutStep, setCheckoutStep] = useState(0);
  const [direccionEntrega, setDireccionEntrega] = useState(1);

  // Obtener unidades según vista
  const unidadesDisponibles = useMemo(() => {
    let unidades = [];
    if (vista === 'lotes' && loteSeleccionado) {
      unidades = loteSeleccionado.unidades.map(u => ({
        ...u,
        lote_id: loteSeleccionado.id,
        lote_sku: loteSeleccionado.sku,
        frigorifico: loteSeleccionado.frigorifico,
        dias_maduracion: loteSeleccionado.dias_maduracion,
        fecha_faena: loteSeleccionado.fecha_faena
      }));
    } else {
      unidades = getAllUnidades(lotes);
    }
    
    // Aplicar filtros
    return unidades.filter(u => {
      if (u.estado !== 'Disponible') return false;
      if (filtros.frigorifico && u.frigorifico !== filtros.frigorifico) return false;
      if (filtros.tipo && u.tipo !== filtros.tipo) return false;
      if (filtros.pesoMin && u.peso < parseInt(filtros.pesoMin)) return false;
      if (filtros.pesoMax && u.peso > parseInt(filtros.pesoMax)) return false;
      if (filtros.diasMaduracion && u.dias_maduracion < parseInt(filtros.diasMaduracion)) return false;
      return true;
    });
  }, [lotes, vista, loteSeleccionado, filtros]);

  const agregarAlCarrito = (item, tipo = 'unidad') => {
    const yaEnCarrito = carrito.find(c => c.sku === item.sku);
    if (yaEnCarrito) {
      showToast('Este item ya está en el carrito', 'error');
      return;
    }

    const itemCarrito = {
      ...item,
      tipo_compra: tipo, // 'lote' | 'unidad'
      cantidad: 1
    };

    setCarrito([...carrito, itemCarrito]);
    showToast(tipo === 'lote' ? 'Lote agregado al carrito' : 'Unidad agregada al carrito');
  };

  const agregarLoteCompleto = (lote) => {
    const yaEnCarrito = carrito.find(c => c.sku === lote.sku && c.tipo_compra === 'lote');
    if (yaEnCarrito) {
      showToast('Este lote ya está en el carrito', 'error');
      return;
    }

    const precioLote = calcularPrecioLote(lote);
    const pesoTotal = lote.unidades.reduce((sum, u) => sum + u.peso, 0);

    const itemLote = {
      sku: lote.sku,
      id: lote.id,
      tipo: 'LOTE COMPLETO',
      tipo_compra: 'lote',
      peso: pesoTotal,
      precio_ajustado: Math.round(precioLote / pesoTotal), // Precio promedio con descuento
      precio_total: precioLote,
      frigorifico: lote.frigorifico,
      dias_maduracion: lote.dias_maduracion,
      imagen: lote.imagen,
      unidades_incluidas: lote.unidades.length,
      cantidad: 1
    };

    setCarrito([...carrito, itemLote]);
    showToast(`Lote ${lote.sku} agregado con descuento especial`);
  };

  const removerDelCarrito = (sku) => {
    setCarrito(carrito.filter(item => item.sku !== sku));
  };

  const calcularTotales = () => {
    const itemsUnidad = carrito.filter(c => c.tipo_compra === 'unidad');
    const itemsLote = carrito.filter(c => c.tipo_compra === 'lote');

    const pesoUnidades = itemsUnidad.reduce((sum, item) => sum + item.peso, 0);
    const pesoLotes = itemsLote.reduce((sum, item) => sum + item.peso, 0);
    
    const subtotalUnidades = itemsUnidad.reduce((sum, item) => sum + (item.peso * item.precio_ajustado), 0);
    const subtotalLotes = itemsLote.reduce((sum, item) => sum + item.precio_total, 0);

    const pesoTotal = pesoUnidades + pesoLotes;
    const subtotal = subtotalUnidades + subtotalLotes;
    const flete = pesoTotal * 100;

    return { 
      pesoTotal, 
      subtotal, 
      flete, 
      total: subtotal + flete,
      tieneLote: itemsLote.length > 0,
      tieneUnidad: itemsUnidad.length > 0
    };
  };

  const handleCheckout = () => {
    // Marcar items como vendidos
    const skusComprados = carrito.map(c => c.sku);
    
    setLotes(prev => prev.map(lote => {
      // Si es compra de lote completo
      if (skusComprados.includes(lote.sku)) {
        return {
          ...lote,
          estado: 'Vendido',
          unidades: lote.unidades.map(u => ({ ...u, estado: 'Vendido' }))
        };
      }
      
      // Si es compra por unidad
      return {
        ...lote,
        unidades: lote.unidades.map(u => 
          skusComprados.includes(u.sku) ? { ...u, estado: 'Vendido' } : u
        )
      };
    }));

    showToast('¡Pedido realizado con éxito!');
    setCarrito([]);
    setCheckoutStep(0);
    setVista('lotes');
    setLoteSeleccionado(null);
  };

  return (
    <div className="space-y-6">
      {/* Navegación de vista */}
      <div className="flex gap-4 bg-white p-2 rounded-lg border border-slate-200 w-fit">
        <button
          onClick={() => { setVista('lotes'); setLoteSeleccionado(null); }}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            vista === 'lotes' && !loteSeleccionado
              ? 'bg-red-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ver por Lotes
        </button>
        <button
          onClick={() => setVista('unidades')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            vista === 'unidades' || loteSeleccionado
              ? 'bg-red-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ver por Unidades
        </button>
      </div>

      {/* Breadcrumb si está en un lote */}
      {loteSeleccionado && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <button onClick={() => setLoteSeleccionado(null)} className="hover:text-red-600">
            Lotes
          </button>
          <span>/</span>
          <span className="font-medium text-slate-900">{loteSeleccionado.sku}</span>
        </div>
      )}

      <Filtros filtros={filtros} setFiltros={setFiltros} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {vista === 'lotes' && !loteSeleccionado ? (
            <LotesGrid 
              lotes={lotes.filter(l => l.estado === 'Disponible')}
              onVerLote={setLoteSeleccionado}
              onComprarLote={agregarLoteCompleto}
            />
          ) : (
            <ProductoGrid 
              unidades={unidadesDisponibles}
              onAddToCart={(u) => agregarAlCarrito(u, 'unidad')}
              loteActual={loteSeleccionado}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <Carrito 
            carrito={carrito}
            onRemove={removerDelCarrito}
            totales={calcularTotales()}
            checkoutStep={checkoutStep}
            setCheckoutStep={setCheckoutStep}
            direccionEntrega={direccionEntrega}
            setDireccionEntrega={setDireccionEntrega}
            direcciones={DIRECCIONES}
            onCheckout={handleCheckout}
          />
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-blue-900 text-sm">Garantía de Calidad</p>
                <p className="text-xs text-blue-700 mt-1">
                  Todas las reses incluyen certificación SENASA y trazabilidad completa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}