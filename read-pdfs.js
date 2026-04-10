const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
  const files = ['GUIA_Preguntas_260407_154917.pdf', 'GUIA I_Preguntas_260407_154816.pdf', 'GUIA II_Preguntas_260407_154907.pdf', 'GUIA III_Preguntas_260407_154913.pdf'];
  let output = '';
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      try {
        const dataBuffer = fs.readFileSync(file);
        const data = await pdf(dataBuffer);
        output += `\n\n--- FILE: ${file} ---\n`;
        output += data.text.substring(0, 3000); // Save first 3000 chars to avoid memory overload
      } catch (e) {
        output += `\nError processing ${file}: ${e.message}`;
      }
    }
  }
  
  fs.writeFileSync('pdf-preview.txt', output);
  console.log('Done writing pdf-preview.txt');
}

extract();
