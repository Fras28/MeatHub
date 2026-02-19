import React, { useState } from 'react';
import { Beef } from 'lucide-react';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Toast from './components/Layout/Toast';
import VendedorView from './views/VendedorView';
import CompradorView from './views/CompradorView';
import LogisticaView from './views/LogisticaView';

export default function App() {
  const [activeTab, setActiveTab] = useState('comprador');
  const [toast, setToast] = useState(null);
  const [carrito, setCarrito] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header carritoCount={carrito.length} />
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'vendedor' && (
          <VendedorView showToast={showToast} />
        )}
        
        {activeTab === 'comprador' && (
          <CompradorView 
            showToast={showToast} 
            carrito={carrito} 
            setCarrito={setCarrito} 
          />
        )}
        
        {activeTab === 'logistica' && (
          <LogisticaView showToast={showToast} />
        )}
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}