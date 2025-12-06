import { Boxes } from '../boxes.js';
import { fillHolesSettings } from '../boxes_base.js';
import { FingerJointSettings, BaseEdge, edges } from '../edges.js';
import { LidSettings } from '../lids.js';
import { _TopEdge } from '../lids.js';
import { Color } from '../Color.js';

class FrontEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "a";
    }

    draw(length, kw = {}) {
        const b = this.boxes;
        let x = Math.ceil((((b.canDiameter * 0.5) + (2 * b.thickness)) * Math.sin((b.chuteAngle * Math.PI / 180))) / b.thickness);
        if (b.top_edge !== "e") {
            b.corner(90, b.thickness);
            b.edge(0.5 * b.canDiameter);
            b.corner(-90, 0.25 * b.canDiameter);
        } else {
            b.moveTo(-b.burn, b.canDiameter + b.thickness, -90);
            b.corner(90, 0.25 * b.canDiameter);
            b.edge(b.thickness);
        }
        b.edge(0.5 * b.canDiameter - b.thickness);
        b.corner(-90, 0.25 * b.canDiameter);
        b.edge(0.5 * b.canDiameter);
        b.corner(90, b.thickness);
        b.edge(x * b.thickness);
        b.corner(90, b.thickness);
        b.edge(0.5 * b.canDiameter);
        b.corner(-90, 0.25 * b.canDiameter);
        b.edge(0.5 * b.canDiameter - (1 + x) * b.thickness + b.top_chute_height + b.bottom_chute_height - b.barrier_height);
        b.corner(-90, 0.25 * b.canDiameter);
        b.edge(0.5 * b.canDiameter);
        b.corner(90, b.thickness);
        b.edge(b.barrier_height);
        b.edge(b.thickness);
    }
}

export { FrontEdge };

class TopChuteEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "b";
    }

    draw(length, kw = {}) {
        const b = this.boxes;
        b.edge(0.2 * length - b.thickness);
        b.corner(90, b.thickness);
        b.edge(1.5 * b.canDiameter - 2 * b.thickness);
        b.corner(-90, b.thickness);
        b.edge(0.6 * length - 2 * b.thickness);
        b.corner(-90, b.thickness);
        b.edge(1.5 * b.canDiameter - 2 * b.thickness);
        b.corner(90, b.thickness);
        b.edge(0.2 * length - b.thickness);
    }
}

export { TopChuteEdge };

class BarrierEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "A";
    }

    draw(length, kw = {}) {
        const b = this.boxes;
        b.edge(0.2 * length);
        b.corner(90, b.thickness / 2);
        b.corner(-90, b.thickness / 2);
        b.edge(0.6 * length - 2 * b.thickness);
        b.corner(-90, b.thickness / 2);
        b.corner(90, b.thickness / 2);
        b.edge(0.2 * length);
    }

    startwidth() {
        return this.boxes.thickness;
    }
}

export { BarrierEdge };

class CanStorage extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 2.0, space: 2.0, surroundingspaces: 0.0});
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(fillHolesSettings);
        this.argparser.add_argument("--top_edge", {action: "store", type: "edgetype", choices: ["e", "f", "h", "Š"], default: "Š", help: "edge type for top edge"});
        this.argparser.add_argument("--bottom_edge", {action: "store", type: "edgetype", choices: ["e", "E", "š"], default: "š", help: "edge type for bottom edge"});
        this.argparser.add_argument("--canDiameter", {action: "store", type: "float", default: 75, help: "outer diameter of the cans to be stored (in mm)"});
        this.argparser.add_argument("--canHeight", {action: "store", type: "float", default: 110, help: "height of the cans to be stored (in mm)"});
        this.argparser.add_argument("--canNum", {action: "store", type: "int", default: 12, help: "number of cans to be stored"});
        this.argparser.add_argument("--chuteAngle", {action: "store", type: "float", default: 5.0, help: "slope angle of the chutes"});
    }

    DrawPusher(dbg = false) {
        this.restore(() => {
            if (dbg === false) {
                this.moveTo(0, this.thickness);
            }
            this.edge(0.25 * this.pusherA);
            this.corner(-90);
            this.edge(this.thickness);
            this.corner(90);
            this.edge(0.5 * this.pusherA);
            this.corner(90);
            this.edge(this.thickness);
            this.corner(-90);
            this.edge(0.25 * this.pusherA);

            this.corner(90 - this.chuteAngle);

            this.edge(0.25 * this.pusherB);
            this.corner(-90);
            this.edge(this.thickness);
            this.corner(90);
            this.edge(0.5 * this.pusherB);
            this.corner(90);
            this.edge(this.thickness);
            this.corner(-90);
            this.edge(0.25 * this.pusherB);

            this.corner(90 + this.pusherAngle + this.chuteAngle);
            this.edge(this.pusherC);
        });
    }

    cb_top_chute(nr) {
        if (nr === 0) {
            // fill with holes
            let border = [
                [0, 0],
                [this.top_chute_depth, 0],
                [this.top_chute_depth, 0.2 * this.width - this.thickness],
                [this.top_chute_depth - this.thickness, 0.2 * this.width],
                [this.top_chute_depth - 1.5 * this.canDiameter, 0.2 * this.width],
                [this.top_chute_depth - 1.5 * this.canDiameter, 0.8 * this.width],
                [this.top_chute_depth - this.thickness, 0.8 * this.width],
                [this.top_chute_depth, 0.8 * this.width + this.thickness],
                [this.top_chute_depth, this.width],
                [0, this.width],
            ];

            if (this.fillHoles_fill_pattern !== "no fill") {
                const isBar = ["hbar", "vbar"].includes(this.fillHoles_fill_pattern);
                this.fillHoles({
                    pattern: "hbar",
                    border: border,
                    max_radius: isBar ? Math.min(2 * this.thickness, this.fillHoles_hole_max_radius) : Math.min(2 * this.thickness, this.width / 30),
                    hspace: isBar ? Math.min(2 * this.thickness, this.fillHoles_space_between_holes) : Math.min(2 * this.thickness, this.width / 20),
                    bspace: isBar ? Math.min(2 * this.thickness, this.fillHoles_space_to_border) : Math.min(2 * this.thickness, this.width / 20),
                    bar_length: this.fillHoles_bar_length,
                    max_random: this.fillHoles_max_random,
                });
            }
        }
    }

    cb_top(nr) {
        if (nr === 0) {
            // fill with holes
            let border = [
                [0, 0],
                [this.depth, 0],
                [this.depth, this.width],
                [0, this.width],
            ];

            if (this.fillHoles_fill_pattern !== "no fill") {
                const isBar = ["hbar", "vbar"].includes(this.fillHoles_fill_pattern);
                this.fillHoles({
                    pattern: "hbar",
                    border: border,
                    max_radius: isBar ? Math.min(2 * this.thickness, this.fillHoles_hole_max_radius) : Math.min(2 * this.thickness, this.width / 30),
                    hspace: isBar ? Math.min(2 * this.thickness, this.fillHoles_space_between_holes) : Math.min(2 * this.thickness, this.width / 20),
                    bspace: isBar ? Math.min(2 * this.thickness, this.fillHoles_space_to_border) : Math.min(2 * this.thickness, this.width / 20),
                    bar_length: this.fillHoles_bar_length,
                    max_random: this.fillHoles_max_random,
                });
            }
        }
    }

    cb_bottom_chute(nr) {
        if (nr === 1) {
            // holes for pusher
            this.rectangularHole(this.width * 0.85 - 0.5 * this.thickness, 0.25 * this.pusherA, this.thickness, 0.5 * this.pusherA, {center_x: false, center_y: false});
            this.rectangularHole(this.width * 0.5 - 0.5 * this.thickness, 0.25 * this.pusherA, this.thickness, 0.5 * this.pusherA, {center_x: false, center_y: false});
            this.rectangularHole(this.width * 0.15 - 0.5 * this.thickness, 0.25 * this.pusherA, this.thickness, 0.5 * this.pusherA, {center_x: false, center_y: false});
        }
    }

    cb_back(nr) {
        if (nr === 1) {
            // holes for pusher
            const yOffset = this.thickness + this.depth * Math.tan(this.chuteAngle * Math.PI / 180) + 0.25 * this.pusherB;
            this.rectangularHole(this.width * 0.85 - 0.5 * this.thickness, yOffset, this.thickness, 0.5 * this.pusherB + this.thickness, {center_x: false, center_y: false});
            this.rectangularHole(this.width * 0.5 - 0.5 * this.thickness, yOffset, this.thickness, 0.5 * this.pusherB + this.thickness, {center_x: false, center_y: false});
            this.rectangularHole(this.width * 0.15 - 0.5 * this.thickness, yOffset, this.thickness, 0.5 * this.pusherB + this.thickness, {center_x: false, center_y: false});
        }
    }

    cb_sides(nr) {
        if (nr === 0) {
            // for debugging only
            if (this.debug) {
                // draw orientation points
                this.hole(0, 0, 1, {color: Color.ANNOTATIONS});
                this.hole(0, this.thickness, 1, {color: Color.ANNOTATIONS});
                this.hole(0, this.thickness + this.canDiameter, 1, {color: Color.ANNOTATIONS});
                this.hole(0, this.thickness + this.canDiameter + this.bottom_chute_height, 1, {color: Color.ANNOTATIONS});
                this.hole(0, this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + this.thickness, 1, {color: Color.ANNOTATIONS});
                this.hole(0, this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + this.thickness + this.canDiameter, 1, {color: Color.ANNOTATIONS});
                this.hole(0, this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + this.thickness + this.canDiameter + 1.0 * this.thickness, 1, {color: Color.ANNOTATIONS});
                
                // draw cans, bottom row
                this.restore(() => {
                    this.moveTo(0, this.thickness, this.chuteAngle);
                    this.rectangularHole(2 * this.thickness, 0, Math.ceil(this.canNum / 2) * this.canDiameter, this.canDiameter, {center_x: false, center_y: false, color: Color.ANNOTATIONS});
                    let i;
                    for (i = 0; i < Math.ceil(this.canNum / 2) - 1; i++) {
                        this.hole(2 * this.thickness + (0.5 + i) * this.canDiameter, this.canDiameter / 2, this.canDiameter / 2, {color: Color.ANNOTATIONS});
                    }
                    this.hole(2 * this.thickness + (0.5 + i) * this.canDiameter, this.canDiameter * 0.8, this.canDiameter / 2, {color: Color.ANNOTATIONS});
                });

                // draw pusher
                this.restore(() => {
                    this.moveTo(this.depth - this.pusherA, this.thickness + (this.depth - this.pusherA) * Math.tan(this.chuteAngle * Math.PI / 180));
                    this.moveTo(0, 0, this.chuteAngle);
                    this.DrawPusher(true);
                });

                // draw cans, top row
                this.restore(() => {
                    this.moveTo(0, this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + 0.5 * this.thickness, -this.chuteAngle);
                    this.rectangularHole(0, 0.5 * this.thickness, Math.ceil(this.canNum / 2) * this.canDiameter, this.canDiameter, {center_x: false, center_y: false, color: Color.ANNOTATIONS});
                    for (let i = 0; i < Math.ceil(this.canNum / 2); i++) {
                        this.hole((0.5 + i) * this.canDiameter, this.canDiameter / 2 + 0.5 * this.thickness, this.canDiameter / 2, {color: Color.ANNOTATIONS});
                    }
                });

                // draw barrier
                this.restore(() => {
                    this.moveTo(1.5 * this.thickness, 1.1 * this.thickness + this.burn + Math.sin(this.chuteAngle * Math.PI / 180) * 2 * this.thickness, 90);
                    this.rectangularHole(0, 0, this.barrier_height, this.thickness, {center_x: false, center_y: true, color: Color.ANNOTATIONS});
                });
            }

            // bottom chute
            this.restore(() => {
                this.moveTo(0, 0.5 * this.thickness, this.chuteAngle);
                this.fingerHolesAt(0, 0, this.depth / Math.cos(this.chuteAngle * Math.PI / 180), 0);
            });

            // top chute
            this.restore(() => {
                this.moveTo(0, this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + 0.5 * this.thickness, -this.chuteAngle);
                this.fingerHolesAt(0, 0, this.top_chute_depth, 0);
            });

            // front barrier
            this.restore(() => {
                this.moveTo(1.5 * this.thickness, 1.1 * this.thickness + this.burn + Math.sin(this.chuteAngle * Math.PI / 180) * 2 * this.thickness, 90);
                this.fingerHolesAt(0, 0, this.barrier_height, 0);
            });

            // fill with holes
            let border = [
                [2 * this.thickness, 0.5 * this.thickness + 2 * this.thickness * Math.tan(this.chuteAngle * Math.PI / 180) + 0.5 * this.thickness / Math.cos(this.chuteAngle * Math.PI / 180)],
                [this.depth, this.thickness + this.depth * Math.tan(this.chuteAngle * Math.PI / 180)],
                [this.depth, this.height],
                [this.thickness + 0.75 * this.canDiameter, this.height],
                [this.thickness + 0.75 * this.canDiameter, 0.5 * this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + this.thickness - (this.thickness + 0.75 * this.canDiameter) * Math.tan(this.chuteAngle * Math.PI / 180) + 0.5 * this.thickness / Math.cos(this.chuteAngle * Math.PI / 180)],
                [this.top_chute_depth * Math.cos(this.chuteAngle * Math.PI / 180), this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + this.thickness - this.top_chute_depth * Math.sin(this.chuteAngle * Math.PI / 180)],
                [this.top_chute_depth * Math.cos(this.chuteAngle * Math.PI / 180), this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height - this.top_chute_depth * Math.sin(this.chuteAngle * Math.PI / 180)],
                [this.thickness + 0.75 * this.canDiameter, 1.5 * this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height - (this.thickness + 0.75 * this.canDiameter) * Math.tan(this.chuteAngle * Math.PI / 180) - 0.5 * this.thickness / Math.cos(this.chuteAngle * Math.PI / 180)],
                [this.thickness + 0.75 * this.canDiameter, 2 * this.thickness + this.barrier_height],
                [2 * this.thickness, 2 * this.thickness + this.barrier_height],
            ];

            this.fillHoles({
                pattern: this.fillHoles_fill_pattern,
                border: border,
                max_radius: this.fillHoles_hole_max_radius,
                hspace: this.fillHoles_space_between_holes,
                bspace: this.fillHoles_space_to_border,
                min_radius: this.fillHoles_hole_min_radius,
                style: this.fillHoles_hole_style,
                bar_length: this.fillHoles_bar_length,
                max_random: this.fillHoles_max_random,
            });
        }
    }

    render() {
        this.chuteAngle = this.chuteAngle;

        this.pusherAngle = 30;  // angle of pusher
        this.pusherA = 0.75 * this.canDiameter;  // length of pusher
        this.pusherB = this.pusherA / Math.sin((180 - (90 + this.chuteAngle) - this.pusherAngle) * Math.PI / 180) * Math.sin(this.pusherAngle * Math.PI / 180);
        this.pusherC = this.pusherA / Math.sin((180 - (90 + this.chuteAngle) - this.pusherAngle) * Math.PI / 180) * Math.sin((90 + this.chuteAngle) * Math.PI / 180);

        this.addPart(new FrontEdge(this, this));
        this.addPart(new TopChuteEdge(this, this));
        this.addPart(new BarrierEdge(this, this));

        if (this.canDiameter < 8 * this.thickness) {
            this.edges["f"].settings.setValues(this.thickness, true, {finger: 1.0});
            this.edges["f"].settings.setValues(this.thickness, true, {space: 1.0});
        }
        this.edges["f"].settings.setValues(this.thickness, true, {surroundingspaces: 0.0});

        if (this.canDiameter < 4 * this.thickness) {
            throw new Error("Can diameter has to be at least 4 times the material thickness!");
        }

        if (this.canNum < 4) {
            throw new Error("4 cans is the minimum!");
        }

        this.depth = this.canDiameter * (Math.ceil(this.canNum / 2) + 0.1) + this.thickness;
        this.top_chute_height = Math.max(this.depth * Math.sin(this.chuteAngle * Math.PI / 180), 0.1 * this.canDiameter);
        this.top_chute_depth = (this.depth - 1.1 * this.canDiameter) / Math.cos(this.chuteAngle * Math.PI / 180);
        this.bottom_chute_height = Math.max((this.depth - 1.1 * this.canDiameter) * Math.sin(this.chuteAngle * Math.PI / 180), 0.1 * this.canDiameter);
        this.bottom_chute_depth = this.depth / Math.cos(this.chuteAngle * Math.PI / 180);
        this.barrier_height = Math.min(0.25 * this.canDiameter, this.bottom_chute_height + this.top_chute_height - this.thickness);

        if ((this.top_chute_depth + this.bottom_chute_height - this.thickness) < (this.barrier_height + this.canDiameter * 0.1)) {
            this.bottom_chute_height = this.barrier_height + this.canDiameter * 0.1 + this.thickness - this.top_chute_depth;
        }

        this.height = this.thickness + this.canDiameter + this.bottom_chute_height + this.top_chute_height + 0.5 * this.thickness + this.canDiameter + 1.5 * this.thickness;
        this.width = 0.01 * this.canHeight + this.canHeight + 0.01 * this.canHeight;
        let edgs = this.bottom_edge + "h" + this.top_edge + "a";

        // render your parts here
        this.rectangularWall(this.depth, this.height, edgs, {callback: (nr) => this.cb_sides(nr), move: "up", label: "right"});
        this.rectangularWall(this.depth, this.height, edgs, {callback: (nr) => this.cb_sides(nr), move: "up mirror", label: "left"});

        this.rectangularWall(this.bottom_chute_depth, this.width, "fefe", {callback: (nr) => this.cb_bottom_chute(nr), move: "up", label: "bottom chute"});
        this.rectangularWall(this.top_chute_depth, this.width, "fbfe", {callback: (nr) => this.cb_top_chute(nr), move: "up", label: "top chute"});

        this.rectangularWall(this.barrier_height, this.width, "fAfe", {move: "right", label: "barrier"});
        this.rectangularWall(this.height, this.width, "fefe", {callback: (nr) => this.cb_back(nr), move: "up", label: "back"});
        this.rectangularWall(this.barrier_height, this.width, "fefe", {move: "left only", label: "invisible"});

        if (this.top_edge !== "e") {
            this.rectangularWall(this.depth, this.width, "fefe", {callback: (nr) => this.cb_top(nr), move: "up", label: "top"});
        }

        let pusherH = this.pusherB * Math.cos(this.chuteAngle * Math.PI / 180) + this.thickness;
        let pusherV = this.pusherC * Math.cos(this.chuteAngle * Math.PI / 180) + this.thickness;

        this.move(pusherV, pusherH, {where: "right", before: true, label: "Pusher"});
        this.DrawPusher();
        this.move(pusherV, pusherH, {where: "right", before: false, label: "Pusher"});
        this.move(pusherV, pusherH, {where: "right", before: true, label: "Pusher"});
        this.DrawPusher();
        this.move(pusherV, pusherH, {where: "right", before: false, label: "Pusher"});
        this.move(pusherV, pusherH, {where: "up", before: true, label: "Pusher"});
        this.DrawPusher();
        this.text("Glue the Pusher pieces into slots on bottom\nand back plates to prevent stuck cans.", pusherV + 3, 0, {fontsize: 4, color: Color.ANNOTATIONS});
        this.move(pusherV, pusherH, {where: "up", before: false, label: "Pusher"});

        this.move(pusherV, pusherH, {where: "left only", before: true, label: "Pusher"});
        this.move(pusherV, pusherH, {where: "left only", before: true, label: "Pusher"});

        if (this.bottom_edge === "š") {
            this.rectangularWall(this.edges["š"].settings.width + 3 * this.thickness, this.edges["š"].settings.height - 4 * this.burn, "eeee", {move: "right", label: "Stabilizer 1"});
            this.rectangularWall(this.edges["š"].settings.width + 3 * this.thickness, this.edges["š"].settings.height - 4 * this.burn, "eeee", {move: "right", label: "Stabilizer 2"});
            this.rectangularWall(this.edges["š"].settings.width + 5 * this.thickness, this.edges["š"].settings.height - 4 * this.burn, "eeee", {move: "right", label: "Stabilizer 3"});
            this.rectangularWall(this.edges["š"].settings.width + 5 * this.thickness, this.edges["š"].settings.height - 4 * this.burn, "eeee", {move: "right", label: "Stabilizer 4"});
            this.text("Glue a stabilizer on the inside of each bottom\nside stacking foot for lateral stabilization.", 3, 0, {fontsize: 4, color: Color.ANNOTATIONS});
        }
    }
}

export { CanStorage };
export default CanStorage;
