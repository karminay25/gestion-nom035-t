const { Client } = require('ssh2');

const sshConfig = {
  host: '72.61.15.222',
  port: 22,
  username: 'root',
  password: 'Ppsayula1968@'
};

const sqlQuery = `
CREATE SCHEMA IF NOT EXISTS nom035;

CREATE TABLE IF NOT EXISTS nom035.employees (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  first_name TEXT,
  last_name_paternal TEXT,
  last_name_maternal TEXT,
  full_name TEXT NOT NULL,
  rfc TEXT,
  department TEXT,
  position TEXT,
  company TEXT NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'PENDIENTE',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT idx_code_company UNIQUE (code, company)
);

CREATE TABLE IF NOT EXISTS nom035.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id BIGINT REFERENCES nom035.employees(id),
  guide_type TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER,
  risk_level TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar acceso de solo lectura o lectura/escritura en POSTGREST para schema nom035
GRANT USAGE ON SCHEMA nom035 TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA nom035 TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA nom035 TO anon, authenticated, service_role;

ALTER ROLE authenticator SET pgrst.db_extra_search_path TO nom035, public;
`;

// Limpiamos los saltos de linea para docker exec
const safeQuery = sqlQuery.replace(/'/g, "'\"'\"'").replace(/\n/g, ' ');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  // usamos comillas dobles y escapamos todo correctamente psql -c ""
  conn.exec(`docker exec supabase-db psql -U postgres -d postgres -c "${safeQuery}"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('OUTPUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect(sshConfig);
