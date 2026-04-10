'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, AlertTriangle, RefreshCw, ChevronRight, ChevronLeft, Search, Building2, Clock, CheckCircle2, X, BarChart, Copy, Printer, Info, Download } from 'lucide-react';
import type { Employee } from '@/lib/nom035/sync-agent';

const PAGE_SIZE = 20;

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDIENTE' | 'COMPLETADO'>('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // States for Drawer
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [surveyDetails, setSurveyDetails] = useState<any>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);

  // States for Print Dropdown & Selection
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Obtener lista de empresas únicas
  const companies = useMemo(() => {
    const set = new Set(employees.map(e => e.company));
    return Array.from(set).sort();
  }, [employees]);

  // Filtrado avanzado
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return employees.filter(emp => {
      // Filtro por empresa
      if (companyFilter !== 'all' && emp.company !== companyFilter) return false;
      
      // Filtro por estatus
      if (statusFilter !== 'all') {
        const isCompleted = emp.status === 'COMPLETADO';
        if (statusFilter === 'COMPLETADO' && !isCompleted) return false;
        if (statusFilter === 'PENDIENTE' && isCompleted) return false;
      }

      // Filtro por nivel de riesgo
      if (riskFilter !== 'all' && emp.riskLevel !== riskFilter) return false;

      // Filtro por búsqueda (nombre, código, departamento)
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

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = new Set(filteredEmployees.map(emp => emp.id));
      setSelectedIds(ids);
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

  // Resetear página al buscar o cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, companyFilter, statusFilter, riskFilter]);

  // Conteo de Pendientes
  const pendingCount = useMemo(() => {
    return employees.filter(emp => emp.status !== 'COMPLETADO').length;
  }, [employees]);

  const criticalRiskCount = useMemo(() => {
    return employees.filter(emp => emp.riskLevel === 'Muy Alto' || emp.riskLevel === 'Alto').length;
  }, [employees]);

  const mediumRiskCount = useMemo(() => {
    return employees.filter(emp => emp.riskLevel === 'Medio').length;
  }, [employees]);

  // Manejo del Enlace Masivo
  const handleCopyLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const msg = `🔔 *Aviso de RRHH: NOM-035*\n\nSe les solicita ingresar al portal oficial para completar su evaluación NOM-035 obligatoria.\n\n🌐 Ingresa con tu código aquí:\n${baseUrl}/login`;
    navigator.clipboard.writeText(msg);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Gestión NOM-035</h1>
          <p className="text-gray-400">Panel de Administración de Cumplimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setPrintMenuOpen(!printMenuOpen)}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl flex items-center gap-2 transition-all border border-white/10"
            >
              <Printer className="w-4 h-4" />
              Opciones de Impresión
            </button>
            {printMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                <a href="/admin/report/all" target="_blank" onClick={() => setPrintMenuOpen(false)} className="block px-4 py-3 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">📄 Imprimir Toda la Base de Datos</a>
                <a href={`/admin/report/batch?company=${companyFilter}&status=${statusFilter}`} target="_blank" onClick={() => setPrintMenuOpen(false)} className="block px-4 py-3 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">📄 Imprimir Filtro Actual ({filteredEmployees.length})</a>
                <a href={`/admin/report/batch?ids=${Array.from(selectedIds).join(',')}`} target="_blank" onClick={(e) => { if (selectedIds.size === 0) e.preventDefault(); setPrintMenuOpen(false); }} className={`block px-4 py-3 rounded-lg text-sm transition-colors ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed text-gray-500' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}>📄 Imprimir Palomeados ({selectedIds.size})</a>
              </div>
            )}
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar con CONTPAQi
          </button>
        </div>
      </header>

      {/* Alerta Interactiva de Faltantes */}
      {!loading && pendingCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => setStatusFilter(statusFilter === 'PENDIENTE' ? 'all' : 'PENDIENTE')}
            className={`w-full text-left bg-orange-500/10 border p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-orange-500/20 ${statusFilter === 'PENDIENTE' ? 'border-orange-500 ring-1 ring-orange-500 shadow-lg shadow-orange-500/10' : 'border-orange-500/20'}`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-500/20 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-500" /></div>
              <div>
                <h3 className="text-orange-400 font-bold text-sm">Alerta de Seguimiento NOM-035</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Hay <strong>{pendingCount} trabajadores</strong> que no han completado la encuesta. Haz clic aquí para {statusFilter === 'PENDIENTE' ? 'limpiar el filtro y mostrar a todos' : 'filtrar y ver quiénes son'}.
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
          { label: 'Empleados Totales', value: employees.length, icon: Users, color: 'text-blue-400' },
          { label: 'Encuestas Listas', value: employees.length - pendingCount, icon: FileText, color: 'text-green-400' },
          { label: 'Riesgo Crítico', value: criticalRiskCount, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Riesgo Medio', value: mediumRiskCount, icon: Info, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">+0%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee List Section */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text"
                  id="search-employees"
                  placeholder="Buscar por nombre, código o departamento..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-600"
                />
              </div>
              {/* Company Filter */}
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  id="filter-company"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer min-w-[180px]"
                >
                  <option value="all">Todas las empresas</option>
                  {companies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {/* Risk Filter */}
              <div className="relative">
                <AlertTriangle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  id="filter-risk"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="all">Cualquier Riesgo</option>
                  <option value="Muy Alto">Riesgo Muy Alto</option>
                  <option value="Alto">Riesgo Alto</option>
                  <option value="Medio">Riesgo Medio</option>
                  <option value="Bajo">Riesgo Bajo</option>
                  <option value="Nulo">Riesgo Nulo</option>
                </select>
              </div>
            </div>
            {/* Results count */}
            <p className="text-xs text-gray-500 mt-2">
              Mostrando {paginatedEmployees.length} de {filteredEmployees.length} empleados
              {searchTerm && ` — búsqueda: "${searchTerm}"`}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/20 text-xs text-gray-400 uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredEmployees.length} className="cursor-pointer" />
                  </th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Departamento</th>
                  <th className="px-6 py-4">Puesto</th>
                  <th className="px-6 py-4">Estatus NOM</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp) => (
                    <tr key={`${emp.company}-${emp.id}`} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedIds.has(emp.id)} onChange={() => handleSelectOne(emp.id)} className="cursor-pointer" />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-400 font-bold">{emp.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{emp.fullName}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{emp.company}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{emp.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-medium">{emp.position}</td>
                      <td className="px-6 py-4">
                       {emp.status === 'COMPLETADO' ? (
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-bold uppercase rounded border border-green-500/20 w-fit">
                              Completado
                            </span>
                            {emp.riskLevel && emp.riskLevel !== 'N/A' && (
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border w-fit ${
                                emp.riskLevel === 'Muy Alto' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                emp.riskLevel === 'Alto' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                emp.riskLevel === 'Medio' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                'bg-blue-500/10 border-blue-500/20 text-blue-500'
                              }`}>
                                {emp.riskLevel}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-md border border-yellow-500/20">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEmployeeDetails(emp)}
                          className="p-2 hover:bg-white/10 rounded-lg group-hover:text-blue-400 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                      {employees.length > 0
                        ? `No se encontraron resultados para "${searchTerm}"`
                        : 'No se encontraron empleados. Inicia una sincronización.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Reports / Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Copy className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold mb-2">Difusión de Encuesta</h3>
            <p className="text-sm text-gray-400 mb-6">Genera un texto pre-armado para enviar a los grupos de WhatsApp de la empresa.</p>
            <div className="space-y-3 relative z-10">
              <button 
                onClick={handleCopyLink}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 transition-all"
              >
                {copiedLink ? <><CheckCircle2 className="w-4 h-4" /> Mensaje Copiado</> : <><Copy className="w-4 h-4" /> Generar Enlace Masivo</>}
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4">Exportar Evidencia</h3>
            <div className="space-y-4">
             <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-3 border-b border-white/5 flex items-center gap-3">
                  <BarChart className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Reportes Ejecutivos</p>
                </div>
                <div className="grid grid-cols-1 divide-y divide-white/5">
                  <a href="/admin/report/group" className="flex items-center justify-between p-3 hover:bg-white/5 transition-all">
                    <span className="text-sm font-bold">General (Consolidado)</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </a>
                  <a href="/admin/report/group?company=LOLA" className="flex items-center justify-between p-3 hover:bg-white/5 transition-all">
                    <span className="text-sm">Lola Berries</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </a>
                  <a href="/admin/report/group?company=BOSBES" className="flex items-center justify-between p-3 hover:bg-white/5 transition-all">
                    <span className="text-sm">Bosbes Berries</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
              </div>

              <a 
                href="/api/export"
                download
                className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group hover:border-green-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Resumen de Respuestas</p>
                    <p className="text-[10px] text-gray-500 uppercase">Layout CONTPAQi Evalúa / Excel</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Side Panel (Drawer) para Empleado */}
      <AnimatePresence>
        {selectedEmployee && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedEmployee(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#080808] border-l border-white/5 z-50 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Detalle de Empleado</h2>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Employee Info */}
              <div className="mb-8 bg-white/5 border border-white/10 p-5 rounded-xl">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">{selectedEmployee.code}</p>
                <h3 className="text-lg font-bold mb-1">{selectedEmployee.fullName}</h3>
                <p className="text-sm text-gray-400">{selectedEmployee.department} — {selectedEmployee.position}</p>
                <div className="mt-4 inline-block px-2 py-1 bg-white/10 rounded border border-white/5 text-xs font-mono text-gray-300">
                  {selectedEmployee.company}
                </div>
              </div>

              {/* Survey Info */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                  <BarChart className="w-4 h-4" /> Resultados NOM-035
                </h3>
                
                {selectedEmployee.status === 'COMPLETADO' ? (
                  loadingSurvey ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-28 bg-white/5 rounded-xl w-full" />
                      <div className="h-20 bg-white/5 rounded-xl w-full" />
                    </div>
                  ) : surveyDetails ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/20 p-5 rounded-xl text-center shadow-lg shadow-blue-500/5">
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Puntuación Total</p>
                        <p className="text-6xl font-black text-white">{surveyDetails.score ?? 'N/A'}</p>
                      </div>

                      <div className={`border p-5 rounded-xl flex justify-between items-center ${
                        surveyDetails.risk_level === 'Muy Alto' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                        surveyDetails.risk_level === 'Alto' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                        surveyDetails.risk_level === 'Medio' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                        surveyDetails.risk_level === 'Bajo' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-500'
                      }`}>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Nivel de Riesgo</p>
                          <p className="font-bold text-xl">{surveyDetails.risk_level}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 opacity-50" />
                      </div>

                      {/* Guía I - ATS Status */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${
                        surveyDetails.ats_result === 'REQUIERE_ATENCION' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">Guía I (ATS)</p>
                          <p className="font-bold text-sm">
                            {surveyDetails.ats_result === 'REQUIERE_ATENCION' ? '🚨 REQUIERE ATENCIÓN CLÍNICA' : '✅ SIN EVENTOS TRAUMÁTICOS'}
                          </p>
                        </div>
                        <Info className="w-5 h-5 opacity-40" />
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center mt-6">
                        Completado el {new Date(surveyDetails.completed_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </p>

                      <a 
                        href={`/admin/report/${selectedEmployee.id}`}
                        target="_blank"
                        className="mt-6 w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      >
                        <Printer className="w-5 h-5" /> Imprimir Acuse Oficial
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm border border-red-500/20 p-4 text-red-400 bg-red-500/10 rounded-xl">Error cargando resultados. Intente más tarde.</p>
                  )
                ) : (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-xl text-center">
                    <Clock className="w-10 h-10 text-yellow-500/50 mx-auto mb-4" />
                    <h4 className="text-yellow-400 font-bold text-sm mb-2">Evaluación Pendiente</h4>
                    <p className="text-xs text-gray-400">El trabajador no ha completado su encuesta de riesgo psicosocial (Guía III) en la plataforma.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
