class Color {
    static BLACK   = [ 0.0, 0.0, 0.0 ];
    static BLUE    = [ 0.0, 0.0, 1.0 ];
    static GREEN   = [ 0.0, 1.0, 0.0 ];
    static RED     = [ 1.0, 0.0, 0.0 ];
    static CYAN    = [ 0.0, 1.0, 1.0 ];
    static YELLOW  = [ 1.0, 1.0, 0.0 ];
    static MAGENTA = [ 1.0, 0.0, 1.0 ];
    static WHITE   = [ 1.0, 1.0, 1.0 ];

    static OUTER_CUT = Color.BLACK;
    static INNER_CUT = Color.BLUE;
    static ANNOTATIONS = Color.RED;
    static ETCHING = Color.GREEN;
    static ETCHING_DEEP = Color.CYAN;
}

export { Color  };
