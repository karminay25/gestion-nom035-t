import { supabase } from '@/lib/db/supabase';
import { calculateNOM035, getRiskLevel } from '@/lib/nom035/evaluator';
import ClientPrint from '../../components/ClientPrint';
import Image from 'next/image';
import { BarChart, Users, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

// Umbrales oficiales NOM-035 Guía III para el reporte grupal
const DOMAIN_THRESHOLDS: Record<string, number[]> = {
  'Condiciones en el ambiente de trabajo': [5, 9, 11, 14],
  'Carga de trabajo': [15, 21, 27, 37],
  'Falta de control sobre el trabajo': [11, 16, 21, 25],
  'Jornada de trabajo': [1, 2, 4, 6],
  'Interferencia en la relación trabajo-familia': [1, 2, 4, 6],
  'Liderazgo': [9, 12, 16, 23],
  'Relaciones en el trabajo': [10, 13, 17, 24],
  'Violencia laboral': [7, 10, 13, 16],
  'Reconocimiento del desempeño': [6, 10, 13, 18],
  'Insuficiente sentido de pertenencia e inestabilidad': [4, 7, 11, 15]
};

const TOTAL_THRESHOLDS = [50, 75, 99, 140];

function riskColor(level: string) {
  switch (level) {
    case 'Muy Alto': return '#b91c1c';
    case 'Alto':     return '#c2410c';
    case 'Medio':    return '#a16207';
    case 'Bajo':     return '#15803d';
    case 'Nulo':     return '#16a34a';
    default:         return '#1d4ed8';
  }
}

export default async function GroupReportPage({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const resolvedParams = await searchParams;
  const companyFilter = resolvedParams.company;

  // 1. Obtener datos base
  let empQuery = supabase.schema('public').from('nom035_employees').select('*');
  let resQuery = supabase.schema('public').from('nom035_responses').select('*');

  if (companyFilter === 'LOLA') {
    empQuery = empQuery.ilike('company', '%LOLA%');
  } else if (companyFilter === 'BOSBES') {
    empQuery = empQuery.ilike('company', '%BOSBES%');
  }

  const { data: employees } = await empQuery;
  const { data: rawResponses } = await resQuery;

  if (!employees || !rawResponses) return <div>Error cargando datos.</div>;

  const empIds = new Set(employees.map(e => e.id));
  const responses = rawResponses.filter(r => empIds.has(r.employee_id));

  const latestMap = new Map();
  responses.forEach(r => {
    const existing = latestMap.get(r.employee_id);
    if (!existing || new Date(r.completed_at) > new Date(existing.completed_at)) {
      latestMap.set(r.employee_id, r);
    }
  });

  const finalResponses = Array.from(latestMap.values());
  const evaluatedCount = finalResponses.length;
  const censusCount = employees.length;
  const participationRate = censusCount > 0 ? (evaluatedCount / censusCount) * 100 : 0;
  const isRepresentative = participationRate >= 10;

  // 3. Procesar métricas por Dominio
  const riskDistribution = { 'Nulo': 0, 'Bajo': 0, 'Medio': 0, 'Alto': 0, 'Muy Alto': 0 };
  const domainsSum: Record<string, number> = {};
  let globalScoreSum = 0;

  finalResponses.forEach(r => {
    const res = calculateNOM035(r.guide_type, r.answers);
    if (res) {
      riskDistribution[res.riskLevel as keyof typeof riskDistribution]++;
      globalScoreSum += res.score;
      res.domains.forEach(d => {
        domainsSum[d.name] = (domainsSum[d.name] || 0) + d.score;
      });
    }
  });

  const avgGlobalScore = evaluatedCount > 0 ? globalScoreSum / evaluatedCount : 0;
  const globalRiskLevel = getRiskLevel(avgGlobalScore, TOTAL_THRESHOLDS);

  const domainAverages = Object.entries(DOMAIN_THRESHOLDS).map(([name, limits]) => {
    const avgScore = evaluatedCount > 0 ? (domainsSum[name] || 0) / evaluatedCount : 0;
    return {
      name,
      avg: avgScore,
      riskLevel: getRiskLevel(avgScore, limits)
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 text-black p-10 font-sans print:p-0 print:bg-white text-sm">
      <div className="max-w-5xl mx-auto bg-white p-12 shadow-2xl rounded-3xl border border-gray-100 print:shadow-none print:border-none">
        
        <div className="no-print mb-8 text-center">
          <ClientPrint />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-2">
              {(companyFilter === 'all' || !companyFilter || companyFilter === 'LOLA') && (
                <div className="relative w-24 h-24">
                  <Image src="/lola.jpeg" alt="Lola Logo" fill className="object-contain" />
                </div>
              )}
              {(companyFilter === 'all' || !companyFilter || companyFilter === 'BOSBES') && (
                <div className="relative w-24 h-24 ml-[-10px]">
                  <Image src="/bosbes.jpeg" alt="Bosbes Logo" fill className="object-contain" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Informe Ejecutivo NOM-035</h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Análisis de Riesgo Organizacional - Guía III</p>
            </div>
          </div>
          <div className="text-right">
             <p className="font-black text-lg">
               {companyFilter === 'LOLA' ? 'LOLA BERRIES' : 
                companyFilter === 'BOSBES' ? 'BOSBES BERRIES' : 
                'LOLA BERRIES & BOSBES'}
             </p>
             <p className="text-gray-400 text-xs uppercase font-bold">Evaluación 2026</p>
          </div>
        </div>

        {/* Contexto de Evaluación */}
        <div className="mb-10 grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-1">Contexto de Aplicación</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                <strong>Instrumento:</strong> Guía de Referencia III (Cuestionario para identificar fact. de riesgo psicosocial).<br/>
                <strong>Modo:</strong> Aplicación Digital Controlada.<br/>
                <strong>Periodo:</strong> Enero - Abril 2026.<br/>
                <strong>Confidencialidad:</strong> Los datos son anónimos conforme al numeral 7.2.
              </p>
            </div>
          </div>
          <div className={`p-6 rounded-2xl border flex items-center gap-4 ${isRepresentative ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="text-[10px] uppercase font-black tracking-widest opacity-70 mb-1">Muestra de Evaluación</h3>
              <p className="text-sm font-black">Muestra {isRepresentative ? 'Representativa' : 'No Representativa'}</p>
              <p className="text-[10px] font-bold mt-1">Participación: {participationRate.toFixed(2)}% del censo total.</p>
              {!isRepresentative && <p className="text-[10px] italic mt-1 font-medium">* Se requiere mayor participación para validez técnica.</p>}
            </div>
          </div>
        </div>

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { l: 'Censo Total', v: censusCount, i: Users, c: 'bg-white border-gray-100 text-gray-900 shadow-sm' },
            { l: 'Total Evaluados', v: evaluatedCount, i: ShieldCheck, c: 'bg-white border-gray-100 text-gray-900 shadow-sm' },
            { l: 'Puntaje Promedio', v: avgGlobalScore.toFixed(2), i: BarChart, c: 'bg-white border-gray-100 text-gray-900 shadow-sm' },
            { l: 'Riesgo Global', v: globalRiskLevel.toUpperCase(), i: AlertTriangle, c: `text-white border-none shadow-lg`, s: { backgroundColor: riskColor(globalRiskLevel) } },
          ].map((stat, i) => (
            <div key={i} className={`${stat.c} p-5 rounded-2xl border flex flex-col items-center text-center`} style={stat.s}>
              <stat.i className={`w-5 h-5 mb-2 ${!stat.s ? 'text-blue-500' : ''}`} />
              <p className="text-2xl font-black leading-none mb-1">{stat.v}</p>
              <p className="text-[9px] uppercase font-bold tracking-widest opacity-80">{stat.l}</p>
            </div>
          ))}
        </div>

        {/* 1. Análisis de Dominios con Niveles de Riesgo */}
        <div className="mb-10">
          <h3 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest border-l-4 border-black pl-3">1. Análisis Cuantitativo por Dominio NOM-035</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white text-[10px] uppercase tracking-widest font-black">
                <th className="p-4 text-left rounded-tl-xl">Nombre del Dominio Evaluado</th>
                <th className="p-4 text-center w-40">Puntaje Bruto</th>
                <th className="p-4 text-center rounded-tr-xl w-48">Nivel de Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {domainAverages.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-x border-gray-100 font-bold text-gray-700 text-xs">{d.name}</td>
                  <td className="p-4 border-x border-gray-100 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-black text-lg">{d.avg.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-4 border-x border-gray-100">
                    <div className="flex flex-col items-center gap-2">
                       <span 
                         className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
                         style={{ backgroundColor: riskColor(d.riskLevel) }}
                       >
                         {d.riskLevel}
                       </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. Visualización Gráfica */}
        <div className="grid grid-cols-2 gap-10 mb-10">
           <div>
             <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest border-l-4 border-black pl-3 uppercase">2. Semáforo de Riesgo Organizacional</h3>
             <div className="space-y-4">
                {Object.entries(riskDistribution).reverse().map(([label, count]) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-24 text-[9px] font-black uppercase text-gray-500">{label}</div>
                    <div className="flex-1 bg-gray-100 h-6 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full transition-all duration-1000 flex items-center justify-end px-3 shadow-inner"
                        style={{ 
                          width: `${evaluatedCount > 0 ? (count / evaluatedCount) * 100 : 0}%`,
                          backgroundColor: riskColor(label)
                        }}
                      >
                         <span className="text-[10px] font-black text-white">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
           <div>
             <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest border-l-4 border-black pl-3">3. Resumen Ejecutivo y Recomendaciones</h3>
             <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-[11px] leading-relaxed text-blue-900 font-medium">
                  <strong>Interpretación:</strong> {
                    !isRepresentative ? 'AVISO: La muestra obtenida es insuficiente (<10%) para emitir conclusiones estadísticamente válidas sobre el clima organizacional.' :
                    globalRiskLevel === 'Nulo' ? 'La organización presenta un clima organizacional favorable con riesgos mínimos.' :
                    globalRiskLevel === 'Bajo' ? 'Se observa estabilidad general, recomendando mantener las actividades de prevención actuales.' :
                    'Se detectan áreas de oportunidad críticas que requieren intervención inmediata conforme a los dominios con riesgo Alto o Muy Alto.'
                  }
                </p>
                <div className="mt-4 pt-4 border-t border-blue-200">
                   <p className="text-[11px] font-bold text-blue-800 mb-2 underline">Acciones recomendadas:</p>
                   <ul className="text-[10px] space-y-2 text-blue-700 font-medium list-disc pl-4">
                      {globalRiskLevel === 'Nulo' || globalRiskLevel === 'Bajo' ? (
                        <>
                          <li>Mantener la Política de Prevención de Factores de Riesgo Psicosocial.</li>
                          <li>Continuar con la difusión de valores y apoyo social.</li>
                        </>
                      ) : (
                        <>
                          <li>Realizar entrevistas focalizadas en dominios de riesgo crítico.</li>
                          <li>Implementar el Programa de Intervención Organizacional.</li>
                          <li>Reforzar el liderazgo positivo y la capacitación en mandos medios.</li>
                        </>
                      )}
                      <li>Evaluación subsecuente obligatoria en 24 meses.</li>
                   </ul>
                </div>
             </div>
           </div>
        </div>

        {/* Firmas */}
        <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-64 border-b-2 border-black mb-3" />
            <p className="font-black text-sm uppercase">Recursos Humanos</p>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Sello y Firma de Validación NOM-035</p>
            <p className="text-gray-300 text-[9px] mt-4 italic font-medium">Documento generado el {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Footer Audit */}
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-[8px] text-gray-400 font-medium space-y-1">
          <p>Evidencia colectiva automatizada conforme a la NOM-035-STPS-2018 (Numerales 7.1, 7.2 y 8.1).</p>
          <p>Este informe constituye el Diagnóstico de Seguridad y Salud en el Trabajo requerido por el Reglamento Federal de Seguridad y Salud en el Trabajo.</p>
        </footer>
      </div>
    </div>
  );
}
