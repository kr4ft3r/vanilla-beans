class Sprite {
        constructor(id, spriteDefinition, transform) {
                this.id = id;
                this.definition = spriteDefinition;
                this.transform = transform;
                this.container = null;
        }
        
        toHtml() {
                return `
                <div id="sprite_${this.definition.id}_${this.id}" class="vb__sprite"
                style="background-image:url(${this.definition.imagePath});width:${Math.round(this.definition.width*this.transform.scale.x)}px;height:${Math.round(this.definition.height*this.transform.scale.y)}px;
                transform: translate(${this.transform.position.x}px, ${this.transform.position.y}px)"
                ></div>
                `;
        }
        
        update(elem) { //TODO static update all instead, with cached dom element
                elem.style.width = Math.round(this.definition.width*this.transform.scale.x) + 'px';
                elem.style.height = Math.round(this.definition.height*this.transform.scale.y) + 'px';
                elem.style.transform = 'translate('+this.transform.position.x + 'px, '+this.transform.position.y + 'px)';
        }
}
Sprite.addToContainer = function (containerElem, sprite) {
        if (sprite.container !== null) Sprite.removeFromContainer(sprite);
        containerElem.innerHTML += sprite.toHtml();
}
Sprite.removeFromContainer = function (sprite) {
        if (sprite.container === null) return;
        let spriteElem = document.getElementById("sprite_" + sprite.definition.id + "_" + sprite.id);
        if (spriteElem === null) return;
        spriteElem.remove();
}

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