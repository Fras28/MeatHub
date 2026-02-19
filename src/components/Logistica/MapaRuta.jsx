import React from 'react';
import { Map, Navigation, Clock, Thermometer, Truck } from 'lucide-react';

export default function MapaRuta({ entregas, pesoTotal }) {
  const pendientes = entregas.filter(e => e.estado !== 'Entregado');

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden min-h-[500px]">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Map className="text-red-400" size={24} /> 
            Hoja de Ruta - Hoy
          </h3>
          <div className="flex gap-3">
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
              {pendientes.length} pendientes
            </span>
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
              {pesoTotal}kg carga
            </span>
          </div>
        </div>

        {/* Mapa simulado con puntos */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="relative h-64 bg-slate-800 rounded-lg overflow-hidden">
            {/* Grid de fondo */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
            
            {/* Ruta lineal simulada */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d="M 10 50 Q 30 20, 50 50 T 90 50" 
                fill="none" 
                stroke="rgba(59, 130, 246, 0.5)" 
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <circle cx="10" cy="50" r="3" fill="#3b82f6" />
              <circle cx="50" cy="50" r="3" fill="#f59e0b" />
              <circle cx="90" cy="50" r="3" fill="#10b981" />
            </svg>
            
            {/* Marcadores */}
            <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <div className="bg-blue-600 p-2 rounded-full shadow-lg animate-pulse">
                <Truck size={16} />
              </div>
              <p className="text-xs mt-1 text-center bg-slate-900/80 px-2 py-0.5 rounded">Depósito</p>
            </div>
            
            <div className="absolute left-[50%] top-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <div className="bg-amber-500 p-2 rounded-full shadow-lg">
                <Navigation size={16} />
              </div>
              <p className="text-xs mt-1 text-center bg-slate-900/80 px-2 py-0.5 rounded">Parada 1</p>
            </div>
            
            <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2 translate-x-1/2">
              <div className="bg-green-500 p-2 rounded-full shadow-lg">
                <Map size={16} />
              </div>
              <p className="text-xs mt-1 text-center bg-slate-900/80 px-2 py-0.5 rounded">Destino</p>
            </div>
          </div>
        </div>

        {/* Lista de paradas */}
        <div className="space-y-3">
          {entregas.map((entrega, idx) => (
            <div key={entrega.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
              entrega.estado === 'Entregado' 
                ? 'bg-green-500/10 border-green-500/30' 
                : entrega.estado === 'En camino'
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-slate-800/50 border-slate-700'
            }`}>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  entrega.estado === 'Entregado' ? 'bg-green-400' :
                  entrega.estado === 'En camino' ? 'bg-blue-400 animate-pulse' :
                  'bg-amber-400'
                }`}></div>
                {idx < entregas.length - 1 && <div className="w-0.5 h-8 bg-white/20 my-1"></div>}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{entrega.cliente}</p>
                    <p className="text-sm text-slate-300 flex items-center gap-1">
                      <Navigation size={12} /> {entrega.direccion}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    entrega.estado === 'Entregado' ? 'bg-green-500/20 text-green-400' :
                    entrega.estado === 'En camino' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {entrega.estado}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado del vehículo */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Truck size={16} className="text-red-400" /> 
              Estado del Vehículo
            </h4>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              En ruta
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs mb-1">Temperatura</p>
              <div className="flex items-center gap-1">
                <Thermometer size={14} className="text-blue-400" />
                <span className="font-bold">2°C</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Humedad</p>
              <p className="font-bold">85%</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Capacidad</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}