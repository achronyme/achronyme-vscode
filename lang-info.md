# Achronyme Language Reference Guide

This document provides comprehensive documentation of the Achronyme language features, including syntax, types, and control flow constructs.

## Keywords

Achronyme reserves the following keywords:

- **Variable Declaration**: `let`, `mut`, `rec`
- **Type System**: `type`
- **Control Flow**: `if`, `while`, `for`, `in`, `match`
- **Error Handling**: `try`, `catch`, `throw`
- **Functions**: `return`, `yield`
- **Scope/Reference**: `self`
- **Modules**: `import`, `from`, `export`, `as`
- **Boolean Literals**: `true`, `false`

## Types

### Primitive Types

| Type | Description | Example |
|------|-------------|---------|
| `Number` | 64-bit floating point | `42`, `3.14`, `1.5e-10` |
| `Boolean` | Boolean value | `true`, `false` |
| `String` | Text string | `"hello"`, `"world"` |
| `Complex` | Complex number | `3i`, `2+3i` |
| `Null` | Null/absence value | `null` |
| `Error` | Error value | (see Error Handling section) |

### Composite Types

| Type | Description | Example |
|------|-------------|---------|
| `Vector` | 1D array | `[1, 2, 3]` |
| `Tensor` | N-dimensional array | `[[1, 2], [3, 4]]` |
| `Record` | Key-value object | `{ name: "Alice", age: 30 }` |
| `Edge` | Graph edge | `A -> B`, `A -- B` |
| `Generator` | Suspended function | (created with `generate` block) |
| `Function` | Callable function | (lambdas and built-in functions) |

## Pattern Matching

Pattern matching is a powerful way to destructure and conditionally branch on values.

### Match Expression Syntax

```achronyme
match value {
    pattern1 => expression1,
    pattern2 => expression2,
    _ => default_expression
}
```

### Pattern Types

#### 1. Literal Patterns
Match exact values:

```achronyme
let x = 42
match x {
    0 => "zero",
    42 => "answer",
    100 => "hundred",
    _ => "other"
}
```

#### 2. Variable Pattern
Bind the matched value to a variable:

```achronyme
let x = 10
match x {
    n => n * 2  // Binds x to n, returns 20
}
```

#### 3. Wildcard Pattern
Match anything without binding:

```achronyme
match x {
    10 => "ten",
    20 => "twenty",
    _ => "something else"  // Matches anything else
}
```

#### 4. Type Pattern
Match by runtime type:

```achronyme
match value {
    Number => "it's a number",
    String => "it's a string",
    Boolean => "it's a boolean",
    Vector => "it's a vector",
    Record => "it's a record",
    Error => "it's an error",
    Null => "it's null",
    _ => "something else"
}
```

#### 5. Record Pattern
Destructure object fields:

```achronyme
let person = { name: "Alice", age: 30, city: "Madrid" }

// Full destructuring
match person {
    { name: n, age: a } => n + " is " + str(a)
}

// Partial match (only match required fields)
match person {
    { name: n } => n
}

// Shorthand (name: name becomes name)
match person {
    { name, age } => name
}
```

#### 6. Vector Pattern
Destructure and match arrays:

```achronyme
let list = [1, 2, 3]

// Empty array
match list {
    [] => "empty"
}

// Single element
match list {
    [x] => x * 2
}

// Multiple elements
match list {
    [x, y, z] => x + y + z
}

// Head and tail with rest pattern
match list {
    [head, ...tail] => head  // head=1, tail=[2,3]
}

// Multiple elements before rest
match list {
    [a, b, ...rest] => a + b
}

// Elements after rest
match list {
    [first, ...middle, last] => last
}
```

### Guard Clauses

Add conditions to patterns with `if` guards:

```achronyme
let x = 15
match x {
    n if (n > 10) => "big",
    n if (n > 5) => "medium",
    _ => "small"
}
```

## Error Handling

### Throw Statement

Throw errors that can be caught by try/catch:

```achronyme
throw "Simple error message"
throw { message: "Custom error", kind: "ValueError" }
```

Examples:

```achronyme
let divide = (a, b) => {
    if (b == 0) {
        throw "Division by zero"
    } else {
        a / b
    }
}

throw "File not found"
throw { message: "Invalid input", kind: "TypeError" }
```

### Try-Catch Expression

Catch and handle errors:

```achronyme
try {
    // Code that might throw
    dangerous_operation()
} catch (error) {
    // Handle error
    // 'error' is bound to the caught Error value
    error.message
}
```

Basic Example:

```achronyme
try {
    let result = divide(10, 0)
    result
} catch (err) {
    "Error occurred"
}
```

Accessing Error Properties:

```achronyme
try {
    risky_function()
} catch (error) {
    // error is an Error value with properties:
    // - message: String (required)
    // - kind: String | null (optional, e.g., "TypeError")
    // - source: Value | null (optional, nested error)
    
    if (error.kind == "ValueError") {
        "Value error: " + error.message
    } else if (error.kind == "TypeError") {
        "Type error: " + error.message
    } else {
        "Unknown error: " + error.message
    }
}
```

Re-throwing Errors:

```achronyme
try {
    operation()
} catch (error) {
    if (error.message.contains("critical")) {
        throw error  // Re-throw the same error
    } else {
        "handled non-critical error"
    }
}
```

### Error Type

The `Error` type represents error values with the following structure:

```achronyme
Error {
    message: String,           // Required: error description
    kind: String | null,       // Optional: error category
    source: Error | null       // Optional: nested/wrapped error
}
```

Using Errors in Pattern Matching:

```achronyme
try {
    operation()
} catch (err) {
    match err {
        { message: m, kind: "ValueError" } => "Value error: " + m,
        { message: m, kind: "TypeError" } => "Type error: " + m,
        { message: m } => "Error: " + m
    }
}
```

Error in Type Pattern:

```achronyme
match value {
    Error => "It's an error",
    _ => "Not an error"
}
```

## Generators

### Generate Block

Create a generator function:

```achronyme
let myGenerator = () => generate {
    yield 1
    yield 2
    yield 3
}
```

### Yield Statement

Suspend generator and return value:

```achronyme
generate {
    yield "first"
    yield "second"
    yield "third"
}
```

### Consuming Generators

With `.next()` method:

```achronyme
let gen = myGenerator()
let result1 = gen.next()  // { value: 1, done: false }
let result2 = gen.next()  // { value: 2, done: false }
let result3 = gen.next()  // { value: 3, done: false }
let result4 = gen.next()  // { value: null, done: true }
```

With for-in loop:

```achronyme
for (value in myGenerator()) {
    // value = 1, then 2, then 3
}
```

## Type System

### Type Annotations

Type annotations support gradual typing:

```achronyme
let x: Number = 42
let message: String = "hello"
let flag: Boolean = true
let optional: Number | null = 10
```

### Type Aliases

```achronyme
type Point = {x: Number, y: Number}
type Status = "success" | "error" | "pending"
type OptionalNumber = Number | null
```

### Union Types

```achronyme
let value: Number | String = 42
let maybe: Number | null = null
```

## Summary of New Features

### Pattern Matching
- Complete destructuring of values (records, vectors, scalars)
- Type pattern matching
- Guard clauses with conditions
- Wildcard and variable binding patterns
- Rest patterns in vectors

### Error Handling
- Throw statement for raising errors
- Try-catch blocks for error handling
- Error type with message, kind, and source fields
- Integration with pattern matching
- Error re-throwing and nesting

### Enhanced Type System
- Gradual typing with optional annotations
- Union types for flexible data
- Type aliases for named types
- Tensor type annotations with shape specs
- Function type annotations

### Generators
- Generate blocks for lazy computation
- Yield statement for suspension points
- Iterator protocol with next() method
- For-in loop support for generators
