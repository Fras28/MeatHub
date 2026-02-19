import React from 'react';
import { X, QrCode, Shield, MapPin, Calendar, Weight, Thermometer } from 'lucide-react';
import { FRIGORIFICOS } from '../../data/mockData';

export default function QRModal({ unidad, onClose }) {
  if (!unidad) return null;

  const frigorifico = FRIGORIFICOS.find(f => f.id === unidad.frigorifico);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Trazabilidad</h3>
            <p className="text-sm text-slate-500">Desde el campo al gancho</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        
        <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <QrCode size={140} className="text-slate-800" />
          </div>
          <p className="text-sm font-mono text-slate-500 bg-white px-3 py-1 rounded">{unidad.id}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-500 flex items-center gap-2">
              <MapPin size={14} /> Origen
            </span>
            <span className="font-semibold text-slate-800">{frigorifico?.nombre}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar size={14} /> Fecha de Faena
            </span>
            <span className="font-semibold text-slate-800">{unidad.fecha_ingreso}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-500 flex items-center gap-2">
              <Weight size={14} /> Peso Inicial
            </span>
            <span className="font-semibold text-slate-800">{unidad.peso} kg</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-500 flex items-center gap-2">
              <Thermometer size={14} /> Calidad de Grasa
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded ${
              unidad.grasa_calidad === 1 ? 'bg-green-100 text-green-700' :
              unidad.grasa_calidad === 2 ? 'bg-yellow-100 text-yellow-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              Grado {unidad.grasa_calidad}
            </span>
          </div>

          <div className="flex items-center gap-2 text-green-600 mt-4 p-3 bg-green-50 rounded-lg">
            <Shield size={18} />
            <span className="font-semibold">Certificado SENASA Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
}