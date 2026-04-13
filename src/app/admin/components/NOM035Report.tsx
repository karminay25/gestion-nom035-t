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

function getFormalConclusion(level: string, score: number, hasATS: boolean): string {
  const base = `Resultados basados en la NOM-035-STPS-2018. El colaborador presenta un puntaje de ${score.toFixed(0)} unidades (${level.toUpperCase()}). `;
  let msg = '';
  switch (level) {
    case 'Nulo': msg = 'No requiere intervención.'; break;
    case 'Bajo': msg = 'Acciones preventivas recomendadas.'; break;
    case 'Medio': msg = 'Implementar programa de intervención.'; break;
    case 'Alto': msg = 'Intervención necesaria y control de riesgos.'; break;
    case 'Muy Alto': msg = 'Atención inmediata y prioritaria.'; break;
  }
  if (hasATS) msg += ' Canalización médica obligatoria (Guía I).';
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
    <div className="acuse-root" style={{ width: '210mm', margin: '0 auto', background: '#e5e7eb', padding: '20px 0' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', height: '272mm', background: '#fff',
        margin: '0 auto', padding: '10mm 15mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', color: '#000', fontFamily: 'sans-serif',
        overflow: 'hidden', position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '45px', height: '45px', position: 'relative' }}>
              <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 900, textTransform: 'uppercase' }}>Acuse de Evaluación Individual</h1>
              <p style={{ margin: 0, fontSize: '9px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Norma NOM-035-STPS-2018</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
            <div style={{ fontSize: '8.5px', color: '#64748b' }}>{fechaEncuesta}</div>
          </div>
        </div>

        {/* Info Legal Compacta */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', fontSize: '9px', lineHeight: '1.3', color: '#334155' }}>
          Reporte confidencial de factores de riesgo psicosocial según los numerales 7.1 y 7.2 de la NOM-035.
        </div>

        {/* 1. Datos Trabajador */}
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #000', paddingLeft: '6px', marginBottom: '8px' }}>1. Información General</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            {[
              { l: 'Nombre', v: emp.fullName || emp.full_name },
              { l: 'Código', v: emp.code },
              { l: 'Puesto', v: emp.position },
              { l: 'Departamento', v: emp.department },
              { l: 'Razón Social', v: companyInfo.razonSocial },
              { l: 'Antigüedad', v: fechaIngreso },
            ].map((item, i) => (
              <div key={i} style={{ padding: '6px 10px', borderBottom: i < 4 ? '1px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{item.l}</div>
                <div style={{ fontSize: '9.5px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Resultados */}
        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '15px' }}>
          <div style={{ border: '2px solid #000', borderRadius: '10px', padding: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '8px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Riesgo Global</p>
            <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{results.score.toFixed(0)}</div>
            <div style={{ 
              fontSize: '10px', fontWeight: 900, padding: '3px 0', borderRadius: '4px', textTransform: 'uppercase', color: '#fff',
              backgroundColor: riskColor(results.riskLevel), marginTop: '6px'
            }}>
              {results.riskLevel}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '9.5px', lineHeight: '1.4', color: '#1e293b', margin: 0 }}>
              <strong>Dictamen:</strong> {getFormalConclusion(results.riskLevel, results.score, hasATS)}
            </p>
          </div>
        </div>

        {/* 3. Dominios */}
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #000', paddingLeft: '6px', marginBottom: '8px' }}>2. Desglose por Dominios</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            {results.domains.map((d: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', 
                background: riskBg(d.riskLevel), border: `1px solid ${riskColor(d.riskLevel)}20`, borderRadius: '6px' 
              }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#334155', maxWidth: '70%', lineHeight: 1.1 }}>{d.name}</span>
                <span style={{ fontSize: '8px', fontWeight: 900, color: riskColor(d.riskLevel), textTransform: 'uppercase' }}>{d.riskLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Medidas */}
        <div style={{ border: '1px solid #000', borderRadius: '10px', padding: '12px', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>3. Acciones de Control</h2>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '9.5px', lineHeight: '1.4' }}>
            <li>Difundir la política de prevención de riesgos psicosociales.</li>
            <li>Promover mecanismos de comunicación segura y confidencial.</li>
            {results.riskLevel !== 'Nulo' && results.riskLevel !== 'Bajo' && (
              <li>Vigilancia de factores de riesgo y capacitación en liderazgo.</li>
            )}
            {hasATS && <li style={{ color: '#b91c1c', fontWeight: 900 }}>CANALIZACIÓN MÉDICA OBLIGATORIA (GUÍA I).</li>}
          </ul>
        </div>

        {/* Firmas Espaciadas al Final */}
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '6px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: 700, color: '#64748b' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '6px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>RECURSOS HUMANOS</p>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: 700, color: '#64748b' }}>Sello y Firma de Recepción</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Audit */}
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '7.5px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
          Documento válido para auditoría STPS. Registro Patronal: {companyInfo.registroPatronal}.
        </div>

      </div>

      <style jsx>{`
        @media print {
          .acuse-root { padding: 0 !important; background: transparent !important; page-break-after: always !important; break-after: page !important; }
          .acuse-sheet { padding: 10mm 15mm !important; margin: 0 !important; width: 100% !important; min-height: 296mm !important; height: auto !important; box-shadow: none !important; break-inside: avoid !important; }
          .no-print { display: none !important; }
          body { margin: 0 !important; }
          @page { margin: 0 !important; }
        }
      `}</style>

      {/* Solo Web */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '30px' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          style={{ padding: '10px 20px', background: '#000', color: '#fff', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
        >
          {showDetails ? 'Ver Dictamen' : 'Ver Detalles (Anexo)'}
        </button>
      </div>

      {showDetails && (
        <div className="details-anexo" style={{ width: '210mm', margin: '0 auto 50px auto', background: '#fff', padding: '20px 40px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '10px', borderBottom: '2px solid #000' }}>ANEXO TÉCNICO</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
            <tbody>
              {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>{q.text}</td>
                  <td style={{ padding: '6px 0', fontWeight: 800, textAlign: 'right' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
