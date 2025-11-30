const { Boxes } = require('./boxes/boxes');

class TestBox extends Boxes {
    render() {
        this.rectangularWall(100, 100, "eeee", {move: "right"});
        this.roundedPlate(50, 50, 10, "e", {move: "right"});
        this.surroundingWall(50, 50, 10, 20, {move: "right"});

        // Test holes
        this.ctx.save();
        this.moveTo(0, 150);
        this.circle(10, 10, 5);
        this.hole(30, 10, 5);
        this.rectangularHole(50, 10, 10, 5);
        this.dHole(70, 10, 5);
        this.flatHole(90, 10, 5);
        this.mountingHole(110, 10, 3, 6);
        this.ctx.restore();

        // Test Text and NEMA
        this.moveTo(0, 200);
        this.text("Test Text", 0, 0, 0, "middle center", 10);
        this.NEMA(17, 50, 0);
        this.TX(10, 100, 0);

        // Test polygonWall
        this.moveTo(0, 300);
        const borders = [50, 90, 50, 90, 50, 90, 50, 90];
        this.polygonWall(borders);
    }
}

const b = new TestBox();
b.open();
b.render();
const result = b.close();
console.log("SVG Output generated.");
// console.log(result);
