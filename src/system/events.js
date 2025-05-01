/**
 * Simple event system.
 * To use: 
 * - Initiate singleton: new Events()
 * - Register event type: Events.instance.createEvent('exampleEvent') or createEventOnce to not overwrite existing one with same name
 * - Register event listener object: Events.instance.registerEventListener(exampleObject, 'exampleEvent')
 * - Make sure the listener object implements onExampleEvent(data) function
 * - Of course you can have as many listeners per event type as you want
 * - To trigger the event: Events.instance.dispatch('exampleEvent', data)
 */
class Events {
	/**
	 * Sets `Events.instance` to the created instance.
	 */
	constructor() {
		this.eventListenerMap = {}
		Events.instance = this;
	}
	/** @param {string} eventName Camel case event name, the listeners will need to implement a camel case handler function prefixed with `on` */
	createEvent(eventName) {
		this.eventListenerMap[eventName] = [];
	}
	/** @param {string} eventName Same as `createEvent` but if event already exists it won't be overwritten */
	createEventOnce(eventName) {
		if (this.eventListenerMap[eventName] === undefined)
			this.createEvent(eventName);
	}
	/**
	 * @param {*} object An instance of some class that will implement the handler for the desired event
	 * @param {string} eventName Name of event the subscribing object will listen to
	 */
	registerEventListener(object, eventName) {
		if (this.eventListenerMap[eventName] === undefined) {console.warn("EVENT NOT REGISTERED: "+eventName); return;}
		this.eventListenerMap[eventName].push(object);
	}
	/**
	 * @param {*} object A previously registered listener to unsubscribe
	 * @param {string} eventName Name of event the listener object should unsubscribe from
	 */
	unregisterEventListener(object, eventName) {
		let i = this.eventListenerMap[eventName].indexOf(object);
		if (i === -1) {console.warn("Listener to unregister not found for event "+eventName); return;}
		this.eventListenerMap[eventName].splice(i, 1);
	}
	/**
	 * Dispatch an event.
	 * 
	 * @param {string} eventName Name of a previously created event to dispatch
	 * @param {*} data Arbitrary data that can be passed to the listeners' handler function
	 */
	dispatch(eventName, data) {
		if (this.eventListenerMap[eventName] === undefined) {console.warn("EVENT NOT REGISTERED: "+eventName); return;}
		const handlerName = this._getEventHandlerName(eventName);
		const listeners = this.eventListenerMap[eventName];
		for (let i=0; i<listeners.length; i++) {
			if (listeners[i][handlerName] === undefined) { console.warn("EVENT LISTENER NOT IMPLEMENTED "+listeners[i]+" FOR "+handlerName); continue; }
			listeners[i][handlerName](data);
		}
	}
	_getEventHandlerName(eventName) {
		return "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
	}
}