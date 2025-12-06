
// Globals to support Python-ported generators

/**
 * Parse a boolean argument from string or other types.
 * @param {string|boolean} v - Value to parse.
 * @returns {boolean} True if string is 'true' (case-insensitive) or value is truthy.
 */
global.boolarg = function (v) {
    if (typeof v === 'string') {
        return v.toLowerCase() === 'true';
    }
    return !!v;
};

/**
 * Returns the boolarg function.
 * Used for argument parsing configuration.
 * @returns {Function} The boolarg function.
 */
global.BoolArg = function () {
    return global.boolarg;
};

/**
 * Creates a validator for edge type arguments.
 * @param {string} chars - Allowed characters/types.
 * @returns {Function} A function that returns the value (validation not implemented).
 */
global.ArgparseEdgeType = function (chars) {
    return function (v) {
        // Validation could go here
        return v;
    };
};

/**
 * Creates an array from an iterable.
 * Mimics Python's list() constructor.
 * @param {Iterable|string} iterable - The iterable to convert.
 * @returns {Array} An array containing the elements.
 */
global.list = function (iterable) {
    if (typeof iterable === 'string') {
        return iterable.split('');
    }
    if (iterable && typeof iterable[Symbol.iterator] === 'function') {
        return Array.from(iterable);
    }
    return [];
};

/**
 * Generates a sequence of numbers.
 * Mimics Python's range() function.
 * @param {number} start - Start value (or stop if only one argument provided).
 * @param {number} [stop] - Stop value.
 * @param {number} [step=1] - Step value.
 * @returns {number[]} Array of numbers in the range.
 */
global.range = function (start, stop, step) {
    if (typeof stop === 'undefined') {
        stop = start;
        start = 0;
    }
    if (typeof step === 'undefined') {
        step = 1;
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }
    const result = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }
    return result;
};

/**
 * Generator that yields pairs of [index, value].
 * Mimics Python's enumerate().
 * @param {Iterable} iterable - The iterable to enumerate.
 * @yields {Array} Pair of [index, value].
 */
global.enumerate = function* (iterable) {
    let i = 0;
    for (const item of iterable) {
        yield [i++, item];
    }
};

/**
 * Returns a new array with elements in reverse order.
 * Mimics Python's reversed().
 * @param {Iterable} iterable - The iterable to reverse.
 * @returns {Array} Reversed array.
 */
global.reversed = function (iterable) {
    return Array.from(iterable).reverse();
};

/**
 * Returns a new sorted array.
 * Mimics Python's sorted().
 * @param {Iterable} iterable - The iterable to sort.
 * @param {Function} [key] - Function to extract comparison key.
 * @param {boolean} [reverse] - Whether to sort in descending order.
 * @returns {Array} Sorted array.
 */
global.sorted = function (iterable, key, reverse) {
    const arr = Array.from(iterable);
    arr.sort((a, b) => {
        const valA = key ? key(a) : a;
        const valB = key ? key(b) : b;
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
    });
    if (reverse) {
        arr.reverse();
    }
    return arr;
};

/**
 * Aggregates elements from each of the iterables.
 * Mimics Python's zip().
 * @param {...Iterable} iterables - Iterables to zip.
 * @returns {Array<Array>} Array of tuples.
 */
global.zip = function (...iterables) {
    const iterators = iterables.map(i => Array.from(i)[Symbol.iterator]());
    const result = [];
    while (true) {
        const nexts = iterators.map(i => i.next());
        if (nexts.some(n => n.done)) break;
        result.push(nexts.map(n => n.value));
    }
    return result;
};

/**
 * Parses section argument string into numbers.
 * @param {string} s - Colan-separated number string.
 * @returns {number[]} Array of numbers.
 */
global.argparseSections = function (s) {
    if (!s) return [];
    return s.split(':').map(Number);
};

/**
 * Sums the items of an iterable.
 * Mimics Python's sum().
 * @param {Iterable<number>} iterable - Iterable of numbers.
 * @returns {number} Sum of elements.
 */
global.sum = function (iterable) {
    let s = 0;
    for (const x of iterable) s += x;
    return s;
};

/**
 * Returns the length of an item.
 * Mimics Python's len().
 * @param {Object|Array|string} iterable - Item to check length of.
 * @returns {number} Length or size.
 */
global.len = function (iterable) {
    if (Array.isArray(iterable) || typeof iterable === 'string') return iterable.length;
    if (iterable instanceof Set || iterable instanceof Map) return iterable.size;
    return Object.keys(iterable).length;
};

/**
 * Check if an object is an instance of a class or constructor function.
 * Mimics Python's isinstance().
 * @param {*} obj - Object to check.
 * @param {Function|Function[]} classOrTuple - Class constructor or array of constructors.
 * @returns {boolean} True if obj is an instance of the class.
 */
global.isinstance = function (obj, classOrTuple) {
    if (Array.isArray(classOrTuple)) {
        return classOrTuple.some(cls => obj instanceof cls);
    }
    return obj instanceof classOrTuple;
};
