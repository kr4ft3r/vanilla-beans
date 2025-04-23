/**
 * Simple story-telling tool, depends on Typewriter class to display text.
 * Contains interface for managing the text container window, sequences of texts or branching narratives, 
 * with optional callbacks.
 */
class StoryWindow {
        /**
         * @typedef {Object} StoryWindow~Settings
         * @property {number} inputDelay Float time in seconds before next input is accepted, to prevent accidental skipping of text, default 0.5
         * @property {number} popInInputDelay Same as inputDelay but used to delay input when window first appears, you may want this higher than inputDelay, default 1.0
         * @property {boolean} handleSkipEvent Whether to create event and listener for storyWindowSkipRequest, default true
         * @property {boolean} handleSkipEventOnlyIfActive Whether the storyWindowSkipRequest should be ignored if another story window is active, default true
         * @property {boolean} skipAlsoCloses Whether storyWindowSkipRequest event will also call popOut if no more text to print, otherwise you have to implement closing yourself, default true
         * @property {?RegExp} optionQuickPattern If you provide a simple string instead of a StoryOption object, this pattern will be used for matching goto label and text. Default is pattern for format `label|option text` - if not used, set to null to avoid accidental matching
         * @property {string} optionsHeader HTML to insert before option list, usually contains opening tag, default `<ul>`
         * @property {string} optionsFooter HTML to insert after option list, usually contains closing tag, default `</ul>`
         * @property {function} optionTemplateCallback Callback that returns HTML which represents an option, default a li element
         * @property {?function} customOptionsDrawCallback Optionally provide your own procedure to draw options
         * @property {boolean} selectedOptionWaitForAnimationDoneEvent Default false, otherwise you will have to listen to the `storyWindowOptionSelected` (param is the selected StoryOption) event to start your option selection animation and dispatch the `storyWindowSelectedOptionAnimDone` when done to activate the option (along with the selected StoryOption object as data)
         */

        /**
         * Optional object that may be sent to a sequence instead of a string.
         * @typedef {Object} StoryWindow~StorySegment
         * @property {string|function} text Text to display during this segment, or a function that returns it
         * @property {function} [action] Action to run before text is printed
         * @property {string} [label] Reference to this segment, may be used by StoryOption's or StorySegment's goto
         * @property {string|function} [goto] Label of the next segment, otherwise it will be next one in the sequence
         * @property {function} [condition] Function that returns false if this segment should be skipped
         * @property {Array<string|StoryWindow~StoryOption>} [options] If segment contains player's choice set them here, either as strings that match optionQuickPattern or as StoryOption objects
         */

        /**
         * @typedef {Object} StoryWindow~StoryOption
         * @property {string|function} text
         * @property {function} [action] Callback to run before text gets printed
         * @property {string|function} [goto] Label of segment this option will lead to, if missing the sequence will simply continue
         * @property {function} [condition] Function that returns true if option should be on the list or false otherwise
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
                /** @type {?StoryWindow~StorySegment} */
                this.currentSegment = null;
                this.currentOptions = [];
                this._optionsAreSelectable = true;
                this._waitingForPrompt = false;
                this._inputDelayCounter = 0.0;
                this._segmentTable = new HashTable(); // For branching
                this._segmentTree = null;
                if (this.settings.handleSkipEvent && Events !== undefined && Events.instance !== undefined) {
                        Events.instance.createEventOnce('storyWindowSkipRequested');
                        Events.instance.registerEventListener(this, 'storyWindowSkipRequested');
                } else if (this.settings.handleSkipEvent) {
                        console.warn("StoryWindow is configured to listen to skip requested events but event system not initialized");
                }
                if (!this.settings.selectedOptionWaitForAnimationDoneEvent && Events !== undefined && Events.instance !== undefined) {
                        Events.instance.createEventOnce('storyWindowOptionSelected');
                        Events.instance.createEventOnce('storyWindowSelectedOptionAnimDone');
                        Events.instance.registerEventListener(this, 'storyWindowSelectedOptionAnimDone');
                } else if (!this.settings.selectedOptionWaitForAnimationDoneEvent) {
                        console.warn("StoryWindow is configured to wait for animation done event when selection option, but event system not initialized");
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
         * @param {string|function} text 
         */
        write(text) {
                StoryWindow.activeWindow = this;
                const textStr = typeof text === 'function' ? text() : text;
                if (typeof textStr !== 'string') {
                        console.warn('Text provided to segment was not string');
                }
                this.typewriter.write(textStr);
        }
        /**
         * Start writing multi-segment story sequence. Will suffice when branching narrative is not required, 
         * otherwise use `loadTree`.
         * 
         * @param {string[]|StoryWindow~StorySegment[]} sequence Array of strings or story segment objects
         */
        writeSequence(sequence) {
                this.sequence = sequence;
                this.writeNextSegment();
        }
        /**
         * Use for branching narrative. Creates a table of segment labels and immediately starts writing.
         * 
         * @param {Array<string|StoryWindow~StorySegment>} tree 
         */
        loadTree(tree) {
                this._segmentTree = [];
                this._segmentTable = new HashTable();
                for(let i = 0; i < tree.length; i++) {
                        let segment = tree[i];
                        if (typeof segment === 'string') {
                                segment = {text: segment};
                        }
                        segment.sequenceIndex = i;
                        this._segmentTree[i] = segment;
                        if (segment.label) this._segmentTable.set(segment.label, segment);
                }
                this.writeSequence(tree);
        }
        /**
         * Starts typing next segment of a sequence, will be called if dispatching `storyWindowSkipRequested`.
         * 
         * @param {?string|?function} [goto] Label of segment that will be the next one
         */
        writeNextSegment(goto = null) {
                if (goto !== null && typeof goto === 'function') goto = goto();
                /** @type {StoryWindow~StorySegment} */
                let segment;
                
                if (goto === null && this.currentSegment && this.currentSegment.goto) {
                        goto = typeof this.currentSegment.goto === 'function' ? this.currentSegment.goto() : this.currentSegment.goto;
                }
                if (goto !== null) {
                        segment = this._segmentTable.get(goto);
                        if (!segment) { // Label not found, leave
                                this.popOut();
                                return;
                        }
                        if (this._segmentTree.length > (segment.sequenceIndex+1)) {
                                this.sequence = this._segmentTree.slice(segment.sequenceIndex+1);
                        }
                } else {
                        if (this.sequence.length == 0) {
                                this.popOut();
                                return;
                        }
                        segment = this.sequence.shift();
                }
                this.currentSegment = segment;
                if (this.currentSegment.condition && !this.currentSegment.condition()) {
                        this.writeNextSegment();
                        return;
                }
                if (segment.action) segment.action();
                if (segment.text) this.write(segment.text)
                else if (typeof(segment) === 'string') this.write(segment);
        }
        /**
         * Must be called each frame.
         * 
         * @param {Number} deltaTime Float, seconds since last frame
         */
        update(deltaTime) {
                const stateCode = this.typewriter.update(deltaTime);
                if (stateCode === -1) this._checkForOptions();

                if (this.isDelayActive()) {
                        this._inputDelayCounter -= deltaTime;
                        if (this._inputDelayCounter <= 0.0) this._inputDelayCounter = 0.0;
                }
        }
        /**
         * Skip the text typing anim and display options if there are any in current segment
         */
        skip() {
                this.typewriter.skip();
                this._checkForOptions();
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
        activateSelectedOption(selected) {
                if (selected.action) selected.action();
                this._waitingForPrompt = false;
                this.writeNextSegment(selected.goto ?? null);
        }
        onStoryWindowSkipRequested() {
                if (this.settings.handleSkipEventOnlyIfActive && StoryWindow.activeWindow != this) return;
                if (this._inputDelayCounter > 0.0) return;
                if (this._waitingForPrompt) return;
                this._inputDelayCounter = this.settings.inputDelay;
                if (this.typewriter.running)
                        this.skip();
                else if (this.sequence.length > 0 || (this.currentSegment && this.currentSegment.goto))
                        this.writeNextSegment();
                else if (this.settings.skipAlsoCloses && this.visible)
                        this.popOut();
        }
        onStoryWindowSelectedOptionAnimDone(selectedOption) {
                this.activateSelectedOption(selectedOption);
        }
        _checkForOptions() {
                if (!this.currentSegment || !this.currentSegment.options) return; // Nothing to do
                this.currentOptions = [];
                
                if (!this.currentSegment.options) {
                        console.warn('Request for StoryWindow to draw options is made when there are none');
                        return;
                }
                /** @type {Element} */
                const optionsContainer = this.typewriter.textElem;
                const options = this.currentSegment.options
                .filter(opt => !opt.condition || (opt.condition && opt.condition()))
                .map((opt) => {
                        if (typeof opt === 'string') {
                                // Looks like quick option string, attempt to parse
                                opt = this._parseQuickOption(opt);
                        }

                        return opt;
                });
                this.currentOptions = options;

                // Is the user doing their fancy stuff instead?
                if (this.settings.customOptionsDrawCallback) {
                        this.settings.customOptionsDrawCallback(this.currentSegment);
                        return;
                }
                // Otherwise, do the built-in options draw procedure

                const optionsHtml = options.map(
                        (opt, index) => this.settings.optionTemplateCallback(
                                index, 
                                typeof opt.text === 'function' ? opt.text() : opt.text, 
                                opt
                        )
                ).join('');

                optionsContainer.innerHTML += `
                ${this.settings.optionsHeader}
                ${optionsHtml}
                ${this.settings.optionsFooter}
                `;

                this._optionsAreSelectable = true;
                this._waitingForPrompt = true;
        }
        _parseQuickOption(opt) {
                const optParts = this.settings.optionQuickPattern ? opt.match(this.settings.optionQuickPattern) : [null, null, text];
                if (optParts.length < 3) {
                        console.warn('Failed parsing quick option pattern at index '+index);
                        opt = {text: optParts[1] ?? '-UNKNOWN-'}
                }

                return {text: optParts[2], goto: optParts[1]}
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
        optionQuickPattern: /^(.*?)\|([\s\S]*)$/,
        optionsHeader: "<ul style='list-style:none;'>",
        optionsFooter: "</ul>",
        optionTemplateCallback: (index, text, option) => `<li onclick="StoryWindow.selectOption(${index});" style="cursor:pointer;">${index} - ${text}</li>`,
        customOptionsDrawCallback: null,
        selectedOptionWaitForAnimationDoneEvent: false,
}
StoryWindow.selectOption = (optionIndex) => {
        if (!StoryWindow.activeWindow._optionsAreSelectable) return;
        StoryWindow.activeWindow._optionsAreSelectable = false;
        const selected = StoryWindow.activeWindow.currentOptions[optionIndex];
        if (!StoryWindow.activeWindow.settings.selectedOptionWaitForAnimationDoneEvent) {
                StoryWindow.activeWindow.activateSelectedOption(selected);

                return;
        }

        if (Events !== undefined && Events.instance !== undefined) {
                Events.instance.dispatch('storyWindowOptionSelected', selected);
        }
        
}