'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, AlertTriangle, RefreshCw, ChevronRight, ChevronLeft, Search, Building2, Clock, CheckCircle2, X, BarChart, Copy, Printer, Info, Download } from 'lucide-react';
import type { Employee } from '@/lib/nom035/sync-agent';

const PAGE_SIZE = 20;

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

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

  // REDIRECT CHECK (After hooks to comply with Rules of Hooks)
  if (!authorized) return null;

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
        const res = await fetch(`/api/employees/survey?id=${emp.id}`);
        const data = await res.json();
        setSurveyDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSurvey(false);
      }
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredEmployees.map(emp => emp.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompany = companyFilter === 'all' || emp.company === companyFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'COMPLETADO') matchesStatus = emp.status === 'COMPLETADO';
      if (statusFilter === 'PENDIENTE') matchesStatus = emp.status === 'PENDIENTE';

      let matchesRisk = true;
      if (riskFilter !== 'all') matchesRisk = emp.riskLevel === riskFilter;

      return matchesSearch && matchesCompany && matchesStatus && matchesRisk;
    });
  }, [employees, searchTerm, companyFilter, statusFilter, riskFilter]);

  const stats = useMemo(() => {
    const total = filteredEmployees.length;
    const completed = filteredEmployees.filter(e => e.status === 'COMPLETADO').length;
    const highRisk = filteredEmployees.filter(e => e.riskLevel === 'Alto' || e.riskLevel === 'Muy Alto').length;
    const withATS = filteredEmployees.filter(e => e.atsResult === 'REQUIERE VALORACIÓN').length;
    return { total, completed, highRisk, withATS };
  }, [filteredEmployees]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);

  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/login`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const companies = Array.from(new Set(employees.map(emp => emp.company)));

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar HistÃ³rico (Placeholder para navegaciÃ³n futura) */}
      <div className="w-20 bg-[#0f172a] hidden md:flex flex-col items-center py-8 gap-8 border-r border-white/10">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Building2 className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col gap-6 mt-8">
          <div className="p-3 bg-white/5 rounded-xl text-blue-400 cursor-pointer">
            <Users className="w-6 h-6" />
          </div>
          <div className="p-3 hover:bg-white/5 rounded-xl text-gray-400 cursor-pointer transition-colors">
            <BarChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-auto">
        {/* Header Superior */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Panel de Control NOM-035</h1>
            <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" /> LOLA BERRIES & BOSBES BERRIES
            </p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Actualizar de CONTPAQi'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setPrintMenuOpen(!printMenuOpen)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95"
              >
                <Printer className="w-4 h-4" /> Masivo
              </button>
              
              <AnimatePresence>
                {printMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2"
                  >
                    <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase letter spacing-widest">Opciones de ImpresiÃ³n</div>
                    <button 
                      onClick={() => {
                        window.open(`/admin/report/batch?ids=${Array.from(selectedIds).join(',')}`, '_blank');
                        setPrintMenuOpen(false);
                      }}
                      disabled={selectedIds.size === 0}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-between"
                    >
                      Imprimir Selección ({selectedIds.size})
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </button>
                    <button 
                      onClick={() => {
                        window.open(`/admin/report/batch?complete=true&company=${companyFilter}`, '_blank');
                        setPrintMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-between"
                    >
                      Todo lo Completado
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Plantilla Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Encuestas Listas', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Riesgos Altos/Muy Altos', value: stats.highRisk, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Casos ATS Detectados', value: stats.withATS, icon: Info, color: 'text-red-600', bg: 'bg-red-50' }
            ].map((stat) => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={stat.label} 
                className={`${stat.bg} p-6 rounded-3xl border border-white flex items-center gap-5 shadow-sm hover:shadow-md transition-all`}
              >
                <div className={`p-4 bg-white rounded-2xl ${stat.color} shadow-sm`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filtros Premium */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o cód. empleado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
              <div className="flex gap-4">
                <select 
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="all">Todas las Empresas</option>
                  {companies.map(c => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="COMPLETADO">Completados</option>
                  <option value="PENDIENTE">Pendientes</option>
                </select>
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="all">Cualquier Riesgo</option>
                  <option value="Muy Alto">Muy Alto</option>
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Nulo">Nulo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Empleados */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estatus</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Riesgo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ATS (Guía I)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                          <p className="text-gray-400 font-bold text-sm tracking-tight">Cargando nómina...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold">No se encontraron empleados con los filtros actuales.</td>
                    </tr>
                  ) : paginatedEmployees.map((emp) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={emp.id} 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => openEmployeeDetails(emp)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(emp.id)}
                          onChange={() => toggleSelectOne(emp.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 text-sm">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 leading-tight">{emp.fullName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{emp.code}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="text-[10px] font-bold text-blue-500/70">{emp.company}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          emp.status === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold ${
                          emp.riskLevel === 'Muy Alto' ? 'text-red-600' : 
                          emp.riskLevel === 'Alto' ? 'text-orange-600' : 
                          emp.riskLevel === 'Medio' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {emp.riskLevel || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {emp.atsResult === 'REQUIERE VALORACIÓN' ? (
                          <span className="text-red-500 text-[10px] font-black">REQUIERE ATENCIÓN</span>
                        ) : emp.status === 'COMPLETADO' ? (
                          <span className="text-green-500 text-[10px] font-bold">SIN EVENTOS</span>
                        ) : <span className="text-gray-300 text-[10px]">PENDIENTE</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-blue-100 rounded-xl transition-colors">
                          <ChevronRight className="w-5 h-5 text-blue-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Premium */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-[10px]">
                Mostrando {Math.min(filteredEmployees.length, PAGE_SIZE)} de {filteredEmployees.length} registros
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 px-3">
                  <span className="text-sm font-black">{currentPage}</span>
                  <span className="text-gray-300 font-bold">/</span>
                  <span className="text-sm font-bold text-gray-400">{totalPages}</span>
                </div>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* DifusiÃ³n Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-500/20">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-3">Enlace de Difusión</h2>
              <p className="text-blue-100 text-lg opacity-90 leading-relaxed max-w-xl font-medium">
                Copia este link y envíalo a todos los trabajadores de Lola Berries y Bosbes Berries para comenzar la evaluación anual NOM-035.
              </p>
            </div>
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-3 px-8 py-4 bg-white text-blue-700 rounded-2xl text-lg font-black hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-black/10 group"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                  Copiar Enlace
                </>
              )}
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-start gap-5">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <BarChart className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Reporte Grupal Ejecutivo</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 font-medium">Genera el dictamen detallado de los factores de riesgo psicisocial por dimensiones para la STPS.</p>
                <button 
                   onClick={() => window.open('/admin/report/group', '_blank')}
                   className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 group"
                >
                  Descargar PDF <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-start gap-5">
              <div className="p-4 bg-green-50 rounded-2xl text-green-600 font-bold">
                .CSV
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Exportar Evidencias</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 font-medium">Genera una sábana de Excel con todas las respuestas y tiempos de completado para control interno.</p>
                <a 
                   href="/api/export"
                   className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-all flex items-center gap-2 group"
                >
                  Descargar Datos <Download className="w-4 h-4 group-hover:bounce" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Drawer Premium para Detalles del Empleado */}
      <AnimatePresence>
        {selectedEmployee && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[101] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">EXPEDIENTE DIGITAL</p>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedEmployee.fullName}</h2>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  {/* Detalles Base */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">CÃ³digo Empleado</label>
                      <p className="font-bold text-gray-900 mt-1">{selectedEmployee.code}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Departamento</label>
                      <p className="font-bold text-gray-900 mt-1">{selectedEmployee.department}</p>
                    </div>
                  </div>

                  {/* Resultados NOM-035 */}
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart className="w-5 h-5 text-gray-900" />
                      <h3 className="font-black text-sm uppercase tracking-wider text-gray-900">Resultados NOM-035</h3>
                    </div>

                    {selectedEmployee.status === 'PENDIENTE' ? (
                      <div className="text-center py-10">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">Encuesta pendiente de completar</p>
                      </div>
                    ) : loadingSurvey ? (
                      <div className="flex justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    ) : surveyDetails ? (
                      <div className="space-y-8">
                         {/* Puntaje y Riesgo Global */}
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center min-w-[100px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">TOTAL</p>
                            <p className="text-2xl font-black text-gray-900">{surveyDetails.score ?? (surveyDetails.ans ? Object.values(surveyDetails.ans).length : 0)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">DiagnÃ³stico Global</p>
                            <p className={`text-xl font-black ${
                              surveyDetails.riskLevel === 'Muy Alto' ? 'text-red-500' : 
                              surveyDetails.riskLevel === 'Alto' ? 'text-orange-500' : 'text-green-500'
                            }`}>
                              Riesgo {surveyDetails.riskLevel}
                            </p>
                          </div>
                        </div>

                         {/* SecciÃ³n ATS ExtraÃda */}
                        <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                          surveyDetails.atsResult === 'REQUIERE VALORACIÓN' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 mt-1 ${
                            surveyDetails.atsResult === 'REQUIERE VALORACIÓN' ? 'text-red-500' : 'text-green-500'
                          }`} />
                          <div>
                            <p className={`text-[11px] font-black uppercase mb-1 ${
                              surveyDetails.atsResult === 'REQUIERE VALORACIÓN' ? 'text-red-700' : 'text-green-700'
                            }`}>Acontecimiento TraumÃ¡tico (GuÃa I)</p>
                            <p className="text-xs font-bold leading-tight opacity-80">
                              {surveyDetails.atsResult === 'REQUIERE VALORACIÓN' 
                                ? 'Se recomienda derivar inmediatamente a valoraciÃ³n mÃ©dica.' 
                                : 'No se detectaron eventos severos que requieran atenciÃ³n inmediata.'}
                            </p>
                          </div>
                        </div>

                        {/* BotÃ³n Reporte Individual PDF */}
                        <div className="pt-4 flex gap-4">
                          <button 
                            onClick={() => window.open(`/admin/report/${selectedEmployee.id}`, '_blank')}
                            className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all flex items-center justify-center gap-3"
                          >
                            <Printer className="w-5 h-5" /> Ver Reporte Oficial
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
