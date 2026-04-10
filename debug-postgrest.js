const { Client } = require('ssh2');

const sshConfig = {
  host: '72.61.15.222',
  port: 22,
  username: 'root',
  password: 'Ppsayula1968@'
};

const cmd = `
docker inspect supabase-rest | grep PGRST_DB_SCHEMAS
cd /opt/supabase/docker && cat docker-compose.yml | grep PGRST_DB_SCHEMAS || true
cat /opt/supabase/docker/.env | grep PGRST_DB_SCHEMAS || true
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
