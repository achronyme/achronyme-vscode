# Achronyme Language Information for VS Code Extension

Language: Achronyme (Scientific Operations Calculator - SOC)
Version: Based on grammar.pest and current evaluator implementation

## File Extension

- .soc - Achronyme source files
- .ach - Achronyme Archive files (environment snapshots)

## Keywords

### Control Flow & Declarations
- let - Immutable variable declaration
- mut - Mutable variable declaration
- if - Conditional expression
- else - Else clause
- while - While loop expression
- for - For-in loop
- in - Used in for-in loops
- return - Return early from function
- yield - Yield value from generator
- generate - Generator block declaration
- do - Do block

### Functions & Modules
- import - Import from module
- from - Specify module path
- export - Export definitions
- as - Alias in import/export

### Types & Special
- type - Type alias declaration
- self - Reference to current record
- rec - Recursive reference for lambda
- true - Boolean true
- false - Boolean false
- null - Null value

## Operators

### Assignment & Lambda
- = - Variable assignment
- => - Lambda/function definition

### Arithmetic
- + - Addition / String concatenation
- - - Subtraction / Negation (unary)
- * - Multiplication
- / - Division
- % - Modulo
- ^ - Power (right-associative)

### Comparison
- == - Equality
- != - Inequality
- > - Greater than
- < - Less than
- >= - Greater than or equal
- <= - Less than or equal

### Logical
- && - Logical AND
- || - Logical OR
- ! - Logical NOT (unary)

### Special
- -> - Directed edge
- <> - Undirected edge
- . - Field access
- : - Type annotation / Field separator
- | - Union type annotation
- ... - Spread operator
- .. - Range operator

## Types

### Basic Types
- Number - Floating-point numbers (64-bit)
- Boolean - true or false
- String - Text values
- Complex - Complex numbers
- Vector - 1D array (legacy)
- Tensor - N-dimensional arrays
- Generator - Lazy generator
- Edge - Graph edge
- Any - Opt-out of type checking
- null - Null value

## Built-in Functions

### Math Functions
sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh
exp, ln, log, log10, log2, sqrt, cbrt, pow
floor, ceil, round, trunc, abs, sign, deg, rad, min, max

### Complex Numbers
complex, real, imag, conj, arg

### Vector Operations
dot, cross, norm, normalize

### Matrix Operations
transpose, det, trace

### Array Operations
len, range, product, reverse, zip, flatten, take, drop, slice, unique, chunk, contains

### Higher-Order Functions
map, filter, reduce, pipe, any, all, find, findIndex, count

### Statistics
sum, mean, std

### String Operations
concat, length, upper, lower, trim, trim_start, trim_end
starts_with, ends_with, replace, split, join, pad_start, pad_end

### Record Operations
keys, values, has_field

### Utilities
print, typeof, str

### Environment
save_env, restore_env, env_info

### Numerical Analysis
diff, diff2, diff3, gradient, integral, trapz, simpson, romberg, quad, solve, bisect, newton, secant

### Signal Processing
fft, ifft, fft_mag, fft_phase, conv, conv_fft
hanning, hamming, blackman, rectangular, linspace

### Graph Functions
network, nodes, edges, neighbors, degree, bfs, dfs, bfs_path
dijkstra, has_cycle, kruskal, prim, connected_components, is_connected, topological_sort

### PERT/CPM
forward_pass, backward_pass, calculate_slack, critical_path, all_critical_paths

### Optimization
simplex, linprog, dual_simplex, two_phase_simplex, revised_simplex
objective_value, shadow_price, sensitivity_c, sensitivity_b

## Constants

Mathematical constants (case-insensitive):
- PI / pi - 3.14159265358979
- E / e - 2.71828182845904
- PHI / phi - 1.61803398874989
- SQRT2 / sqrt2 - 1.41421356237309
- SQRT3 / sqrt3 - 1.73205080756887
- LN2 / ln2 - 0.69314718055994
- LN10 / ln10 - 2.30258509299404

## Literals

### Numbers
42, 3.14, -17, 1.5e-10, 2.5E+3

### Complex Numbers
3i, -2i, 2 + 3i

### Strings
"hello world"

### Booleans
true, false

### Null
null

### Arrays/Tensors
[1, 2, 3], [[1, 2], [3, 4]], [0, ...vec, 3], []

### Records/Objects
{ x: 10, y: 20 }, { name: "Alice", age: 30 }, {}

### Edges
A -> B, A <> B, A -> B : {weight: 5}

## Comments

Single-line comments only:
// This is a comment

## Special Syntax

### Lambda Functions
x => x * 2
(x, y) => x + y
() => 42
x => do { let y = x * 2; y + 10 }
x => y => x + y
(x: Number, y: Number): Number => x + y

### Type Annotations
let x: Number = 42
let name: String = "Alice"
let optional: Number | null = null
let items: Tensor<Number, [3]> = [1, 2, 3]

### Conditionals
if(x > 0) { "positive" } else { "zero" }

### While Loops
mut counter = 0
while(counter < 10) { print(counter); counter = counter + 1 }

### For-In Loops
for(item in [1, 2, 3]) { print(item) }

### Do Blocks
let result = do { let a = 10; let b = 20; a + b }

### Generator Functions
let gen = generate { yield 1; yield 2; yield 3 }

### Array Indexing & Slicing
arr[0]      # First element
arr[1..3]   # From index 1 to 2
arr[1..]    # From index 1 to end
arr[..3]    # From start to index 2

### Field Access
record.fieldName        # Access field
record.fieldName = 20   # Modify field

### Type Aliases
type Point = { x: Number, y: Number }
type Result = Success | Error
type OptionalNumber = Number | null

### Import/Export
import { sin, cos, tan } from "math"
import { mean as average } from "stats"
export { calculate, process }

## Operator Precedence (High to Low)

1. Member access (.), Indexing ([]), Function calls (())
2. Unary operators (-, !)
3. Power (^) - Right-associative
4. Multiplicative (*, /, %)
5. Additive (+, -)
6. Edges (->, <>)
7. Comparison (>, <, >=, <=, ==, !=)
8. Logical AND (&&)
9. Logical OR (||)
10. Assignment (=), Lambda (=>)

## Special Behavior

### Recursive Functions with rec
let factorial = n => if(n <= 1) { 1 } else { n * rec(n - 1) }

### Mutable Variables
mut counter = 0
counter = counter + 1

### Mutable Record Fields
let obj = { mut value: 10, name: "test" }
obj.value = 20

### Early Return
let validate = x => do {
    if(x < 0) { return "negative" }
    return "positive"
}

## Module System

Built-in Modules:
- math - Mathematical functions
- stats - Statistical functions
- array - Array operations
- string - String functions
- record - Record operations
- vector - Vector operations
- matrix - Matrix operations
- graph - Graph algorithms
- dsp - Digital signal processing

User-defined modules use relative paths like "./utils" or "../helpers"

## Whitespace & Separators

Whitespace Rules:
- Spaces, tabs, carriage returns are ignored
- Newlines are SIGNIFICANT for statement separation

Statement Separation:
let a = 1; let b = 2          # Semicolon
let a = 1
let b = 2                      # Newline

## Performance Tips

- Use Tensors instead of Vectors for bulk operations
- Use FFT-based convolution for large signals
- Tail Call Optimization is automatically applied
- Generators support lazy evaluation

---

Reference: Achronyme language specification
Based on grammar.pest and evaluator implementation
Maintained by: Achronyme Development Team
