import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Camera, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Package, Plus, Trash2, Tag } from 'lucide-react';
import { FRIGORIFICOS, generateLoteSKU, generateUnidadSKU } from '../../data/mockData';
import { CLOUDINARY_CONFIG, validateConfig } from '@/config/cloudinary';

export default function NuevaUnidadModal({ isOpen, onClose, onSave, lotesExistentes = [] }) {
  const [loteData, setLoteData] = useState({
    frigorifico: 'FR001',
    dias_maduracion: 21,
    fecha_faena: new Date().toISOString().split('T')[0]
  });

  const [unidades, setUnidades] = useState([
    { id: 1, tipo: 'Res Entera', peso: '', precio_base: '', grasa_calidad: 1, imagenes: [] }
  ]);
  
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [unidadConCamara, setUnidadConCamara] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Generar SKU preview para el lote
  const loteSKUPreview = useMemo(() => {
    return generateLoteSKU(lotesExistentes.length);
  }, [lotesExistentes.length, isOpen]);

  // Generar SKU preview para cada unidad
  const unidadesConSKU = useMemo(() => {
    return unidades.map((u, idx) => ({
      ...u,
      skuPreview: generateUnidadSKU(loteSKUPreview, idx, u.tipo)
    }));
  }, [unidades, loteSKUPreview]);

  useEffect(() => {
    if (isOpen && !validateConfig()) {
      setConfigError(true);
    } else {
      setConfigError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!window.cloudinary && !document.getElementById('cloudinary-script')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-script';
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setUnidadConCamara(null);
  };

  const agregarUnidad = () => {
    setUnidades([...unidades, {
      id: Date.now(),
      tipo: 'Res Entera',
      peso: '',
      precio_base: '',
      grasa_calidad: 1,
      imagenes: []
    }]);
  };

  const eliminarUnidad = (id) => {
    if (unidades.length === 1) {
      alert('Debe haber al menos una unidad en el lote');
      return;
    }
    setUnidades(unidades.filter(u => u.id !== id));
  };

  const actualizarUnidad = (id, campo, valor) => {
    setUnidades(unidades.map(u => 
      u.id === id ? { ...u, [campo]: valor } : u
    ));
  };

  const uploadToCloudinary = async (file) => {
    if (!validateConfig()) throw new Error('Configuración incompleta');

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    data.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

    const response = await fetch(
      `${CLOUDINARY_CONFIG.apiUrl}/image/upload`,
      { method: 'POST', body: data }
    );
    
    const result = await response.json();
    return result.secure_url;
  };

  const handleFileSelect = async (e, unidadId) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadToCloudinary(f)));
      setUnidades(unidades.map(u => 
        u.id === unidadId 
          ? { ...u, imagenes: [...u.imagenes, ...urls.map(url => ({ url, tipo: 'archivo' }))] }
          : u
      ));
    } catch (error) {
      alert('Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = (unidadId) => {
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment', width: 1920, height: 1080 }
    }).then(stream => {
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setUnidadConCamara(unidadId);
    }).catch(() => alert('No se pudo acceder a la cámara'));
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !unidadConCamara) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        setUnidades(unidades.map(u => 
          u.id === unidadConCamara 
            ? { ...u, imagenes: [...u.imagenes, { url, tipo: 'camara' }] }
            : u
        ));
        stopCamera();
      } catch (error) {
        alert('Error al subir foto');
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const eliminarImagen = (unidadId, index) => {
    setUnidades(unidades.map(u => 
      u.id === unidadId 
        ? { ...u, imagenes: u.imagenes.filter((_, i) => i !== index) }
        : u
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const unidadesInvalidas = unidades.filter(u => !u.peso || !u.precio_base || u.imagenes.length === 0);
    if (unidadesInvalidas.length > 0) {
      alert('Todas las unidades deben tener peso, precio y al menos una imagen');
      return;
    }

    const nuevoLote = {
      sku: loteSKUPreview,
      id: `lote-${Date.now()}`,
      ...loteData,
      estado: 'Disponible',
      imagen: unidades[0].imagenes[0].url,
      unidades: unidades.map((u, idx) => ({
        sku: generateUnidadSKU(loteSKUPreview, idx, u.tipo),
        id: `res-${Date.now()}-${idx}`,
        tipo: u.tipo,
        peso: parseInt(u.peso),
        precio_base: parseInt(u.precio_base),
        precio_ajustado: parseInt(u.precio_base),
        grasa_calidad: u.grasa_calidad,
        estado: 'Disponible',
        imagen: u.imagenes[0].url,
        imagenes_adicionales: u.imagenes.map(img => img.url),
        parent_sku: null
      }))
    };

    onSave(nuevoLote);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setLoteData({
      frigorifico: 'FR001',
      dias_maduracion: 21,
      fecha_faena: new Date().toISOString().split('T')[0]
    });
    setUnidades([{ id: 1, tipo: 'Res Entera', peso: '', precio_base: '', grasa_calidad: 1, imagenes: [] }]);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="text-red-600" size={28} />
              Nuevo Lote de Ganado
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Los SKU se generarán automáticamente al guardar
            </p>
          </div>
          <button onClick={() => { resetForm(); onClose(); }} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {configError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Configuración incompleta</p>
              <p className="text-sm text-red-700">
                Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SKU del Lote - Preview */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <div className="flex items-center gap-3">
              <Tag className="text-red-600" size={24} />
              <div>
                <p className="text-xs text-red-600 font-medium uppercase tracking-wide">SKU del Lote (Auto-generado)</p>
                <p className="text-2xl font-bold font-mono text-red-900">{loteSKUPreview}</p>
              </div>
            </div>
          </div>

          {/* Datos del Lote */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Información del Lote</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frigorífico</label>
                <select 
                  value={loteData.frigorifico}
                  onChange={(e) => setLoteData({...loteData, frigorifico: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  {FRIGORIFICOS.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Faena</label>
                <input 
                  type="date"
                  value={loteData.fecha_faena}
                  onChange={(e) => setLoteData({...loteData, fecha_faena: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Días de Maduración</label>
                <input 
                  type="number"
                  value={loteData.dias_maduracion}
                  onChange={(e) => setLoteData({...loteData, dias_maduracion: parseInt(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Unidades */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Unidades del Lote ({unidades.length})</h3>
              <button
                type="button"
                onClick={agregarUnidad}
                className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-700"
              >
                <Plus size={16} /> Agregar Unidad
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {unidadesConSKU.map((unidad, idx) => (
                <div key={unidad.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  {/* SKU de la unidad */}
                  <div className="bg-slate-100 p-2 rounded-lg mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-slate-500" />
                    <span className="text-sm font-mono font-medium text-slate-700">{unidad.skuPreview}</span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-900">Unidad #{idx + 1}</h4>
                    <button
                      type="button"
                      onClick={() => eliminarUnidad(unidad.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-slate-500">Tipo</label>
                      <select
                        value={unidad.tipo}
                        onChange={(e) => actualizarUnidad(unidad.id, 'tipo', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                      >
                        <option>Res Entera</option>
                        <option>Media Res</option>
                        <option>Cuarto Delantero</option>
                        <option>Cuarto Trasero</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Grasa/Calidad</label>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => actualizarUnidad(unidad.id, 'grasa_calidad', g)}
                            className={`flex-1 py-1.5 text-xs rounded-lg border ${
                              unidad.grasa_calidad === g 
                                ? 'bg-red-600 text-white border-red-600' 
                                : 'border-slate-200 hover:border-red-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Peso (kg) *</label>
                      <input
                        type="number"
                        required
                        value={unidad.peso}
                        onChange={(e) => actualizarUnidad(unidad.id, 'peso', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="450"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Precio/kg ($) *</label>
                      <input
                        type="number"
                        required
                        value={unidad.precio_base}
                        onChange={(e) => actualizarUnidad(unidad.id, 'precio_base', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="4500"
                      />
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Fotos de inspección *</label>
                    
                    {unidad.imagenes.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {unidad.imagenes.map((img, i) => (
                          <div key={i} className="relative aspect-square">
                            <img src={img.url} className="w-full h-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => eliminarImagen(unidad.id, i)}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs hover:border-red-500 flex items-center justify-center gap-1"
                      >
                        <Upload size={14} /> Subir
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e, unidad.id)}
                        className="hidden"
                      />
                      
                      <button
                        type="button"
                        onClick={() => cameraActive && unidadConCamara === unidad.id ? stopCamera() : startCamera(unidad.id)}
                        disabled={uploading}
                        className={`flex-1 py-2 border-2 border-dashed rounded-lg text-xs flex items-center justify-center gap-1 ${
                          cameraActive && unidadConCamara === unidad.id
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-slate-300 hover:border-red-500'
                        }`}
                      >
                        <Camera size={14} /> {cameraActive && unidadConCamara === unidad.id ? 'Detener' : 'Cámara'}
                      </button>
                    </div>

                    {cameraActive && unidadConCamara === unidad.id && (
                      <div className="relative bg-black rounded-lg overflow-hidden mt-2">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-40 object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-1 rounded-full text-sm font-bold"
                        >
                          📸 Capturar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || configError}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Crear Lote {loteSKUPreview}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}