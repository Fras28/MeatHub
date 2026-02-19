import React, { useState } from 'react';
import { Camera, Scissors, Check, Weight, DollarSign, Tag } from 'lucide-react';
import { FRIGORIFICOS } from '../../data/mockData';

export default function GaleriaInspeccion({ lote, onFraccionar, onActualizarUnidad }) {
  const [modoEdicion, setModoEdicion] = useState(null);
  const [editData, setEditData] = useState({});

  const frigorifico = FRIGORIFICOS.find(f => f.id === lote.frigorifico);

  const iniciarEdicion = (unidad) => {
    setModoEdicion(unidad.sku);
    setEditData({
      peso: unidad.peso,
      precio_ajustado: unidad.precio_ajustado,
      grasa_calidad: unidad.grasa_calidad
    });
  };

  const guardarEdicion = (unidadSku) => {
    onActualizarUnidad(unidadSku, editData);
    setModoEdicion(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Camera className="text-red-400" size={24} />
              Inspección: <span className="font-mono">{lote.sku}</span>
            </h3>
            <p className="text-slate-400 mt-1">
              {frigorifico?.nombre} • {lote.unidades.length} unidades • 
              Maduración: {lote.dias_maduracion} días
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Valor estimado del lote</p>
            <p className="text-2xl font-bold text-green-400">
              ${lote.unidades.reduce((sum, u) => sum + (u.peso * u.precio_ajustado), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4">Unidades del Lote</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lote.unidades.map(unidad => (
            <div key={unidad.sku} className={`border-2 rounded-xl overflow-hidden transition-all ${
              unidad.estado === 'Vendido' ? 'border-slate-200 opacity-60' :
              unidad.estado === 'Reservado' ? 'border-amber-300' :
              'border-slate-200 hover:border-red-300 hover:shadow-lg'
            }`}>
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img src={unidad.imagen} alt={unidad.sku} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                  <p className="font-bold text-xs font-mono">{unidad.sku}</p>
                </div>
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                  unidad.estado === 'Disponible' ? 'bg-green-500 text-white' :
                  unidad.estado === 'Reservado' ? 'bg-amber-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {unidad.estado}
                </div>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-1 rounded text-xs font-medium">
                  {unidad.tipo}
                </div>
              </div>
              
              <div className="p-4">
                {modoEdicion === unidad.sku ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500">Peso (kg)</label>
                      <input 
                        type="number"
                        value={editData.peso}
                        onChange={(e) => setEditData({...editData, peso: parseInt(e.target.value)})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Precio/kg ($)</label>
                      <input 
                        type="number"
                        value={editData.precio_ajustado}
                        onChange={(e) => setEditData({...editData, precio_ajustado: parseInt(e.target.value)})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => guardarEdicion(unidad.sku)}
                        className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Check size={14} /> Guardar
                      </button>
                      <button 
                        onClick={() => setModoEdicion(null)}
                        className="flex-1 bg-slate-200 text-slate-700 py-1.5 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Weight size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-900">{unidad.peso} kg</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign size={14} className="text-slate-400" />
                          <span className="font-bold text-red-600">${unidad.precio_ajustado}/kg</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Tag size={14} className="text-slate-400" />
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            unidad.grasa_calidad === 1 ? 'bg-green-100 text-green-700' :
                            unidad.grasa_calidad === 2 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            Grasa Grado {unidad.grasa_calidad}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="font-bold text-slate-900">
                          ${(unidad.peso * unidad.precio_ajustado).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => iniciarEdicion(unidad)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded text-xs font-medium transition-colors"
                      >
                        Editar
                      </button>
                      
                      {unidad.tipo === 'Res Entera' && unidad.estado === 'Disponible' && (
                        <button 
                          onClick={() => onFraccionar(unidad.sku)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Scissors size={12} /> Fraccionar
                        </button>
                      )}
                    </div>

                    {unidad.parent_sku && (
                      <p className="text-xs text-slate-400 mt-2 text-center font-mono">
                        De: {unidad.parent_sku}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}