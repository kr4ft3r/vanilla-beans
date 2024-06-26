/**
 * DOM-based sprite implementation. See demo for usage.
 * TODO proper transform object?
 * 
 * Usage (single sprite):
 * - Create new Sprite object, providing unique ID string, SpriteDefinition instance,
 * and transform object with properties position{x,y}, and optional properties: 
 * scale{width,height}, rotation, positionUnit, rotationUnit (units are CSS units of position/roation).
 * Defaults are `px` and `rad`.
 * - Add to container: Sprite.addToContainer(container, sprite) where container is a
 * DOM object with relative position. This will draw the sprite on the screen.
 * - When sprite's transform is updated: sprite.update() to redraw
 * - To remove: Sprite.removeFromContainer(sprite)
 * - If doing collision checks: sprite.getBoundingBox() to get object with {x1,y1,x2,y2}
 */
class Sprite {
        constructor(id, spriteDefinition, transform) {
                this.id = id;
                this.definition = spriteDefinition;
                this.transform = transform;
                if (!('rotation' in transform)) this.transform.rotation = 0;
                if (!('positionUnit' in transform)) this.transform.positionUnit = 'px';
                if (!('rotationUnit' in transform)) this.transform.rotationUnit = 'rad';
                this.container = null;
                this.domElement = null;
                this.sheetPosition = {x: 0, y: 0};
                Sprite.idMap.set(id, this);
        }
        /**
         * Override for non-standard bounding box sizes.
         * @returns object with bounding box's top-left and bottom-right points
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
Sprite.removeFromContainer = function (sprite) {
        if (sprite.container === null) return;
        let spriteElem = sprite.domElement; //document.getElementById("sprite_" + sprite.definition.id + "_" + sprite.id);
        if (spriteElem === null) return;
        spriteElem.remove();
        sprite.domElement = null;
}
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
SpriteDefinition.table = new HashTable();