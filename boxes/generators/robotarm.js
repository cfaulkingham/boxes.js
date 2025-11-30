import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class RobotArm extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        for (let i = 1; i < 6; i += 1) {
            let ra = robot.RobotArg(true);
            let sa = servos.ServoArg();
            this.argparser.add_argument(("--type%i" % i), {action: "store", type: ra, default: "none", choices: ra.choices(), help: "type of arm segment"});
            this.argparser.add_argument(("--servo%ia" % i), {action: "store", type: sa, default: "Servo9g", choices: sa.choices(), help: "type of servo to use"});
            this.argparser.add_argument(("--servo%ib" % i), {action: "store", type: sa, default: "Servo9g", choices: sa.choices(), help: "type of servo to use on second side (if different is supported)"});
            this.argparser.add_argument(("--length%i" % i), {action: "store", type: "float", default: 50.0, help: "length of segment axle to axle"});
        }
    }

    render() {
        for (let i = 5; i < 0; i += -1) {
            let armtype = getattr(this, ("type%i" % i));
            let length = getattr(this, ("length%i" % i));
            let servoA = getattr(this, ("servo%ia" % i));
            let servoB = getattr(this, ("servo%ib" % i));
            let armcls = getattr(robot, armtype, null);
            if (!armcls) {
            }
            let servoClsA = getattr(servos, servoA);
            let servoClsB = getattr(servos, servoB);
            armcls(length, {move: "up"});
        }
    }

}

export { RobotArm };