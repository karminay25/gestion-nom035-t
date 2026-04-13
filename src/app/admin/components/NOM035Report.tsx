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
    actions.push('Realizar programas de capacitación específica en liderazgo y apoyo social.');
  } else {
    actions.push('Implementar programa de intervención organizacional inmediato.');
    actions.push('Evaluar el entorno laboral mediante análisis y seguimiento técnico.');
    actions.push('Referir al trabajador a valoración médica especializada conforme a la Guía I.');
  }

  if (hasATS) {
    actions.push('CANALIZACIÓN CLÍNICA OBLIGATORIA al servicio médico / psicólogo (Numeral 8.5).');
  }

  return actions;
}

function getFormalDictamen(level: string, score: number, hasATS: boolean): string {
  const base = `De acuerdo con la NOM-035-STPS-2018, un puntaje de **${score.toFixed(0)}** corresponde a un nivel de **RIESGO ${level.toUpperCase()}**. `;
  switch (level) {
    case 'Muy Alto': return base + 'Se requiere realizar un análisis pormenorizado e implementar medidas de intervención correctivas inmediatas, referir al trabajador a valoración médica y realizar vigilancia periódica.';
    case 'Alto': return base + 'Es necesario realizar un análisis de los factores de riesgo e implementar un programa de intervención para mitigar las causas detectadas.';
    case 'Medio': return base + 'Se sugiere implementar programas de capacitación, apoyo social y revisión de cargas de trabajo para evitar la escalada del riesgo.';
    case 'Bajo': return base + 'Requiere la difusión de la política de prevención y sensibilización sobre el entorno organizacional favorable.';
    default: return base + 'No se requieren acciones de control específicas en este momento; se recomienda mantener el clima actual.';
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
        width: '210mm', minHeight: '260mm', background: '#fff',
        margin: '0 auto', padding: '10mm 15mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', color: '#000', fontFamily: 'sans-serif',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {/* Header - Enriquecido */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', position: 'relative' }}>
              <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>Acuse de Evaluación NOM-035 (Individual)</h1>
              <p style={{ margin: 0, fontSize: '8px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>MÉTODO: DIGITAL | GUÍA DE REFERENCIA III | PERIODO 2026</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
            <div style={{ fontSize: '8px', color: '#64748b' }}>{fechaEncuesta}</div>
          </div>
        </div>

        {/* 1. Datos Identificación */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, marginBottom: '5px', textTransform: 'uppercase', borderLeft: '3px solid #000', paddingLeft: '5px' }}>1. Información del Trabajador</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            {[
              { l: 'Colaborador', v: emp.fullName || emp.full_name },
              { l: 'Código / Nómina', v: emp.code },
              { l: 'Puesto', v: emp.position },
              { l: 'Departamento', v: emp.department },
              { l: 'Empresa', v: companyInfo.razonSocial },
              { l: 'Fecha de Ingreso', v: fechaIngreso },
            ].map((item, i) => (
              <div key={i} style={{ padding: '4px 10px', borderBottom: i < 4 ? '1px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ fontSize: '7px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{item.l}</div>
                <div style={{ fontSize: '9px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Resultados Globales */}
        <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '140px 1fr', gap: '15px' }}>
          <div style={{ border: '1.5px solid #000', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '7.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Puntaje Total</p>
            <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>{results.score.toFixed(0)}</div>
            <p style={{ fontSize: '7px', fontWeight: 700, color: '#94a3b8', margin: '2px 0' }}>de 288 puntos posibles</p>
            <div style={{ 
              fontSize: '9px', fontWeight: 900, padding: '2px 0', borderRadius: '4px', textTransform: 'uppercase', color: '#fff',
              backgroundColor: riskColor(results.riskLevel), marginTop: '4px'
            }}>
              RIESGO {results.riskLevel}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '9px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}>Dictamen de Evaluación:</h3>
            <p style={{ fontSize: '9px', lineHeight: '1.4', color: '#1e293b', margin: 0, fontStyle: 'italic' }}>
              {getFormalDictamen(results.riskLevel, results.score, hasATS)}
            </p>
          </div>
        </div>

        {/* 3. Desglose por Dominios - Enriquecido */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, marginBottom: '5px', textTransform: 'uppercase', borderLeft: '3px solid #000', paddingLeft: '5px' }}>2. Análisis Técnico por Dominios</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            {results.domains.map((d: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', 
                background: riskBg(d.riskLevel), border: `1px solid ${riskColor(d.riskLevel)}20`, borderRadius: '4px' 
              }}>
                <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#334155', maxWidth: '75%', lineHeight: 1.1 }}>{d.name}</span>
                <span style={{ fontSize: '8px', fontWeight: 900, color: riskColor(d.riskLevel) }}>{d.score} ({d.riskLevel})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Acciones y Contexto */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div style={{ border: '1px solid #000', borderRadius: '8px', padding: '10px' }}>
            <h2 style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>3. Plan de Acción Recomendado</h2>
            <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '8.5px', lineHeight: '1.3' }}>
              {getFormalActions(results.riskLevel, hasATS).map((action, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>{action}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', background: '#f8fafc' }}>
            <h2 style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>4. Contexto Legal</h2>
            <p style={{ margin: 0, fontSize: '8px', lineHeight: '1.4', color: '#475569' }}>
              Esta evaluación es de carácter <strong>confidencial y voluntaria</strong>. Los resultados tienen como único fin la mejora de las condiciones de trabajo y el cumplimiento de la NOM-035-STPS-2018. El tratamiento de los datos cumple con la Ley Federal de Protección de Datos Personales.
            </p>
          </div>
        </div>

        {/* 5. Conclusión Formal */}
        <div style={{ marginBottom: '15px', padding: '8px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '9px', textAlign: 'justify', lineHeight: '1.4' }}>
              <strong>Conclusión:</strong> El presente reporte constituye la evidencia técnica de la aplicación de los cuestionarios de identificación de factores de riesgo psicosocial. Se confirma que el trabajador ha sido informado de sus resultados y de las medidas preventivas que la empresa seguirá de acuerdo con el nivel de riesgo detectado.
            </p>
        </div>

        {/* Firmas - Enriquecidas */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '5px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: 700, color: '#64748b' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '5px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>MIGUEL ÁNGEL TORRES</p>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: 700, color: '#64748b' }}>Responsable de RRHH / Salud Rep.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Audit Compacto */}
        <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '7px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
          Documento Válido para Auditoría STPS. Registro Patronal: {companyInfo.registroPatronal} | © Sistema NOM-035 Digital
        </div>

      </div>

      <style jsx>{`
        @media print {
          .acuse-root { padding: 0 !important; background: transparent !important; }
          .acuse-sheet { 
            padding: 8mm 12mm !important; 
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
          style={{ padding: '10px 20px', background: '#000', color: '#fff', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
        >
          {showDetails ? 'Ocultar Detalles' : 'Ver Respuestas Detalladas (Anexo Técnico)'}
        </button>
      </div>

      {showDetails && (
        <div className="details-anexo" style={{ width: '210mm', margin: '0 auto 50px auto', background: '#fff', padding: '20px 40px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 900, marginBottom: '15px', borderBottom: '2px solid #000', color: '#111827' }}>ANEXO TÉCNICO: Respuestas del Cuestionario</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <tbody>
              {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', color: '#1e293b', fontWeight: 600 }}>{q.text}</td>
                  <td style={{ padding: '8px 0', fontWeight: 900, textAlign: 'right', color: '#000', whiteSpace: 'nowrap' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
