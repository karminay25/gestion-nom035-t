import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envText = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.substring(0, idx).trim();
  const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = val;
}
const url = env['SUPABASE_URL'] || env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_KEY'] || env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(url, key);

async function check() {
  const name = 'Luis Guillermo%';
  console.log('--- Buscando en empleados ---');
  const { data: emps } = await supabase.schema('public').from('nom035_employees').select('*').ilike('full_name', `%${name}%`);
  console.log(JSON.stringify(emps, null, 2));

  console.log('\n--- Buscando en respuestas ---');
  const { data: res } = await supabase.schema('public').from('nom035_responses').select('*, employees:nom035_employees(*)');
  const filteredRes = res.filter(r => r.employees?.full_name?.toLowerCase().includes('guillermo') || JSON.stringify(r.answers).toLowerCase().includes('guillermo'));
  console.log(JSON.stringify(filteredRes.map(r => ({ id: r.id, emp_id: r.employee_id, emp_name: r.employees?.full_name, company: r.employees?.company })), null, 2));
}
check();
