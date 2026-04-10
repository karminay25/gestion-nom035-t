'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulación de autenticación administrativa
    setTimeout(() => {
      if (username === 'admin' && password === 'LolaBerries*2026') {
        localStorage.setItem('admin_session', 'true');
        router.push('/admin');
      } else {
        setError('Credenciales administrativas incorrectas');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      {/* Fondo con gradientes premium (rojo/indigo para admin) */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-4 border border-red-500/20"
          >
            <Settings className="w-8 h-8 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Panel de Control
          </h1>
          <p className="text-gray-400 text-sm">Gestión NOM-035 | Acceso Administrativo</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-xs text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="block w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-red-500/50 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-red-500/50 outline-none text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !username || !password}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar al Panel <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
          
          <button 
            onClick={() => router.push('/login')}
            className="w-full mt-6 text-xs text-gray-500 hover:text-white transition-colors"
          >
            Volver al Portal de Trabajadores
          </button>
        </div>
      </motion.div>
    </div>
  );
}
