import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Matrix extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--led_width", {action: "store", type: "int", default: 16, help: "Width of the LED matrix in pixels"});
        this.argparser.add_argument("--led_height", {action: "store", type: "int", default: 16, help: "Height of the LED matrix in pixels"});
        this.argparser.add_argument("--pysical_led_y", {action: "store", type: "int", default: 160, help: "Width of the LED matrix pcb in mm"});
        this.argparser.add_argument("--pysical_led_x", {action: "store", type: "int", default: 160, help: "Height of the LED matrix pcb in mm"});
        this.argparser.add_argument("--matrix_back_frame_border", {action: "store", type: "int", default: 20, help: "Border of the back frame bo keep the pcb in blace but allow for air flow and cable management"});
        this.argparser.add_argument("--matrix_front_frame_border_offset", {action: "store", type: "int", default: 10, help: "Offset of the front frame to allow for the plexiglass to be attached"});
        this.argparser.add_argument("--distance_between_leds", {action: "store", type: "float", default: 1, help: "Distance of the color dividers. Make sure your machine is able to cut thin structures."});
        this.argparser.add_argument("--h", {action: "store", type: "int", default: 30, help: "Height of the matrix"});
        this.argparser.add_argument("--height_pcb", {action: "store", type: "float", default: 0.2, help: "Height of the pcb including the highest non led components in mm"});
        this.argparser.add_argument("--plexiglass_thicknes", {action: "store", type: "float", default: 3, help: "Thickness of the plexiglass in mm"});
        this.argparser.add_argument("--mounting_holes", {action: "store", type: boolarg, default: false, help: "Add mounting holes for the enclosure"});
        this.argparser.add_argument("--mounting_hole_diameter", {action: "store", type: "float", default: 5, help: "Diameter of the mounting holes in mm"});
        this.argparser.add_argument("--matrix_count_x", {action: "store", type: "int", default: 1, help: "Number of modules in x direction"});
        this.argparser.add_argument("--matrix_count_y", {action: "store", type: "int", default: 1, help: "Number of modules in y direction"});
        // this.buildArgParser();
    }

    draw_frame(sizex, sizey, posx, posy) {
        this.rectangularHole({x: posx, y: posy, dx: sizex, dy: sizey, r: 0, center_x: false, center_y: false});
    }

    matrix_back_sideholes(length) {
        let sandwich_height = (((2 * this.thickness) + this.plexiglass_thicknes) + this.height_pcb);
        let h = (((-0.5 * this.thickness) + this.h) - sandwich_height);
        this.fingerHolesAt(0, h, length, {angle: 0});
    }

    draw_led_grid() {
        let space_per_led_x = (this.pysical_led_x / this.led_width);
        let space_per_led_y = (this.pysical_led_y / this.led_height);
        for (let x = 0; x < this.led_width; x += 1) {
            for (let y = 0; y < this.led_height; y += 1) {
                this.rectangularHole({x: ((this.matrix_front_frame_border_offset + (x * space_per_led_x)) + (this.distance_between_leds / 2)), y: ((this.matrix_front_frame_border_offset + (y * space_per_led_y)) + (this.distance_between_leds / 2)), dx: (space_per_led_x - this.distance_between_leds), dy: (space_per_led_y - this.distance_between_leds), r: 0, center_x: false, center_y: false});
            }
        }
    }

    create_mounting_holes() {
        if (this.mounting_holes) {
            let pos_x = ((this.pysical_led_x + (2 * this.matrix_front_frame_border_offset)) / 2);
            let pos_y = (((this.pysical_led_y + (2 * this.matrix_front_frame_border_offset)) * 3) / 4);
            this.rectangularHole({x: pos_x, y: pos_y, dx: this.mounting_hole_diameter, dy: this.mounting_hole_diameter, r: this.mounting_hole_diameter});
            this.rectangularHole({x: pos_x, y: (pos_y + (this.mounting_hole_diameter / 2)), dx: (this.mounting_hole_diameter / 2), dy: (this.mounting_hole_diameter / 2), r: this.mounting_hole_diameter});
        }
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [(this.pysical_led_x + (2 * this.matrix_front_frame_border_offset)), (this.pysical_led_y + (2 * this.matrix_front_frame_border_offset)), this.h];
        let d2 = edges.Bolts(2);
        let d3 = edges.Bolts(3);
        this.rectangularWall(x, h, "FFFF", {bedBolts: ([d2] * 4), move: "up", label: "Wall 1", callback: [() => this.matrix_back_sideholes((this.pysical_led_x + (2 * this.matrix_front_frame_border_offset)))]});
        this.rectangularWall(y, h, "FfFf", {bedBolts: [d3, d2, d3, d2], move: "up", label: "Wall 2", callback: [() => this.matrix_back_sideholes((this.pysical_led_x + (2 * this.matrix_front_frame_border_offset)))]});
        this.rectangularWall(y, h, "FfFf", {move: "up", bedBolts: [d3, d2, d3, d2], label: "Wall 4", callback: [() => this.matrix_back_sideholes((this.pysical_led_y + (2 * this.matrix_front_frame_border_offset)))]});
        this.rectangularWall(x, h, "FFFF", {bedBolts: ([d2] * 4), move: "up", label: "Wall 3", callback: [() => this.matrix_back_sideholes((this.pysical_led_y + (2 * this.matrix_front_frame_border_offset)))]});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "right", label: "Top", callback: [() => this.draw_frame()]});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "right", label: "Bottom", callback: [this.create_mounting_holes]});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "right", label: "matrix mount frame, please add cable holes as needed"});
        this.rectangularWall(x, y, {label: "led_grid", move: "right", callback: [() => this.draw_led_grid()]});
        this.rectangularWall(x, y, {label: "led_grid", move: "right", callback: [() => this.draw_led_grid()]});
        this.rectangularWall(x, y, {label: "Plexiglass"});
    }

}

export { Matrix };