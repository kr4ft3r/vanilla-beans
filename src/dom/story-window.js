/**
 * Simple story-telling tool, depends on Typewriter class to display text.
 * Contains interface for managing the text container window and sending a sequence of texts with optional callbacks.
 */
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
        /**
         * Make story window visible, using procedure defined in `popInCallback`.
         * The method will also first mark the window visible and set it as active.
         * 
         * @param {*} data Arbitrary data to be sent to the callback
         */
        popIn(data) {
                this.visible = true;
                StoryWindow.activeWindow = this;
                if (this.popInCallback !== null) this.popInCallback(data, this);
        }
        /**
         * Close story window, using procedure defined in `popOutCallback`.
         * The method will also first mark the window no longer visible.
         * @param {*} data Arbitrary data to be sent to the callback
         */
        popOut(data) {
                this.visible = false;
                if (this.popOutCallback !== null) this.popOutCallback(data, this);
        }
        /**
         * Set this window to be active one and start typing given text.
         * 
         * @param {string} text 
         */
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
        /**
         * Starts typing next segment of a sequence, will be called if dispatching `storyWindowSkippedRequested`.
         */
        writeNextSegment() {
                if (this.sequence.length == 0) return;
                let segment = this.sequence.shift();
                if (segment.action) segment.action();
                if (segment.text) this.write(segment.text)
                else if (typeof(segment) === 'string') this.write(segment)
        }
        /**
         * Must be called each frame.
         * 
         * @param {Number} deltaTime Float, seconds since last frame
         */
        update(deltaTime) {
                this.typewriter.update(deltaTime);
        }
        /**
         * Wrapper for `typewriter.skip()`.
         */
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