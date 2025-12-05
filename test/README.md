# Generator Test Usage

### Basic Test
Test a single generator:
```bash
node test/test.js <generator-name>
```

Examples:
```bash
node test/test.js abox
node test/test.js regularbox
node test/test.js airpurifier
```

### List All Generators
```bash
node test/test.js list
```

### Options

#### Custom Output Path
Specify where to save the SVG:
```bash
node test/test.js regularbox --output my-box.svg
node test/test.js regularbox -o my-box.svg
```

#### Verbose Mode
Get detailed output during testing:
```bash
node test/test.js abox --verbose
node test/test.js abox -v
```

#### Debug Mode
Enable method tracing for debugging:
```bash
node test/test.js regularbox --debug
node test/test.js regularbox -d
```

## How It Works

The test runner:

1. **Loads** the generator module dynamically using ES6 imports
2. **Finds** the exported class using case-insensitive matching
3. **Creates** an instance of the generator
5. **Runs** the standard lifecycle: `parseArgs()` → `open()` → `render()` → `close()`
6. **Saves** the resulting SVG


