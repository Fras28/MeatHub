import React from 'react';
import { Package, ShoppingCart, Truck } from 'lucide-react';

const NavButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
      activeTab === id 
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex gap-2">
          <NavButton id="vendedor" label="Panel Vendedor" icon={Package} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="comprador" label="Comprar" icon={ShoppingCart} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="logistica" label="Logística" icon={Truck} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </div>
    </div>
  );
}