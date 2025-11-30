import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BottleTag extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 72, help: "width of neck tag"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 98, help: "height of neck tag"});
        this.argparser.add_argument("--min_diameter", {action: "store", type: "float", default: 24, help: "inner diameter of bottle neck hole"});
        this.argparser.add_argument("--max_diameter", {action: "store", type: "float", default: 50, help: "outer diameter of bottle neck hole"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 15, help: "corner radius of bottom tag"});
        this.argparser.add_argument("--segment_width", {action: "store", type: "int", default: 3, help: "inner segment width"});
    }

    render() {
        let width = this.width;
        let height = this.height;
        let r_min = (this.min_diameter / 2);
        let r_max = (this.max_diameter / 2);
        let r = this.radius;
        let segment_width = this.segment_width;
        this.moveTo(r);
        this.edge(((width - r) - r));
        this.corner(90, r);
        this.edge(((height - (width / 2.0)) - r));
        this.corner(180, (width / 2));
        this.edge(((height - (width / 2.0)) - r));
        this.corner(90, r);
        this.moveTo(((width / 2) - r), (height - (width / 2)));
        this.ctx.save();
        this.moveTo(0, -r_min);
        this.corner(360, r_min);
        this.ctx.restore();
        let seg_angle = ((segment_width / r_min) * 180 / Math.PI);
        let num = Math.floor((360 / seg_angle));
        for (let i = 0; i < num; i += 1) {
            this.ctx.save();
            this.moveTo(0, 0, ((i * 360.0) / num));
            this.moveTo(r_min);
            this.edge((r_max - r_min));
            this.ctx.save();
            this.moveTo(0, 0, 90);
            this.edge(0.5);
            this.ctx.restore();
            this.ctx.save();
            this.moveTo(0, 0, -90);
            this.edge(0.5);
            this.ctx.restore();
            this.ctx.restore();
        }
    }

}

export { BottleTag };