import { supabase } from '@/lib/db/supabase';
import ClientPrint from '../../components/ClientPrint';
import NOM035Report from '../../components/NOM035Report';

export default async function BatchReportPage({ searchParams }: { searchParams: Promise<{ ids?: string; company?: string; status?: string }> }) {
  const resolvedParams = await searchParams;
  
  // Consultamos desde la tabla base de respuestas para asegurar que tenemos los datos frescos
  let query = supabase
    .schema('public')
    .from('nom035_responses')
    .select('*, employees:nom035_employees(*)');

  if (resolvedParams.ids) {
    const idArray = resolvedParams.ids.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (idArray.length > 0) {
      query = query.in('employee_id', idArray);
    }
  }

  const { data: surveys, error } = await query;

  if (error || !surveys || surveys.length === 0) {
    return (
      <div className="p-10 text-red-500 font-bold bg-white min-h-screen">
        Error: No se lograron cargar los reportes o no hay encuestas completadas en tu selección.
      </div>
    );
  }

  // DEDUPLICAR: Mantener solo la encuesta más reciente por cada empleado
  const latestSurveysMap = new Map();
  surveys.forEach(s => {
    const existing = latestSurveysMap.get(s.employee_id);
    if (!existing || new Date(s.completed_at) > new Date(existing.completed_at)) {
      latestSurveysMap.set(s.employee_id, s);
    }
  });
  const finalSurveys = Array.from(latestSurveysMap.values());

  return (
    <>
      <style>{`
        @media print {
          body { 
            margin: 0; 
            background: white !important; 
          }
          .no-print { 
            display: none !important; 
          }
          .batch-container {
            display: block !important;
            padding: 0 !important;
            gap: 0 !important;
          }
          .acuse-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
            page-break-after: always !important;
            break-after: page !important;
            break-inside: avoid !important;
          }
          /* Evitar el salto de página en el último elemento para no crear hoja en blanco */
          .batch-container > .acuse-root:last-child .acuse-sheet {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
        .batch-container {
          background: #e5e7eb;
          padding: 40px 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
      `}</style>

      <div className="batch-container">
        <div className="no-print" style={{ textAlign: 'center', position: 'sticky', top: '20px', zIndex: 100 }}>
          <div style={{ background: '#2563eb', color: 'white', padding: '15px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 25px rgba(37,99,235,0.4)' }}>
            <div>
              <div style={{ fontWeight: '900', fontSize: '12px' }}>LOTE DE IMPRESIÓN</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{finalSurveys.length} ACUSES LISTOS</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
            <ClientPrint />
          </div>
        </div>

        {finalSurveys.map((survey) => (
          <NOM035Report key={survey.id} survey={survey} />
        ))}
      </div>
    </>
  );
}
