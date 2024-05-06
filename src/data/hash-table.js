class HashTable {
        constructor() {
                this.table = new Array(127);
                this.size = 0;
        }
        
        *[Symbol.iterator]() {
                for(let i = 0; i < this.size; i++)
                        if(this.table[i].length) continue;
                        else for(let y = 0; y < this.table[i].length; y++)
                                yield this.table[i][y][1];
        }
        
        _hash(key) {
                let hash = 0;
                for(let i = 0; i < key.length; i++) {
                        hash += key.charCodeAt(i);
                }
                
                return hash % this.table.length;
        }
        
        set(key, value) {
                const index = this._hash(key);
                if (this.table[index]) {
                        // Hash is duplicate
                        for (let i = 0; i < this.table[index].length; i++) {
                                if (this.table[index][i] === key) {
                                        this.table[index][i][1] = value; // Same key, replace
                                        return;
                                }
                        }
                        this.table[index].push([key, value]); // New key, insert
                } else {
                        // Hash is unique
                        this.table[index] = [];
                        this.table[index].push([key, value]);
                }
                this.size++;
        }
        
        get(key) {
                const index = this._hash(key);
                if (this.table[index]) {
                        for (let i = 0; i < this.table[index].length; i++) {
                                if (this.table[index][i][0] === key)
                                        return this.table[index][i][1];
                        }
                }
                
                return undefined;
        }
        
        remove(key) {
                const index = this._hash(key);
                
                if (!this.table[index] || !this.table[index].length) return false;
                
                for (let i = 0; i < this.table[index].length; i++) {
                        if (this.table[index][i][0] === key) {
                                this.table[index].splice(i, 1);
                                this.size--;

                                return true;
                        }
                }
                
                return false;
        }
        
        toString() {
                let table = '';
                this.table.forEach((values, index) => {
                        const chained = values.map(
                                (key, value) => `[ ${key}: ${value} ]`
                        );
                        table += `${index} => ${chained}` + '\n';
                });
                
                return table;
        }
}