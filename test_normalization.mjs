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

const normalizeText = (text) => {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
};

async function testNormalization() {
    console.log('Fetching employees...');
    const { data, error } = await supabase.schema('public').from('nom035_employees').select('full_name, company');
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log(`Testing normalization for ${data.length} employees...`);
    let weirdNames = [];
    
    data.forEach(emp => {
        const norm = normalizeText(emp.full_name);
        // Check if there are trailing/leading spaces or double spaces in the normalized name, 
        // which shouldn't happen because we just trimmed and replaced \s+.
        // Check if there are non-ascii characters left
        if (!/^[a-z0-9 ]+$/.test(norm)) {
            weirdNames.push({ original: emp.full_name, normalized: norm });
        }
    });
    
    if (weirdNames.length > 0) {
        console.log(`Found ${weirdNames.length} names with unexpected characters after normalization:`);
        console.log(weirdNames.slice(0, 10));
    } else {
        console.log('All names normalized perfectly to a-z0-9 and spaces.');
    }
    
    // Check if there's an issue with how Luis is normalized
    const luis = data.find(e => e.full_name.includes('LUIS GUILLERMO'));
    if (luis) {
        console.log(`Test LUIS: original='${luis.full_name}', normalized='${normalizeText(luis.full_name)}'`);
    }
}

testNormalization();
