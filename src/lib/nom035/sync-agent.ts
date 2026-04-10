import { getPool } from '../db/mssql';

export interface Employee {
  id: number;
  code: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  fullName: string;
  rfc: string;
  department: string;
  position: string;
  company: string;
  entryDate: string;
  status?: string;
  riskLevel?: string;
  atsResult?: string;
}

/**
 * Agente de sincronización para CONTPAQi (Solo Lectura).
 * Columnas verificadas directamente en SERVER\COMPAC:
 *   nom10001: idempleado, codigoempleado, nombre, apellidopaterno, apellidomaterno, iddepartamento
 *   nom10003: iddepartamento, descripcion
 */
export async function syncEmployees(): Promise<Employee[]> {
  const dbs = (process.env.CONTPAQI_DATABASES || 'ctlola').split(',');
  let allEmployees: Employee[] = [];

  for (const db of dbs) {
    const dbName = db.trim();
    if (!dbName) continue;

    console.log(`[NOM-035] Syncing employees from ${dbName}...`);

    try {
      const pool = await getPool(dbName);

      const result = await pool.request().query(`
        SELECT
          e.idempleado,
          e.codigoempleado,
          e.nombre,
          e.apellidopaterno,
          e.apellidomaterno,
          CAST(e.RFC AS VARCHAR(20)) AS RFC,
          e.fechaalta,
          ISNULL(d.descripcion, 'Sin Departamento') AS departamento,
          ISNULL(p.descripcion, 'Sin Puesto') AS puesto
        FROM nom10001 e
        LEFT JOIN nom10003 d ON e.iddepartamento = d.iddepartamento
        LEFT JOIN nom10006 p ON e.idpuesto = p.idpuesto
      `);

      if (result.recordset.length > 0) {
        console.log(`[NOM-035] Columns found in ${dbName}:`, Object.keys(result.recordset[0]));
      }

      const companyLabel = dbName.toUpperCase().includes('LOLA')
        ? 'Lola Berries'
        : dbName.toUpperCase().includes('BOSBES')
          ? 'Bosbes Berries'
          : dbName;

      const employees: Employee[] = result.recordset
        .filter((row: any) => {
          const code = (row.codigoempleado ?? '').toString().trim();
          const name = (row.nombre ?? '').toString().trim();
          // Ignorar códigos que sean puramente ceros (0, 00, 000) o que tengan nombres vacíos
          return !/^[0]*$/.test(code) && code !== '' && name.length > 1;
        })
        .map((row: any) => ({
          id: row.idempleado,
          code: (row.codigoempleado ?? '').toString().trim(),
          firstName: (row.nombre ?? '').toString().trim(),
          lastNamePaternal: (row.apellidopaterno ?? '').toString().trim(),
          lastNameMaternal: (row.apellidomaterno ?? '').toString().trim(),
          fullName: `${(row.nombre ?? '').toString().trim()} ${(row.apellidopaterno ?? '').toString().trim()} ${(row.apellidomaterno ?? '').toString().trim()}`.replace(/\s+/g, ' ').trim(),
          rfc: (row.RFC || row.rfc || '').toString().trim(),
          department: (row.departamento ?? 'Sin Departamento').toString().trim(),
          position: (row.puesto ?? 'Sin Puesto').toString().trim(),
          company: companyLabel,
          entryDate: row.fechaalta ? new Date(row.fechaalta).toISOString() : new Date().toISOString(),
        }));

      console.log(`[NOM-035] ✅ ${employees.length} employees from ${dbName}`);
      allEmployees = [...allEmployees, ...employees];

      try { await pool.close(); } catch (_) {}
    } catch (err) {
      console.error(`[NOM-035] ❌ Error in ${dbName} (skipping):`, err);
    }
  }

  return allEmployees.filter(emp => emp.code.length > 0 && emp.fullName.length > 1);
}
