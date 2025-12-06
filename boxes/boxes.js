import { Boxes as BoxesBase } from './boxes_base.js';
import { LidSettings, Lid } from './lids.js';
import { Parts } from './parts.js';
import { Gears } from './gears.js';
import { Pulley } from './pulley.js';

/**
 * Main Boxes class that aggregates various components and parts.
 * Extends the base functionality to include specific part libraries like Lids, Parts, Gears, etc.
 */
class Boxes extends BoxesBase {
    /**
     * Build and initialize the object libraries.
     * Overrides the base method to instantiate specific part collections.
     * @protected
     */
    _buildObjects() {
        super._buildObjects();

        // Lids
        /** @type {LidSettings} Settings for lids */
        this.lidSettings = new LidSettings(this.thickness, true);
        /** @type {Lid} Lid generator instance */
        this.lid = new Lid(this, this.lidSettings);

        // Other parts (stubs/placeholders to match structure)
        /** @type {Parts} Generic parts collection */
        this.parts = new Parts(this);

        /** @type {Gears} Gears generator instance */
        this.gears = new Gears(this);

        /** @type {Pulley} Pulley generator instance */
        this.pulley = new Pulley(this);
    }
}

export { Boxes };
