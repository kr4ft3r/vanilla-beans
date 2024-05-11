class TimedSequence {
        /**
         * @param {Object[]} sequence Array of objects with properties {duration:length in seconds, action:callback} 
         * @param {*} target Optional target parameter passed to callbacks
         */
        constructor(sequence, loop = false, target = null) {
                this.sequence = sequence;
                this.target = target;
                this.time = 0.0;
                this.currentIndex = 0;
                this.modifier = 1.0;
                this.running = false;
        }
        start(at = 0) {
                this.currentIndex = at;
                this.time = 0.0;
                this.sequence[this.currentIndex].action(this.target);
                this.running = true;
        }
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
                this.sequence[this.currentIndex].action(this.target);
                
                return this.currentIndex;
        }
}