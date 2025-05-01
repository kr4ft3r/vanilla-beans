class Collision {}
/**
 * Simple case of checking two boxes without rotation applied for overlap.
 * 
 * @param {Object} b1 {x1, y1, x2, y2}
 * @param {Object} b2 {x1, y1, x2, y2}
 * @returns {bool}
 */
Collision.simpleBoxesOverlap = (b1, b2) => b1.x1 < b2.x2 && b2.x1 < b1.x2 && b1.y1 < b2.y2 && b2.y1 < b1.y2;
