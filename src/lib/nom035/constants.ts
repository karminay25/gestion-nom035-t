export const GUIA_I = [
  {
    id: 1,
    section: 'I. Acontecimientos traumáticos severos',
    question: '¿Ha presenciado o sufrido un acontecimiento como los siguientes: accidente con lesiones graves o muerte, asalto, actos de violencia o secuestro?',
    options: ['Sí', 'No']
  },
  // ... más preguntas se agregarán para completar la Guía I
];

export const GUIA_III = [
  {
    id: 1,
    domain: 'Condiciones en el ambiente de trabajo',
    category: 'Ambiente de trabajo',
    question: 'Mi trabajo me exige hacer mucho esfuerzo físico',
    weightType: 'direct' // 0, 1, 2, 3, 4
  },
  {
    id: 2,
    domain: 'Condiciones en el ambiente de trabajo',
    category: 'Ambiente de trabajo',
    question: 'Me preocupa sufrir un accidente en mi trabajo',
    weightType: 'direct'
  },
  // ... 72 preguntas en total para Guía III
];

export const RISK_LEVELS = {
  GUIA_III: {
    FINAL: [
      { min: 0, max: 50, level: 'Nulo' },
      { min: 50, max: 75, level: 'Bajo' },
      { min: 75, max: 99, level: 'Medio' },
      { min: 99, max: 140, level: 'Alto' },
      { min: 140, max: Infinity, level: 'Muy Alto' }
    ]
  }
};
