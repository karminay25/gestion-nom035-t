import { supabase } from '@/lib/db/supabase';
import ClientPrint from '../../components/ClientPrint';
import Image from 'next/image';

export default async function AllReportsPage() {
  // 1. Obtener todos los reportes de Supabase (con joins)
  const { data: surveys, error } = await supabase
    .schema('public')
    .from('nom035_final')
    .select('*, employees:nom035_employees(*)');

  if (error || !surveys || surveys.length === 0) {
    return <div className="p-10 text-red-500 font-bold">Error: No se lograron cargar los reportes o no hay encuestas completadas aún.</div>;
  }

  return (
    <div className="bg-gray-100 text-black min-h-screen p-8 print:p-0 print:bg-white print:min-h-0">
      <ClientPrint />
      
      {/* Aviso para el usuario en pantalla normal */}
      <div className="max-w-4xl mx-auto mb-8 bg-blue-100 text-blue-800 p-4 rounded-lg print:hidden text-center font-bold">
        🖨️ Generando lote de {surveys.length} acuses. El diálogo de impresión se abrirá automáticamente.
      </div>

      {surveys.map((survey, index) => {
        const emp = survey.employees;
        const isLola = emp.company.toUpperCase().includes('LOLA');
        const isLast = index === surveys.length - 1;

        return (
          <div 
            key={survey.id} 
            className={`max-w-4xl mx-auto bg-white print:shadow-none shadow-2xl p-10 border border-gray-200 ${!isLast ? 'mb-16 print:break-after-page' : ''}`}
            style={!isLast ? { pageBreakAfter: 'always' } : {}}
          >
            {/* Cabecera Membretada */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-48 h-20 relative flex items-center justify-center">
                   <Image src={isLola ? '/lola.jpeg' : '/bosbes.jpeg'} alt="Logo" fill className="object-contain" />
                 </div>
              </div>
              <div className="text-right">
                <h1 className="text-xl font-black text-gray-900 uppercase">Acuse de Cumplimiento</h1>
                <h2 className="text-lg font-bold text-gray-700">Norma Oficial Mexicana NOM-035-STPS-2018</h2>
                <p className="text-sm text-gray-500 mt-1">Factores de Riesgo Psicosocial en el Trabajo</p>
              </div>
            </div>

            {/* Datos del Trabajador */}
            <div className="mb-8">
              <div className="bg-gray-100 p-2 border-l-4 border-gray-800 mb-4">
                <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm">Información del Trabajador</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold text-gray-600">Nombre Completo:</span> {emp.full_name}</div>
                <div><span className="font-bold text-gray-600">Código de Empleado:</span> {emp.code}</div>
                <div><span className="font-bold text-gray-600">Empresa:</span> {emp.company}</div>
                <div><span className="font-bold text-gray-600">Departamento:</span> {emp.department}</div>
                <div><span className="font-bold text-gray-600">Puesto:</span> {emp.position}</div>
                <div><span className="font-bold text-gray-600">RFC:</span> {emp.rfc || 'N/A'}</div>
                <div><span className="font-bold text-gray-600">Fecha de Ingreso:</span> {new Date(emp.entry_date).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Resultados Generales */}
            <div className="mb-10">
              <div className="bg-gray-100 p-2 border-l-4 border-blue-800 mb-4">
                <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm">Resultados de Evaluación ({survey.guide_type})</h3>
              </div>
              <div className="flex gap-8 items-center border border-gray-200 p-6 rounded-lg bg-gray-50/50">
                <div className="text-center px-8 border-r border-gray-200">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-2">Calificación Final</p>
                  <p className="text-5xl font-black text-blue-900">{survey.score}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Nivel de Riesgo Psicosocial</p>
                  <p className={`text-2xl font-bold uppercase ${
                    survey.risk_level === 'Muy Alto' ? 'text-red-700' :
                    survey.risk_level === 'Alto' ? 'text-orange-600' :
                    survey.risk_level === 'Medio' ? 'text-yellow-600' :
                    'text-green-700'
                  }`}>{survey.risk_level}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Fecha de Aplicación</p>
                  <p className="font-bold text-gray-800">{new Date(survey.completed_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Declaración Legal */}
            <div className="mb-16 text-xs text-gray-600 border border-gray-200 p-4 rounded text-justify">
              <p className="mb-2">
                <strong>Declaratoria de Cumplimiento:</strong> El presente documento funge como evidencia de que el trabajador arriba mencionado
                dio cumplimiento a su obligación de participar en las evaluaciones para identificar los factores de riesgo psicosocial y el entorno organizacional, conforme a lo establecido en la NOM-035-STPS-2018.
              </p>
              <p>
                La información brindada está amparada por la política de confidencialidad de la empresa y será utilizada única y exclusivamente para los fines de estadística y control dictados por la Secretaría del Trabajo y Previsión Social.
              </p>
            </div>

            {/* Firmas */}
            <div className="grid grid-cols-2 gap-10 mt-20 text-center">
              <div>
                <div className="border-t border-gray-800 w-3/4 mx-auto pt-2">
                  <p className="font-bold text-gray-800 uppercase text-sm">Firma del Trabajador</p>
                  <p className="text-xs text-gray-500 mt-1">{emp.full_name}</p>
                </div>
              </div>
              <div>
                <div className="border-t border-gray-800 w-3/4 mx-auto pt-2">
                  <p className="font-bold text-gray-800 uppercase text-sm">Recursos Humanos</p>
                  <p className="text-xs text-gray-500 mt-1">Sello y Firma Electrónica</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
