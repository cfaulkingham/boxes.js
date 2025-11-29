class Formats {
    constructor() {}
    getFormats() { return ['svg']; }
    getSurface(format) { return [null, null]; } // Mock
    convert(data, format) { return data; }
}
module.exports = { Formats };
