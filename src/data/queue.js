/**
 * FIFO data structure.
 */
class Queue {
	constructor() {
		this.items = {}
		this.frontIndex = 0
		this.backIndex = 0
	}
	/** @param {*} item */
	enqueue(item) {
		this.items[this.backIndex] = item
		this.backIndex++
	}
	/** Get the next item and remove it from the queue */
	dequeue() {
		const item = this.items[this.frontIndex]
		delete this.items[this.frontIndex]
		this.frontIndex++
		return item
	}
	/** @returns {*} Fetch the next item without removing it */
	peek() {
		return this.items[this.frontIndex]
	}
	/** @returns {bool} True if no more items in queue */
	isEmpty() {
		return Object.keys(this.items).length == 0;
	}
	/** @returns {array} */
	get printQueue() {
		return this.items;
	}
}