
import fs from 'fs';
import { RobotArm } from '../boxes/generators/robotarm.js';

try {
    const box = new RobotArm();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/robotarm.svg', svg);
    console.log('Successfully generated SVG for RobotArm!');
} catch (e) {
    console.error('Error generating box RobotArm:', e);
}
