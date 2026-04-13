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
        tipo: 'Medidas de Prevención (Nivel de Riesgo Nulo)',
        items: [
          'Mantener la difusión de la política de prevención de riesgos psicosociales.',
          'Seguir promoviendo un entorno organizacional favorable.',
          'Fomentar la comunicación abierta y el reconocimiento al desempeño.'
        ]
      };
    case 'Bajo':
      return {
        tipo: 'Acciones de Control Preventivo (Nivel de Riesgo Bajo)',
        items: [
          'Reforzar la política de prevención en las áreas con mayores puntajes.',
          'Realizar pláticas de sensibilización sobre violencia laboral y apoyo social.',
          'Mantener vigilancia periódica de los factores de riesgo detectados.'
        ]
      };
    case 'Medio':
      return {
        tipo: 'Acciones de Control (Nivel de Riesgo Medio)',
        items: [
          'Revisar la distribución de cargas de trabajo y condiciones de tiempo.',
          'Implementar mecanismos de participación proactiva y comunicación horizontal.',
          'Capacitar a mandos medios en técnicas de liderazgo y manejo de personal.',
          'Documentar el avance de las medidas en un programa de intervención específico.'
        ]
      };
    case 'Alto':
    case 'Muy Alto':
      return {
        tipo: 'Acciones de Intervención Prioritarias (Riesgo Alto/Muy Alto)',
        items: [
          'Realizar un análisis pormenorizado de los dominios con riesgo alto.',
          'Referir al trabajador a valoración médica o psicológica con un especialista (Nivel 1).',
          'Implementar un programa de intervención a nivel organizacional o grupal (Nivel 2/3).',
          'Establecer controles inmediatos sobre las cargas de trabajo y la violencia laboral.'
        ]
      };
    default:
      return { tipo: 'Acciones Generales', items: ['Seguir lo dispuesto en la Norma Oficial Mexicana NOM-035-STPS-2018.'] };
  }
}

function getFormalConclusion(level: string, score: number, hasATS: boolean): string {
  const base = `De acuerdo con la evaluación realizada bajo los criterios de la NOM-035-STPS-2018, el colaborador obtuvo un puntaje de ${score} unidades, lo cual lo sitúa en un nivel de **RIESGO ${level.toUpperCase()}**. `;
  
  let msg = '';
  switch (level) {
    case 'Nulo': msg = 'Los factores de riesgo detectados no requieren acciones de control específicas, se recomienda mantener el entorno organizacional favorable.'; break;
    case 'Bajo': msg = 'Se requiere una mayor difusión de las políticas de prevención y acciones de sensibilización general.'; break;
    case 'Medio': msg = 'Es necesario implementar un programa de intervención que incluya la revisión de cargas de trabajo y capacitación en liderazgo.'; break;
    case 'Alto': msg = 'Se requiere de manera urgente un análisis de los factores detectados y la implementación de medidas correctivas.'; break;
    case 'Muy Alto': msg = 'Se requiere una intervención inmediata y prioritaria para mitigar los riesgos críticos detectados en la organización.'; break;
  }

  if (hasATS) {
    msg += ' Adicionalmente, se detectó la presencia de un Acontecimiento Traumático Severo (Guía I), por lo que se requiere canalización clínica obligatoria.';
  }

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
  
  const v_edad = survey.answers['v_edad'] || 'N/A';
  const v_genero = survey.answers['v_genero'] === 'M' ? 'Masculino' : (survey.answers['v_genero'] === 'F' ? 'Femenino' : 'N/A');

  const maxTotalScore = 288; // 72 preguntas * 4 puntos máximo

  const getAnswerLabel = (q: Question, val: any) => {
    if (val === undefined || val === null) return 'N/A';
    if (q.type === 'yesno') return val === 'si' ? 'SÍ' : 'NO';
    if (q.type === 'likert') {
      const labels = ['Siempre', 'Casi siempre', 'Algunas veces', 'Casi nunca', 'Nunca'];
      const index = parseInt(val);
      return labels[index] || val;
    }
    return val.toString();
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '9.5px', fontWeight: 900, color: '#111827', 
    textTransform: 'uppercase', letterSpacing: '0.04em',
    marginBottom: '8px', borderLeft: '3px solid #111827',
    paddingLeft: '8px'
  };

  const labelStyles: React.CSSProperties = {
    color: '#6b7280', fontSize: '6.5px', fontWeight: 800, 
    textTransform: 'uppercase', marginBottom: '1px'
  };

  const valueStyles: React.CSSProperties = {
    fontWeight: 700, color: '#111827', fontSize: '9px'
  };

  return (
    <div className="acuse-root" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', height: '297mm', margin: '0 auto', background: '#fff',
        padding: '10mm 15mm', boxSizing: 'border-box',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Folio Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #f3f4f6', paddingBottom: '5px', marginBottom: '12px' }}>
          <div>NOM-035-STPS-2018 | Diagnóstico Individual Reglamentario</div>
          <div style={{ fontWeight: 800 }}>MÉTODO: DIGITAL | AÑO: 2026</div>
        </div>

        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ width: '55px', height: '55px', position: 'relative' }}>
              <Image src={companyInfo.logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                Acuse de Evaluación
              </h1>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#4b5563', fontWeight: 600 }}>Cuestionario Guía de Referencia III</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#111827' }}>FOLIO: NOM35-{survey.id.toString().padStart(6, '0')}</div>
            <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 500 }}>Fecha aplicación: {fechaEncuesta}</div>
          </div>
        </div>

        {/* Contexto de la Evaluación */}
        <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f3f4f6', marginBottom: '15px' }}>
          <p style={{ margin: 0, fontSize: '8.2px', color: '#4b5563', lineHeight: '1.4' }}>
            <strong>CONTEXTO LEGAL:</strong> El presente documento acredita la aplicación técnica de la <strong>Guía de Referencia III</strong> para centros de trabajo con más de 50 trabajadores. 
            La evaluación se realizó de forma <strong>voluntaria y confidencial</strong>, analizando factores de riesgo psicosocial y el entorno organizacional favorable, conforme al numeral 7.2 de la norma.
          </p>
        </div>

        {/* 1. Datos Generales */}
        <div style={{ marginBottom: '15px' }}>
          <div style={sectionTitleStyles}>1. Identificación del Trabajador y Empresa</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { l: 'Colaborador', v: emp.fullName || emp.full_name },
              { l: 'Edad / Género', v: `${v_edad} años / ${v_genero}` },
              { l: 'Puesto', v: emp.position },
              { l: 'Cód. empleado', v: emp.code },
              { l: 'Departamento', v: emp.department },
              { l: 'Fecha de ingreso', v: fechaIngreso },
              { l: 'Razón Social', v: companyInfo.razonSocial },
              { l: 'RFC Empresa', v: companyInfo.rfc },
            ].map(({ l, v }, i) => (
              <div key={l} style={{ padding: '6px 10px', background: i % 2 === 0 ? '#fff' : '#f9fafb', borderRight: (i + 1) % 4 !== 0 ? '1px solid #e5e7eb' : 'none', borderTop: i >= 4 ? '1px solid #e5e7eb' : 'none' }}>
                <div style={labelStyles}>{l}</div>
                <div style={valueStyles}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.2fr', gap: '15px', marginBottom: '15px' }}>
          {/* 2. Resultado Global */}
          <div style={{ border: '2px solid #111827', borderRadius: '10px', padding: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: riskColor(results.riskLevel) }} />
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>2. Nivel de Riesgo Global</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#111827' }}>{results.score.toFixed(0)}</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af' }}>Puntos de {maxTotalScore} posibles</div>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: 900, color: riskColor(results.riskLevel), background: riskBg(results.riskLevel), padding: '3px 10px', borderRadius: '5px', textTransform: 'uppercase', display: 'inline-block' }}>
              RIESGO {results.riskLevel}
            </div>
          </div>

          {/* 3. Conclusión Interpretativa */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', background: '#fff' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#111827', marginBottom: '6px', textTransform: 'uppercase' }}>3. Interpretación y Conclusión</div>
            <p style={{ margin: 0, fontSize: '8.5px', color: '#374151', lineHeight: '1.4', fontStyle: 'italic' }}>
              "{getFormalConclusion(results.riskLevel, results.score, hasATS)}"
            </p>
          </div>
        </div>

        {/* 4. Resultados por Dominio */}
        <div style={{ marginBottom: '15px' }}>
          <div style={sectionTitleStyles}>4. Resultados Detallados por Categoría y Dominio</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {results.domains.map((d: any) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '8.2px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#111827', fontWeight: 700 }}>{d.name}</span>
                  <span style={{ color: '#6b7280', fontWeight: 600, fontSize: '7.5px' }}>Obtenido: {d.score} puntos</span>
                </div>
                <span style={{ fontWeight: 800, color: riskColor(d.riskLevel), background: riskBg(d.riskLevel), padding: '2px 8px', borderRadius: '4px', fontSize: '7.5px', border: `1px solid ${riskBg(d.riskLevel)}` }}>{d.riskLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Medidas y Acciones */}
        <div style={{ background: '#fff', border: '1.5px solid #111827', borderRadius: '10px', padding: '12px', marginBottom: '15px' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 900, color: '#111827', marginBottom: '8px', textTransform: 'uppercase' }}>5. {getMedidas(results.riskLevel).tipo}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '8.5px', color: '#111827', lineHeight: '1.5', fontWeight: 500 }}>
              {getMedidas(results.riskLevel).items.slice(0, 2).map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '8.5px', color: '#111827', lineHeight: '1.5', fontWeight: 500 }}>
              {getMedidas(results.riskLevel).items.slice(2).map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
              {hasATS && (
                <li style={{ color: '#dc2626', fontWeight: 900 }}>⚠️ Canalización prioritaria para valoración clínica por evento traumático.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Firmas y Responsable */}
        <div style={{ marginTop: 'auto', paddingBottom: '10mm' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { name: emp.fullName || emp.full_name, lbl: 'Firma del Trabajador' },
              { name: '_________________________', lbl: 'Responsable del Proceso' },
              { name: 'RECURSOS HUMANOS', lbl: 'Dpto. Seguridad y Salud' },
            ].map(({ name, lbl }) => (
              <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '35px' }} />
                <div style={{ width: '85%', borderBottom: '1.5px solid #111827', marginBottom: '6px' }} />
                <div style={{ fontSize: '9px', fontWeight: 800, textAlign: 'center', color: '#111827', marginBottom: '2px' }}>{name}</div>
                <div style={{ fontSize: '7px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie de Página */}
        <footer style={{ position: 'absolute', bottom: '10mm', left: '15mm', right: '15mm', textAlign: 'center', fontSize: '7.5px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '8px', fontStyle: 'italic' }}>
          Documento válido para procesos de auditoría por la STPS. Generado electrónicamente en cumplimiento con la NOM-035-STPS-2018.
          Reg. Patronal: {companyInfo.registroPatronal} | Periodo: de Enero a Diciembre 2026.
        </footer>
      </div>

      {/* Botón de Detalles (Solo Web) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '12px 24px',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 900,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            textTransform: 'uppercase'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {showDetails ? 'Ocultar Anexo Técnico' : 'Visualizar Anexo Técnico (Detalles)'}
        </button>
      </div>

      {/* Anexo: Respuestas Detalladas */}
      {showDetails && (
        <div className="details-anexo" style={{
          width: '210mm', margin: '0 auto', background: '#fff',
          padding: '12mm 15mm', boxSizing: 'border-box',
          border: '1px solid #e5e7eb', borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#111827', marginBottom: '15px', borderBottom: '3px solid #111827', paddingBottom: '6px', textTransform: 'uppercase' }}>
            Anexo Técnico: Desglose de Respuestas Individuales
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Guía I */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 900, background: '#111827', color: 'white', padding: '6px 12px', marginBottom: '10px', borderRadius: '6px' }}>ANÁLISIS DE SUCESOS TRAUMÁTICOS (GUÍA I)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <tbody>
                  {GUIDE_I.map(section => (
                    section.questions.map(q => (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '6px 0', color: '#4b5563', width: '85%', lineHeight: '1.4' }}>{q.text.split('\n')[0]}</td>
                        <td style={{ padding: '6px 0', fontWeight: 800, textAlign: 'right', color: survey.answers[q.id] === 'si' ? '#dc2626' : '#15803d' }}>
                          {getAnswerLabel(q, survey.answers[q.id])}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>

            {/* Guía III */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 900, background: '#111827', color: 'white', padding: '6px 12px', marginBottom: '10px', borderRadius: '6px' }}>VALORACIÓN DE FACTORES (GUÍA III)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', color: '#6b7280' }}>Pregunta Evaluada</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#6b7280' }}>Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  {GUIDE_III.map(section => (
                    section.questions.map(q => (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '6px 0', color: '#4b5563', lineHeight: '1.3' }}>{q.text}</td>
                        <td style={{ padding: '6px 0', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {getAnswerLabel(q, survey.answers[q.id])}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
