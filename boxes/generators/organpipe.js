import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

let pitches = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
let pressure_units = /* unknown node Dict */;
class OrganPipe extends Boxes {
    getFrequency(pitch, octave, base_freq) {
        let steps = ((pitches.index(pitch) + ((octave - 4) * 12)) - 9);
        return (base_freq * (2 ** (steps / 12.0)));
    }

    getRadius(pitch, octave, intonation) {
        let steps = ((pitches.index(pitch) + ((octave - 2) * 12)) + intonation);
        return ((0.5 * 0.15555) * (0.957458 ** steps));
    }

    getAirSpeed(wind_pressure, air_density) {
        return ((2.0 * (wind_pressure / air_density)) ** 0.5);
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 3.0, space: 3.0, surroundingspaces: 1.0});
        this.argparser.add_argument("--pitch", {action: "store", type: "str", default: "c", choices: pitches, help: "pitch"});
        this.argparser.add_argument("--octave", {action: "store", type: "int", default: 2, help: "Octave in International Pitch Notation (2 == C)"});
        this.argparser.add_argument("--intonation", {action: "store", type: "float", default: 2.0, help: "Intonation Number. 2 for max. efficiency, 3 max."});
        this.argparser.add_argument("--mouthratio", {action: "store", type: "float", default: 0.25, help: "mouth to circumference ratio (0.1 to 0.45). Determines the width to depth ratio"});
        this.argparser.add_argument("--cutup", {action: "store", type: "float", default: 0.3, help: "Cutup to mouth ratio"});
        this.argparser.add_argument("--mensur", {action: "store", type: "int", default: 0, help: "Distance in halftones in the Normalmensur by Töpfer"});
        this.argparser.add_argument("--windpressure", {action: "store", type: "float", default: 588.4, help: "uses unit selected below"});
        this.argparser.add_argument("--windpressure_units", {action: "store", type: "str", default: "Pa", choices: pressure_units.keys(), help: "in Pa"});
        this.argparser.add_argument("--stopped", {action: "store", type: boolarg, default: false, help: "pipe is closed at the top"});
    }

    render() {
        let t = this.thickness;
        let f = this.getFrequency(this.pitch, this.octave, 440);
        this.windpressure *= pressure_units.get(this.windpressure_units, 1.0);
        let speed_of_sound = 343.6;
        let air_density = 1.2;
        let air_speed = this.getAirSpeed(this.windpressure, air_density);
        let i = this.intonation;
        let radius = (this.getRadius(this.pitch, this.octave, i) * 1000);
        let cross_section = (pi * (radius ** 2));
        let circumference = ((pi * radius) * 2.0);
        let mouth_width = (circumference * this.mouthratio);
        let mouth_height = (mouth_width * this.cutup);
        let mouth_area = (mouth_height * mouth_width);
        let pipe_depth = (cross_section / mouth_width);
        let base_length = Math.max(mouth_width, pipe_depth);
        let jet_thickness = ((((f ** 2) * (i ** 2)) * ((0.01 * mouth_height) ** 3)) / (air_speed ** 2));
        let sound_power = ((((0.001 * pi) * (air_density / speed_of_sound)) * (f ** 2)) * ((1.7 * (((((jet_thickness * speed_of_sound) * f) * mouth_area) * (mouth_area ** 0.5)) ** 0.5)) ** 2));
        let air_consumption_rate = (((air_speed * mouth_width) * jet_thickness) * 1000000.0);
        let wavelength = ((speed_of_sound / f) * 1000);
        if (this.stopped) {
            let theoretical_resonator_length = (wavelength / 4.0);
            let resonator_length = ((-0.73 * (((f * cross_section) * 1e-06) - (((0.342466 * speed_of_sound) * (mouth_area ** 0.5)) * 0.001))) / ((f * (mouth_area ** 0.5)) * 0.001));
        }
        else {
            theoretical_resonator_length = (wavelength / 2.0);
            resonator_length = (((-0.73 * ((((f * cross_section) * 1e-06) + ((((0.465753 * f) * (mouth_area ** 0.5)) * (cross_section ** 0.5)) * 1e-06)) - (((0.684932 * speed_of_sound) * (mouth_area ** 0.5)) * 0.001))) / ((f * (mouth_area ** 0.5)) * 0.001)) * 1000.0);
        }
        let air_hole_diameter = (2.0 * ((((mouth_width * jet_thickness) * 10.0) ** 0.5) / pi));
        let total_length = (resonator_length + base_length);
        let e = ["f", "e", edges.CompoundEdge(this, "fef", [((resonator_length - mouth_height) - (10 * t)), (mouth_height + (10 * t)), base_length]), "f"];
        this.rectangularWall(total_length, pipe_depth, e, {callback: [() => this.fingerHolesAt((base_length - (0.5 * t)), 0, (pipe_depth - jet_thickness))], move: "up"});
        this.rectangularWall(total_length, pipe_depth, e, {callback: [() => this.fingerHolesAt((base_length - (0.5 * t)), 0, (pipe_depth - jet_thickness))], move: "up"});
        this.rectangularWall(total_length, mouth_width, "FeFF", {callback: [() => this.fingerHolesAt((base_length - (0.5 * t)), 0, mouth_width)], move: "up"});
        e = [edges.CompoundEdge(this, "EF", [(t * 10), ((resonator_length - mouth_height) - (t * 10))]), "e", edges.CompoundEdge(this, "FE", [((resonator_length - mouth_height) - (t * 10)), (t * 10)]), "e"];
        this.rectangularWall((resonator_length - mouth_height), mouth_width, e, {move: "up"});
        this.rectangularWall(base_length, mouth_width, "FeFF", {move: "right"});
        this.rectangularWall(mouth_width, pipe_depth, "fFfF", {callback: [() => this.hole((mouth_width / 2), (pipe_depth / 2))], move: "right"});
        this.rectangularWall(mouth_width, (pipe_depth - jet_thickness), "ffef", {move: "right"});
    }

}

export { OrganPipe };