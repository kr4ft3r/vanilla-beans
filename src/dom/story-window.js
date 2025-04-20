/**
 * Simple story-telling tool, depends on Typewriter class to display text.
 * Contains interface for managing the text container window and sending a sequence of texts with optional callbacks.
 */
class StoryWindow {
        /**
         * @typedef {Object} StoryWindow~Settings
         * @property {number} inputDelay Float time in seconds before next input is accepted, to prevent accidental skipping of text, default 0.5
         * @property {number} popInInputDelay Same as inputDelay but used to delay input when window first appears, you may want this higher than inputDelay, default 1.0
         * @property {boolean} handleSkipEvent Whether to create event and listener for storyWindowSkipRequest, default true
         * @property {boolean} handleSkipEventOnlyIfActive Whether the storyWindowSkipRequest should be ignored if another story window is active, default true
         * @property {boolean} skipAlsoCloses Whether storyWindowSkipRequest event will also call popOut if no more text to print, otherwise you have to implement closing yourself, default true
         */

        /**
         * Optional object that may be sent to a sequence instead of a string.
         * @typedef {Object} StoryWindow~StorySegment
         * @property {string} text
         * @property {function} [action] Action to run before text is printed
         */

        /**
         * 
         * @param {Element} windowElem 
         * @param {Element} textElem 
         * @param {function} popInCallback 
         * @param {function} popOutCallback 
         * @param {StoryWindow~Settings} settings 
         */
        constructor(windowElem, textElem, popInCallback, popOutCallback, settings) {
                this.windowElem = windowElem;
                this.typewriter = new Typewriter(textElem);
                this.popInCallback = popInCallback;
                this.popOutCallback = popOutCallback;
                this.visible = false;
                this.settings = {...StoryWindow.defaultSettings, ...settings}
                this.sequence = [];
                this._inputDelayCounter = 0.0;
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
                this._inputDelayCounter = this.settings.popInInputDelay;
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
         * @param {string[]|StoryWindow~StorySegment[]} sequence Array of strings or story segment objects
         */
        writeSequence(sequence) {
                this.sequence = sequence;
                this.writeNextSegment();
        }
        /**
         * Starts typing next segment of a sequence, will be called if dispatching `storyWindowSkipRequested`.
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
                if (this.isDelayActive()) {
                        this._inputDelayCounter -= deltaTime;
                        if (this._inputDelayCounter <= 0.0) this._inputDelayCounter = 0.0;
                }
        }
        /**
         * Wrapper for `typewriter.skip()`.
         */
        skip() {
                this.typewriter.skip();
        }
        /**
         * @returns {boolean} Whether the input delay timer is on, which would mean input events are still being blocked.
         */
        isDelayActive() {
                return this._inputDelayCounter > 0.0;
        }
        /**
         * @returns {number} Proportion (0...1.0) of input delay timer progress. If delay is not active returns 1.0.
         */
        getDelayTimerProgress() {
                if (this._inputDelayCounter == 0.0) return 1.0;
                return this._inputDelayCounter / this.settings.inputDelay;
        }
        onStoryWindowSkipRequested() {
                if (this.settings.handleSkipEventOnlyIfActive && StoryWindow.activeWindow != this) return;
                if (this._inputDelayCounter > 0.0) return;
                this._inputDelayCounter = this.settings.inputDelay;
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
/** @type {StoryWindow~Settings} */
StoryWindow.defaultSettings = {
        inputDelay: 0.5,
        popInInputDelay: 1.0,
        handleSkipEvent: true,
        handleSkipEventOnlyIfActive: true,
        skipAlsoCloses: true,
}