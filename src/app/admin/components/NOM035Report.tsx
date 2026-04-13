'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { calculateNOM035, getATSDetails } from '@/lib/nom035/evaluator';
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
  
  if (level === 'Medio' || level === 'Alto' || level === 'Muy Alto') {
    actions.push('Implementar programa de intervención y seguimiento técnico.');
  }

  if (hasATS) {
    actions.push('CANALIZACIÓN MÉDICA OBLIGATORIA (Evaluación clínica especializada).');
  }

  return actions;
}

function getFormalDictamen(level: string, score: number, hasATS: boolean): string {
  const base = `De acuerdo con la NOM-035-STPS-2018, el puntaje de **${score.toFixed(0)}** indica un nivel de **RIESGO ${level.toUpperCase()}**. `;
  if (hasATS) {
    return base + 'Se requiere atención clínica inmediata debido a la detección de sintomatología de Acontecimiento Traumático Severo.';
  }
  return base + 'Se recomienda seguir las medidas preventivas registradas en el Plan de Acción.';
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
  const ats = getATSDetails(survey.answers);

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
    <div className="acuse-root" style={{ width: '210mm', margin: '0 auto', background: '#f1f5f9', padding: '30px 0' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', minHeight: '290mm', background: '#fff',
        margin: '0 auto', padding: '15mm 20mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', 
        justifyContent: 'space-between', 
        color: '#000', fontFamily: 'sans-serif',
        position: 'relative', overflow: 'hidden'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 900, textTransform: 'uppercase' }}>Acuse de Evaluación Individual NOM-035</h1>
                <p style={{ margin: 0, fontSize: '9.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>GUÍA DE REFERENCIA III | MÉTODO: DIGITAL</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>{fechaEncuesta}</div>
            </div>
          </div>

          {/* 1. Datos Identificación */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', borderLeft: '5px solid #000', paddingLeft: '8px' }}>1. Información del Trabajador</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              {[
                { l: 'Colaborador', v: emp.fullName || emp.full_name },
                { l: 'Código / Nómina', v: emp.code },
                { l: 'Puesto Actual', v: emp.position },
                { l: 'Departamento', v: emp.department },
                { l: 'Razón Social', v: companyInfo.razonSocial },
                { l: 'Fecha de Ingreso', v: fechaIngreso },
              ].map((item, i) => (
                <div key={i} style={{ padding: '8px 15px', borderBottom: i < 4 ? '1.5px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1.5px solid #e2e8f0' : 'none' }}>
                  <div style={{ fontSize: '8px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{item.l}</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700 }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Resultados Guía I (ATS) - SOLICITADO */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', borderLeft: '5px solid #000', paddingLeft: '8px' }}>2. Evaluación Guía I (Acontecimiento Traumático)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '10px' }}>
              <div style={{ padding: '10px', background: ats.hasEvent ? '#fecaca' : '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '8px', fontWeight: 800 }}>¿EVENTO TRAUMÁTICO?</div>
                <div style={{ fontSize: '12px', fontWeight: 900 }}>{ats.hasEvent ? 'SÍ DETECTADO' : 'NO DETECTADO'}</div>
              </div>
              <div style={{ padding: '10px', background: ats.requiresEvaluation ? '#ef4444' : '#22c55e', borderRadius: '8px', textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '8px', fontWeight: 800 }}>RESULTADO FINAL</div>
                <div style={{ fontSize: '12px', fontWeight: 900 }}>{ats.requiresEvaluation ? 'REQ. VALORACIÓN' : 'APTO / ESTABLE'}</div>
              </div>
              <div style={{ fontSize: '9px', lineHeight: '1.3', padding: '5px' }}>
                <strong>Desglose de síntomas:</strong><br />
                Recuerdos: {ats.recollections ? 'SÍ' : 'NO'} | 
                Evitación: {ats.avoidanceCount}/7 | 
                Afectación: {ats.arousalCount}/5
              </div>
            </div>
          </div>

          {/* 3. Resultados Guía III */}
          <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '170px 1fr', gap: '20px' }}>
            <div style={{ border: '3px solid #000', borderRadius: '15px', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Puntaje Guía III</p>
              <div style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1 }}>{results.score.toFixed(0)}</div>
              <div style={{ 
                fontSize: '11px', fontWeight: 900, padding: '4px 0', borderRadius: '8px', textTransform: 'uppercase', color: '#fff',
                backgroundColor: riskColor(results.riskLevel), marginTop: '6px'
              }}>
                RIESGO {results.riskLevel}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 900, marginBottom: '6px', textTransform: 'uppercase' }}>Dictamen Técnico Integral:</h3>
              <p style={{ fontSize: '11.5px', lineHeight: '1.5', color: '#1e293b', margin: 0, fontStyle: 'italic' }}>
                {getFormalDictamen(results.riskLevel, results.score, ats.requiresEvaluation)}
              </p>
            </div>
          </div>

          {/* 4. Desglose Dominios */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', borderLeft: '5px solid #000', paddingLeft: '8px' }}>3. Análisis de Factores de Riesgo (Dominios)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {results.domains.map((d: any, i: number) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', 
                  background: riskBg(d.riskLevel), border: `1.5px solid ${riskColor(d.riskLevel)}30`, borderRadius: '8px' 
                }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#334155', maxWidth: '75%', lineHeight: 1.2 }}>{d.name}</span>
                  <span style={{ fontSize: '8.5px', fontWeight: 900, color: riskColor(d.riskLevel) }}>{d.score} ({d.riskLevel})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Acciones y Legal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ border: '2px solid #000', borderRadius: '12px', padding: '12px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>4. Plan de Acción Recomendado</h2>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', lineHeight: '1.5' }}>
                {getFormalActions(results.riskLevel, ats.requiresEvaluation).map((action, i) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{action}</li>
                ))}
              </ul>
            </div>
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '12px', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>5. Contexto Legal</h2>
              <p style={{ margin: 0, fontSize: '9px', lineHeight: '1.5', color: '#475569' }}>
                Evaluación confidencial y voluntaria conforme a la NOM-035. Resultados para mejora de condiciones laborales. El tratamiento de datos cumple con la LFPDPPP.
              </p>
            </div>
          </div>

          <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '10px', textAlign: 'justify' }}>
              <strong>CERTIFICACIÓN:</strong> Se hace constar que el colaborador ha recibido copia de sus resultados individuales y de las medidas preventivas. Documento auditable.
            </p>
          </div>
        </div>

        {/* Firmas */}
        <div style={{ paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '80px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#64748b' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>MARÍA FERNANDA MEJÍA BAUTISTA</p>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#64748b' }}>Responsable / RRHH</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '8px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
            Válido para auditoría STPS | Registro Patronal: {companyInfo.registroPatronal} | © Sistema NOM-035 2026
          </div>
        </div>

      </div>

      {/* ANEXO TÉCNICO - AHORA SE IMPRIME EN SEGUNDA HOJA */}
      <div className="details-anexo" style={{ 
        width: '210mm', margin: '40px auto', background: '#fff', 
        padding: '20px 40px', borderRadius: '16px', border: '1.5px solid #e2e8f0',
        pageBreakBefore: 'always' 
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, marginBottom: '20px', borderBottom: '3.5px solid #000', color: '#111827', paddingBottom: '8px' }}>ANEXO TÉCNICO: Respuestas Auditables (Guía I y III)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            {/* Respuestas Guía III */}
            <tr><td colSpan={2} style={{ padding: '15px 0 5px 0', fontSize: '12px', fontWeight: 900, borderBottom: '1.5px solid #000' }}>CUESTIONARIO GUÍA III</td></tr>
            {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 0', color: '#1e293b', fontWeight: 600 }}>{q.text}</td>
                <td style={{ padding: '8px 0', fontWeight: 900, textAlign: 'right', color: '#000', whiteSpace: 'nowrap' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media print {
          .acuse-root { padding: 0 !important; background: transparent !important; }
          .acuse-sheet { 
            padding: 10mm 15mm !important; 
            margin: 0 !important; 
            width: 100% !important; 
            height: 275mm !important; 
            min-height: 275mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-shadow: none !important; 
            break-inside: avoid !important;
            zoom: 0.95;
            page-break-after: avoid !important;
          }
          .details-anexo {
            display: none !important;
          }
          .no-print { display: none !important; }
          body { margin: 0 !important; overflow: hidden !important; }
          @page { margin: 0 !important; size: A4; }
        }
      `}</style>
    </div>
  );
}
