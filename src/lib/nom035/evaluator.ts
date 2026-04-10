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
const G3_THRESHOLDS: Thresholds = {
  total: [50, 75, 99, 140],
  domains: {
    'Condiciones en el ambiente de trabajo': [5, 9, 11, 14],
    'Carga de trabajo': [15, 21, 27, 37],
    'Falta de control sobre el trabajo': [11, 16, 21, 25],
    'Jornada de trabajo': [1, 2, 4, 6],
    'Interferencia en la relación trabajo-familia': [1, 2, 4, 6],
    'Liderazgo': [9, 12, 16, 23],
    'Relaciones en el trabajo': [10, 13, 17, 24],
    'Violencia laboral': [7, 10, 13, 16],
    'Reconocimiento del desempeño': [6, 10, 13, 18],
    'Insuficiente sentido de pertenencia e inestabilidad': [4, 7, 11, 15]
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
  for (const qId of QUESTIONS_MAP.keys()) {
    if (answers[qId] === undefined || answers[qId] === null) return false;
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
    if (question && typeof value === 'number') {
      const score = question.reverse ? (4 - value) : value;
      totalScore += score;
      
      if (question.domain && domainScores[question.domain] !== undefined) {
        domainScores[question.domain] += score;
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
  // Sección 1 (G1_Screening): ¿Presenció el evento?
  const screening = answers['g1_screening'] === 'si';
  if (!screening) return false;

  // Sección 2 (Q7-Q8): Recuerdos
  const s2Any = answers['q7'] === 'si' || answers['q8'] === 'si';
  
  // Sección 3 (Q9-Q15): Evitación (>= 3 respuestas "si")
  const s3Count = ['q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15']
    .filter(id => answers[id] === 'si').length;
  
  // Sección 4 (Q16-Q20): Afectación (>= 2 respuestas "si")
  const s4Count = ['q16', 'q17', 'q18', 'q19', 'q20']
    .filter(id => answers[id] === 'si').length;

  // Criterio legal NOM-035: Se requiere atención si se cumple S2 o S3>=3 o S4>=2
  return s2Any || s3Count >= 3 || s4Count >= 2;
}
