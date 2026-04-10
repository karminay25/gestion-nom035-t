/**
 * Lógica de calificación oficial de la NOM-035-STPS-2018
 * Guía de Referencia III
 */

export interface Response {
  questionId: number;
  value: number; // 0, 1, 2, 3, 4
}

export const GUIA_III_SCORING = {
  // Preguntas que se califican: Siempre=4, Casi siempre=3, Algunas veces=2, Casi nunca=1, Nunca=0
  DIRECT: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
  // Preguntas que se califican: Siempre=0, Casi siempre=1, Algunas veces=2, Casi nunca=3, Nunca=4
  REVERSE: [6, 17, 18, 19, 20, 21, 22]
};

/**
 * Calcula el puntaje total de una encuesta
 */
export function calculateTotalScore(responses: Response[]): number {
  return responses.reduce((acc, resp) => {
    if (GUIA_III_SCORING.REVERSE.includes(resp.questionId)) {
      // Inversa: 4 - valor
      return acc + (4 - resp.value);
    }
    // Directa: valor tal cual
    return acc + resp.value;
  }, 0);
}

/**
 * Determina el nivel de riesgo según el puntaje total
 */
export function getRiskLevel(score: number): 'Nulo' | 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto' {
  if (score < 50) return 'Nulo';
  if (score < 75) return 'Bajo';
  if (score < 99) return 'Medio';
  if (score < 140) return 'Alto';
  return 'Muy Alto';
}

/**
 * Ejemplo de cálculo por categorías (abreviado)
 * La NOM divide los 72 items en 5 categorías principales
 */
export function calculateCategoryScores(responses: Response[]) {
  // Mapeo detallado por categoría se implementará aquí basado en la Guía III
  return {
    ambiente: 0,
    factores_propios: 0,
    organizacion_tiempo: 0,
    liderazgo_relaciones: 0,
    entorno_organizacional: 0
  };
}
