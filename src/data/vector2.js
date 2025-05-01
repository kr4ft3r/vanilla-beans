/**
 * 2D vector as an object instance and static 2D vector math functions.
 * If working with DOM, remember that +y is downwards direction, the constant representation of which 
 * is labeled `up` here.
 */
class Vector2 {
        /**
         * @param {Number} [x] 
         * @param {Number} [y] 
         */
        constructor(x = 0.0, y = 0.0) {
                this.x = x;
                this.y = y;
        }
        /** @returns {Number} */
        getMagnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
        /** @returns {Number} Angle in radians to +X axis */
        getDirection() { return Math.atan2(this.y, this.x); }
        /** @param {Number} magnitude */
        setMagnitude(magnitude) {
                const dir = this.getDirection();
                this.x = Math.cos(dir) * magnitude;
                this.y = Math.sin(dir) * magnitude;
        }
        /** @param {Number} dir Desired angle in radians to +X axis */
        setDirection(dir) {
                const magnitude = this.getMagnitude();
                this.x = Math.cos(dir) * magnitude;
                this.y = Math.sin(dir) * magnitude;
        }
        /** @param {Vector2} v Vector to add */
        addVector(v) {
                this.x += v.x;
                this.y += v.y;
        }
        /** @param {Vector2} v Vector to subtract */
        subtractVector(v) {
                this.x -= v.x;
                this.y -= v.y;
        }
        /** @param {Number} amount */
        multiplyBy(amount) {
                this.x *= amount;
                this.y *= amount;
        }
        /** Normalize vector. */
        normalize() {
                const magnitude = this.getMagnitude();
                if (magnitude === 0) return;
                this.x /= magnitude;
                this.y /= magnitude;
        }
        /** @returns {Vector2} New, cloned instance of this vector */
        clone() { return new Vector2(this.x, this.y); }
}

/** Static instance of +y vector */
Vector2.Up = new Vector2(0, 1);
/** Static instance of +x vector */
Vector2.Right = new Vector2(1, 0);
/** Static instance of vector with magnitude zero */
Vector2.Zero = new Vector2(0, 0);
/**
 * @param {Vector2} v1 
 * @param {Vector2} v2 
 * @returns {Vector2}
 */
Vector2.add = (v1, v2) => new Vector2(v1.x + v2.x, v1.y + v2.y);
/**
 * @param {Vector2} v1 
 * @param {Vector2} v2 
 * @returns {Vector2}
 */
Vector2.sub = (v1, v2) => new Vector2(v1.x - v2.x, v1.y - v2.y);
/**
 * @param {Vector2} v1 
 * @param {Number} v2 
 * @returns {Vector2}
 */
Vector2.mul = (v, amount) => new Vector2(v.x * amount, v.y * amount);
/**
 * @param {Vector2} v1 
 * @param {Vector2} v2 
 * @returns {Number}
 */
Vector2.dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;
/**
 * Returns a new instance that is the given vector normalized.
 * @param {Vector2} v1 
 * @returns {Vector2}
 */
Vector2.norm = (v) => { 
        let v2 = new Vector2(v.x, v.y);
        const magnitude = v2.getMagnitude();
        if (magnitude === 0) return v2;
        v2.x /= magnitude;
        v2.y /= magnitude;
        return v2;
}
