#!/bin/bash

# Batch test script - test multiple specific generators
# Usage: ./test/test-batch.sh

echo "Testing common generators..."
echo

generators=(
    "abox"
    "bayonetbox"
    "regularbox"
    "airpurifier"
)

success=0
failed=0

for gen in "${generators[@]}"; do
    echo "Testing $gen..."
    if node test/test.js "$gen" 2>&1 | grep -q "Successfully generated"; then
        ((success++))
        echo "  ✓ $gen passed"
    else
        ((failed++))
        echo "  ✗ $gen failed"
    fi
    echo
done

echo "========================================"
echo "Results: $success passed, $failed failed"
echo "========================================"
