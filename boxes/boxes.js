import { Boxes as BoxesBase } from './boxes_base.js';
import { LidSettings, Lid } from './lids.js';
import { Parts } from './parts.js';
import { Gears } from './gears.js';
import { Pulley } from './pulley.js';

class Boxes extends BoxesBase {
    _buildObjects() {
         super._buildObjects();

         // Lids
         this.lidSettings = new LidSettings(this.thickness, true);
         this.lid = new Lid(this, this.lidSettings);

         // Other parts (stubs/placeholders to match structure)
         this.parts = new Parts(this);

         this.gears = new Gears(this);

         this.pulley = new Pulley(this);
    }
}

export { Boxes };
