import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

let logger = logging.getLogger(__name__);
class Dimensions extends Boxes {
    __post_init__() {
        this.check_matting_params();
        this.check();
    }

    photo_x() {;
        return this.x;
    }

    photo_y() {;
        return this.y;
    }

    frame_h() {;
        return this.frame_w;
    }

    mat_hole_x() {;
        return (this.photo_x - (2 * this.matting_overlap));
    }

    mat_hole_y() {;
        return (this.photo_y - (2 * this.matting_overlap));
    }

    golden_matting_width() {;
        let phi = ((1 + Math.sqrt(5)) / 2);
        let a = 4;
        let x = this.mat_hole_x;
        let y = this.mat_hole_y;
        let b = (2 * (x + y));
        let c = ((-(phi - 1) * x) * y);
        let disc = ((b ** 2) - ((4 * a) * c));
        let x1 = ((-b + Math.sqrt(disc)) / (2 * a));
        return x1;
    }

    fixed_glass_size() {;
        return bool((this.glass_w && this.glass_h));
    }

    matting_w() {;
        if (this.fixed_glass_size) {
            let visible = (this.glass_w - (2 * this.frame_overlap));
            return ((visible - this.mat_hole_x) / 2);
        }
        if (this.golden_mat) {
            return this.golden_matting_width;
        }
        return this.matting_w_param;
    }

    matting_h() {;
        if (this.fixed_glass_size) {
            let visible = (this.glass_h - (2 * this.frame_overlap));
            return ((visible - this.mat_hole_y) / 2);
        }
        if (this.golden_mat) {
            return this.golden_matting_width;
        }
        return this.matting_h_param;
    }

    mat_x() {;
        return ((this.mat_hole_x + (2 * this.matting_w)) + (2 * this.frame_overlap));
    }

    mat_y() {;
        return ((this.mat_hole_y + (2 * this.matting_h)) + (2 * this.frame_overlap));
    }

    visible_mat_ratio() {;
        let visible_mat_area = (this.window_x * this.window_y);
        let visible_photo_area = (this.mat_hole_x * this.mat_hole_y);
        return (visible_mat_area / visible_photo_area);
    }

    pocket_x() {;
        return (this.mat_x + this.guide_fudge);
    }

    pocket_y() {;
        return (this.base_y - this.guide_h);
    }

    guide_w() {;
        return ((this.base_x - this.pocket_x) / 2);
    }

    guide_h() {;
        return ((this.base_y - this.mat_y) / 2);
    }

    window_x() {;
        return (this.mat_x - (this.frame_overlap * 2));
    }

    window_y() {;
        return (this.mat_y - (this.frame_overlap * 2));
    }

    base_x() {;
        return (this.window_x + (2 * this.frame_w));
    }

    base_y() {;
        return (this.window_y + (2 * this.frame_h));
    }

    centre_x() {;
        return (this.base_x / 2);
    }

    centre_y() {;
        return (this.base_y / 2);
    }

    split_middle() {
        return this.split_middle_param;
    }

    unsplit_middle() {
        return !this.split_middle_param;
    }

    split_front() {
        return this.split_front_param;
    }

    unsplit_front() {
        return !this.split_front_param;
    }

    check_matting_params() {
        let whinge_threshold_mm = 0.5;
        if ((this.golden_mat && this.fixed_glass_size)) {
            let calc = /* unknown node JoinedStr */;
            let advice = "If you want to specify the glass size, do not use golden matting.";
            ValueError(/* unknown node JoinedStr */)
        }
        if ((this.fixed_glass_size && (this.matting_w_param || this.matting_h_param))) {
            let d_w = (this.matting_w_param - this.matting_w);
            let d_h = (this.matting_h_param - this.matting_h);
            if ((abs(d_w) > whinge_threshold_mm || abs(d_h) > whinge_threshold_mm)) {
                let msg = /* unknown node JoinedStr */;
                advice = "If you want to specify the matting widths, set the glass size to zero. If you want to specify the glass size, set the matting widths to 0.";
                logger.warning(msg);
                ValueError(/* unknown node JoinedStr */)
            }
        }
        if ((this.golden_mat && (this.matting_w_param || this.matting_h_param))) {
            d_w = (this.matting_w_param - this.golden_matting_width);
            d_h = (this.matting_h_param - this.golden_matting_width);
            if ((abs(d_w) > whinge_threshold_mm || abs(d_h) > whinge_threshold_mm)) {
                msg = /* unknown node JoinedStr */;
                advice = "If you want to specify the matting width, set the glass size to zero. If you want to specify the glass size, set the matting widths to 0.";
                logger.warning(msg);
                ValueError(/* unknown node JoinedStr */)
            }
        }
    }

    check() {
        let photo_info = /* unknown node JoinedStr */;
        let mat_hole_info = /* unknown node JoinedStr */;
        let matting_w_info = /* unknown node JoinedStr */;
        let mat_info = /* unknown node JoinedStr */;
        let base_info = /* unknown node JoinedStr */;
        let base_x_info = /* unknown node JoinedStr */;
        let base_y_info = /* unknown node JoinedStr */;
        let window_info = /* unknown node JoinedStr */;
        let pocket_info = /* unknown node JoinedStr */;
        if (this.fixed_glass_size) {
            let glass_info = /* unknown node JoinedStr */;
        }
        else {
            glass_info = "Glass size: not specified";
        }
        let info = [photo_info, mat_hole_info, matting_w_info, glass_info, mat_info, window_info, pocket_info, base_info, base_x_info, base_y_info];
        let issues = [];
        for (let field of fields(this)) {
            if (isinstance(getattr(this, field.name), "float")) {
                let v = getattr(this, field.name);
                if (v < 0) {
                    issues.append(/* unknown node JoinedStr */);
                }
            }
        }
        for (let [name, value] of inspect.getmembers(this.__class__, (o) => isinstance(o, property))) {
            let prop_value = getattr(this, name);
            if (isinstance(prop_value, "float")) {
                if (prop_value < 0) {
                    issues.append(/* unknown node JoinedStr */);
                }
            }
        }
        if (issues) {
            let info_str = unknown.join(info);
            let issues_str = unknown.join(issues);
            ValueError(/* unknown node JoinedStr */)
        }
    }

}

export { Dimensions };
class PhotoFrame extends Boxes {
    constructor() {
        super();
        this.add_arguments();
    }

    render() {
        this.d = Dimensions();
        this.render_base();
        this.render_middle();
        this.render_front();
        this.render_matting();
        this.render_photo();
    }

    render_middle() {;
        let stack_n = 1;
        if (this.d.unsplit_middle) {
            for (let _ = 0; _ < stack_n; _ += 1) {
                this.middle_unsplit();
            }
        }
        if (this.d.split_middle) {
            for (let _ = 0; _ < stack_n; _ += 1) {
                this.middle_split();
            }
        }
    }

    middle_split() {
        let lyr = "Middle";
        let d = this.d;
        let edge_types = "DeD";
        let edge_lengths = [d.guide_w, (d.base_x - (2 * d.guide_w)), d.guide_w];
        let e = edges.CompoundEdge(this, edge_types, edge_lengths);
        let move = "up";
        this.rectangularWall(d.base_x, d.guide_h, ["e", "e", e, "e"], {move: move, label: /* unknown node JoinedStr */});
        this.rectangularWall(d.pocket_y, d.guide_w, "edee", {move: move, label: /* unknown node JoinedStr */});
        this.rectangularWall(d.pocket_y, d.guide_w, "edee", {move: move, label: /* unknown node JoinedStr */});
    }

    middle_unsplit() {
        let lyr = "Middle";
        let d = this.d;
        let dims_str = /* unknown node JoinedStr */;
        let border_str = /* unknown node JoinedStr */;
        let label = /* unknown node JoinedStr */;
        let poly = [d.base_x, 90, d.base_y, 90, d.guide_w, 90, d.pocket_y, -90, d.pocket_x, -90, d.pocket_y, 90, d.guide_w, 90, d.base_y, 90];
        this.polygonWall(poly, "eeee", {move: "up", label: label});
    }

    render_matting() {
        let d = this.d;
        let dims_str = /* unknown node JoinedStr */;
        let border_str = /* unknown node JoinedStr */;
        let overlap_str = /* unknown node JoinedStr */;
        let label = /* unknown node JoinedStr */;
        let callback = [() => this.rectangularHole((d.mat_x / 2), (d.mat_y / 2), d.mat_hole_x, d.mat_hole_y)];
        this.rectangularWall(d.mat_x, d.mat_y, "eeee", {callback: callback, move: "right", label: label});
    }

    golden_matting_width(photo_width, photo_height) {
        let phi = ((1 + Math.sqrt(5)) / 2);
        let a = 4;
        let b = (2 * (photo_width + photo_height));
        let c = ((-(phi - 1) * photo_width) * photo_height);
        let disc = ((b ** 2) - ((4 * a) * c));
        let x1 = ((-b + Math.sqrt(disc)) / (2 * a));
        return x1;
    }

    display_results(photo_width, photo_height, matting_width) {
        let photo_area = (photo_width * photo_height);
        let photo_perimeter = (2 * (photo_width + photo_height));
        let mat_x = (photo_width + (2 * matting_width));
        let mat_y = (photo_height + (2 * matting_width));
        let mat_perimeter = (2 * (mat_x + mat_y));
        let total_area = ((photo_width + (2 * matting_width)) * (photo_height + (2 * matting_width)));
        let ratio = (total_area / photo_area);
        let diff = (total_area - photo_area);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
        logger.debug(/* unknown node JoinedStr */);
    }

    render_front() {
        if (this.d.unsplit_front) {
            this.front_unsplit();
        }
        if (this.d.split_front) {
            this.front_split();
        }
    }

    front_unsplit() {
        let lyr = "Front";
        let d = this.d;
        let dims_str = /* unknown node JoinedStr */;
        let border_str = /* unknown node JoinedStr */;
        let label = /* unknown node JoinedStr */;
        let callback = [() => this.rectangularHole(d.centre_x, d.centre_y, d.window_x, d.window_y)];
        this.rectangularWall(d.base_x, d.base_y, "eeee", {callback: callback, move: "up", label: label});
    }

    front_split() {
        let lyr = "Front";
        let d = this.d;
        let hypo_h = Math.sqrt((2 * (d.frame_h ** 2)));
        let hypo_w = Math.sqrt((2 * (d.frame_w ** 2)));
        let tops = [d.base_x, (90 + 45), hypo_h, (90 - 45), (d.base_x - (2 * d.frame_h)), (90 - 45), hypo_h, null];
        let sides = [d.base_y, (90 + 45), hypo_w, (90 - 45), (d.base_y - (2 * d.frame_w)), (90 - 45), hypo_w, null];
        for (let bit of ["top", "btm"]) {
            let label = /* unknown node JoinedStr */;
            this.polygonWall(tops, "eded", {move: "up", label: label});
        }
        for (let bit of "LR") {
            label = /* unknown node JoinedStr */;
            this.polygonWall(sides, "eDeD", {move: "up", label: label});
        }
    }

    render_base() {
        let d = this.d;
        let label = /* unknown node JoinedStr */;
        let callback = [() => this.photo_registration_rectangle(), null, null, null];
        let holes = this.edgesettings.get.get("num", 0);
        this.rectangularWall(d.base_x, d.base_y, (holes ? "eeGe" : "eeee"), {callback: callback, move: "up", label: label});
    }

    photo_registration_rectangle() {;
        let d = this.d;
        this.set_source_color(Color.ETCHING);
        this.rectangular_etching(d.centre_x, d.centre_y, d.photo_x, d.photo_y);
        this.ctx.stroke();
    }

    rectangular_etching(x, y, dx, dy, r, center_x, center_y) {;
        logger.debug(/* unknown node JoinedStr */);
        r = Math.min(r, (dx / 2.0), (dy / 2.0));
        let x_start = (center_x ? x : (x + (dx / 2.0)));
        let y_start = (center_y ? (y - (dy / 2.0)) : y);
        this.moveTo(x_start, y_start, 180);
        this.edge(((dx / 2.0) - r));
        for (let d of [dy, dx, dy, ((dx / 2.0) + r)]) {
            this.corner(-90, r);
            this.edge((d - (2 * r)));
        }
    }

    add_arguments() {
        this.addSettingsArgs(edges.MountingSettings, {num: 3, d_head: 8.0, d_shaft: 4.0});
        this.addSettingsArgs(edges.DoveTailSettings, {size: 2.0, depth: 1.0});
        // this.buildArgParser();
        this.argparser.add_argument("--x", {action: "store", type: "float", default: this.x, help: "Width of the photo, not including any border"});
        this.argparser.add_argument("--y", {action: "store", type: "float", default: this.y, help: "Height of the photo, not including any border"});
        this.argparser.add_argument("--golden_mat", {action: "store", type: BoolArg(), default: this.golden_mat, help: "Use golden ratio to calculate matting width"});
        this.argparser.add_argument("--matting_w", {action: "store", type: "float", default: this.matting_w, help: "Width of the matting border around the sides of the photo"});
        this.argparser.add_argument("--matting_h", {action: "store", type: "float", default: this.matting_h, help: "Width of the matting border around top/bottom of the photo"});
        this.argparser.add_argument("--matting_overlap", {action: "store", type: "float", default: this.matting_overlap, help: "Matting overlap of the photo, e.g. 2mm if photo has border, 5mm if not"});
        this.argparser.add_argument("--glass_w", {action: "store", type: "float", default: this.glass_w, help: "Width of the pre-cut glass or acrylic"});
        this.argparser.add_argument("--glass_h", {action: "store", type: "float", default: this.glass_h, help: "Height of the pre-cut glass or acrylic"});
        this.argparser.add_argument("--frame_w", {action: "store", type: "float", default: this.frame_w, help: "Width of the frame border around the matting"});
        this.argparser.add_argument("--guide_fudge", {action: "store", type: "float", default: this.guide_fudge, help: "Clearance in the guide pocket to help slide the matting/glass in"});
        this.argparser.add_argument("--frame_overlap", {action: "store", type: "float", default: this.frame_overlap, help: "Frame overlap to hold the matting/glass in place"});
        this.argparser.add_argument("--split_front", {action: "store", type: BoolArg(), default: this.split_front, help: "Split front into thin rectangles to save material"});
    }

    render_photo() {
        let d = this.d;
        this.set_source_color(Color.ANNOTATIONS);
        let label = /* unknown node JoinedStr */;
        this.rectangularWall(d.photo_x, d.photo_y, "eeee", {label: label, move: "up"});
        this.set_source_color(Color.BLACK);
    }

}

export { PhotoFrame };