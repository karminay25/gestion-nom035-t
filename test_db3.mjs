import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env['SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function countEmployees() {
    console.log('Counting employees...');
    const { count, error } = await supabase.schema('public').from('nom035_employees').select('*', { count: 'exact', head: true });
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total employees in DB: ${count}`);
    }
}

countEmployees();
