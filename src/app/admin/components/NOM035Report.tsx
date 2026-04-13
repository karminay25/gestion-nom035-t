'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { calculateNOM035, checkATS } from '@/lib/nom035/evaluator';
import { GUIDE_III, Question } from '@/lib/nom035/questions';

// ── Helpers Legales ──────────────────────────────────────────────────────────

function riskColor(level: string) {
  switch (level) {
    case 'Muy Alto': return '#7f1d1d';
    case 'Alto':     return '#9a3412';
    case 'Medio':    return '#854d0e';
    case 'Bajo':     return '#166534';
    case 'Nulo':     return '#15803d';
    default:         return '#1e40af';
  }
}

function riskBg(level: string) {
  switch (level) {
    case 'Muy Alto': return '#fef2f2';
    case 'Alto':     return '#fff7ed';
    case 'Medio':    return '#fefce8';
    case 'Bajo':     return '#f0fdf4';
    case 'Nulo':     return '#f0fdf4';
    default:         return '#eff6ff';
  }
}

function getFormalActions(level: string, hasATS: boolean): string[] {
  const actions: string[] = [
    'Difundir la política de prevención de riesgos psicosociales.',
    'Promover un entorno organizacional favorable.'
  ];
  
  if (level === 'Nulo' || level === 'Bajo') {
    actions.push('Mantener mecanismos de comunicación y sensibilización general.');
  } else if (level === 'Medio') {
    actions.push('Revisar la distribución de cargas de trabajo y jornadas laborales.');
    actions.push('Realizar capacitación en liderazgo y apoyo social.');
  } else {
    actions.push('Implementar programa de intervención organizacional inmediato.');
    actions.push('Evaluar el entorno laboral mediante seguimiento técnico.');
  }

  if (hasATS) {
    actions.push('CANALIZACIÓN CLÍNICA OBLIGATORIA (Numeral 8.5).');
  }

  return actions;
}

function getFormalDictamen(level: string, score: number, hasATS: boolean): string {
  const base = `Según la NOM-035-STPS-2018, el puntaje de **${score.toFixed(0)}** indica un **RIESGO ${level.toUpperCase()}**. `;
  switch (level) {
    case 'Muy Alto': return base + 'Se requiere intervención correctiva inmediata, referir a valoración médica y realizar vigilancia periódica.';
    case 'Alto': return base + 'Es necesario realizar un análisis de los factores e implementar un programa de intervención para mitigar causas.';
    case 'Medio': return base + 'Se sugiere implementar capacitación, apoyo social y revisión de cargas de trabajo.';
    case 'Bajo': return base + 'Requiere la difusión de la política de prevención y sensibilización general.';
    default: return base + 'No requiere acciones específicas; se recomienda mantener el clima actual.';
  }
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

  const fechaEncuesta = new Date(survey.completed_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const entryDate = emp.entryDate || emp.entry_date;
  const fechaIngreso = entryDate ? new Date(entryDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

  const getAnswerLabel = (q: Question, val: any) => {
    if (val === undefined || val === null) return 'N/A';
    if (q.type === 'yesno') return val === 'si' ? 'SÍ' : 'NO';
    if (q.type === 'likert') {
      const labels = ['Siempre', 'Casi siempre', 'algunas veces', 'Casi nunca', 'Nunca'];
      return labels[parseInt(val)] || val;
    }
    return val.toString();
  };

  return (
    <div className="acuse-root" style={{ width: '210mm', margin: '0 auto', background: '#e5e7eb', padding: '15px 0' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', minHeight: '275mm', background: '#fff',
        margin: '0 auto', padding: '15mm 20mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', color: '#000', fontFamily: 'sans-serif',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {/* Header - Más Espacio */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #000', paddingBottom: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', position: 'relative' }}>
              <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 900, textTransform: 'uppercase' }}>Acuse de Evaluación NOM-035 (Individual)</h1>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>GUÍA DE REFERENCIA III | MÉTODO: DIGITAL | PERIODO 2026</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>{fechaEncuesta}</div>
          </div>
        </div>

        {/* 1. Datos Identificación - Más grandes */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', borderLeft: '4px solid #000', paddingLeft: '8px' }}>1. Información del Trabajador</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { l: 'Colaborador', v: emp.fullName || emp.full_name },
              { l: 'Código / Nómina', v: emp.code },
              { l: 'Puesto Actual', v: emp.position },
              { l: 'Departamento', v: emp.department },
              { l: 'Razón Social', v: companyInfo.razonSocial },
              { l: 'Fecha de Ingreso', v: fechaIngreso },
            ].map((item, i) => (
              <div key={i} style={{ padding: '8px 15px', borderBottom: i < 4 ? '1.5px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1.5px solid #e2e8f0' : 'none' }}>
                <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>{item.l}</div>
                <div style={{ fontSize: '10.5px', fontWeight: 700 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Resultados Globales - Más impacto */}
        <div style={{ marginBottom: '22px', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '20px' }}>
          <div style={{ border: '2.5px solid #000', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Puntaje Total</p>
            <div style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>{results.score.toFixed(0)}</div>
            <p style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', margin: '4px 0' }}>de 288 puntos</p>
            <div style={{ 
              fontSize: '11px', fontWeight: 900, padding: '4px 0', borderRadius: '6px', textTransform: 'uppercase', color: '#fff',
              backgroundColor: riskColor(results.riskLevel), marginTop: '6px'
            }}>
              RIESGO {results.riskLevel}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5px 0' }}>
            <h3 style={{ fontSize: '10.5px', fontWeight: 900, marginBottom: '6px', textTransform: 'uppercase' }}>Dictamen de Evaluación Técnica:</h3>
            <p style={{ fontSize: '10.5px', lineHeight: '1.5', color: '#1e293b', margin: 0, fontStyle: 'italic' }}>
              {getFormalDictamen(results.riskLevel, results.score, hasATS)}
            </p>
          </div>
        </div>

        {/* 3. Desglose Dominios - Más distribuidos */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', borderLeft: '4px solid #000', paddingLeft: '8px' }}>2. Análisis Técnico por Factores (Dominios)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {results.domains.map((d: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', 
                background: riskBg(d.riskLevel), border: `1.5px solid ${riskColor(d.riskLevel)}20`, borderRadius: '8px' 
              }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', maxWidth: '75%', lineHeight: 1.2 }}>{d.name}</span>
                <span style={{ fontSize: '9px', fontWeight: 900, color: riskColor(d.riskLevel) }}>{d.score} ({d.riskLevel})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Acciones y Contexto - Más aire */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '22px' }}>
          <div style={{ border: '1.5px solid #000', borderRadius: '10px', padding: '12px' }}>
            <h2 style={{ fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>3. Plan de Acción y Seguimiento</h2>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '10.5px', lineHeight: '1.5' }}>
              {getFormalActions(results.riskLevel, hasATS).map((action, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>{action}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: '#f8fafc' }}>
            <h2 style={{ fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>4. Contexto Legal</h2>
            <p style={{ margin: 0, fontSize: '9.5px', lineHeight: '1.5', color: '#475569' }}>
              Esta evaluación es <strong>confidencial y voluntaria</strong> conforme a la NOM-035. Los resultados se destinan a la mejora de condiciones laborales. El tratamiento de datos cumple con la Ley de Transparencia y Protección de Datos.
            </p>
          </div>
        </div>

        {/* 5. Conclusión Formal - Destacada */}
        <div style={{ marginBottom: '25px', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '10px', textAlign: 'justify', lineHeight: '1.5' }}>
              <strong>CERTIFICACIÓN DE RESULTADOS:</strong> El presente documento constituye la evidencia formal de la aplicación de los cuestionarios. Se certifica que el colaborador ha recibido copia de sus resultados y las medidas preventivas correspondientes según el riesgo detectado.
            </p>
        </div>

        {/* Firmas - Distribuidas abajo */}
        <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#64748b', marginTop: '3px' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>MIGUEL ÁNGEL TORRES</p>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#64748b', marginTop: '3px' }}>Responsable / Dpto. RRHH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Audit Final */}
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '8.5px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
          Válido para auditoría STPS. Registro Patronal: {companyInfo.registroPatronal} | Portal NOM-035 Digital 2026
        </div>

      </div>

      <style jsx>{`
        @media print {
          .acuse-root { padding: 0 !important; background: transparent !important; }
          .acuse-sheet { 
            padding: 10mm 15mm !important; 
            margin: 0 !important; 
            width: 100% !important; 
            height: 100vh !important;
            box-shadow: none !important; 
            break-inside: avoid !important;
            transform: scale(0.92) !important;
            transform-origin: top center !important;
          }
          .no-print { display: none !important; }
          body { margin: 0 !important; overflow: hidden !important; }
          @page { margin: 0 !important; size: A4; }
        }
      `}</style>

      {/* Solo Web */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          style={{ padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
        >
          {showDetails ? 'Cerrar Anexo' : 'Ver Respuestas Detalladas (Anexo Técnico)'}
        </button>
      </div>

      {showDetails && (
        <div className="details-anexo" style={{ width: '210mm', margin: '0 auto 50px auto', background: '#fff', padding: '30px 50px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 900, marginBottom: '20px', borderBottom: '2.5px solid #000', color: '#111827', paddingBottom: '8px' }}>ANEXO TÉCNICO COMPLETO: Respuestas Auditables</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <tbody>
              {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 0', color: '#1e293b', fontWeight: 600 }}>{q.text}</td>
                  <td style={{ padding: '10px 0', fontWeight: 900, textAlign: 'right', color: '#000', whiteSpace: 'nowrap' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
