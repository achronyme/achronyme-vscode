# Achronyme SOC Language Support

Full-featured VS Code extension for the Achronyme SOC (Scientific Operations Calculator) language with integrated Language Server Protocol (LSP) support.

## Features

### Language Server Protocol (LSP) Features

The extension provides comprehensive language support through the Achronyme LSP server:

- **Code Completion (151 items)** - Intelligent autocompletion with full documentation
  - 109 built-in functions (math, arrays, statistics, signal processing, linear algebra, etc.)
  - 19 keywords
  - 14 types
  - 9 constants

- **Signature Help (56+ signatures)** - Parameter hints and documentation while typing function calls

- **Code Formatting** - Automatic code formatting with:
  - Operator spacing normalization
  - Consistent indentation (4 spaces)
  - Brace alignment
  - Comma spacing

- **Diagnostics** - Real-time error detection and reporting
  - Parse error detection
  - Syntax error highlighting
  - Clear error messages with location

- **Navigation**
  - Go to Definition (F12)
  - Find All References (Shift+F12)
  - Symbol navigation

- **Hover Information** - Rich documentation on mouse hover
  - Function signatures
  - Parameter descriptions
  - Usage examples
  - Type information

- **Document Symbols** - Outline view of variables and types in your code

### Basic Features

- **Syntax Highlighting** - Full syntax coloring for keywords, operators, types, functions, and literals
- **Snippets** - Code templates for common patterns (lambdas, loops, records, etc.)
- **Bracket Matching** - Auto-closing and matching for `{}`, `[]`, `()`
- **Comment Support** - Toggle line comments with `Ctrl+/`
- **File Icons** - Custom icons for `.soc` and `.ach` files

## Supported File Extensions

- `.soc` - Achronyme source files
- `.ach` - Achronyme archive files

## Installation

The extension will automatically download and install the Achronyme Language Server on first use.

### From Source

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to launch Extension Development Host

### Package as VSIX

```bash
npm install -g @vscode/vsce
vsce package
```

Then install the generated `.vsix` file.

## Configuration

The extension can be configured in VS Code settings:

- `achronyme.lsp.enabled` - Enable/disable the Language Server (default: `true`)
- `achronyme.lsp.serverPath` - Custom path to achronyme-lsp executable (default: auto-download)
- `achronyme.lsp.debug` - Enable debug logging (default: `false`)

## Usage

### Code Completion

Press `Ctrl+Space` to trigger code completion. The LSP provides context-aware suggestions:

```soc
// Type "ma" and see completions:
map       // Map over array
max       // Maximum value
match     // Pattern matching
mean      // Arithmetic mean
```

### Signature Help

Type `(` after a function name to see parameter hints:

```soc
map(|  // Shows: map(f: Function, arr: Array) -> Array
```

### Code Formatting

Format your code with `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (macOS).

**Before:**
```soc
let x=a+b*c-d/e
let data=[1,2,3,4,5]
```

**After:**
```soc
let x = a + b * c - d / e
let data = [1, 2, 3, 4, 5]
```

### Navigation

- **Go to Definition**: Click on a symbol and press `F12`
- **Find References**: Right-click and select "Find All References" or press `Shift+F12`
- **Hover**: Move your mouse over any symbol to see documentation

## Language Features

- Arithmetic expressions with proper precedence
- Boolean literals and logical operators
- Comparison operators
- Conditional expressions (if/else)
- Lambda functions with closures and type annotations
- Vectors, matrices, and tensors
- Records with mutable fields
- Generator functions with yield
- Graph edges and networks
- Module system with imports/exports
- Pattern matching
- Exception handling (try/catch/throw)
- Gradual typing system

## Built-in Functions

The LSP provides autocompletion and documentation for 109 built-in functions:

### Mathematical Functions (25+)
- **Trigonometric**: sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh
- **Exponential/Logarithmic**: exp, ln, log, log10, log2
- **Rounding**: floor, ceil, round, abs
- **Power**: pow, sqrt, cbrt
- **Comparison**: min, max

### Array Functions (20+)
- **Higher-order**: map, filter, reduce, pipe, any, all, find, findIndex, count
- **Manipulation**: push, pop, shift, unshift, reverse, flatten, slice
- **Properties**: len, range, product, zip, take, drop, unique, chunk, contains

### Statistical Functions (10+)
- mean, median, std, variance, quantile, covariance, correlation, histogram, frequencies

### Signal Processing (15+)
- fft, ifft, convolve, correlate
- Window functions: hann, hamming, blackman, bartlett

### Linear Algebra (20+)
- dot, cross, norm, normalize
- det, inv, transpose
- eigenvalues, eigenvectors
- solve (linear systems)

### Numerical Analysis (10+)
- diff (numerical differentiation)
- integral (numerical integration)
- newton_raphson, bisect, secant (root finding)

### Graph Theory (10+)
- dijkstra, bfs, dfs
- kruskal, prim
- topological_sort

### String Functions
- concat, split, join, upper, lower, trim
- starts_with, ends_with, replace
- length

### Utility Functions
- print, typeof, str
- save_env, restore_env, env_info

## Usage Examples

```soc
// Variable declarations
let x: Number = 42
mut counter = 0

// Lambda functions
let square = x => x^2
let add = (a: Number, b: Number): Number => a + b

// Higher-order functions
let doubled = map(x => x * 2, [1, 2, 3])  // [2, 4, 6]
let evens = filter(x => x % 2 == 0, [1, 2, 3, 4])  // [2, 4]

// Records
let point = { x: 10, mut y: 20 }
point.y = 30

// Control flow
let result = if(x > 0) {
    "positive"
} else {
    "non-positive"
}

// Pattern matching
let describe = x => match x {
    0 => "zero"
    n if (n < 0) => "negative"
    _ => "positive"
}

// Generators
let fibonacci = generate {
    mut a = 0
    mut b = 1
    while(true) {
        yield a
        let temp = a + b
        a = b
        b = temp
    }
}

// Graph operations
let graph = network([
    A -> B : { weight: 5 },
    B -> C : { weight: 3 }
])
let path = dijkstra(graph, A, C)

// Exception handling
try {
    let result = riskyOperation()
    print(result)
} catch(e) {
    print("Error: " + str(e))
}
```

## Commands

- `Achronyme: Restart Language Server` - Restart the LSP server

## Status Bar

The extension shows the Language Server status in the status bar:
- 🔄 (spinning) - Server is starting
- ✓ (check) - Server is active and ready
- ⚠ (warning) - Server not available
- ✗ (error) - Server failed to start
- 🚫 (disabled) - Server is disabled

Click the status bar item to restart the Language Server.

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Code Completion | `Ctrl+Space` | `Cmd+Space` |
| Signature Help | `Ctrl+Shift+Space` | `Cmd+Shift+Space` |
| Format Document | `Shift+Alt+F` | `Shift+Option+F` |
| Go to Definition | `F12` | `F12` |
| Find References | `Shift+F12` | `Shift+F12` |
| Toggle Comment | `Ctrl+/` | `Cmd+/` |

## Troubleshooting

### Language Server not starting

1. Check the Output panel (`View > Output`) and select "Achronyme Language Server"
2. Verify the server path in settings: `achronyme.lsp.serverPath`
3. Try restarting the server: `Ctrl+Shift+P` → "Achronyme: Restart Language Server"
4. Enable debug mode: Set `achronyme.lsp.debug` to `true` in settings

### No code completion

1. Ensure the LSP server is running (check status bar)
2. Make sure the file has a `.soc` or `.ach` extension
3. Try triggering completion manually with `Ctrl+Space`

### Formatting not working

1. Check if the LSP server is active
2. Try formatting manually: `Shift+Alt+F`
3. Check for syntax errors in the file (they may prevent formatting)

## Links

- [GitHub Repository](https://github.com/achronyme/achronyme-vscode)
- [Achronyme Core](https://github.com/achronyme/achronyme-core)
- [LSP Documentation](./lsp/README.md)

## License

MIT
