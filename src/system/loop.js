/**
 * Loop is used to run callbacks that make things happen each frame in the game.
 * You can think of it as the dimension of time in your game's universe.
 * It is really a helper built around the `requestAnimationFrame` method of the Web API, providing more advanced
 * management such as a queue of callbacks, pausing, delta time and other time values.
 * 
 * Only one Loop object can be active at any moment.
 * 
 * ### Pause management
 * If Vanilla Beans Events system is loaded it will also create `pauseChangeRequested` and `loopPauseChanged` events, 
 * in which case you must register a listener with `onPauseChangeRequested` handler that receives `isPaused` boolean 
 * to pause or unpause the loop.
 * With default settings, Loop class triggers auto-pausing when user navigates away from the page in order to 
 * prevent bugs/discontinuities caused by browser-specific memory optimizations. If Events system is not in use this
 * will be handled by simply setting the `isPaused`, otherwise you need to setup the above mentioned listener.
 * Your event handler or any other piece of code may and should manipulate the `isPaused` property directly, for
 * both pausing and unpausing the loop.
 */
class Loop {
        /**
         * A procedure that the Loop class can run each frame.
         * @callback Loop~FrameAction
         * @param {Object} time
         * @param {Object} state
         * @param {Number} time.deltaTime Float, seconds since last frame
         * @param {Number} time.secondsElapsed Float, seconds elapsed in unpaused state since first starting the loop, or last if reset of timers was requested
         */
        
        /**
         * @param {Loop~FrameAction|Loop~FrameAction[]} defaultLoopCallback Callback or an array of callbacks that will run each frame
         * @param {object} defaultState Arbitrary state object that will be passed to frameAction callbacks
         * @param {object} settings
         * @param {bool} settings.pauseOnHide Whether the time should stop when browser page loses focus, highly recommended for real-time games to avoid bugs caused by browser memory optimizations, default true
         */
        constructor(defaultLoopCallback, defaultState, settings = {}) {
                this.loopCallbackQueue = Array.isArray(defaultLoopCallback) ? defaultLoopCallback : [defaultLoopCallback];
                this.defaultState = defaultState;
                this.currentCallbackQueue = this.loopCallbackQueue;
                this.currentState = this.defaultState;
                this.previousFrameTimestamp = null;
                this.secondsElapsed = 0.0;
                /**
                 * May manipulate directly to manage pause state 
                 * @type {bool}
                 */
                this.isPaused = false;
                this.settings = {...Loop.defaultSettings, ...settings};
                this._prevPausedValue = this.isPaused;
                if (this.settings.pauseOnHide)
                        document.addEventListener('visibilitychange', this._documentVisibilityChangeHandler);
                if (Events !== undefined && Events.instance !== undefined) {
                        Events.instance.createEventOnce('pauseChangeRequested');
                        Events.instance.createEventOnce('loopPauseChanged');
                }
        }
        /**
         * Start or restart the loop. There can be only one active loop so any other active one will be replaced.
         * Expected to be called only once, or whenever switching to different active Loop instance. For pause management
         * you may simply use `isPaused` property.
         * 
         * @param {?function} tempLoopCallback Pass if you wish to switch to a different single callback each frame, default stack used if empty
         * @param {?object} tempState Pass if you wish to use a state object different from the default one
         * @param {boolean} restartTimer Whether to restart all "elapsed" timers, default false
         */
        start(tempLoopCallback = null, tempState = null, restartTimer = false) {
                if (Loop.active !== null) Loop.active.isPaused = true;
                this.currentCallbackQueue = tempLoopCallback !== null ? [tempLoopCallback] : this.loopCallbackQueue;
                this.currentState = tempState ?? this.defaultState;
                this.isPaused = false;
                Loop.active = this;
                
                window.requestAnimationFrame(this._frame);
        }
        /**
         * Append one or more default actions that will run each frame.
         * Currently the only way to remove specific actions is to have them named and set them to falsey values, the system will remove them from the queue.
         * 
         * @param {Loop~FrameAction|Loop~FrameAction[]} action Single frame action callback or an array
         */
        pushToActionQueue(action) {
                if (Array.isArray(action))
                        this.loopCallbackQueue = [...this.loopCallbackQueue, ...action]
                else this.loopCallbackQueue.push(action);
                this.currentCallbackQueue = this.loopCallbackQueue;
        }
        _frame(timestamp) {
                if (Loop.active === null) return;
                const loop = Loop.active; // `this` unavailable within function that is argument to a higher order function
                if (loop._prevPausedValue != Loop.isPaused) { // Event on pause change
                        loop._prevPausedValue = Loop.isPaused;
                        if (Events !== undefined && Events.instance !== undefined)
                                Events.instance.dispatch('loopPauseChanged', loop.isPaused);
                }
                if (loop.isPaused) {
                        loop.previousFrameTimestamp = timestamp;
                        window.requestAnimationFrame(loop._frame);

                        return;
                }
                if (loop.previousFrameTimestamp === null) loop.previousFrameTimestamp = timestamp;
                const deltaTime = (timestamp - loop.previousFrameTimestamp) * 0.001;
                loop.secondsElapsed += deltaTime;
                
                let missingActions = [];
                // Run the loop's procedures
                for (let i = 0; i < loop.currentCallbackQueue.length; i++) {
                        const action = loop.currentCallbackQueue[i];
                        if (!action) {
                                missingActions.push(i);
                                continue;
                        }
                        action(
                                {deltaTime: deltaTime, secondsElapsed: loop.secondsElapsed}, 
                                loop.currentState
                        );
                }
                // Remove any missing actions
                missingActions.forEach(index => {
                        Loop.currentCallbackQueue.splice(index, 1);
                });
                
                loop.previousFrameTimestamp = timestamp;
                window.requestAnimationFrame(loop._frame);
        }
        _documentVisibilityChangeHandler() {
                // Pause automatic, unpause manual
                if (document.hidden) {
                        if (Events !== undefined && Events.instance !== undefined)
                                Events.instance.dispatch('pauseChangeRequested', true);
                        else
                                Loop.active.isPaused = true;
                }
        }
}

/**
 * Currently active Loop instance, set automatically when `start` method is called
 * @type {Loop}
 */
Loop.active = null;

Loop.defaultSettings = {
        pauseOnHide: true, // May disable only for turn-based game where all animations are cosmetical
}
