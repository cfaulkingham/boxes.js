import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

const str_to_bool = (s) => {
    return ["true", "1", "t", "y", "yes", "yeah", "yup", "certainly", "uh-huh"].includes(s.lower());
}

class FrontPanel extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--layout", {action: "store", type: "str", default: "
outline 100 100
rect 50 60 80 30 3 True False
text 50 91 7 "Super Front Panel With Buttons!" 0 bottom|center
circle 10 45 3.5
circle 30 45 3.5
circle 50 45 3.5
circle 70 45 3.5
circle 90 45 3.5
text 10 40 3 "BTN_1" 0 top|center
text 35 45 3 "BTN_2" 90 top|center
text 50 50 3 "BTN_3" 180 top|center
text 65 45 3 "BTN_4" 270 top|center
text 90 45 3 "5" 0 middle|center
mountinghole 5 85 3 6 90
mountinghole 95 85 3 6 90

# Start another panel, 30x50
outline 30 50
rect 15 25 15 15 1 True True
text 15 25 3 "__Fun!"   0 bottom|left
text 15 25 3 "__Fun!"  45 bottom|left
text 15 25 3 "__Fun!"  90 bottom|left
text 15 25 3 "__Fun!" 135 bottom|left
text 15 25 3 "__Fun!" 180 bottom|left
text 15 25 3 "__Fun!" 225 bottom|left
text 15 25 3 "__Fun!" 270 bottom|left

text 3  10 2 "Another panel, for fun" 0 top|left


# Let's create another panel with a nema motor on it
outline 40 40
nema 20 20 17
"});
    }

    applyOffset(x, y) {
        return [(x + this.offset[0]), (y + this.offset[1])];
    }

    drawRect(x, y, w, h, r, center_x, center_y) {
        [x, y, w, h, r] = /* unknown node GeneratorExp */;
        [x, y] = this.applyOffset(x, y);
        center_x = str_to_bool(center_x);
        center_y = str_to_bool(center_y);
        this.rectangularHole(x, y, w, h, r, center_x, center_y);
    }

    drawCircle(x, y, r) {
        [x, y, r] = /* unknown node GeneratorExp */;
        [x, y] = this.applyOffset(x, y);
        this.hole(x, y, r);
    }

    drawMountingHole(x, y, d_shaft, d_head, angle) {
        [x, y, d_shaft, d_head, angle] = /* unknown node GeneratorExp */;
        [x, y] = this.applyOffset(x, y);
        this.mountingHole(x, y, d_shaft, d_head, angle);
    }

    drawOutline(w, h) {
        [w, h] = /* unknown node GeneratorExp */;
        if (this.outline === null) {
            this.offset = this.applyOffset((this.outline[0] + 10), 0);
        }
        this.outline = [w, h];
        let x = 0;
        let y = 0;
        [x, y] = this.applyOffset(x, y);
        let border = [[x, y], [(x + w), y], [(x + w), (y + h)], [x, (y + h)], [x, y]];
        this.showBorderPoly(border);
    }

    drawText(x, y, size, text, angle, align) {
        [x, y, size, angle] = /* unknown node GeneratorExp */;
        [x, y] = this.applyOffset(x, y);
        align = align.replace("|", " ");
        this.text({text: text, x: x, y: y, fontsize: size, angle: angle, align: align});
    }

    drawNema(x, y, size, screwhole_size) {
        [x, y, size, screwhole_size] = /* unknown node GeneratorExp */;
        if (this.nema_sizes.includes(size)) {
            [x, y] = this.applyOffset(x, y);
            this.NEMA(size, x, y, {screwholes: screwhole_size});
        }
    }

    parse_layout(layout) {
        let f = io.StringIO(layout);
        let line = 0;
        let objects = /* unknown node Dict */;
        for (let l of f.readlines()) {
            line += 1;
            l = re.sub("#.*$", "", l);
            l = l.strip();
            let la = shlex.split(l);
            if ((la.length > 0 && objects.includes(la[0].lower()))) {
                objects[la[0]](...la.slice(1));
            }
        }
    }

    render() {
        this.offset = [0.0, 0.0];
        this.outline = null;
        this.parse_layout(this.layout);
    }

}

export { FrontPanel };