import { parseFormula, extractRefs, evaluate, detectCycle, FormulaError } from '../src/services/kpi-formula.js';

let pass = 0, fail = 0;
function expect(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log('OK    ' + label); }
  else { fail++; console.log('FAIL  ' + label + '\n   got: ' + JSON.stringify(got) + '\n  want: ' + JSON.stringify(want)); }
}

expect('2+3*4', evaluate(parseFormula('2 + 3 * 4'), () => null), 14);
expect('(2+3)*4', evaluate(parseFormula('(2+3)*4'), () => null), 20);
expect('-5+10', evaluate(parseFormula('-5 + 10'), () => null), 5);
expect('division', evaluate(parseFormula('10 / 4'), () => null), 2.5);
expect('div by zero -> null', evaluate(parseFormula('10 / 0'), () => null), null);
expect('decimals', evaluate(parseFormula('0.5 + 0.25'), () => null), 0.75);

const ID_A = '11111111-1111-1111-1111-111111111111';
const ID_B = '22222222-2222-2222-2222-222222222222';
const ast = parseFormula(`{{${ID_A}}} / {{${ID_B}}} * 100`);
expect('extract refs', extractRefs(ast).sort(), [ID_A, ID_B].sort());
expect('eval ratio*100', evaluate(ast, (id) => id === ID_A ? 30 : id === ID_B ? 100 : null), 30);
expect('null prop on missing input', evaluate(ast, (id) => id === ID_A ? null : 100), null);

try { parseFormula('2 +'); fail++; console.log('FAIL  trailing op should throw'); } catch (e) { pass++; console.log('OK    trailing op throws: ' + (e as FormulaError).code); }
try { parseFormula('2 + {{not-a-uuid}}'); fail++; console.log('FAIL  bad ref should throw'); } catch (e) { pass++; console.log('OK    bad ref throws: ' + (e as FormulaError).code); }
try { parseFormula('(2 + 3'); fail++; console.log('FAIL  unclosed paren should throw'); } catch (e) { pass++; console.log('OK    unclosed paren throws: ' + (e as FormulaError).code); }

const A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const C = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const cycle = detectCycle(C, [A], [{ kpiId: A, dependsOn: B }, { kpiId: B, dependsOn: C }]);
expect('cycle path detected', cycle !== null, true);
expect('no cycle valid chain', detectCycle(A, [B], [{ kpiId: B, dependsOn: C }]), null);
expect('self-ref cycle', detectCycle(A, [A], []), [A, A]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
