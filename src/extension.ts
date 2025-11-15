import * as vscode from 'vscode';

const KEYWORDS = [
    { label: 'let', kind: vscode.CompletionItemKind.Keyword, detail: 'Immutable variable declaration' },
    { label: 'mut', kind: vscode.CompletionItemKind.Keyword, detail: 'Mutable variable declaration' },
    { label: 'if', kind: vscode.CompletionItemKind.Keyword, detail: 'Conditional expression' },
    { label: 'else', kind: vscode.CompletionItemKind.Keyword, detail: 'Else clause' },
    { label: 'while', kind: vscode.CompletionItemKind.Keyword, detail: 'While loop' },
    { label: 'for', kind: vscode.CompletionItemKind.Keyword, detail: 'For-in loop' },
    { label: 'in', kind: vscode.CompletionItemKind.Keyword, detail: 'Used in for-in loops' },
    { label: 'return', kind: vscode.CompletionItemKind.Keyword, detail: 'Return from function' },
    { label: 'yield', kind: vscode.CompletionItemKind.Keyword, detail: 'Yield from generator' },
    { label: 'generate', kind: vscode.CompletionItemKind.Keyword, detail: 'Generator block' },
    { label: 'do', kind: vscode.CompletionItemKind.Keyword, detail: 'Do block' },
    { label: 'import', kind: vscode.CompletionItemKind.Keyword, detail: 'Import from module' },
    { label: 'from', kind: vscode.CompletionItemKind.Keyword, detail: 'Module path' },
    { label: 'export', kind: vscode.CompletionItemKind.Keyword, detail: 'Export definitions' },
    { label: 'as', kind: vscode.CompletionItemKind.Keyword, detail: 'Import alias' },
    { label: 'type', kind: vscode.CompletionItemKind.Keyword, detail: 'Type alias declaration' },
    { label: 'self', kind: vscode.CompletionItemKind.Keyword, detail: 'Reference to current record' },
    { label: 'rec', kind: vscode.CompletionItemKind.Keyword, detail: 'Recursive reference' },
    { label: 'true', kind: vscode.CompletionItemKind.Constant, detail: 'Boolean true' },
    { label: 'false', kind: vscode.CompletionItemKind.Constant, detail: 'Boolean false' },
    { label: 'null', kind: vscode.CompletionItemKind.Constant, detail: 'Null value' },
];

const TYPES = [
    { label: 'Number', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Floating-point number type' },
    { label: 'Boolean', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Boolean type' },
    { label: 'String', kind: vscode.CompletionItemKind.TypeParameter, detail: 'String type' },
    { label: 'Complex', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Complex number type' },
    { label: 'Vector', kind: vscode.CompletionItemKind.TypeParameter, detail: '1D array type' },
    { label: 'Tensor', kind: vscode.CompletionItemKind.TypeParameter, detail: 'N-dimensional array type' },
    { label: 'Generator', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Generator type' },
    { label: 'Edge', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Graph edge type' },
    { label: 'Any', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Opt-out of type checking' },
];

const CONSTANTS = [
    { label: 'PI', kind: vscode.CompletionItemKind.Constant, detail: '3.14159265358979' },
    { label: 'E', kind: vscode.CompletionItemKind.Constant, detail: '2.71828182845904' },
    { label: 'PHI', kind: vscode.CompletionItemKind.Constant, detail: '1.61803398874989 (Golden ratio)' },
    { label: 'SQRT2', kind: vscode.CompletionItemKind.Constant, detail: '1.41421356237309' },
    { label: 'SQRT3', kind: vscode.CompletionItemKind.Constant, detail: '1.73205080756887' },
    { label: 'LN2', kind: vscode.CompletionItemKind.Constant, detail: '0.69314718055994' },
    { label: 'LN10', kind: vscode.CompletionItemKind.Constant, detail: '2.30258509299404' },
];

const BUILTIN_FUNCTIONS = [
    // Math
    { label: 'sin', kind: vscode.CompletionItemKind.Function, detail: 'sin(x) - Sine function', insertText: 'sin($1)' },
    { label: 'cos', kind: vscode.CompletionItemKind.Function, detail: 'cos(x) - Cosine function', insertText: 'cos($1)' },
    { label: 'tan', kind: vscode.CompletionItemKind.Function, detail: 'tan(x) - Tangent function', insertText: 'tan($1)' },
    { label: 'asin', kind: vscode.CompletionItemKind.Function, detail: 'asin(x) - Arc sine', insertText: 'asin($1)' },
    { label: 'acos', kind: vscode.CompletionItemKind.Function, detail: 'acos(x) - Arc cosine', insertText: 'acos($1)' },
    { label: 'atan', kind: vscode.CompletionItemKind.Function, detail: 'atan(x) - Arc tangent', insertText: 'atan($1)' },
    { label: 'atan2', kind: vscode.CompletionItemKind.Function, detail: 'atan2(y, x) - Two-argument arc tangent', insertText: 'atan2($1, $2)' },
    { label: 'sinh', kind: vscode.CompletionItemKind.Function, detail: 'sinh(x) - Hyperbolic sine', insertText: 'sinh($1)' },
    { label: 'cosh', kind: vscode.CompletionItemKind.Function, detail: 'cosh(x) - Hyperbolic cosine', insertText: 'cosh($1)' },
    { label: 'tanh', kind: vscode.CompletionItemKind.Function, detail: 'tanh(x) - Hyperbolic tangent', insertText: 'tanh($1)' },
    { label: 'exp', kind: vscode.CompletionItemKind.Function, detail: 'exp(x) - Exponential function', insertText: 'exp($1)' },
    { label: 'ln', kind: vscode.CompletionItemKind.Function, detail: 'ln(x) - Natural logarithm', insertText: 'ln($1)' },
    { label: 'log', kind: vscode.CompletionItemKind.Function, detail: 'log(x, base) - Logarithm', insertText: 'log($1, $2)' },
    { label: 'log10', kind: vscode.CompletionItemKind.Function, detail: 'log10(x) - Base-10 logarithm', insertText: 'log10($1)' },
    { label: 'log2', kind: vscode.CompletionItemKind.Function, detail: 'log2(x) - Base-2 logarithm', insertText: 'log2($1)' },
    { label: 'sqrt', kind: vscode.CompletionItemKind.Function, detail: 'sqrt(x) - Square root', insertText: 'sqrt($1)' },
    { label: 'cbrt', kind: vscode.CompletionItemKind.Function, detail: 'cbrt(x) - Cube root', insertText: 'cbrt($1)' },
    { label: 'pow', kind: vscode.CompletionItemKind.Function, detail: 'pow(base, exp) - Power function', insertText: 'pow($1, $2)' },
    { label: 'floor', kind: vscode.CompletionItemKind.Function, detail: 'floor(x) - Round down', insertText: 'floor($1)' },
    { label: 'ceil', kind: vscode.CompletionItemKind.Function, detail: 'ceil(x) - Round up', insertText: 'ceil($1)' },
    { label: 'round', kind: vscode.CompletionItemKind.Function, detail: 'round(x) - Round to nearest', insertText: 'round($1)' },
    { label: 'trunc', kind: vscode.CompletionItemKind.Function, detail: 'trunc(x) - Truncate decimal', insertText: 'trunc($1)' },
    { label: 'abs', kind: vscode.CompletionItemKind.Function, detail: 'abs(x) - Absolute value', insertText: 'abs($1)' },
    { label: 'sign', kind: vscode.CompletionItemKind.Function, detail: 'sign(x) - Sign of number', insertText: 'sign($1)' },
    { label: 'deg', kind: vscode.CompletionItemKind.Function, detail: 'deg(rad) - Radians to degrees', insertText: 'deg($1)' },
    { label: 'rad', kind: vscode.CompletionItemKind.Function, detail: 'rad(deg) - Degrees to radians', insertText: 'rad($1)' },
    { label: 'min', kind: vscode.CompletionItemKind.Function, detail: 'min(a, b) - Minimum value', insertText: 'min($1, $2)' },
    { label: 'max', kind: vscode.CompletionItemKind.Function, detail: 'max(a, b) - Maximum value', insertText: 'max($1, $2)' },

    // Complex
    { label: 'complex', kind: vscode.CompletionItemKind.Function, detail: 'complex(real, imag) - Create complex number', insertText: 'complex($1, $2)' },
    { label: 'real', kind: vscode.CompletionItemKind.Function, detail: 'real(z) - Real part', insertText: 'real($1)' },
    { label: 'imag', kind: vscode.CompletionItemKind.Function, detail: 'imag(z) - Imaginary part', insertText: 'imag($1)' },
    { label: 'conj', kind: vscode.CompletionItemKind.Function, detail: 'conj(z) - Complex conjugate', insertText: 'conj($1)' },
    { label: 'arg', kind: vscode.CompletionItemKind.Function, detail: 'arg(z) - Argument of complex', insertText: 'arg($1)' },

    // Vector
    { label: 'dot', kind: vscode.CompletionItemKind.Function, detail: 'dot(a, b) - Dot product', insertText: 'dot($1, $2)' },
    { label: 'cross', kind: vscode.CompletionItemKind.Function, detail: 'cross(a, b) - Cross product', insertText: 'cross($1, $2)' },
    { label: 'norm', kind: vscode.CompletionItemKind.Function, detail: 'norm(v) - Vector norm', insertText: 'norm($1)' },
    { label: 'normalize', kind: vscode.CompletionItemKind.Function, detail: 'normalize(v) - Unit vector', insertText: 'normalize($1)' },

    // Matrix
    { label: 'transpose', kind: vscode.CompletionItemKind.Function, detail: 'transpose(m) - Matrix transpose', insertText: 'transpose($1)' },
    { label: 'det', kind: vscode.CompletionItemKind.Function, detail: 'det(m) - Matrix determinant', insertText: 'det($1)' },
    { label: 'trace', kind: vscode.CompletionItemKind.Function, detail: 'trace(m) - Matrix trace', insertText: 'trace($1)' },

    // Array
    { label: 'len', kind: vscode.CompletionItemKind.Function, detail: 'len(arr) - Array length', insertText: 'len($1)' },
    { label: 'range', kind: vscode.CompletionItemKind.Function, detail: 'range(start, end, step?) - Create range', insertText: 'range($1, $2)' },
    { label: 'product', kind: vscode.CompletionItemKind.Function, detail: 'product(arr) - Product of elements', insertText: 'product($1)' },
    { label: 'reverse', kind: vscode.CompletionItemKind.Function, detail: 'reverse(arr) - Reverse array', insertText: 'reverse($1)' },
    { label: 'zip', kind: vscode.CompletionItemKind.Function, detail: 'zip(a, b) - Zip arrays together', insertText: 'zip($1, $2)' },
    { label: 'flatten', kind: vscode.CompletionItemKind.Function, detail: 'flatten(arr) - Flatten nested array', insertText: 'flatten($1)' },
    { label: 'take', kind: vscode.CompletionItemKind.Function, detail: 'take(arr, n) - Take first n elements', insertText: 'take($1, $2)' },
    { label: 'drop', kind: vscode.CompletionItemKind.Function, detail: 'drop(arr, n) - Drop first n elements', insertText: 'drop($1, $2)' },
    { label: 'slice', kind: vscode.CompletionItemKind.Function, detail: 'slice(arr, start, end) - Slice array', insertText: 'slice($1, $2, $3)' },
    { label: 'unique', kind: vscode.CompletionItemKind.Function, detail: 'unique(arr) - Remove duplicates', insertText: 'unique($1)' },
    { label: 'chunk', kind: vscode.CompletionItemKind.Function, detail: 'chunk(arr, size) - Split into chunks', insertText: 'chunk($1, $2)' },
    { label: 'contains', kind: vscode.CompletionItemKind.Function, detail: 'contains(arr, elem) - Check if contains', insertText: 'contains($1, $2)' },

    // Higher-order
    { label: 'map', kind: vscode.CompletionItemKind.Function, detail: 'map(arr, fn) - Transform elements', insertText: 'map($1, $2)' },
    { label: 'filter', kind: vscode.CompletionItemKind.Function, detail: 'filter(arr, fn) - Filter elements', insertText: 'filter($1, $2)' },
    { label: 'reduce', kind: vscode.CompletionItemKind.Function, detail: 'reduce(arr, fn, init) - Reduce array', insertText: 'reduce($1, $2, $3)' },
    { label: 'pipe', kind: vscode.CompletionItemKind.Function, detail: 'pipe(val, ...fns) - Pipeline functions', insertText: 'pipe($1, $2)' },
    { label: 'any', kind: vscode.CompletionItemKind.Function, detail: 'any(arr, fn) - Check if any match', insertText: 'any($1, $2)' },
    { label: 'all', kind: vscode.CompletionItemKind.Function, detail: 'all(arr, fn) - Check if all match', insertText: 'all($1, $2)' },
    { label: 'find', kind: vscode.CompletionItemKind.Function, detail: 'find(arr, fn) - Find first match', insertText: 'find($1, $2)' },
    { label: 'findIndex', kind: vscode.CompletionItemKind.Function, detail: 'findIndex(arr, fn) - Find index of match', insertText: 'findIndex($1, $2)' },
    { label: 'count', kind: vscode.CompletionItemKind.Function, detail: 'count(arr, fn) - Count matches', insertText: 'count($1, $2)' },

    // Stats
    { label: 'sum', kind: vscode.CompletionItemKind.Function, detail: 'sum(arr) - Sum of elements', insertText: 'sum($1)' },
    { label: 'mean', kind: vscode.CompletionItemKind.Function, detail: 'mean(arr) - Average value', insertText: 'mean($1)' },
    { label: 'std', kind: vscode.CompletionItemKind.Function, detail: 'std(arr) - Standard deviation', insertText: 'std($1)' },

    // String
    { label: 'concat', kind: vscode.CompletionItemKind.Function, detail: 'concat(a, b) - Concatenate strings', insertText: 'concat($1, $2)' },
    { label: 'length', kind: vscode.CompletionItemKind.Function, detail: 'length(str) - String length', insertText: 'length($1)' },
    { label: 'upper', kind: vscode.CompletionItemKind.Function, detail: 'upper(str) - To uppercase', insertText: 'upper($1)' },
    { label: 'lower', kind: vscode.CompletionItemKind.Function, detail: 'lower(str) - To lowercase', insertText: 'lower($1)' },
    { label: 'trim', kind: vscode.CompletionItemKind.Function, detail: 'trim(str) - Trim whitespace', insertText: 'trim($1)' },
    { label: 'split', kind: vscode.CompletionItemKind.Function, detail: 'split(str, delim) - Split string', insertText: 'split($1, $2)' },
    { label: 'join', kind: vscode.CompletionItemKind.Function, detail: 'join(arr, delim) - Join array to string', insertText: 'join($1, $2)' },
    { label: 'replace', kind: vscode.CompletionItemKind.Function, detail: 'replace(str, old, new) - Replace substring', insertText: 'replace($1, $2, $3)' },
    { label: 'starts_with', kind: vscode.CompletionItemKind.Function, detail: 'starts_with(str, prefix) - Check prefix', insertText: 'starts_with($1, $2)' },
    { label: 'ends_with', kind: vscode.CompletionItemKind.Function, detail: 'ends_with(str, suffix) - Check suffix', insertText: 'ends_with($1, $2)' },

    // Record
    { label: 'keys', kind: vscode.CompletionItemKind.Function, detail: 'keys(record) - Get all keys', insertText: 'keys($1)' },
    { label: 'values', kind: vscode.CompletionItemKind.Function, detail: 'values(record) - Get all values', insertText: 'values($1)' },
    { label: 'has_field', kind: vscode.CompletionItemKind.Function, detail: 'has_field(record, key) - Check field exists', insertText: 'has_field($1, $2)' },

    // Utility
    { label: 'print', kind: vscode.CompletionItemKind.Function, detail: 'print(val) - Print value', insertText: 'print($1)' },
    { label: 'typeof', kind: vscode.CompletionItemKind.Function, detail: 'typeof(val) - Get type name', insertText: 'typeof($1)' },
    { label: 'str', kind: vscode.CompletionItemKind.Function, detail: 'str(val) - Convert to string', insertText: 'str($1)' },

    // Environment
    { label: 'save_env', kind: vscode.CompletionItemKind.Function, detail: 'save_env(path) - Save environment', insertText: 'save_env($1)' },
    { label: 'restore_env', kind: vscode.CompletionItemKind.Function, detail: 'restore_env(path) - Restore environment', insertText: 'restore_env($1)' },
    { label: 'env_info', kind: vscode.CompletionItemKind.Function, detail: 'env_info() - Get environment info', insertText: 'env_info()' },

    // Numerical
    { label: 'diff', kind: vscode.CompletionItemKind.Function, detail: 'diff(f, x) - Numerical derivative', insertText: 'diff($1, $2)' },
    { label: 'integral', kind: vscode.CompletionItemKind.Function, detail: 'integral(f, a, b) - Numerical integration', insertText: 'integral($1, $2, $3)' },
    { label: 'solve', kind: vscode.CompletionItemKind.Function, detail: 'solve(f, x0) - Root finding', insertText: 'solve($1, $2)' },
    { label: 'bisect', kind: vscode.CompletionItemKind.Function, detail: 'bisect(f, a, b) - Bisection method', insertText: 'bisect($1, $2, $3)' },
    { label: 'newton', kind: vscode.CompletionItemKind.Function, detail: 'newton(f, df, x0) - Newton method', insertText: 'newton($1, $2, $3)' },

    // DSP
    { label: 'fft', kind: vscode.CompletionItemKind.Function, detail: 'fft(signal) - Fast Fourier Transform', insertText: 'fft($1)' },
    { label: 'ifft', kind: vscode.CompletionItemKind.Function, detail: 'ifft(spectrum) - Inverse FFT', insertText: 'ifft($1)' },
    { label: 'conv', kind: vscode.CompletionItemKind.Function, detail: 'conv(a, b) - Convolution', insertText: 'conv($1, $2)' },
    { label: 'linspace', kind: vscode.CompletionItemKind.Function, detail: 'linspace(start, end, n) - Linear spacing', insertText: 'linspace($1, $2, $3)' },

    // Graph
    { label: 'network', kind: vscode.CompletionItemKind.Function, detail: 'network(edges) - Create network', insertText: 'network($1)' },
    { label: 'nodes', kind: vscode.CompletionItemKind.Function, detail: 'nodes(graph) - Get all nodes', insertText: 'nodes($1)' },
    { label: 'edges', kind: vscode.CompletionItemKind.Function, detail: 'edges(graph) - Get all edges', insertText: 'edges($1)' },
    { label: 'neighbors', kind: vscode.CompletionItemKind.Function, detail: 'neighbors(graph, node) - Get neighbors', insertText: 'neighbors($1, $2)' },
    { label: 'dijkstra', kind: vscode.CompletionItemKind.Function, detail: 'dijkstra(graph, start, end) - Shortest path', insertText: 'dijkstra($1, $2, $3)' },
    { label: 'bfs', kind: vscode.CompletionItemKind.Function, detail: 'bfs(graph, start) - Breadth-first search', insertText: 'bfs($1, $2)' },
    { label: 'dfs', kind: vscode.CompletionItemKind.Function, detail: 'dfs(graph, start) - Depth-first search', insertText: 'dfs($1, $2)' },

    // Optimization
    { label: 'simplex', kind: vscode.CompletionItemKind.Function, detail: 'simplex(c, A, b) - Simplex method', insertText: 'simplex($1, $2, $3)' },
    { label: 'linprog', kind: vscode.CompletionItemKind.Function, detail: 'linprog(c, A, b) - Linear programming', insertText: 'linprog($1, $2, $3)' },
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Achronyme SOC extension activated');

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'soc',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const items: vscode.CompletionItem[] = [];

                // Add keywords
                for (const kw of KEYWORDS) {
                    const item = new vscode.CompletionItem(kw.label, kw.kind);
                    item.detail = kw.detail;
                    items.push(item);
                }

                // Add types
                for (const type of TYPES) {
                    const item = new vscode.CompletionItem(type.label, type.kind);
                    item.detail = type.detail;
                    items.push(item);
                }

                // Add constants
                for (const constant of CONSTANTS) {
                    const item = new vscode.CompletionItem(constant.label, constant.kind);
                    item.detail = constant.detail;
                    items.push(item);
                }

                // Add built-in functions
                for (const fn of BUILTIN_FUNCTIONS) {
                    const item = new vscode.CompletionItem(fn.label, fn.kind);
                    item.detail = fn.detail;
                    if (fn.insertText) {
                        item.insertText = new vscode.SnippetString(fn.insertText);
                    }
                    items.push(item);
                }

                return items;
            }
        },
        '' // Trigger on any character
    );

    context.subscriptions.push(completionProvider);
}

export function deactivate() {}
