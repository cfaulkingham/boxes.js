
import fs from 'fs';
import { CoffeeCapsuleHolder } from '../boxes/generators/coffeecapsulesholder.js';

try {
    const box = new CoffeeCapsuleHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/coffeecapsulesholder.svg', svg);
    console.log('Successfully generated SVG for CoffeeCapsuleHolder!');
} catch (e) {
    console.error('Error generating box CoffeeCapsuleHolder:', e);
}
