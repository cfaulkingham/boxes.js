# Simplified Generator Testing

This directory contains a unified test runner that can dynamically test any generator without needing separate test files for each one.

## Usage

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

### Test All Generators
```bash
node test/test.js all
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

## Generator-Specific Configurations

Some generators need special property setup. These are configured in the `GENERATOR_CONFIGS` object in `test.js`:

```javascript
const GENERATOR_CONFIGS = {
    airpurifier: {
        properties: {
            fan_diameter: 140.0,
            rim: 30.0,
            filter_height: 46.77,
            filters: 2,
            // ... more properties
        }
    },
    abox: {
        properties: {},
        setup: (box) => {
            // Custom initialization logic
            if (box.lidSettings && box.lidSettings.values) {
                box.lidSettings.values.style = "overthetop";
            }
        }
    }
};
```

### Adding Configuration for a New Generator

If a generator needs specific properties or setup:

1. Open `test/test.js`
2. Find the `GENERATOR_CONFIGS` object
3. Add an entry for your generator:

```javascript
const GENERATOR_CONFIGS = {
    // ... existing configs
    mygenerator: {
        properties: {
            // Properties to set before parseArgs()
            width: 100,
            height: 50
        },
        setup: (box) => {
            // Optional: custom setup after open()
            box.someSpecialProperty = "value";
        }
    }
};
```

## How It Works

The test runner:

1. **Loads** the generator module dynamically using ES6 imports
2. **Finds** the exported class using case-insensitive matching
3. **Creates** an instance of the generator
4. **Applies** any generator-specific configuration
5. **Runs** the standard lifecycle: `parseArgs()` → `open()` → `render()` → `close()`
6. **Saves** the resulting SVG

## Benefits

✅ **Single file** instead of 100+ individual test files  
✅ **Automatic discovery** of all generators  
✅ **Consistent testing** - same process for all generators  
✅ **Easy maintenance** - update test logic in one place  
✅ **Batch testing** - test all generators at once  
✅ **Flexible** - supports custom configurations per generator  

## Migration from Old Test Files

Old approach (separate file per generator):
```javascript
// test/test_regularbox.js
import fs from 'fs';
import { RegularBox } from '../boxes/generators/regularbox.js';

const box = new RegularBox();
box.parseArgs({});
box.open();
box.render();
const svg = box.close();
fs.writeFileSync('test/regularbox.svg', svg);
```

New approach (unified test runner):
```bash
node test/test.js regularbox
```

The old test files can be safely archived or deleted once you've verified the new system works for your needs.

## Troubleshooting

### Generator not found
Make sure the generator name matches the filename in `boxes/generators/`:
```bash
# List all available generators
node test/test.js list
```

### Generator needs special setup
Add a configuration entry in `GENERATOR_CONFIGS` in `test.js`.

### Import errors
Check that the generator exports its class correctly:
```javascript
export { MyGeneratorClass };
```

The test runner uses case-insensitive matching, so it will find `RegularBox`, `regularbox`, or `REGULARBOX` exports.
