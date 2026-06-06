// src/services/kpi-formula.ts
// Tiny expression engine for KPI formulas. No deps.
//
// Grammar (per-period evaluation):
//   expr      := term (('+' | '-') term)*
//   term      := factor (('*' | '/') factor)*
//   factor    := NUMBER | KPI_REF | '(' expr ')' | '-' factor
//   NUMBER    := /-?\d+(\.\d+)?/
//   KPI_REF   := /\{\{[0-9a-f-]{36}\}\}/   (UUID inside double braces)
//
// NULL propagation: any input null -> output null. Division by zero -> null.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Token =
  | { type: 'num'; value: number; pos: number }
  | { type: 'ref'; kpiId: string; pos: number }
  | { type: 'op'; op: '+' | '-' | '*' | '/'; pos: number }
  | { type: 'lparen'; pos: number }
  | { type: 'rparen'; pos: number }
  | { type: 'eof'; pos: number };

export type Ast =
  | { type: 'num'; value: number }
  | { type: 'ref'; kpiId: string }
  | { type: 'binop'; op: '+' | '-' | '*' | '/'; left: Ast; right: Ast }
  | { type: 'neg'; child: Ast };

export class FormulaError extends Error {
  constructor(public code: string, message: string, public pos?: number) {
    super(message);
    this.name = 'FormulaError';
  }
}

// ---- Tokenizer -----------------------------------------------------------

export function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if (c === '+' || c === '-' || c === '*' || c === '/') {
      out.push({ type: 'op', op: c as '+' | '-' | '*' | '/', pos: i });
      i++; continue;
    }
    if (c === '(') { out.push({ type: 'lparen', pos: i }); i++; continue; }
    if (c === ')') { out.push({ type: 'rparen', pos: i }); i++; continue; }
    if (c >= '0' && c <= '9') {
      const start = i;
      while (i < src.length && (src[i] >= '0' && src[i] <= '9')) i++;
      if (src[i] === '.') {
        i++;
        while (i < src.length && (src[i] >= '0' && src[i] <= '9')) i++;
      }
      const num = Number(src.slice(start, i));
      if (!Number.isFinite(num)) throw new FormulaError('BAD_NUMBER', `Invalid number at position ${start}`, start);
      out.push({ type: 'num', value: num, pos: start });
      continue;
    }
    if (c === '{' && src[i + 1] === '{') {
      const start = i;
      const close = src.indexOf('}}', i + 2);
      if (close < 0) throw new FormulaError('UNCLOSED_REF', `Unclosed KPI reference starting at ${i}`, i);
      const id = src.slice(i + 2, close).trim();
      if (!UUID_RE.test(id)) throw new FormulaError('BAD_REF', `KPI reference is not a valid UUID at ${i}`, i);
      out.push({ type: 'ref', kpiId: id.toLowerCase(), pos: start });
      i = close + 2;
      continue;
    }
    throw new FormulaError('UNEXPECTED_CHAR', `Unexpected character '${c}' at position ${i}`, i);
  }
  out.push({ type: 'eof', pos: i });
  return out;
}

// ---- Parser (recursive descent) -----------------------------------------

class Parser {
  pos = 0;
  constructor(private toks: Token[]) {}
  peek(): Token { return this.toks[this.pos]; }
  consume(): Token { return this.toks[this.pos++]; }
  parseExpr(): Ast {
    let left = this.parseTerm();
    for (;;) {
      const t = this.peek();
      if (t.type === 'op' && (t.op === '+' || t.op === '-')) {
        this.consume();
        const right = this.parseTerm();
        left = { type: 'binop', op: t.op, left, right };
      } else break;
    }
    return left;
  }
  parseTerm(): Ast {
    let left = this.parseFactor();
    for (;;) {
      const t = this.peek();
      if (t.type === 'op' && (t.op === '*' || t.op === '/')) {
        this.consume();
        const right = this.parseFactor();
        left = { type: 'binop', op: t.op, left, right };
      } else break;
    }
    return left;
  }
  parseFactor(): Ast {
    const t = this.peek();
    if (t.type === 'op' && t.op === '-') {
      this.consume();
      return { type: 'neg', child: this.parseFactor() };
    }
    if (t.type === 'num') { this.consume(); return { type: 'num', value: t.value }; }
    if (t.type === 'ref') { this.consume(); return { type: 'ref', kpiId: t.kpiId }; }
    if (t.type === 'lparen') {
      this.consume();
      const inner = this.parseExpr();
      const close = this.consume();
      if (close.type !== 'rparen') throw new FormulaError('MISSING_RPAREN', `Expected ')' at position ${close.pos}`, close.pos);
      return inner;
    }
    throw new FormulaError('UNEXPECTED_TOKEN', `Unexpected token at position ${t.pos}`, t.pos);
  }
}

export function parseFormula(src: string): Ast {
  const toks = tokenize(src);
  const p = new Parser(toks);
  const ast = p.parseExpr();
  const final = p.peek();
  if (final.type !== 'eof') throw new FormulaError('TRAILING', `Unexpected trailing input at position ${final.pos}`, final.pos);
  return ast;
}

// ---- Reference extraction (for dependency DAG) -------------------------

export function extractRefs(ast: Ast): string[] {
  const out = new Set<string>();
  const walk = (n: Ast): void => {
    if (n.type === 'ref') out.add(n.kpiId);
    else if (n.type === 'binop') { walk(n.left); walk(n.right); }
    else if (n.type === 'neg') walk(n.child);
  };
  walk(ast);
  return Array.from(out);
}

// ---- Evaluator (per-period) --------------------------------------------

export type RefResolver = (kpiId: string) => number | null;

export function evaluate(ast: Ast, resolve: RefResolver): number | null {
  if (ast.type === 'num') return ast.value;
  if (ast.type === 'ref') return resolve(ast.kpiId);
  if (ast.type === 'neg') {
    const v = evaluate(ast.child, resolve);
    return v === null ? null : -v;
  }
  // binop
  const l = evaluate(ast.left, resolve);
  if (l === null) return null;
  const r = evaluate(ast.right, resolve);
  if (r === null) return null;
  switch (ast.op) {
    case '+': return l + r;
    case '-': return l - r;
    case '*': return l * r;
    case '/':
      if (r === 0) return null;
      return l / r;
  }
}

// ---- Cycle detection ---------------------------------------------------

// Given proposed edges (kpi -> [depends on]), return a cycle path if one
// exists, otherwise null. The graph here is "depends on" -> formula KPI
// pulls FROM these inputs. A cycle means a KPI eventually feeds itself.
export function detectCycle(
  proposedKpiId: string,
  proposedDeps: string[],
  existingEdges: Array<{ kpiId: string; dependsOn: string }>,
): string[] | null {
  // Build adjacency: kpiId -> set of dependsOn ids, with the proposed edge included.
  const adj = new Map<string, Set<string>>();
  for (const e of existingEdges) {
    if (e.kpiId === proposedKpiId) continue; // we will replace edges for the proposed KPI
    if (!adj.has(e.kpiId)) adj.set(e.kpiId, new Set());
    adj.get(e.kpiId)!.add(e.dependsOn);
  }
  adj.set(proposedKpiId, new Set(proposedDeps));

  // DFS from proposedKpiId looking for a path back to proposedKpiId.
  const stack: Array<{ node: string; path: string[] }> = [{ node: proposedKpiId, path: [proposedKpiId] }];
  const visited = new Set<string>();
  while (stack.length > 0) {
    const { node, path } = stack.pop()!;
    const deps = adj.get(node);
    if (!deps) continue;
    for (const d of deps) {
      if (d === proposedKpiId) return [...path, d];
      if (visited.has(d)) continue;
      visited.add(d);
      stack.push({ node: d, path: [...path, d] });
    }
  }
  return null;
}
