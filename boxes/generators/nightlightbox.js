import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class NightLightBox extends _TopEdge {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1});
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.HingeSettings, {outset: true, pinwidth: 0.4, style: "flush", axle: 2.5});
        this.argparser.add_argument("--BoxStyle", {action: "store", type: "str", default: "large face", choices: ["minimalist", "large face", "extra customizable face"], help: "style of the front lock"});
        this.argparser.add_argument("--PlateVisibleWidth", {action: "store", type: "float", default: 150.0, help: "width of the window in the front panel in mm"});
        this.argparser.add_argument("--PlateVisibleHeight", {action: "store", type: "float", default: 75.0, help: "height of the window in the front panel in mm"});
        this.argparser.add_argument("--WoodPlatesCount", {action: "store", type: "int", default: 3, help: "Number of decorative wood plates"});
        this.argparser.add_argument("--WoodPlateThickness", {action: "store", type: "float", default: 5.0, help: "Thickness of the wood plates in mm"});
        this.argparser.add_argument("--DiffuserPlateThickness", {action: "store", type: "float", default: 5.0, help: "Thickness of the background acrylic diffuser plate in mm"});
        this.argparser.add_argument("--BackgroundDepth", {action: "store", type: "float", default: 40.0, help: "Depth of the background zone for the electronics and LEDs in mm"});
        this.argparser.add_argument("--InterPlateSpacing", {action: "store", type: "float", default: 10, help: "Space between the decorative plates in mm"});
        this.argparser.add_argument("--hooks", {action: "store", type: boolarg, default: false, help: "add hooks to decorative plates (allowing one sides plates)"});
        this.argparser.add_argument("--Margin", {action: "store", type: "float", default: 0.5, help: "Margin for moving parts in mm"});
        let DiffuserPlateLock_group = this.argparser.add_argument_group("Night lightbox diffuser plate lock to prevent unwanted access to the electronics");
        DiffuserPlateLock_group.add_argument("--DiffuserPlateTLockScrewDiameter", {action: "store", type: "float", default: 3.0, help: "Diameter of the background acrylic diffuser plate locking screw hole in mm"});
        DiffuserPlateLock_group.add_argument("--DiffuserPlateTLockScrewLength", {action: "store", type: "float", default: 20.0, help: "Length of the background acrylic diffuser plate locking screw in mm"});
        DiffuserPlateLock_group.add_argument("--DiffuserPlateTLockNutThickness", {action: "store", type: "float", default: 2.1, help: "Thickness of the background acrylic diffuser plate locking nut in mm"});
        DiffuserPlateLock_group.add_argument("--DiffuserPlateTLockNutWidth", {action: "store", type: "float", default: 5.1, help: "Width of the background acrylic diffuser plate locking nut in mm"});
        let BackSideOptions_group = this.argparser.add_argument_group("Night lightbox options for the back side (holes for connectors, marking)");
        BackSideOptions_group.add_argument("--BackExtraHoles", {action: "store", type: "str", default: "R 20 15 11.5 8
C 11.58 15 3
C 28.42 15 3", help: "extra holes for connectors or buttons ; enter one line per hole ; first parameter should be R for rectangle or C for circle ; then X and Y position for the center of the hole, and then the X and Y size of the rectangle or the circle diameter, all in mm ; parameters should be separated by spaces"});
    }

    railSlots(xSize, ySize) {
        let t = this.thickness;
        this.fingerHolesAt((t * 1.5), ((this.InterPlateSpacing - t) - (this.Margin / 2)), (((t * 2) + this.DiffuserPlateThickness) + ((this.InterPlateSpacing + this.WoodPlateThickness) * this.WoodPlatesCount)));
        this.fingerHolesAt((xSize - (t * 1.5)), ((this.InterPlateSpacing - t) - (this.Margin / 2)), (((t * 2) + this.DiffuserPlateThickness) + ((this.InterPlateSpacing + this.WoodPlateThickness) * this.WoodPlatesCount)));
    }

    woodPlate(move, label) {
        let t = this.thickness;
        if (this.move((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 6 : 10))), (this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? 4 : 8))), move, true)) {
            return;
        }
        if (this.BoxStyle === "minimalist") {
            this.rectangularHole((t * 3), (t * 2), this.PlateVisibleWidth, this.PlateVisibleHeight, {center_x: false, center_y: false, color: Color.ANNOTATIONS});
        }
        else {
            this.rectangularHole((t * 5), (t * 4), this.PlateVisibleWidth, this.PlateVisibleHeight, {center_x: false, center_y: false, color: Color.ANNOTATIONS});
        }
        this.moveTo((t + (this.Margin / 2)), 0, 0);
        this.polyline((t - this.Margin), 90, (t + this.Margin), -90, (t + this.Margin), -90, (t + this.Margin), 90, ((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 0 : 4))) - this.Margin), 90, (t + this.Margin), -90, (t + this.Margin), -90, (t + this.Margin), 90, (t - this.Margin), 90);
        this.polyline(((this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? 2 : 6))) + this.Margin), -90, (t + (this.Margin / 2)));
        if (this.hooks) {
            this.polyline(0, -90, t, 90, 0, [90, t], t, [90, t]);
        }
        else {
            this.polyline(0, 90, ((t * 2) - (this.Margin * 2)), 90);
        }
        this.polyline((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 6 : 10))));
        if (this.hooks) {
            this.polyline(0, [90, t], t, [90, t], 0, 90, t, -90);
        }
        else {
            this.polyline(0, 90, ((t * 2) - (this.Margin * 2)), 90);
        }
        this.polyline((t + (this.Margin / 2)), -90, ((this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? 2 : 6))) + this.Margin), 90);
        this.move((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 6 : 10))), (this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? 4 : 8))), move, {label: label});
    }

    boltAndScrewHole() {
        let t = this.thickness;
        this.polyline(0, 90, t, 90, ((this.DiffuserPlateTLockNutWidth / 2) - (this.DiffuserPlateTLockScrewDiameter / 2)), -90, this.DiffuserPlateTLockNutThickness, -90, ((this.DiffuserPlateTLockNutWidth / 2) - (this.DiffuserPlateTLockScrewDiameter / 2)), 90, ((this.DiffuserPlateTLockScrewLength - this.DiffuserPlateTLockNutThickness) - (t * 2)), -90, this.DiffuserPlateTLockScrewDiameter, -90, ((this.DiffuserPlateTLockScrewLength - this.DiffuserPlateTLockNutThickness) - (t * 2)), 90, ((this.DiffuserPlateTLockNutWidth / 2) - (this.DiffuserPlateTLockScrewDiameter / 2)), -90, this.DiffuserPlateTLockNutThickness, -90, ((this.DiffuserPlateTLockNutWidth / 2) - (this.DiffuserPlateTLockScrewDiameter / 2)), 90, t, 90);
    }

    diffuserPlate(move, label) {
        let t = this.thickness;
        if (this.move((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 4 : 8))), (this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? 4 : 8))), move, true)) {
            return;
        }
        this.polyline((t - this.Margin), 90, (t + this.Margin), -90, (t + this.Margin), -90, (t + this.Margin), 90, ((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 0 : 4))) - this.Margin), 90, (t + this.Margin), -90, (t + this.Margin), -90, (t + this.Margin), 90, (t - this.Margin), 90);
        this.edge(((t * 6) - (this.DiffuserPlateTLockScrewDiameter / 2)));
        this.boltAndScrewHole();
        this.polyline((((this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? -2 : 2))) - this.Margin) - (this.DiffuserPlateTLockScrewDiameter / 2)), 90);
        this.polyline(((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 4 : 8))) - this.Margin), 90);
        this.edge((((this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? -2 : 2))) - this.Margin) - (this.DiffuserPlateTLockScrewDiameter / 2)));
        this.boltAndScrewHole();
        this.polyline(((t * 6) - (this.DiffuserPlateTLockScrewDiameter / 2)), 90);
        this.move((this.PlateVisibleWidth + (t * (this.BoxStyle === "minimalist" ? 4 : 8))), (this.PlateVisibleHeight + (t * (this.BoxStyle === "minimalist" ? 4 : 8))), move, {label: label});
    }

    elecCompartmentTop(move, label) {
        let t = this.thickness;
        if (this.move((((t * 4) + this.PlateVisibleWidth) + this.Margin), ((this.BackgroundDepth - (t * 2.5)) - this.Margin), move, true)) {
            return;
        }
        this.polyline((((t * (this.BoxStyle === "minimalist" ? 4 : 8)) + this.PlateVisibleWidth) + this.Margin), 90);
        this.edge((t * 1.5));
        this.edges["f"](((this.BackgroundDepth - (t * 5)) - this.Margin));
        this.corner(90);
        this.polyline((((t * (this.BoxStyle === "minimalist" ? 4 : 8)) + this.PlateVisibleWidth) + this.Margin), 90);
        this.edges["f"](((this.BackgroundDepth - (t * 5)) - this.Margin));
        this.polyline((t * 1.5), 90);
        this.move((((t * 4) + this.PlateVisibleWidth) + this.Margin), ((this.BackgroundDepth - (t * 2.5)) - this.Margin), move, {label: label});
    }

    side(ySize, hSize, move, label) {
        let t = this.thickness;
        let be = this.edges["s"];
        if (this.move((ySize + t), (hSize + (t * 4)), move, true)) {
            return;
        }
        if (this.BoxStyle === "minimalist") {
            this.rectangularHole(((((ySize - this.BackgroundDepth) - this.DiffuserPlateThickness) - t) - (this.Margin * 1.5)), (this.PlateVisibleHeight + (t * 4)), t, t, {center_x: false, center_y: false});
        }
        else {
            this.rectangularHole(((((ySize - this.BackgroundDepth) - this.DiffuserPlateThickness) - t) - (this.Margin * 1.5)), (this.PlateVisibleHeight + (t * 8)), t, t, {center_x: false, center_y: false});
        }
        this.hole((((ySize - this.BackgroundDepth) - (this.DiffuserPlateThickness / 2)) - (this.Margin / 2)), (t * 10), (this.DiffuserPlateTLockScrewDiameter / 2));
        be(ySize);
        this.corner(90);
        this.edge(be.endwidth());
        this.edges["f"](hSize);
        this.corner(90);
        this.edges["i"].settings.style = "flush_inset";
        this.edges["i"]((t * 5));
        this.edges["F"](((this.BackgroundDepth - (t * 5)) - (this.Margin / 2)));
        this.polyline(((this.DiffuserPlateThickness + this.InterPlateSpacing) + (this.Margin / 2)), 90);
        for (let i = 0; i < this.WoodPlatesCount; i += 1) {
            this.polyline(((t * 2) + this.Margin), -90, (this.WoodPlateThickness + this.Margin), -90, ((t * 2) + this.Margin), 90, (this.InterPlateSpacing - this.Margin), 90);
        }
        this.edges["f"](hSize);
        this.edge(be.startwidth());
        this.corner(90);
        this.move((ySize + t), (hSize + (t * 8)), move, {label: label});
    }

    rail(move, label) {
        let t = this.thickness;
        if (this.move((((this.WoodPlatesCount * (this.InterPlateSpacing + this.WoodPlateThickness)) + this.DiffuserPlateThickness) + (t * 2)), (t * 3), move, true)) {
            return;
        }
        this.edges["f"]((((t * 2) + this.DiffuserPlateThickness) + ((this.InterPlateSpacing + this.WoodPlateThickness) * this.WoodPlatesCount)));
        this.corner(90);
        this.polyline((t * 2), 90);
        this.polyline((t - (this.Margin / 2)), 90);
        for (let i = 0; i < this.WoodPlatesCount; i += 1) {
            this.polyline((t + this.Margin), -90, (this.WoodPlateThickness + this.Margin), -90, (t + this.Margin), 90, (this.InterPlateSpacing - this.Margin), 90);
        }
        this.polyline((t + this.Margin), -90, (this.DiffuserPlateThickness + this.Margin), -90, (t + this.Margin), 90, (t - (this.Margin / 2)), 90);
        this.polyline((t * 2), 90);
        this.move((((this.WoodPlatesCount * (this.InterPlateSpacing + this.WoodPlateThickness)) + this.DiffuserPlateThickness) + (t * 2)), (t * 3), move, {label: label});
    }

    backExtraHoles() {
        for (let line of this.BackExtraHoles.split("
")) {
            let holeParams = line.split(" ");
            if (line[0] === "R") {
                this.rectangularHole(float(holeParams[1]), float(holeParams[2]), float(holeParams[3]), float(holeParams[4]));
            }
            else {
                if (line[0] === "C") {
                    this.hole(float(holeParams[1]), float(holeParams[2]), (float(holeParams[3]) / 2));
                }
            }
        }
    }

    render() {
        let t = this.thickness;
        let y = (((this.BackgroundDepth + this.DiffuserPlateThickness) + ((this.WoodPlateThickness + this.InterPlateSpacing) * this.WoodPlatesCount)) + this.InterPlateSpacing);
        let x, h;
        if (this.BoxStyle === "minimalist") {
            x = (((t * 4) + this.PlateVisibleWidth) + this.Margin);
            h = ((this.PlateVisibleHeight + (t * 4)) + this.Margin);
        }
        else {
            x = (((t * 8) + this.PlateVisibleWidth) + this.Margin);
            h = ((this.PlateVisibleHeight + (t * 8)) + this.Margin);
        }
        this.ctx.save();
        this.side(y, h, {move: "mirror", label: "left"});
        this.side(y, h, {move: "left up", label: "right"});
        this.rail({move: "up", label: "rail"});
        this.rail({move: "up mirror", label: "rail"});
        this.rectangularWall(x, y, "ffff", {callback: [() => this.railSlots(x, y)], move: "up", label: "bottom"});
        this.rectangularWall(x, h, "sFeF", {callback: [() => this.backExtraHoles()], move: "up", label: "back"});
        if (this.BoxStyle === "extra customizable face") {
            this.rectangularWall(x, h, "sFeF", {callback: [() => this.rectangularHole((((this.PlateVisibleWidth / 2) + (t * 4)) + (this.Margin / 2)), ((this.PlateVisibleHeight / 2) + (t * 4)), this.PlateVisibleWidth, this.PlateVisibleHeight), () => this.rectangularHole((t * 1.5), (t * 1.5), t, t), () => this.rectangularHole((((this.PlateVisibleWidth / 2) + (t * 4)) + (this.Margin / 2)), (t * 1.5), t, t), () => this.rectangularHole(((this.PlateVisibleHeight + (t * 6.5)) + this.Margin), (t * 1.5), t, t)], move: "up", label: "front"});
            this.rectangularWall(x, h, "EEEE", {callback: [() => this.rectangularHole((((this.PlateVisibleWidth / 2) + (t * 4)) + (this.Margin / 2)), ((this.PlateVisibleHeight / 2) + (t * 4)), this.PlateVisibleWidth, this.PlateVisibleHeight), () => this.rectangularHole((t * 1.5), (t * 1.5), t, t), () => this.rectangularHole((((this.PlateVisibleWidth / 2) + (t * 4)) + (this.Margin / 2)), (t * 1.5), t, t), () => this.rectangularHole(((this.PlateVisibleHeight + (t * 6.5)) + this.Margin), (t * 1.5), t, t)], move: "up", label: "customizable face"});
            this.rectangularWall((t * 2), t, {move: "up"});
            this.rectangularWall((t * 2), t, {move: "up"});
        }
        else {
            if (this.BoxStyle === "minimalist") {
                this.rectangularWall(x, h, "sFeF", {callback: [() => this.rectangularHole(((this.PlateVisibleWidth / 2) + (t * 2)), ((this.PlateVisibleHeight / 2) + (t * 2)), this.PlateVisibleWidth, this.PlateVisibleHeight)], move: "up", label: "front"});
            }
            else {
                this.rectangularWall(x, h, "sFeF", {callback: [() => this.rectangularHole(((this.PlateVisibleWidth / 2) + (t * 4)), ((this.PlateVisibleHeight / 2) + (t * 4)), this.PlateVisibleWidth, this.PlateVisibleHeight)], move: "up", label: "front"});
            }
        }
        this.elecCompartmentTop({move: "up", label: "elec. comp."});
        this.rectangularWall((t * 2), t, "eeee", {move: "up", label: "guide"});
        this.rectangularWall((t * 2), t, "eeee", {move: "up", label: "guide"});
        this.drawLid((y - t), x, "i");
        this.diffuserPlate({move: "up", label: "Diffuser"});
        for (let i = 0; i < this.WoodPlatesCount; i += 1) {
            this.woodPlate({move: "up", label: "Insert cut and
engraved art here"});
        }
    }

}

export { NightLightBox };