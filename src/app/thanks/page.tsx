'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ThanksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      {/* Fondo decorativo premium */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-900/10 blur-[150px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative text-center">
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            ¡Evaluación Completada!
          </h1>
          
          <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
            Gracias por participar. Tus respuestas han sido procesadas de manera confidencial y nos ayudarán a mejorar nuestro entorno de acuerdo al cumplimiento de la NOM-035.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> Regresar al Inicio
            </button>
            <button 
              disabled
              className="px-8 py-4 bg-blue-600/50 text-blue-200 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-blue-500/20"
            >
              <ShieldCheck className="w-5 h-5" /> Simulación Segura
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
