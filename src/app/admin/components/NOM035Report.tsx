'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { calculateNOM035, getATSDetails, calculateOrganizationalRisk } from '@/lib/nom035/evaluator';
import { GUIDE_III, Question } from '@/lib/nom035/questions';

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
  const orgRisk = results ? calculateOrganizationalRisk(results, emp.position) : null;

  if (!results) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto', background: '#fee2e2', color: '#991b1b', border: '2px solid #ef4444', borderRadius: '12px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 900, textTransform: 'uppercase' }}>⚠️ Evaluación Incompleta</h2>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          Este colaborador tiene respuestas faltantes o inválidas en la Guía III de la NOM-035. <br/>
          Por razones de integridad matemática y legal, <strong>no es posible generar un dictamen de riesgo</strong>.
        </p>
      </div>
    );
  }

  const rawCompany = (emp.company || '').toUpperCase();
  const isLola = rawCompany.includes('LOLA');
  const isBosbes = rawCompany.includes('BOSBES');
  
  // Si no es ninguna, intentamos por departamento o default a LOLA
  const compKey = isLola ? 'LOLA' : (isBosbes ? 'BOSBES' : 'LOLA');
  const companyInfo = COMPANY_DATA[compKey];

  const fechaEncuesta = new Date(survey.completed_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const entryDate = emp.entryDate || emp.entry_date;
  const fechaIngreso = entryDate ? new Date(entryDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

  const getAnswerLabel = (q: Question, val: any) => {
    if (val === undefined || val === null) return 'N/A';
    if (q.type === 'yesno') return val === 'si' ? 'SÍ' : 'NO';
    if (q.type === 'likert') {
      const labels = ['Nunca', 'Casi nunca', 'Algunas veces', 'Casi siempre', 'Siempre'];
      return labels[parseInt(val)] || val;
    }
    return val.toString();
  };

  const lbl: React.CSSProperties = { fontSize: '7px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' };
  const val: React.CSSProperties = { fontSize: '10px', fontWeight: 700, lineHeight: 1.2 };
  const secTitle: React.CSSProperties = { fontSize: '9px', fontWeight: 900, marginBottom: '5px', textTransform: 'uppercase', borderLeft: '4px solid #000', paddingLeft: '6px', letterSpacing: '0.05em' };

  return (
    <div className="acuse-root" style={{ width: '210mm', margin: '0 auto', background: '#f1f5f9', padding: '20px 0' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', minHeight: '290mm', background: '#fff',
        margin: '0 auto', padding: '10mm 14mm', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: '#000', fontFamily: 'Arial, sans-serif', fontSize: '10px',
      }}>

        <div>
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #000', paddingBottom: '7px', marginBottom: '9px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}>
                <img src={companyInfo.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>Acuse de Evaluación Individual NOM-035-STPS-2018</h1>
                <p style={{ margin: 0, fontSize: '7.5px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Guía de Referencia III | Método Digital | {companyInfo.razonSocial}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 900 }}>FOLIO: <span style={{ color: '#2563eb' }}>{survey.id.toString().padStart(6, '0')}</span></div>
              <div style={{ fontSize: '7.5px', color: '#64748b' }}>{fechaEncuesta}</div>
            </div>
          </div>

          {/* 1. DATOS DEL TRABAJADOR */}
          <div style={{ marginBottom: '8px' }}>
            <div style={secTitle}>1. Datos del Trabajador y Centro de Trabajo</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1.5px solid #e2e8f0', borderRadius: '7px', overflow: 'hidden' }}>
              {([
                { l: 'Nombre Completo', v: emp.fullName || emp.full_name, col: 'span 2' },
                { l: 'Código / Nómina',   v: emp.code },
                { l: 'Fecha de Ingreso',  v: fechaIngreso },
                { l: 'Puesto',            v: emp.position, col: 'span 2' },
                { l: 'Departamento',      v: emp.department },
                { l: 'Sexo',              v: survey.answers['v_genero'] === 'M' ? 'Masculino' : survey.answers['v_genero'] === 'F' ? 'Femenino' : 'N/A' },
                { l: 'Razón Social',      v: companyInfo.razonSocial, col: 'span 2' },
                { l: 'RFC Empresa',       v: companyInfo.rfc },
                { l: 'Reg. Patronal IMSS',v: companyInfo.registroPatronal },
                { l: 'Edad',              v: survey.answers['v_edad'] ? `${survey.answers['v_edad']} años` : 'N/A', col: 'span 4' },
              ] as { l: string; v: string; col?: string }[]).map((item, i, arr) => (
                <div key={i} style={{ padding: '5px 9px', gridColumn: item.col, borderBottom: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none', borderRight: '1px solid #e2e8f0' }}>
                  <div style={lbl}>{item.l}</div>
                  <div style={val}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. GUÍA I */}
          <div style={{ marginBottom: '8px' }}>
            <div style={secTitle}>2. Evaluación Guía I — Acontecimiento Traumático Severo (ATS)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '6px' }}>
              <div style={{ padding: '6px 8px', background: ats.hasEvent ? '#fecaca' : '#f0fdf4', borderRadius: '6px', textAlign: 'center' }}>
                <div style={lbl}>¿Evento traumático?</div>
                <div style={{ fontSize: '10px', fontWeight: 900 }}>{ats.hasEvent ? 'SÍ DETECTADO' : 'NO DETECTADO'}</div>
              </div>
              <div style={{ padding: '6px 8px', background: ats.requiresEvaluation ? '#ef4444' : '#22c55e', borderRadius: '6px', textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '7px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>Resultado Final Guía I</div>
                <div style={{ fontSize: '10px', fontWeight: 900 }}>{ats.requiresEvaluation ? 'REQ. VALORACIÓN' : 'APTO / ESTABLE'}</div>
              </div>
              <div style={{ fontSize: '8px', lineHeight: '1.4', padding: '5px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                <span><strong>Desglose:</strong> Recuerdos: {ats.recollections ? 'Sí' : 'No'} | Evitación: {ats.avoidanceCount}/7 | Afectación: {ats.arousalCount}/5</span>
              </div>
            </div>
          </div>

          {/* 3. DICTAMEN GUÍA III */}
          <div style={{ marginBottom: '8px' }}>
            <div style={secTitle}>3. Dictamen de Riesgo Psicosocial — Guía III (NOM-035-STPS-2018)</div>
            <div style={{ display: 'grid', gridTemplateColumns: orgRisk?.isAdjusted ? '110px 95px 1fr' : '110px 1fr', gap: '8px', alignItems: 'start' }}>

              {/* Resultado oficial STPS */}
              <div style={{ border: '3px solid #000', borderRadius: '10px', padding: '8px 6px', textAlign: 'center', background: '#fff' }}>
                <div style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', color: '#000', letterSpacing: '0.04em', marginBottom: '1px' }}>⭐ Resultado Oficial</div>
                <div style={{ fontSize: '7px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>Para auditoría STPS</div>
                <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{results.score.toFixed(0)}</div>
                <div style={{ fontSize: '8.5px', fontWeight: 900, padding: '3px 0', borderRadius: '6px', textTransform: 'uppercase', color: '#fff', backgroundColor: riskColor(results.riskLevel), marginTop: '4px' }}>
                  RIESGO {results.riskLevel}
                </div>
              </div>

              {/* Resultado RRHH Ajustado – solo directivos */}
              {orgRisk?.isAdjusted && (
                <div style={{ border: '1.5px dashed #94a3b8', borderRadius: '10px', padding: '8px 6px', textAlign: 'center', background: '#f8fafc' }}>
                  <div style={{ fontSize: '7px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1px' }}>Análisis Interno RRHH</div>
                  <div style={{ fontSize: '7px', color: '#94a3b8', marginBottom: '2px' }}>Ajuste perfil directivo</div>
                  <div style={{ fontSize: '27px', fontWeight: 900, lineHeight: 1, color: '#475569' }}>{orgRisk.score.toFixed(0)}</div>
                  <div style={{ fontSize: '8px', fontWeight: 900, padding: '2px 0', borderRadius: '6px', textTransform: 'uppercase', color: '#fff', backgroundColor: riskColor(orgRisk.riskLevel), marginTop: '4px', opacity: 0.8 }}>
                    {orgRisk.riskLevel}
                  </div>
                </div>
              )}

              {/* Dictamen textual + nota normativa */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <p style={{ margin: 0, fontSize: '9px', lineHeight: '1.4', color: '#1e293b', fontStyle: 'italic' }}>
                  De acuerdo con la <strong>NOM-035-STPS-2018</strong>, el puntaje de <strong>{results.score.toFixed(0)}</strong> puntos indica un nivel de <strong>RIESGO {results.riskLevel.toUpperCase()}</strong>. {ats.requiresEvaluation ? 'Se requiere atención clínica inmediata.' : 'Se recomienda seguir el Plan de Acción establecido.'}
                </p>
                {orgRisk?.isAdjusted && (
                  <div style={{ padding: '5px 7px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '6px', fontSize: '7.5px', lineHeight: '1.4', color: '#78350f' }}>
                    <strong>⚠ NOTA NORMATIVA:</strong> El resultado "Análisis Interno RRHH" corresponde a un análisis organizacional interno y <strong>NO sustituye el resultado normativo</strong>. Para efectos de cumplimiento legal conforme a la <strong>NOM-035-STPS-2018</strong>, el nivel de riesgo aplicable es el determinado en el <strong>"Resultado Oficial STPS"</strong>.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. DOMINIOS */}
          <div style={{ marginBottom: '8px' }}>
            <div style={secTitle}>4. Análisis por Dominio de Riesgo</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px' }}>
              {results.domains.map((d: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 7px', background: riskBg(d.riskLevel), border: `1px solid ${riskColor(d.riskLevel)}25`, borderRadius: '5px' }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: '#334155', maxWidth: '74%', lineHeight: 1.2 }}>{d.name}</span>
                  <span style={{ fontSize: '8px', fontWeight: 900, color: riskColor(d.riskLevel), whiteSpace: 'nowrap' }}>{d.score} — {d.riskLevel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. PLAN + CONTEXTO LEGAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '7px', marginBottom: '7px' }}>
            <div style={{ border: '2px solid #000', borderRadius: '7px', padding: '7px' }}>
              <div style={{ ...secTitle, marginBottom: '3px' }}>5. Plan de Acción Recomendado</div>
              <ul style={{ margin: 0, paddingLeft: '13px', fontSize: '8.5px', lineHeight: '1.5' }}>
                {getFormalActions(orgRisk?.isAdjusted ? orgRisk.riskLevel : results.riskLevel, ats.requiresEvaluation).map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '7px', padding: '7px', background: '#f8fafc' }}>
              <div style={{ ...secTitle, marginBottom: '3px' }}>6. Contexto Legal</div>
              <p style={{ margin: 0, fontSize: '7.5px', lineHeight: '1.5', color: '#475569' }}>
                Evaluación confidencial y voluntaria conforme a la NOM-035-STPS-2018. El tratamiento de datos cumple con la LFPDPPP. Resultados destinados a la mejora de las condiciones laborales.
              </p>
            </div>
          </div>

          {/* CERTIFICACIÓN */}
          <div style={{ padding: '5px 9px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '7.5px', textAlign: 'justify', lineHeight: 1.4 }}>
              <strong>CERTIFICACIÓN:</strong> Se hace constar que el colaborador ha sido evaluado conforme a la NOM-035-STPS-2018 y ha recibido copia de sus resultados y de las medidas preventivas aplicables. Documento auditable ante la STPS.
            </p>
          </div>
        </div>

        {/* FIRMAS */}
        <div style={{ paddingTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '60px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '4px', marginTop: '28px' }}>
                <p style={{ margin: 0, fontSize: '8.5px', fontWeight: 900, textTransform: 'uppercase' }}>{emp.fullName || emp.full_name}</p>
                <p style={{ margin: 0, fontSize: '7.5px', fontWeight: 700, color: '#64748b' }}>Firma del Trabajador</p>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '4px', marginTop: '28px' }}>
                <p style={{ margin: 0, fontSize: '8.5px', fontWeight: 900, textTransform: 'uppercase' }}>MARÍA FERNANDA MEJÍA BAUTISTA</p>
                <p style={{ margin: 0, fontSize: '7.5px', fontWeight: 700, color: '#64748b' }}>Responsable / RRHH</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '7px', textAlign: 'center', fontSize: '6.5px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
            Válido para auditoría STPS | RFC: {companyInfo.rfc} | Reg. Patronal IMSS: {companyInfo.registroPatronal} | © Sistema NOM-035 2026
          </div>
        </div>
      </div>

      {/* ANEXO TÉCNICO — Solo pantalla */}
      <div className="details-anexo no-print" style={{
        width: '210mm', margin: '30px auto', background: '#fff',
        padding: '20px 30px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '16px', borderBottom: '3px solid #000', color: '#111827', paddingBottom: '6px' }}>ANEXO TÉCNICO: Respuestas Auditables (Guía III)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <tbody>
            <tr><td colSpan={2} style={{ padding: '10px 0 4px 0', fontSize: '11px', fontWeight: 900, borderBottom: '1.5px solid #000' }}>CUESTIONARIO GUÍA III</td></tr>
            {GUIDE_III.flatMap(s => s.questions).map((q, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6px 0', color: '#1e293b', fontWeight: 600 }}>{q.text}</td>
                <td style={{ padding: '6px 0', fontWeight: 900, textAlign: 'right', color: '#000', whiteSpace: 'nowrap' }}>{getAnswerLabel(q, survey.answers[q.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media print {
          /* En impresión individual, el acuse-root ocupa su página */
          .acuse-root {
            padding: 0 !important;
            background: transparent !important;
          }
          .acuse-sheet {
            padding: 8mm 12mm !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: unset !important;
            height: 282mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-shadow: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .no-print { display: none !important; }
          body { margin: 0 !important; }
          @page { margin: 0 !important; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}
