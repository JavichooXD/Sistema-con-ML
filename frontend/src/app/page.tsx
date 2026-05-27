'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, PlusCircle, AlertCircle, CheckCircle, 
  Clock, ArrowRight, ShieldAlert, Bell, User, 
  Mail, Building, Check, RefreshCw, BarChart3, 
  Search, X, CheckCircle2, HelpCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000/api';

interface Area {
  id: number;
  name: string;
  description?: string;
}

interface Document {
  id: string;
  subject: string;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  status: string;
  mlPriority: string;
  areaId: number;
  area: Area;
  createdAt: string;
}

interface Notification {
  id: number;
  documentId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  statusCounts: {
    PENDIENTE: number;
    EN_PROCESO: number;
    RESUELTO: number;
    RECHAZADO: number;
  };
  priorityCounts: {
    Alta: number;
    Media: number;
    Baja: number;
  };
  areaStats: Array<{
    areaName: string;
    count: number;
  }>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'citizen' | 'admin'>('citizen');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [citizenId, setCitizenId] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [subject, setSubject] = useState('');
  
  // Registration success modal/feedback state
  const [registeredDoc, setRegisteredDoc] = useState<Document | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchNotificationsOnly();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getDocuments(),
        getStats(),
        getNotifications()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error('Error loading documents', e);
    }
  };

  const getStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error loading stats', e);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Error loading notifications', e);
    }
  };

  const fetchNotificationsOnly = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      // fail silently
    }
  };

  const handleRegisterDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId || !citizenName || !citizenEmail || !subject) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          citizenId,
          citizenName,
          citizenEmail,
          subject
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRegisteredDoc(data.document);
        setShowSuccessModal(true);
        
        setCitizenId('');
        setCitizenName('');
        setCitizenEmail('');
        setSubject('');
        
        fetchDashboardData();
      } else {
        alert('Ocurrió un error al registrar el trámite.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read`, { method: 'POST' });
      getNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter documents by search query
  const filteredDocs = documents.filter(doc => 
    doc.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.citizenId.includes(searchQuery) ||
    doc.area?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-rose-500/20 text-rose-450 border border-rose-500/30';
      case 'Media':
        return 'bg-amber-500/20 text-amber-450 border border-amber-500/30';
      case 'Baja':
        return 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-slate-800 text-slate-350 border border-slate-700';
      case 'EN_PROCESO':
        return 'bg-sky-500/15 text-sky-400 border border-sky-500/25';
      case 'RESUELTO':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';
      case 'RECHAZADO':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/25';
      default:
        return 'bg-slate-750 text-slate-350';
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-violet-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between py-3 sm:py-0 gap-3 sm:gap-0">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SIGED-ML
              </h1>
              <p className="text-[10px] text-slate-500">Mesa de Partes Automatizada</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-medium rounded-md transition-all ${
                activeTab === 'citizen'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Registrar Trámite</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-medium rounded-md transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Bandeja de Gestión</span>
            </button>
          </nav>

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 transition text-slate-450 hover:text-slate-200"
              title="Refrescar Datos"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
            <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-900/80 px-2.5 py-1 rounded-lg">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400">En Línea</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* CITIZEN PORTAL (SUBMISSION FORM) */}
        {activeTab === 'citizen' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Registration Form Card */}
            <div className="lg:col-span-2 bg-slate-900/30 backdrop-blur-md rounded-xl p-6 md:p-8 border border-slate-900 shadow-xl">
              <h2 className="text-xl font-bold mb-1">Nueva Solicitud Municipal</h2>
              <p className="text-slate-500 text-xs mb-6">
                Nuestro motor de IA derivará y priorizará tu trámite automáticamente al registrarlo.
              </p>

              <form onSubmit={handleRegisterDocument} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                      DNI del Ciudadano
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={citizenId}
                        onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="DNI de 8 dígitos"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs placeholder:text-slate-650"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="Ej. Juan Pérez Alva"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs placeholder:text-slate-650"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      placeholder="Ej. juan.perez@email.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs placeholder:text-slate-650"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Asunto o Detalle de la Solicitud
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Escribe de forma detallada tu solicitud..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs placeholder:text-slate-650"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1">
                    <HelpCircle className="h-3 w-3 text-indigo-500 shrink-0" />
                    <span>La IA detectará palabras clave de urgencia (ej. colapso, peligro, cables, regado, cobro duplicado) para clasificar tu caso.</span>
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Clasificando con IA...</span>
                      </>
                    ) : (
                      <>
                        <span>Registrar Trámite</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Informational sidebar */}
            <div className="space-y-4">
              {/* Short explanation card */}
              <div className="bg-indigo-955/10 rounded-xl p-5 border border-indigo-900/20">
                <div className="h-8 w-8 bg-indigo-500/10 rounded-md flex items-center justify-center mb-3">
                  <ShieldAlert className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">Clasificación Automática</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evitamos colas y demoras derivando el expediente al área correspondiente mediante nuestro motor NLP de forma automática y transparente.
                </p>
              </div>

              {/* Quick Area Directory card */}
              <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-900">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-3 flex items-center space-x-1.5">
                  <Building className="h-4 w-4 text-slate-500" />
                  <span>Áreas de Derivación</span>
                </h3>
                <div className="space-y-2.5 text-[11px] text-slate-400">
                  <div>
                    <strong className="text-slate-300 block">Desarrollo Urbano</strong>
                    Obras, pistas rotas y licencias de construcción.
                  </div>
                  <div>
                    <strong className="text-slate-300 block">Licencias y Fiscalización</strong>
                    Locales comerciales, ruidos molestos e higiene.
                  </div>
                  <div>
                    <strong className="text-slate-300 block">Defensa Civil</strong>
                    Inspecciones de seguridad, riesgos estructurales y peligros eléctricos.
                  </div>
                  <div>
                    <strong className="text-slate-300 block">Medio Ambiente & Rentas</strong>
                    Áreas verdes, residuos y recaudación tributaria.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMINISTRATIVE/CLERK DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Documents */}
              <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Expedientes</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.total ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
              </div>

              {/* Pending */}
              <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pendientes</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.statusCounts?.PENDIENTE ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              {/* High Priority (AI) */}
              <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-rose-500 uppercase tracking-wider font-bold">Prioridad Alta</p>
                  <h3 className="text-2xl font-bold mt-1 text-rose-455">{stats?.priorityCounts?.Alta ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-rose-455" />
                </div>
              </div>

              {/* Resolved */}
              <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Resueltos</p>
                  <h3 className="text-2xl font-bold mt-1 text-emerald-450">{stats?.statusCounts?.RESUELTO ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-450" />
                </div>
              </div>

            </div>

            {/* Central Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Documents List & Search Table */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* Search Bar & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/20 p-4 rounded-xl border border-slate-900">
                  <div>
                    <h3 className="font-bold text-sm">Bandeja de Expedientes</h3>
                    <p className="text-[10px] text-slate-500">Listado de solicitudes ordenadas por nivel de criticidad asignado por IA</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar DNI, asunto..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Main Documents view: Table for Desktop & Cards for Mobile */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="bg-slate-900/10 border border-slate-900 rounded-xl py-16 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                      <span className="text-slate-450 text-xs">Cargando base de datos Supabase...</span>
                    </div>
                  ) : filteredDocs.length === 0 ? (
                    <div className="bg-slate-900/10 border border-slate-900 rounded-xl py-16 flex flex-col items-center justify-center text-center px-4">
                      <FileText className="h-8 w-8 text-slate-700 mb-2" />
                      <p className="text-slate-500 text-xs">No se encontraron expedientes en el sistema.</p>
                    </div>
                  ) : (
                    <>
                      {/* DESKTOP VIEW (TABLE) */}
                      <div className="hidden md:block bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase font-bold tracking-wider bg-slate-950/20">
                              <th className="py-3.5 px-4 w-28">Código / Fecha</th>
                              <th className="py-3.5 px-4 w-44">Solicitante</th>
                              <th className="py-3.5 px-4">Detalle Asunto</th>
                              <th className="py-3.5 px-4 w-40">Área Sugerida (NLP)</th>
                              <th className="py-3.5 px-4 w-24 text-center">Prioridad IA</th>
                              <th className="py-3.5 px-4 w-28 text-center">Estado</th>
                              <th className="py-3.5 px-4 w-24 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900 text-[11px]">
                            {filteredDocs.map((doc) => (
                              <tr key={doc.id} className="hover:bg-slate-900/20 transition-all">
                                {/* Code */}
                                <td className="py-3 px-4">
                                  <div className="font-mono text-indigo-400 font-bold">#{doc.id.substring(0, 8)}</div>
                                  <div className="text-[9px] text-slate-650 mt-0.5">
                                    {new Date(doc.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                                  </div>
                                </td>

                                {/* Citizen name */}
                                <td className="py-3 px-4 truncate">
                                  <div className="font-semibold text-slate-350">{doc.citizenName}</div>
                                  <div className="text-[9px] text-slate-500">DNI: {doc.citizenId}</div>
                                </td>

                                {/* Subject */}
                                <td className="py-3 px-4">
                                  <p className="text-slate-400 truncate" title={doc.subject}>
                                    {doc.subject}
                                  </p>
                                </td>

                                {/* Area */}
                                <td className="py-3 px-4 truncate">
                                  <div className="flex items-center space-x-1.5">
                                    <Building className="h-3 w-3 text-indigo-400 shrink-0" />
                                    <span className="text-slate-300 font-medium">{doc.area?.name}</span>
                                  </div>
                                </td>

                                {/* Priority */}
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block ${getPriorityBadgeColor(doc.mlPriority)}`}>
                                    {doc.mlPriority}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-block ${getStatusBadgeColor(doc.status)}`}>
                                    {doc.status}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end">
                                    {doc.status === 'PENDIENTE' ? (
                                      <button
                                        onClick={() => handleUpdateStatus(doc.id, 'EN_PROCESO')}
                                        className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-sky-400 font-semibold rounded transition-all cursor-pointer text-[10px]"
                                      >
                                        Procesar
                                      </button>
                                    ) : doc.status === 'EN_PROCESO' ? (
                                      <div className="flex space-x-1">
                                        <button
                                          onClick={() => handleUpdateStatus(doc.id, 'RESUELTO')}
                                          className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded transition-all cursor-pointer"
                                          title="Aprobar / Resolver"
                                        >
                                          <Check className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(doc.id, 'RECHAZADO')}
                                          className="p-1 bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500 hover:text-white rounded transition-all cursor-pointer"
                                          title="Rechazar"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-700">-</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* MOBILE VIEW (CARDS LIST) */}
                      <div className="block md:hidden space-y-3">
                        {filteredDocs.map((doc) => (
                          <div key={doc.id} className="bg-slate-900/20 p-4 rounded-xl border border-slate-900 space-y-3 shadow-md">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-indigo-400 font-bold">#{doc.id.substring(0, 8)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block uppercase ${getStatusBadgeColor(doc.status)}`}>
                                {doc.status}
                              </span>
                            </div>

                            {/* Citizen / Subject */}
                            <div>
                              <div className="font-bold text-slate-350 text-[11px]">{doc.citizenName}</div>
                              <div className="text-[9px] text-slate-500">DNI: {doc.citizenId}</div>
                              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-950">
                                {doc.subject}
                              </p>
                            </div>

                            {/* Classification Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-900/60 text-[10px]">
                              <div className="flex items-center space-x-1 shrink-0 max-w-[60%]">
                                <Building className="h-3 w-3 text-indigo-400 shrink-0" />
                                <span className="text-slate-300 font-semibold truncate">{doc.area?.name}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${getPriorityBadgeColor(doc.mlPriority)}`}>
                                  IA: {doc.mlPriority}
                                </span>
                              </div>
                            </div>

                            {/* Actions inside Mobile Card */}
                            <div className="flex justify-end pt-1">
                              {doc.status === 'PENDIENTE' ? (
                                <button
                                  onClick={() => handleUpdateStatus(doc.id, 'EN_PROCESO')}
                                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition-all cursor-pointer"
                                >
                                  Empezar a Procesar
                                </button>
                              ) : doc.status === 'EN_PROCESO' ? (
                                <div className="grid grid-cols-2 gap-2 w-full">
                                  <button
                                    onClick={() => handleUpdateStatus(doc.id, 'RESUELTO')}
                                    className="py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-400 font-bold rounded-lg text-xs transition-all cursor-pointer"
                                  >
                                    Resolver
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(doc.id, 'RECHAZADO')}
                                    className="py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-450 font-bold rounded-lg text-xs transition-all cursor-pointer"
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

              </div>

              {/* ALERTS AND NOTIFICATIONS SIDEBAR */}
              <div className="space-y-5">
                
                {/* Header Alerts */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Bell className="h-4 w-4 text-indigo-400" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Canal de Alertas</h4>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white font-bold text-[8px] rounded-full">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleMarkNotificationsRead}
                    disabled={unreadNotificationsCount === 0}
                    className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-400 disabled:text-slate-650 font-semibold rounded-lg text-[9px] uppercase tracking-wider transition-all mb-3 cursor-pointer"
                  >
                    Marcar leídos
                  </button>

                  {/* Notifications list */}
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-600">
                        Sin notificaciones.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-3 rounded-lg border text-[10px] leading-relaxed transition-all ${
                            notif.read 
                              ? 'bg-slate-955/10 border-slate-950/40 text-slate-550' 
                              : 'bg-indigo-950/10 border-indigo-900/20 text-slate-350'
                          }`}
                        >
                          <p>{notif.message}</p>
                          <span className="text-[8px] text-slate-600 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Distribution by Area Summary */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">
                    Demanda por Área
                  </h4>
                  <div className="space-y-3.5">
                    {stats?.areaStats.map((area, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 truncate pr-1">{area.areaName}</span>
                          <span className="font-bold text-slate-300">{area.count}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                            style={{ 
                              width: stats.total > 0 
                                ? `${(area.count / stats.total) * 100}%` 
                                : '0%' 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!stats || stats.areaStats.length === 0) && (
                      <div className="text-center py-4 text-xs text-slate-700">
                        Cargando métricas...
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* SUCCESS MODAL FOR DOCUMENT REGISTRATION */}
      {showSuccessModal && registeredDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-850 p-6 rounded-xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5.5 w-5.5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">¡Trámite Registrado!</h3>
                  <p className="text-[10px] text-slate-500">Expediente subido a Supabase Cloud</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* AI Classification Highlight Card */}
            <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-lg space-y-3.5">
              <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-900">
                <span className="text-slate-500 font-mono">ID Expediente:</span>
                <span className="font-mono text-indigo-400 font-bold">#{registeredDoc.id.substring(0, 8)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Derivación IA</span>
                  <div className="flex items-center space-x-1">
                    <Building className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-350 truncate">{registeredDoc.area?.name}</span>
                  </div>
                </div>
                
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Prioridad IA</span>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase inline-block ${getPriorityBadgeColor(registeredDoc.mlPriority)}`}>
                      {registeredDoc.mlPriority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab('admin');
                }}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
              >
                Ver en Bandeja
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-350 font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
