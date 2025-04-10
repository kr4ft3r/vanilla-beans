/**
 * DOM widget for displaying text by animating a typewriter effect.
 */
class Typewriter {
        /**
         * @param {Element} textElem Container for text
         */
        constructor(textElem) {
                this.textElem = textElem;
                this.running = false;
                this.delay = 0.1;
                this.text = "";
                this.length = 0;
                this.head = 0;
                this.time = 0.0;
                this.headStyle = "normal"; //TODO style
                this.lineBreaks = [];
        }
        /**
         * @param {String} text Text to start printing
         */
        write(text) {
                this.running = true;
                this.text = this._parse(text);
                this.visibleBuffer = '';
                this.hiddenBuffer = this.text;
                this.length = this.text.length;
                this.head = -1;
                this.headStyle = "normal";
                this.time = 0.0;
                this.textElem.innerHTML = "";
        }
        /**
         * @param {Number} deltaTime 
         */
        update(deltaTime) {
                if (!this.running) return;
                this.time += deltaTime;
                //console.log("A");
                if (this.time >= this.delay) {
                        //console.log("B");
                        let char = '';
                        this.time = 0.0;
                        this.head++;
                        if (this.head >= this.length) {
                                this.running = false;
                                this.textElem.innerHTML = `${this.visibleBuffer}<span style="visibility:hidden;">${this.hiddenBuffer}</span>`;
                                return;
                        }
                        char = this._headGetSpecialChar();
                        let isSpecial = true;
                        if (char === '') {
                                isSpecial = false;
                                char = this.text[this.head];
                                this.hiddenBuffer = this.hiddenBuffer.substring(1);
                        }
                        this.visibleBuffer += char;
                        
                        this.textElem.innerHTML = `${isSpecial ? this.visibleBuffer : this._withLastCharSpan(this.visibleBuffer)}<span style="visibility:hidden;">${this.hiddenBuffer}</span>`;
                }
        }
        /**
         * Skips the animation and shows full text.
         */
        skip() {
                let textArr = this.text.split('');
                let chars = textArr.slice(this.head);// '';
                while (true) {
                        this.head++;
                        if (this.head >= this.length) break;
                        let char = this._headGetSpecialChar();
                        if (char === '') {
                                char = this.text[this.head];
                                this.hiddenBuffer = this.hiddenBuffer.substring(1);
                        }
                        this.visibleBuffer += char;
                }
                this.textElem.innerHTML = `${this.visibleBuffer}<span style="visibility:hidden;">${this.hiddenBuffer}</span>`;
                
                this.running = false;
                this.time = 0.0;
        }
        /**
         * @param {String} text 
         * @returns {String}
         */
        _parse(text) {
                this.lineBreaks = [];
                let pattern = '\n';
                let i = text.indexOf(pattern);
                while (i !== -1) {
                        this.lineBreaks.push(i);
                        text = text.split('');
                        text.splice(i, 1);
                        text = text.join('');
                        i = text.indexOf(pattern, i + 1);
                }
                return text;
        }
        /**
         * @returns {string} Empty string or special element to inject
         */
        _headGetSpecialChar() {
                let char = '';
                if (this.lineBreaks.includes(this.head)) {
                        char = "<br>";
                        this.lineBreaks.splice(
                                this.lineBreaks.indexOf(this.head), 1);
                        this.head--;
                }
                return char;
        }
        /**
         * @param {string} text 
         */
        _withLastCharSpan(text) {
                if (text.length == 1) return `<span class="tw__lastchar">${text}</span>`;

                return `${text.substring(0, text.length - 1)}<span class="tw__lastchar">${text.substring(text.length - 1)}</span>`;
        }
}