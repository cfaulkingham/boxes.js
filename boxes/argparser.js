/**
 * Mock Argument Parser to mimic Python's argparse behavior.
 * Collects argument definitions to be used by the UI or application.
 */
class ArgParser {
    /**
     * Create a new ArgParser instance.
     */
    constructor() {
        /** @type {Array<Object>} List of registered arguments */
        this.arguments = [];
    }

    /**
     * Add an argument definition.
     * @param {string} name - The name of the argument (e.g., "--thickness").
     * @param {Object} options - Option parameters for the argument.
     * @param {string} [options.action] - The action to take (e.g., "store").
     * @param {string} [options.type] - The type of the argument (e.g., "float", "bool", "str").
     * @param {any} [options.default] - The default value.
     * @param {string} [options.help] - Help text description.
     * @param {string[]} [options.choices] - List of valid choices.
     */
    add_argument(name, options) {
        this.arguments.push({ name, ...options });
    }

    /**
     * Add an argument group (mock implementation).
     * @param {string} name - The name of the group.
     * @returns {ArgParser} Returns itself to allow chaining or treating as the group object.
     */
    add_argument_group(name) {
        return this; // Mock: return self so we can call add_argument on it
    }
}

export { ArgParser };
