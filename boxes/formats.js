/**
 * Class handling output format support.
 * Provides methods to retrieve supported formats and handle conversions (mock implementation).
 */
class Formats {
    /**
     * Create a new Formats instance.
     */
    constructor() { }

    /**
     * Get the list of supported file formats.
     * @returns {string[]} List of format extensions (e.g. ['svg']).
     */
    getFormats() { return ['svg']; }

    /**
     * Get surface dimensions for a specific format.
     * @param {string} format - The format extension.
     * @returns {Array<null>} Returns [null, null] as a mock placeholder.
     */
    getSurface(format) { return [null, null]; } // Mock

    /**
     * Convert data to the specified format.
     * @param {any} data - The data to convert.
     * @param {string} format - The target format.
     * @returns {any} The converted data (or original data in this mock).
     */
    convert(data, format) { return data; }
}
export { Formats };
