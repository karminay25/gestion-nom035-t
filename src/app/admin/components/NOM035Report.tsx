'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { calculateNOM035, checkATS } from '@/lib/nom035/evaluator';
import { GUIDE_I, GUIDE_III, Question } from '@/lib/nom035/questions';

// ── Helpers Legales ──────────────────────────────────────────────────────────

function riskColor(level: string) {
  switch (level) {
    case 'Muy Alto': return '#b91c1c';
    case 'Alto':     return '#c2410c';
    case 'Medio':    return '#a16207';
    case 'Bajo':     return '#15803d';
    default:         return '#1d4ed8';
  }
}

function riskBg(level: string) {
  switch (level) {
    case 'Muy Alto': return '#fef2f2';
    case 'Alto':     return '#fff7ed';
    case 'Medio':    return '#fefce8';
    case 'Bajo':     return '#f0fdf4';
    default:         return '#f0f9ff';
  }
}

function getMedidas(level: string): { tipo: string; items: string[] } {
  switch (level) {
    case 'Nulo':
      return {
        tipo: 'Medidas de Prevención (Riesgo Nulo)',
        items: [
          'Difundir la política de riesgos psicosociales.',
          'Promover un entorno organizacional favorable.',
          'Mantener mecanismos de comunicación.'
        ]
      };
    case 'Bajo':
      return {
        tipo: 'Acciones Preventivas (Riesgo Bajo)',
        items: [
          'Sensibilizar sobre violencia y apoyo social.',
          'Reforzar la política de prevención.',
          'Mantener vigilancia periódica de factores.'
        ]
      };
    case 'Medio':
      return {
        tipo: 'Acciones de Control (Riesgo Medio)',
        items: [
          'Revisar distribución de cargas y tiempos.',
          'Implementar participación proactiva.',
          'Capacitar jefes en liderazgo y manejo.'
        ]
      };
    case 'Alto':
    case 'Muy Alto':
      return {
        tipo: 'Acciones Prioritarias (Riesgo Alto/Muy Alto)',
        items: [
          'Análisis de dominios con riesgo alto.',
          'Referir al trabajador a valoración médica.',
          'Intervención organizacional e inmediata.'
        ]
      };
    default:
      return { tipo: 'Acciones Generales', items: ['Seguir lo dispuesto en la NOM-035.'] };
  }
}

function getFormalConclusion(level: string, score: number, hasATS: boolean): string {
  const base = `Resultados NOM-035: ${score} pts (**RIESGO ${level.toUpperCase()}**). `;
  let msg = '';
  switch (level) {
    case 'Nulo': msg = 'No requiere acciones de control específicas.'; break;
    case 'Bajo': msg = 'Requiere difusión y sensibilización general.'; break;
    case 'Medio': msg = 'Necesario implementar programas de capacitación.'; break;
    case 'Alto': msg = 'Urgente realizar análisis y medidas correctivas.'; break;
    case 'Muy Alto': msg = 'Intervención inmediata para mitigar riesgos.'; break;
  }
  if (hasATS) msg += ' Requiere canalización médica (Guía I).';
  return base + msg;
}

const COMPANY_DATA: Record<string, { rfc: string; razonSocial: string; registroPatronal: string; logo: string }> = {
  'LOLA': {
    rfc: 'LBE140327491',
    razonSocial: 'LOLA BERRIES S.P.R. DE R.L. DE C.V.',
    registroPatronal: 'C0314007135',
    logo: '/lola.jpeg'
  },
  'BOSBES': {
    rfc: 'BBE161029DHA',
    razonSocial: 'BOSBES BERRIES SPR DE RL DE CV',
    registroPatronal: 'C0314584133',
    logo: '/bosbes.jpeg'
  },
};

export default function NOM035Report({ survey }: { survey: any }) {
  const [showDetails, setShowDetails] = useState(false);
  const emp = survey.employees;
  const results = calculateNOM035(survey.guide_type, survey.answers);
  const hasATS = checkATS(survey.answers);

  if (!results) return null;

  const rawCompany = emp.company || '';
  const isLola = rawCompany.toUpperCase().includes('LOLA');
  const compKey = isLola ? 'LOLA' : 'BOSBES';
  const companyInfo = COMPANY_DATA[compKey] || COMPANY_DATA['LOLA'];

  const fechaEncuesta = new Date(survey.completed_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const entryDate = emp.entryDate || emp.entry_date;
  const fechaIngreso = entryDate ? new Date(entryDate).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';

  const getAnswerLabel = (q: Question, val: any) => {
    if (val === undefined || val === null) return 'N/A';
    if (q.type === 'yesno') return val === 'si' ? 'SÍ' : 'NO';
    if (q.type === 'likert') {
      const labels = ['Siempre', 'Casi siempre', 'Algunas veces', 'Casi nunca', 'Nunca'];
      return labels[parseInt(val)] || val;
    }
    return val.toString();
  };

  return (
    <div className="acuse-root" style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '210mm', margin: '0 auto' }}>
      <div className="acuse-sheet" style={{
        width: '100%', height: '290mm', background: '#fff',
        padding: '5mm 10mm', boxSizing: 'border-box',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header Superior Compacto */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6.5px', color: '#9ca3af', textTransform: 'uppercase', borderBottom: '0.5px solid #f3f4f6', paddingBottom: '2px', marginBottom: '5px' }}>
          <div>NOM-035-STPS-2018 | Diagnóstico Individual</div>
          <div style={{ fontWeight: 800 }}>MÉTODO: DIGITAL | AÑO: 2026</div>
        </div>

        {/* Encabezado Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '38px', height: '38px', position: 'relative' }}>
              <Image src={companyInfo.logo} alt="L" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#111827' }}>Acuse de Evaluación</h1>
              <p style={{ margin: 0, fontSize: '8px', color: '#6b7280', fontWeight: 600 }}>Guía de Referencia III</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#111827' }}>FOLIO: {survey.id.toString().padStart(6, '0')}</div>
            <div style={{ fontSize: '7.5px', color: '#6b7280' }}>Fecha: {fechaEncuesta}</div>
          </div>
        </div>

        {/* Contexto Minimal */}
        <div style={{ background: '#f9fafb', padding: '4px 8px', borderRadius: '4px', border: '1px solid #f3f4f6', marginBottom: '6px', fontSize: '7.2px', color: '#4b5563', lineHeight: '1.2' }}>
          Evaluación técnica NOM-035 (Guía III). Aplicación obligatoria, voluntaria y confidencial (numeral 7.2).
        </div>

        {/* 1. Datos Identificación */}
        <div style={{ marginBottom: '6px', breakInside: 'avoid' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, marginBottom: '3px', textTransform: 'uppercase', borderLeft: '2px solid #111827', paddingLeft: '5px' }}>1. Información General</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            {[
              { l: 'Colaborador', v: emp.fullName || emp.full_name },
              { l: 'Edad / Género', v: `${survey.answers['v_edad'] || 'N/A'} / ${survey.answers['v_genero'] === 'M' ? 'M' : 'F'}` },
              { l: 'Puesto', v: emp.position },
              { l: 'Cód. empleado', v: emp.code },
              { l: 'Departamento', v: emp.department },
              { l: 'Fecha ingreso', v: fechaIngreso },
              { l: 'Razón Social', v: companyInfo.razonSocial },
              { l: 'RFC Empresa', v: companyInfo.rfc },
            ].map(({ l, v }, i) => (
              <div key={l} style={{ padding: '3px 6px', background: i % 2 === 0 ? '#fff' : '#f9fafb', borderRight: (i + 1) % 4 !== 0 ? '1px solid #e5e7eb' : 'none', borderTop: i >= 4 ? '1px solid #e5e7eb' : 'none' }}>
                <div style={{ color: '#6b7280', fontSize: '5.5px', fontWeight: 800, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '7.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Resultados Clave */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', marginBottom: '8px', breakInside: 'avoid' }}>
          <div style={{ border: '1px solid #111827', borderRadius: '6px', padding: '6px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: riskColor(results.riskLevel) }} />
            <div style={{ fontSize: '7.5px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase' }}>Riesgo Global</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900 }}>{results.score.toFixed(0)}</div>
              <div style={{ fontSize: '6.5px', fontWeight: 600, color: '#9ca3af' }}>/ 288 pts</div>
            </div>
            <div style={{ fontSize: '8.5px', fontWeight: 900, color: riskColor(results.riskLevel), background: riskBg(results.riskLevel), padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase', display: 'inline-block' }}>
              {results.riskLevel}
            </div>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px' }}>
            <div style={{ fontSize: '7.8px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2px' }}>Conclusión</div>
            <p style={{ margin: 0, fontSize: '7.5px', color: '#374151', lineHeight: '1.2', fontStyle: 'italic' }}>
              "{getFormalConclusion(results.riskLevel, results.score, hasATS)}"
            </p>
          </div>
        </div>

        {/* 4. Desglose de Dominios */}
        <div style={{ marginBottom: '8px', breakInside: 'avoid' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', borderLeft: '2px solid #111827', paddingLeft: '5px' }}>2. Desglose de Dominios</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
            {results.domains.map((d: any) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '7.2px' }}>
                <span style={{ color: '#4b5563', fontWeight: 600, maxWidth: '65%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                <span style={{ fontWeight: 800, color: riskColor(d.riskLevel), background: riskBg(d.riskLevel), padding: '1px 4px', borderRadius: '2px', fontSize: '6.8px' }}>{d.score} | {d.riskLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Acciones */}
        <div style={{ border: '1px solid #111827', borderRadius: '6px', padding: '6px', marginBottom: '8px', breakInside: 'avoid' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, marginBottom: '3px', textTransform: 'uppercase' }}>3. {getMedidas(results.riskLevel).tipo}</div>
          <ul style={{ margin: 0, paddingLeft: '11px', fontSize: '7.5px', color: '#111827', lineHeight: '1.2', columns: 2 }}>
            {getMedidas(results.riskLevel).items.slice(0, 4).map((item, idx) => (
              <li key={idx} style={{ marginBottom: '1px' }}>{item}</li>
            ))}
            {hasATS && <li style={{ color: '#dc2626', fontWeight: 800 }}>Canalización clínica prioritaria.</li>}
          </ul>
        </div>

        {/* Firmas */}
        <div style={{ marginTop: 'auto', paddingBottom: '6mm', breakInside: 'avoid' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {[
              { name: emp.fullName || emp.full_name, lbl: 'Firma del Trabajador' },
              { name: 'RECURSOS HUMANOS', lbl: 'Dpto. Seguridad y Salud' },
            ].map(({ name, lbl }) => (
              <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '85%', borderBottom: '1px solid #111827', marginBottom: '3px' }} />
                <div style={{ fontSize: '7.8px', fontWeight: 800, textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ fontSize: '5.8px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 900 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Pie */}
        <footer style={{ position: 'absolute', bottom: '6mm', left: '10mm', right: '10mm', textAlign: 'center', fontSize: '6px', color: '#9ca3af', borderTop: '0.5px solid #f3f4f6', paddingTop: '4px' }}>
          Válido para auditoría STPS. Registro Patronal: {companyInfo.registroPatronal} | Periodo 2026.
        </footer>
      </div>

      <style jsx>{`
        @media print {
          .acuse-root { margin: 0 !important; width: 100% !important; }
          .acuse-sheet { padding: 5mm 10mm !important; border: none !important; height: auto !important; min-height: 290mm !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Solo Web */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '15px' }}>
        <button onClick={() => setShowDetails(!showDetails)} style={{ padding: '8px 16px', background: '#111827', color: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
          {showDetails ? 'Ocultar Detalle' : 'Ver Respuestas Detalladas'}
        </button>
      </div>

      {showDetails && (
        <div className="details-anexo" style={{ width: '210mm', margin: '0 auto 40px auto', background: '#fff', padding: '10mm 15mm', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '10px', borderBottom: '2px solid #111827' }}>ANEXO TÉCNICO</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
            <tbody>
              {GUIDE_III.flatMap(s => s.questions).map(q => (
                <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '3px 0', color: '#6b7280' }}>{q.text}</td>
                  <td style={{ padding: '3px 0', fontWeight: 700, textAlign: 'right' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
