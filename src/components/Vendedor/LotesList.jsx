import React from 'react';
import { Package, ChevronRight, Weight, Calendar, MapPin, Tag } from 'lucide-react';
import { FRIGORIFICOS, calcularPrecioLote } from '../../data/mockData';

export default function LotesList({ lotes, onSeleccionar }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Package className="text-blue-600" size={20} />
        Lotes Disponibles
        <span className="text-sm font-normal text-slate-500 ml-2">
          ({lotes.length} lotes)
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lotes.map(lote => {
          const frigorifico = FRIGORIFICOS.find(f => f.id === lote.frigorifico);
          const unidadesDisponibles = lote.unidades.filter(u => u.estado === 'Disponible').length;
          const pesoTotal = lote.unidades.reduce((sum, u) => sum + u.peso, 0);
          const precioLote = calcularPrecioLote(lote);

          return (
            <div 
              key={lote.sku}
              onClick={() => onSeleccionar(lote)}
              className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group bg-white"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={lote.imagen} alt={lote.sku} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg">
                  <p className="font-bold text-sm font-mono text-slate-900">{lote.sku}</p>
                </div>
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                  {unidadesDisponibles}/{lote.unidades.length} disp.
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <MapPin size={14} className="text-red-500" />
                  <span>{frigorifico?.nombre}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Faena: {lote.fecha_faena}
                  </span>
                  <span className="flex items-center gap-1">
                    <Weight size={12} />
                    {pesoTotal} kg total
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {['Res Entera', 'Media Res'].map(tipo => {
                    const count = lote.unidades.filter(u => u.tipo === tipo).length;
                    if (count === 0) return null;
                    return (
                      <span key={tipo} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {count} {tipo}
                      </span>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Precio por lote</p>
                    <p className="text-lg font-bold text-red-600">
                      ${precioLote.toLocaleString()}
                    </p>
                  </div>
                  <button className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1">
                    Inspeccionar <ChevronRight size={16} />
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