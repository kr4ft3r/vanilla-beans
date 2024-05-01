class Events {
	constructor() {
		this.eventListenerMap = {}
		Events.instance = this;
	}
	
	createEvent(eventName) {
		this.eventListenerMap[eventName] = [];
	}
	
	registerEventListener(object, eventName) {
		if (this.eventListenerMap[eventName] === undefined) {console.warn("EVENT NOT REGISTERED: "+eventName); return;}
		this.eventListenerMap[eventName].push(object);
	}
	
	dispatch(eventName, data) {
		if (this.eventListenerMap[eventName] === undefined) {console.warn("EVENT NOT REGISTERED: "+eventName); return;}
		const handlerName = this.getEventHandlerName(eventName);
		const listeners = this.eventListenerMap[eventName];
		for (let i=0; i<listeners.length; i++) {
			if (listeners[i][handlerName] === undefined) { console.warn("EVENT LISTENER NOT IMPLEMENTED "+listeners[i]+" FOR "+handlerName); continue; }
			listeners[i][handlerName](data);
		}
	}
	
	getEventHandlerName(eventName) {
		return "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
	}
}