import k from '../kaboom.js';

/**
 * Custom Kaboom component
 */
export default function InterfaceComponent(name, id, tags) {
    var id = id;
    var name = name;
    var tags = tags;

    return {
        getID() { // renamed to not override built-in id (uuid = Universally Unique Identifier  )
            return id;
        },
        name() { 
            return name; 
        },
        client() {
            return tags.includes('CLIENT');
        },
        endpoint() {
            return tags.includes('ENDPOINT');
        },
        processor() {
            return !this.client() && !this.endpoint();
        },
        equals(other) { 
            if (other instanceof InterfaceComponent) {
                return other.uuid() === id;
            } else {
                return false; // may be a troublesome default
            }
        },
        print() {
            console.log(`Component - Name: ${name}, ID: ${id}`);
        },
    };
};
