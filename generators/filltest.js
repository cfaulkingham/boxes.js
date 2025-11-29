const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FillTest extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(fillHolesSettings, {fill_pattern: "hex"});
        // this.buildArgParser();
    }

    xHoles() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let border = [[((5 / 320) * x), ((10 / 220) * y)], [((245 / 320) * x), ((10 / 220) * y)], [((225 / 320) * x), ((150 / 220) * y)], [((235 / 320) * x), ((150 / 220) * y)], [((255 / 320) * x), ((10 / 220) * y)], [((290 / 320) * x), ((10 / 220) * y)], [((270 / 320) * x), ((190 / 220) * y)], [((45 / 320) * x), ((190 / 220) * y)], [((45 / 320) * x), ((50 / 220) * y)], [((35 / 320) * x), ((50 / 220) * y)], [((35 / 320) * x), ((190 / 220) * y)], [((5 / 320) * x), ((190 / 220) * y)]];
        this.showBorderPoly(border);
        this.text("Area to be filled", (x / 2), ((190 / 220) * y), {align: "bottom center", color: Color.ANNOTATIONS});
        let start_time = time.time();
        this.fillHoles({pattern: this.fillHoles_fill_pattern, border: border, max_radius: this.fillHoles_hole_max_radius, hspace: this.fillHoles_space_between_holes, bspace: this.fillHoles_space_to_border, min_radius: this.fillHoles_hole_min_radius, style: this.fillHoles_hole_style, bar_length: this.fillHoles_bar_length, max_random: this.fillHoles_max_random});
        let end_time = time.time();
    }

    render() {
        this.rectangularWall(this.x, this.y, "eeee", {callback: [this.xHoles, null, null, null]});
    }

}

module.exports.FillTest = FillTest;