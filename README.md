# Achronyme SOC Language Support

VS Code extension for the Achronyme SOC (Scientific Operations Calculator) language.

## Features

- **Syntax Highlighting** - Full syntax coloring for keywords, operators, types, functions, and literals
- **Autocompletion** - Intelligent suggestions for keywords, types, built-in functions, and constants
- **Snippets** - Code templates for common patterns (lambdas, loops, records, etc.)
- **Bracket Matching** - Auto-closing and matching for `{}`, `[]`, `()`
- **Comment Support** - Toggle line comments with `Ctrl+/`

## Supported File Extensions

- `.soc` - Achronyme source files
- `.ach` - Achronyme archive files

## Language Features

- Arithmetic expressions with proper precedence
- Boolean literals and logical operators
- Comparison operators
- Conditional expressions
- Lambda functions with closures and type annotations
- Vectors, matrices, and tensors
- Records with mutable fields
- Generator functions
- Graph edges and networks
- Module system with imports/exports
- Gradual typing system

## Installation

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

## Usage Examples

```soc
// Variable declarations
let x: Number = 42
mut counter = 0

// Lambda functions
let square = x => x^2
let add = (a: Number, b: Number): Number => a + b

// Higher-order functions
let doubled = map([1, 2, 3], x => x * 2)

// Records
let point = { x: 10, mut y: 20 }

// Control flow
if(x > 0) {
    "positive"
} else {
    "non-positive"
}

// Generators
let gen = generate {
    yield 1
    yield 2
    yield 3
}

// Graph operations
let graph = network([
    A -> B : { weight: 5 },
    B -> C : { weight: 3 }
])
```

## Built-in Functions

The extension provides autocompletion for 100+ built-in functions including:

- **Math**: sin, cos, tan, exp, ln, sqrt, pow, etc.
- **Array**: map, filter, reduce, len, range, etc.
- **Statistics**: sum, mean, std
- **String**: concat, split, join, upper, lower, etc.
- **Graph**: network, dijkstra, bfs, dfs, etc.
- **DSP**: fft, ifft, conv, linspace, etc.
- **Optimization**: simplex, linprog, etc.

## License

MIT
