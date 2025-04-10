/**
 * Used to run a sequence of events at specified times. Sequence can loop or end after the last segment.
 * Each segment runs a specified callback once and then the next segment is activated after the specified 
 * amount of time. Optionally, there is a limited way to control the flow by `label` and `goto` properties.
 */
class TimedSequence {
        
        /**
         * A segment of a sequence that can be managed by the TimedSequence.
         * @typedef {Object} TimedSequence~TimedSequenceSegment
         * @property {Number} duration Duration in seconds until sequence should switch to the next segment
         * @property {SequenceSegmentAction} action Callback to run when segment starts
         * @property {string} [label] A way to have named segments
         * @property {string} [goto] Instead of the next segment in the sequence, switch to the segment specified by label when this one is done
         */
        
        /**
         * Callback called at start of a segment.
         * @callback TimedSequence~SequenceSegmentAction
         * @param {*} target Arbitrary data specified during TimedSequence instance construction, null otherwise
         */
        
        /**
         * @param {TimedSequenceSegment[]} sequence Array of segments that define the sequence
         * @param {bool} [loop] Whether sequence should loop back to the first segment after the last is done
         * @param {*} [target] Optional target parameter passed to callbacks
         */
        constructor(sequence, loop = false, target = null) {
                this.sequence = sequence;
                this.labels = sequence.reduce(
                        (acc, obj, i) => { if('label' in obj) return acc[obj.label] = i; else return acc; },
                        {}
                );
                this.loop = loop;
                this.target = target;
                this.time = 0.0;
                this.currentIndex = 0;
                this.modifier = 1.0;
                this.running = false;
        }
        /**
         * Must be called to start the sequence.
         * 
         * @param {Number} at Integer, optional index of the segment to start from.
         */
        start(at = 0) {
                this.currentIndex = at;
                this.time = 0.0;
                this.sequence[this.currentIndex].action(this.target);
                this.running = true;
        }
        /**
         * Must be called each frame.
         * 
         * @param {Number} deltaTime Float, seconds since last frame
         * @returns {Number} Integer, the index of the currently active segment
         */
        update(deltaTime) {
                if (!this.running) return false;
                this.time += deltaTime * this.modifier;
                //console.log(this.time);
                if (this.sequence[this.currentIndex].duration > this.time) return this.currentIndex;
                // next
                this.currentIndex += 1;
                //console.log(this.currentIndex);
                if (this.sequence.length <= this.currentIndex) {
                        if (this.loop) { this.currentIndex = 0; }
                        else { this.running = false; return false; }
                }
                this.time = 0.0;
                if ('goto' in this.sequence[this.currentIndex]) {
                        this.start(this.labels[this.sequence[this.currentIndex].goto]);
                        return this.currentIndex;
                }
                this.sequence[this.currentIndex].action(this.target);
                
                return this.currentIndex;
        }
}
