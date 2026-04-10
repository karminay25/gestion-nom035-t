import { supabase } from '@/lib/db/supabase';
import { calculateNOM035 } from '@/lib/nom035/evaluator';
import ClientPrint from '../../components/ClientPrint';
import Image from 'next/image';
import { BarChart, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

export default async function GroupReportPage({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const resolvedParams = await searchParams;
  const companyFilter = resolvedParams.company; // 'LOLA' | 'BOSBES'

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

  // Filtrar respuestas solo de los empleados filtrados
  const empIds = new Set(employees.map(e => e.id));
  const responses = rawResponses.filter(r => empIds.has(r.employee_id));

  // 2. Procesar información agregada
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
  const participationRate = ((evaluatedCount / censusCount) * 100).toFixed(1);

  // 3. Calcular métricas NOM
  const riskDistribution = { 'Nulo': 0, 'Bajo': 0, 'Medio': 0, 'Alto': 0, 'Muy Alto': 0 };
  const domainsStats = new Array(10).fill(0).map((_, i) => ({ 
    name: '', score: 0, count: 0 
  }));

  finalResponses.forEach(r => {
    const res = calculateNOM035(r.guide_type, r.answers);
    if (res) {
      riskDistribution[res.riskLevel as keyof typeof riskDistribution]++;
      res.domains.forEach((d, idx) => {
        domainsStats[idx].name = d.name;
        domainsStats[idx].score += d.score || 0;
        domainsStats[idx].count++;
      });
    }
  });

  const domainAverages = domainsStats.map(d => ({
    name: d.name,
    avg: d.count > 0 ? (d.score / d.count).toFixed(2) : 0
  }));

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
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Evaluación Colectiva de Riesgo Psicosocial</p>
            </div>
          </div>
          <div className="text-right">
             <p className="font-black text-lg">
               {companyFilter === 'LOLA' ? 'LOLA BERRIES' : 
                companyFilter === 'BOSBES' ? 'BOSBES BERRIES' : 
                'LOLA BERRIES & BOSBES'}
             </p>
             <p className="text-gray-400 text-xs">Periodo: {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { l: 'Censo Total', v: censusCount, i: Users, c: 'bg-blue-50 text-blue-600' },
            { l: 'Evaluados', v: evaluatedCount, i: ShieldCheck, c: 'bg-green-50 text-green-600' },
            { l: '% Participación', v: `${participationRate}%`, i: BarChart, c: 'bg-purple-50 text-purple-600' },
            { l: 'Riesgos Críticos', v: riskDistribution['Muy Alto'] + riskDistribution['Alto'], i: AlertTriangle, c: 'bg-red-50 text-red-600' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.c} p-5 rounded-2xl border border-current/10 flex flex-col items-center text-center`}>
              <stat.i className="w-6 h-6 mb-2" />
              <p className="text-2xl font-black">{stat.v}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">{stat.l}</p>
            </div>
          ))}
        </div>

        {/* 1. Distribución de Riesgo Chart */}
        <div className="mb-10">
          <h3 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest border-l-4 border-black pl-3">1. Perfil de Riesgo Organizacional</h3>
          <div className="flex items-end gap-3 h-48 border-b border-gray-200 pb-2 bg-gray-50/50 rounded-t-xl p-4">
             {Object.entries(riskDistribution).map(([label, count]) => {
                const height = evaluatedCount > 0 ? (count / evaluatedCount) * 100 : 0;
                const color = label === 'Muy Alto' ? '#ef4444' : label === 'Alto' ? '#f97316' : label === 'Medio' ? '#eab308' : '#3b82f6';
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{count} emp.</div>
                    <div 
                      className="w-full rounded-t-lg transition-all duration-500 shadow-lg" 
                      style={{ height: `${height}%`, backgroundColor: color }}
                    />
                    <div className="text-[10px] font-black uppercase py-1 border-t w-full text-center" style={{ color }}>{label}</div>
                  </div>
                );
             })}
          </div>
        </div>

        {/* 2. Promedios por Dominio */}
        <div className="mb-10">
          <h3 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest border-l-4 border-black pl-3">2. Análisis Detallado por Dominio Legal</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs">
                <th className="p-3 text-left rounded-tl-xl border border-black">Categoría / Dominio Evaluado</th>
                <th className="p-3 text-center border border-black w-32">Puntaje Promedio</th>
                <th className="p-3 text-center rounded-tr-xl border border-black w-40">Impacto Relativo</th>
              </tr>
            </thead>
            <tbody>
              {domainAverages.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 border border-gray-200 font-bold text-gray-700">{d.name}</td>
                  <td className="p-3 border border-gray-200 text-center font-black text-lg">{d.avg}</td>
                  <td className="p-3 border border-gray-200">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-600 rounded-full" 
                         style={{ width: `${Math.min(100, (Number(d.avg) / 40) * 100)}%` }} // Escala basada en un score alto
                       />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Conclusiones y Firma */}
        <div className="grid grid-cols-2 gap-10 mt-16 text-justify">
           <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50">
             <h4 className="font-black text-xs uppercase mb-3 text-blue-600 tracking-wider">Conclusiones Legales</h4>
             <p className="text-[11px] leading-relaxed text-gray-600 font-serif italic">
               Basado en el censo actual de <strong>{censusCount}</strong> trabajadores y una tasa de respuesta del <strong>{participationRate}%</strong>, 
               la organización muestra una tendencia hacia el riesgo <strong>{riskDistribution['Muy Alto'] > 0 ? 'MUY ALTO' : 'ESTABLE'}</strong>. 
               Se recomienda la continuidad del programa de prevención de riesgos psicosociales conforme a las guías de referencia I y III.
             </p>
           </div>
           <div className="flex flex-col items-center justify-center">
              <div className="w-48 border-b-2 border-black mb-2" />
              <p className="font-black text-xs uppercase">Dirección General</p>
              <p className="text-gray-400 text-[10px] uppercase">
                {companyFilter === 'LOLA' ? 'LOLA BERRIES' : 
                 companyFilter === 'BOSBES' ? 'BOSBES BERRIES' : 
                 'LOLA BERRIES & BOSBES'} — {new Date().getFullYear()}
              </p>
           </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-[9px] text-gray-400 italic">
          Evidencia colectiva automatizada conforme a la NOM-035-STPS-2018. Este reporte constituye el "Diagnóstico de Seguridad y Salud en el Trabajo" requerido por la normativa.
        </footer>
      </div>
    </div>
  );
}
