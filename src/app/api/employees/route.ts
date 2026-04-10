import { NextResponse } from 'next/server';
import { syncEmployees } from '@/lib/nom035/sync-agent';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// LECTURA CON DATOS DE RIESGO
export async function GET() {
  try {
    const { data: employees, error } = await supabase
      .schema('public')
      .from('nom035_employees')
      .select(`
        *,
        responses:nom035_responses(
          risk_level,
          ats_result,
          completed_at
        )
      `)
      .order('company')
      .order('code')
      .range(0, 2000);

    if (error) throw error;

    // Adaptar y extraer el riesgo más reciente
    const mapped = (employees || []).map(emp => {
      // Tomamos la respuesta más reciente (por completed_at)
      const latestResponse = (emp.responses as any[])?.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      )[0];

      return {
        ...emp,
        firstName: emp.first_name,
        lastNamePaternal: emp.last_name_paternal,
        lastNameMaternal: emp.last_name_maternal,
        fullName: emp.full_name,
        entryDate: emp.entry_date,
        status: emp.status,
        riskLevel: latestResponse?.risk_level || 'N/A',
        atsResult: latestResponse?.ats_result || 'N/A'
      };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching from Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// SINCRONIZACIÓN PESADA (Desde CONTPAQi hacia Supabase)
export async function POST() {
  try {
    // 1. Obtener datos frescos de CONTPAQi
    const employees = await syncEmployees();

    if (!employees || employees.length === 0) {
      return NextResponse.json({ error: 'No se encontraron empleados en CONTPAQi' }, { status: 404 });
    }

    // 2. Formatear para Supabase
    const payload = employees.map(emp => ({
      code: emp.code,
      first_name: emp.firstName,
      last_name_paternal: emp.lastNamePaternal,
      last_name_maternal: emp.lastNameMaternal,
      full_name: emp.fullName,
      rfc: emp.rfc,
      department: emp.department,
      position: emp.position || 'Sin Puesto',
      company: emp.company,
      entry_date: emp.entryDate
    }));

    // 3. Upsert Masivo
    const { error } = await supabase
      .schema('public')
      .from('nom035_employees')
      .upsert(payload, { onConflict: 'code, company' });

    if (error) throw error;

    return NextResponse.json({ success: true, count: payload.length });
  } catch (error: any) {
    console.error('Error syncing CONTPAQi to Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
