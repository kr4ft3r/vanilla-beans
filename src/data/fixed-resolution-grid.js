/**
 * Simple collision-checking grid with evenly distributed number of equal cells.
 */
class FixedResolutionGrid {
        constructor(cellSize, gridWidth, gridHeight, pointCollisionTest) {
                this.cellSize = cellSize;
                this.width = gridWidth;
                this.height = gridHeight;
                this.pointCollisionTest = pointCollisionTest;
                this.cells = (new Array(gridHeight))
                        .fill(
                                (new Array(gridWidth)).fill([], 0, gridWidth), 
                                0, gridWidth);
        }
        _getCoordsAtPoint(x, y) {
                return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
        }
        _getCell(boundingBox) {
                const [x, y] = this._getCoordsAtPoint(
                        boundingBox.x1 + ((boundingBox.x2 - boundingBox.x1) * 0.5),
                        boundingBox.y1 + ((boundingBox.y2 - boundingBox.y1) * 0.5),
                );
                return this.cells[y][x];
        }
        insert(value, boundingBox) {
                this._getCell(boundingBox).push(value);
        }
        remove(value, boundingBox) {
                let cell = this._getCell(boundingBox);
                for (let i = 0; i < cell.length; i++) {
                        if (value === cell[i]) {
                                cell.splice(i, 1);
                                break;
                        }
                }
        }
        update(value, boundingBox, movement) {
                if (movement.x === 0.0 && movement.y === 0.0) return; // No change
                
                const [prevX, prevY] = this._getCoordsAtPoint(
                        boundingBox.x1 + ((boundingBox.x2 - boundingBox.x1) * 0.5),
                        boundingBox.y1 + ((boundingBox.y2 - boundingBox.y1) * 0.5),
                );
                //console.log("? "+prevX+"|"+prevY);
                const [x, y] = this._getCoordsAtPoint(
                        movement.x + boundingBox.x1 + ((boundingBox.x2 - boundingBox.x1) * 0.5),
                        movement.y + boundingBox.y1 + ((boundingBox.y2 - boundingBox.y1) * 0.5),
                );
                if (prevX === x && prevY === y) return; // No change
                // Remove from previous cell
                let prevCell = this.cells[prevY][prevX];
                for (let i = 0; i < prevCell.length; i++) {
                        if (value === prevCell[i]) prevCell.splice(i, 1);
                }
                // Insert to new cell
                if (y >= 0 && y < this.height && x >= 0 && x < this.width)
                        this.cells[y][x].push(value);
                //console.log(x+"|"+y);
        }
        getAtPoint(point) {
                const [x, y] = this._getCoordsAtPoint(point.x, point.y);
                console.log(x+"|"+y+" CHECKING");
                const cell = this.cells[y][x];
                let hits = [];
                for(let i = 0; i < cell.length; i++) {
                        if(this.pointCollisionTest(cell[i], point)) hits.push(cell[i]);
                }
                
                return hits;
        }
}