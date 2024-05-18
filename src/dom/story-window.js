class StoryWindow {
        constructor(windowElem, textElem, popInCallback, popOutCallback) {
                this.windowElem = windowElem;
                this.textElem = textElem;
                this.popInCallback = popInCallback;
                this.popOutCallback = popOutCallback;
                this.visible = false;
                
                this.typewriter = {
                        running: false,
                        delay: 0.1,
                        text: "",
                        length: 0,
                        head: 0,
                        time: 0.0,
                        headStyle: "normal", //TODO style
                        lineBreaks: [],
                }
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
                this.typewriter.running = true;
                this.typewriter.text = this._parse(text);
                this.typewriter.length = this.typewriter.text.length;
                this.typewriter.head = -1;
                this.typewriter.headStyle = "normal";
                this.typewriter.time = 0.0;
                this.textElem.innerHTML = "";
        }
        
        update(deltaTime) {
                if (!this.typewriter.running) return;
                this.typewriter.time += deltaTime;
                //console.log("A");
                if (this.typewriter.time >= this.typewriter.delay) {
                        //console.log("B");
                        let char = '';
                        this.typewriter.time = 0.0;
                        this.typewriter.head++;
                        if (this.typewriter.head >= this.typewriter.length) {
                                this.typewriter.running = false;
                                return;
                        }
                        char = this._headGetSpecialChar();
                        if (char === '')
                                char = this.typewriter.text[this.typewriter.head];
                        this.textElem.innerHTML += char;
                }
        }
        
        skip() {
                /*this.typewriter.head++;
                if (this.typewriter.head < this.typewriter.length) {
                        let chars = this.typewriter.text.slice(this.typewriter.head);
                        this.textElem.innerHTML += chars;
                }*/
                let textArr = this.typewriter.text.split('');
                let chars = textArr.slice(this.typewriter.head);// '';
                while (true) {
                        this.typewriter.head++;
                        if (this.typewriter.head >= this.typewriter.length) break;
                        let char = this._headGetSpecialChar();
                        if (char === '') char = this.typewriter.text[this.typewriter.head];
                        this.textElem.innerHTML += char;
                        //chars += this.typewriter.text[this.typewriter.head];
                }
                
                this.typewriter.running = false;
                this.typewriter.time = 0.0;
        }
        _parse(text) {
                this.typewriter.lineBreaks = [];
                let pattern = '\n';
                let i = text.indexOf(pattern);
                while (i !== -1) {
                        this.typewriter.lineBreaks.push(i);
                        text = text.split('');
                        text.splice(i, 1);
                        text = text.join('');
                        i = text.indexOf(pattern, i + 1);
                }
                return text;
        }
        _headGetSpecialChar() {
                let char = '';
                if (this.typewriter.lineBreaks.includes(this.typewriter.head)) {
                        char = "<br>";
                        this.typewriter.lineBreaks.splice(
                                this.typewriter.lineBreaks.indexOf(this.typewriter.head), 1);
                        this.typewriter.head--;
                }
                return char;
        }
}
