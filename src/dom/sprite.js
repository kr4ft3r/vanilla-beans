/**
 * DOM-based sprite implementation. See demo for usage.
 * 
 * Usage (single sprite):
 * - Create new Sprite object, providing unique ID string, SpriteDefinition instance,
 * and transform object with properties position{x,y}, and optional properties: 
 * scale{x,y}, rotation, positionUnit, rotationUnit (units are CSS units of position/roation).
 * Defaults are `px` and `rad`.
 * - Add to container: Sprite.addToContainer(container, sprite) where container is a
 * DOM object with relative position. This will draw the sprite on the screen.
 * - When sprite's transform is updated: sprite.update() to redraw
 * - To remove: Sprite.removeFromContainer(sprite)
 * - If doing collision checks: sprite.getBoundingBox() to get object with {x1,y1,x2,y2}
 */
class Sprite {
        
        /**
         * Representation of sprite's location, size, and rotation.
         * Changes to this object will be visible only after call to the sprite's `update()`.
         * @typedef {Object} Sprite~Transform
         * @property {{x:Number, y:Number}} position Location of pivot relative to its container 
         * @property {{x:Number, y:Number}} [scale] Size scaling factor
         * @property {Number} [rotation] Rotation relative to +x
         * @property {string} [positionUnit] CSS unit to work with for position, only `px` is tested so far and is default
         * @property {string} [rotationUnit] CSS unit to work with for rotations, such as `rad` or `deg`, default `rad`
         */
        
        /**
         * @typedef {Object} BoundingBoxPoints
         * @property {Number} x1 Top-left point X position
         * @property {Number} y1 Top-left point Y position
         * @property {Number} x2 Bottom-right point X position
         * @property {Number} y2 Bottom-right point Y position
         */
        
        /**
         * @param {string} id 
         * @param {SpriteDefinition} spriteDefinition 
         * @param {Transform} transform 
         */
        constructor(id, spriteDefinition, transform) {
                this.id = id;
                this.definition = spriteDefinition;
                this.transform = transform;
                if (!('scale' in transform)) this.transform.scale = {x: 1.0, y: 1.0};
                if (!('rotation' in transform)) this.transform.rotation = 0;
                if (!('positionUnit' in transform)) this.transform.positionUnit = 'px';
                if (!('rotationUnit' in transform)) this.transform.rotationUnit = 'rad';
                this.container = null;
                this.domElement = null;
                this.sheetPosition = {x: 0, y: 0};
                Sprite.idMap.set(id, this);
        }
        /**
         * Get bounding box with scaling applied. Override for non-standard bounding box sizes.
         * @returns {BoundingBoxPoints} Bounding box's points relative to the sprite's container
         */
        getBoundingBox() {
                return {
                        x1: this.transform.position.x, y1: this.transform.position.y,
                        x2: this.transform.position.x + (this.definition.width * this.transform.scale.x),
                        y2: this.transform.position.y + (this.definition.height * this.transform.scale.y)
                }
        }
        toHtml() {
                return `
                <div id="sprite_${this.definition.id}_${this.id}" class="vb__sprite"
                style="background-image:url(${this.definition.imagePath});width:${Math.round(this.getWidth())}px;height:${Math.round(this.getHeight())}px;
                background-size: ${Math.round(this.getWidth())}px ${Math.round(this.getHeight())}px;
                transform: translate(${this.transform.position.x}${this.transform.positionUnit}, ${this.transform.position.y}${this.transform.positionUnit}) rotate(${this.transform.rotation}${this.transform.rotationUnit})"
                ></div>
                `;
        }
        /**
         * Must be called after making any changes on the sprite to re-render it.
         */
        update() {
                if (this.domElement === null) return;
                this.domElement = document.getElementById('sprite_'+this.definition.id+"_"+this.id);
                let elem = this.domElement;
                elem.style.width = this.getWidth() + 'px';
                elem.style.height = this.getHeight() + 'px';
                elem.style.backgroundSize = `${this.getWidth()*this.definition.sheet.width}px ${this.getHeight()*this.definition.sheet.height}px`;
                if (this.definition.sheet.width > 1 || this.definition.sheet.height > 1) {
                        const sheetPos = this.getSheetPosition();
                        elem.style.backgroundPosition = `${sheetPos.x*-1}px ${sheetPos.y*-1}px`;
                }
                elem.style.transform = 'translate('+this.transform.position.x + this.transform.positionUnit + ', '+this.transform.position.y + this.transform.positionUnit + ') rotate('+(this.transform.rotation)+this.transform.rotationUnit+')';
        }
        /**
         * @returns {number} Calculated non-rounded width
         */
        getWidth() { return this.definition.width*this.transform.scale.x; }
        /**
         * @returns {number} Calculated non-rounded height
         */
        getHeight() { return this.definition.height*this.transform.scale.y; }
        /**
         * @returns {Object} Calculated x and y in pixels on sprite sheet image, not inversed
         */
        getSheetPosition() { 
                return {
                        x: this.getWidth()*this.sheetPosition.x, 
                        y: this.getHeight()*this.sheetPosition.y
                }; 
        }
}
/**
 * Must be called to make sprite visible. Currently there can be only one container per sprite.
 * @param {Element} containerElem DOM Element that will be container for this sprite
 * @param {Sprite} sprite 
 */
Sprite.addToContainer = function (containerElem, sprite) {
        if (sprite.container !== null) Sprite.removeFromContainer(sprite);
        containerElem.innerHTML += sprite.toHtml();
        sprite.container = containerElem;
        let cs = containerElem.querySelectorAll(":scope > .vb__sprite");//containerElem.children;
        for (let i = 0; i < cs.length; i++) {
                let id = cs[i].id.split("_")[2];
                let spr = Sprite.idMap.get(id);
                spr.domElement = cs[i];
        }
}
/**
 * Immediately removes the sprite from the containing DOM Element.
 * @param {Sprite} sprite 
 */
Sprite.removeFromContainer = function (sprite) {
        if (sprite.container === null) return;
        let spriteElem = sprite.domElement; //document.getElementById("sprite_" + sprite.definition.id + "_" + sprite.id);
        if (spriteElem === null) return;
        spriteElem.remove();
        sprite.domElement = null;
}
/**
 * Populated with sprites mapped by ID
 * @type {HashTable}
 */
Sprite.idMap = new HashTable();

/**
 * Basic sprite data used for creating sprites. Instances are meant to be cached.
 */
class SpriteDefinition {
        /**
         * 
         * @param {string} id Unique ID, cannot start with number
         * @param {string} imagePath Sprite or spritesheet file path
         * @param {number} widthPx Default width
         * @param {number} heightPx Default height
         * @param {Object} sheet {width,height} If image is spritesheet, width is columns, height is rows
         */
        constructor(id, imagePath, widthPx, heightPx, sheet = null) {
                this.id = id;
                this.imagePath = imagePath;
                this.width = widthPx;
                this.height = heightPx;
                if (sheet === null) sheet = {width: 1, height: 1}
                this.sheet = sheet;
                
                SpriteDefinition.table.set(id, this);
        }
}
/**
 * Populated with sprite definitions mapped by ID 
 * @type {HashTable} 
 * */
SpriteDefinition.table = new HashTable();