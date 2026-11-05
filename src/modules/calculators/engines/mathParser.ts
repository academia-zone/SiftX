/**
 * Pure Mathematical Parser & Evaluator for Scientific Calculator
 * Deterministic Shunting-Yard / Recursive descent - NO eval(), NO Function() constructor.
 * Safe from code injection, properly handles unary minus, operator precedence, parentheses, and division by zero.
 */

export interface MathEvalResult {
  value: number;
  error?: string;
}

type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN' | 'FUNC';

interface Token {
  type: TokenType;
  value: string | number;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 3,
};

const ASSOCIATIVITY: Record<string, 'L' | 'R'> = {
  '+': 'L',
  '-': 'L',
  '*': 'L',
  '/': 'L',
  '%': 'L',
  '^': 'R',
};

const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs', 'exp']);

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const clean = expr.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/');

  while (i < clean.length) {
    const ch = clean[i];

    // Numbers & Decimals
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let hasDot = false;
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        if (clean[i] === '.') {
          if (hasDot) throw new Error('Invalid number format: multiple decimal points');
          hasDot = true;
        }
        numStr += clean[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
      continue;
    }

    // Identifiers (Constants like pi, e or Functions like sin, cos, sqrt)
    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < clean.length && /[a-zA-Z0-9]/.test(clean[i])) {
        ident += clean[i];
        i++;
      }
      ident = ident.toLowerCase();

      if (ident === 'pi') {
        tokens.push({ type: 'NUMBER', value: Math.PI });
      } else if (ident === 'e') {
        tokens.push({ type: 'NUMBER', value: Math.E });
      } else if (FUNCTIONS.has(ident)) {
        tokens.push({ type: 'FUNC', value: ident });
      } else {
        throw new Error(`Unknown identifier '${ident}'`);
      }
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Operators (+, -, *, /, %, ^)
    if (['+', '-', '*', '/', '%', '^'].includes(ch)) {
      // Check for unary minus / plus
      const prev = tokens[tokens.length - 1];
      const isUnary = !prev || prev.type === 'OP' || prev.type === 'LPAREN';
      if (isUnary) {
        if (ch === '-') {
          // Unary minus: represented as 0 - x or token
          tokens.push({ type: 'NUMBER', value: 0 });
          tokens.push({ type: 'OP', value: '-' });
          i++;
          continue;
        } else if (ch === '+') {
          // Unary plus can be ignored
          i++;
          continue;
        }
      }

      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at position ${i}`);
  }

  return tokens;
}

export function evaluateExpression(expr: string, isDegreeMode: boolean = false): MathEvalResult {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { value: 0 };
  }

  try {
    const tokens = tokenize(trimmed);
    if (tokens.length === 0) return { value: 0 };

    // Shunting-Yard Algorithm to produce RPN
    const outputQueue: Token[] = [];
    const opStack: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'FUNC') {
        opStack.push(token);
      } else if (token.type === 'OP') {
        const o1 = token.value as string;
        while (opStack.length > 0) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'OP') {
            const o2 = top.value as string;
            const p1 = PRECEDENCE[o1] || 0;
            const p2 = PRECEDENCE[o2] || 0;
            const assoc = ASSOCIATIVITY[o1] || 'L';

            if ((assoc === 'L' && p1 <= p2) || (assoc === 'R' && p1 < p2)) {
              outputQueue.push(opStack.pop()!);
              continue;
            }
          } else if (top.type === 'FUNC') {
            outputQueue.push(opStack.pop()!);
            continue;
          }
          break;
        }
        opStack.push(token);
      } else if (token.type === 'LPAREN') {
        opStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLparen = false;
        while (opStack.length > 0) {
          const top = opStack.pop()!;
          if (top.type === 'LPAREN') {
            foundLparen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundLparen) {
          return { value: 0, error: 'Mismatched parentheses: missing (' };
        }
        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'FUNC') {
          outputQueue.push(opStack.pop()!);
        }
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        return { value: 0, error: 'Mismatched parentheses' };
      }
      outputQueue.push(top);
    }

    // Evaluate RPN
    const evalStack: number[] = [];

    for (const token of outputQueue) {
      if (token.type === 'NUMBER') {
        evalStack.push(token.value as number);
      } else if (token.type === 'OP') {
        if (evalStack.length < 2) {
          return { value: 0, error: `Insufficient operands for operator '${token.value}'` };
        }
        const b = evalStack.pop()!;
        const a = evalStack.pop()!;
        const op = token.value as string;

        let res = 0;
        if (op === '+') res = a + b;
        else if (op === '-') res = a - b;
        else if (op === '*') res = a * b;
        else if (op === '/') {
          if (Math.abs(b) < 1e-15) {
            return { value: 0, error: 'Division by zero is undefined' };
          }
          res = a / b;
        } else if (op === '%') {
          if (Math.abs(b) < 1e-15) {
            return { value: 0, error: 'Modulo by zero is undefined' };
          }
          res = a % b;
        } else if (op === '^') {
          res = Math.pow(a, b);
          if (isNaN(res) || !isFinite(res)) {
            return { value: 0, error: 'Complex or undefined power result' };
          }
        }
        evalStack.push(res);
      } else if (token.type === 'FUNC') {
        if (evalStack.length < 1) {
          return { value: 0, error: `Missing argument for function '${token.value}'` };
        }
        const arg = evalStack.pop()!;
        const fn = token.value as string;
        let res = 0;

        const toRad = (x: number) => isDegreeMode ? (x * Math.PI) / 180 : x;
        const fromRad = (x: number) => isDegreeMode ? (x * 180) / Math.PI : x;

        if (fn === 'sin') res = Math.sin(toRad(arg));
        else if (fn === 'cos') res = Math.cos(toRad(arg));
        else if (fn === 'tan') {
          const cosVal = Math.cos(toRad(arg));
          if (Math.abs(cosVal) < 1e-12) return { value: 0, error: 'tan undefined at asymptote' };
          res = Math.tan(toRad(arg));
        } else if (fn === 'asin') {
          if (arg < -1 || arg > 1) return { value: 0, error: 'asin domain error (must be between -1 and 1)' };
          res = fromRad(Math.asin(arg));
        } else if (fn === 'acos') {
          if (arg < -1 || arg > 1) return { value: 0, error: 'acos domain error (must be between -1 and 1)' };
          res = fromRad(Math.acos(arg));
        } else if (fn === 'atan') {
          res = fromRad(Math.atan(arg));
        } else if (fn === 'log') {
          if (arg <= 0) return { value: 0, error: 'log domain error (must be > 0)' };
          res = Math.log10(arg);
        } else if (fn === 'ln') {
          if (arg <= 0) return { value: 0, error: 'ln domain error (must be > 0)' };
          res = Math.log(arg);
        } else if (fn === 'sqrt') {
          if (arg < 0) return { value: 0, error: 'Square root of negative number is undefined in real numbers' };
          res = Math.sqrt(arg);
        } else if (fn === 'abs') {
          res = Math.abs(arg);
        } else if (fn === 'exp') {
          res = Math.exp(arg);
        }

        evalStack.push(res);
      }
    }

    if (evalStack.length !== 1) {
      return { value: 0, error: 'Invalid expression' };
    }

    const finalVal = evalStack[0];
    if (isNaN(finalVal) || !isFinite(finalVal)) {
      return { value: 0, error: 'Numerical overflow or undefined result' };
    }

    // Clean floating point precision inaccuracies (e.g., 0.1 + 0.2 = 0.30000000000000004)
    const rounded = Number(parseFloat(finalVal.toPrecision(12)).toFixed(8).replace(/\.?0+$/, ''));
    return { value: rounded };
  } catch (err: any) {
    return { value: 0, error: err.message || 'Syntax error' };
  }
}
