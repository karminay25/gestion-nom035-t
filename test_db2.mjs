import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmployees() {
    console.log('Fetching employees...');
    const { data, error } = await supabase.schema('public').from('nom035_employees').select('company, full_name').limit(10);
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data.length} employees (first 10)`);
        console.log(data);
        
        // Let's get distinct companies
        const { data: companies, error: cErr } = await supabase.schema('public').from('nom035_employees').select('company');
        if (!cErr && companies) {
            const uniqueCompanies = [...new Set(companies.map(c => c.company))];
            console.log('Distinct companies in DB:', uniqueCompanies);
        }
    }
}

checkEmployees();
