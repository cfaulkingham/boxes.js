/**
 * Class representing standard colors and color mappings for laser cutting.
 * Stores RGB values for common colors and semantic mappings for cuts, annotations, etc.
 */
class Color {
    /** @type {number[]} Black color usually used for cuts */
    static BLACK = [0.0, 0.0, 0.0];
    /** @type {number[]} Blue color usually used for inner cuts */
    static BLUE = [0.0, 0.0, 1.0];
    /** @type {number[]} Green color */
    static GREEN = [0.0, 1.0, 0.0];
    /** @type {number[]} Red color */
    static RED = [1.0, 0.0, 0.0];
    /** @type {number[]} Cyan color */
    static CYAN = [0.0, 1.0, 1.0];
    /** @type {number[]} Yellow color */
    static YELLOW = [1.0, 1.0, 0.0];
    /** @type {number[]} Magenta color */
    static MAGENTA = [1.0, 0.0, 1.0];
    /** @type {number[]} White color */
    static WHITE = [1.0, 1.0, 1.0];

    /** @type {number[]} Color for outer cuts (boundary of parts) */
    static OUTER_CUT = Color.BLACK;
    /** @type {number[]} Color for inner cuts (holes inside parts) */
    static INNER_CUT = Color.BLUE;
    /** @type {number[]} Color for annotations/text */
    static ANNOTATIONS = Color.RED;
    /** @type {number[]} Color for etching/engraving */
    static ETCHING = Color.GREEN;
    /** @type {number[]} Color for deep etching */
    static ETCHING_DEEP = Color.CYAN;
}

export { Color };
