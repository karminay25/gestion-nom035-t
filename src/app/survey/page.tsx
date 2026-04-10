'use client';

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { GUIDE_I, GUIDE_III, GUIDE_V, Section } from '@/lib/nom035/questions';
import { CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, UserCircle, LayoutList, FormInput } from 'lucide-react';

type SurveyStage = 'G5' | 'G1' | 'MAIN' | 'POLICY';

// Historial de navegación para que el botón "Anterior" funcione entre etapas
type NavEntry = { stage: SurveyStage; sectionIndex: number };

const LIKERT_OPTIONS = [
  { label: 'Siempre', value: 4 },
  { label: 'Casi siempre', value: 3 },
  { label: 'Algunas veces', value: 2 },
  { label: 'Casi nunca', value: 1 },
  { label: 'Nunca', value: 0 },
];

const YESNO_OPTIONS = [
  { label: 'Sí', value: 'si' },
  { label: 'No', value: 'no' },
];

function SurveyContent() {
  const [stage, setStage] = useState<SurveyStage>('G5');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  // Stack para navegación hacia atrás entre etapas
  const [navHistory, setNavHistory] = useState<NavEntry[]>([]);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const employeeNameFromUrl = searchParams.get('name') || '';
  const employeeCodeFromUrl = searchParams.get('code') || '';
  const employeeCompany = searchParams.get('company') || 'Nuestra Empresa';

  const currentGuide: Section[] = useMemo(() => {
    switch(stage) {
      case 'G5': return GUIDE_V;
      case 'G1': return GUIDE_I;
      case 'MAIN': return GUIDE_III;
      default: return [];
    }
  }, [stage]);

  const currentSection = currentGuide[sectionIndex];
  const totalSections = currentGuide.length;

  // Calcular el progreso global aproximado para la barra
  const globalProgress = useMemo(() => {
    const stageWeights: Record<SurveyStage, number> = { G5: 0, G1: 15, MAIN: 25, POLICY: 95 };
    const stageMax: Record<SurveyStage, number> = { G5: 15, G1: 25, MAIN: 95, POLICY: 100 };
    if (stage === 'POLICY') return 95;
    const start = stageWeights[stage];
    const end = stageMax[stage];
    return start + ((sectionIndex / Math.max(totalSections, 1)) * (end - start));
  }, [stage, sectionIndex, totalSections]);

  const isSectionComplete = useCallback(() => {
    if (!currentSection) return true;
    return currentSection.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');
  }, [currentSection, answers]);

  // Auto-avance: cuando se completa el bloque, avanzar automáticamente (excepto en bloques con texto libre)
  useEffect(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setAutoAdvancing(false);

    if (stage === 'POLICY' || !currentSection) return;
    const hasManualInputs = currentSection.questions.some(q => q.type === 'text');
    if (hasManualInputs) return;

    if (isSectionComplete()) {
      setAutoAdvancing(true);
      autoAdvanceTimer.current = setTimeout(() => {
        setAutoAdvancing(false);
        handleNext();
      }, 700);
    }
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, sectionIndex, stage]);

  // Navegar hacia adelante, guarda historial
  const navigateTo = (newStage: SurveyStage, newIndex: number) => {
    setNavHistory(prev => [...prev, { stage, sectionIndex }]);
    setStage(newStage);
    setSectionIndex(newIndex);
    window.scrollTo(0, 0);
  };

  // Navegar hacia atrás, usa historial
  const handleBack = () => {
    if (navHistory.length === 0) return;
    const prev = navHistory[navHistory.length - 1];
    setNavHistory(h => h.slice(0, -1));
    setStage(prev.stage);
    setSectionIndex(prev.sectionIndex);
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (!isSectionComplete()) {
      setError('Por favor, responda todas las preguntas de esta sección antes de continuar.');
      return;
    }
    setError(null);

    // === LÓGICA ESPECIAL DE GUÍA I SECCIÓN 1 (Screening) ===
    if (stage === 'G1' && sectionIndex === 0) {
      const screenAnswer = answers['g1_screening'];
      if (screenAnswer === 'no') {
        // NO hubo evento traumático → saltar todo G1 e ir directo a Guía III
        navigateTo('MAIN', 0);
        return;
      }
      // SÍ hubo evento → continuar a las siguientes secciones de G1
    }

    if (sectionIndex < totalSections - 1) {
      // Siguiente sección dentro de la misma etapa
      navigateTo(stage, sectionIndex + 1);
    } else {
      // Fin de etapa → pasar a la siguiente
      if (stage === 'G5') navigateTo('G1', 0);
      else if (stage === 'G1') navigateTo('MAIN', 0);
      else if (stage === 'MAIN') {
        setNavHistory(prev => [...prev, { stage, sectionIndex }]);
        setStage('POLICY');
        window.scrollTo(0, 0);
      }
    }
  };

  const handleFinish = async () => {
    // Validación final de integridad total
    const missingG5 = ['v_edad', 'v_genero'].some(id => !answers[id]);
    const hasG1 = answers['g1_screening'] === 'si';
    const missingG1 = hasG1 && ['q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20'].some(id => !answers[id]);
    
    if (missingG5 || missingG1) {
      setError('Se detectaron respuestas faltantes en secciones anteriores. Por favor, revise su encuesta.');
      setStage('G5'); setSectionIndex(0); // Regresar al inicio para corregir
      return;
    }

    setIsFinished(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: employeeCodeFromUrl || answers['v_code'],
          company: employeeCompany,
          answers,
          guideType: 'GUÍA III'
        }),
      });
      if (response.ok) {
        setTimeout(() => { router.push('/thanks'); }, 1000);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (err) {
      console.error(err);
      setError('Hubo un error al guardar sus respuestas. Por favor, intente de nuevo.');
      setIsFinished(false);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Cumplimiento Registrado</h1>
          <p className="text-gray-400 mt-2">Tus respuestas han sido procesadas bajo los estándares de la NOM-035.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans overflow-x-hidden pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10 bg-white/5 border border-white/10 p-5 rounded-[2rem] flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
            <UserCircle size={28} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight line-clamp-1">{employeeNameFromUrl || 'Encuesta NOM-035'}</h2>
            <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">{employeeCompany}</p>
          </div>
        </div>
        {stage !== 'POLICY' && (
          <div className="hidden sm:block px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-center">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {stage === 'G5' ? 'Datos' : stage === 'G1' ? 'Guía I' : 'Guía III'} · Bloque {sectionIndex + 1} de {totalSections}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* === PANTALLA DE POLÍTICA === */}
          {stage === 'POLICY' ? (
            <motion.div key="policy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-8 md:p-16 rounded-[3rem] border border-white/10 shadow-2xl">
              <ShieldCheck className="w-16 h-16 text-blue-400 mb-6" />
              <h1 className="text-3xl font-black mb-6 italic tracking-tighter">Política de Prevención de Riesgos</h1>
              <div className="bg-black/60 p-8 rounded-2xl text-gray-300 text-sm mb-10 max-h-80 overflow-y-auto border border-white/5 leading-relaxed">
                <p className="mb-6 text-white font-bold">En {employeeCompany}, asumimos el compromiso de prevenir factores de riesgo psicosocial y promover un entorno organizacional favorable.</p>
                <ul className="space-y-4 list-disc pl-6 italic">
                  <li>Implementamos medidas de prevención obligatorias bajo la NOM-035-STPS-2018.</li>
                  <li>Prohibimos conductas de violencia, maltrato o hostigamiento laboral.</li>
                  <li>Fomentamos el reconocimiento del desempeño y la estabilidad laboral.</li>
                  <li>Garantizamos la confidencialidad de las denuncias presentadas.</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button onClick={handleBack} className="bg-white/5 border border-white/10 px-8 py-5 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                  <ChevronLeft size={18} /> Regresar
                </button>
                <button onClick={handleFinish} className="flex-1 bg-blue-600 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 shadow-2xl transition-all uppercase tracking-widest">
                  ACEPTO Y FINALIZAR
                </button>
              </div>
            </motion.div>
          ) : (
            /* === PANTALLA DE PREGUNTAS === */
            <motion.div key={`${stage}-${sectionIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {/* Barra de progreso global */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${globalProgress}%` }} transition={{ duration: 0.4 }} />
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl">
                {/* Título de sección */}
                <div className="flex items-start gap-4 mb-6">
                  <LayoutList className="text-blue-500 w-7 h-7 mt-1 flex-shrink-0" />
                  <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-tight">{currentSection?.title}</h1>
                </div>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed border-l-2 border-blue-500/60 pl-4">{currentSection?.description}</p>

                {/* Lista de preguntas */}
                <div className="space-y-12">
                  {currentSection?.questions.map((q, qidx) => (
                    <div key={q.id} className="space-y-5">
                      {/* Texto de la pregunta — soporte para saltos de línea */}
                      <div className="flex gap-4">
                        {currentSection.questions.length > 1 && (
                          <span className="text-blue-500/40 font-black font-mono text-xl flex-shrink-0">{qidx + 1}.</span>
                        )}
                        <h3 className="text-lg md:text-xl font-medium leading-snug text-gray-200 whitespace-pre-line">{q.text}</h3>
                      </div>

                      {/* Opciones de respuesta */}
                      {q.type === 'likert' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {LIKERT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: opt.value })); setError(null); }}
                              className={`py-4 rounded-xl text-xs font-bold transition-all border-2 ${answers[q.id] === opt.value ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : q.type === 'yesno' ? (
                        <div className="flex gap-4">
                          {YESNO_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: opt.value })); setError(null); }}
                              className={`flex-1 py-5 rounded-2xl font-black text-base transition-all border-2 ${answers[q.id] === opt.value ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : q.type === 'select' && (q.options?.length ?? 0) > 6 ? (
                        /* Lista desplegable para opciones largas (ej. edad) */
                        <div className="relative">
                          <select
                            value={answers[q.id] ?? ''}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const parsed = isNaN(Number(raw)) ? raw : Number(raw);
                              setAnswers(prev => ({ ...prev, [q.id]: parsed }));
                              setError(null);
                            }}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 text-lg text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="bg-gray-900">Selecciona una opción...</option>
                            {q.options?.map((opt) => (
                              <option key={String(opt.value)} value={String(opt.value)} className="bg-gray-900 text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                        </div>
                      ) : q.type === 'select' ? (
                        /* Botones para opciones cortas (ej. sexo) */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {q.options?.map((opt) => (
                            <button
                              key={String(opt.value)}
                              onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: opt.value })); setError(null); }}
                              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border-2 text-left ${answers[q.id] === opt.value ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Campo de texto libre */
                        <div className="relative">
                          <FormInput className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => { setAnswers(prev => ({ ...prev, [q.id]: e.target.value })); setError(null); }}
                            placeholder="Escriba su respuesta..."
                            className="w-full bg-white/5 border-2 border-white/10 p-4 pl-12 rounded-xl text-lg focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mensaje de error */}
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-red-400 text-sm font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    ⚠️ {error}
                  </motion.p>
                )}

                {/* Indicador de auto-avance */}
                {autoAdvancing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-center justify-center gap-3 text-blue-400 font-bold text-sm"
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-blue-500"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    />
                    Siguiente bloque...
                  </motion.div>
                )}

                {/* Navegación */}
                <div className="flex justify-between items-center mt-14 pt-8 border-t border-white/5">
                  <button
                    onClick={handleBack}
                    disabled={navHistory.length === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest"
                  >
                    <ChevronLeft size={18} /> Bloque Anterior
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 px-10 py-5 rounded-2xl text-white transition-all flex items-center gap-3 font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-900/20"
                  >
                    Continuar <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Inicializando Sistema Integral NOM-035...</div>}>
      <SurveyContent />
    </Suspense>
  );
}
