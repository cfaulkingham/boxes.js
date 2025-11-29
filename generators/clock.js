const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Clock extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--ClockHandsMaxLength", {action: "store", type: "float", default: 70.0, help: "Length of the longest clock hand (from the central axis) in mm"});
        this.argparser.add_argument("--ExternalRadius", {action: "store", type: "float", default: 100.0, help: "External radius of the clock in mm"});
        this.argparser.add_argument("--BackLegDistance", {action: "store", type: "float", default: 50.0, help: "Distance between the front plate and the back leg in mm"});
        this.argparser.add_argument("--Margin", {action: "store", type: "float", default: 2.0, help: "Margin between clock hands and external frame in mm"});
        this.argparser.add_argument("--NeedlesAxisHoleDiameter", {action: "store", type: "float", default: 8.0, help: "Diameter of the needles axis hole in mm"});
    }

    mainPlate(move, label) {
        let t = this.thickness;
        let Re = this.ExternalRadius;
        let Ri = (this.ClockHandsMaxLength + this.Margin);
        let Rm = ((Re + Ri) / 2);
        let Af = (Math.PI / 6);
        let Ab = (Math.PI / 6);
        let At = (Math.PI / 3);
        if (this.move((Re * 2), (Re * 2), move, true)) {
            return;
        }
        this.rectangularHole((Re - (Rm * Math.sin(Ab))), (Re - (Rm * Math.cos(Ab))), (t - this.burn), (t - this.burn));
        this.rectangularHole((Re + (Rm * Math.sin(Ab))), (Re - (Rm * Math.cos(Ab))), (t - this.burn), (t - this.burn));
        this.rectangularHole((Re - (Rm * Math.sin(At))), (Re - (Rm * Math.cos(At))), (t - this.burn), (t - this.burn));
        this.rectangularHole((Re + (Rm * Math.sin(At))), (Re - (Rm * Math.cos(At))), (t + this.burn), (t - this.burn));
        this.hole(Re, Re, {d: this.NeedlesAxisHoleDiameter});
        this.circle(Re, Re, Re);
        this.move((Re * 2), (Re * 2), move, {label: label});
    }

    frontRing(move, label) {
        let Re = this.ExternalRadius;
        let Ri = (this.ClockHandsMaxLength + this.Margin);
        if (this.move((Re * 2), (Re * 2), move, true)) {
            return;
        }
        this.hole(Re, Re, {r: Ri});
        this.circle(Re, Re, Re);
        this.move((Re * 2), (Re * 2), move, {label: label});
    }

    frontLegs(move, label) {
        let t = this.thickness;
        let Re = this.ExternalRadius;
        let Ri = (this.ClockHandsMaxLength + this.Margin);
        let Rm = ((Re + Ri) / 2);
        let Tf = ((Re - Ri) / 2);
        let Af = (Math.PI / 6);
        let Afd = ((Af * 180) / Math.PI);
        let Ab = (Math.PI / 6);
        let At = (Math.PI / 3);
        if (this.move(((((Tf * 4) + ((Rm * (1 - Math.cos(Af))) / Math.sin(Af))) + ((Rm * 2) * Math.sin(Ab))) - (t * 3)), ((((Tf * 2) + (Rm * (1 - Math.cos(Af)))) + (t * 2)) + (Rm * (Math.cos(Ab) - Math.cos(At)))), move, true)) {
            return;
        }
        this.moveTo(Tf, 0);
        this.polyline((Tf * 2), [(90 - Afd), (Tf / 2)], (Tf + ((Rm * (1 - Math.cos(Af))) / Math.cos(Af))), (-90 + Afd), ((((Rm * 2) * Math.sin(Ab)) - t) - (Tf * 2)), (-90 + Afd), (Tf + ((Rm * (1 - Math.cos(Af))) / Math.cos(Af))), [(90 - Afd), (Tf / 2)], (Tf * 2), [180, (Tf / 2)], Tf, [(-90 + Afd), (Tf / 2)], (Tf + ((Rm * (1 - Math.cos(Af))) / Math.cos(Af))), (90 - Afd), t, -90, (t + (Rm * (Math.cos(Ab) - Math.cos(At)))), 90, (((Rm * 2) * Math.sin(Ab)) - (t * 3)), 90, (t + (Rm * (Math.cos(Ab) - Math.cos(At)))), -90, t, (90 - Afd), (Tf + ((Rm * (1 - Math.cos(Af))) / Math.cos(Af))), [(-90 + Afd), (Tf / 2)], Tf, [180, (Tf / 2)]);
        this.move(((((Tf * 4) + ((Rm * (1 - Math.cos(Af))) / Math.sin(Af))) + ((Rm * 2) * Math.sin(Ab))) - (t * 3)), ((((Tf * 2) + (Rm * (1 - Math.cos(Af)))) + (t * 2)) + (Rm * (Math.cos(Ab) - Math.cos(At)))), move, {label: label});
    }

    backLeg(move, label) {
        let t = this.thickness;
        let Re = this.ExternalRadius;
        let Ri = (this.ClockHandsMaxLength + this.Margin);
        let Rm = ((Re + Ri) / 2);
        let Tf = ((Re - Ri) / 2);
        let Af = (Math.PI / 6);
        let Ab = (Math.PI / 6);
        let At = (Math.PI / 3);
        if (this.move(((((t * 2) + (Tf * 3)) + (Rm * (1 - Math.cos(Af)))) + (Rm * (Math.cos(Ab) - Math.cos(At)))), (t * 2), move, true)) {
            return;
        }
        this.polyline(t, (90 + (this.burn / 2)), t, -90, (t - this.burn), -90, t, 90, (((Rm * (Math.cos(Ab) - Math.cos(At))) - t) + this.burn), 90, t, -90, (t - this.burn), -90, t, 90, ((((Tf * 2) - t) + (Rm * (1 - Math.cos(Af)))) + (this.burn / 2)), [180, t], (((((t * 2) + (Tf * 2)) - t) + (Rm * (1 - Math.cos(Af)))) + (Rm * (Math.cos(Ab) - Math.cos(At)))), 90, (t * 2), 90);
        this.move(((((t * 2) + (Tf * 3)) + (Rm * (1 - Math.cos(Af)))) + (Rm * (Math.cos(Ab) - Math.cos(At)))), (t * 2), move, {label: label});
    }

    legsSupport(width, move, label) {
        let t = this.thickness;
        let Re = this.ExternalRadius;
        let Ri = (this.ClockHandsMaxLength + this.Margin);
        let Rm = ((Re + Ri) / 2);
        let Af = (Math.PI / 6);
        let Ab = (Math.PI / 6);
        let At = (Math.PI / 3);
        let h = this.BackLegDistance;
        let Rc = Math.min((width / 2), (h - (t * 2)));
        if (this.move((width + t), (h + (t * 3)), move, true)) {
            return;
        }
        this.polyline(t, 90, t, -90, t, 90, t, -90, (width - (t * 3)), -90, t, 90, t, -90, t, 90, t, 90, ((h + (t * 2)) - Rc), [90, Rc], (((width / 2) + (this.burn / 2)) - Rc), 90, t, -90, (t - this.burn), -90, t, 90, (((width / 2) + (this.burn / 2)) - Rc), [90, Rc], ((h + (t * 2)) - Rc), 90);
        this.move((width + t), (h + (t * 3)), move, {label: label});
    }

    render() {
        let t = this.thickness;
        let Re = this.ExternalRadius;
        let Ri = (this.ClockHandsMaxLength + this.Margin);
        let Rm = ((Re + Ri) / 2);
        let Af = (Math.PI / 6);
        let Ab = (Math.PI / 6);
        let At = (Math.PI / 3);
        let FootLen = (((Re * (1 - Math.sin(Af))) + (t * 2)) / Math.cos(Af));
        this.mainPlate("up", "main plate");
        this.frontRing("up", "front ring");
        this.frontLegs("up", "front legs");
        this.backLeg("up", "back leg");
        this.legsSupport(((Rm * 2) * Math.sin(At)), "up", "top leg support");
        this.legsSupport(((Rm * 2) * Math.sin(Ab)), "up", "bottom leg support");
    }

}

module.exports.Clock = Clock;