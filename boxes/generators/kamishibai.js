const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { HingeSettings } = require('../edges');

class Kamishibai extends _TopEdge {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.5});
        this.addSettingsArgs(edges.SlideOnLidSettings, {hole_width: 15.0, spring: "none", second_pin: true, play: 0.1});
        this.addSettingsArgs(edges.HingeSettings, {outset: true, pinwidth: 0.4, style: "flush", axle: 2.5, hingestrength: 1});
        this.argparser.add_argument("--SheetWidth", {action: "store", type: "float", default: 297.0, help: "width of the sheets in mm"});
        this.argparser.add_argument("--SheetHeight", {action: "store", type: "float", default: 210.0, help: "height of the sheets in mm"});
        this.argparser.add_argument("--SheetsStackDepth", {action: "store", type: "float", default: 30.0, help: "Depth of the sheets stack in mm"});
        this.argparser.add_argument("--FrameThickness", {action: "store", type: "float", default: 20.0, help: "Frame thickness in mm"});
        this.argparser.add_argument("--FrameCornerRadius", {action: "store", type: "float", default: 5.0, help: "Radius of the frame corners in mm"});
        this.argparser.add_argument("--Margin", {action: "store", type: "float", default: 2.0, help: "Margin for sheets and moving parts in mm"});
        this.argparser.add_argument("--HandleThickness", {action: "store", type: "int", default: 2, help: "Thickness of the top handle in multiples of thickness (Set to 0 for no handle)"});
        this.argparser.add_argument("--HandleWidth", {action: "store", type: "float", default: 120.0, help: "Width of the top handle in mm (Set to 0 for no handle) ; the SheetStackDepth should be at least 4 x thickness more"});
        this.argparser.add_argument("--HandleMargin", {action: "store", type: "float", default: 0.0, help: "Margin for the top handle in mm (Set to 0 for no margin)"});
        this.argparser.add_argument("--BackExtraDepth", {action: "store", type: "int", default: 4, help: "Back extra depth (for adding buttons for example), in multiples of thickness ; set to 0 to let the system calculate the smallest one"});
        this.argparser.add_argument("--PegsWidthMargin", {action: "store", type: "float", default: 0.5, help: "Margin for the pegs width in mm ; set to a lower value if the pieces are forced together, a higher value if the pieces slide easily into each other (using screws or glue to assemble)"});
        let front_group = this.argparser.add_argument_group("Kamishibai front cover");
        front_group.add_argument("--FrontCoverStyle", {action: "store", type: "str", default: "two-part lid with hinge eyes (both ends)", choices: ["slide-on lid", "two-part lid with hinge eyes (both ends)", "three-part lid, hinges not provided"], help: "style of the front cover"});
        front_group.add_argument("--FrontExtraDepth", {action: "store", type: "int", default: 4, help: "Front extra depth (for attaching hinges for example), in multiples of thickness ; set to 0 to ignore or let the system calculate the smallest one"});
        front_group.add_argument("--FrontLockStyle", {action: "store", type: "str", default: "with key", choices: ["none", "simple", "with key"], help: "style of the front lock"});
        front_group.add_argument("--FrontExtraTopAndBottomLocks", {action: "store", type: boolarg, default: true, help: "Add front extra locks at the top and bottom"});
        let hinges_3panes_group = this.argparser.add_argument_group("Kamishibai 3 pane cover hinge holes");
        hinges_3panes_group.add_argument("--HingeHolesDiameter", {action: "store", type: "float", default: 2.5, help: "Hinge hole diameter in mm (set to 0 for no holes)"});
        hinges_3panes_group.add_argument("--HingeHolesCoverEdgeDistance", {action: "store", type: "float", default: 5.5, help: "distance of the cover holes from the edge to the holes centers in mm"});
        hinges_3panes_group.add_argument("--HingeHolesBoxEdgeDistance", {action: "store", type: "float", default: 7.0, help: "distance of the box holes from the edge to the holes centers in mm"});
        hinges_3panes_group.add_argument("--HingeHolesCoverSeparation", {action: "store", type: argparseSections, default: "24.0:12.0", help: "separation of the cover holes from one another's center in mm (section parameter type) ; the first item is the distance from the border"});
        hinges_3panes_group.add_argument("--HingeHolesBoxSeparation", {action: "store", type: argparseSections, default: "15.0:30.0", help: "separation of the box holes from one another's center in mm (section parameter type) ; the first item is the distance from the border"});
        let ScrewsLocking_group = this.argparser.add_argument_group("Screws parameters for attaching the pieces together");
        ScrewsLocking_group.add_argument("--LockScrewDiameter", {action: "store", type: "float", default: 0.0, help: "Diameter of the screw holes in mm (set to 0 for no screws)"});
        ScrewsLocking_group.add_argument("--TopLockScrewLength", {action: "store", type: "float", default: 16.0, help: "Length of the top locking screws in mm"});
        ScrewsLocking_group.add_argument("--BottomLockScrewLength", {action: "store", type: "float", default: 13.0, help: "Length of the bottom locking screws in mm"});
        ScrewsLocking_group.add_argument("--DoorFeetScrewLength", {action: "store", type: "float", default: 16.0, help: "Length of the door feet screws in mm (set to 0 for no screws)"});
        ScrewsLocking_group.add_argument("--LockNutThickness", {action: "store", type: "float", default: 2.4, help: "Thickness of the locking nuts in mm"});
        ScrewsLocking_group.add_argument("--LockNutWidth", {action: "store", type: "float", default: 5.5, help: "Width of the locking nuts in mm"});
        ScrewsLocking_group.add_argument("--LockScrewDistanceFromBorder", {action: "store", type: "float", default: 11, help: "Distance of the screw axis from the side border (in multiples of thickness)"});
        ScrewsLocking_group.add_argument("--LockScrewExtraFeetScewDiameter", {action: "store", type: "float", default: 3.0, help: "Diameter of the screw holes for extra feet at the corners, in mm (set to 0 for no screws)"});
        ScrewsLocking_group.add_argument("--LockScrewExtraFeetDistanceFromBorder", {action: "store", type: "float", default: 7.0, help: "Distance from the border for the axis of the extra feet at the corners, in mm (set to 0 for no screws)"});
    }

    screwAttachement(LockScrewLength) {
        this.polyline(0, 90, this.thickness, 90, ((this.LockNutWidth / 2) - (this.LockScrewDiameter / 2)), -90, this.LockNutThickness, -90, ((this.LockNutWidth / 2) - (this.LockScrewDiameter / 2)), 90, ((LockScrewLength - this.LockNutThickness) - this.thickness), -90, this.LockScrewDiameter, -90, ((LockScrewLength - this.LockNutThickness) - this.thickness), 90, ((this.LockNutWidth / 2) - (this.LockScrewDiameter / 2)), -90, this.LockNutThickness, -90, ((this.LockNutWidth / 2) - (this.LockScrewDiameter / 2)), 90, this.thickness, 90);
    }

    boxFrontBackCallback(wi, hi, isFront) {
        this.rectangularHole(((this.thickness * 2) + this.FrameThickness), this.FrameThickness, (wi - (this.FrameThickness * 2)), (((hi - this.Margin) - (this.FrameThickness * 2)) - (this.thickness * (this.HandleThickness > 0 ? 2 : 0))), this.FrameCornerRadius, false, false);
        if (this.HandleThickness > 0) {
            this.fingerHolesAt((this.thickness * 2), (hi - (this.thickness * 1.5)), (this.thickness * 4), 0);
            this.fingerHolesAt((wi - (this.thickness * 2)), (hi - (this.thickness * 1.5)), (this.thickness * 4), 0);
            this.fingerHolesAt((((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 0)), (hi - (this.thickness * 1.5)), (this.thickness * 4), 0);
            this.fingerHolesAt((((wi / 2) + (this.HandleWidth / 2)) - (this.thickness * 0)), (hi - (this.thickness * 1.5)), (this.thickness * 4), 0);
        }
        if (((isFront && this.FrontExtraDepth > 0) || !isFront)) {
            this.fingerHolesAt((this.thickness * 1.5), (this.thickness * 0), hi);
            this.fingerHolesAt(((this.thickness * 2.5) + wi), (this.thickness * 0), hi);
        }
        else {
            if (((this.HingeHolesDiameter > 0 && (isFront && this.FrontCoverStyle === "three-part lid, higes not provided")) || (!isFront && this.BackCoverStyle === "three-part lid, higes not provided"))) {
                let posx = this.thickness;
                for (let x of this.HingeHolesBoxSeparation) {
                    posx += x;
                    this.hole(posx, ((hi + this.thickness) - this.HingeHolesBoxEdgeDistance), (this.HingeHolesDiameter / 2));
                    this.hole(((wi + (this.thickness * 4)) - posx), ((hi + this.thickness) - this.HingeHolesBoxEdgeDistance), (this.HingeHolesDiameter / 2));
                }
                let posy = -this.thickness;
                for (let y of this.HingeHolesBoxSeparation) {
                    posy += y;
                    this.hole((this.HingeHolesBoxEdgeDistance + this.thickness), posy, (this.HingeHolesDiameter / 2));
                    this.hole((this.HingeHolesBoxEdgeDistance + this.thickness), ((((hi - this.Margin) * 3) / 4) - posy), (this.HingeHolesDiameter / 2));
                    this.hole(((wi + (this.thickness * 3)) - this.HingeHolesBoxEdgeDistance), posy, (this.HingeHolesDiameter / 2));
                    this.hole(((wi + (this.thickness * 3)) - this.HingeHolesBoxEdgeDistance), ((((hi - this.Margin) * 3) / 4) - posy), (this.HingeHolesDiameter / 2));
                }
            }
        }
    }

    boxFrontBack(wi, hi, isFront, move, label) {
        if (this.LockScrewDiameter > 0) {
            if (this.move((wi + (this.thickness * 6)), (hi + (this.thickness * 3)), move, true)) {
                return;
            }
            this.boxFrontBackCallback(wi, hi, isFront);
            this.moveTo((-this.thickness * 2), 0);
            this.edge((this.thickness * 2));
            this.edges["f"](((this.thickness * (this.LockScrewDistanceFromBorder - 3)) - this.LockScrewDiameter));
            this.edge((this.LockScrewDiameter / 2));
            this.screwAttachement((this.BottomLockScrewLength - this.thickness));
            this.edge((this.LockScrewDiameter / 2));
            this.edges["f"]((((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)));
            this.edge((this.LockScrewDiameter / 2));
            this.screwAttachement((this.BottomLockScrewLength - this.thickness));
            this.edge((this.LockScrewDiameter / 2));
            this.edges["f"]((((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)));
            this.edge((this.LockScrewDiameter / 2));
            this.screwAttachement((this.BottomLockScrewLength - this.thickness));
            this.edge((this.LockScrewDiameter / 2));
            this.edges["f"](((this.thickness * (this.LockScrewDistanceFromBorder - 3)) - this.LockScrewDiameter));
            this.polyline((this.thickness * 2), 90);
            this.edges["N"](hi);
            this.corner(90);
            this.edges["f"](((this.thickness * ((this.LockScrewDistanceFromBorder - 3) - edges.SlideOnLidSettings.relative_params["play"])) - this.LockScrewDiameter));
            this.edge((this.LockScrewDiameter / 2));
            this.screwAttachement((this.TopLockScrewLength - this.thickness));
            this.edge((this.LockScrewDiameter / 2));
            this.edges["f"]((((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)));
            this.edge((this.LockScrewDiameter / 2));
            this.screwAttachement((this.TopLockScrewLength - this.thickness));
            this.edge((this.LockScrewDiameter / 2));
            this.edges["f"]((((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)));
            this.edge((this.LockScrewDiameter / 2));
            this.screwAttachement((this.TopLockScrewLength - this.thickness));
            this.edge((this.LockScrewDiameter / 2));
            this.edges["f"](((this.thickness * ((this.LockScrewDistanceFromBorder - 3) - edges.SlideOnLidSettings.relative_params["play"])) - this.LockScrewDiameter));
            this.corner(90);
            this.edges["M"](hi);
            this.corner(90);
            this.move((wi + (this.thickness * 6)), (hi + (this.thickness * 3)), move, {label: label});
        }
        else {
            this.rectangularWall((wi + (this.thickness * 4)), hi, "fNfM", {callback: [() => this.boxFrontBackCallback(wi, hi, isFront)], move: move, label: label});
        }
    }

    boxTopBottom(wi, di, isTop, move, label) {
        if (this.move((wi + (this.thickness * 8)), ((di + (this.thickness * ((this.FrontExtraDepth + this.BackExtraDepth) + 6))) + (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)" ? (this.thickness * 3) : 0)), move, true)) {
            return;
        }
        if (this.LockScrewDiameter > 0) {
            this.hole((this.thickness * (this.LockScrewDistanceFromBorder - 1)), (this.thickness * (this.BackExtraDepth + 2.5)), (this.LockScrewDiameter / 2));
            this.hole(((wi / 2) + (this.thickness * 4)), (this.thickness * (this.BackExtraDepth + 2.5)), (this.LockScrewDiameter / 2));
            this.hole((wi - (this.thickness * (this.LockScrewDistanceFromBorder - 9))), (this.thickness * (this.BackExtraDepth + 2.5)), (this.LockScrewDiameter / 2));
            this.hole((this.thickness * (this.LockScrewDistanceFromBorder - 1)), (di + (this.thickness * (this.BackExtraDepth + 3.5))), (this.LockScrewDiameter / 2));
            this.hole(((wi / 2) + (this.thickness * 4)), (di + (this.thickness * (this.BackExtraDepth + 3.5))), (this.LockScrewDiameter / 2));
            this.hole((wi - (this.thickness * (this.LockScrewDistanceFromBorder - 9))), (di + (this.thickness * (this.BackExtraDepth + 3.5))), (this.LockScrewDiameter / 2));
            if ((this.LockScrewExtraFeetScewDiameter > 0 && this.LockScrewExtraFeetDistanceFromBorder > 0 && !isTop)) {
                this.hole(this.LockScrewExtraFeetDistanceFromBorder, this.LockScrewExtraFeetDistanceFromBorder, (this.LockScrewExtraFeetScewDiameter / 2));
                this.hole(((wi + (this.thickness * 8)) - this.LockScrewExtraFeetDistanceFromBorder), this.LockScrewExtraFeetDistanceFromBorder, (this.LockScrewExtraFeetScewDiameter / 2));
                if (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)") {
                    this.hole((this.thickness * 6), ((di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 4))) - this.LockScrewExtraFeetDistanceFromBorder), (this.LockScrewExtraFeetScewDiameter / 2));
                    this.hole((wi + (this.thickness * 2)), ((di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 4))) - this.LockScrewExtraFeetDistanceFromBorder), (this.LockScrewExtraFeetScewDiameter / 2));
                }
                else {
                    if (this.FrontCoverStyle === "three-part lid, higes not provided") {
                        this.hole(this.LockScrewExtraFeetDistanceFromBorder, ((di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 4))) - this.LockScrewExtraFeetDistanceFromBorder), (this.LockScrewExtraFeetScewDiameter / 2));
                        this.hole(((wi + (this.thickness * 8)) - this.LockScrewExtraFeetDistanceFromBorder), ((di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 4))) - this.LockScrewExtraFeetDistanceFromBorder), (this.LockScrewExtraFeetScewDiameter / 2));
                    }
                    else {
                        this.hole(this.LockScrewExtraFeetDistanceFromBorder, ((di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 6))) - this.LockScrewExtraFeetDistanceFromBorder), (this.LockScrewExtraFeetScewDiameter / 2));
                        this.hole(((wi + (this.thickness * 8)) - this.LockScrewExtraFeetDistanceFromBorder), ((di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 6))) - this.LockScrewExtraFeetDistanceFromBorder), (this.LockScrewExtraFeetScewDiameter / 2));
                    }
                }
            }
            if ((this.FrontExtraTopAndBottomLocks && (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)" || (this.FrontCoverStyle === "three-part lid, higes not provided" && !isTop)))) {
                this.fingerHolesAt(((wi / 2) - (this.thickness * 4)), (di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 2.5))), (this.thickness * 16), 0);
            }
            this.fingerHolesAt((this.thickness * 2), (this.thickness * (this.BackExtraDepth + 2.5)), ((this.thickness * (this.LockScrewDistanceFromBorder - 3)) - this.LockScrewDiameter), 0);
            this.fingerHolesAt(((this.thickness * (this.LockScrewDistanceFromBorder - 1)) + this.LockScrewDiameter), (this.thickness * (this.BackExtraDepth + 2.5)), (((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)), 0);
            this.fingerHolesAt((((wi / 2) + (this.thickness * 4)) + this.LockScrewDiameter), (this.thickness * (this.BackExtraDepth + 2.5)), (((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)), 0);
            this.fingerHolesAt(((wi - (this.thickness * (this.LockScrewDistanceFromBorder - 9))) + this.LockScrewDiameter), (this.thickness * (this.BackExtraDepth + 2.5)), ((this.thickness * (this.LockScrewDistanceFromBorder - 3)) - this.LockScrewDiameter), 0);
            if (this.FrontExtraDepth > 0) {
                this.fingerHolesAt((this.thickness * 2), (di + (this.thickness * (this.BackExtraDepth + 3.5))), ((this.thickness * (this.LockScrewDistanceFromBorder - 3)) - this.LockScrewDiameter), 0);
                this.fingerHolesAt(((this.thickness * (this.LockScrewDistanceFromBorder - 1)) + this.LockScrewDiameter), (di + (this.thickness * (this.BackExtraDepth + 3.5))), (((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)), 0);
                this.fingerHolesAt((((wi / 2) + (this.thickness * 4)) + this.LockScrewDiameter), (di + (this.thickness * (this.BackExtraDepth + 3.5))), (((wi / 2) - (this.thickness * (this.LockScrewDistanceFromBorder - 5))) - (this.LockScrewDiameter * 2)), 0);
                this.fingerHolesAt(((wi - (this.thickness * (this.LockScrewDistanceFromBorder - 9))) + this.LockScrewDiameter), (di + (this.thickness * (this.BackExtraDepth + 3.5))), ((this.thickness * (this.LockScrewDistanceFromBorder - 3)) - this.LockScrewDiameter), 0);
            }
        }
        else {
            this.fingerHolesAt((this.thickness * 2), (this.thickness * (this.BackExtraDepth + 2.5)), (wi + (this.thickness * 4)), 0);
            if (this.FrontExtraDepth > 0) {
                this.fingerHolesAt((this.thickness * 2), (di + (this.thickness * (this.BackExtraDepth + 3.5))), (wi + (this.thickness * 4)), 0);
            }
        }
        if (isTop) {
            if (this.BackExtraDepth > 2) {
                this.fingerHolesAt((this.thickness * 3.5), (this.thickness * 2), (this.thickness * (this.BackExtraDepth - 0)), {angle: 90});
                this.fingerHolesAt((wi + (this.thickness * 4.5)), (this.thickness * 2), (this.thickness * (this.BackExtraDepth - 0)), {angle: 90});
            }
        }
        else {
            this.fingerHolesAt((this.thickness * 3.5), (this.thickness * 2), (this.thickness * this.BackExtraDepth), {angle: 90});
            this.fingerHolesAt((wi + (this.thickness * 4.5)), (this.thickness * 2), (this.thickness * this.BackExtraDepth), {angle: 90});
        }
        if (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)") {
            this.fingerHolesAt((this.thickness * 3.5), (di + (this.thickness * (this.BackExtraDepth + 4))), (this.thickness * (this.FrontExtraDepth - 2)), {angle: 90});
            this.fingerHolesAt((wi + (this.thickness * 4.5)), (di + (this.thickness * (this.BackExtraDepth + 4))), (this.thickness * (this.FrontExtraDepth - 2)), {angle: 90});
        }
        else {
            if ((this.FrontExtraDepth > 0 && (this.FrontCoverStyle === "three-part lid, higes not provided" || this.FrontCoverStyle === "none"))) {
                this.fingerHolesAt((this.thickness * 3.5), (di + (this.thickness * ((this.BackExtraDepth + this.FrontExtraDepth) + 0))), (this.FrontExtraDepth * this.thickness), {angle: 90});
                this.fingerHolesAt((wi + (this.thickness * 4.5)), (di + (this.thickness * ((this.BackExtraDepth + this.BackExtraDepth) + 0))), (this.FrontExtraDepth * this.thickness), {angle: 90});
            }
            else {
                if ((this.FrontExtraDepth > 2 && this.FrontCoverStyle === "slide-on lid")) {
                    this.fingerHolesAt((this.thickness * 3.5), (di + (this.thickness * (this.BackExtraDepth + 4))), (this.thickness * this.FrontExtraDepth), {angle: 90});
                    this.fingerHolesAt((wi + (this.thickness * 4.5)), (di + (this.thickness * (this.BackExtraDepth + 4))), (this.thickness * this.FrontExtraDepth), {angle: 90});
                }
                else {
                    if ((this.FrontExtraDepth > 0 && !isTop && this.FrontCoverStyle === "slide-on lid")) {
                        this.fingerHolesAt((this.thickness * 3.5), (di + (this.thickness * (this.BackExtraDepth + 4))), (this.thickness * this.FrontExtraDepth), {angle: 90});
                        this.fingerHolesAt((wi + (this.thickness * 4.5)), (di + (this.thickness * (this.BackExtraDepth + 4))), (this.thickness * this.FrontExtraDepth), {angle: 90});
                    }
                    else {
                        if ((this.FrontExtraDepth > 0 && !isTop && !this.FrontCoverStyle === "slide-on lid")) {
                            this.fingerHolesAt((this.thickness * 3.5), (di + ((this.BackExtraDepth + 4.5) * this.thickness)), (this.thickness * (this.FrontExtraDepth - 1)), {angle: 90});
                            this.fingerHolesAt((wi + (this.thickness * 4.5)), (di + ((this.BackExtraDepth + 4.5) * this.thickness)), (this.thickness * (this.FrontExtraDepth - 1)), {angle: 90});
                        }
                    }
                }
            }
        }
        if ((isTop && this.HandleThickness > 0 && this.HandleWidth > 0)) {
            this.rectangularHole(((((this.thickness * 4) + (wi / 2)) - (this.HandleWidth / 2)) - (this.HandleMargin / 2)), (((this.thickness * ((this.BackExtraDepth + 3) - (this.HandleThickness / 2))) + (di / 2)) - (this.HandleMargin / 2)), (this.HandleWidth + this.HandleMargin), ((this.thickness * this.HandleThickness) + this.HandleMargin), 0, false, false);
        }
        if ((isTop && this.HingeHolesDiameter > 0 && this.FrontCoverStyle === "three-part lid, higes not provided" && this.HandleThickness > 0)) {
            let posx = (this.thickness * 3);
            for (let x of this.HingeHolesBoxSeparation) {
                posx += x;
                this.hole(posx, ((di + (this.thickness * ((this.FrontExtraDepth + this.BackExtraDepth) + 4))) - this.HingeHolesBoxEdgeDistance), (this.HingeHolesDiameter / 2));
                this.hole(((wi + (this.thickness * 8)) - posx), ((di + (this.thickness * ((this.FrontExtraDepth + this.BackExtraDepth) + 4))) - this.HingeHolesBoxEdgeDistance), (this.HingeHolesDiameter / 2));
            }
        }
        this.moveTo((this.thickness * 2), 0);
        if (isTop) {
            this.polyline((this.thickness - (this.Margin / 2)), 90, (this.thickness * 2), -90, ((wi + (this.thickness * 2)) + this.Margin), -90, (this.thickness * 2), 90, (this.thickness - (this.Margin / 2)), [90, (this.thickness * 2)]);
        }
        else {
            this.edge((this.thickness * 2));
            this.edges["L"](wi);
            this.polyline((this.thickness * 2), [90, (this.thickness * 2)]);
        }
        if (isTop) {
            this.polyline(((this.thickness * this.BackExtraDepth) - (this.Margin / 2)), 90, (this.thickness * 2), -90, ((di + (this.thickness * 2)) + this.Margin), 0);
            if (this.FrontExtraDepth > 0) {
                this.polyline(0, -90, (this.thickness * 2), 90);
                this.edge(((this.thickness * this.FrontExtraDepth) - (this.Margin / 2)));
            }
        }
        else {
            this.edge((this.thickness * (this.BackExtraDepth + 1)));
            this.edges["L"](di);
            if (this.FrontCoverStyle === "slide-on lid") {
                this.edge((this.thickness * (1 + this.FrontExtraDepth)));
            }
            else {
                this.edge((this.thickness * (1 + this.FrontExtraDepth)));
            }
        }
        if (this.FrontCoverStyle === "slide-on lid") {
            this.corner(90, {radius: (this.thickness * 2)});
        }
        else {
            this.corner(90);
        }
        if (this.FrontExtraDepth > 0) {
            if (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)") {
                this.edges["k"].settings.style = "flush_inset";
                this.edges["k"]((wi + (this.thickness * 8)));
                this.corner(90);
            }
            else {
                if (this.FrontCoverStyle === "slide-on lid") {
                    if (isTop) {
                        this.polyline((this.thickness - (this.Margin / 2)), 90, (this.thickness * 2), -90, ((wi + (this.thickness * 2)) + this.Margin), -90, (this.thickness * 2), 90, (this.thickness - (this.Margin / 2)), [90, (this.thickness * 2)]);
                    }
                    else {
                        this.edge((this.thickness * 2));
                        this.edges["L"](wi);
                        this.polyline((this.thickness * 2), [90, (this.thickness * 2)]);
                    }
                }
                else {
                    this.polyline((wi + (this.thickness * 8)), 90);
                }
            }
        }
        else {
            if (!isTop) {
                this.edge((this.thickness * 2));
            }
            this.edges["F"]((wi + (this.thickness * 4)));
            if (!isTop) {
                this.edge((this.thickness * 2));
            }
            this.corner(90);
        }
        if (isTop) {
            if (this.FrontExtraDepth > 0) {
                if (this.FrontCoverStyle === "slide-on lid") {
                    this.polyline(((this.thickness * (this.FrontExtraDepth - 0)) - (this.Margin / 2)), 90);
                }
                else {
                    this.polyline(((this.thickness * this.FrontExtraDepth) - (this.Margin / 2)), 90);
                }
                this.polyline((this.thickness * 2), -90);
            }
            this.polyline(((di + (this.thickness * 2)) + this.Margin), -90, (this.thickness * 2), 90, ((this.thickness * this.BackExtraDepth) - (this.Margin / 2)), 0);
        }
        else {
            if (this.FrontCoverStyle === "slide-on lid") {
                this.edge((this.thickness * (1 + this.FrontExtraDepth)));
            }
            else {
                this.edge((this.thickness * (1 + this.FrontExtraDepth)));
            }
            this.edges["L"](di);
            this.edge((this.thickness * (this.BackExtraDepth + 1)));
        }
        this.corner(90, {radius: (this.thickness * 2)});
        this.move((wi + (this.thickness * 8)), ((di + (this.thickness * ((this.FrontExtraDepth + this.BackExtraDepth) + 6))) + (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)" ? (this.thickness * 3) : 0)), move, {label: label});
    }

    boxFrontSideCallback(hi) {
        if ((this.HingeHolesDiameter > 0 && this.FrontCoverStyle === "three-part lid, higes not provided")) {
            let posy = 0;
            for (let y of this.HingeHolesBoxSeparation) {
                posy += y;
                this.hole((posy - this.thickness), this.HingeHolesBoxEdgeDistance, (this.HingeHolesDiameter / 2));
                this.hole(((((hi * 3) / 4) + (this.Margin / 2)) - posy), this.HingeHolesBoxEdgeDistance, (this.HingeHolesDiameter / 2));
            }
        }
    }

    boxOpenSide(hi, move) {
        if (this.BackExtraDepth > 2) {
            this.rectangularWall(hi, (this.thickness * this.BackExtraDepth), "Nfff", {move: move, label: "back side"});
        }
        else {
            this.rectangularWall(hi, (this.thickness * this.BackExtraDepth), "Neff", {move: move, label: "back side"});
        }
        if (this.FrontExtraDepth > 0) {
            if (this.FrontCoverStyle === "slide-on lid") {
                if (this.FrontExtraDepth > 0) {
                    this.rectangularWall(hi, (this.thickness * this.FrontExtraDepth), "Nfff", {move: move, label: "front side"});
                }
                else {
                    this.rectangularWall(hi, (this.thickness * this.FrontExtraDepth), "Neff", {move: move, label: "front side"});
                }
            }
            else {
                if (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)") {
                    this.rectangularWall(hi, (this.thickness * (this.FrontExtraDepth - 2)), "efff", {move: move, label: "front side"});
                }
                else {
                    if (this.FrontCoverStyle === "three-part lid, higes not provided") {
                        this.rectangularWall(hi, (this.FrontExtraDepth * this.thickness), "efff", {callback: [() => this.boxFrontSideCallback(hi)], move: move, label: "front side"});
                    }
                    else {
                        this.rectangularWall(hi, (this.thickness * this.FrontExtraDepth), "efff", {move: move, label: "front side"});
                    }
                }
            }
        }
    }

    topHandle(wi, di, move, label) {
        for (let i = 0; i < this.HandleThickness; i += 1) {
            if (this.move(wi, (30 + (this.thickness * ((this.HandleThickness * 2) + 2))), move, true)) {
                return;
            }
            this.rectangularHole((((wi / 2) - (this.HandleWidth / 2)) + this.thickness), this.thickness, (this.thickness * 3), this.thickness, 0, false, false);
            this.rectangularHole((((wi / 2) + (this.HandleWidth / 2)) - (this.thickness * 4)), this.thickness, (this.thickness * 3), this.thickness, 0, false, false);
            if (this.LockScrewDiameter > 0) {
                this.hole((wi / 2), (this.thickness * 1.5), (this.LockScrewDiameter / 2));
            }
            this.rectangularHole((((wi - this.HandleWidth) / 2) + (this.thickness * this.HandleThickness)), ((this.thickness * 2) + (this.thickness * this.HandleThickness)), (this.HandleWidth - ((this.thickness * this.HandleThickness) * 2)), 30, 15, false, false);
            this.polyline((this.thickness * 5), 90, this.thickness, -90, (((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 5)), -90, this.thickness, 90, (this.thickness * 5), 90, this.thickness, -90);
            if (this.LockScrewDiameter > 0) {
                this.polyline((((this.HandleWidth / 2) - (this.thickness * 5)) - this.LockNutWidth), -90, this.thickness, 90, (this.LockNutWidth * 2), 90, this.thickness, -90);
                this.edge((((this.HandleWidth / 2) - (this.thickness * 5)) - this.LockNutWidth));
            }
            else {
                this.edge((this.HandleWidth - (this.thickness * 10)));
            }
            this.polyline(0, -90, this.thickness, 90, (this.thickness * 5), 90, this.thickness, -90, (((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 5)), -90, this.thickness, 90, (this.thickness * 5), 90);
            this.polyline((this.thickness * 2), 90);
            this.polyline(this.thickness, 90, this.thickness, -90, (this.thickness * 3), -90, this.thickness, 90, (((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * (this.HandleThickness + 2))), -90);
            this.polyline(((30 - 15) + (this.thickness * (this.HandleThickness * 2))), [90, 15], (this.HandleWidth - 30), [90, 15], ((30 - 15) + (this.thickness * (this.HandleThickness * 2))), -90, (((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * (this.HandleThickness + 2))), 90);
            this.polyline(this.thickness, -90, (this.thickness * 3), -90, this.thickness, 90, this.thickness, 90);
            this.polyline((this.thickness * 2), 90);
            this.move(wi, (30 + (this.thickness * ((this.HandleThickness * 2) + 2))), move, {label: label});
        }
        this.rectangularWall(di, (this.thickness * 3), {move: move});
        this.rectangularWall(di, (this.thickness * 3), {move: move});
        this.rectangularWall(di, (this.thickness * 3), {move: move});
        this.rectangularWall(di, (this.thickness * 3), {move: move});
        if (this.move((wi + this.thickness), (di + (this.thickness * 4)), move, true)) {
            return;
        }
        this.moveTo(0, (this.thickness * 2));
        this.rectangularHole(((wi / 2) - (this.HandleWidth / 2)), ((di / 2) - ((this.thickness * this.HandleThickness) / 2)), (this.thickness * 5), (this.thickness * this.HandleThickness), 0, false, false);
        this.rectangularHole((((wi / 2) + (this.HandleWidth / 2)) - (this.thickness * 5)), ((di / 2) - ((this.thickness * this.HandleThickness) / 2)), (this.thickness * 5), (this.thickness * this.HandleThickness), 0, false, false);
        if (this.LockScrewDiameter > 0) {
            this.rectangularHole(((wi / 2) - this.LockNutWidth), this.thickness, (this.LockNutWidth * 2), (di - (this.thickness * 2)), 0, false, false);
        }
        this.edges["f"]((this.thickness * 4));
        this.edge((((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 6)));
        this.edges["f"]((this.thickness * 4));
        this.edge((this.HandleWidth - (this.thickness * 4)));
        this.edges["f"]((this.thickness * 4));
        this.edge((((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 6)));
        this.edges["f"]((this.thickness * 4));
        this.corner(90);
        this.polyline(((di / 2) - ((this.HandleThickness * this.thickness) / 2)), 90, (this.thickness * 5), -90, (this.thickness * this.HandleThickness), -90, (this.thickness * 5), 90, ((di / 2) - ((this.HandleThickness * this.thickness) / 2)), 90);
        this.edges["f"]((this.thickness * 4));
        this.edge((((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 6)));
        this.edges["f"]((this.thickness * 4));
        this.edge((this.HandleWidth - (this.thickness * 4)));
        this.edges["f"]((this.thickness * 4));
        this.edge((((wi / 2) - (this.HandleWidth / 2)) - (this.thickness * 6)));
        this.edges["f"]((this.thickness * 4));
        this.corner(90);
        this.polyline(((di / 2) - ((this.HandleThickness * this.thickness) / 2)), 90, (this.thickness * 5), -90, (this.thickness * this.HandleThickness), -90, (this.thickness * 5), 90, ((di / 2) - ((this.HandleThickness * this.thickness) / 2)), 90);
        this.move((wi + this.thickness), (di + (this.thickness * 4)), move, {label: "handle ceiling"});
    }

    coverPanel1Lid(wi, hi, hasSubLayer, move, label) {
        if (hasSubLayer) {
            this.rectangularWall(wi, hi, "lmen", {callback: [() => this.rectangularHole((wi / 2), (this.thickness * 3.5), this.thickness, this.thickness), () => this.rectangularHole((hi - (this.thickness * 5.5)), (wi / 2), this.thickness, this.thickness)], move: move, label: label});
            this.rectangularWall((wi - this.Margin), (hi - (this.thickness * 6)), "eeee", {callback: [() => this.rectangularHole(((wi / 2) - (this.Margin / 2)), (this.thickness * 1.5), this.thickness, this.thickness), () => this.rectangularHole((hi - (this.thickness * 7.5)), ((wi / 2) - (this.Margin / 2)), this.thickness, this.thickness)], move: move, label: "side panel inner"});
            this.rectangularWall((wi - this.Margin), (hi - (this.thickness * 6)), "eeee", {callback: [() => this.rectangularHole(((wi / 2) - (this.Margin / 2)), (this.thickness * 1.5), this.thickness, this.thickness), () => this.rectangularHole((hi - (this.thickness * 7.5)), ((wi / 2) - (this.Margin / 2)), this.thickness, this.thickness)], move: move, label: "side panel inner"});
            this.rectangularWall((this.thickness + this.PegsWidthMargin), (this.thickness * 3), "eeee", {move: move, label: ""});
            this.rectangularWall((this.thickness + this.PegsWidthMargin), (this.thickness * 3), "eeee", {move: move, label: ""});
        }
        else {
            if (((this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)" || this.FrontCoverStyle === "three-part lid, higes not provided") && this.FrontLockStyle === "with key")) {
                this.rectangularWall(wi, hi, "lmen", {callback: [() => this.hole((wi / 2), (hi - (this.thickness * 4))), () => this.rectangularHole((this.thickness * 2), (this.thickness * 2), this.thickness, this.thickness)], move: move, label: label});
                this.rectangularWall((this.thickness * 2), (this.thickness + this.PegsWidthMargin), "eeee", {move: move});
            }
            else {
                this.rectangularWall(wi, hi, "lmen", {callback: [() => this.hole((wi / 2), (hi - (this.thickness * 4)))], move: move, label: label});
            }
        }
    }

    coverPanel2SideCallback(wi, hi, lockStyle) {
        if (lockStyle.includes("with key")) {
            this.hole((((wi - this.Margin) / 2) - (this.thickness * 1.5)), (hi / 2), (this.thickness * 3.5));
            this.rectangularHole((((wi - this.Margin) / 2) - (this.thickness * 1.5)), (hi / 2), (this.thickness + this.Margin), (this.thickness + this.Margin), 0, {color: Color.MAGENTA});
            this.rectangularHole((((wi - this.Margin) / 2) - (this.thickness * 3.5)), (hi / 2), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
            this.rectangularHole((((wi - this.Margin) / 2) + (this.thickness * 0.5)), (hi / 2), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
        }
        else {
            if (lockStyle.includes("simple")) {
                this.hole(((wi - this.Margin) / 2), (hi / 2), (this.thickness * 2));
                this.rectangularHole(((wi - this.Margin) / 2), (hi / 2), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
            }
        }
        if (lockStyle.includes("top")) {
            this.hole((((wi - this.Margin) / 2) - this.thickness), (hi - (this.thickness * 4)), (this.thickness * 2));
            this.rectangularHole((((wi - this.Margin) / 2) - this.thickness), (hi - (this.thickness * 4)), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
        }
        if (lockStyle.includes("bottom")) {
            this.hole((((wi - this.Margin) / 2) - this.thickness), (this.thickness * 4), (this.thickness * 2));
            this.rectangularHole((((wi - this.Margin) / 2) - this.thickness), (this.thickness * 4), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
        }
    }

    coverPanel2Side(wi, hi, lockStyle, move, label) {
        if ((this.DoorFeetScrewLength > 0 && this.LockScrewDiameter > 0)) {
            if (this.move((((wi + (this.thickness * 6)) - this.Margin) / 2), (hi + (this.thickness * 2)), move, true)) {
                return;
            }
            this.coverPanel2SideCallback(wi, hi, lockStyle);
            this.edges["I"](((((wi / 2) + (this.thickness * 1.5)) - (this.LockScrewDiameter / 2)) - (this.Margin / 2)));
            this.screwAttachement(this.DoorFeetScrewLength);
            this.polyline(((this.thickness * 1.5) - (this.LockScrewDiameter / 2)), 90, (hi + (this.thickness * 2)), 90, (this.thickness * 1.5), 0);
            this.edges["J"]((((wi / 2) + (this.thickness * 1.5)) - (this.Margin / 2)));
            this.polyline(0, 90, hi, 90);
            this.move((((wi + (this.thickness * 6)) - this.Margin) / 2), (hi + (this.thickness * 2)), move, {label: label});
        }
        else {
            this.rectangularWall((((wi + (this.thickness * 6)) - this.Margin) / 2), hi, "IeJe", {callback: [() => this.coverPanel2SideCallback(wi, hi, lockStyle)], move: move, label: label});
        }
    }

    coverPanel3Side(wi, hi, lockStyle, move, label) {
        if (this.move(((wi / 2) + (this.thickness * 2)), (((hi * 3) / 4) + (this.thickness * 2)), move, true)) {
            return;
        }
        if (this.HingeHolesDiameter > 0) {
            let posy = 0;
            for (let y of this.HingeHolesCoverSeparation) {
                posy += y;
                this.hole(this.HingeHolesCoverEdgeDistance, posy, (this.HingeHolesDiameter / 2));
                this.hole(this.HingeHolesCoverEdgeDistance, (((((hi * 3) / 4) + (this.Margin / 2)) + this.thickness) - posy), (this.HingeHolesDiameter / 2));
            }
        }
        if (lockStyle.includes("bottom")) {
            this.hole((((wi - this.Margin) / 2) - (this.thickness * 3)), (this.thickness * 4), (this.thickness * 2));
            this.rectangularHole((((wi - this.Margin) / 2) - (this.thickness * 3)), (this.thickness * 4), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
        }
        if ((this.DoorFeetScrewLength > 0 && this.LockScrewDiameter > 0)) {
            this.edge(((((wi - this.thickness) - this.LockScrewDiameter) - this.Margin) / 2));
            this.screwAttachement(this.DoorFeetScrewLength);
            this.edge(((this.thickness * 1.5) - (this.LockScrewDiameter / 2)));
        }
        else {
            this.edge((((wi + (this.thickness * 2)) - this.Margin) / 2));
        }
        this.polyline(0, 90, (((hi + (this.thickness * 2)) - this.Margin) / 2), 90, (((wi + (this.thickness * 2)) - this.Margin) / 4), ((-Math.atan(((2 * ((hi + (this.thickness * 2)) - this.Margin)) / ((wi + (this.thickness * 2)) - this.Margin))) * 180) / Math.PI), Math.sqrt((pow((((hi + (this.thickness * 2)) - this.Margin) / 4), 2) + pow((((wi + (this.thickness * 2)) - this.Margin) / 8), 2))), ((Math.atan(((2 * ((hi + (this.thickness * 2)) - this.Margin)) / ((wi + (this.thickness * 2)) - this.Margin))) * 180) / Math.PI), (((wi + (this.thickness * 2)) - this.Margin) / 8), 90, ((((hi + (this.thickness * 2)) - this.Margin) * 3) / 4), 90);
        this.move(((wi / 2) + (this.thickness * 2)), (((hi * 3) / 4) + (this.thickness * 2)), move, {label: label});
    }

    coverPanel3Top(wi, hi, lockStyle, move, label) {
        if (this.move((wi + (this.thickness * 2)), ((hi / 2) + (this.thickness * 2)), move, true)) {
            return;
        }
        if (lockStyle === "with key") {
            this.hole(((wi + (this.thickness * 2)) / 2), ((hi / 2) - (this.thickness * 4)), (this.thickness * 3.5));
            this.rectangularHole(((wi + (this.thickness * 2)) / 2), ((hi / 2) - (this.thickness * 4)), (this.thickness + this.Margin), (this.thickness + this.Margin), 0, {color: Color.MAGENTA});
            this.rectangularHole((((wi + (this.thickness * 2)) / 2) - (this.thickness * 2)), ((hi / 2) - (this.thickness * 4)), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
            this.rectangularHole((((wi + (this.thickness * 2)) / 2) + (this.thickness * 2)), ((hi / 2) - (this.thickness * 4)), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
        }
        else {
            if (lockStyle === "simple") {
                this.hole(((wi + (this.thickness * 2)) / 2), ((hi / 2) - (this.thickness * 2.5)), (this.thickness * 2));
                this.rectangularHole(((wi + (this.thickness * 2)) / 2), ((hi / 2) - (this.thickness * 2.5)), this.thickness, this.thickness, 0, {color: Color.MAGENTA});
            }
        }
        if (this.HingeHolesDiameter > 0) {
            let posx = 0;
            for (let x of this.HingeHolesCoverSeparation) {
                posx += x;
                this.hole(posx, this.HingeHolesCoverEdgeDistance, (this.HingeHolesDiameter / 2));
                this.hole(((wi + (this.thickness * 2)) - posx), this.HingeHolesCoverEdgeDistance, (this.HingeHolesDiameter / 2));
            }
        }
        this.polyline((wi + (this.thickness * 2)), 90, (((hi + (this.thickness * 2)) - this.Margin) / 4), 90, (((wi + (this.thickness * 2)) / 8) + (this.Margin / 2)), ((-Math.atan(((2 * ((hi + (this.thickness * 2)) - this.Margin)) / (wi + (this.thickness * 2)))) * 180) / Math.PI), Math.sqrt((pow((((hi + (this.thickness * 2)) - this.Margin) / 4), 2) + pow(((wi + (this.thickness * 2)) / 8), 2))), ((Math.atan(((2 * ((hi + (this.thickness * 2)) - this.Margin)) / (wi + (this.thickness * 2)))) * 180) / Math.PI), (((wi + (this.thickness * 2)) / 2) - !this.Margin), ((Math.atan(((2 * ((hi + (this.thickness * 2)) - this.Margin)) / (wi + (this.thickness * 2)))) * 180) / Math.PI), Math.sqrt((pow((((hi + (this.thickness * 2)) - this.Margin) / 4), 2) + pow(((wi + (this.thickness * 2)) / 8), 2))), ((-Math.atan(((2 * ((hi + (this.thickness * 2)) - this.Margin)) / (wi + (this.thickness * 2)))) * 180) / Math.PI), (((wi + (this.thickness * 2)) / 8) + (this.Margin / 2)), 90, (((hi + (this.thickness * 2)) - this.Margin) / 4), 90);
        this.move((wi + (this.thickness * 2)), ((hi / 2) + (this.thickness * 2)), move, {label: label});
    }

    lockSimple(move) {
        if (this.move((this.thickness * 10), (this.thickness * 10), move, true)) {
            return;
        }
        this.parts.disc((this.thickness * 10), {callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move((this.thickness * 10), (this.thickness * 10), move, {label: "lock external"});
        if (this.move((this.thickness * 6), (this.thickness * 6), move, true)) {
            return;
        }
        this.parts.wavyKnob((this.thickness * 5), {callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move((this.thickness * 6), (this.thickness * 6), move, {label: "lock grip"});
        if (this.move((this.thickness * 11), (this.thickness * 11), move, true)) {
            return;
        }
        this.parts.disc((this.thickness * 10), {dwidth: 0.8, callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move((this.thickness * 11), (this.thickness * 11), move, {label: "lock internal"});
        this.rectangularWall((this.thickness * 4), (this.thickness + this.PegsWidthMargin), "eeee", {move: move});
    }

    lockExtra(move) {
        if (this.move((this.thickness * 7), (this.thickness * 7), move, true)) {
            return;
        }
        this.parts.wavyKnob((this.thickness * 5), {callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move((this.thickness * 6), (this.thickness * 6), move, {label: "lock grip"});
        if (this.move(((this.thickness * 6) - this.Margin), ((this.thickness * 6) - this.Margin), move, true)) {
            return;
        }
        this.parts.disc(((this.thickness * 6) - this.Margin), {callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move(((this.thickness * 6) - this.Margin), (this.thickness * 6), move, {label: "lock internal"});
        if (this.move(((this.thickness * 6) - this.Margin), ((this.thickness * 6) - this.Margin), move, true)) {
            return;
        }
        this.parts.disc(((this.thickness * 6) - this.Margin), {callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move(((this.thickness * 6) - this.Margin), ((this.thickness * 6) - this.Margin), move, {label: "lock spacer"});
        if (this.move(((this.thickness * 8) - this.Margin), ((this.thickness * 8) - this.Margin), move, true)) {
            return;
        }
        this.parts.disc(((this.thickness * 8) - this.Margin), {dwidth: 0.8, callback: () => this.rectangularHole(0, 0, this.thickness, this.thickness)});
        this.move(((this.thickness * 8) - this.Margin), ((this.thickness * 8) - this.Margin), move, {label: "lock locker"});
        this.rectangularWall((this.thickness * 5), (this.thickness + this.PegsWidthMargin), "eeee", {move: move});
    }

    keyHoles(centerHoleLength, isRotated) {
        if (centerHoleLength === 2) {
            this.rectangularHole((-this.thickness / 2), 0, ((this.thickness * 2) + this.Margin), (this.thickness + this.Margin));
        }
        else {
            if (centerHoleLength === 3) {
                this.rectangularHole(0, 0, ((this.thickness * 3) + this.Margin), (this.thickness + this.Margin));
            }
            else {
                if (centerHoleLength === 1) {
                    this.rectangularHole(0, 0, (this.thickness + this.Margin), (this.thickness + this.Margin));
                }
            }
        }
        if (isRotated) {
            this.rectangularHole((this.thickness * 2), 0, this.thickness, this.thickness);
            this.rectangularHole((-this.thickness * 2), 0, this.thickness, this.thickness);
        }
        else {
            this.rectangularHole(0, (this.thickness * 2), this.thickness, this.thickness);
            this.rectangularHole(0, (-this.thickness * 2), this.thickness, this.thickness);
        }
    }

    lockWithKey(isInnerLockRorated, move) {
        if (this.move((this.thickness * 15), (this.thickness * 15), move, true)) {
            return;
        }
        this.parts.disc((this.thickness * 15), {callback: () => this.keyHoles(2)});
        this.move((this.thickness * 15), (this.thickness * 15), move, {label: "lock external"});
        if (this.move((this.thickness * 8), (this.thickness * 8), move, true)) {
            return;
        }
        this.parts.wavyKnob((this.thickness * 7), {callback: () => this.keyHoles(3)});
        this.move((this.thickness * 8), (this.thickness * 8), move, {label: "lock front"});
        if (this.move((this.thickness * 15), (this.thickness * 15), move, true)) {
            return;
        }
        this.parts.disc((this.thickness * 15), {dwidth: (12 / 15), callback: () => this.keyHoles(0, isInnerLockRorated)});
        this.move((this.thickness * 15), (this.thickness * 15), move, {label: "lock internal"});
        this.rectangularWall((this.thickness * 4), (this.thickness + this.PegsWidthMargin), "eeee", {move: move});
        this.rectangularWall((this.thickness * 4), (this.thickness + this.PegsWidthMargin), "eeee", {move: move});
        if (this.move((this.thickness * 10), (this.thickness * 4), move, true)) {
            return;
        }
        this.rectangularHole(this.thickness, this.thickness, this.thickness, this.thickness, 0, false, false);
        this.polyline((this.thickness * 3), 90, this.thickness, -90, (this.thickness * 3), -90, this.thickness, 90, (this.thickness * 2), 90, this.thickness, -90, this.thickness, 90, this.thickness, 90, (this.thickness * 2), -90, this.thickness, 90, this.thickness, 90, this.thickness, -90, (this.thickness * 3), -90, this.thickness, 90, (this.thickness * 3), 90, (this.thickness * 3), 90);
        this.move((this.thickness * 10), (this.thickness * 4), move, {label: "key"});
    }

    render() {
        let hi = ((this.SheetHeight + (this.Margin * 2)) + (this.HandleThickness > 0 ? (this.thickness * 2) : 0));
        let wi = (this.SheetWidth + this.Margin);
        let di = (this.SheetsStackDepth + this.Margin);
        if ((this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)" && this.FrontExtraDepth < ((2 * HingeSettings.relative_params["hingestrength"]) + (HingeSettings.relative_params["axle"] / 2)))) {
            this.FrontExtraDepth = ((2 * HingeSettings.relative_params["hingestrength"]) + (HingeSettings.relative_params["axle"] / 2));
        }
        if ((this.FrontCoverStyle === "slide-on lid" && this.FrontExtraDepth < 3)) {
            this.FrontExtraDepth = 3;
        }
        if (this.BackExtraDepth < 1) {
            this.BackExtraDepth = 1;
        }
        this.ctx.save();
        this.boxFrontBack(wi, hi, true, {move: "up", label: "front"});
        this.boxFrontBack(wi, hi, false, {move: "mirror up", label: "back"});
        this.boxTopBottom(wi, di, true, {move: "up", label: "top"});
        this.boxTopBottom(wi, di, false, {move: "up", label: "bottom"});
        this.boxOpenSide(hi, {move: "up"});
        this.boxOpenSide(hi, {move: "mirror up"});
        this.coverPanel1Lid(di, hi, true, {move: "rotated up", label: "side panel"});
        this.coverPanel1Lid(di, hi, true, {move: "rotated up", label: "side panel"});
        if ((this.HandleThickness > 0 && this.HandleWidth > 0)) {
            this.topHandle(wi, di, {move: "up", label: "top handle"});
        }
        if (this.FrontCoverStyle === "two-part lid with hinge eyes (both ends)") {
            this.coverPanel2Side(wi, hi, (this.FrontExtraTopAndBottomLocks ? "top bottom" : "none"), {move: "mirror up", label: "front panel right"});
            this.coverPanel2Side(wi, hi, this.FrontLockStyle, {move: "up", label: "front panel left"});
            if (this.FrontLockStyle === "simple") {
                this.lockSimple({move: "up"});
            }
            else {
                if (this.FrontLockStyle === "with key") {
                    this.lockWithKey(true, {move: "up"});
                }
            }
            if (this.FrontExtraTopAndBottomLocks) {
                this.lockExtra({move: "up"});
                this.lockExtra({move: "up"});
                this.rectangularWall((this.thickness * 16), this.thickness, "feee", {move: "up"});
                this.rectangularWall((this.thickness * 16), this.thickness, "feee", {move: "up"});
            }
        }
        else {
            if (this.FrontCoverStyle === "three-part lid, higes not provided") {
                this.coverPanel3Side(wi, hi, (this.FrontExtraTopAndBottomLocks ? "bottom" : "none"), {move: "mirror up", label: "front panel right"});
                this.coverPanel3Side(wi, hi, (this.FrontExtraTopAndBottomLocks ? "bottom" : "none"), {move: "up", label: "front panel left"});
                this.coverPanel3Top(wi, hi, this.FrontLockStyle, {move: "up", label: "front panel top"});
                if (this.FrontLockStyle === "simple") {
                    this.lockSimple({move: "up"});
                }
                else {
                    if (this.FrontLockStyle === "with key") {
                        this.lockWithKey(false, {move: "up"});
                    }
                }
                if (this.FrontExtraTopAndBottomLocks) {
                    this.lockExtra({move: "up"});
                    this.lockExtra({move: "up"});
                    this.rectangularWall((this.thickness * 16), this.thickness, "feee", {move: "up"});
                    this.rectangularWall((this.thickness * 16), this.thickness, "feee", {move: "up"});
                }
            }
            else {
                if (this.FrontCoverStyle === "slide-on lid") {
                    this.coverPanel1Lid(wi, hi, false, {move: "up", label: "front panel"});
                }
            }
        }
        this.coverPanel1Lid(wi, hi, false, {move: "up", label: "back panel"});
    }

}

module.exports.Kamishibai = Kamishibai;