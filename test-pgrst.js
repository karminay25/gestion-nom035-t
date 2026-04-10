const { Client } = require('ssh2');

const sshConfig = {
  host: '72.61.15.222',
  port: 22,
  username: 'root',
  password: 'Ppsayula1968@'
};

const cmd = `
docker exec supabase-db psql -U postgres -d postgres -c "\\dn"
docker exec supabase-db psql -U postgres -d postgres -c "SELECT * FROM information_schema.schemata WHERE schema_name = 'nom035';"
docker exec supabase-db psql -U postgres -d postgres -c "GRANT USAGE ON SCHEMA nom035 TO postgres, anon, authenticated, service_role;"
docker exec supabase-rest /bin/sh -c 'echo $PGRST_DB_SCHEMAS'
echo 'DONE'
`;

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('OUTPUT: ' + data.toString());
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data.toString());
    });
  });
}).connect(sshConfig);
