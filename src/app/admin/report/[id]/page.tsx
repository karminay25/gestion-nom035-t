import { supabase } from '@/lib/db/supabase';
import ClientPrint from '../../components/ClientPrint';
import NOM035Report from '../../components/NOM035Report';

export default async function IndividualReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: survey, error } = await supabase
    .schema('public')
    .from('nom035_responses')
    .select('*, employees:nom035_employees(*)')
    .eq('employee_id', id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !survey) {
    return (
      <div style={{ padding: '40px', color: '#dc2626', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
        Error: No se encontró el reporte o el empleado aún no ha completado la encuesta.
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .page-root { padding: 0 !important; margin: 0 !important; background: white !important; min-height: 0 !important; }
          .acuse-sheet { 
            box-shadow: none !important; 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 10mm 12mm !important; 
            min-height: 0 !important;
          }
        }
      `}</style>

      <div className="page-root" style={{ background: '#e5e7eb', padding: '20px 0', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '12px' }}>
          <ClientPrint />
        </div>

        <NOM035Report survey={survey} />
      </div>
    </>
  );
}
