
import fs from 'fs';
import { IntegratedHingeBox } from '../boxes/generators/integratedhingebox.js';

try {
    const box = new IntegratedHingeBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/integratedhingebox.svg', svg);
    console.log('Successfully generated SVG for IntegratedHingeBox!');
} catch (e) {
    console.error('Error generating box IntegratedHingeBox:', e);
}
