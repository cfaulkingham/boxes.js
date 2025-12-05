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
 *   node test/test.js airpurifier
 *   node test/test.js regularbox --output custom.svg
 *   node test/test.js all  # Test all generators
 */

// Parse command line arguments
const args = process.argv.slice(2);
const generatorName = args[0];
const options = parseOptions(args.slice(1));

// Generator-specific configurations
// Add any generator that needs special property setup here
const GENERATOR_CONFIGS = {
    airpurifier: {
        properties: {
            fan_diameter: 140.0,
            rim: 30.0,
            filter_height: 46.77,
            filters: 2,
            fans_left: -1,
            fans_right: -1,
            fans_top: 0,
            fans_bottom: 0,
            screw_holes: 5.0,
            split_frames: true
        }
    },
    abox: {
        properties: {},
        setup: (box) => {
            // Custom setup for abox if needed
            if (box.lidSettings && box.lidSettings.values) {
                box.lidSettings.values.style = "overthetop";
            }
        }
    }
    // Add more generator-specific configs as needed
};

function parseOptions(args) {
    const opts = {
        output: null,
        verbose: false,
        debug: false
    };
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--output' || args[i] === '-o') {
            opts.output = args[++i];
        } else if (args[i] === '--verbose' || args[i] === '-v') {
            opts.verbose = true;
        } else if (args[i] === '--debug' || args[i] === '-d') {
            opts.debug = true;
        }
    }
    
    return opts;
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

async function testGenerator(name, opts = {}) {
    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${name}`);
        console.log('='.repeat(60));
        
        // Load the generator class
        const GeneratorClass = await loadGenerator(name);
        
        // Create instance
        const box = new GeneratorClass();
        
        // Apply generator-specific configuration
        const config = GENERATOR_CONFIGS[name] || {};
        
        if (config.properties) {
            Object.assign(box, config.properties);
            if (opts.verbose) {
                console.log('Applied properties:', config.properties);
            }
        }
        
        // Parse arguments
        box.parseArgs({});
        
        // Open the box
        box.open();
        
        // Run custom setup if provided
        if (config.setup) {
            config.setup(box);
            if (opts.verbose) {
                console.log('Ran custom setup function');
            }
        }
        
        // Debug mode - add method tracing
        if (opts.debug) {
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
        if (opts.verbose) {
            console.log('Rendering...');
        }
        box.render();
        
        // Close and get SVG
        const svg = box.close();
        
        // Determine output path
        const outputPath = opts.output || path.join(__dirname, `${name}.svg`);
        
        // Write to file
        fs.writeFileSync(outputPath, svg);
        
        console.log(`✓ Successfully generated SVG: ${outputPath}`);
        console.log(`  SVG size: ${svg.length} bytes`);
        
        return { success: true, name, outputPath };
        
    } catch (e) {
        console.error(`✗ Error generating ${name}:`, e.message);
        if (opts.verbose) {
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

async function testAll(opts = {}) {
    const generators = await getAllGenerators();
    console.log(`Found ${generators.length} generators to test\n`);
    
    const results = [];
    for (const name of generators) {
        const result = await testGenerator(name, opts);
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
}

// Main execution
async function main() {
    if (!generatorName) {
        console.log('Usage: node test/test.js <generator-name> [options]');
        console.log('\nOptions:');
        console.log('  --output, -o <path>   Output SVG file path');
        console.log('  --verbose, -v         Verbose output');
        console.log('  --debug, -d           Debug mode with method tracing');
        console.log('\nSpecial commands:');
        console.log('  node test/test.js all      Test all generators');
        console.log('  node test/test.js list     List all available generators');
        console.log('\nExamples:');
        console.log('  node test/test.js abox');
        console.log('  node test/test.js regularbox -o custom.svg');
        console.log('  node test/test.js airpurifier --verbose');
        process.exit(1);
    }
    
    if (generatorName === 'all') {
        await testAll(options);
    } else if (generatorName === 'list') {
        await listGenerators();
    } else {
        await testGenerator(generatorName, options);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
