/**
 * Usage:
 * - Create new Input instance and give it name
 * - Use Events system: create listener that registers to `{name}KeyDown` and implements `on{Name}KeyDown`
 *   method where parameter passed is the key code.
 *
 * Example:
 * let input = new Input('game');
 * Events.instance.registerEventListener(obj, 'gameKeyDown');
 * obj.onGameKeyDown = (code) => {console.log(code + ' key down')} // Usually you will dispatch another event here
 */
class Input {
        constructor(name) {
                this.name = name;
                this.keysDown = {};
                document.onkeydown = this.onKeyDown;
                document.onkeyup = this.onKeyUp;
                Events.instance.createEvent(this.name+'KeyDown');
                Events.instance.createEvent(this.name+'KeyUp');
                Input.activeInput = this;
        }
        
        isKeyDown(code) {
                return (code in this.keysDown) && this.keysDown[code];
        }
        
        onKeyDown(evt) {
                evt = evt || window.event;
                //this.keysDown[evt.keyCode] = true;
                Events.instance.dispatch(Input.activeInput.name+'KeyDown', evt.keyCode);
        }
        
        onKeyUp(evt) {
                evt = evt || window.event;
                //this.keysDown[evt.keyCode] = false;
                Events.instance.dispatch(Input.activeInput.name+'KeyUp', evt.keyCode);
        }
}

Input.activeInput = null;