import React from 'react';
import Image from 'next/image';
import { calculateNOM035, checkATS } from '@/lib/nom035/evaluator';

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
    default:         return '#eff6ff';
  }
}

function getInterpretacion(level: string): string {
  switch (level) {
    case 'Nulo':
      return 'El trabajador no presenta factores de riesgo psicosocial significativos. Las condiciones actuales de trabajo son favorables para su salud y bienestar.';
    case 'Bajo':
      return 'Se identificaron factores de riesgo psicosocial de baja magnitud. Se recomienda mantener las condiciones actuales e implementar acciones preventivas de refuerzo.';
    case 'Medio':
      return 'Se identificaron factores de riesgo psicosocial que requieren atención. Es necesario implementar acciones de mejora orientadas a los dominios afectados.';
    case 'Alto':
      return 'Se detectaron factores de riesgo psicosocial de impacto considerable. Se requieren acciones correctivas inmediatas y un programa de intervención estructurado.';
    case 'Muy Alto':
      return 'Se detectaron factores de riesgo psicosocial de alta severidad. Se exige intervención inmediata con apoyo de especialistas en salud en el trabajo, conforme a lo dispuesto en la NOM-035.';
    default:
      return 'Resultado pendiente de interpretación.';
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

// ── Propiedades del Componente ────────────────────────────────────────────────

interface NOM035ReportProps {
  survey: any;
  hidePrintButton?: boolean;
}

export default function NOM035Report({ survey, hidePrintButton = false }: NOM035ReportProps) {
  const results = calculateNOM035(survey.guide_type, survey.answers);
  const atsReq = checkATS(survey.answers);

  if (!results) return null;

  const emp = survey.employees;
  const isLola = emp.company?.toUpperCase().includes('LOLA');
  const companyKey = isLola ? 'LOLA' : 'BOSBES';
  const companyInfo = COMPANY_DATA[companyKey] || COMPANY_DATA['LOLA'];
  
  const evalDate = new Date(survey.completed_at);
  const expDate = new Date(evalDate);
  expDate.setFullYear(expDate.getFullYear() + 2);
  const folio = `NOM35-${String(survey.id).padStart(6, '0')}`;
  const medidas = getMedidas(results.riskLevel);

  // Datos capturados
  const edad = survey.answers?.v_edad ? `${survey.answers.v_edad} años` : '—';
  const fechaIngreso = survey.answers?.v_fecha_ingreso
    ? new Date(survey.answers.v_fecha_ingreso + 'T12:00:00').toLocaleDateString('es-MX')
    : (emp.entry_date ? new Date(emp.entry_date).toLocaleDateString('es-MX') : '—');
  const sexo = survey.answers?.v_genero === 'M' ? 'Masculino' : survey.answers?.v_genero === 'F' ? 'Femenino' : '—';

  // Estilos inline de alta precisión
  const sectionTitle: React.CSSProperties = {
    fontSize: '8px', fontWeight: '900', color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    borderBottom: '1.5px solid #111827', paddingBottom: '3px', marginBottom: '6px',
    marginTop: '4px'
  };
  const label: React.CSSProperties = {
    fontSize: '7.5px', fontWeight: 'bold', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px',
  };
  const value: React.CSSProperties = {
    fontSize: '10.5px', fontWeight: 'bold', color: '#111827', lineHeight: 1.3,
  };

  return (
    <div className="acuse-sheet" style={{
      width: '210mm', minHeight: '270mm', margin: '0 auto', background: '#fff',
      padding: '11mm 14mm', boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Folio Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
        <span>Folio: {folio}</span>
        <span>Fecha de emisión: {new Date().toLocaleDateString('es-MX')}</span>
      </div>

      {/* Encabezado Principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #111827', paddingBottom: '8px', marginBottom: '10px' }}>
        <div style={{ position: 'relative', width: '100px', height: '40px', flexShrink: 0 }}>
          <Image src={isLola ? '/lola.jpeg' : '/bosbes.jpeg'} alt="Logo" fill style={{ objectFit: 'contain', objectPosition: 'left' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
            ACUSE DE CUMPLIMIENTO DE EVALUACIÓN NOM-035-STPS-2018
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
            Identificación y Análisis de Factores de Riesgo Psicosocial en el Trabajo
          </div>
        </div>
      </div>

      {/* 1. Datos del Trabajador */}
      <div style={{ marginBottom: '8px' }}>
        <div style={sectionTitle}>1. Datos del Trabajador</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', border: '1px solid #d1d5db', borderRadius: '5px', overflow: 'hidden' }}>
          {[
            { l: 'Nombre completo',  v: emp.full_name },
            { l: 'Edad',            v: edad },
            { l: 'Sexo',            v: sexo },
            { l: 'Fecha de ingreso',v: fechaIngreso },
            { l: 'Puesto',          v: emp.position },
            { l: 'Departamento',    v: emp.department },
            { l: 'Empresa',            v: companyInfo.razonSocial },
            { l: 'Cód. empleado',      v: emp.code },
          ].map(({ l, v }, i) => (
            <div key={l} style={{ padding: '5px 8px', background: i % 2 === 0 ? '#fff' : '#f9fafb', borderRight: (i + 1) % 4 !== 0 ? '1px solid #e5e7eb' : 'none', borderTop: i >= 4 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={label}>{l}</div>
              <div style={value}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Contexto */}
      <div style={{ marginBottom: '8px' }}>
        <div style={sectionTitle}>2. Contexto de Evaluación</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0', border: '1px solid #d1d5db', borderRadius: '5px', overflow: 'hidden' }}>
          {[
            { l: 'Guía aplicada',          v: 'Guía I y Guía III' },
            { l: 'Tipo de aplicación',     v: 'Digital (plataforma web)' },
            { l: 'Fecha de aplicación',     v: evalDate.toLocaleDateString('es-MX') },
            { l: 'Carácter de aplicación', v: 'Voluntaria y confidencial' },
          ].map(({ l, v }, i) => (
            <div key={l} style={{ padding: '5px 8px', background: '#f9fafb', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={label}>{l}</div>
              <div style={value}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Resultados Matriz */}
      <div style={{ marginBottom: '8px' }}>
        <div style={sectionTitle}>3. Resultado de la Evaluación</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ border: '2px solid #111827', borderRadius: '6px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Puntos</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#111827', lineHeight: 1 }}>{results.score}</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: '#d1d5db' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Riesgo Global</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: riskColor(results.riskLevel), lineHeight: 1 }}>{results.riskLevel.toUpperCase()}</div>
            </div>
          </div>
          <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '7.8px' }}>
            <thead>
              <tr style={{ background: '#111827', color: '#fff' }}>
                <th style={{ padding: '2px 7px', textAlign: 'left', border: '1px solid #111827' }}>Dominio</th>
                <th style={{ padding: '2px 7px', textAlign: 'center', border: '1px solid #111827' }}>Pts</th>
                <th style={{ padding: '2px 7px', textAlign: 'center', border: '1px solid #111827', width: '70px' }}>Nivel</th>
              </tr>
            </thead>
            <tbody>
              {results.domains.map((d, i) => (
                <tr key={d.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '2px 7px', fontWeight: 'bold', color: '#374151', border: '1px solid #e5e7eb' }}>{d.name}</td>
                  <td style={{ padding: '2px 7px', textAlign: 'center', fontWeight: '900', border: '1px solid #e5e7eb' }}>{d.score ?? 0}</td>
                  <td style={{ padding: '2px 7px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '6px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: riskBg(d.riskLevel), color: riskColor(d.riskLevel), border: `1px solid ${riskColor(d.riskLevel)}` }}>
                      {(d.riskLevel || 'N/A').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interpretacion */}
      <div style={{ marginBottom: '8px', background: riskBg(results.riskLevel), border: `1px solid ${riskColor(results.riskLevel)}40`, borderRadius: '5px', padding: '6px 10px' }}>
        <div style={{ ...sectionTitle, borderBottomColor: `${riskColor(results.riskLevel)}60`, color: riskColor(results.riskLevel) }}>4. Interpretación del Resultado</div>
        <p style={{ fontSize: '9px', color: '#1f2937', lineHeight: 1.5, margin: 0 }}>{getInterpretacion(results.riskLevel)}</p>
      </div>

      {/* 5. Medidas */}
      <div style={{ marginBottom: '8px' }}>
        <div style={sectionTitle}>5. {medidas.tipo}</div>
        <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '9px', color: '#374151', lineHeight: 1.6 }}>
          {medidas.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      {/* 6 y 7. ATS y Seguimiento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div style={{ padding: '6px 10px', borderRadius: '5px', border: `1px solid ${atsReq ? '#fca5a5' : '#86efac'}`, background: atsReq ? '#fef2f2' : '#f0fdf4' }}>
          <div style={{ ...sectionTitle, borderBottomColor: atsReq ? '#fca5a5' : '#86efac', color: atsReq ? '#b91c1c' : '#15803d' }}>6. Acontecimiento Traumático (Guía I)</div>
          <p style={{ fontSize: '9px', fontWeight: 'bold', color: atsReq ? '#b91c1c' : '#15803d', margin: 0, lineHeight: 1.4 }}>
            {atsReq ? '⚠ Requiere atención clínica — derivar a valoración médica o psicológica.' : '✓ Sin acontecimiento traumático severo detectado.'}
          </p>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #d1d5db', background: '#f9fafb' }}>
          <div style={sectionTitle}>7. Seguimiento</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            {[
              { l: 'Próxima evaluación', v: expDate.toLocaleDateString('es-MX') },
              { l: 'Frecuencia',         v: 'Cada 24 meses' },
              { l: 'Responsable',        v: 'Recursos Humanos' },
              { l: 'Folio de control',   v: folio },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={label}>{l}</div>
                <div style={{ ...value, fontSize: '9.5px' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Centro Trabajo */}
      <div style={{ marginBottom: '10px' }}>
        <div style={sectionTitle}>8. Datos del Centro de Trabajo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', border: '1px solid #d1d5db', borderRadius: '5px', overflow: 'hidden' }}>
          {[
            { l: 'Razón Social', v: companyInfo.razonSocial },
            { l: 'RFC',        v: companyInfo.rfc },
            { l: 'Registro Patronal', v: companyInfo.registroPatronal },
          ].map(({ l, v }, i) => (
            <div key={l} style={{ padding: '5px 8px', background: '#fff', borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={label}>{l}</div>
              <div style={value}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Firmas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '12px' }}>
        {[
          { name: emp.full_name,      lbl: 'Firma del Trabajador' },
          { name: 'RECURSOS HUMANOS', lbl: 'Sello y Firma — RRHH' },
        ].map(({ name, lbl }) => (
          <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '30px' }} />
            <div style={{ width: '100%', borderBottom: '1.5px solid #111827', marginBottom: '4px' }} />
            <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '7.5px', color: '#9ca3af', textTransform: 'uppercase' }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Pie legal */}
      <footer style={{ textAlign: 'center', fontSize: '7.5px', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
        Documento generado conforme a la NOM-035-STPS-2018. Validez oficial para auditorías de la STPS.
      </footer>
    </div>
  );
}
