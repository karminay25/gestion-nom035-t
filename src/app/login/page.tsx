'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, ArrowRight, Settings, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [employeeCode, setEmployeeCode] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [employeeData, setEmployeeData] = useState<{ fullName: string; code: string; company: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode || !selectedCompany) {
      setError('Selecciona tu empresa e ingresa tu nombre completo');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/employees');
      const employees = await response.json();
      
      const inputNormalized = normalizeText(employeeCode);

      const found = employees.find((emp: any) => 
        normalizeText(emp.fullName) === inputNormalized && emp.company === selectedCompany
      );
      
      if (found) {
        setEmployeeData(found);
      } else {
        setError('No se encontró a ningún trabajador con ese nombre en esta empresa');
      }
    } catch (err) {
      setError('Error al conectar con el servidor de nómina');
    } finally {
      setLoading(false);
    }
  };

  const startSurvey = () => {
    if (employeeData) {
      const params = new URLSearchParams({
        code: employeeData.code,
        name: employeeData.fullName,
        company: employeeData.company
      });
      router.push(`/survey?${params.toString()}`);
    } else {
      router.push('/survey');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      {/* Fondo con gradientes premium */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 rounded-2xl mb-4 border border-blue-500/20"
          >
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Gestión NOM-035
          </h1>
          <p className="text-gray-400 text-sm">Portal de Cumplimiento Normativo</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl relative">
          <AnimatePresence mode="wait">
            {!employeeData ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerify} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Selecciona tu Empresa</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      <option value="Lola Berries">Lola Berries</option>
                      <option value="Bosbes Berries">Bosbes Berries</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ingresa tu Nombre Completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="Nombre tal cual aparece en tu nómina"
                      className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs mt-2 ml-1">
                      <AlertCircle className="w-3 h-3" /> {error}
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || !employeeCode || !selectedCompany}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verificar Identidad <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-1">¡Hola, {employeeData.fullName}!</h2>
                <p className="text-gray-400 text-sm mb-8">Hemos verificado tu información correctamente.</p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startSurvey}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl"
                >
                  Comenzar Encuesta
                </motion.button>
                <button 
                  onClick={() => setEmployeeData(null)}
                  className="mt-4 text-xs text-gray-500 hover:text-white transition-colors"
                >
                  No soy yo, corregir código
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Acceso discreto para Administrador */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => router.push('/admin/login')}
            className="group flex items-center gap-2 text-gray-600 hover:text-blue-400 transition-all duration-500 text-[10px] uppercase font-bold tracking-widest"
          >
            <Settings className="w-3 h-3 opacity-20 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
            Acceso Administrativo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
