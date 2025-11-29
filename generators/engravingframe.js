const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class EngravingFrame extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--EngravingWidth", {action: "store", type: "float", default: 100.0, help: "width of the visible part of the engraving in mm"});
        this.argparser.add_argument("--EngravingHeight", {action: "store", type: "float", default: 100.0, help: "height of the visible part of the engraving in mm"});
        this.argparser.add_argument("--EngravingThickness", {action: "store", type: "float", default: 5.0, help: "thickness of the engraving plate (and any acrylic window you may add) in mm"});
        this.argparser.add_argument("--Margin", {action: "store", type: "float", default: 1.0, help: "margin for the engraving plate insertion in mm"});
        this.argparser.add_argument("--FrameThickness", {action: "store", type: "float", default: 20.0, help: "width of the frame in mm"});
        this.argparser.add_argument("--FrameOuterCornersRadius", {action: "store", type: "float", default: 5.0, help: "radius of the frame outer corners in mm"});
        this.argparser.add_argument("--FrameInnerCornersRadius", {action: "store", type: "float", default: 5.0, help: "radius of the frame inner corners in mm"});
        this.argparser.add_argument("--AddCoveringFrontPlate", {action: "store", type: boolarg, default: true, help: "Add a covenring front plate to glue (hiding the finger joints)"});
        this.argparser.add_argument("--AddDummyFingers", {action: "store", type: boolarg, default: false, help: "Add dummy finger holes and plugs for the unity of the frame (if not covered)"});
        this.argparser.add_argument("--BackSupportAngle", {action: "store", type: "float", default: 10.0, help: "angle of the back support in degrees ; set 0 or negative value to ignore"});
    }

    backplate(move, label) {
        if (this.move(((this.EngravingWidth + this.Margin) + (this.thickness * 6)), ((this.EngravingHeight + this.Margin) + (this.thickness * 6)), move, true)) {
            return;
        }
        this.moveTo(this.thickness);
        this.polyline(this.thickness, 90, this.thickness, -90);
        this.edges["F"](((this.EngravingWidth + (this.thickness * 2)) + this.Margin));
        this.polyline(0, -90, this.thickness, 90, this.thickness, 90, this.thickness, -90, this.thickness, 90, this.thickness, 90, this.thickness, -90);
        this.edges["F"](((this.EngravingHeight + (this.thickness * 2)) + this.Margin));
        this.polyline(0, -90, this.thickness, 90, this.thickness, 90, this.thickness, -90, this.thickness, 90, this.thickness, 90, this.thickness, -90, ((this.EngravingWidth + (this.thickness * 2)) + this.Margin), -90, this.thickness, 90, this.thickness, 90, this.thickness, -90, this.thickness, 90, this.thickness, 90, this.thickness, -90);
        this.edges["F"](((this.EngravingHeight + (this.thickness * 2)) + this.Margin));
        this.polyline(0, -90, this.thickness, 90, this.thickness, 90, this.thickness, -90, this.thickness, 90);
        this.move(((this.EngravingWidth + this.Margin) + (this.thickness * 6)), ((this.EngravingHeight + this.Margin) + (this.thickness * 6)), move, {label: label});
    }

    frameplate(isCoverPlate, move, label) {
        if (this.move((this.EngravingWidth + (this.FrameThickness * 2)), (this.EngravingHeight + (this.FrameThickness * 2)), move, true)) {
            return;
        }
        this.rectangularHole((this.FrameThickness + (this.EngravingWidth / 2)), (this.FrameThickness + (this.EngravingHeight / 2)), this.EngravingWidth, this.EngravingHeight, {r: this.FrameInnerCornersRadius});
        if (!isCoverPlate) {
            this.fingerHolesAt(((this.FrameThickness - this.thickness) - (this.Margin / 2)), ((this.FrameThickness - (this.Margin / 2)) - (this.thickness * 1.5)), ((this.EngravingWidth + (this.thickness * 2)) + this.Margin), {angle: 0});
            this.fingerHolesAt(((this.FrameThickness - (this.Margin / 2)) - (this.thickness * 1.5)), ((this.FrameThickness - this.thickness) - (this.Margin / 2)), ((this.EngravingHeight + (this.thickness * 2)) + this.Margin), {angle: 90});
            this.fingerHolesAt((((this.FrameThickness + this.EngravingWidth) + (this.Margin / 2)) + (this.thickness * 1.5)), ((this.FrameThickness - this.thickness) - (this.Margin / 2)), ((this.EngravingHeight + (this.thickness * 2)) + this.Margin), {angle: 90});
            if (this.AddDummyFingers) {
                this.fingerHolesAt(((this.FrameThickness - this.thickness) - (this.Margin / 2)), (((this.FrameThickness + this.EngravingHeight) + (this.Margin / 2)) + (this.thickness * 1.5)), ((this.EngravingWidth + (this.thickness * 2)) + this.Margin), {angle: 0});
            }
        }
        this.moveTo(this.FrameOuterCornersRadius);
        this.polyline(((this.EngravingWidth + (this.FrameThickness * 2)) - (this.FrameOuterCornersRadius * 2)), [90, this.FrameOuterCornersRadius], ((this.EngravingHeight + (this.FrameThickness * 2)) - (this.FrameOuterCornersRadius * 2)), [90, this.FrameOuterCornersRadius], ((this.EngravingWidth + (this.FrameThickness * 2)) - (this.FrameOuterCornersRadius * 2)), [90, this.FrameOuterCornersRadius], ((this.EngravingHeight + (this.FrameThickness * 2)) - (this.FrameOuterCornersRadius * 2)), [90, this.FrameOuterCornersRadius]);
        this.move((this.EngravingWidth + (this.FrameThickness * 2)), (this.EngravingHeight + (this.FrameThickness * 2)), move, {label: label});
    }

    engravingPlate(move, label) {
        if (this.move((this.EngravingWidth + (this.thickness * 2)), (this.EngravingHeight + (this.thickness * 2)), move, true)) {
            return;
        }
        this.rectangularHole(this.thickness, this.thickness, this.EngravingWidth, this.EngravingHeight, 0, false, false, {color: Color.ANNOTATIONS});
        this.moveTo(this.thickness);
        this.polyline(this.EngravingWidth, [90, this.thickness], this.EngravingHeight, [90, this.thickness], this.EngravingWidth, [90, this.thickness], this.EngravingHeight, [90, this.thickness]);
        this.move((this.EngravingWidth + (this.thickness * 2)), (this.EngravingHeight + (this.thickness * 2)), move, {label: label});
    }

    supportFoot(move, label) {
        if (this.move(((this.H * Math.tan(this.a)) + (this.thickness * 4)), (this.thickness * 5), move, true)) {
            return;
        }
        this.fingerHolesAt((this.thickness * 0), (this.thickness * 2.5), ((this.H * Math.tan(this.a)) + (this.thickness * 2)), 0);
        this.polyline(((this.H * Math.tan(this.a)) + (this.thickness * 4)), [90, this.thickness], (this.thickness * 3), [90, this.thickness], ((this.H * Math.tan(this.a)) + (this.thickness * 4)), [90, this.thickness], (this.thickness * 3), [90, this.thickness]);
        this.move(((this.H * Math.tan(this.a)) + (this.thickness * 4)), (this.thickness * 5), move, {label: label});
    }

    supportHorizontalPlate(move, label) {
        if (this.move((((this.L * Math.tan(this.a)) + (this.thickness * 2)) + this.Margin), (this.thickness * 3), move, true)) {
            return;
        }
        this.rectangularHole((this.thickness * 1.5), (this.thickness * 1.5), (this.thickness + this.Margin), (this.thickness + this.Margin));
        this.polyline((((this.L * Math.tan(this.a)) + (this.thickness * 2)) + this.Margin), 90, (this.thickness + (this.burn / 2)), 90, ((this.L * Math.tan(this.a)) / 2), -90, (this.thickness - this.burn), -90, ((this.L * Math.tan(this.a)) / 2), 90, (this.thickness + (this.burn / 2)), 90, (((this.L * Math.tan(this.a)) + (this.thickness * 2)) + this.Margin), 90, (this.thickness * 3), 90);
        this.move((((this.L * Math.tan(this.a)) + (this.thickness * 2)) + this.Margin), (this.thickness * 3), move, {label: label});
    }

    supportVerticalPlate(move, label) {
        if (this.move((this.H / Math.cos(this.a)), ((this.H * Math.tan(this.a)) + (this.thickness * 2)), move, true)) {
            return;
        }
        this.polyline((this.L + (this.burn / 2)), 90, ((this.L * Math.tan(this.a)) / 2), -90, (this.thickness - this.burn), -90, ((this.L * Math.tan(this.a)) / 2), 90, ((this.thickness + ((this.H * Math.tan(this.a)) * Math.sin(this.a))) + (this.burn / 2)), (90 + this.BackSupportAngle));
        this.edges["f"](((this.H * Math.tan(this.a)) + (this.thickness * 2)));
        this.polyline(0, 90, ((this.thickness * 3) + (this.burn / 2)), 90, this.thickness, -90, (this.thickness - this.burn), -90, this.thickness, 90, ((this.H - (this.thickness * 7)) + this.burn), 90, this.thickness, -90, (this.thickness - this.burn), -90, this.thickness, 90, (this.thickness + (this.burn / 2)), [90, this.thickness], this.thickness, (90 - this.BackSupportAngle));
        this.move((this.H / Math.cos(this.a)), ((this.H * Math.tan(this.a)) + (this.thickness * 2)), move, {label: label});
    }

    supportVerticalSpacer(length, move, label) {
        if (this.move(((length + this.Margin) + (this.thickness * 6)), (this.thickness * 2), move, true)) {
            return;
        }
        this.polyline(((length + this.Margin) + (this.thickness * 6)), [180, this.thickness], (this.thickness + (this.burn / 2)), 90, this.thickness, -90, (this.thickness - this.burn), -90, this.thickness, 90, (((length + this.Margin) + (this.thickness * 2)) + this.burn), 90, this.thickness, -90, (this.thickness - this.burn), -90, this.thickness, 90, (this.thickness + (this.burn / 2)), [180, this.thickness]);
        this.move(((length + this.Margin) + (this.thickness * 6)), (this.thickness * 2), move, {label: label});
    }

    render() {
        this.a = ((this.BackSupportAngle * Math.PI) / 180);
        this.L = Math.min((this.EngravingWidth + (this.thickness * 3)), (this.EngravingHeight + (this.thickness * 3)));
        this.H = (((2 * this.thickness) + this.L) / Math.cos(this.a));
        if (this.AddCoveringFrontPlate) {
            this.frameplate(true, "up", "frame cover");
        }
        this.frameplate(false, "up", "frame plate");
        if (this.AddDummyFingers) {
            this.rectangularWall((this.EngravingWidth + (this.thickness * 2)), 0, "eefe", {move: "up", label: "dummy fingers"});
        }
        this.backplate({move: "up", label: "back plate"});
        this.rectangularWall(((this.EngravingHeight + (this.thickness * 2)) + this.Margin), (this.EngravingThickness + this.Margin), "fEfE", {move: "up", label: "side"});
        this.rectangularWall(((this.EngravingHeight + (this.thickness * 2)) + this.Margin), (this.EngravingThickness + this.Margin), "fEfE", {move: "mirror up", label: "side"});
        this.rectangularWall(((this.EngravingWidth + (this.thickness * 2)) + this.Margin), (this.EngravingThickness + this.Margin), "fefe", {move: "up", label: "bottom"});
        this.engravingPlate({move: "up", label: "engraving plate"});
        if (this.BackSupportAngle > 0) {
            let x = 1;
            this.supportFoot({move: "up", label: "foot"});
            this.supportFoot({move: "up", label: "foot"});
            this.supportHorizontalPlate("up", "support horizontal");
            this.supportHorizontalPlate("up", "support horizontal");
            this.supportVerticalPlate("up", "support vertical");
            this.supportVerticalPlate("up", "support vertical");
            this.supportVerticalSpacer(this.EngravingWidth, "up", "spacer width");
            this.supportVerticalSpacer(this.EngravingWidth, "up", "spacer width");
            this.supportVerticalSpacer(this.EngravingHeight, "up", "spacer height");
            this.supportVerticalSpacer(this.EngravingHeight, "up", "spacer height");
        }
    }

}

module.exports.EngravingFrame = EngravingFrame;