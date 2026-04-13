'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, AlertTriangle, RefreshCw, ChevronRight, ChevronLeft, Search, Building2, Clock, CheckCircle2, X, BarChart, Copy, Printer, Info, Download } from 'lucide-react';
import type { Employee } from '@/lib/nom035/sync-agent';

const PAGE_SIZE = 20;

export default function AdminDashboard() {
  const router = useRouter();
  
  // 1. All State Hooks (at the top)
  const [authorized, setAuthorized] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDIENTE' | 'COMPLETADO'>('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [surveyDetails, setSurveyDetails] = useState<any>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 2. All Memo Hooks
  const companies = useMemo(() => {
    const set = new Set(employees.map(e => e.company));
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return employees.filter(emp => {
      if (companyFilter !== 'all' && emp.company !== companyFilter) return false;
      if (statusFilter !== 'all') {
        const isCompleted = emp.status === 'COMPLETADO';
        if (statusFilter === 'COMPLETADO' && !isCompleted) return false;
        if (statusFilter === 'PENDIENTE' && isCompleted) return false;
      }
      if (riskFilter !== 'all' && emp.riskLevel !== riskFilter) return false;
      if (term) {
        return (
          emp.fullName.toLowerCase().includes(term) ||
          emp.code.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          emp.company.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [employees, searchTerm, companyFilter, statusFilter, riskFilter]);

  const stats = useMemo(() => {
    const total = employees.length;
    const completed = employees.filter(e => e.status === 'COMPLETADO').length;
    const pending = total - completed;
    const critical = employees.filter(e => e.riskLevel === 'Muy Alto' || e.riskLevel === 'Alto').length;
    const medium = employees.filter(e => e.riskLevel === 'Medio').length;
    return { total, completed, pending, critical, medium };
  }, [employees]);

  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);

  // 3. All Effect Hooks
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    if (authorized) {
      fetchEmployees();
    }
  }, [authorized]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, companyFilter, statusFilter, riskFilter]);

  // 4. Auxiliary functions
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setEmployees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/employees', { method: 'POST' });
      await fetchEmployees();
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const openEmployeeDetails = async (emp: Employee) => {
    setSelectedEmployee(emp);
    setSurveyDetails(null);
    if (emp.status === 'COMPLETADO' && emp.id) {
      setLoadingSurvey(true);
      try {
        const response = await fetch(`/api/surveys?employeeId=${emp.id}`);
        const data = await response.json();
        setSurveyDetails(data);
      } catch (error) {
        console.error('Failed to load survey:', error);
      } finally {
        setLoadingSurvey(false);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredEmployees.map(emp => emp.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCopyLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const msg = `🚩 *Aviso de RRHH: NOM-035*\n\nSe les solicita ingresar al portal oficial para completar su evaluación NOM-035 obligatoria.\n\n🌐 Ingresa con tu nombre completo aquí:\n${baseUrl}/login`;
    navigator.clipboard.writeText(msg);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // 5. REDIRECT GUARD (Last thing before the return)
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Gestión NOM-035</h1>
          <p className="text-gray-400 font-medium tracking-wide">Panel de Administración de Cumplimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setPrintMenuOpen(!printMenuOpen)}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl flex items-center gap-3 transition-all border border-white/10 font-bold text-sm"
            >
              <Printer className="w-4 h-4" />
              Masivo
            </button>
            <AnimatePresence>
              {printMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">Opciones de Impresión</div>
                  <button 
                    onClick={() => {
                        if (selectedIds.size > 0) {
                          window.open(`/admin/report/batch?ids=${Array.from(selectedIds).join(',')}`, '_blank');
                        }
                        setPrintMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-sm transition-colors flex items-center justify-between ${selectedIds.size === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-200'}`}
                  >
                    Imprimir Selección ({selectedIds.size})
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                  <button 
                    onClick={() => {
                        window.open(`/admin/report/batch?company=${companyFilter}&status=${statusFilter}`, '_blank');
                        setPrintMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-sm text-gray-200 transition-colors flex items-center justify-between"
                  >
                    Imprimir Filtro Actual
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                  <button 
                    onClick={() => {
                        window.open(`/admin/report/all`, '_blank');
                        setPrintMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-sm text-gray-200 transition-colors flex items-center justify-between"
                  >
                    Imprimir Base Completa
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 font-bold text-sm"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar CONTPAQi
          </button>
        </div>
      </header>

      {/* Alerta de Faltantes */}
      {!loading && stats.pending > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <button 
            onClick={() => setStatusFilter(statusFilter === 'PENDIENTE' ? 'all' : 'PENDIENTE')}
            className={`w-full text-left bg-orange-500/10 border p-5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-orange-500/15 ${statusFilter === 'PENDIENTE' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-orange-500/20'}`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl"><AlertTriangle className="w-5 h-5 text-orange-500" /></div>
              <div>
                <h3 className="text-orange-400 font-black text-sm uppercase tracking-wide">Seguimiento Obligatorio</h3>
                <p className="text-gray-300 text-sm mt-1 font-medium">
                  Hay <strong>{stats.pending} trabajadores</strong> con la encuesta pendiente. Haz clic para {statusFilter === 'PENDIENTE' ? 'ver a todos' : 'filtrar y gestionar'}.
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-orange-500 transition-transform ${statusFilter === 'PENDIENTE' ? 'rotate-90' : ''}`} />
          </button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Plantilla Total', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-white/5' },
          { label: 'Encuestas Listas', value: stats.completed, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-white/5' },
          { label: 'Riesgos Altos', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-white/5' },
          { label: 'Riesgo Medio', value: stats.medium, icon: Info, color: 'text-yellow-400', bg: 'bg-white/5' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all`}
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black mb-1 relative z-10">{stat.value}</p>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider relative z-10">{stat.label}</p>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}>
               <stat.icon className="w-full h-full" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table Section */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Buscar colaborador o código..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder-gray-600"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/30 outline-none cursor-pointer text-gray-300"
                >
                  <option value="all">Todas las empresas</option>
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/30 outline-none cursor-pointer text-gray-300"
                >
                  <option value="all">Cualquier Riesgo</option>
                  <option value="Muy Alto">Muy Alto</option>
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/20 text-[10px] text-gray-500 uppercase tracking-[0.15em] font-black">
                <tr>
                  <th className="px-6 py-5 w-12 text-center">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredEmployees.length} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600" />
                  </th>
                  <th className="px-6 py-5">Colaborador</th>
                  <th className="px-6 py-5">Ubicación</th>
                  <th className="px-6 py-5 text-center">Estatus</th>
                  <th className="px-6 py-5 text-center">Riesgo</th>
                  <th className="px-1 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-white/5 rounded-lg w-full" /></td>
                    </tr>
                  ))
                ) : paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp) => (
                    <tr 
                      key={`${emp.company}-${emp.id}`} 
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => openEmployeeDetails(emp)}
                    >
                      <td className="px-6 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(emp.id)} onChange={() => handleSelectOne(emp.id)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 cursor-pointer" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center font-black text-blue-400 text-sm border border-white/5">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-sm text-gray-100">{emp.fullName}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{emp.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-[10px] font-black text-blue-500 uppercase mb-1">{emp.company}</div>
                        <div className="text-xs text-gray-400 font-medium">{emp.department}</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          emp.status === 'COMPLETADO' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          emp.riskLevel === 'Muy Alto' ? 'text-red-500' :
                          emp.riskLevel === 'Alto' ? 'text-orange-500' :
                          emp.riskLevel === 'Medio' ? 'text-yellow-500' :
                          emp.riskLevel === 'Bajo' ? 'text-blue-500' : 'text-gray-600'
                        }`}>
                          {emp.riskLevel || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sin resultados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-5 border-t border-white/10 bg-white/[0.02]">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Página <span className="text-white">{currentPage}</span> de {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Copy className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Enlace de Evaluación</h3>
            <p className="text-sm text-gray-400 mb-8 font-medium leading-relaxed">Envía el link directo a los colaboradores para que inicien su evaluación digital.</p>
            <button 
              onClick={handleCopyLink}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-900/40 flex justify-center items-center gap-3 transition-all active:scale-95"
            >
              {copiedLink ? <><CheckCircle2 className="w-5 h-5" /> Copiado</> : <><Copy className="w-5 h-5" /> Copiar Link Masivo</>}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-black mb-6 tracking-tight">Reportes de Auditoría</h3>
            <div className="space-y-4">
              <a 
                href="/admin/report/group" 
                target="_blank"
                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Dictamen Grupal</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Global 2026</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all" />
              </a>

              <a 
                href="/api/export"
                download
                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Respuestas Excel</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Layout CONTPAQi</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Side Panel Drawer */}
      <AnimatePresence>
        {selectedEmployee && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
              onClick={() => setSelectedEmployee(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#080808] border-l border-white/10 z-[101] shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors border border-transparent hover:border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-10 text-center md:text-left">
                <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.2em] mb-3">{selectedEmployee.code}</p>
                <h3 className="text-3xl font-black mb-3 tracking-tight">{selectedEmployee.fullName}</h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-400 border border-white/5 uppercase tracking-widest">{selectedEmployee.company}</span>
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-400 border border-white/5 uppercase tracking-widest">{selectedEmployee.department}</span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <BarChart className="w-5 h-5 text-gray-400" />
                    <h3 className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">Diagnóstico Individual</h3>
                  </div>
                  
                  {selectedEmployee.status === 'COMPLETADO' ? (
                    loadingSurvey ? (
                      <div className="flex flex-col items-center py-10 gap-4">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Generando análisis...</p>
                      </div>
                    ) : surveyDetails ? (
                      <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-8">
                          <div className="p-6 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-3xl text-center min-w-[120px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Puntos</p>
                            <p className="text-5xl font-black text-black leading-none tracking-tighter">{surveyDetails.score || '0'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Evaluación Final</p>
                            <p className={`text-2xl font-black leading-tight ${
                              surveyDetails.risk_level === 'Muy Alto' ? 'text-red-500' :
                              surveyDetails.risk_level === 'Alto' ? 'text-orange-500' :
                              surveyDetails.risk_level === 'Medio' ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              Riesgo {surveyDetails.risk_level}
                            </p>
                          </div>
                        </div>

                        <div className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
                          surveyDetails.ats_result === 'REQUIERE_ATENCION' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
                        }`}>
                          <div className="flex items-center gap-4">
                            <AlertTriangle className="w-6 h-6" />
                            <div>
                              <p className="text-[10px] uppercase font-black tracking-widest mb-1">Guía I (Sucesos)</p>
                              <p className="font-black text-sm">
                                {surveyDetails.ats_result === 'REQUIERE_ATENCION' ? 'RIESGO DETECTADO' : 'SIN SUCESOS'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center pt-4">
                           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-6">
                             Aplicado: {new Date(surveyDetails.completed_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                           </p>
                           <button 
                            onClick={() => window.open(`/admin/report/${selectedEmployee.id}`, '_blank')}
                            className="w-full bg-white text-black font-black py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
                          >
                            <Printer className="w-5 h-5" /> Acuse de Recibo PDF
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Error al cargar resultados técnicos</p>
                      </div>
                    )
                  ) : (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] text-center border-dashed">
                      <Clock className="w-12 h-12 text-gray-700 mx-auto mb-6" />
                      <h4 className="text-gray-400 font-black text-sm mb-2 uppercase tracking-widest">Encuesta Pendiente</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mx-auto">El colaborador aún no ha enviado sus respuestas a la plataforma.</p>
                    </div>
                  )}
                  <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-600 opacity-[0.02] rounded-full blur-3xl" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
