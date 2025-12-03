import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Arcade extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 450.0, help: "inner width of the console"});
        this.argparser.add_argument("--monitor_height", {action: "store", type: "float", default: 350.0, help: "inner width of the console"});
        this.argparser.add_argument("--keyboard_depth", {action: "store", type: "float", default: 150.0, help: "inner width of the console"});
        
        // Initialize with default values
        this.width = 450.0;
        this.monitor_height = 350.0;
        this.keyboard_depth = 150.0;
    }
    // ORGINAL PYTHON CODE START
    // def side(self, move=None):
    //     # TODO: Add callbacks

    //     y, h = self.y, self.h
    //     t = self.thickness
    //     r = 10
    //     d_30 = 2* r * math.tan(math.radians(15))

    //     tw, th = y+2*r+(self.front+t) * math.sin(math.radians(15)), h+2*r+(self.topback+t)/2**0.5
    //     if self.move(tw, th, move, True):
    //         return

    //     self.moveTo(r+(self.front+t) * math.sin(math.radians(15)), 0)

    //     with self.saved_context():
    //         self.moveTo(0, r)
    //         self.polyline(y, 90, h, 45, self.topback+t, 90, self.top+2*t, 90, 100, -90, self.monitor_height, -30, self.keyboard_depth+2*t, 90, self.front+t, 75)

    //     self.fingerHolesAt(10, r+t/2, self.bottom, 0)
    //     self.polyline(y, (90, r))
    //     self.fingerHolesAt(0.5*t, r+t/2, self.back, 0)
    //     self.fingerHolesAt(h-40-40, r+t/2, self.back, 0)

    //     self.polyline(h, (45, r))
    //     self.fingerHolesAt(0, r+t/2, self.topback, 0)
    //     self.fingerHolesAt(self.topback+t/2, r+t, self.top, 90)
    //     self.fingerHolesAt(self.topback, self.top+r+1.5*t, self.speaker, -180)
    //     self.polyline(self.topback+t, (90, r), self.top+2*t, (90, r), 100-2*r, (-90, r),  self.monitor_height-2*r-d_30, (-30, r))
    //     self.fingerHolesAt(-d_30+t, r+.5*t, self.keyboard_depth, 0)
    //     self.fingerHolesAt(-d_30+0.5*t, r+t, self.keyback, 90)
    //     self.fingerHolesAt(self.keyboard_depth-d_30+1.5*t, r+t, self.front, 90)
    //     self.polyline(self.keyboard_depth-d_30+2*t, (90, r), self.front+t, (75, r))

    //     self.move(tw, th, move)
    // ORGINAL PYTHON CODE END

    side(move) {
        let y;
        let h;
        [y, h] = [this.y, this.h];
        let t = this.thickness;
        let r = 10;
        let d_30 = ((2 * r) * Math.tan((15 * Math.PI / 180)));
        let tw;
        let th;
        [tw, th] = [((y + (2 * r)) + ((this.front + t) * Math.sin((15 * Math.PI / 180)))), ((h + (2 * r)) + ((this.topback + t) / (2 ** 0.5)))];
        
        // Extract move direction from object if needed
        let moveDirection = move;
        if (typeof move === 'object' && move.move) {
            moveDirection = move.move;
        }
        
        if (this.move(tw, th, moveDirection, true)) {
            return;
        }
        
        // Store the starting position for the outer outline
        const startX = (r + ((this.front + t) * Math.sin((15 * Math.PI / 180))));
        const startY = 0;
        
        // Draw inner outline (saved context)
        this.ctx.save();
        this.moveTo(startX, startY);
        this.moveTo(0, r);
        this.polyline(y, 90, h, 45, (this.topback + t), 90, (this.top + (2 * t)), 90, 100, -90, this.monitor_height, -30, (this.keyboard_depth + (2 * t)), 90, (this.front + t), 75);
        this.ctx.restore();
        
        // Draw outer outline (continue from starting position)
        this.moveTo(startX, startY);
        
        // Draw finger holes at bottom
        this.fingerHolesAt(10, (r + (t / 2)), this.bottom, 0);
        
        // Continue with outer outline - section 1
        this.polyline(y, [90, r]);
        
        // Draw finger holes at back
        this.fingerHolesAt((0.5 * t), (r + (t / 2)), this.back, 0);
        this.fingerHolesAt(((h - 40) - 40), (r + (t / 2)), this.back, 0);
        
        // Continue with outer outline - section 2
        this.polyline(h, [45, r]);
        
        // Draw finger holes at top
        this.fingerHolesAt(0, (r + (t / 2)), this.topback, 0);
        this.fingerHolesAt((this.topback + (t / 2)), (r + t), this.top, 90);
        this.fingerHolesAt(this.topback, ((this.top + r) + (1.5 * t)), this.speaker, -180);
        
        // Continue with outer outline - section 3
        this.polyline((this.topback + t), [90, r], (this.top + (2 * t)), [90, r], (100 - (2 * r)), [-90, r], ((this.monitor_height - (2 * r)) - d_30), [-30, r]);
        
        // Draw finger holes at keyboard
        this.fingerHolesAt((-d_30 + t), (r + (0.5 * t)), this.keyboard_depth, 0);
        this.fingerHolesAt((-d_30 + (0.5 * t)), (r + t), this.keyback, 90);
        this.fingerHolesAt(((this.keyboard_depth - d_30) + (1.5 * t)), (r + t), this.front, 90);
        
        // Complete the outer outline - section 4
        this.polyline(((this.keyboard_depth - d_30) + (2 * t)), [90, r], (this.front + t), [75, r]);
        
        this.move(tw, th, moveDirection);
    }

    keyboard() {
    }

    speakers() {
        this.hole((this.width / 4.0), 50, 40);
        this.hole(((this.width * 3) / 4.0), 50, 40);
    }

    render() {
        let width = this.width;
        let t = this.thickness;
        this.back = 40;
        this.front = 120;
        this.keyback = 50;
        this.speaker = 150;
        this.top = 100;
        this.topback = 200;
        // Calculate y and h from the arcade dimensions (complex geometry calculations)
        this.y = ((this.topback + this.top + 3*t - 100 + this.monitor_height) / (2**0.5)
                  + (this.keyboard_depth + 2*t) * Math.cos(15 * Math.PI / 180)
                  - (this.front + t) * Math.sin(15 * Math.PI / 180));
        this.h = ((this.monitor_height - this.topback + this.top + 1*t + 100) / (2**0.5)
                  + (this.keyboard_depth + 2*t) * Math.sin(15 * Math.PI / 180)
                  + (this.front + t) * Math.cos(15 * Math.PI / 180));
        this.bottom = ((this.y - 40) - (0.5 * t));
        this.backwall = (this.h - 40);
        this.rectangularWall(width, this.bottom, "efff", {move: "up"});
        this.rectangularWall(width, this.back, "Ffef", {move: "up"});
        this.rectangularWall(width, this.backwall, "eeee", {move: "up"});
        this.rectangularWall(width, this.back, "efef", {move: "up"});
        this.rectangularWall(width, this.front, "efff", {move: "up"});
        this.rectangularWall(width, this.keyboard_depth, "FfFf", {callback: [this.keyboard.bind(this)], move: "up"});
        this.rectangularWall(width, this.keyback, "ffef", {move: "up"});
        this.rectangularWall(width, this.speaker, "efff", {callback: [null, null, this.speakers.bind(this)], move: "up"});
        this.rectangularWall(width, this.top, "FfFf", {move: "up"});
        this.rectangularWall(width, this.topback, "ffef", {move: "up"});
        this.side({move: "up"});
        this.side({move: "up"});

    }

}

export { Arcade };