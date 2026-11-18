/* Lógica pura del análisis de riesgos. Sin DOM.
   Fuentes: docs/01-problema.md y docs/02-algoritmo.md.
   Regla de oro: todo cálculo y toda comparación se hacen con fracciones exactas
   (BigInt). Solo se redondea al mostrar (funciones fmt*). */
(function (raiz, fabrica) {
  var L = fabrica();
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else raiz.Logica = L;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var L = {};

  /* ---------- Fracciones exactas ---------- */
  function abs(a) { return a < 0n ? -a : a; }
  function mcd(a, b) { a = abs(a); b = abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function Q(n, d) {
    n = BigInt(n); d = d === undefined ? 1n : BigInt(d);
    if (d === 0n) throw new Error('Denominador 0');
    if (d < 0n) { n = -n; d = -d; }
    var g = mcd(n, d) || 1n;
    return { n: n / g, d: d / g };
  }
  function q(x) { return (typeof x === 'object' && x !== null && 'n' in x) ? x : Q(x); }
  L.Q = Q;
  L.suma = function (a, b) { a = q(a); b = q(b); return Q(a.n * b.d + b.n * a.d, a.d * b.d); };
  L.resta = function (a, b) { a = q(a); b = q(b); return Q(a.n * b.d - b.n * a.d, a.d * b.d); };
  L.mul = function (a, b) { a = q(a); b = q(b); return Q(a.n * b.n, a.d * b.d); };
  L.div = function (a, b) { a = q(a); b = q(b); if (b.n === 0n) throw new Error('División por 0'); return Q(a.n * b.d, a.d * b.n); };
  L.cmp = function (a, b) { a = q(a); b = q(b); var x = a.n * b.d - b.n * a.d; return x > 0n ? 1 : (x < 0n ? -1 : 0); };
  L.igual = function (a, b) { return L.cmp(a, b) === 0; };
  L.aNumero = function (a) { a = q(a); return Number(a.n) / Number(a.d); };
  L.texto = function (a) { a = q(a); return a.d === 1n ? String(a.n) : a.n + '/' + a.d; };

  /* ---------- Lectura de lo que escribe la persona ----------
     Devuelven una fracción o null si el texto no es válido. */
  // Pesos: enteros; se aceptan puntos de miles, espacios y "$".
  L.leerPesos = function (s) {
    if (s === null || s === undefined) return null;
    s = String(s).replace(/[\s$.]/g, '');
    if (!/^\d+$/.test(s)) return null;
    return Q(BigInt(s));
  };
  // Decimal con coma o punto: "46,67" -> 4667/100. Sin miles.
  L.leerDecimal = function (s) {
    if (s === null || s === undefined) return null;
    s = String(s).trim().replace(/\s/g, '').replace(',', '.');
    var m = /^(\d+)(?:\.(\d+))?$/.exec(s);
    if (!m) return null;
    var dec = m[2] || '';
    return Q(BigInt(m[1] + dec), 10n ** BigInt(dec.length));
  };
  L.leerEntero = function (s) {
    if (s === null || s === undefined) return null;
    s = String(s).trim();
    if (!/^\d+$/.test(s)) return null;
    return BigInt(s);
  };

  /* ---------- Fórmulas cuantitativas (02 §3) ---------- */
  L.aro = function (veces, anios) { return Q(veces, anios); };
  L.fePorcentaje = function (pct) { return L.div(pct, 100); };
  L.feCubierto = function (va, cubierto) { return L.div(L.resta(va, cubierto), va); }; // lo que sigue perdiéndose
  L.sle = function (va, fe) { return L.mul(va, fe); };
  L.ale = function (sle, aro) { return L.mul(sle, aro); };
  L.reduccion = function (aleSin, aleCon) { return L.resta(aleSin, aleCon); };
  L.costoAnual = function (precio, aniosVida) { return L.div(precio, aniosVida); };
  L.valorNeto = function (reduccion, costoAnual) { return L.resta(reduccion, costoAnual); };
  L.veredicto = function (neto) {
    var s = L.cmp(neto, 0);
    return s > 0 ? 'conviene' : (s === 0 ? 'empate' : 'no_conviene');
  };
  L.FRASE_VEREDICTO = { conviene: 'Conviene', empate: 'Empate: da lo mismo en pesos', no_conviene: 'No conviene en pesos' };

  /* ---------- Notas cualitativas (01 §4.2–4.4). El borde va a la nota más alta ---------- */
  L.PALABRA_P = ['', 'Improbable', 'Posible', 'Ocasional', 'Probable', 'Frecuente'];
  L.PALABRA_I = ['', 'Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];
  L.LIMITES_P = [[Q(1), 5], [Q(1, 3), 4], [Q(1, 5), 3], [Q(1, 10), 2]];
  L.notaP = function (aro) {
    for (var k = 0; k < L.LIMITES_P.length; k++) if (L.cmp(aro, L.LIMITES_P[k][0]) >= 0) return L.LIMITES_P[k][1];
    return 1;
  };
  // Fracciones del MTD: 1, 1/3, 1/12, 1/144. Comparación con multiplicación.
  L.FACTORES_D = [[1n, 5], [3n, 4], [12n, 3], [144n, 2]];
  L.notaD = function (duracion, mtd) {
    duracion = q(duracion); mtd = q(mtd);
    for (var k = 0; k < L.FACTORES_D.length; k++) {
      if (L.cmp(L.mul(duracion, L.FACTORES_D[k][0]), mtd) >= 0) return L.FACTORES_D[k][1];
    }
    return 1;
  };
  // Dinero: r = pérdida / umbral. 5 si r ≥ 1; 4 si r ≥ 1/5; 3 si r ≥ 1/20; 2 si r ≥ 1/100.
  L.FACTORES_DINERO = [[1n, 5], [5n, 4], [20n, 3], [100n, 2]];
  L.notaDinero = function (perdida, umbral) {
    perdida = q(perdida); umbral = q(umbral);
    for (var k = 0; k < L.FACTORES_DINERO.length; k++) {
      if (L.cmp(L.mul(perdida, L.FACTORES_DINERO[k][0]), umbral) >= 0) return L.FACTORES_DINERO[k][1];
    }
    return 1;
  };
  L.impacto = function (c, i, d, dinero) { return Math.max(c, i, d, dinero); };
  L.riesgo = function (p, i) { return p * i; };
  L.nivel = function (r) { return r <= 4 ? 'Bajo' : (r <= 12 ? 'Medio' : 'Alto'); };

  /* ---------- Unidades de tiempo (a minutos) ---------- */
  L.MINUTOS = { min: 1, h: 60, d: 1440, sem: 10080 };
  L.aMinutos = function (valor, unidad) { return L.mul(valor, L.MINUTOS[unidad] || 1); };

  /* ---------- Formato (solo para mostrar) ---------- */
  function redondear(a) { // a la unidad, mitades se alejan del cero
    a = q(a); var neg = a.n < 0n, n = abs(a.n);
    var e = (2n * n + a.d) / (2n * a.d);
    return neg ? -e : e;
  }
  L.fmtPesos = function (a) {
    var e = redondear(a), neg = e < 0n;
    var s = String(neg ? -e : e).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg && e !== 0n ? '−' : '') + '$' + s;
  };
  L.fmtPct = function (a) { // fracción -> "46,67 %"
    var x = L.mul(a, 10000), e = redondear(x); // centésimas de %
    var neg = e < 0n; if (neg) e = -e;
    var ent = e / 100n, dec = e % 100n;
    var s = String(ent) + (dec ? ',' + String(dec).padStart(2, '0').replace(/0$/, '') : '');
    return (neg ? '−' : '') + s + ' %';
  };
  L.fmtDecimal = function (a, decimales) {
    decimales = decimales === undefined ? 3 : decimales;
    var f = 10n ** BigInt(decimales), e = redondear(L.mul(a, f)), neg = e < 0n; if (neg) e = -e;
    var ent = e / f, dec = String(e % f).padStart(decimales, '0').replace(/0+$/, '');
    return (neg ? '−' : '') + ent + (dec ? ',' + dec : '');
  };
  L.fmtFraccion = function (a) { // "1/3" o "5"; con coma decimal si conviene
    a = q(a); return a.d === 1n ? String(a.n) : a.n + '/' + a.d;
  };
  L.fmtMinutos = function (m) {
    var x = L.aNumero(m);
    if (x < 60) return fmtNum(x) + ' min';
    if (x < 1440) return fmtNum(x / 60) + ' h';
    return fmtNum(x / 1440) + (x / 1440 === 1 ? ' día' : ' días');
  };
  function fmtNum(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }

  /* ---------- Costo anual de un control ---------- */
  L.costoDeControl = function (control) {
    if (!control) return null;
    var costo = L.leerPesos(control.costo);
    if (costo === null) return null;
    if (control.tipoCosto === 'unico') {
      var vida = L.leerEntero(control.vida);
      if (vida === null || vida <= 0n) return null;
      return L.costoAnual(costo, vida);
    }
    return costo;
  };

  /* ---------- Validación y evaluación de un riesgo (02 §4, pasos 1 a 4) ---------- */
  L.vaDeActivo = function (activo) {
    var total = Q(0), alguna = false;
    for (var k = 0; k < (activo.partes || []).length; k++) {
      var v = L.leerPesos(activo.partes[k].valor);
      if (v === null) return null;
      total = L.suma(total, v); alguna = true;
    }
    return alguna ? total : null;
  };
  L.mtdDeActivo = function (activo) {
    var v = activo && activo.mtd ? L.leerDecimal(activo.mtd.valor) : null;
    if (v === null || v.n === 0n) return null;
    return L.aMinutos(v, activo.mtd.unidad);
  };
  function notaPieza(x) { var n = Number(x); return (n >= 1 && n <= 5 && Math.floor(n) === n) ? n : null; }
  // Pieza D: {modo:'nota', nota} o {modo:'duracion', valor, unidad}
  L.notaDDe = function (d, mtd) {
    if (!d) return null;
    if (d.modo === 'duracion') {
      var v = L.leerDecimal(d.valor);
      if (v === null || mtd === null) return null;
      return L.notaD(L.aMinutos(v, d.unidad), mtd);
    }
    return notaPieza(d.nota);
  };

  L.evaluar = function (riesgo, activo, analisis) {
    var e = {}; // errores por campo
    var umbral = L.leerPesos(analisis.umbral);
    if (umbral === null || umbral.n === 0n) e.umbral = 'El umbral debe ser un monto mayor que $0.';
    var va = activo ? L.vaDeActivo(activo) : null;
    if (va === null || va.n === 0n) e.va = 'El VA debe ser mayor que $0.';
    var mtd = activo ? L.mtdDeActivo(activo) : null;
    if (mtd === null) e.mtd = 'El MTD debe ser mayor que 0.';
    var veces = L.leerEntero(riesgo.veces), anios = L.leerEntero(riesgo.anios);
    if (veces === null || veces <= 0n) e.veces = 'Escribe un número entero mayor que 0.';
    if (anios === null || anios <= 0n) e.anios = 'Escribe un número entero de años mayor que 0.';
    var fe = L.leerDecimal(riesgo.fe);
    if (fe === null || L.cmp(fe, 100) > 0) e.fe = 'El FE va de 0 a 100 %.';
    var c = notaPieza(riesgo.c), i = notaPieza(riesgo.i);
    if (c === null) e.c = 'Elige una nota de 1 a 5.';
    if (i === null) e.i = 'Elige una nota de 1 a 5.';
    var d = L.notaDDe(riesgo.d, mtd);
    if (d === null) e.d = riesgo.d && riesgo.d.modo === 'duracion' ? 'Escribe cuánto dura la caída (y el MTD del activo).' : 'Elige una nota de 1 a 5.';

    // Control (uno por amenaza)
    var ap = riesgo.aplicacion || {};
    var control = ap.controlId ? (analisis.controles || []).filter(function (x) { return x.id === ap.controlId; })[0] : null;
    var avisos = [];
    var con = null;
    if (control) {
      con = {};
      if (ap.cambiaAro) {
        con.veces = L.leerEntero(ap.veces); con.anios = L.leerEntero(ap.anios);
        if (con.veces === null || con.anios === null || con.anios <= 0n) e.aroCon = 'Escribe veces (entero ≥ 0) y años (entero > 0).';
      }
      if (ap.cambiaFe) {
        if (ap.feModo === 'cubierto') {
          var cub = L.leerPesos(ap.cubierto);
          if (cub === null || va === null || L.cmp(cub, va) > 0) e.feCon = 'Lo cubierto va de $0 hasta el VA.';
          else con.fe = L.feCubierto(va, cub), con.cubierto = cub;
        } else {
          var f2 = L.leerDecimal(ap.fe);
          if (f2 === null || L.cmp(f2, 100) > 0) e.feCon = 'El FE va de 0 a 100 %.';
          else con.fe = L.fePorcentaje(f2);
        }
      }
      if (ap.cambiaPiezas) {
        var pz = ap.piezas || {};
        if (pz.c !== undefined && pz.c !== '' && pz.c !== null) { con.c = notaPieza(pz.c); if (con.c === null) e.cCon = 'Nota de 1 a 5.'; }
        if (pz.i !== undefined && pz.i !== '' && pz.i !== null) { con.i = notaPieza(pz.i); if (con.i === null) e.iCon = 'Nota de 1 a 5.'; }
        if (pz.d && (pz.d.modo === 'duracion' ? pz.d.valor !== '' && pz.d.valor !== undefined : pz.d.nota !== '' && pz.d.nota !== undefined)) {
          con.d = L.notaDDe(pz.d, mtd); if (con.d === null) e.dCon = 'Revisa la disponibilidad con control.';
        }
      }
      var cambiaAlgo = (ap.cambiaAro && con.veces !== undefined) || (ap.cambiaFe && con.fe !== undefined) ||
        con.c !== undefined || con.i !== undefined || con.d !== undefined;
      if (!cambiaAlgo && !e.aroCon && !e.feCon) e.control = 'El control tiene que cambiar algo: el ARO, el FE o alguna pieza del impacto.';
      if (L.costoDeControl(control) === null) e.costo = 'Revisa el costo de «' + (control.nombre || 'control') + '».';
    }
    if (Object.keys(e).length) return { ok: false, errores: e };

    // Lado cuanti (pesos)
    var aroSin = L.aro(veces, anios), feSin = L.fePorcentaje(fe);
    var sleSin = L.sle(va, feSin), aleSin = L.ale(sleSin, aroSin);
    // Lado cuali (notas)
    var pSin = L.notaP(aroSin), dineroSin = L.notaDinero(sleSin, umbral);
    var iSin = L.impacto(c, i, d, dineroSin), rSin = L.riesgo(pSin, iSin);
    var sin = { aro: aroSin, fe: feSin, sle: sleSin, ale: aleSin,
      p: pSin, piezas: { c: c, i: i, d: d, dinero: dineroSin }, impacto: iSin, riesgo: rSin, nivel: L.nivel(rSin) };

    var res = { ok: true, errores: {}, va: va, umbral: umbral, mtd: mtd, veces: veces, anios: anios, sin: sin, con: null, control: control || null, avisos: avisos };
    if (!control) return res;

    var aroCon = con.veces !== undefined ? L.aro(con.veces, con.anios) : aroSin;
    var feCon = con.fe !== undefined ? con.fe : feSin;
    var sleCon = L.sle(va, feCon), aleCon = L.ale(sleCon, aroCon);
    var pCon = L.notaP(aroCon);
    var cC = con.c !== undefined ? con.c : c, iC = con.i !== undefined ? con.i : i, dC = con.d !== undefined ? con.d : d;
    var dineroCon = L.notaDinero(sleCon, umbral);
    var iCon = L.impacto(cC, iC, dC, dineroCon), rCon = L.riesgo(pCon, iCon);
    res.con = { aro: aroCon, fe: feCon, sle: sleCon, ale: aleCon, cubierto: con.cubierto || null,
      cambia: { aro: con.veces !== undefined, fe: con.fe !== undefined, c: con.c !== undefined, i: con.i !== undefined, d: con.d !== undefined },
      p: pCon, piezas: { c: cC, i: iC, d: dC, dinero: dineroCon }, impacto: iCon, riesgo: rCon, nivel: L.nivel(rCon) };
    res.reduccion = L.reduccion(aleSin, aleCon);
    res.costo = L.costoDeControl(control);
    res.mejora = rSin - rCon;
    res.cambioNivel = sin.nivel !== res.con.nivel;

    // Un control nunca es perfecto: se pide confirmar (01 §4.5)
    if (con.fe !== undefined && con.fe.n === 0n) avisos.push('fe0');
    ['c', 'i', 'd'].forEach(function (k) { if (con[k] === 1 && sin.piezas[k] === 5) avisos.push('pieza_' + k); });
    if (aroCon.n === 0n) avisos.push('aro0');
    return res;
  };

  /* ---------- Valor neto por control: Σ reducciones de sus amenazas − costo anual (una vez) ---------- */
  L.valorNetoPorControl = function (analisis, resultados) {
    var out = {};
    (analisis.controles || []).forEach(function (ctl) {
      var costo = L.costoDeControl(ctl);
      var red = Q(0), usos = 0;
      resultados.forEach(function (r) {
        if (r.ok && r.control && r.control.id === ctl.id) { red = L.suma(red, r.reduccion); usos++; }
      });
      if (costo === null) return;
      var neto = L.valorNeto(red, costo);
      out[ctl.id] = { reduccion: red, costo: costo, neto: neto, veredicto: L.veredicto(neto), usos: usos };
    });
    return out;
  };

  /* Veredicto cualitativo y si cuanti y cuali apuntan a lados opuestos */
  L.veredictoCuali = function (mejora) { return mejora > 0 ? 'mejora' : (mejora === 0 ? 'igual' : 'empeora'); };
  L.coinciden = function (veredictoCuanti, mejora) {
    if (veredictoCuanti === 'no_conviene' && mejora > 0) return false;
    if (veredictoCuanti === 'conviene' && mejora <= 0) return false;
    return true;
  };

  /* ---------- Tratamiento del riesgo (docs/03-tratamiento.md) ---------- */
  L.ORDEN_NIVEL = { Bajo: 1, Medio: 2, Alto: 3 };
  L.TRATAMIENTOS = ['mitigar', 'transferir', 'aceptar', 'evitar'];
  // ¿El riesgo (P × I) está dentro del umbral de aceptación ('Bajo' por defecto, o 'Medio')?
  L.dentroDeUmbral = function (riesgo, umbral) { return L.ORDEN_NIVEL[L.nivel(riesgo)] <= L.ORDEN_NIVEL[umbral || 'Bajo']; };
  // Sugerencia, nunca decisión. resultado = evaluar(...); vn = valor neto del control (o null); control = el control aplicado.
  L.sugerirTratamiento = function (resultado, vn, control, umbral) {
    if (L.dentroDeUmbral(resultado.sin.riesgo, umbral)) return { opcion: 'aceptar', motivo: 'dentro_umbral' };
    if (resultado.con && vn && L.cmp(vn.neto, 0) > 0) return { opcion: control && control.transfiere ? 'transferir' : 'mitigar', motivo: 'neto_positivo' };
    return { opcion: 'evitar_o_aceptar', motivo: 'nada_compensa' };
  };
  // Aceptar = asumir el riesgo sin control; si supera el umbral es una excepción y pide el FAR-lite.
  L.pideFAR = function (opcion, resultado, umbral) { return opcion === 'aceptar' && !L.dentroDeUmbral(resultado.sin.riesgo, umbral); };
  L.erroresFAR = function (far) {
    var e = {}; far = far || {};
    if (!String(far.motivo || '').trim()) e.motivo = 'Escribe por qué aceptas este riesgo.';
    if (!String(far.plan || '').trim()) e.plan = 'Escribe el plan de acción.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(far.fecha || '')) e.fecha = 'Elige la fecha límite del plan.';
    return e;
  };
  // Fecha ISO + n meses (si el día no existe en ese mes, el último día del mes). Sin zonas horarias.
  L.sumarMeses = function (iso, n) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return null;
    var y = +m[1], mes = +m[2] - 1 + n, d = +m[3];
    y += Math.floor(mes / 12); mes = ((mes % 12) + 12) % 12;
    var ultimo = new Date(Date.UTC(y, mes + 1, 0)).getUTCDate();
    var dd = Math.min(d, ultimo);
    return y + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
  };
  L.fmtFecha = function (iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; };
  // Aviso: el precio del control (pago único) o su costo anual supera el VA del activo.
  L.controlMasCaroQueVA = function (control, va) {
    var p = L.leerPesos(control && control.costo);
    return p !== null && va !== null && L.cmp(p, va) > 0;
  };

  /* ---------- Orden de la lista final: residual P × I desc, desempate ALE residual desc ---------- */
  L.residual = function (r) { return r.con ? r.con : r.sin; };
  L.ordenar = function (items) { // items: [{resultado, ...}]
    return items.slice().sort(function (a, b) {
      var ra = L.residual(a.resultado), rb = L.residual(b.resultado);
      if (rb.riesgo !== ra.riesgo) return rb.riesgo - ra.riesgo;
      return L.cmp(rb.ale, ra.ale);
    });
  };

  return L;
});
