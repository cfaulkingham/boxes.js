
import fs from 'fs';
import { JointPanel } from '../boxes/generators/jointpanel.js';

try {
    const box = new JointPanel();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/jointpanel.svg', svg);
    console.log('Successfully generated SVG for JointPanel!');
} catch (e) {
    console.error('Error generating box JointPanel:', e);
}
