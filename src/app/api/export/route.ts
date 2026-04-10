import { supabase } from '@/lib/db/supabase';
import { NextResponse } from 'next/server';
import { calculateNOM035 } from '@/lib/nom035/evaluator';

export async function GET() {
  // 1. Obtener todas las respuestas con datos de empleados
  const { data: responses, error } = await supabase
    .schema('public')
    .from('nom035_responses')
    .select('*, employees:nom035_employees(*)');

  if (error || !responses) {
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }

  // 2. Deduplicar por empleado (quedarse con la más reciente)
  const latestMap = new Map();
  responses.forEach(r => {
    const existing = latestMap.get(r.employee_id);
    if (!existing || new Date(r.completed_at) > new Date(existing.completed_at)) {
      latestMap.set(r.employee_id, r);
    }
  });

  const finalData = Array.from(latestMap.values());

  // 3. Definir encabezados CSV
  const headers = [
    'Codigo Empleado',
    'Nombre Completo',
    'Departamento',
    'Puesto',
    'Empresa',
    'Guia Aplicada',
    'Fecha de Completado',
    'Puntos Totales',
    'Nivel de Riesgo Global',
    'D1: Condiciones Ambiente',
    'D2: Carga de Trabajo',
    'D3: Falta de Control',
    'D4: Jornada de Trabajo',
    'D5: Interferencia Familia',
    'D6: Liderazgo',
    'D7: Relaciones en el Trabajo',
    'D8: Violencia Laboral',
    'D9: Reconocimiento del Desempeno',
    'D10: Pertenencia e Inestabilidad'
  ];

  // 4. Construir filas
  const rows = finalData.map(r => {
    const results = calculateNOM035(r.guide_type, r.answers);
    if (!results) return null;

    // Mapear dominios a columnas fijas
    const domainScores = new Array(10).fill(0);
    results.domains.forEach((d, idx) => {
      domainScores[idx] = d.score || 0;
    });

    return [
      r.employees.code,
      r.employees.full_name,
      r.employees.department,
      r.employees.position,
      r.employees.company,
      r.guide_type,
      new Date(r.completed_at).toLocaleDateString('es-MX'),
      results.score,
      results.riskLevel,
      ...domainScores
    ].map(val => `"${val}"`).join(',');
  }).filter(row => row !== null);

  // 5. Unir y añadir BOM para Excel (soporte acentos)
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="Evidencia_NOM035_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}
