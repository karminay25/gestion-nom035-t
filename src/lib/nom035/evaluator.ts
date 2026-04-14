import { GUIDE_III, Question } from './questions';

export type RiskLevel = 'Nulo' | 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';

interface Thresholds {
  total: number[];
  domains: Record<string, number[]>;
}

// Mapa de búsqueda rápida para optimización O(1)
const QUESTIONS_MAP = new Map<string, Question>(
  GUIDE_III.flatMap(s => s.questions).map(q => [q.id, q])
);

// Umbrales oficiales NOM-035 Guía III (> 50 trabajadores)
// Formato: [límite_bajo, límite_medio, límite_alto, límite_muy_alto]
// getRiskLevel: score < t[0]=Nulo, < t[1]=Bajo, < t[2]=Medio, < t[3]=Alto, else=MuyAlto
const G3_THRESHOLDS: Thresholds = {
  total: [50, 75, 99, 140],
  domains: {
    'Condiciones en el ambiente de trabajo':          [5,  10, 15, 21],  // Nulo 0-4, Bajo 5-9, Medio 10-14, Alto 15-20
    'Carga de trabajo':                               [15, 30, 45, 57],  // Nulo 0-14, Bajo 15-29, Medio 30-44, Alto 45-56
    'Falta de control sobre el trabajo':              [11, 21, 31, 41],  // Nulo 0-10, Bajo 11-20, Medio 21-30, Alto 31-40
    'Jornada de trabajo':                             [2,  4,  6,  9],   // Nulo 0-1, Bajo 2-3, Medio 4-5, Alto 6-8
    'Interferencia en la relación trabajo-familia':   [4,  7,  10, 13],  // Nulo 0-3, Bajo 4-6, Medio 7-9, Alto 10-12
    'Liderazgo':                                      [9,  12, 15, 21],  // Nulo 0-8, Bajo 9-11, Medio 12-14, Alto 15-20
    'Relaciones en el trabajo':                       [15, 29, 43, 57],  // Nulo 0-14, Bajo 15-28, Medio 29-42, Alto 43-56
    'Violencia laboral':                              [8,  16, 24, 33],  // Nulo 0-7, Bajo 8-15, Medio 16-23, Alto 24-32
    'Reconocimiento del desempeño':                   [6,  10, 14, 21],  // Nulo 0-5, Bajo 6-9, Medio 10-13, Alto 14-20
    'Insuficiente sentido de pertenencia e inestabilidad': [4, 7, 10, 13], // Nulo 0-3, Bajo 4-6, Medio 7-9, Alto 10-12
  }
};

export function getRiskLevel(score: number, thresholds: number[]): RiskLevel {
  if (score < thresholds[0]) return 'Nulo';
  if (score < thresholds[1]) return 'Bajo';
  if (score < thresholds[2]) return 'Medio';
  if (score < thresholds[3]) return 'Alto';
  return 'Muy Alto';
}

/**
 * Valida si el cuestionario de Guía III está completo
 */
function isGuideIIIComplete(answers: Record<string, any>): boolean {
  if (!answers || typeof answers !== 'object') return false;
  for (const qId of QUESTIONS_MAP.keys()) {
    const val = answers[qId];
    if (val === undefined || val === null || val === '') return false;
  }
  return true;
}

export function calculateNOM035(guideType: string, answers: Record<string, any>) {
  // Validar integridad antes de calcular
  if (!isGuideIIIComplete(answers)) {
    return null; // Indica que el cálculo no es válido por falta de datos
  }

  const thresholds = G3_THRESHOLDS;
  let totalScore = 0;
  const domainScores: Record<string, number> = {};

  // Inicializar dominios en 0 para asegurar consistencia
  Object.keys(thresholds.domains).forEach(d => domainScores[d] = 0);

  Object.entries(answers).forEach(([qId, value]) => {
    const question = QUESTIONS_MAP.get(qId);
    if (question) {
      // CONVERSIÓN RÍGIDA: Previene bug donde respuestas históricas ("4" texto) eran ignoradas
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        const score = question.reverse ? (4 - numValue) : numValue;
        totalScore += score;
        
        if (question.domain && domainScores[question.domain] !== undefined) {
          domainScores[question.domain] += score;
        }
      }
    }
  });

  const domainResults = Object.entries(thresholds.domains).map(([name, limits]) => {
    const score = domainScores[name] || 0;
    return {
      name,
      score,
      riskLevel: getRiskLevel(score, limits)
    };
  });

  return {
    score: totalScore,
    riskLevel: getRiskLevel(totalScore, thresholds.total),
    domains: domainResults
  };
}

export function checkATS(answers: Record<string, any>): boolean {
  const details = getATSDetails(answers);
  return details.requiresEvaluation;
}

export function getATSDetails(answers: Record<string, any>) {
  // Sección 1 (G1_Screening): ¿Presenció el evento?
  const hasEvent = answers['g1_screening'] === 'si';
  
  // Sección 2 (Q7-Q8): Recuerdos
  const recollections = answers['q7'] === 'si' || answers['q8'] === 'si';
  
  // Sección 3 (Q9-Q15): Evitación (>= 3 respuestas "si")
  const s3Count = ['q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15']
    .filter(id => answers[id] === 'si').length;
  
  // Sección 4 (Q16-Q20): Afectación (>= 2 respuestas "si")
  const s4Count = ['q16', 'q17', 'q18', 'q19', 'q20']
    .filter(id => answers[id] === 'si').length;

  // Criterio legal NOM-035: Se requiere atención si se cumple S2 o S3>=3 o S4>=2
  const requiresEvaluation = hasEvent && (recollections || s3Count >= 3 || s4Count >= 2);

  return {
    hasEvent,
    recollections,
    avoidanceCount: s3Count,
    arousalCount: s4Count,
    requiresEvaluation
  };
}

export function calculateOrganizationalRisk(normativeResults: any, positionRaw: string) {
  if (!normativeResults || !normativeResults.domains) return null;
  const position = (positionRaw || '').toUpperCase();
  
  const isManagerial = [
    'GERENTE', 'DIRECTOR', 'JEFE', 'JEFATURA', 'SUPERVISOR', 
    'COORDINADOR', 'LIDER', 'MANAGER', 'DIRECTORA', 'ENCARGADO',
    'RH', 'RECURSOS HUMANOS', 'NOMINA', 'ADMINISTRATIVO', 'COMPRAS',
    'INOCUIDAD', 'SUPERVISION', 'MONITOREO'
  ].some(kw => position.includes(kw));

  if (!isManagerial) {
    return {
      isAdjusted: false,
      score: normativeResults.score,
      riskLevel: normativeResults.riskLevel,
      message: "No se requiere ajuste. El riesgo normativo coincide con el riesgo organizacional."
    };
  }

  // Ajuste matemático para perfiles gerenciales: 
  // La Responsabilidad y Carga de Trabajo son inherentes. Extraemos el dominio "Carga de trabajo"
  const cargaDomain = normativeResults.domains.find((d: any) => d.name === 'Carga de trabajo');
  let adjustedTotalScore = normativeResults.score;

  if (cargaDomain) {
    // Si la carga de trabajo aportó puntaje, le aplicamos un factor de atenuación del 35% 
    // asumiendo que esa carga mental es intrínseca al puesto directivo y no un fallo organizacional.
    const discount = Math.floor(cargaDomain.score * 0.35);
    adjustedTotalScore = Math.max(0, adjustedTotalScore - discount);
  }

  return {
    isAdjusted: true,
    score: adjustedTotalScore,
    riskLevel: getRiskLevel(adjustedTotalScore, G3_THRESHOLDS.total),
    message: "Ajuste aplicado por jerarquía directiva. La alta carga mental es inherente al perfil y no representa necesariamente un deterioro organizacional interno."
  };
}

