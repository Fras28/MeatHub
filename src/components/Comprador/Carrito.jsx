import React from 'react';
import { ShoppingCart, X, CreditCard, ChevronRight, MapPin, Truck, Package, Tag } from 'lucide-react';

export default function Carrito({ 
  carrito, 
  onRemove, 
  totales, 
  checkoutStep, 
  setCheckoutStep,
  direccionEntrega,
  setDireccionEntrega,
  direcciones,
  onCheckout
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-40">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <ShoppingCart className="text-red-600" size={20} />
        Tu Pedido
      </h3>
      
      {carrito.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
          <p>El carrito está vacío</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {carrito.map(item => (
            <div key={`${item.sku}-${item.tipo_compra}`} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.tipo_compra === 'lote' ? (
                    <Package size={14} className="text-blue-500" />
                  ) : (
                    <Tag size={14} className="text-green-500" />
                  )}
                  <p className="font-medium text-sm font-mono truncate">{item.sku}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {item.tipo} • {item.peso}kg
                  {item.tipo_compra === 'lote' && (
                    <span className="text-blue-600 font-medium ml-1">(LOTE COMPLETO)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className="font-bold text-sm">
                  ${item.tipo_compra === 'lote' 
                    ? item.precio_total.toLocaleString() 
                    : (item.peso * item.precio_ajustado).toLocaleString()
                  }
                </span>
                <button 
                  onClick={() => onRemove(item.sku)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {carrito.length > 0 && (
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">${totales.subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-600 flex items-center gap-1">
              <Truck size={14} /> Flete
            </span>
            <div className="text-right">
              <span className="font-medium">${totales.flete.toLocaleString()}</span>
              <p className="text-xs text-slate-400">{totales.pesoTotal}kg × $100</p>
            </div>
          </div>

          {totales.tieneLote && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento por lote</span>
              <span className="font-medium">Incluido</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-red-600">${totales.total.toLocaleString()}</span>
          </div>

          {checkoutStep === 0 ? (
            <button 
              onClick={() => setCheckoutStep(1)}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium mt-4 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              Proceder al Checkout <ChevronRight size={18} />
            </button>
          ) : (
            <div className="space-y-3 mt-4 animate-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Dirección de Entrega
                </label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(parseInt(e.target.value))}
                >
                  {direcciones.map(d => (
                    <option key={d.id} value={d.id}>{d.calle}, {d.ciudad}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
              >
                <CreditCard size={18} /> Confirmar Pago
              </button>
              
              <button 
                onClick={() => setCheckoutStep(0)}
                className="w-full text-slate-600 py-2 text-sm hover:text-slate-900 font-medium"
              >
                ← Volver al carrito
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}