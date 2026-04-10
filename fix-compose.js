const { Client } = require('ssh2');

const sshConfig = {
  host: '72.61.15.222',
  port: 22,
  username: 'root',
  password: 'Ppsayula1968@'
};

const cmd = `
cd /opt/supabase/docker

# Hard replace inside docker-compose.yml
sed -i -E 's/sensors$/sensors,nom035/g' docker-compose.yml
sed -i -E 's/sensors"$/sensors,nom035"/g' docker-compose.yml
sed -i -E "s/sensors'$/sensors,nom035'/g" docker-compose.yml

docker compose up -d rest
docker exec supabase-db psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema';"
docker inspect supabase-rest | grep PGRST_DB_SCHEMAS
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
