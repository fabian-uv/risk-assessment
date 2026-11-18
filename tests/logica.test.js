// Casos T1–T16 de docs/02-algoritmo.md §7 y T17–T20 de docs/03-tratamiento.md §6,
// con las mismas cifras que tools/verificar_casos.py.
// Correr con: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logica.js');
const Ejemplo = require('../src/ejemplo.js');

const Q = L.Q;
const eqQ = (a, b, msg) => assert.ok(L.igual(a, b), `${msg}: obtuve ${L.texto(a)}, esperaba ${L.texto(b)}`);

test('T1 ALE: SLE 150.000; 2 veces en 5 años', () => {
  const aro = L.aro(2, 5);
  eqQ(aro, Q(2, 5), 'ARO');
  eqQ(L.ale(150000, aro), Q(60000), 'ALE');
});
test('T2 ALE: SLE 20.000; 5 veces en 1 año', () => {
  eqQ(L.aro(5, 1), Q(5), 'ARO');
  eqQ(L.ale(20000, L.aro(5, 1)), Q(100000), 'ALE');
});
test('T3 ALE: SLE 1.000.000; 1 vez en 10 años', () => {
  eqQ(L.aro(1, 10), Q(1, 10), 'ARO');
  eqQ(L.ale(1000000, L.aro(1, 10)), Q(100000), 'ALE');
});
test('T4 P: 1 vez en 3 años → 4', () => assert.equal(L.notaP(L.aro(1, 3)), 4));
test('T5 P: 1 vez en 10 años → 2', () => assert.equal(L.notaP(L.aro(1, 10)), 2));
test('T6 P: 1 vez en 1 año → 5', () => assert.equal(L.notaP(L.aro(1, 1)), 5));
test('T7 P: 1 vez en 5 años → 3', () => assert.equal(L.notaP(L.aro(1, 5)), 3));
test('T8 D: duración = MTD → 5', () => assert.equal(L.notaD(720, 720), 5));
test('T9 D: MTD 720 min; 5, 60, 240 min → 2, 3, 4', () => {
  assert.deepEqual([5, 60, 240].map((x) => L.notaD(x, 720)), [2, 3, 4]);
  assert.equal(L.notaD(4, 720), 1);
});
test('T10 nivel: 4, 5, 12, 15', () => {
  assert.deepEqual([4, 5, 12, 15].map(L.nivel), ['Bajo', 'Medio', 'Medio', 'Alto']);
});
test('T11 computador cuanti', () => {
  const va = Q(2000000), aro = L.aro(1, 10);
  const aleSin = L.ale(L.sle(va, L.fePorcentaje(100)), aro);
  const aleCon = L.ale(L.sle(va, L.fePorcentaje(50)), aro);
  eqQ(aleSin, Q(200000), 'ALE sin');
  eqQ(aleCon, Q(100000), 'ALE con');
  eqQ(L.valorNeto(L.reduccion(aleSin, aleCon), 40000), Q(60000), 'neto');
  // Notas de Dinero con umbral 2.000.000 coinciden con T12: 5 → 4
  assert.equal(L.notaDinero(L.sle(va, L.fePorcentaje(100)), 2000000), 5);
  assert.equal(L.notaDinero(L.sle(va, L.fePorcentaje(50)), 2000000), 4);
});
test('T12 computador cuali: P 2; I 5 → 4', () => {
  assert.equal(L.riesgo(2, 5), 10); assert.equal(L.nivel(10), 'Medio');
  assert.equal(L.riesgo(2, 4), 8); assert.equal(L.nivel(8), 'Medio');
  assert.equal(L.riesgo(2, 5) - L.riesgo(2, 4), 2);
});

// T13–T15 se prueban con el ejemplo precargado, de punta a punta.
function evaluarEjemplo() {
  const a = Ejemplo.celular();
  const act = a.activos[0];
  const r = Object.fromEntries(a.riesgos.map((x) => [x.id, L.evaluar(x, act, a)]));
  return { a, r };
}

test('T13 celular rotura con carcasa', () => {
  const { r } = evaluarEjemplo(); const x = r['r-rotura'];
  assert.ok(x.ok, JSON.stringify(x.errores));
  eqQ(x.sin.sle, Q(45000), 'SLE sin'); eqQ(x.con.sle, Q(15000), 'SLE con');
  eqQ(x.costo, Q(10000), 'costo anual'); eqQ(x.reduccion, Q(30000), 'reducción');
  const neto = L.valorNeto(x.reduccion, x.costo);
  eqQ(neto, Q(20000), 'neto'); assert.equal(L.veredicto(neto), 'conviene');
  assert.equal(x.sin.p, 5); assert.equal(x.con.p, 5);
  assert.deepEqual(x.sin.piezas, { c: 1, i: 1, d: 3, dinero: 2 });
  assert.deepEqual(x.con.piezas, { c: 1, i: 1, d: 1, dinero: 1 }); // $15.000 con umbral $2.000.000 → 1
  assert.equal(x.sin.riesgo, 15); assert.equal(x.sin.nivel, 'Alto');
  assert.equal(x.con.riesgo, 5); assert.equal(x.con.nivel, 'Medio');
  assert.equal(x.mejora, 10);
  // Si el costo se tomara como 30.000 al año: empate
  assert.equal(L.veredicto(L.valorNeto(x.reduccion, 30000)), 'empate');
});
test('T14 celular robo con borrado remoto', () => {
  const { r } = evaluarEjemplo(); const x = r['r-robo'];
  assert.ok(x.ok, JSON.stringify(x.errores));
  eqQ(x.sin.aro, Q(1, 3), 'ARO'); assert.equal(x.sin.p, 4);
  eqQ(x.sin.ale, Q(50000), 'ALE sin'); eqQ(x.con.ale, Q(50000), 'ALE con');
  eqQ(L.valorNeto(x.reduccion, x.costo), Q(0), 'neto');
  assert.equal(x.sin.impacto, 5); assert.equal(x.con.impacto, 4);
  assert.equal(x.sin.riesgo, 20); assert.equal(x.sin.nivel, 'Alto');
  assert.equal(x.con.riesgo, 16); assert.equal(x.con.nivel, 'Alto');
});
test('T15 celular robo con seguro', () => {
  const { r } = evaluarEjemplo(); const x = r['r-seguro'];
  assert.ok(x.ok, JSON.stringify(x.errores));
  eqQ(x.con.fe, Q(70000, 150000), 'FE con');
  eqQ(x.con.sle, Q(70000), 'SLE con');
  eqQ(x.con.ale, Q(70000, 3), 'ALE con');
  eqQ(x.reduccion, Q(80000, 3), 'reducción');
  const neto = L.valorNeto(x.reduccion, x.costo);
  eqQ(neto, Q(-52000, 3), 'neto');
  assert.equal(L.veredicto(neto), 'no_conviene');
  assert.equal(L.fmtPct(x.con.fe), '46,67 %');
  assert.deepEqual([L.fmtPesos(x.con.ale), L.fmtPesos(x.reduccion), L.fmtPesos(neto)], ['$23.333', '$26.667', '−$17.333']);
  assert.equal(x.sin.riesgo, 16); assert.equal(x.con.riesgo, 12); assert.equal(x.con.nivel, 'Medio');
  assert.equal(x.con.impacto, 3);
  assert.equal(L.coinciden(L.veredicto(neto), x.mejora), false); // cuanti y cuali no coinciden
});
test('T16 orden final: robo antes que rotura', () => {
  const { r } = evaluarEjemplo();
  const orden = L.ordenar([{ id: 'Rotura', resultado: r['r-rotura'] }, { id: 'Robo', resultado: r['r-robo'] }]);
  assert.deepEqual(orden.map((x) => x.id), ['Robo', 'Rotura']);
  // Desempate por ALE residual
  const a = { con: null, sin: { riesgo: 8, ale: Q(100) } }, b = { con: null, sin: { riesgo: 8, ale: Q(200) } };
  assert.deepEqual(L.ordenar([{ id: 'a', resultado: a }, { id: 'b', resultado: b }]).map((x) => x.id), ['b', 'a']);
});

test('Extra: valor neto por control y bordes', () => {
  const { a, r } = evaluarEjemplo();
  const vn = L.valorNetoPorControl(a, Object.values(r));
  eqQ(vn['ctl-carcasa'].neto, Q(20000), 'carcasa'); eqQ(vn['ctl-borrado'].neto, Q(0), 'borrado');
  eqQ(vn['ctl-seguro'].neto, Q(-52000, 3), 'seguro');
  // Bordes de Dinero (umbral 2.000.000): 1, 1/5, 1/20, 1/100
  assert.deepEqual([2000000, 400000, 100000, 20000, 19999].map((p) => L.notaDinero(p, 2000000)), [5, 4, 3, 2, 1]);
  // Redondear antes de comparar cambia la nota: 0,3 → 3, 1/3 → 4
  assert.equal(L.notaP(L.leerDecimal('0,3')), 3);
  assert.equal(L.notaP(L.aro(1, 3)), 4);
  assert.deepEqual(L.leerDecimal('46,67'), Q(4667, 100));
  assert.deepEqual(L.leerPesos('$150.000'), Q(150000));
  assert.equal(L.leerPesos('15,5'), null);
});
test('Extra: validaciones', () => {
  const a = Ejemplo.celular();
  const x = JSON.parse(JSON.stringify(a.riesgos[0]));
  x.veces = '0'; x.fe = '120';
  const res = L.evaluar(x, a.activos[0], a);
  assert.equal(res.ok, false); assert.ok(res.errores.veces); assert.ok(res.errores.fe);
  const y = JSON.parse(JSON.stringify(a.riesgos[0]));
  y.aplicacion.cambiaFe = false; y.aplicacion.cambiaPiezas = false;
  assert.ok(L.evaluar(y, a.activos[0], a).errores.control);
});

// T17–T20: tratamiento del riesgo (docs/03-tratamiento.md §6)
function sugerencias() {
  const { a, r } = evaluarEjemplo();
  const vn = L.valorNetoPorControl(a, Object.values(r));
  const ctl = (id) => a.controles.find((c) => c.id === id);
  const sug = (rid) => { const x = r[rid]; return L.sugerirTratamiento(x, x.con ? vn[x.control.id] : null, x.con ? ctl(x.control.id) : null, 'Bajo'); };
  return { r, vn, sug };
}
test('T17 rotura con carcasa: neto +20.000, 15 Alto → 5 Medio → sugerir Mitigar', () => {
  const { r, vn, sug } = sugerencias();
  eqQ(vn['ctl-carcasa'].neto, Q(20000), 'neto');
  assert.deepEqual([r['r-rotura'].sin.riesgo, r['r-rotura'].con.riesgo], [15, 5]);
  assert.equal(sug('r-rotura').opcion, 'mitigar');
});
test('T18 robo con borrado: neto 0, residual 16 Alto → Evitar o Aceptar con excepción', () => {
  const { r, vn, sug } = sugerencias();
  eqQ(vn['ctl-borrado'].neto, Q(0), 'neto');
  assert.equal(L.nivel(r['r-robo'].con.riesgo), 'Alto');
  assert.equal(sug('r-robo').opcion, 'evitar_o_aceptar');
});
test('T19 seguro: no se sugiere; aceptar el riesgo Alto pide el FAR-lite', () => {
  const { r, sug } = sugerencias();
  assert.notEqual(sug('r-seguro').opcion, 'transferir');
  assert.equal(L.pideFAR('aceptar', r['r-seguro'], 'Bajo'), true);
  assert.equal(L.pideFAR('transferir', r['r-seguro'], 'Bajo'), false);
  assert.deepEqual(Object.keys(L.erroresFAR({})).sort(), ['fecha', 'motivo', 'plan']);
  assert.deepEqual(L.erroresFAR({ motivo: 'x', plan: 'y', fecha: '2026-12-01' }), {});
});
test('T20 riesgo Bajo (P × I ≤ 4) → sugerir Aceptar, sin formulario', () => {
  const bajo = { sin: { riesgo: 4 }, con: null };
  assert.equal(L.sugerirTratamiento(bajo, null, null, 'Bajo').opcion, 'aceptar');
  assert.equal(L.pideFAR('aceptar', bajo, 'Bajo'), false);
  // Con umbral Medio, 12 se acepta sin trámite y 15 no
  assert.equal(L.pideFAR('aceptar', { sin: { riesgo: 12 } }, 'Medio'), false);
  assert.equal(L.pideFAR('aceptar', { sin: { riesgo: 15 } }, 'Medio'), true);
});
test('Extra: fechas de revisión y aviso de precio', () => {
  assert.equal(L.sumarMeses('2026-11-17', 3), '2027-02-17');
  assert.equal(L.sumarMeses('2026-11-30', 3), '2027-02-28');
  assert.equal(L.fmtFecha('2027-02-17'), '17-02-2027');
  assert.equal(L.controlMasCaroQueVA({ costo: '200.000' }, Q(150000)), true);
  assert.equal(L.controlMasCaroQueVA({ costo: '44.000' }, Q(150000)), false);
});
