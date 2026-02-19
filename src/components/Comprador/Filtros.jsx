import React from 'react';
import { Filter } from 'lucide-react';
import { FRIGORIFICOS } from '../../data/mockData';

export default function Filtros({ filtros, setFiltros }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Filter size={20} className="text-red-600" />
        <h3 className="font-bold">Filtros Avanzados</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Frigorífico</label>
          <select 
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            value={filtros.frigorifico}
            onChange={(e) => setFiltros({...filtros, frigorifico: e.target.value})}
          >
            <option value="">Todos</option>
            {FRIGORIFICOS.map(f => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
          <select 
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            value={filtros.tipo}
            onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
          >
            <option value="">Todos</option>
            <option>Res Entera</option>
            <option>Media Res</option>
            <option>Cuarto Delantero</option>
            <option>Cuarto Trasero</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Días Maduración (min)</label>
          <input 
            type="number" 
            placeholder="14"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            value={filtros.diasMaduracion}
            onChange={(e) => setFiltros({...filtros, diasMaduracion: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Peso Mín (kg)</label>
          <input 
            type="number" 
            placeholder="100"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            value={filtros.pesoMin}
            onChange={(e) => setFiltros({...filtros, pesoMin: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Peso Máx (kg)</label>
          <input 
            type="number" 
            placeholder="500"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            value={filtros.pesoMax}
            onChange={(e) => setFiltros({...filtros, pesoMax: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
}