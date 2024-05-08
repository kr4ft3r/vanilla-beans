/**
 * DOM-based sprite implementation. See demo for usage.
 * TODO rotation, proper transform object, sprite sheet animation... Many features missing.
 * 
 * Usage (single sprite):
 * - Create new Sprite object, providing unique ID string, SpriteDefinition instance,
 * and transform object with properties position{x,y} and scale{width,height}.
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
                this.container = null;
                this.domElement = null;
                if (Sprite.idMap === null) Sprite.idMap = new HashTable();
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
                style="background-image:url(${this.definition.imagePath});width:${Math.round(this.definition.width*this.transform.scale.x)}px;height:${Math.round(this.definition.height*this.transform.scale.y)}px;
                background-size: ${Math.round(this.definition.width*this.transform.scale.x)}px ${Math.round(this.definition.height*this.transform.scale.y)}px;
                transform: translate(${this.transform.position.x}px, ${this.transform.position.y}px)"
                ></div>
                `;
        }
        update() {
                if (this.domElement === null) return;
                this.domElement = document.getElementById('sprite_'+this.definition.id+"_"+this.id);
                let elem = this.domElement;
                elem.style.width = Math.round(this.definition.width*this.transform.scale.x) + 'px';
                elem.style.height = Math.round(this.definition.height*this.transform.scale.y) + 'px';
                elem.style.backgroundSize = `${Math.round(this.definition.width*this.transform.scale.x)}px ${Math.round(this.definition.height*this.transform.scale.y)}px`;
                elem.style.transform = 'translate('+this.transform.position.x + 'px, '+this.transform.position.y + 'px)';
        }
        /**
         * @returns {number} Calculated non-rounded width
         */
        getWidth() { return this.definition.width*this.transform.scale.x; }
        /**
         * @returns {number} Calculated non-rounded height
         */
        getHeight() { return this.definition.height*this.transform.scale.y; }
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
Sprite.idMap = null;//new HashTable();

/**
 * Basic sprite data used for creating sprites. Instances are meant to be cached.
 */
class SpriteDefinition {
        constructor(id, imagePath, widthPx, heightPx) {
                this.id = id;
                this.imagePath = imagePath;
                this.width = widthPx;
                this.height = heightPx;
                
                SpriteDefinition.table.set(id, this);
        }
}
SpriteDefinition.table = new HashTable();