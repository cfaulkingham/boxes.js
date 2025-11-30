
import fs from 'fs';
import { MakitaPowerSupply } from '../boxes/generators/makitapowersupply.js';

try {
    const box = new MakitaPowerSupply();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/makitapowersupply.svg', svg);
    console.log('Successfully generated SVG for MakitaPowerSupply!');
} catch (e) {
    console.error('Error generating box MakitaPowerSupply:', e);
}
