export interface Question {
  id: string;
  text: string;
  type: 'likert' | 'yesno' | 'select' | 'text';
  reverse?: boolean;
  domain?: string;
  category?: string;
  dimension?: string;
  options?: { label: string; value: any }[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const GUIDE_V: Section[] = [
  {
    id: 'g5_s1',
    title: 'Datos del Trabajador',
    description: 'Completa la siguiente información antes de comenzar la evaluación:',
    questions: [
      {
        id: 'v_edad',
        text: 'Edad (años cumplidos)',
        type: 'select',
        options: Array.from({ length: 60 }, (_, i) => ({ label: `${i + 16} años`, value: i + 16 }))
      },
      {
        id: 'v_genero',
        text: 'Sexo',
        type: 'select',
        options: [{ label: 'Masculino', value: 'M' }, { label: 'Femenino', value: 'F' }]
      }
    ]
  }
];

export const GUIDE_I: Section[] = [
  {
    id: 'g1_s1',
    title: '1: Acontecimiento traumático severo',
    description: 'Responda con Sí o No a la siguiente pregunta:',
    questions: [
      {
        id: 'g1_screening',
        text: '¿Ha presenciado o sufrido alguna vez, durante o con motivo del trabajo, alguno de los siguientes acontecimientos?\n\n• Accidente que tenga como consecuencia la muerte, la pérdida de un miembro o una lesión grave\n• Asaltos\n• Actos violentos que derivaron en lesiones graves\n• Secuestro\n• Amenazas\n• Cualquier otro que ponga en riesgo su vida o salud, y/o la de otras personas',
        type: 'yesno'
      }
    ]
  },
  {
    id: 'g1_s2',
    title: '2: Recuerdos persistentes sobre el acontecimiento',
    description: 'Durante el último mes:',
    questions: [
      { id: 'q7', text: '¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provocan malestares?', type: 'yesno' },
      { id: 'q8', text: '¿Ha tenido sueños de carácter recurrente sobre el acontecimiento, que le producen malestar?', type: 'yesno' }
    ]
  },
  {
    id: 'g1_s3',
    title: '3: Esfuerzo por evitar circunstancias parecidas',
    description: 'Durante el último mes:',
    questions: [
      { id: 'q9', text: '¿Se ha esforzado por evitar todo tipo de sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?', type: 'yesno' },
      { id: 'q10', text: '¿Se ha esforzado por evitar todo tipo de actividades, lugares o personas que motivan recuerdos del acontecimiento?', type: 'yesno' },
      { id: 'q11', text: '¿Ha tenido dificultad para recordar alguna parte importante del evento?', type: 'yesno' },
      { id: 'q12', text: '¿Ha disminuido su interés en sus actividades cotidianas?', type: 'yesno' },
      { id: 'q13', text: '¿Se ha sentido usted alejado o distante de los demás?', type: 'yesno' },
      { id: 'q14', text: '¿Ha notado que tiene dificultad para expresar sus sentimientos?', type: 'yesno' },
      { id: 'q15', text: '¿Ha tenido la impresión de que su vida se va a acortar, que va a morir antes que otras personas o que tiene un futuro limitado?', type: 'yesno' }
    ]
  },
  {
    id: 'g1_s4',
    title: '4: Afectación',
    description: 'Durante el último mes:',
    questions: [
      { id: 'q16', text: '¿Ha tenido usted dificultades para dormir?', type: 'yesno' },
      { id: 'q17', text: '¿Ha estado particularmente irritable o le han dado arranques de coraje?', type: 'yesno' },
      { id: 'q18', text: '¿Ha tenido dificultad para concentrarse?', type: 'yesno' },
      { id: 'q19', text: '¿Ha estado nervioso o constantemente en alerta?', type: 'yesno' },
      { id: 'q20', text: '¿Se ha sobresaltado fácilmente por cualquier cosa?', type: 'yesno' }
    ]
  }
];

export const GUIDE_III: Section[] = [
  {
    id: 'g3_s1',
    title: '1: Condiciones ambientales',
    description: 'Considere las condiciones ambientales de su centro de trabajo.',
    questions: [
      { id: 'g3_q1', text: 'El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica', type: 'likert', reverse: true, domain: 'Condiciones en el ambiente de trabajo' },
      { id: 'g3_q2', text: 'Mi trabajo me exige hacer mucho esfuerzo físico', type: 'likert', domain: 'Condiciones en el ambiente de trabajo' },
      { id: 'g3_q3', text: 'Me preocupa sufrir un accidente en mi trabajo', type: 'likert', domain: 'Condiciones en el ambiente de trabajo' },
      { id: 'g3_q4', text: 'Considero que en mi trabajo se aplican las normas de seguridad y salud en el trabajo', type: 'likert', reverse: true, domain: 'Condiciones en el ambiente de trabajo' },
      { id: 'g3_q5', text: 'Considero que las actividades que realizo son peligrosas', type: 'likert', domain: 'Condiciones en el ambiente de trabajo' }
    ]
  },
  {
    id: 'g3_s2',
    title: '2: Cantidad y ritmo de trabajo',
    description: 'Piense en la cantidad y ritmo de trabajo que tiene.',
    questions: [
      { id: 'g3_q6', text: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q7', text: 'Por la cantidad de trabajo que tengo debo trabajar sin parar', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q8', text: 'Considero que es necesario mantener un ritmo de trabajo acelerado', type: 'likert', domain: 'Carga de trabajo' }
    ]
  },
  {
    id: 'g3_s3',
    title: '3: Esfuerzo mental',
    description: 'Relacionadas con el esfuerzo mental que le exige su trabajo.',
    questions: [
      { id: 'g3_q9', text: 'Mi trabajo exige que esté muy concentrado', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q10', text: 'Mi trabajo requiere que memorice mucha información', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q11', text: 'En mi trabajo tengo que tomar decisiones difíciles muy rápido', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q12', text: 'Mi trabajo exige que atienda varios asuntos al mismo tiempo', type: 'likert', domain: 'Carga de trabajo' }
    ]
  },
  {
    id: 'g3_s4',
    title: '4: Actividades y responsabilidades',
    description: 'Responsabilidades que tiene en su trabajo.',
    questions: [
      { id: 'g3_q13', text: 'En mi trabajo soy responsable de cosas de mucho valor', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q14', text: 'Respondo ante mi jefe por los resultados de toda mi área de trabajo', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q15', text: 'En el trabajo me dan órdenes contradictorias', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q16', text: 'Considero que en mi trabajo me piden hacer cosas innecesarias', type: 'likert', domain: 'Carga de trabajo' }
    ]
  },
  {
    id: 'g3_s5',
    title: '5: Jornada de trabajo',
    description: 'Relacionadas con su jornada de trabajo.',
    questions: [
      { id: 'g3_q17', text: 'Trabajo horas extras más de tres veces a la semana', type: 'likert', domain: 'Jornada de trabajo' },
      { id: 'g3_q18', text: 'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana', type: 'likert', domain: 'Jornada de trabajo' },
      { id: 'g3_q19', text: 'Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales', type: 'likert', domain: 'Interferencia en la relación trabajo-familia' },
      { id: 'g3_q20', text: 'Debo atender asuntos de trabajo cuando estoy en casa', type: 'likert', domain: 'Interferencia en la relación trabajo-familia' },
      { id: 'g3_q21', text: 'Pienso en las actividades familiares o personales cuando estoy en mi trabajo', type: 'likert', domain: 'Interferencia en la relación trabajo-familia' },
      { id: 'g3_q22', text: 'Pienso que mis responsabilidades familiares afectan mi trabajo', type: 'likert', domain: 'Interferencia en la relación trabajo-familia' }
    ]
  },
  {
    id: 'g3_s6',
    title: '6: Decisiones en su trabajo',
    description: 'Relacionadas con las decisiones que puede tomar.',
    questions: [
      { id: 'g3_q23', text: 'Mi trabajo permite que desarrolle nuevas habilidades', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q24', text: 'En mi trabajo puedo aspirar a un mejor puesto', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q25', text: 'Durante mi jornada de trabajo puedo tomar pausas cuando las necesito', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q26', text: 'Puedo decidir cuánto trabajo realizo durante la jornada laboral', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q27', text: 'Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q28', text: 'Puedo cambiar el orden de las actividades que realizo en mi trabajo', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' }
    ]
  },
  {
    id: 'g3_s7',
    title: '7: Cambios en su trabajo',
    description: 'Relacionadas con cualquier tipo de cambio ocurrido.',
    questions: [
      { id: 'g3_q29', text: 'Los cambios que se presentan en mi trabajo dificultan mi labor', type: 'likert', domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q30', text: 'Cuando se presentan cambios en mi trabajo se tienen en cuenta mis ideas o aportaciones', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' }
    ]
  },
  {
    id: 'g3_s8',
    title: '8: Capacitación e información',
    description: 'Relacionadas con la capacitación e información proporcionada.',
    questions: [
      { id: 'g3_q31', text: 'Me informan con claridad cuáles son mis funciones', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q32', text: 'Me explican claramente los resultados que debo obtener en mi trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q33', text: 'Me explican claramente los objetivos de mi trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q34', text: 'Me informan con quién puedo resolver problemas o asuntos de trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q35', text: 'Me permiten asistir a capacitaciones relacionadas con mi trabajo', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' },
      { id: 'g3_q36', text: 'Recibo capacitación útil para hacer mi trabajo', type: 'likert', reverse: true, domain: 'Falta de control sobre el trabajo' }
    ]
  },
  {
    id: 'g3_s9',
    title: '9: Relación con sus jefes',
    description: 'Relacionadas con el o los jefes con quien tiene contacto.',
    questions: [
      { id: 'g3_q37', text: 'Mi jefe ayuda a organizar mejor el trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q38', text: 'Mi jefe tiene en cuenta mis puntos de vista y opiniones', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q39', text: 'Mi jefe me comunica a tiempo la información relacionada con el trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q40', text: 'La orientación que me da mi jefe me ayuda a realizar mejor mi trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' },
      { id: 'g3_q41', text: 'Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo', type: 'likert', reverse: true, domain: 'Liderazgo' }
    ]
  },
  {
    id: 'g3_s10',
    title: '10: Relación con sus compañeros',
    description: 'Relacionadas con las relaciones con sus compañeros.',
    questions: [
      { id: 'g3_q42', text: 'Puedo confiar en mis compañeros de trabajo', type: 'likert', reverse: true, domain: 'Relaciones en el trabajo' },
      { id: 'g3_q43', text: 'Entre compañeros solucionamos los problemas de trabajo de forma respetuosa', type: 'likert', reverse: true, domain: 'Relaciones en el trabajo' },
      { id: 'g3_q44', text: 'En mi trabajo me hacen sentir parte del grupo', type: 'likert', reverse: true, domain: 'Relaciones en el trabajo' },
      { id: 'g3_q45', text: 'Cuando tenemos que realizar trabajo de equipo los compañeros colaborar', type: 'likert', reverse: true, domain: 'Relaciones en el trabajo' },
      { id: 'g3_q46', text: 'Mis compañeros de trabajo me ayudan cuando tengo dificultades', type: 'likert', reverse: true, domain: 'Relaciones en el trabajo' }
    ]
  },
  {
    id: 'g3_s11',
    title: '11: Rendimiento, reconocimiento y estabilidad',
    description: 'Sentido de pertenencia y estabilidad que le ofrece su trabajo.',
    questions: [
      { id: 'g3_q47', text: 'Me informan sobre lo que hago bien en mi trabajo', type: 'likert', reverse: true, domain: 'Reconocimiento del desempeño' },
      { id: 'g3_q48', text: 'La forma como evalúan mi trabajo en mi centro de trabajo me ayuda a mejorar mi desempeño', type: 'likert', reverse: true, domain: 'Reconocimiento del desempeño' },
      { id: 'g3_q49', text: 'En mi centro de trabajo me pagan a tiempo mi salario', type: 'likert', reverse: true, domain: 'Reconocimiento del desempeño' },
      { id: 'g3_q50', text: 'El pago que recibo es el que merezco por el trabajo que realizo', type: 'likert', reverse: true, domain: 'Reconocimiento del desempeño' },
      { id: 'g3_q51', text: 'Si obtengo los resultados esperados en mi trabajo me recompensan o reconocen', type: 'likert', reverse: true, domain: 'Reconocimiento del desempeño' },
      { id: 'g3_q52', text: 'Las personas que hacen bien el trabajo pueden crecer laboralmente', type: 'likert', reverse: true, domain: 'Reconocimiento del desempeño' },
      { id: 'g3_q53', text: 'Considero que mi trabajo es estable', type: 'likert', reverse: true, domain: 'Insuficiente sentido de pertenencia e inestabilidad' },
      { id: 'g3_q54', text: 'En mi trabajo existe continua rotación de personal', type: 'likert', domain: 'Insuficiente sentido de pertenencia e inestabilidad' },
      { id: 'g3_q55', text: 'Siento orgullo de laborar en este centro de trabajo', type: 'likert', reverse: true, domain: 'Insuficiente sentido de pertenencia e inestabilidad' },
      { id: 'g3_q56', text: 'Me siento comprometido con mi trabajo', type: 'likert', reverse: true, domain: 'Insuficiente sentido de pertenencia e inestabilidad' }
    ]
  },
  {
    id: 'g3_s12',
    title: '12: Actos de violencia laboral',
    description: 'Malos tratos, acoso, hostigamiento, acoso psicológico.',
    questions: [
      { id: 'g3_q57', text: 'En mi trabajo puedo expresarme libremente sin interrupciones', type: 'likert', reverse: true, domain: 'Violencia laboral' },
      { id: 'g3_q58', text: 'Recibo críticas constantes a mi persona y/o trabajo', type: 'likert', domain: 'Violencia laboral' },
      { id: 'g3_q59', text: 'Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones', type: 'likert', domain: 'Violencia laboral' },
      { id: 'g3_q60', text: 'Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones', type: 'likert', domain: 'Violencia laboral' },
      { id: 'g3_q61', text: 'Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador', type: 'likert', domain: 'Violencia laboral' },
      { id: 'g3_q62', text: 'Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores', type: 'likert', domain: 'Violencia laboral' },
      { id: 'g3_q63', text: 'Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo', type: 'likert', domain: 'Violencia laboral' },
      { id: 'g3_q64', text: 'He presenciado actos de violencia en mi centro de trabajo', type: 'likert', domain: 'Violencia laboral' }
    ]
  },
  {
    id: 'g3_s13',
    title: '13: Atención a clientes y usuarios',
    description: 'Relacionadas con la atención a clientes y usuarios.',
    questions: [
      { id: 'g3_q65', text: 'Atiendo clientes o usuarios muy enojados', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q66', text: 'Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q67', text: 'Para hacer mi trabajo debo demostrar sentimientos distintos a los míos', type: 'likert', domain: 'Carga de trabajo' },
      { id: 'g3_q68', text: 'Mi trabajo me exige atender situaciones de violencia', type: 'likert', domain: 'Violencia laboral' }
    ]
  },
  {
    id: 'g3_s14',
    title: '14: Actitudes de las personas que supervisa',
    description: 'Relacionadas con las personas que tiene a su cargo.',
    questions: [
      { id: 'g3_q69', text: 'Comunican tarde los asuntos de trabajo', type: 'likert', domain: 'Relaciones en el trabajo' },
      { id: 'g3_q70', text: 'Dificultan el logro de los resultados del trabajo', type: 'likert', domain: 'Relaciones en el trabajo' },
      { id: 'g3_q71', text: 'Cooperan poco cuando se necesita', type: 'likert', domain: 'Relaciones en el trabajo' },
      { id: 'g3_q72', text: 'Ignoran las sugerencias para mejorar su trabajo', type: 'likert', domain: 'Relaciones en el trabajo' }
    ]
  }
];

export const GUIDE_II = GUIDE_III; // Para Bosbes/Lola que son grandes
