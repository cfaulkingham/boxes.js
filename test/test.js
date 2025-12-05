#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dynamic Generator Test Runner
 * 
 * Usage:
 *   node test/test.js <generator-name> [options]
 *   
 * Examples:
 *   node test/test.js abox
 *   node test/test.js airpurifier --fan_diameter 120 --filters 1
 *   node test/test.js regularbox --output custom.svg --x 100 --y 200
 *   node test/test.js all  # Test all generators with their defaults
 * 
 * Generic options (handled by test runner):
 *   --output, -o <path>   Output SVG file path
 *   --verbose, -v         Verbose output
 *   --debug, -d           Debug mode with method tracing
 * 
 * All other options are passed directly to the generator's parseArgs() method.
 */

// Parse command line arguments
const args = process.argv.slice(2);
const generatorName = args[0];

/**
 * Separate generic test runner options from generator-specific options
 */
function parseArguments(args) {
    const genericOptions = {
        output: null,
        verbose: false,
        debug: false
    };
    
    const generatorArgs = [];
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        // Handle generic options
        if (arg === '--output' || arg === '-o') {
            genericOptions.output = args[++i];
        } else if (arg === '--verbose' || arg === '-v') {
            genericOptions.verbose = true;
        } else if (arg === '--debug' || arg === '-d') {
            genericOptions.debug = true;
        } else {
            // Pass all other args to generator
            generatorArgs.push(arg);
            // If it's an option with a value, include the next arg too
            if (arg.startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
                generatorArgs.push(args[++i]);
            }
        }
    }
    
    return { genericOptions, generatorArgs };
}

async function loadGenerator(name) {
    const modulePath = path.resolve(__dirname, `../boxes/generators/${name}.js`);
    
    if (!fs.existsSync(modulePath)) {
        throw new Error(`Generator file not found: ${modulePath}`);
    }
    
    const module = await import(modulePath);
    
    // Get all exported names (case-insensitive match)
    const exportedNames = Object.keys(module);
    
    // Try to find the class by comparing lowercase versions
    let GeneratorClass = null;
    const lowerName = name.toLowerCase();
    
    for (const exportName of exportedNames) {
        if (exportName.toLowerCase() === lowerName) {
            GeneratorClass = module[exportName];
            break;
        }
    }
    
    // If still not found, try default export
    if (!GeneratorClass) {
        GeneratorClass = module.default;
    }
    
    if (!GeneratorClass) {
        throw new Error(`Could not find generator class in ${modulePath}. Available exports: ${exportedNames.join(', ')}`);
    }
    
    return GeneratorClass;
}

async function testGenerator(name, genericOpts = {}, generatorArgs = []) {
    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${name}`);
        console.log('='.repeat(60));
        
        // Load the generator class
        const GeneratorClass = await loadGenerator(name);
        
        // Create instance
        const box = new GeneratorClass();
        
        // Parse args with defaults first
        box.parseArgs({});
        
        // Apply defaults from generator's static defaultConfig if available
        if (GeneratorClass.defaultConfig) {
            const defaults = GeneratorClass.defaultConfig;
            if (genericOpts.verbose) {
                console.log('Applying default config:', defaults);
            }
            Object.assign(box, defaults);
        }
        
        // Apply generator-specific arguments directly as properties
        if (generatorArgs.length > 0) {
            if (genericOpts.verbose) {
                console.log('Generator arguments:', generatorArgs);
            }
            
            // Build properties object from args
            const props = {};
            const settingsProps = {}; // For settings like lid_* that need special handling
            
            for (let i = 0; i < generatorArgs.length; i++) {
                const arg = generatorArgs[i];
                if (arg.startsWith('--')) {
                    const key = arg.slice(2);
                    const value = generatorArgs[i + 1];
                    
                    // Check if next arg is a value or another option
                    let parsedValue;
                    if (value && !value.startsWith('--')) {
                        // Try to parse as number if it looks like one
                        const numValue = parseFloat(value);
                        parsedValue = isNaN(numValue) ? value : numValue;
                        i++; // Skip the value in next iteration
                    } else {
                        // Boolean flag
                        parsedValue = true;
                    }
                    
                    // Check if this is a settings parameter (e.g., lid_style, lid_height)
                    if (key.includes('_')) {
                        const [settingsPrefix, ...settingKeyParts] = key.split('_');
                        const settingKey = settingKeyParts.join('_');
                        if (!settingsProps[settingsPrefix]) {
                            settingsProps[settingsPrefix] = {};
                        }
                        settingsProps[settingsPrefix][settingKey] = parsedValue;
                    } else {
                        props[key] = parsedValue;
                    }
                }
            }
            
            if (genericOpts.verbose) {
                console.log('Applying generator properties:', props);
                console.log('Applying settings properties:', settingsProps);
            }
            
            // Apply properties directly to box instance
            Object.assign(box, props);
            
            // Store settings props for later application (after open() creates the settings objects)
            box._pendingSettings = settingsProps;
        }
        
        // Open the box (this calls _buildObjects which creates lidSettings, etc.)
        box.open();
        
        // Apply settings properties to appropriate settings objects AFTER open() is called
        if (box._pendingSettings) {
            const settingsProps = box._pendingSettings;
            
            // Apply settings to lidSettings if it exists
            if (box.lidSettings && settingsProps.lid) {
                for (const [key, value] of Object.entries(settingsProps.lid)) {
                    if (genericOpts.verbose) {
                        console.log(`Setting lidSettings.values.${key} = ${value}`);
                    }
                    box.lidSettings.values[key] = value;
                }
            }
        }
        
        // Run custom setup if provided by the generator
        if (GeneratorClass.setup && typeof GeneratorClass.setup === 'function') {
            GeneratorClass.setup(box);
            if (genericOpts.verbose) {
                console.log('Ran custom setup function');
            }
        }
        
        // Debug mode - add method tracing
        if (genericOpts.debug) {
            console.log('\n--- Debug Mode Enabled ---');
            
            // Wrap common methods for debugging
            const methodsToTrace = ['rectangularWall', 'lid', 'render'];
            methodsToTrace.forEach(methodName => {
                if (typeof box[methodName] === 'function') {
                    const original = box[methodName].bind(box);
                    box[methodName] = function(...args) {
                        console.log(`[DEBUG] ${methodName}(${args.map(a => 
                            typeof a === 'object' ? JSON.stringify(a) : a
                        ).join(', ')})`);
                        return original(...args);
                    };
                }
            });
        }
        
        // Render the box
        if (genericOpts.verbose) {
            console.log('Rendering...');
        }
        box.render();
        
        // Close and get SVG
        const svg = box.close();
        
        // Determine output path
        const outputPath = genericOpts.output || path.join(__dirname, 'output', `${name}.svg`);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write to file
        fs.writeFileSync(outputPath, svg);
        
        console.log(`✓ Successfully generated SVG: ${outputPath}`);
        console.log(`  SVG size: ${svg.length} bytes`);
        
        return { success: true, name, outputPath };
        
    } catch (e) {
        console.error(`✗ Error generating ${name}:`, e.message);
        if (genericOpts.verbose) {
            console.error(e.stack);
        }
        return { success: false, name, error: e.message };
    }
}

async function getAllGenerators() {
    const generatorsDir = path.resolve(__dirname, '../boxes/generators');
    const files = fs.readdirSync(generatorsDir);
    
    // Filter for .js files, exclude templates and Python files
    return files
        .filter(f => f.endsWith('.js') && !f.startsWith('_'))
        .map(f => f.replace('.js', ''))
        .sort();
}

async function testAll(genericOpts = {}) {
    const generators = await getAllGenerators();
    console.log(`Found ${generators.length} generators to test\n`);
    
    const results = [];
    for (const name of generators) {
        // Test each generator with its defaults (no additional args)
        const result = await testGenerator(name, genericOpts, []);
        results.push(result);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✓ Successful: ${successful.length}/${results.length}`);
    if (successful.length > 0) {
        successful.forEach(r => console.log(`  - ${r.name}`));
    }
    
    if (failed.length > 0) {
        console.log(`\n✗ Failed: ${failed.length}/${results.length}`);
        failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
    
    return results;
}

async function listGenerators() {
    const generators = await getAllGenerators();
    console.log('Available generators:');
    generators.forEach(name => console.log(`  - ${name}`));
    console.log(`\nTotal: ${generators.length} generators`);
    console.log('\nUsage examples:');
    console.log('  node test/test.js abox');
    console.log('  node test/test.js airpurifier --fan_diameter 120 --filters 1');
    console.log('  node test/test.js regularbox --x 100 --y 200 --h 50');
}

// Main execution
async function main() {
    if (!generatorName) {
        console.log('Usage: node test/test.js <generator-name> [options]');
        console.log('\nGeneric options (handled by test runner):');
        console.log('  --output, -o <path>   Output SVG file path');
        console.log('  --verbose, -v         Verbose output');
        console.log('  --debug, -d           Debug mode with method tracing');
        console.log('\nAll other options are passed to the generator.');
        console.log('\nSpecial commands:');
        console.log('  node test/test.js all      Test all generators');
        console.log('  node test/test.js list     List all available generators');
        console.log('\nExamples:');
        console.log('  node test/test.js abox');
        console.log('  node test/test.js airpurifier --fan_diameter 120 --filters 1');
        console.log('  node test/test.js regularbox --x 100 --y 200 -o custom.svg');
        process.exit(1);
    }
    
    const { genericOptions, generatorArgs } = parseArguments(args.slice(1));
    
    if (generatorName === 'all') {
        await testAll(genericOptions);
    } else if (generatorName === 'list') {
        await listGenerators();
    } else {
        await testGenerator(generatorName, genericOptions, generatorArgs);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
