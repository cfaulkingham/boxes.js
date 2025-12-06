import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { Lid  } from '../lids.js';

class Cutout extends Boxes {
    cutout(box, x, y, color) {
    }

    sideview(box, x, y, front_not_side, color) {
        let h = this.HEIGHT;
        if (h) {
            let w = (0.5 * this.DIMENSIONS[(front_not_side ? 0 : 1)]);
            this.ctx.save();
            box.set_source_color(color);
            ctx.translate(x, y);
            ctx.move_to(-w, 0);
            ctx.move_to(-w, 0);
            ctx.move_to(-w, 0);
            ctx.line_to(-w, h);
            ctx.line_to(w, h);
            ctx.line_to(w, 0);
            ctx.line_to(-w, 0);
            ctx.stroke();
            this.ctx.restore();
        }
    }

}

export { Cutout };
class CircleCutout extends Cutout {
    cutout(box, x, y, color) {;
        this.ctx.save();
        box.set_source_color(color);
        box.circle(x, y, this.RADIUS);
        this.ctx.restore();
    }

}

export { CircleCutout };
class PolygonCutout extends Cutout {
    cutout(box, x, y, color) {;
        this.ctx.save();
        box.set_source_color(color);
        ctx.translate(x, y);
        if (this.PTS) {
            let ipts = iter(this.PTS);
            let px;
            let py;
            [px, py] = next(ipts);
            ctx.move_to(px, py);
            for (let [px, py] of ipts) {
                ctx.line_to(px, py);
            }
            ctx.stroke();
        }
        this.ctx.restore();
    }

}

export { PolygonCutout };
class PathCutout extends Cutout {
    cutout(box, x, y, color) {
        this.ctx.save();
        box.set_source_color(color);
        ctx.translate(x, y);
        ctx.translate(...this.OFFSET);
        //let CMDS = /* unknown node Dict */;
        for (let [command, params] of this.SEGMENTS) {
            CMDS[command](...params);
        }
        ctx.stroke();
        this.ctx.restore();
    }

}

export { PathCutout };
class MultiPathCutout extends PathCutout {
    constructor(w, h) {
        super();
        if (w === null) {
            let ws = (w / this.DIMENSIONS[0]);
        }
        if (h === null) {
            let hs = (h / this.DIMENSIONS[1]);
        }
        if ((w === null || h === null)) {
            let scale = Math.min(ws, hs);
            this.SCALE = [scale, scale];
        }
    }

    cutout(box, x, y, color) {
        let colors = color;
        if (colors === null) {
            colors = this.COLORS;
        }
        else {
            if (isinstance(color[0], ["float", "int"])) {
                colors = [color];
            }
        }
        if (colors.length < this.MULTI_SEGMENTS.length) {
            colors = (list(colors) + ([colors[-1]] * (this.MULTI_SEGMENTS.length - colors.length)));
        }
        for (let [color, segments] of zip(colors, this.MULTI_SEGMENTS)) {
            this.ctx.save();
            box.set_source_color(color);
            ctx.translate(x, y);
            ctx.scale(...this.SCALE);
            ctx.translate(...this.OFFSET);
            //let CMDS = /* unknown node Dict */;
            for (let [command, params] of segments) {
                CMDS[command](...params);
            }
            ctx.stroke();
            this.ctx.restore();
        }
    }

}

export { MultiPathCutout };
class NoneCutout extends Cutout {
}

export { NoneCutout };
class NicotIncubatorCageCutout extends CircleCutout {
}

export { NicotIncubatorCageCutout };
class NicotTransportCageCutout extends PathCutout {
}

export { NicotTransportCageCutout };
class PlastmixTransportCageCutout extends PathCutout {
}

export { PlastmixTransportCageCutout };
class ChinaTransportCageCutout extends PathCutout {
}

export { ChinaTransportCageCutout };
class NicotHatchingCageCutout extends PathCutout {
}

export { NicotHatchingCageCutout };
class JZsBZsCageCutout extends Cutout {
    cutout(box, x, y, color, color2) {;
        this.ctx.save();
        this.ctx.save();
        box.set_source_color(color);
        box.circle((x + this.OFFSET[0]), (y + this.OFFSET[1]), this.RADIUS);
        box.rectangularHole(x, y, this.DIMENSIONS[0], this.DIMENSIONS[1], (this.DIMENSIONS[1] / 2), {color: color2});
        this.ctx.restore();
        this.ctx.restore();
    }

}

export { JZsBZsCageCutout };
class QueenIconCutout extends MultiPathCutout {
}

export { QueenIconCutout };
class AirHolesForNicotTransportCageCutout extends Cutout {
    cutout(box, x, y, color) {
        let aw = box.aw;
        let ah = box.ah;
        this.ctx.save();
        box.set_source_color(color);
        let l;
        let h;
        [l, h] = this.SIZE;
        let ox;
        let oy;
        [ox, oy] = this.OFFSET;
        box.rectangularHole((x + ox), ((y + oy) - h), l, h, (h / 2.0), true, true);
        box.rectangularHole((x + ox), ((y + oy) + h), l, h, (h / 2.0), true, true);
        this.ctx.restore();
    }

}

export { AirHolesForNicotTransportCageCutout };
class AirHolesForChinaTransportCageCutout extends AirHolesForNicotTransportCageCutout {
}

export { AirHolesForChinaTransportCageCutout };
class HexHolesCutout extends Cutout {
    cutout(box, x, y, color) {
        this.ctx.save();
        box.set_source_color(color);
        ctx.translate(x, y);
        ctx.translate(...this.OFFSET);
        let draw = box.regularPolygonHole;
        draw(0.0, 0.0, this.IRADIUS);
        //let cxy = /* unknown node ListComp */;
        let r = (2.5 * this.IRADIUS);
        for (let [cx, cy] of cxy) {
            draw((r * cx), (r * cy), this.IRADIUS);
        }
        if (this.LEVELS > 2) {
            r = (5.0 * this.IRADIUS);
            for (let [cx, cy] of cxy) {
                draw((r * cx), (r * cy), this.IRADIUS);
                let lx;
                let ly;
                [lx, ly] = cxy[-1];
            }
            r *= 0.5;
            for (let [cx, cy] of cxy) {
                draw((r * (cx + lx)), (r * (cy + ly)), this.IRADIUS);
                [lx, ly] = [cx, cy];
            }
        }
        this.ctx.restore();
    }

}

export { HexHolesCutout };
class GiantHexHoleCutout extends Cutout {
    constructor(number, w, h) {
        super();
        if (number === null) {
            this.number = number;
        }
        else {
            if ((w === null || h === null)) {
                if (w === null) {
                    let nw = parseInt((w / ((2 * 2.5) * this.IRADIUS)));
                }
                else {
                    nw = float("inf");
                }
                if (h === null) {
                    let nh = parseInt((h / ((Math.sqrt(3) * 2.5) * this.IRADIUS)));
                }
                else {
                    nh = float("inf");
                }
                this.number = Math.min(nw, nh);
            }
        }
    }

    get_circumcircle() {
        return ((2.5 * this.IRADIUS) * (this.number - 1));
    }

    get_incircle() {
        return ((2.5 * this.IRADIUS) * (this.number - 2));
    }

    cutout(box, x, y, color) {
        this.ctx.save();
        box.set_source_color(color);
        ctx.translate(x, y);
        ctx.translate(...this.OFFSET);
        let draw = (x, y) => box.regularPolygonHole(x, y, this.IRADIUS);
        let number = (this.number - 1);
        let length = ((number * 2.5) * this.IRADIUS);
        let a = (120 * Math.PI / 180);
        let cx = (length * Math.cos(a));
        let cy = (length * Math.sin(a));
        let dx = (this.IRADIUS * 2.5);
        for (let _ = 0; _ < 6; _ += 1) {
            for (let row = 0; row < number; row += 1) {
                draw((cx + (dx * row)), cy);
            }
            ctx.rotate((60 * Math.PI / 180));
        }
        this.ctx.restore();
    }

}

export { GiantHexHoleCutout };
class AirHolesForNicotIncubatorCageCutout extends HexHolesCutout {
}

export { AirHolesForNicotIncubatorCageCutout };
class AirHolesCover extends HexHolesCutout {
}

export { AirHolesCover };
class AirHolesForNicotHatchingCageCutout extends HexHolesCutout {
}

export { AirHolesForNicotHatchingCageCutout };
class BeeQueenTransportBoxLidSettings extends LidSettings {
    static absolute_params = {
        ...LidSettings.absolute_params,
        "cover": ["none", "airholes", "queenicon", "queenicon_airholes"],
        "queenicon_scale": 75.0,
        "queenicon_angle": [0, 90],
    };
}

export { BeeQueenTransportBoxLidSettings };
class BeeQueenTransportBoxLid extends Lid {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.ncb = 0;
    }

    handleCB(x, y) {
        if ((this.handle === "none" && this.style !== "chest")) {
            let airholes = ["airholes", "queenicon_airholes"].includes(this.cover);
            let queeniconholes = ["queenicon", "queenicon_airholes"].includes(this.cover);
            let queenicon = (queeniconholes && (this.settings.style !== "flat" || this.ncb > 0));
            this.ncb += 1;
            return this.render_cover(x, y, airholes, queenicon, queeniconholes);
        }
        else {
            return super.handleCB(x, y);
        }
    }

    render_cover(x, y, airholes, queenicon, queeniconholes) {
        const cover = () => {
            if (airholes) {
                this.ctx.save();
                ctx.translate((0.5 * x), (0.5 * y));
                let cutout = AirHolesCover();
                let dx = ((0.5 * x) - (2.0 * cutout.RADIUS));
                let dy = ((0.5 * y) - (2.0 * cutout.RADIUS));
                cutout.cutout(this, dx, dy);
                cutout.cutout(this, dx, -dy);
                cutout.cutout(this, -dx, -dy);
                cutout.cutout(this, -dx, dy);
                this.ctx.restore();
            }
            if ((queenicon || queeniconholes)) {
                this.ctx.save();
                ctx.translate((0.5 * x), (0.5 * y));
                let a = this.settings.queenicon_angle;
                if (a) {
                    ctx.rotate(((a / 180) * Math.PI));
                }
                let k = (this.settings.queenicon_scale / 100.0);
                cutout = GiantHexHoleCutout();
                if (queeniconholes) {
                    cutout.cutout(this, 0.0, 0.0);
                }
                if (queenicon) {
                    let r = ((2.0 * 0.7) * cutout.get_incircle());
                    QueenIconCutout.cutout(this, 0.0, 0.0);
                }
                this.ctx.restore();
            }
        };

        return cover;
    }

}

export { BeeQueenTransportBoxLid };
class BeeQueenTransportBox extends _TopEdge {
    static DEFAULT = {
        sx: "5:45*3:5",
        sy: "5:25*3:5", 
        sh: "12:80",
        aw: 3.0,
        ah: "50:25",
        ax: "10:20:10:20:10:20:10",
        ay: "20:60:20",
        bottom_edge: "s",
        top_edge: "e"
    };
    
    static CHOICES = {
        top_edge: "eStG",
        bottom_edge: "Fhsše"
    };
    
    static LIDSETTINGS = {
        style: "overthetop"
    };

    _buildObjects() {
        super._buildObjects();
        // Get lid settings from edgesettings or use defaults
        const lidEdgeSettings = this.edgesettings?.BeeQueenTransportBoxLid || {};
        // Merge with LIDSETTINGS defaults
        const mergedSettings = { ...BeeQueenTransportBox.LIDSETTINGS, ...lidEdgeSettings };
        this.lidSettings = new BeeQueenTransportBoxLidSettings(this.thickness, true, mergedSettings);
        this.lid = new BeeQueenTransportBoxLid(this, this.lidSettings);
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(BeeQueenTransportBoxLidSettings, BeeQueenTransportBox.LIDSETTINGS);
        this.addSettingsArgs(edges.StackableSettings);
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType(BeeQueenTransportBox.CHOICES["top_edge"]), choices: [...BeeQueenTransportBox.CHOICES["top_edge"]], default: BeeQueenTransportBox.DEFAULT["top_edge"], help: "edge type for top edge"});
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType(BeeQueenTransportBox.CHOICES["bottom_edge"]), choices: [...BeeQueenTransportBox.CHOICES["bottom_edge"]], default: BeeQueenTransportBox.DEFAULT["bottom_edge"], help: "edge type for bottom edge"});
        this.buildArgParser({sx: BeeQueenTransportBox.DEFAULT["sx"], sy: BeeQueenTransportBox.DEFAULT["sy"], sh: BeeQueenTransportBox.DEFAULT["sh"]});
        this.argparser.add_argument("--aw", {action: "store", type: "float", default: BeeQueenTransportBox.DEFAULT["aw"], help: "air hole slot width in mm"});
        this.argparser.add_argument("--ah", {action: "store", type: "str", default: BeeQueenTransportBox.DEFAULT["ah"], help: "air hole sections bottom to top in mm"});
        this.argparser.add_argument("--ax", {action: "store", type: "str", default: BeeQueenTransportBox.DEFAULT["ax"], help: "air hole sections left to right in %% of the box width"});
        this.argparser.add_argument("--ay", {action: "store", type: "str", default: BeeQueenTransportBox.DEFAULT["ay"], help: "air hole sections back to front in %% of the box depth"});
        //let cutout_choices = /* unknown node ListComp */;
        //let cutout_descriptions = unknown.join(/* unknown node GeneratorExp */);
        //let layers = /* unknown node ListComp */;
       // for (let [n, default] of enumerate(layers)) {
        //    let layer = ((layers.length - 1) - n);
            //this.argparser.add_argument(/* unknown node JoinedStr */, {action: "store", choices: cutout_choices, default: default, help: /* unknown node JoinedStr */});
        //}
    }

    get_cutout(cutout_name) {
        for (let cutout_class of this.CUTOUTS) {
            if (cutout_class.__name__.removesuffix("Cutout") === cutout_name) {
                return cutout_class();
            }
        }
        ValueError(/* unknown node JoinedStr */)
    }

    cutouts(layer = 0) {
        // Get the layer property name (layer0, layer1, etc.)
        const layerPropName = `layer${layer}`;
        const cutoutName = this[layerPropName];
        
        // Skip if no cutout configured for this layer
        if (!cutoutName || cutoutName === "None") {
            return;
        }
        
        let y = 0.0;
        let cutout;
        try {
            cutout = this.get_cutout(cutoutName);
        } catch (e) {
            // If cutout not found, skip
            return;
        }
        
        if (!cutout || !cutout.DIMENSIONS) {
            return;
        }
        
        for (let dy of this.sy) {
            let x = 0.0;
            for (let dx of this.sx) {
                if ((dx > cutout.DIMENSIONS[0] && dy > cutout.DIMENSIONS[1])) {
                    cutout.cutout(this, (x + (dx / 2.0)), (y + (dy / 2.0)));
                }
                x += dx;
            }
            y += dy;
        }
    }

    sideholes(l) {
        let t = this.thickness;
        let h = (-0.5 * t);
        for (let d of this.sh.slice(0, -1)) {
            h += (d + t);
            this.fingerHolesAt(0, h, l, {angle: 0});
        }
    }

    airholes(l, sections) {
        let aw = this.aw;
        let total = sections.reduce((a, b) => a + b, 0);
        let pl = (l / 100.0);
        let y = 0.0;
        this.ctx.save();
        for (let h of this.ah) {
            y += h;
            let px = 0.0;
            for (let [n, s] of enumerate(sections)) {
                if ((n % 2) === 1) {
                    this.rectangularHole((px * pl), y, (pl * s), aw, (aw / 2.0), false, true);
                }
                px += s;
            }
        }
        this.ctx.restore();
    }

    debugview(front_not_side) {;
        if (this.debug) {
            if (this.bottom_edge === "s") {
                let h = 0.0;
                let layer = this.layer1;
            }
            else {
                h = (this.thickness + this.sh[0]);
                layer = this.layer0;
            }
            let cutout = this.get_cutout(layer);
            let cx = cutout.DIMENSIONS[(front_not_side ? 0 : 1)];
            let x = 0.0;
            for (let dx of (front_not_side ? this.sx : this.sy)) {
                if (dx > cx) {
                    cutout.sideview(this, (x + (dx / 2.0)), h, front_not_side);
                }
                x += dx;
            }
        }
    }

    render() {
        // Parse section strings to arrays if needed
        if (typeof this.ah === 'string') {
            this.ah = this._parseSections(this.ah);
        }
        if (typeof this.ax === 'string') {
            this.ax = this._parseSections(this.ax);
        }
        if (typeof this.ay === 'string') {
            this.ay = this._parseSections(this.ay);
        }
        
        let x = this.sx.reduce((a, b) => a + b, 0);
        let y = this.sy.reduce((a, b) => a + b, 0);
        let h = (this.sh.reduce((a, b) => a + b, 0) + (this.thickness * (this.sh.length - 1)));
        let b = this.bottom_edge;
        let t_left;
        let t_back;
        let t_right;
        let t_front;
        [t_left, t_back, t_right, t_front] = this.topEdges(this.top_edge);
        this.ctx.save();
        this.rectangularWall(x, h, [b, "F", t_back, "F"], {ignore_widths: [1, 6], callback: [() => [this.sideholes(x), this.airholes(x, this.ax), this.debugview(true)]], move: "right", label: "Back"});
        this.rectangularWall(x, h, [b, "F", t_front, "F"], {ignore_widths: [1, 6], callback: [() => [this.sideholes(x), this.airholes(x, this.ax), this.debugview(true)]], move: "right", label: "Front"});
        this.rectangularWall(y, h, [b, "f", t_left, "f"], {ignore_widths: [1, 6], callback: [() => [this.sideholes(y), this.airholes(y, this.ay), this.debugview(false)]], move: "right", label: "Left"});
        this.rectangularWall(y, h, [b, "f", t_right, "f"], {ignore_widths: [1, 6], callback: [() => [this.sideholes(y), this.airholes(y, this.ay), this.debugview(false)]], move: "right", label: "Right"});
        this.ctx.restore();
        this.rectangularWall(x, h, [b, "F", t_back, "F"], {ignore_widths: [1, 6], move: "up only"});
        // Inner layers - bottom layer only if bottom edge is not "e" or "š"
        if (!["e", "š"].includes(b)) {
            this.rectangularWall(x, y, "ffff", {callback: [() => this.cutouts(0)], move: "right", label: "Bottom Layer"});
        }
        for (let layer = 1; layer < this.sh.length; layer += 1) {
            const currentLayer = layer; // Capture for closure
            this.rectangularWall(x, y, "ffff", {callback: [() => this.cutouts(currentLayer)], move: "right", label: `Layer ${layer}`});
        }
        this.lid(x, y, this.top_edge);
    }

}

export { BeeQueenTransportBox };