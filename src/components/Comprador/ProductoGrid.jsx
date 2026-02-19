import React, { useState } from 'react';
import { Plus, ScanLine, Weight, Calendar, Thermometer, Package } from 'lucide-react';
import QRModal from '../Common/QRModal';
import { FRIGORIFICOS } from '../../data/mockData';

export default function ProductoGrid({ unidades, onAddToCart, loteActual }) {
  const [selectedQR, setSelectedQR] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">
          {unidades.length} unidades disponibles
          {loteActual && <span className="text-sm font-normal text-slate-500 ml-2">en {loteActual.sku}</span>}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unidades.map(unidad => {
          const frigorifico = FRIGORIFICOS.find(f => f.id === unidad.frigorifico);
          
          return (
            <div key={unidad.sku} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={unidad.imagen} 
                  alt={unidad.sku} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold font-mono text-slate-800">
                  {unidad.sku}
                </div>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
                  {unidad.tipo}
                </div>
                <button 
                  onClick={() => setSelectedQR(unidad)}
                  className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
                  title="Ver trazabilidad"
                >
                  <ScanLine size={18} className="text-slate-700" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-slate-500">{unidad.lote_sku || loteActual?.sku}</p>
                    <p className="font-bold text-slate-900">{frigorifico?.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">${unidad.precio_ajustado}</p>
                    <p className="text-xs text-slate-500">por kg</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 my-3 text-xs">
                  <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                    <Weight size={14} className="mx-auto mb-1 text-slate-400" />
                    <span className="font-semibold text-slate-700">{unidad.peso}kg</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                    <Calendar size={14} className="mx-auto mb-1 text-slate-400" />
                    <span className="font-semibold text-slate-700">{unidad.dias_maduracion}d</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                    <Thermometer size={14} className="mx-auto mb-1 text-slate-400" />
                    <span className="font-semibold text-slate-700">Grasa {unidad.grasa_calidad}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-slate-500">Total:</span>
                  <span className="font-bold text-slate-900">
                    ${(unidad.peso * unidad.precio_ajustado).toLocaleString()}
                  </span>
                </div>

                <button 
                  onClick={() => onAddToCart(unidad)}
                  className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-slate-900/20 hover:shadow-red-600/20"
                >
                  <Plus size={18} /> Agregar al Carrito
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedQR && (
        <QRModal unidad={selectedQR} onClose={() => setSelectedQR(null)} />
      )}
    </div>
  );
}