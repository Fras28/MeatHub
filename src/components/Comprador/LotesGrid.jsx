import React from 'react';
import { Package, ChevronRight, ShoppingCart, Weight, Calendar, MapPin, Tag } from 'lucide-react';
import { FRIGORIFICOS, calcularPrecioLote } from '../../data/mockData';

export default function LotesGrid({ lotes, onVerLote, onComprarLote }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{lotes.length} lotes disponibles</h3>
        <p className="text-sm text-slate-500">Compra el lote completo y obtén 5% de descuento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lotes.map(lote => {
          const frigorifico = FRIGORIFICOS.find(f => f.id === lote.frigorifico);
          const precioLote = calcularPrecioLote(lote);
          const precioNormal = lote.unidades.reduce((sum, u) => sum + (u.peso * u.precio_ajustado), 0);
          const ahorro = precioNormal - precioLote;
          const pesoTotal = lote.unidades.reduce((sum, u) => sum + u.peso, 0);

          return (
            <div key={lote.sku} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
              {/* Imagen */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={lote.imagen} 
                  alt={lote.sku}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg">
                  <p className="font-bold text-sm font-mono text-slate-900">{lote.sku}</p>
                </div>
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  5% OFF
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <MapPin size={14} className="text-red-500" />
                  <span>{frigorifico?.nombre}</span>
                  <span className="text-slate-300">|</span>
                  <Calendar size={14} />
                  <span>{lote.fecha_faena}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Weight size={12} />
                    {pesoTotal} kg total
                  </span>
                  <span className="flex items-center gap-1">
                    <Package size={12} />
                    {lote.unidades.length} unidades
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {lote.dias_maduracion} días maduración
                  </span>
                </div>

                {/* Unidades incluidas */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {lote.unidades.map(u => (
                    <span key={u.sku} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {u.tipo === 'Res Entera' ? '🐄' : u.tipo === 'Media Res' ? '🥩' : '🍖'} {u.peso}kg
                    </span>
                  ))}
                </div>

                {/* Precios */}
                <div className="border-t border-slate-100 pt-3 mb-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-400 line-through">
                        ${precioNormal.toLocaleString()}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        ${precioLote.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Ahorras ${ahorro.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Precio por kg</p>
                      <p className="font-medium text-slate-700">
                        ${Math.round(precioLote / pesoTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onVerLote(lote)}
                    className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                  >
                    Ver Unidades <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => onComprarLote(lote)}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-red-600/20"
                  >
                    <ShoppingCart size={16} /> Comprar Lote
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}