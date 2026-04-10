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
    case 'Bajo':
      return {
        tipo: 'Medidas de Prevención (Numeral 8.1)',
        items: [
          'Difundir y aplicar la Política de Prevención de Riesgos Psicosociales vigente en el centro de trabajo.',
          'Mantener acciones de sensibilización para la prevención de la violencia laboral y promoción del entorno organizacional favorable.',
          'Reforzar los mecanismos de apoyo social y el reconocimiento del desempeño (Numeral 8.1.b.3).',
        ]
      };
    case 'Medio':
      return {
        tipo: 'Acciones de Control y Prevención (Numeral 8.2)',
        items: [
          'Revisar la distribución de cargas de trabajo y condiciones de tiempo de acuerdo a la jornada legal.',
          'Implementar mecanismos de participación proactiva y comunicación entre el patrón y los trabajadores.',
          'Evaluar la necesidad de capacitación técnica o sensibilización para mandos medios en materia de liderazgo (Numeral 8.2.a.5).',
          'Documentar el avance de las medidas en el Programa de Intervención Organizacional.',
        ]
      };
    case 'Alto':
    case 'Muy Alto':
      return {
        tipo: 'Acciones de Control Prioritarias (Numeral 8.4)',
        items: [
          'Derivar de forma inmediata al trabajador para su valoración médica y/o psicológica ante especialista (Nivel 1 - Individual).',
          'Elaborar e implementar un programa de intervención específico que modifique los factores de riesgo detectados (Nivel 2 - Grupal / Nivel 3 - Organizacional).',
          'Establecer controles sobre carga de trabajo, falta de control y violencia laboral de manera prioritaria.',
          'Realizar seguimiento periódico del estado de salud y bienestar del trabajador, guardando debida confidencialidad.',
        ]
      };
    default:
      return { tipo: 'Acciones Generales', items: ['Seguir lo dispuesto en la Política de Prevención de la empresa.'] };
  }
}

const COMPANY_DATA: Record<string, { rfc: string; razonSocial: string; registroPatronal: string }> = {
  'LOLA': {
    rfc: 'LBE140327491',
    razonSocial: 'LOLA BERRIES S.P.R. DE R.L. DE C.V.',
    registroPatronal: 'C0314007135',
  },
  'BOSBES': {
    rfc: 'BBE161029DHA',
    razonSocial: 'BOSBES BERRIES SPR DE RL DE CV',
    registroPatronal: 'C0314584133',
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
    fontSize: '9px', fontWeight: 800, color: '#1f2937', 
    textTransform: 'uppercase', letterSpacing: '0.02em',
    marginBottom: '6px', borderBottom: '1px solid #e5e7eb',
    paddingBottom: '2px'
  };

  const labelStyles: React.CSSProperties = {
    color: '#9ca3af', fontSize: '6.5px', fontWeight: 700, 
    textTransform: 'uppercase', marginBottom: '1px'
  };

  const valueStyles: React.CSSProperties = {
    fontWeight: 600, color: '#1f2937', fontSize: '8.5px'
  };

  return (
    <div className="acuse-root" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div className="acuse-sheet" style={{
        width: '210mm', minHeight: '250mm', margin: '0 auto', background: '#fff',
        padding: '11mm 14mm', boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Folio Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
          <div>NOM-035-STPS-2018 | Diagnóstico Individual</div>
          <div style={{ fontWeight: 'bold' }}>ID: {survey.id.toString().padStart(6, '0')}</div>
        </div>

        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '45px', height: '45px', position: 'relative' }}>
              <Image src={isLola ? "/lola.jpeg" : "/bosbes.jpeg"} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                Acuse de Evaluación
              </h1>
              <p style={{ margin: 0, fontSize: '9px', color: '#4b5563', fontWeight: 500 }}>Factores de Riesgo Psicosocial en el Trabajo</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#111827' }}>FOLIO: NOM35-{survey.id.toString().padStart(6, '0')}</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>Fecha: {fechaEncuesta}</div>
          </div>
        </div>

        {/* 1. Datos del Trabajador */}
        <div style={{ marginBottom: '12px' }}>
          <div style={sectionTitleStyles}>1. Datos del Centro de Trabajo y Trabajador</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            {[
              { l: 'Nombre del trabajador', v: emp.fullName || emp.full_name },
              { l: 'Edad / Género',      v: `${v_edad} años / ${v_genero}` },
              { l: 'Fecha de ingreso',v: fechaIngreso },
              { l: 'Puesto',          v: emp.position },
              { l: 'Departamento',    v: emp.department },
              { l: 'Empresa',            v: companyInfo.razonSocial },
              { l: 'Cód. empleado',      v: emp.code },
            ].map(({ l, v }, i) => (
              <div key={l} style={{ padding: '5px 8px', background: i % 2 === 0 ? '#fff' : '#f9fafb', borderRight: (i + 1) % 4 !== 0 ? '1px solid #e5e7eb' : 'none', borderTop: i >= 4 ? '1px solid #e5e7eb' : 'none' }}>
                <div style={labelStyles}>{l}</div>
                <div style={valueStyles}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px', marginBottom: '12px' }}>
          {/* 2. Resultado Global */}
          <div style={{ border: '1.5px solid #111827', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: riskColor(results.riskLevel) }} />
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#4b5563', marginBottom: '4px', textTransform: 'uppercase' }}>2. Nivel de Riesgo Global</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#111827' }}>{results.score.toFixed(1)}</div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: riskColor(results.riskLevel), background: riskBg(results.riskLevel), padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Riesgo {results.riskLevel}
              </div>
            </div>
            <p style={{ fontSize: '8px', color: '#6b7280', marginTop: '4px', lineHeight: '1.2' }}>Basado en la Guía III de la NOM-035 para centros de más de 50 trabajadores.</p>
          </div>

          {/* 3. Evento Traumático */}
          <div style={{ border: '1px solid #fee2e2', background: hasATS ? '#fef2f2' : '#f0fdf4', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', borderStyle: hasATS ? 'solid' : 'dashed', borderColor: hasATS ? '#ef4444' : '#bbf7d0' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: hasATS ? '#991b1b' : '#166534', marginBottom: '2px', textTransform: 'uppercase' }}>3. Acontecimiento Traumático (Guía I)</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: hasATS ? '#dc2626' : '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {hasATS ? '⚠ REQUIERE VALORACIÓN MÉDICA' : '✓ SIN EVENTOS DETECTADOS'}
            </div>
            <p style={{ fontSize: '7.5px', color: hasATS ? '#b91c1c' : '#3f6212', marginTop: '4px', lineHeight: '1.2' }}>
              {hasATS ? 'El trabajador presenció o sufrió un evento severo durante el trabajo y presenta síntomas de estrés post-traumático.' : 'No se detectaron síntomas que requieran atención clínica inmediata según los criterios de la Guía I.'}
            </p>
          </div>
        </div>

        {/* 4. Resultados por Dominio */}
        <div style={{ marginBottom: '12px' }}>
          <div style={sectionTitleStyles}>4. Desglose por Dominios Legales</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {results.domains.map((d: any) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '8px' }}>
                <span style={{ color: '#4b5563', fontWeight: 600, maxWidth: '75%' }}>{d.name}</span>
                <span style={{ fontWeight: 800, color: riskColor(d.riskLevel), background: riskBg(d.riskLevel), padding: '1px 5px', borderRadius: '3px', fontSize: '7.5px' }}>{d.riskLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Medidas y Acciones */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>5. {getMedidas(results.riskLevel).tipo}</div>
          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '8.2px', color: '#475569', lineHeight: '1.4' }}>
            {getMedidas(results.riskLevel).items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
            ))}
            {hasATS && (
              <li style={{ color: '#dc2626', fontWeight: 700 }}>Realizar canalización clínica para valoración de estrés post-traumático de forma prioritaria.</li>
            )}
          </ul>
        </div>

        {/* 6 y 7. Seguimiento y Firma Directora */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px', marginBottom: '12px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
            <div style={sectionTitleStyles}>6. Seguimiento</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '8px' }}>
              <div>
                <div style={labelStyles}>Próxima Evaluación</div>
                <div style={{ fontWeight: 700 }}>{new Date(new Date(survey.completed_at).setFullYear(new Date(survey.completed_at).getFullYear() + 2)).toLocaleDateString('es-MX')}</div>
              </div>
              <div>
                <div style={labelStyles}>Frecuencia</div>
                <div style={{ fontWeight: 700 }}>Cada 24 meses</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#111827', textAlign: 'center' }}>DIRECCIÓN GENERAL</div>
            <div style={{ fontSize: '8px', color: '#6b7280', textAlign: 'center' }}>
              {compKey === 'LOLA' ? 'LOLA BERRIES' : 'BOSBES BERRIES'} — 2026
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '10px', marginTop: '10px' }}>
          {[
            { name: emp.fullName || emp.full_name,      lbl: 'Firma del Trabajador' },
            { name: 'RECURSOS HUMANOS', lbl: 'Sello y Firma — RRHH' },
          ].map(({ name, lbl }) => (
            <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '25px' }} />
              <div style={{ width: '100%', borderBottom: '1.5px solid #111827', marginBottom: '4px' }} />
              <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center' }}>{name}</div>
              <div style={{ fontSize: '7.5px', color: '#9ca3af', textTransform: 'uppercase' }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Pie legal */}
        <footer style={{ textAlign: 'center', fontSize: '7.5px', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
          Documento generado conforme a la NOM-035-STPS-2018. Validez oficial para auditorías de la STPS.
        </footer>
      </div>

      {/* Botón de Detalles (Solo Web) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '8px 16px',
            background: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {showDetails ? '↑ Ocultar Respuestas Detalladas' : '↓ Ver Respuestas Detalladas (Anexo Técnico)'}
        </button>
      </div>

      {/* Anexo: Respuestas Detalladas */}
      {showDetails && (
        <div className="details-anexo" style={{
          width: '210mm', margin: '0 auto', background: '#fff',
          padding: '11mm 14mm', boxSizing: 'border-box',
          border: '1px solid #e5e7eb', borderRadius: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#111827', marginBottom: '10px', borderBottom: '2px solid #374151', paddingBottom: '4px' }}>
            ANEXO TÉCNICO: DESGLOSE DE RESPUESTAS INDIVIDUALES
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Guía I */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, background: '#f3f4f6', padding: '4px 8px', marginBottom: '5px' }}>GUÍA I - ACONTECIMIENTO TRAUMÁTICO SEVERO</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                <tbody>
                  {GUIDE_I.map(section => (
                    section.questions.map(q => (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '4px 0', color: '#4b5563', width: '80%' }}>{q.text.split('\n')[0]}</td>
                        <td style={{ padding: '4px 0', fontWeight: 700, textAlign: 'right', color: survey.answers[q.id] === 'si' ? '#dc2626' : '#15803d' }}>
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
              <div style={{ fontSize: '9px', fontWeight: 800, background: '#f3f4f6', padding: '4px 8px', marginBottom: '5px' }}>GUÍA III - ENTORNO ORGANIZACIONAL FAVORABLE</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Pregunta</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  {GUIDE_III.map(section => (
                    section.questions.map(q => (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '4px 0', color: '#4b5563' }}>{q.text}</td>
                        <td style={{ padding: '4px 0', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
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
