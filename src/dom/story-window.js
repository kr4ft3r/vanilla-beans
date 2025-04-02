class StoryWindow {
        constructor(windowElem, textElem, popInCallback, popOutCallback) {
                this.windowElem = windowElem;
                this.typewriter = new Typewriter(textElem);
                this.popInCallback = popInCallback;
                this.popOutCallback = popOutCallback;
                this.visible = false;
        }
        
        popIn(data) {
                this.visible = true;
                if (this.popInCallback !== null) this.popInCallback(data, this);
        }
        
        popOut(data) {
                this.visible = false;
                if (this.popOutCallback !== null) this.popOutCallback(data, this);
        }
        
        write(text) {
                this.typewriter.write(text);
        }
        
        update(deltaTime) {
                this.typewriter.update(deltaTime);
        }
        
        skip() {
                this.typewriter.skip();
        }
}
