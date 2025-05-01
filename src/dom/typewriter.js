/**
 * DOM widget for displaying text by animating a typewriter effect.
 */
class Typewriter {
        /**
         * @param {Element} textElem Container for text
         */
        constructor(textElem) {
                /** 
                 * DOM element that contains text
                 * @type {Element} */
                this.textElem = textElem;
                /** 
                 * Can be safely used to pause and unpause the typewriter
                 * @type {bool} */
                this.running = false;
                /** 
                 * Delay in seconds before next character is written
                 * @type {number} */
                this.delay = 0.05;

                this._text = "";
                this._length = 0;
                this._head = 0;
                this._time = 0.0;
                this.headStyle = "normal"; //TODO style
                this._lineBreaks = [];
        }
        /**
         * @param {String} text Text to start printing
         */
        write(text) {
                this.running = true;
                this._text = this._parse(text);
                this.visibleBuffer = '';
                this.hiddenBuffer = this._text;
                this._length = this._text.length;
                this._head = -1;
                this.headStyle = "normal";
                this._time = 0.0;
                this.textElem.innerHTML = "";
        }
        /**
         * @param {Number} deltaTime 
         * @return {Number} State code: 0 = nothing to write, 1 = writing, -1 = wrote the final character on this update
         */
        update(deltaTime) {
                if (!this.running) return 0;
                this._time += deltaTime;
                if (this._time >= this.delay) {
                        let char = '';
                        this._time = this._time - this.delay; 
                        this._head++;
                        if (this._head >= this._length) {
                                this.running = false;
                                this.textElem.innerHTML = `${this.visibleBuffer}<span style="visibility:hidden;">${this.hiddenBuffer}</span>`;
                                return -1;
                        }
                        char = this._headGetSpecialChar();
                        let isSpecial = true;
                        if (char === '') {
                                isSpecial = false;
                                char = this._text[this._head];
                                this.hiddenBuffer = this.hiddenBuffer.substring(1);
                        }
                        this.visibleBuffer += char;
                        
                        this.textElem.innerHTML = `${isSpecial ? this.visibleBuffer : this._withLastCharSpan(this.visibleBuffer)}<span style="visibility:hidden;">${this.hiddenBuffer}</span>`;

                        return 1;
                }
        }
        /**
         * Skips the animation and shows full text.
         */
        skip() {
                let textArr = this._text.split('');
                let chars = textArr.slice(this._head);// '';
                while (true) {
                        this._head++;
                        if (this._head >= this._length) break;
                        let char = this._headGetSpecialChar();
                        if (char === '') {
                                char = this._text[this._head];
                                this.hiddenBuffer = this.hiddenBuffer.substring(1);
                        }
                        this.visibleBuffer += char;
                }
                this.textElem.innerHTML = `${this.visibleBuffer}<span style="visibility:hidden;">${this.hiddenBuffer}</span>`;
                
                this.running = false;
                this._time = 0.0;
        }
        /**
         * @private
         * @param {String} text 
         * @returns {String}
         */
        _parse(text) {
                this._lineBreaks = [];
                let pattern = '\n';
                let i = text.indexOf(pattern);
                while (i !== -1) {
                        this._lineBreaks.push(i);
                        text = text.split('');
                        text.splice(i, 1);
                        text = text.join('');
                        i = text.indexOf(pattern, i + 1);
                }
                return text;
        }
        /**
         * @private
         * @returns {string} Empty string or special element to inject
         */
        _headGetSpecialChar() {
                let char = '';
                if (this._lineBreaks.includes(this._head)) {
                        char = "<br>";
                        this._lineBreaks.splice(
                                this._lineBreaks.indexOf(this._head), 1);
                        this._head--;
                }
                return char;
        }
        /**
         * @private
         * @param {string} text 
         */
        _withLastCharSpan(text) {
                if (text.length == 1) return `<span class="tw__lastchar">${text}</span>`;

                return `${text.substring(0, text.length - 1)}<span class="tw__lastchar">${text.substring(text.length - 1)}</span>`;
        }
}