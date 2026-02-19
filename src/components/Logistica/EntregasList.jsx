import React from 'react';
import { CheckCircle, Phone, Package, MapPin, User } from 'lucide-react';

export default function EntregasList({ entregas, onConfirmar }) {
  const pendientes = entregas.filter(e => e.estado !== 'Entregado');

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Acciones del Transportista</h3>
        
        {pendientes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
            <p className="font-medium text-slate-600">Todas las entregas completadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map(entrega => (
              <div key={entrega.id} className="p-4 border border-slate-200 rounded-lg hover:border-red-300 transition-colors bg-slate-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{entrega.orden}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <User size={12} /> {entrega.cliente}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {entrega.direccion}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {entrega.estado}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onConfirmar(entrega.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1 shadow-lg shadow-green-600/20"
                  >
                    <CheckCircle size={16} /> Confirmar Entrega
                  </button>
                  
                  <a 
                    href={`tel:${entrega.telefono}`}
                    className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
        <h4 className="font-bold text-red-900 text-sm mb-3 flex items-center gap-2">
          <Package size={16} /> Resumen de Carga
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-red-700">Total de órdenes</span>
            <span className="font-bold text-red-900">{entregas.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700">Completadas</span>
            <span className="font-bold text-green-600">
              {entregas.filter(e => e.estado === 'Entregado').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700">Pendientes</span>
            <span className="font-bold text-amber-600">{pendientes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}