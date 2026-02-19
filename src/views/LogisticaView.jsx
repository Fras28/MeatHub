import React, { useState } from 'react';
import { Map, Navigation, Clock } from 'lucide-react';
import MapaRuta from '../components/Logistica/MapaRuta';
import EntregasList from '../components/Logistica/EntregasList';

const ENTREGAS_INICIALES = [
  { 
    id: 1, 
    orden: 'ORD-001', 
    direccion: 'Av. Corrientes 1234, CABA', 
    estado: 'En camino', 
    cliente: 'Carnicería Don José',
    telefono: '11-1234-5678',
    peso: 450
  },
  { 
    id: 2, 
    orden: 'ORD-002', 
    direccion: 'San Martín 567, Rosario', 
    estado: 'Pendiente', 
    cliente: 'Restaurante La Parrilla',
    telefono: '341-987-6543',
    peso: 225
  },
  { 
    id: 3, 
    orden: 'ORD-003', 
    direccion: 'Belgrano 890, Córdoba', 
    estado: 'Entregado', 
    cliente: 'Hotel Plaza Mayor',
    telefono: '351-456-7890',
    peso: 680
  }
];

export default function LogisticaView({ showToast }) {
  const [entregas, setEntregas] = useState(ENTREGAS_INICIALES);

  const confirmarEntrega = (id) => {
    setEntregas(entregas.map(e => 
      e.id === id ? { ...e, estado: 'Entregado' } : e
    ));
    showToast(`Entrega confirmada exitosamente`);
  };

  const entregasPendientes = entregas.filter(e => e.estado !== 'Entregado');
  const pesoTotal = entregasPendientes.reduce((sum, e) => sum + e.peso, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Panel de Logística</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
            <Navigation size={16} className="text-blue-600" />
            <span className="text-slate-600">Distancia total:</span>
            <span className="font-bold text-slate-900">45 km</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
            <Clock size={16} className="text-amber-600" />
            <span className="text-slate-600">Tiempo estimado:</span>
            <span className="font-bold text-slate-900">1h 20m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapaRuta entregas={entregas} pesoTotal={pesoTotal} />
        </div>
        
        <div>
          <EntregasList 
            entregas={entregas}
            onConfirmar={confirmarEntrega}
          />
        </div>
      </div>
    </div>
  );
}