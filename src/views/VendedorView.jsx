import React, { useState } from 'react';
import { Plus, TrendingUp, Box, DollarSign, Clock, Package, ChevronLeft } from 'lucide-react';
import MetricCard from '../components/Common/MetricCard';
import LotesList from '../components/Vendedor/LotesList';
import GaleriaInspeccion from '../components/Vendedor/GaleriaInspeccion';
import NuevaUnidadModal from '../components/Vendedor/NuevaUnidadModal';
import { LOTES_INICIALES, calcularPrecioLote, generateUnidadSKU } from '../data/mockData';

export default function VendedorView({ showToast }) {
  const [lotes, setLotes] = useState(LOTES_INICIALES);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalUnidades = lotes.reduce((sum, l) => sum + l.unidades.length, 0);
  const unidadesDisponibles = lotes.reduce((sum, l) => 
    sum + l.unidades.filter(u => u.estado === 'Disponible').length, 0
  );
  const pesoTotalStock = lotes.reduce((sum, l) => 
    sum + l.unidades.filter(u => u.estado === 'Disponible').reduce((s, u) => s + u.peso, 0), 0
  );

  const metricas = {
    lotesActivos: lotes.filter(l => l.estado === 'Disponible').length,
    totalUnidades,
    unidadesDisponibles,
    pesoStock: pesoTotalStock,
    margen: 125000
  };

  const handleSaveLote = (nuevoLote) => {
    setLotes(prev => [...prev, nuevoLote]);
    showToast(`Lote ${nuevoLote.sku} creado exitosamente`);
  };

  const handleFraccionarUnidad = (loteId, unidadSku) => {
    setLotes(prev => prev.map(lote => {
      if (lote.id !== loteId) return lote;

      const unidad = lote.unidades.find(u => u.sku === unidadSku);
      if (!unidad || unidad.estado !== 'Disponible' || unidad.tipo !== 'Res Entera') {
        return lote;
      }

      // Generar SKUs para las medias reses
      const baseSKU = unidad.sku.replace('-R', '');
      const media1SKU = generateUnidadSKU(baseSKU.split('-').slice(0, 3).join('-'), 99, 'Media Res');
      const media2SKU = generateUnidadSKU(baseSKU.split('-').slice(0, 3).join('-'), 98, 'Media Res');

      const media1 = {
        ...unidad,
        sku: media1SKU,
        id: `${unidad.id}-m1`,
        tipo: 'Media Res',
        peso: Math.round(unidad.peso / 2),
        parent_sku: unidad.sku
      };
      const media2 = {
        ...unidad,
        sku: media2SKU,
        id: `${unidad.id}-m2`,
        tipo: 'Media Res',
        peso: Math.round(unidad.peso / 2),
        parent_sku: unidad.sku
      };

      return {
        ...lote,
        unidades: [
          ...lote.unidades.filter(u => u.sku !== unidadSku),
          media1,
          media2
        ]
      };
    }));
    showToast('Res fraccionada en 2 medias reses');
  };

  const handleActualizarUnidad = (loteId, unidadSku, updates) => {
    setLotes(prev => prev.map(lote => {
      if (lote.id !== loteId) return lote;
      return {
        ...lote,
        unidades: lote.unidades.map(u => 
          u.sku === unidadSku ? { ...u, ...updates } : u
        )
      };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {loteSeleccionado ? (
              <button 
                onClick={() => setLoteSeleccionado(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft size={24} /> Volver a Lotes
              </button>
            ) : (
              'Panel de Control'
            )}
          </h2>
          {loteSeleccionado && (
            <p className="text-slate-500 mt-1 font-mono">
              {loteSeleccionado.sku} • {loteSeleccionado.unidades.length} unidades • 
              {' '}$<span className="font-bold text-red-600">
                {calcularPrecioLote(loteSeleccionado).toLocaleString()}
              </span> por lote completo
            </p>
          )}
        </div>
        
        {!loteSeleccionado && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          >
            <Plus size={18} /> Nuevo Lote
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard title="Lotes Activos" value={metricas.lotesActivos} icon={Package} color="blue" subtitle="En venta" />
        <MetricCard title="Total Unidades" value={metricas.totalUnidades} icon={Box} color="slate" subtitle="En todos los lotes" />
        <MetricCard title="Disponibles" value={metricas.unidadesDisponibles} icon={TrendingUp} color="green" subtitle="Listas para vender" />
        <MetricCard title="Kg en Stock" value={metricas.pesoStock} icon={Box} color="amber" subtitle="Peso total" />
        <MetricCard title="Margen Proy." value={`$${metricas.margen.toLocaleString()}`} icon={DollarSign} color="red" subtitle="+15% vs mes ant." />
      </div>

      {loteSeleccionado ? (
        <GaleriaInspeccion 
          lote={loteSeleccionado}
          onFraccionar={(unidadSku) => handleFraccionarUnidad(loteSeleccionado.id, unidadSku)}
          onActualizarUnidad={(unidadSku, updates) => 
            handleActualizarUnidad(loteSeleccionado.id, unidadSku, updates)
          }
        />
      ) : (
        <LotesList lotes={lotes} onSeleccionar={setLoteSeleccionado} />
      )}

      <NuevaUnidadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLote}
        lotesExistentes={lotes}
      />
    </div>
  );
}