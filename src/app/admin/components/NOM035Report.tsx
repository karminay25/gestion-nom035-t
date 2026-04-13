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
  const base = `Evaluación integral basada en la NOM-035-STPS-2018. El colaborador presenta un puntaje total de ${score.toFixed(0)} unidades, lo que representa un **RIESGO ${level.toUpperCase()}**. `;
  let msg = '';
  switch (level) {
    case 'Nulo': msg = 'No se requiere intervención; mantener clima laboral.'; break;
    case 'Bajo': msg = 'Acciones preventivas de sensibilización recomendadas.'; break;
    case 'Medio': msg = 'Se recomienda implementar un programa de intervención específico.'; break;
    case 'Alto': msg = 'Intervención necesaria y revisión de factores de riesgo.'; break;
    case 'Muy Alto': msg = 'Atención inmediata y programa integral de mitigación.'; break;
  }
  if (hasATS) msg += ' Se detectó sintomatología de Acontecimiento Traumático Severo (Guía I).';
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
        width: '210mm', minHeight: '290mm', background: '#fff',
        margin: '0 auto', padding: '15mm 15mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', color: '#000', fontFamily: 'sans-serif'
      }}>
        
        {/* Header - Institucional */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ width: '55px', height: '55px', position: 'relative' }}>
              <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Acuse de Evaluación Individual</h1>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Norma Oficial Mexicana NOM-035-STPS-2018</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>FECHA: {fechaEncuesta}</div>
          </div>
        </div>

        {/* Bloque Legal */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '9.5px', lineHeight: '1.4', color: '#334155' }}>
          En cumplimiento con los numerales 7.1 y 7.2 de la Norma Oficial Mexicana <strong>NOM-035-STPS-2018</strong>, se hace entrega de los resultados individuales obtenidos mediante la aplicación de la Guía de Referencia III. Esta información es de carácter confidencial y tiene como fin la identificación y prevención de factores de riesgo psicosocial.
        </div>

        {/* 1. Datos del Trabajador */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '10px' }}>1. Identificación del Colaborador</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { l: 'Nombre Completo', v: emp.fullName || emp.full_name },
              { l: 'Código / Nómina', v: emp.code },
              { l: 'Puesto Actual', v: emp.position },
              { l: 'Departamento', v: emp.department },
              { l: 'Empresa', v: companyInfo.razonSocial },
              { l: 'Fecha de Ingreso', v: fechaIngreso },
            ].map((item, i) => (
              <div key={i} style={{ padding: '8px 12px', borderBottom: i < 4 ? '1px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ fontSize: '8px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>{item.l}</div>
                <div style={{ fontSize: '10px', fontWeight: 700 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Resultados Globales */}
        <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px' }}>
          <div style={{ border: '2px solid #000', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Riesgo Organizacional</p>
            <div style={{ fontSize: '40px', fontWeight: 900, lineHeight: 1, marginBottom: '8px' }}>{results.score.toFixed(0)}</div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 900, 
              padding: '4px 10px', 
              borderRadius: '6px', 
              textTransform: 'uppercase', 
              color: '#fff',
              backgroundColor: riskColor(results.riskLevel)
            }}>
              {results.riskLevel}
            </div>
            <p style={{ fontSize: '8px', color: '#94a3b8', marginTop: '10px', fontWeight: 700 }}>Puntaje Bruto Tot. (Máx. 288)</p>
          </div>
          <div style={{ padding: '10px 0' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Dictamen Técnico:</h3>
            <p style={{ fontSize: '10px', lineHeight: '1.5', color: '#1e293b' }}>
              {getFormalConclusion(results.riskLevel, results.score, hasATS)}
            </p>
          </div>
        </div>

        {/* 3. Análisis por Dominios */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '10px' }}>2. Análisis de Factores de Riesgo (Dominios)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {results.domains.map((d: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '10px 12px', 
                background: riskBg(d.riskLevel), 
                border: `1px solid ${riskColor(d.riskLevel)}20`, 
                borderRadius: '8px' 
              }}>
                <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#334155', maxWidth: '70%', lineHeight: 1.2 }}>{d.name}</span>
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  color: riskColor(d.riskLevel),
                  textTransform: 'uppercase'
                }}>{d.riskLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Medidas y Compromisos */}
        <div style={{ border: '1px solid #000', borderRadius: '12px', padding: '15px', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>3. Acciones de Prevención y Control</h2>
          <p style={{ fontSize: '10px', marginBottom: '10px', fontStyle: 'italic', fontWeight: 600 }}>Basado en el nivel de riesgo detectado, la organización se compromete a:</p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '10px', lineHeight: '1.6' }}>
            <li>Difundir y revisar la Política de Prevención de Riesgos Psicosociales.</li>
            <li>Proporcionar mecanismos seguros para la recepción de quejas o sugerencias.</li>
            {results.riskLevel !== 'Nulo' && results.riskLevel !== 'Bajo' && (
              <>
                <li>Realizar una revisión técnica de la carga de trabajo y jornadas laborales.</li>
                <li>Implementar programas de capacitación en liderazgo y apoyo social.</li>
              </>
            )}
            {hasATS && <li style={{ color: '#b91c1c', fontWeight: 900 }}>REFERENCIA MÉDICA: Canalizar al trabajador para valoración clínica especializada.</li>}
          </ul>
        </div>

        {/* Firmas Espaciadas al Final */}
        <div style={{ marginTop: 'auto', paddingTop: '40px', paddingBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 260px', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #000', marginTop: '40px', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#64748b' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #000', marginTop: '40px', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>RECURSOS HUMANOS</p>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#64748b' }}>Sello y Firma de Recepción</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Audit */}
        <footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: '8px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
          Documento válido para auditoría STPS conforme a NOM-035-STPS-2018. Registro Patronal: {companyInfo.registroPatronal}.
        </footer>

      </div>

      <style jsx>{`
        @media print {
          .acuse-root { padding: 0 !important; background: transparent !important; }
          .acuse-sheet { padding: 15mm 15mm !important; margin: 0 !important; width: 100% !important; min-height: 297mm !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          body { margin: 0 !important; }
        }
      `}</style>

      {/* Solo Web - Ver Detalles */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '30px' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          style={{ 
            padding: '12px 24px', 
            background: '#000', 
            color: '#fff', 
            borderRadius: '12px', 
            fontSize: '13px', 
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {showDetails ? 'Ver Dictamen (Vista Previa)' : 'Ver Respuestas Detalladas (Anexo)'}
        </button>
      </div>

      {showDetails && (
        <div className="details-anexo" style={{ width: '210mm', margin: '0 auto 50px auto', background: '#fff', padding: '20px 40px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>ANEXO TÉCNICO: Respuestas del Cuestionario</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <tbody>
              {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>{q.text}</td>
                  <td style={{ padding: '8px 0', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
