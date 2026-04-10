const { Client } = require('ssh2');

const sshConfig = {
  host: '72.61.15.222',
  port: 22,
  username: 'root',
  password: 'Ppsayula1968@'
};

const cmd = `
cd /opt/supabase/docker
# Clean up mistake
sed -i -E 's/",nom035/"/g' .env
sed -i -E 's/", nom035/"/g' .env

# Properly append inside quotes
sed -i -E 's/^(PGRST_DB_SCHEMAS=".*)(")$/\\1,nom035\\2/' .env

echo "=== After Fix ==="
grep PGRST .env || true
docker compose restart rest
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
      console.log('OUTPUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect(sshConfig);
