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
    'Promover un entorno organizacional favorable y sentido de pertenencia.'
  ];
  
  if (level === 'Nulo' || level === 'Bajo') {
    actions.push('Mantener mecanismos de comunicación y sensibilización general.');
  } else if (level === 'Medio') {
    actions.push('Revisar la distribución de cargas de trabajo y jornadas laborales.');
    actions.push('Capacitación en liderazgo y apoyo social.');
  } else {
    actions.push('Intervención técnica inmediata y seguimiento psicológico.');
    actions.push('Referir a valoración médica especializada (Numeral 8.5).');
  }

  if (hasATS) {
    actions.push('CANALIZACIÓN MÉDICA OBLIGATORIA (Guía de Referencia I).');
  }

  return actions;
}

function getFormalDictamen(level: string, score: number, hasATS: boolean): string {
  const base = `Conforme a la NOM-035-STPS-2018, el puntaje de **${score.toFixed(0)}** sitúa al trabajador en un nivel de **RIESGO ${level.toUpperCase()}**. `;
  switch (level) {
    case 'Muy Alto': return base + 'Se requiere realizar un análisis pormenorizado e implementar medidas de intervención correctivas inmediatas.';
    case 'Alto': return base + 'Es necesario implementar un programa de intervención para mitigar los factores de riesgo detectados.';
    case 'Medio': return base + 'Se sugiere implementar capacitación, apoyo social y revisión de cargas de trabajo.';
    case 'Bajo': return base + 'Se requiere difusión de la política de prevención y sensibilización general.';
    default: return base + 'No requiere acciones de control específicas; continuar con el monitoreo actual.';
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
    <div className="acuse-root" style={{ width: '210mm', margin: '0 auto', background: '#f1f5f9', padding: '30px 0' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', minHeight: '290mm', background: '#fff',
        margin: '0 auto', padding: '20mm 20mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', 
        justifyContent: 'space-between', // EMPUJAR FIRMAS ABAJO
        color: '#000', fontFamily: 'sans-serif',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        
        {/* Bloque Superior de Contenido */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Header - Más grande y espaciado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '15px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', position: 'relative' }}>
                <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Acuse de Evaluación Individual NOM-035</h1>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>GUÍA DE REFERENCIA III | MÉTODO: DIGITAL | PERIODO 2026</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{fechaEncuesta}</div>
            </div>
          </div>

          {/* 1. Datos Identificación - Robustos */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', borderLeft: '5px solid #000', paddingLeft: '10px' }}>1. Información del Colaborador</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              {[
                { l: 'Nombre Completo', v: emp.fullName || emp.full_name },
                { l: 'Código / Nómina', v: emp.code },
                { l: 'Puesto Actual', v: emp.position },
                { l: 'Departamento', v: emp.department },
                { l: 'Empresa / Razón Social', v: companyInfo.razonSocial },
                { l: 'Fecha de Ingreso', v: fechaIngreso },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: i < 4 ? '1.5px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1.5px solid #e2e8f0' : 'none' }}>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{item.l}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700 }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Resultados Globales - Gran Impacto */}
          <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: '25px' }}>
            <div style={{ border: '3px solid #000', borderRadius: '15px', padding: '15px', textAlign: 'center', background: '#fff' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Puntaje Obtenido</p>
              <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1 }}>{results.score.toFixed(0)}</div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', margin: '5px 0' }}>de 288 puntos máximos</p>
              <div style={{ 
                fontSize: '12px', fontWeight: 900, padding: '6px 0', borderRadius: '8px', textTransform: 'uppercase', color: '#fff',
                backgroundColor: riskColor(results.riskLevel), marginTop: '8px'
              }}>
                RIESGO {results.riskLevel}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>Dictamen de Evaluación Técnica:</h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#1e293b', margin: 0, fontStyle: 'italic', textAlign: 'justify' }}>
                {getFormalDictamen(results.riskLevel, results.score, hasATS)}
              </p>
            </div>
          </div>

          {/* 3. Desglose Dominios - Expandidos */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', borderLeft: '5px solid #000', paddingLeft: '10px' }}>2. Análisis de Riesgo por Dominios</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {results.domains.map((d: any, i: number) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', 
                  background: riskBg(d.riskLevel), border: `2px solid ${riskColor(d.riskLevel)}30`, borderRadius: '10px' 
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', maxWidth: '75%', lineHeight: 1.2 }}>{d.name}</span>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: riskColor(d.riskLevel) }}>{d.score} ({d.riskLevel})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Acciones y Contexto - Llenado de espacio */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginBottom: '25px' }}>
            <div style={{ border: '2px solid #000', borderRadius: '12px', padding: '15px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px' }}>3. Plan de Acción y Medidas de Control</h2>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', lineHeight: '1.6' }}>
                {getFormalActions(results.riskLevel, hasATS).map((action, i) => (
                  <li key={i} style={{ marginBottom: '5px' }}>{action}</li>
                ))}
              </ul>
            </div>
            <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px' }}>4. Marco Legal</h2>
              <p style={{ margin: 0, fontSize: '10px', lineHeight: '1.6', color: '#475569', textAlign: 'justify' }}>
                Evaluación <strong>confidencial y voluntaria</strong> según NOM-035-STPS-2018. Resultados para mejora de condiciones laborales. El tratamiento de datos cumple con la Ley de Protección de Datos Personales.
              </p>
            </div>
          </div>

          {/* 5. Conclusión - Puño y Letra de Auditoría */}
          <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '10px', border: '2px solid #cbd5e1' }}>
              <p style={{ margin: 0, fontSize: '11px', textAlign: 'justify', lineHeight: '1.6' }}>
                <strong>CERTIFICACIÓN:</strong> Se hace constar que el trabajador ha sido informado de sus resultados individuales y de las medidas preventivas. Este documento es evidencia auditable de la participación y cumplimiento normativo.
              </p>
          </div>

        </div>

        {/* Firmas - PEGADAS AL FINAL DE LA HOJA POR JUSTIFY-BETWEEN */}
        <div style={{ paddingTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '100px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '2.5px solid #000', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '2.5px solid #000', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>MIGUEL ÁNGEL TORRES</p>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>Responsable / Dpto. RRHH</p>
              </div>
            </div>
          </div>
          {/* Footer Auditoría */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '9px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
            Documento Válido para Auditoría STPS | Registro Patronal: {companyInfo.registroPatronal} | © Sistema NOM-035 2026
          </div>
        </div>

      </div>

      <style jsx>{`
        @media print {
          .acuse-root { padding: 0 !important; background: transparent !important; }
          .acuse-sheet { 
            padding: 15mm 20mm !important; 
            margin: 0 !important; 
            width: 100% !important; 
            min-height: 296mm !important; 
            height: 296mm !important; 
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
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
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '30px' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          style={{ padding: '14px 28px', background: '#000', color: '#fff', borderRadius: '15px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}
        >
          {showDetails ? 'Cerrar Anexo' : 'Ver Respuestas Detalladas (Anexo Técnico)'}
        </button>
      </div>

      {showDetails && (
        <div className="details-anexo" style={{ width: '210mm', margin: '0 auto 50px auto', background: '#fff', padding: '40px 60px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '25px', borderBottom: '3px solid #000', color: '#111827', paddingBottom: '10px' }}>ANEXO TÉCNICO: Resultados del Cuestionario</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 0', color: '#1e293b', fontWeight: 600 }}>{q.text}</td>
                  <td style={{ padding: '12px 0', fontWeight: 900, textAlign: 'right', color: '#000', whiteSpace: 'nowrap' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
