/**
 * 2D vector as an object instance.
 */
class Vector2 {
        constructor(x = 0.0, y = 0.0) {
                this.x = x;
                this.y = y;
        }
        getMagnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
        getDirection() { return Math.atan2(this.y, this.x); }
        setMagnitude(magnitude) {
                const dir = this.getDirection();
                this.x = Math.cos(dir) * magnitude;
                this.y = Math.sin(dir) * magnitude;
        }
        setDirection(dir) {
                const magnitude = this.getMagnitude();
                this.x = Math.cos(dir) * magnitude;
                this.y = Math.sin(dir) * magnitude;
        }
        addVector(v) {
                this.x += v.x;
                this.y += v.y;
        }
        substractVector(v) {
                this.x -= v.x;
                this.y -= v.y;
        }
        multiplyBy(amount) {
                this.x *= amount;
                this.y *= amount;
        }
        normalize() {
                const magnitude = this.getMagnitude();
                if (magnitude === 0) return;
                this.x /= magnitude;
                this.y /= magnitude;
        }
        clone() { return new Vector2(this.x, this.y); }
}

Vector2.Up = new Vector2(0, 1);
Vector2.Right = new Vector2(1, 0);
Vector2.Zero = new Vector2(0, 0);
Vector2.add = (v1, v2) => new Vector2(v1.x + v2.x, v1.y + v2.y);
Vector2.sub = (v1, v2) => new Vector2(v1.x - v2.x, v1.y - v2.y);
Vector2.mul = (v, amount) => new Vector2(v.x * amount, v.y * amount);
Vector2.dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;
Vector2.norm = (v) => { 
        let v2 = new Vector2(v.x, v.y);
        const magnitude = v2.getMagnitude();
        if (magnitude === 0) return v2;
        v2.x /= magnitude;
        v2.y /= magnitude;
        return v2;
}
