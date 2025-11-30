
class ArgParser {
    constructor() {
        this.arguments = [];
    }

    add_argument(name, options) {
        this.arguments.push({ name, ...options });
    }

    add_argument_group(name) {
        return this; // Mock: return self so we can call add_argument on it
    }
}

export { ArgParser };
