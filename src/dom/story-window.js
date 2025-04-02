class StoryWindow {
        /**
         * 
         * @param {Element} windowElem 
         * @param {Element} textElem 
         * @param {function} popInCallback 
         * @param {function} popOutCallback 
         * @param {object} settings 
         */
        constructor(windowElem, textElem, popInCallback, popOutCallback, settings) {
                this.windowElem = windowElem;
                this.typewriter = new Typewriter(textElem);
                this.popInCallback = popInCallback;
                this.popOutCallback = popOutCallback;
                this.visible = false;
                this.settings = {...StoryWindow.defaultSettings, ...settings}
                this.sequence = [];
                if (this.settings.handleSkipEvent && Events !== undefined && Events.instance !== undefined) {
                        Events.instance.createEventOnce('storyWindowSkipRequested');
                        Events.instance.registerEventListener(this, 'storyWindowSkipRequested');
                } else if (this.settings.handleSkipEvent) {
                        console.warn("Handling of events for StoryWindow requested but event system not initialized");
                }
        }
        
        popIn(data) {
                this.visible = true;
                StoryWindow.activeWindow = this;
                if (this.popInCallback !== null) this.popInCallback(data, this);
        }
        
        popOut(data) {
                this.visible = false;
                if (this.popOutCallback !== null) this.popOutCallback(data, this);
        }
        
        write(text) {
                StoryWindow.activeWindow = this;
                this.typewriter.write(text);
        }
        
        /**
         * 
         * @param {Array} sequence Array of objects containing `text` (string) and optional `action` (callback) that will be called before requesting write
         */
        writeSequence(sequence) {
                this.sequence = sequence;
                this.writeNextSegment();
        }
        
        writeNextSegment() {
                if (this.sequence.length == 0) return;
                let segment = this.sequence.shift();
                if (segment.action) segment.action();
                if (segment.text) this.write(segment.text)
                else if (typeof(segment) === 'string') this.write(segment)
        }
        
        update(deltaTime) {
                this.typewriter.update(deltaTime);
        }
        
        skip() {
                this.typewriter.skip();
        }
        
        onStoryWindowSkipRequested() {
                if (this.settings.handleSkipEventOnlyIfActive && StoryWindow.activeWindow != this) return;
                if (this.typewriter.running)
                        this.skip();
                else if (this.sequence.length > 0)
                        this.writeNextSegment();
                else if (this.settings.skipAlsoCloses && this.visible)
                        this.popOut();
        }
}
/** @type {?StoryWindow} */
StoryWindow.activeWindow = null;
StoryWindow.defaultSettings = {
        handleSkipEvent: true,
        handleSkipEventOnlyIfActive: true,
        skipAlsoCloses: true,
}