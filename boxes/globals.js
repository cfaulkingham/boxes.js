
// Globals to support Python-ported generators

global.boolarg = function(v) {
    if (typeof v === 'string') {
        return v.toLowerCase() === 'true';
    }
    return !!v;
};

global.BoolArg = function() {
    return global.boolarg;
};

global.ArgparseEdgeType = function(chars) {
    return function(v) {
        // Validation could go here
        return v;
    };
};

global.list = function(iterable) {
    if (typeof iterable === 'string') {
        return iterable.split('');
    }
    if (iterable && typeof iterable[Symbol.iterator] === 'function') {
        return Array.from(iterable);
    }
    return [];
};

global.range = function(start, stop, step) {
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

global.enumerate = function*(iterable) {
    let i = 0;
    for (const item of iterable) {
        yield [i++, item];
    }
};

global.reversed = function(iterable) {
    return Array.from(iterable).reverse();
};

global.sorted = function(iterable, key, reverse) {
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

global.zip = function(...iterables) {
    const iterators = iterables.map(i => Array.from(i)[Symbol.iterator]());
    const result = [];
    while (true) {
        const nexts = iterators.map(i => i.next());
        if (nexts.some(n => n.done)) break;
        result.push(nexts.map(n => n.value));
    }
    return result;
};

global.argparseSections = function(s) {
    if (!s) return [];
    return s.split(':').map(Number);
};

global.sum = function(iterable) {
    let s = 0;
    for (const x of iterable) s += x;
    return s;
};

global.len = function(iterable) {
    if (Array.isArray(iterable) || typeof iterable === 'string') return iterable.length;
    if (iterable instanceof Set || iterable instanceof Map) return iterable.size;
    return Object.keys(iterable).length;
};
