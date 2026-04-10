import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { calculateNOM035, checkATS } from '@/lib/nom035/evaluator';

export const dynamic = 'force-dynamic';

// LECTURA DE ENCUESTAS CON RE-CÁLCULO DINÁMICO
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    let query = supabase
      .schema('public')
      .from('nom035_responses')
      .select('*, employees:nom035_employees(full_name, code, company, department)')
      .order('completed_at', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId).limit(1);
    }

    const { data: surveys, error } = await query;
    if (error) throw error;
    
    // RE-CALCULAR RESULTADOS AL VUELO
    const processedSurveys = (surveys || []).map(s => {
      const results = calculateNOM035(s.guide_type, s.answers);
      const needsAttention = checkATS(s.answers);
      
      return {
        ...s,
        score: results ? results.score : s.score,
        risk_level: results ? results.riskLevel : s.risk_level,
        ats_result: needsAttention ? 'REQUIERE_ATENCION' : 'APTO'
      };
    });

    if (employeeId) {
      return NextResponse.json(processedSurveys.length ? processedSurveys[0] : null);
    }

    return NextResponse.json(processedSurveys);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GUARDAR RESPUESTAS DEL TRABAJADOR
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeCode, company, answers, guideType } = body;

    if (!employeeCode || !company || !answers) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 0. Calcular Resultados automáticamente
    const results = calculateNOM035(guideType || 'GUÍA III', answers);
    if (!results) {
      return NextResponse.json({ error: 'Cuestionario incompleto o inválido' }, { status: 400 });
    }

    const { score, riskLevel } = results;
    const needsAttention = checkATS(answers);
    const atsResult = needsAttention ? 'REQUIERE_ATENCION' : 'APTO';

    // 1. Guardar todo usando una función RPC (V2 para bypass de caché)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('save_nom035_survey_v2', {
        p_employee_code: employeeCode,
        p_company: company,
        p_answers: answers,
        p_guide_type: guideType || 'GUÍA III',
        p_score: score,
        p_risk_level: riskLevel,
        p_ats_result: atsResult
      });

    if (rpcError) throw rpcError;
    if (rpcData?.error) throw new Error(rpcData.error);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving survey to Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
