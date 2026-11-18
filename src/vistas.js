/* Vistas: cada pantalla es una función que devuelve HTML. Sin lógica de cálculo:
   todo número sale de Logica; todo texto de estudio, de TEXTOS o Guia. */
var Vistas = (function () {
  'use strict';
  var L = Logica, T = TEXTOS, C = CATALOGOS, E = TEXTOS.estudio;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function estudio() { return Estado.prefs.estudio; }

  // Sigla: botón con su nombre en inglés y su traducción, al pasar, enfocar o tocar (app.js lo ubica).
  var nTip = 0;
  function S(clave) {
    var s = T.siglas[clave]; if (!s) return esc(clave);
    var id = 'tip-' + (++nTip);
    return '<span class="sigla-env"><button type="button" class="sigla" aria-expanded="false" aria-controls="' + id + '"><abbr>' + clave + '</abbr></button>' +
      '<span class="sigla-tip" id="' + id + '" role="tooltip"><b>' + clave + '</b> · <span lang="en">' + esc(s.en) + '</span><span class="sigla-es">' + esc(s.es) + '</span></span></span>';
  }

  function opciones(lista, sel, vacio) {
    var h = vacio ? '<option value="">' + esc(vacio) + '</option>' : '';
    lista.forEach(function (o) { h += '<option value="' + esc(o.id) + '"' + (String(o.id) === String(sel) ? ' selected' : '') + '>' + esc(o.nombre) + '</option>'; });
    return h;
  }
  function opcionesNota(sel, vacio) {
    var l = [];
    for (var n = 1; n <= 5; n++) l.push({ id: n, nombre: n + ' · ' + L.PALABRA_I[n] });
    return opciones(l, sel, vacio);
  }

  /* ---------- Piezas de formulario ---------- */
  function idDe(ruta) { return 'f-' + ruta.replace(/\./g, '-'); }
  function campo(o) {
    var id = idDe(o.ruta), ayudaId = o.ayuda ? id + '-ayuda' : '', errId = o.err ? 'err-' + o.err : '';
    var h = '<div class="campo' + (o.clase ? ' ' + o.clase : '') + '">';
    h += '<label for="' + id + '">' + o.etiqueta + '</label>';
    h += '<div class="entrada">' + (o.prefijo ? '<span class="afijo" aria-hidden="true">' + o.prefijo + '</span>' : '');
    h += '<input id="' + id + '" type="' + (o.tipo || 'text') + '" data-campo="' + esc(o.ruta) + '" value="' + esc(o.valor) + '"' +
      (o.modo ? ' inputmode="' + o.modo + '"' : '') + ' autocomplete="off"' +
      (ayudaId ? ' aria-describedby="' + ayudaId + '"' : '') + (errId ? ' data-error="' + errId + '" data-errkey="' + o.err + '" aria-invalid="false"' : '') +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + '>';
    h += (o.sufijo ? '<span class="afijo" aria-hidden="true">' + o.sufijo + '</span>' : '') + '</div>';
    if (o.ayuda) h += '<p class="ayuda" id="' + ayudaId + '">' + o.ayuda + '</p>';
    if (o.vivo) h += '<p class="vivo" data-vivo="' + o.vivo + '"' + (o.vivoArgs ? ' data-args="' + esc(o.vivoArgs) + '"' : '') + '></p>';
    if (errId) h += '<p class="error" id="' + errId + '" data-err="' + o.err + '" hidden></p>';
    return h + '</div>';
  }
  function areaTexto(o) {
    var id = idDe(o.ruta), errId = o.err ? 'err-' + o.err : '';
    return '<div class="campo"><label for="' + id + '">' + o.etiqueta + '</label><textarea id="' + id + '" rows="' + (o.filas || 3) + '" data-campo="' + esc(o.ruta) + '"' +
      (errId ? ' data-error="' + errId + '" data-errkey="' + o.err + '" aria-invalid="false"' : '') + '>' + esc(o.valor) + '</textarea>' +
      (o.ayuda ? '<p class="ayuda">' + o.ayuda + '</p>' : '') + (errId ? '<p class="error" id="' + errId + '" data-err="' + o.err + '" hidden></p>' : '') + '</div>';
  }
  function seleccion(o) {
    var id = idDe(o.ruta), errId = o.err ? 'err-' + o.err : '';
    var h = '<div class="campo' + (o.clase ? ' ' + o.clase : '') + '"><label for="' + id + '">' + o.etiqueta + '</label>';
    h += '<select id="' + id + '" data-campo="' + esc(o.ruta) + '"' + (o.ayuda ? ' aria-describedby="' + id + '-ayuda"' : '') +
      (errId ? ' data-error="' + errId + '" data-errkey="' + o.err + '" aria-invalid="false"' : '') + '>' + o.opciones + '</select>';
    if (o.ayuda) h += '<p class="ayuda" id="' + id + '-ayuda">' + o.ayuda + '</p>';
    if (errId) h += '<p class="error" id="' + errId + '" data-err="' + o.err + '" hidden></p>';
    return h + '</div>';
  }
  function origen(ruta, valor, etiqueta) {
    return seleccion({ ruta: ruta, etiqueta: etiqueta || '¿De dónde sale este dato?', opciones: opciones(C.origenes, valor), clase: 'campo-origen' });
  }
  function casilla(ruta, marcado, texto, ayuda) {
    var id = idDe(ruta);
    return '<div class="casilla"><input type="checkbox" id="' + id + '" data-campo="' + esc(ruta) + '"' + (marcado ? ' checked' : '') + '>' +
      '<label for="' + id + '">' + texto + (ayuda ? ' <span class="tenue">' + ayuda + '</span>' : '') + '</label></div>';
  }
  function segmentos(ruta, valor, lista, leyenda) {
    var h = '<fieldset class="segmentos"><legend>' + leyenda + '</legend><div class="seg">';
    lista.forEach(function (o) {
      var id = idDe(ruta) + '-' + o.id;
      h += '<input type="radio" id="' + id + '" name="' + esc(ruta) + '" value="' + esc(o.id) + '" data-campo="' + esc(ruta) + '"' + (valor === o.id ? ' checked' : '') + '><label for="' + id + '">' + o.nombre + '</label>';
    });
    return h + '</div></fieldset>';
  }

  /* Escala de 1 a 5 en botones grandes: la nota se ve, no se esconde en una lista. */
  function escala(o) {
    var errId = o.err ? 'err-' + o.err : '', h = '<fieldset class="escala"' + (o.desc ? ' aria-describedby="' + o.desc + '"' : '') +
      (errId ? ' data-error="' + errId + '" data-errkey="' + o.err + '" aria-invalid="false"' : '') + '><legend class="solo-lector">' + o.leyenda + '</legend><div class="escala-ops">';
    for (var n = 1; n <= 5; n++) {
      var id = idDe(o.ruta) + '-' + n;
      h += '<input type="radio" id="' + id + '" name="' + esc(o.ruta) + '" value="' + n + '" data-campo="' + esc(o.ruta) + '"' + (String(o.valor) === String(n) ? ' checked' : '') + '>' +
        '<label for="' + id + '"><b>' + n + '</b><span>' + L.PALABRA_I[n] + '</span></label>';
    }
    h += '</div>';
    if (errId) h += '<p class="error" id="' + errId + '" data-err="' + o.err + '" hidden></p>';
    return h + '</fieldset>';
  }

  /* ---------- Piezas visuales ---------- */
  function nivelHtml(riesgo) {
    var n = L.nivel(riesgo);
    return '<span class="nivel nivel-' + n.toLowerCase() + '"><b>' + riesgo + '</b> ' + n + '</span>';
  }
  function veredictoHtml(v) {
    var icono = { conviene: '↑', empate: '=', no_conviene: '↓' }[v];
    return '<span class="veredicto veredicto-' + v + '"><span aria-hidden="true">' + icono + '</span> ' + L.FRASE_VEREDICTO[v] + '</span>';
  }
  function aroTexto(aro) {
    var f = L.fmtFraccion(aro);
    return aro.d === 1n ? f : f + ' <span class="tenue">≈ ' + L.fmtDecimal(aro) + '</span>';
  }
  function boton(accion, texto, clase, extra) {
    return '<button type="button" class="' + (clase || 'btn') + '" data-accion="' + accion + '"' + (extra || '') + '>' + texto + '</button>';
  }
  function siguiente(pantalla, texto) {
    return '<div class="pie-pantalla">' + boton('ir', texto + ' <span aria-hidden="true">→</span>', 'btn btn-primario', ' data-destino="' + pantalla + '"') + '</div>';
  }
  function opsHtml(ops) {
    return ops.map(function (o) { return '<span class="op-chip op-' + o + '">' + T.operaciones[o] + '</span>'; }).join('');
  }
  function cabecera(id) {
    var k = 0; T.pantallas.forEach(function (p, j) { if (p.id === id) k = j; });
    var p = T.pantallas[k];
    var h = '<header class="cab"><p class="cab-paso">Paso ' + (k + 1) + ' de 5</p><h1 tabindex="-1">' + p.titulo + '</h1>';
    return h + '</header>';
  }
  function nota(html, clase) { return '<div class="nota ' + (clase || '') + '">' + html + '</div>'; }
  // Material de estudio: no se muestra dentro de la tarjeta; app.js lo copia al apéndice de al lado.
  function margen(html) { return estudio() ? '<div class="margen" hidden>' + html + '</div>' : ''; }
  function estudioAbierto() { return Estado.ui.abiertos.estudio !== false; }
  function tropiezo(n) { return '<p class="tropiezo"><span class="tropiezo-etq">Tropiezo frecuente</span> ' + esc(T.errores[n]) + '</p>'; }
  function formula(txt) { return '<code class="formula">' + txt + '</code>'; }

  function nombreRiesgo(r) {
    var a = Estado.activo(r.activoId), am = C.amenaza(r.familia, r.amenaza);
    return (r.etiqueta || (am ? am.nombre : 'Amenaza sin nombre')) + (a ? ' · ' + (a.nombre || 'activo') : '');
  }
  function selectorChips(items, sel, accion, accionNuevo, textoNuevo, etiqueta) {
    var h = '<nav class="chips" aria-label="' + etiqueta + '"><ul>';
    items.forEach(function (it) {
      h += '<li><button type="button" class="chip" data-accion="' + accion + '" data-id=\"' + esc(it.id) + '\"' + (it.id === sel ? ' aria-current="true"' : '') + '>' + esc(it.nombre) + '</button></li>';
    });
    if (accionNuevo) h += '<li>' + boton(accionNuevo, '<span aria-hidden="true">+</span> ' + textoNuevo, 'chip chip-nuevo') + '</li>';
    return h + '</ul></nav>';
  }
  /* Un concepto por tarjeta: cada pantalla es un mazo de diapositivas y se ve una a la vez. */
  function diapo(titulo, cuerpo, o) { o = o || {}; o.titulo = titulo; o.cuerpo = cuerpo; return o; }
  var CHIP = { cuanti: '<span class="lado-chip lado-cuanti">Pesos</span>', cuali: '<span class="lado-chip lado-cuali">Notas</span>' };
  function indicePantalla(id) { for (var j = 0; j < T.pantallas.length; j++) if (T.pantallas[j].id === id) return j; return -1; }
  function mazo(id, diapos, fin, pre) {
    var n = diapos.length, d = Estado.ui.diapo, k = Math.max(0, Math.min(d[id] || 0, n - 1));
    d[id] = k;
    var est = estudio(), abierto = estudioAbierto();
    var h = '<div class="escena' + (est ? ' con-estudio' + (abierto ? '' : ' estudio-cerrado') : '') + '"><div class="escena-cab">' + (pre || '') + '</div><div class="tarjeta"><div class="pila">';
    diapos.forEach(function (x, i) {
      var hid = x.id || 'dt-' + i;
      h += '<section class="sec' + (x.clase ? ' ' + x.clase : '') + '" aria-labelledby="' + hid + '"' + (i === k ? '' : ' hidden') + '>' +
        '<p class="sec-num">' + (i + 1) + ' de ' + n + (x.lado ? ' · ' + CHIP[x.lado] : '') + '</p>' +
        '<h2 id="' + hid + '" tabindex="-1">' + esc(x.titulo) + (x.sigla ? ' ' + S(x.sigla) : '') + '</h2>' +
        '<div class="sec-cuerpo">' + x.cuerpo + '</div></section>';
    });
    var j = indicePantalla(id), ant;
    if (k > 0) ant = boton('diapoAnt', '<span aria-hidden="true">←</span> Anterior', 'btn btn-texto');
    else if (j > 0) ant = boton('diapoAnt', '<span aria-hidden="true">←</span> ' + T.pantallas[j - 1].corto, 'btn btn-texto');
    else ant = '<span></span>';
    var puntos = '<span></span>';
    if (n > 1) {
      puntos = '<ol class="puntos">' + diapos.map(function (x, i) {
        return '<li><button type="button" class="punto" data-accion="diapoIr" data-k="' + i + '" aria-label="' + (i + 1) + ': ' + esc(x.titulo + (x.sigla ? ' ' + x.sigla : '')) + '"' + (i === k ? ' aria-current="step"' : '') + '></button></li>';
      }).join('') + '</ol>';
    }
    var sig = k < n - 1 ? boton('diapoSig', 'Siguiente <span aria-hidden="true">→</span>', 'btn btn-primario') : (fin || '<span></span>');
    h += '</div><nav class="diapo-nav" aria-label="Partes de este paso">' + ant + puntos + sig + '</nav></div>';
    if (est) {
      var p = T.pantallas[j];
      h += '<aside class="apendice" aria-labelledby="ap-tit">' +
        '<button type="button" class="apendice-tirador" data-accion="panelEstudio" aria-expanded="' + abierto + '" aria-controls="ap-in">' +
        '<span id="ap-tit">Estudio</span><span class="chev" aria-hidden="true"></span></button>' +
        '<div class="apendice-in" id="ap-in"' + (abierto ? '' : ' hidden') + '>' +
        '<div class="ap-paso"><p>' + p.queHacemos + '</p>' + (p.ops.length ? '<p class="cab-ops"><span class="tenue">Operación:</span> ' + opsHtml(p.ops) + '</p>' : '') + '</div>' +
        '<div class="apendice-notas"></div></div></aside>';
    }
    return h + '</div>';
  }
  function avanzar(destino, texto) { return boton('ir', texto + ' <span aria-hidden="true">→</span>', 'btn btn-primario', ' data-destino="' + destino + '"'); }

  /* ---------- Tablas de referencia (lado cualitativo) ---------- */
  function ref(caption, cols, filas, pie) {
    var h = '<table class="ref"><caption><span class="lado-chip lado-cuali">Notas</span> ' + caption + '</caption><thead><tr>' +
      cols.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    filas.forEach(function (f, j) { h += '<tr' + (f.marcada ? ' class="marcada"' : '') + '><th scope="row">' + f.celdas[0] + '</th>' + f.celdas.slice(1).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table>' + (pie ? '<p class="ref-pie">' + pie + '</p>' : '');
  }
  function tablaP(marcar) {
    var filas = [[5, '1 vez al año o más', 'desde 1'], [4, 'cada 1 a 3 años', 'desde 1/3'], [3, 'cada 3 a 5 años', 'desde 1/5'], [2, 'cada 5 a 10 años', 'desde 1/10'], [1, 'menos de 1 vez en 10 años', 'menos de 1/10']];
    return ref('Del ARO a la nota P', ['Nota', 'Significa', 'ARO'], filas.map(function (f) { return { celdas: [f[0] + ' · ' + L.PALABRA_P[f[0]], f[1], f[2]], marcada: marcar === f[0] }; }), 'En el borde va a la nota más alta.');
  }
  function tablaDinero(marcar) {
    var u = L.leerPesos(Estado.analisis.umbral);
    var filas = [[5, 'llega al umbral o más', 1n], [4, 'desde 1/5 del umbral', 5n], [3, 'desde 1/20 del umbral', 20n], [2, 'desde 1/100 del umbral', 100n], [1, 'menos que eso', null]];
    return ref('De pesos a la nota de Dinero', ['Nota', 'Si la pérdida de un evento…', 'Con tu umbral'],
      filas.map(function (f) { return { celdas: [String(f[0]), f[1], u && u.n > 0n && f[2] ? 'desde ' + L.fmtPesos(L.div(u, f[2])) : ''], marcada: marcar === f[0] }; }), 'En el borde va a la nota más alta.');
  }
  function tablaEscalaD(mtd) {
    var filas = [[5, 'desde 1 MTD', 1n], [4, 'desde 1/3 del MTD', 3n], [3, 'desde 1/12 del MTD', 12n], [2, 'desde 1/144 del MTD', 144n], [1, 'menos que eso', null]];
    return ref('Escala de disponibilidad de este activo', ['Nota', 'Si quedas sin él…', 'Con este MTD'],
      filas.map(function (f) { return { celdas: [f[0] + ' · ' + L.PALABRA_I[f[0]], f[1], mtd && f[2] ? 'desde ' + L.fmtMinutos(L.div(mtd, f[2])) : ''] }; }));
  }
  function tablaNiveles(marcar) {
    var n = marcar ? L.nivel(marcar) : null;
    return ref('De P × I al nivel', ['P × I', 'Nivel'], [
      { celdas: ['1 a 4', '<span class="nivel nivel-bajo">Bajo</span>'], marcada: n === 'Bajo' },
      { celdas: ['5 a 12', '<span class="nivel nivel-medio">Medio</span>'], marcada: n === 'Medio' },
      { celdas: ['15 a 25', '<span class="nivel nivel-alto">Alto</span>'], marcada: n === 'Alto' }]);
  }
  function versus() {
    return '<div class="versus">' + E.versus.map(function (v) {
      return '<div class="vs"><p class="vs-preg">' + v.pregunta + '</p><p class="vs-tit">' + v.titulo + '</p><p>' + S(v.sigla) + '. ' + v.ejemplo + '</p></div>';
    }).join('') + '</div>';
  }

  /* ================= 1. Inicio ================= */
  function inicio() {
    var a = Estado.analisis, h = cabecera('inicio'), d = [];
    var b0 = '<p class="lead">Calcula cuánto te puede costar una amenaza, en pesos y en notas de 1 a 5, antes y después de ponerle un control.</p>';
    b0 += '<div class="opciones-inicio">' + boton('ejemplo', 'Cargar el ejemplo del celular', 'btn btn-tonal') + boton('vacio', 'Empezar vacío', 'btn') +
      boton('abrir', 'Abrir un análisis guardado', 'btn') + boton('guia', 'Ver el ejemplo guiado, paso a paso', 'btn btn-texto') + '</div>';
    d.push(diapo('¿Cómo quieres empezar?', b0));

    var b1 = '<p class="lead">Vale para todo el análisis. Los controles los anotas después, en cada amenaza.</p>';
    b1 += campo({ ruta: 'umbral', etiqueta: '¿Cuánto dinero sería catastrófico perder de una vez?', valor: a.umbral, modo: 'numeric', prefijo: '$', err: 'umbral', vivo: 'umbral',
      ayuda: 'Para una persona puede ser un sueldo; para una empresa, mucho más. Ese monto marca la nota 5 de la pieza Dinero.' });
    b1 += margen('<p>' + E.umbral + '</p>' + tablaDinero());
    d.push(diapo('Umbral de dinero', b1));

    var b2 = '<p class="lead">¿Hasta qué nivel aceptas un riesgo sin más trámite? Por encima, aceptarlo es una excepción con plan y fecha.</p>';
    b2 += '<div class="sec-segmentos">' + segmentos('umbralAceptacion', a.umbralAceptacion || 'Bajo', [{ id: 'Bajo', nombre: 'Solo Bajo (P × I hasta 4)' }, { id: 'Medio', nombre: 'Hasta Medio (hasta 12)' }], '<span class="solo-lector">Umbral de aceptación</span>') + '</div>';
    b2 += '<p class="pista">Si no sabes, deja «Solo Bajo».</p>' + margen('<p>' + T.tratamiento.umbral + '</p>' + tablaNiveles());
    d.push(diapo('Qué riesgo aceptas', b2));
    return mazo('inicio', d, avanzar('activo', 'Siguiente: el activo'), h);
  }

  /* Datos de un control de la lista única (se usa en la amenaza y en el resumen). */
  function campoTransfiere(ctl, k) {
    return casilla('controles.' + k + '.transfiere', !!ctl.transfiere, 'Es un seguro o un contrato', 'otro paga la pérdida: eso es transferir el riesgo');
  }
  function editorControl(ctl, k, conQuitar, soloCosto) {
    var base = 'controles.' + k, h = '<fieldset class="editor-control"><legend class="solo-lector">Datos del control ' + esc(ctl.nombre || k + 1) + '</legend>';
    if (!soloCosto) h += campo({ ruta: base + '.nombre', etiqueta: 'Nombre del control', valor: ctl.nombre, err: 'ctl-nombre-' + k, placeholder: 'Ej.: respaldo en la nube' }) + campoTransfiere(ctl, k);
    h += segmentos(base + '.tipoCosto', ctl.tipoCosto, [{ id: 'anual', nombre: 'Cada año' }, { id: 'unico', nombre: 'Una sola vez' }], '¿Cómo se paga?');
    h += '<div class="fila">' + campo({ ruta: base + '.costo', etiqueta: ctl.tipoCosto === 'unico' ? 'Precio' : 'Costo al año', valor: ctl.costo, modo: 'numeric', prefijo: '$', err: 'ctl-costo-' + k });
    if (ctl.tipoCosto === 'unico') h += campo({ ruta: base + '.vida', etiqueta: 'Años de vida', valor: ctl.vida, modo: 'numeric', sufijo: 'años', err: 'ctl-vida-' + k });
    h += '</div><p class="vivo" data-vivo="costoControl" data-args="' + k + '"></p>';
    h += '<div class="fila fila-fin">' + origen(base + '.origen', ctl.origen, '¿De dónde sale el costo?') +
      (conQuitar ? boton('quitarControl', 'Quitar', 'btn btn-texto btn-peligro', ' data-id=\"' + esc(ctl.id) + '\" aria-label="Quitar ' + esc(ctl.nombre || 'control ' + (k + 1)) + '"') : '') + '</div>';
    return h + '</fieldset>';
  }
  function usosDe(controlId) {
    return Estado.analisis.riesgos.filter(function (r) { return r.aplicacion && r.aplicacion.controlId === controlId; }).length;
  }

  /* ================= 2. Activo ================= */
  function activo() {
    var a = Estado.analisis, h = cabecera('activo'), d = [];
    h += selectorChips(a.activos.map(function (x) { return { id: x.id, nombre: x.nombre || 'Activo sin nombre' }; }), Estado.ui.activoId, 'elegirActivo', 'agregarActivo', 'Agregar activo', 'Activos');
    var act = Estado.activo(Estado.ui.activoId);
    if (!act) return h + nota('Agrega un activo para seguir.');
    var k = Estado.indice('activos', act.id), base = 'activos.' + k;

    var b1 = '<div class="fila">' + seleccion({ ruta: base + '.tipo', etiqueta: 'Tipo', opciones: opciones(C.tiposActivo, act.tipo) }) +
      campo({ ruta: base + '.nombre', etiqueta: 'Nombre', valor: act.nombre, placeholder: 'Ej.: notebook de la oficina' }) + '</div>';
    b1 = '<p class="lead">Lo que quieres proteger: un aparato, unos datos o un servicio.</p>' + b1;
    b1 += '<div class="derecha">' + boton('quitarActivo', 'Quitar este activo', 'btn btn-texto btn-peligro', ' data-id=\"' + esc(act.id) + '\"') + '</div>';
    d.push(diapo('Qué es', b1));

    var b2 = '<p class="lead">Suma lo que vale cada parte: el aparato y también los datos.</p>';
    act.partes.forEach(function (p, j) {
      b2 += '<div class="fila fila-fin fila-parte">' + campo({ ruta: base + '.partes.' + j + '.nombre', etiqueta: 'Parte', valor: p.nombre }) +
        campo({ ruta: base + '.partes.' + j + '.valor', etiqueta: 'Valor', valor: p.valor, modo: 'numeric', prefijo: '$', err: 'parte-' + j }) +
        (act.partes.length > 1 ? boton('quitarParte', 'Quitar', 'btn btn-texto btn-peligro', ' data-j="' + j + '" aria-label="Quitar la parte ' + esc(p.nombre || j + 1) + '"') : '') + '</div>';
    });
    b2 += boton('agregarParte', '<span aria-hidden="true">+</span> Agregar parte', 'btn btn-texto');
    b2 += '<p class="resultado-vivo" data-vivo="va"></p>';
    b2 += margen('<p>' + E.va + '</p>' + tropiezo(15));
    d.push(diapo('Cuánto vale', b2, { sigla: 'VA' }));

    var b3 = '<p class="lead">¿Cuánto tiempo puedes estar sin él antes de que sea grave?</p>';
    b3 += '<div class="fila">' + campo({ ruta: base + '.mtd.valor', etiqueta: 'Tiempo', valor: act.mtd.valor, modo: 'decimal', err: 'mtd' }) +
      seleccion({ ruta: base + '.mtd.unidad', etiqueta: 'Unidad', opciones: opciones(C.unidades, act.mtd.unidad) }) + '</div>';
    b3 += '<p class="ayuda">Por ejemplo: si lo usas para trabajar, quizás 1 día; si tienes otro equipo de respaldo, más. No importa la causa: que se rompa, que te lo roben o que esté en reparación.</p>';
    b3 += '<div data-vivo="escalaD"></div>';
    d.push(diapo('Cuánto aguantas sin él', b3, { sigla: 'MTD' }));
    return mazo('activo', d, avanzar('amenaza', 'Siguiente: la amenaza'), h);
  }

  /* ================= 3. Amenaza y control ================= */
  function amenaza() {
    var a = Estado.analisis, h = cabecera('amenaza'), d = [];
    if (!a.activos.length) return h + nota('Primero agrega un activo.') + siguiente('activo', 'Ir al activo');
    h += selectorChips(a.riesgos.map(function (r) { return { id: r.id, nombre: nombreRiesgo(r) }; }), Estado.ui.riesgoId, 'elegirRiesgo', 'agregarRiesgo', 'Agregar amenaza', 'Amenazas');
    var r = Estado.riesgo(Estado.ui.riesgoId);
    if (!r) return h + nota('Agrega una amenaza para seguir.');
    var k = Estado.indice('riesgos', r.id), b = 'riesgos.' + k, fam = C.buscar(C.familias, r.familia);
    h += '<div data-vivo="erroresActivo"></div>';

    var s1 = '<div class="fila">' + seleccion({ ruta: b + '.activoId', etiqueta: 'Activo', opciones: opciones(a.activos.map(function (x) { return { id: x.id, nombre: x.nombre || 'Activo sin nombre' }; }), r.activoId) }) +
      seleccion({ ruta: b + '.familia', etiqueta: 'Familia', opciones: opciones(C.familias, r.familia, 'Elige una familia'), ayuda: fam ? esc(fam.ayuda) : '' }) + '</div>';
    s1 += '<div class="fila">' + seleccion({ ruta: b + '.amenaza', etiqueta: 'Amenaza', opciones: opciones(fam ? fam.amenazas : [], r.amenaza, fam ? 'Elige una amenaza' : 'Primero elige la familia') }) +
      campo({ ruta: b + '.etiqueta', etiqueta: 'Nombre corto (opcional)', valor: r.etiqueta, placeholder: 'Para distinguir dos parecidas' }) + '</div>';
    s1 += '<div class="derecha">' + boton('quitarRiesgo', 'Quitar esta amenaza', 'btn btn-texto btn-peligro', ' data-id=\"' + esc(r.id) + '\"') + '</div>';
    d.push(diapo('Qué pasa', s1));

    var s2 = '<div class="fila fila-fin">' + campo({ ruta: b + '.veces', etiqueta: 'Veces', valor: r.veces, modo: 'numeric', err: 'veces', clase: 'campo-corto' }) + '<span class="en">en</span>' +
      campo({ ruta: b + '.anios', etiqueta: 'Años', valor: r.anios, modo: 'numeric', err: 'anios', clase: 'campo-corto' }) + '</div>';
    s2 += '<p class="resultado-vivo" data-vivo="aro"></p>' + origen(b + '.origenes.aro', r.origenes.aro);
    s2 += '<div data-vivo="margenP"></div>';
    d.push(diapo('Cada cuánto pasa', s2, { sigla: 'ARO', lado: 'cuanti' }));

    var s3 = campo({ ruta: b + '.fe', etiqueta: 'Qué parte del valor se pierde cada vez', valor: r.fe, modo: 'decimal', sufijo: '%', err: 'fe', ayuda: 'De 0 a 100 %.' });
    s3 += '<p class="resultado-vivo" data-vivo="sle"></p>' + origen(b + '.origenes.fe', r.origenes.fe);
    s3 += margen('<p>' + E.fe + '</p>' + tropiezo(2));
    d.push(diapo('Cuánto duele', s3, { sigla: 'FE', lado: 'cuanti' }));

    // Qué pierdes: una pieza por tarjeta y, al final, el impacto
    ['c', 'i'].forEach(function (x) {
      var pz = T.piezas[x];
      d.push(diapo(pz.nombre, '<p class="lead" id="lead-' + x + '">' + pz.pregunta + '</p><p class="pista">Puntúa la consecuencia: si esto pasa, ¿qué pierdes?</p>' +
        escala({ ruta: b + '.' + x, valor: r[x], leyenda: 'Nota de ' + pz.nombre.toLowerCase(), err: x, desc: 'lead-' + x }), { lado: 'cuali' }));
    });
    d.push(diapo('Disponibilidad', '<p class="lead">' + T.piezas.d.pregunta + '</p>' + piezaD(b + '.d', r.d, 'd', 'Disponibilidad', '', false, true) +
      (r.d && r.d.modo === 'duracion' ? '<div class="resultado-vivo centro-flex" data-vivo="notaD"></div>' : ''), { lado: 'cuali' }));
    d.push(diapo('El impacto', '<p class="lead">Las cuatro piezas, y el impacto se queda con la más alta.</p><div data-vivo="impactoSin"></div>' +
      origen(b + '.origenes.impacto', r.origenes.impacto, '¿De dónde salen estas notas?'), { sigla: 'I', lado: 'cuali' }));

    diaposControl(r, b).forEach(function (x) { d.push(x); });
    return mazo('amenaza', d, boton('verResultado', 'Ver el resultado <span aria-hidden="true">→</span>', 'btn btn-primario'), h);
  }

  function piezaD(ruta, d, err, etiqueta, ayuda, sinCambio, grande) {
    d = d || { modo: 'nota' };
    var h = '<div class="pieza-d' + (grande ? ' pieza-d-grande' : '') + '">' + segmentos(ruta + '.modo', d.modo, [{ id: 'duracion', nombre: 'Por duración' }, { id: 'nota', nombre: 'Nota directa' }], grande ? '<span class="solo-lector">¿Cómo indicas la disponibilidad?</span>' : etiqueta + (ayuda ? ' <span class="tenue">· ' + ayuda + '</span>' : ''));
    if (d.modo === 'duracion') {
      h += '<div class="fila">' + campo({ ruta: ruta + '.valor', etiqueta: 'Tiempo sin poder usarlo', valor: d.valor, modo: 'decimal', err: err }) +
        seleccion({ ruta: ruta + '.unidad', etiqueta: 'Unidad', opciones: opciones(C.unidades, d.unidad) }) + '</div>';
    } else if (grande) {
      h += escala({ ruta: ruta + '.nota', valor: d.nota, leyenda: 'Nota de disponibilidad', err: err });
    } else {
      h += seleccion({ ruta: ruta + '.nota', etiqueta: 'Nota de disponibilidad', opciones: opcionesNota(d.nota, sinCambio ? 'Sin cambio' : 'Elige'), err: err });
    }
    return h + '</div>';
  }

  /* El control, en tarjetas cortas: cuál es, lo que cuesta, qué cambia y el detalle de cada cambio. */
  function diaposControl(r, b) {
    var a = Estado.analisis, ap = r.aplicacion, d = [];
    var h = '<p class="lead">Un control a la vez. Para comparar otro, agrega la misma amenaza otra vez.</p>';
    var nuevo = boton('nuevoControl', '<span aria-hidden="true">+</span> Nuevo control', 'btn btn-tonal');
    if (!a.controles.length) {
      d.push(diapo('El control', h + nota('Todavía no hay controles. Crea el primero: queda en la lista y lo puedes reutilizar en otras amenazas.') + '<p class="centro">' + nuevo + '</p>'));
      return d;
    }
    h += '<div class="fila fila-fin">' + seleccion({ ruta: b + '.aplicacion.controlId', etiqueta: 'Control aplicado', opciones: opciones(a.controles.map(function (c) { return { id: c.id, nombre: c.nombre || 'Control sin nombre' }; }), ap.controlId, 'Ninguno: solo el riesgo inherente') }) +
      '<div class="campo">' + nuevo + '</div></div>';
    var k = Estado.indice('controles', ap.controlId);
    if (!ap.controlId || k < 0) { d.push(diapo('El control', h)); return d; }
    var ctl = a.controles[k], otros = usosDe(ctl.id) - 1, base = 'controles.' + k;
    h += campo({ ruta: base + '.nombre', etiqueta: 'Nombre del control', valor: ctl.nombre, err: 'ctl-nombre-' + k, placeholder: 'Ej.: respaldo en la nube' }) + campoTransfiere(ctl, k);
    if (otros > 0) h += nota('Este control también se usa en ' + otros + (otros === 1 ? ' otra amenaza' : ' otras amenazas') + '. Si cambias sus datos, cambian en todas, y su costo se cuenta una sola vez.');
    d.push(diapo('El control', h));

    d.push(diapo('Lo que cuesta', '<p class="lead">Lo que pagas por «' + esc(ctl.nombre || 'este control') + '».</p>' + editorControl(ctl, k, false, true) +
      '<div data-vivo="avisoPrecio"></div>' + margen('<p>' + E.costoControl + '</p>' + tropiezo(5))));

    var q = margen('<p>' + E.control + '</p>' + versus() + tropiezo(13) + '<p>' + T.tratamiento.medible + '</p>');
    q += '<p class="lead">Marca lo que el control mejora. Puede ser más de una cosa.</p>';
    q += '<fieldset class="cambios"><legend class="solo-lector">¿Qué cambia con este control?</legend>';
    q += casilla(b + '.aplicacion.cambiaAro', ap.cambiaAro, 'Pasa menos veces', 'baja el ARO');
    q += casilla(b + '.aplicacion.cambiaFe', ap.cambiaFe, 'Pasa igual, pero duele menos', 'baja el FE');
    q += casilla(b + '.aplicacion.cambiaPiezas', ap.cambiaPiezas, 'Protege piezas del impacto', 'confidencialidad, integridad o disponibilidad');
    q += '</fieldset>';
    q += '<p class="error" id="err-control" data-err="control" hidden></p><p class="error" id="err-costo" data-err="costo" hidden></p>';
    q += '<div data-vivo="avisos"></div>' + origen(b + '.aplicacion.origen', ap.origen, '¿De dónde sale lo que cambia?');
    d.push(diapo('Qué cambia', q));

    if (ap.cambiaAro) {
      d.push(diapo('Con el control: cada cuánto', '<p class="lead">¿Cuántas veces pasaría con el control puesto?</p><div class="fila fila-fin fila-centro">' +
        campo({ ruta: b + '.aplicacion.veces', etiqueta: 'Veces', valor: ap.veces, modo: 'numeric', err: 'aroCon', clase: 'campo-corto' }) + '<span class="en">en</span>' +
        campo({ ruta: b + '.aplicacion.anios', etiqueta: 'Años', valor: ap.anios, modo: 'numeric', clase: 'campo-corto' }) + '</div><p class="resultado-vivo centro-flex" data-vivo="aroCon"></p>', { sigla: 'ARO', lado: 'cuanti' }));
    }
    if (ap.cambiaFe) {
      var f = '<p class="lead">¿Qué parte del valor se sigue perdiendo cada vez?</p>' + segmentos(b + '.aplicacion.feModo', ap.feModo, [{ id: 'pct', nombre: 'Nuevo FE' }, { id: 'cubierto', nombre: 'Monto que cubre' }], '<span class="solo-lector">¿Cómo lo indicas?</span>');
      if (ap.feModo === 'cubierto') f += campo({ ruta: b + '.aplicacion.cubierto', etiqueta: 'Monto que cubre', valor: ap.cubierto, modo: 'numeric', prefijo: '$', err: 'feCon',
        ayuda: 'El FE es lo que sigue perdiéndose: (VA − cubierto) ÷ VA.' });
      else f += campo({ ruta: b + '.aplicacion.fe', etiqueta: 'FE con control', valor: ap.fe, modo: 'decimal', sufijo: '%', err: 'feCon' });
      f += '<p class="resultado-vivo centro-flex" data-vivo="feCon"></p>' + margen(tropiezo(14));
      d.push(diapo('Con el control: cuánto duele', f, { sigla: 'FE', lado: 'cuanti', clase: 'sec-segmentos' }));
    }
    if (ap.cambiaPiezas) {
      var pz = ap.piezas || {};
      d.push(diapo('Con el control: qué pierdes', '<p class="lead">Deja en «Sin cambio» lo que el control no toca.</p><div class="fila">' +
        seleccion({ ruta: b + '.aplicacion.piezas.c', etiqueta: 'Confidencialidad', opciones: opcionesNota(pz.c, 'Sin cambio'), err: 'cCon' }) +
        seleccion({ ruta: b + '.aplicacion.piezas.i', etiqueta: 'Integridad', opciones: opcionesNota(pz.i, 'Sin cambio'), err: 'iCon' }) + '</div>' +
        piezaD(b + '.aplicacion.piezas.d', pz.d, 'dCon', 'Disponibilidad con control', '', true), { lado: 'cuali' }));
    }
    return d;
  }

  /* ================= 4. Resultado ================= */
  function resultado() {
    var a = Estado.analisis, h = cabecera('resultado');
    if (!a.riesgos.length) return h + nota('Todavía no hay amenazas.') + siguiente('amenaza', 'Agregar una amenaza');
    h += selectorChips(a.riesgos.map(function (r) { return { id: r.id, nombre: nombreRiesgo(r) }; }), Estado.ui.riesgoId, 'elegirRiesgo', null, null, 'Amenazas');
    var r = Estado.riesgo(Estado.ui.riesgoId), res = Calculo.de(r);
    if (!res.ok) {
      return h + nota('<p><b>Faltan datos para calcular esta amenaza:</b></p><ul>' + Object.keys(res.errores).map(function (k) { return '<li>' + esc(res.errores[k]) + '</li>'; }).join('') + '</ul>' +
        boton('ir', 'Completar los datos', 'btn btn-tonal', ' data-destino="amenaza"'), 'nota-error');
    }
    var con = res.con, sin = res.sin, f = L.fmtPesos, est = estudio();
    var vn = con ? Calculo.netoControl(res.control.id) : null, d = [], hTit = h;
    h = '';

    // Titulares: lo esencial en grande, una idea
    if (con) {
      h += '<div class="titulares">';
      h += '<div class="titular"><p class="titular-etq"><span class="lado-chip lado-cuanti">Pesos</span> Valor neto al año</p><p class="titular-v">' + (L.cmp(vn.neto, 0) > 0 ? '+' : '') + f(vn.neto) + '</p>' + veredictoHtml(vn.veredicto) + '</div>';
      var vc = L.veredictoCuali(res.mejora);
      h += '<div class="titular"><p class="titular-etq"><span class="lado-chip lado-cuali">Notas</span> Riesgo P × I</p><p class="titular-v">' + sin.riesgo + ' <span class="flecha" aria-hidden="true">→</span><span class="solo-lector">pasa a</span> ' + con.riesgo + '</p>' +
        '<span class="veredicto veredicto-cuali-' + vc + '">' + T.veredictoCuali[vc](res.mejora, sin.nivel, con.nivel) + '</span></div>';
      h += '</div>';
      if (!L.coinciden(vn.veredicto, res.mejora)) h += nota('<p><b>Pesos y notas no coinciden.</b> ' + T.noCoinciden + '</p>', 'nota-aviso');
      else if (vn.veredicto === 'empate' && res.mejora > 0) h += nota('<p>' + T.empateConMejora + '</p>');
    } else {
      h += nota('Esta amenaza no tiene control: aquí se ve solo el riesgo inherente. Elige un control en el paso anterior para comparar.');
    }

    var k = Estado.indice('riesgos', r.id);
    d.push(diapo('El veredicto', h, { clase: 'sec-ancha' }));

    // Detalle cuanti
    h = tablaRes('t-cuanti', con, [
      fila(S('VA'), f(res.va), con && f(res.va), est && 'suma de las partes del activo'),
      fila(S('ARO'), aroTexto(sin.aro), con && aroTexto(con.aro), est && formula('ARO = veces ÷ años = ' + res.veces + ' ÷ ' + res.anios)),
      fila(S('FE'), L.fmtPct(sin.fe), con && L.fmtPct(con.fe), est && con && con.cubierto && formula('FE = (VA − cubierto) ÷ VA = (' + f(res.va) + ' − ' + f(con.cubierto) + ') ÷ ' + f(res.va))),
      fila(S('SLE'), f(sin.sle), con && f(con.sle), est && formula('SLE = VA × FE = ' + f(res.va) + ' × ' + L.fmtPct(sin.fe) + ' = ' + f(sin.sle))),
      fila(S('ALE'), f(sin.ale), con && f(con.ale), est && formula('ALE = SLE × ARO = ' + f(sin.sle) + ' × ' + L.fmtFraccion(sin.aro) + ' = ' + f(sin.ale)) + ' <span class="tenue">' + esc(T.errores[8]) + '</span>', true)
    ]);
    d.push(diapo('En pesos', h, { id: 't-cuanti', lado: 'cuanti', clase: 'sec-ancha' }));
    if (con) {
      h = '<p class="lead">Lo que el control te ahorra al año, menos lo que cuesta.</p><dl class="cuentas">';
      h += '<div><dt>Reducción del ALE</dt><dd>' + f(res.reduccion) + '</dd></div>';
      h += '<div><dt>Costo anual del control</dt><dd>− ' + f(res.costo) + '</dd></div>';
      h += '<div class="total"><dt>Valor neto</dt><dd>' + f(vn.neto) + '</dd></div>';
      h += '</dl><p class="centro">' + veredictoHtml(vn.veredicto) + '</p>';
      if (vn.usos > 1) h += nota('«' + esc(res.control.nombre) + '» se usa en ' + vn.usos + ' amenazas: el valor neto suma sus reducciones y resta el costo una sola vez.');
      h += margen('<p class="ap-tit">Las cuentas</p><ul class="de-donde-lista"><li><b>Reducción</b> ' + formula(f(sin.ale) + ' − ' + f(con.ale)) + '</li><li><b>Costo</b> ' + formula(costoFormula(res.control)) + '</li><li><b>Neto</b> ' + formula('reducción − costo = ' + f(vn.reduccion) + ' − ' + f(vn.costo)) + '</li></ul>');
      h += margen('<p>' + E.resultadoCuanti + '</p>' + tropiezo(4) + tropiezo(6));
      d.push(diapo('¿Conviene en pesos?', h, { lado: 'cuanti' }));
    }

    // Detalle cuali
    h = tablaRes('t-cuali', con, [
      fila(S('P'), notaP(sin.p), con && notaP(con.p), est && 'tabla del ARO: ' + L.fmtFraccion(sin.aro) + ' → ' + sin.p),
      fila('Confidencialidad', sin.piezas.c, con && cambio(con.piezas.c, con.cambia.c)),
      fila('Integridad', sin.piezas.i, con && cambio(con.piezas.i, con.cambia.i)),
      fila('Disponibilidad', sin.piezas.d, con && cambio(con.piezas.d, con.cambia.d), est && 'escala armada con el MTD del activo'),
      fila('Dinero', sin.piezas.dinero, con && con.piezas.dinero, est && 'tabla del umbral: ' + f(sin.sle) + ' de ' + f(res.umbral) + ' → ' + sin.piezas.dinero),
      fila(S('I'), '<b>' + sin.impacto + '</b>', con && '<b>' + con.impacto + '</b>', est && formula('I = máximo(' + [sin.piezas.c, sin.piezas.i, sin.piezas.d, sin.piezas.dinero].join(', ') + ') = ' + sin.impacto)),
      fila('P × I', nivelHtml(sin.riesgo), con && nivelHtml(con.riesgo), est && formula('P × I = ' + sin.p + ' × ' + sin.impacto + ' = ' + sin.riesgo + (con ? ' → ' + con.p + ' × ' + con.impacto + ' = ' + con.riesgo : '')), true)
    ]);
    h += margen('<p>' + E.resultadoCuali + '</p>' + tropiezo(12) + tropiezo(11) + tablaNiveles(con ? con.riesgo : sin.riesgo));
    d.push(diapo('En notas', h, { id: 't-cuali', lado: 'cuali', clase: 'sec-ancha' }));
    diaposTratamiento(r, k, res, vn).forEach(function (x) { d.push(x); });
    return mazo('resultado', d, avanzar('resumen', 'Siguiente: el resumen'), hTit);
  }

  /* ---------- Tratamiento: qué haces con el riesgo (docs/03) ---------- */
  function umbralAc() { return Estado.analisis.umbralAceptacion || 'Bajo'; }
  function nombreTrat(op) { return op === 'evitar_o_aceptar' ? 'Evitar, o aceptar con excepción' : T.tratamiento.opciones[op].nombre; }
  function tratamientoDe(r, res) {
    var t = r.tratamiento || {}, op = t.opcion;
    if (!op) return { texto: 'Sin decidir', clase: 'trat-pendiente' };
    if (op === 'aceptar' && res && res.ok && L.pideFAR('aceptar', res, umbralAc())) {
      var falta = Object.keys(L.erroresFAR(t.far)).length;
      return { texto: 'Aceptado con excepción' + (falta ? ' (formulario incompleto)' : ''), clase: falta ? 'trat-falta' : 'trat-excepcion' };
    }
    return { texto: T.tratamiento.opciones[op].nombre, clase: 'trat-' + op };
  }
  function diaposTratamiento(r, k, res, vn) {
    var d = [], t = r.tratamiento || { opcion: '', far: {} }, con = res.con, ctl = con ? Estado.analisis.controles.filter(function (c) { return c.id === res.control.id; })[0] : null;
    var sug = L.sugerirTratamiento(res, vn, ctl, umbralAc()), ruta = 'riesgos.' + k + '.tratamiento.opcion';
    var nomCtl = ctl ? '«' + esc(ctl.nombre || 'el control') + '»' : '';
    var h = '<div class="sugerencia"><p class="sug-etq">Sugerencia</p><p class="sug-v">' + nombreTrat(sug.opcion) +
      (sug.opcion === 'mitigar' || sug.opcion === 'transferir' ? ' con ' + nomCtl : '') + '</p><p class="sug-por">' + T.tratamiento.motivos[sug.motivo] + '</p></div>';
    var ops = [
      { id: 'mitigar', ok: con && !(ctl && ctl.transfiere), detalle: con ? (ctl && ctl.transfiere ? nomCtl + ' es un seguro o contrato: eso es transferir.' : 'Pones ' + nomCtl + ' y queda ' + nivelHtml(con.riesgo) + '.') : 'Necesita un control (paso 3).' },
      { id: 'transferir', ok: con && ctl && ctl.transfiere, detalle: con ? (ctl && ctl.transfiere ? nomCtl + ' cubre parte de la pérdida y queda ' + nivelHtml(con.riesgo) + '. El riesgo no desaparece.' : nomCtl + ' no es un seguro ni un contrato.') : 'Necesita un seguro o contrato como control.' },
      { id: 'aceptar', ok: true, detalle: 'Sin control: asumes ' + nivelHtml(res.sin.riesgo) + '.' + (L.pideFAR('aceptar', res, umbralAc()) ? ' Está sobre tu umbral: pide un formulario de excepción.' : '') },
      { id: 'evitar', ok: true, detalle: 'Dejas la actividad o el activo. El riesgo desaparece, y también lo que te da.' }
    ];
    h += '<fieldset class="tratamientos"><legend class="solo-lector">¿Qué haces con este riesgo?</legend>';
    ops.forEach(function (o) {
      var id = idDe(ruta) + '-' + o.id, sel = t.opcion === o.id;
      h += '<input type="radio" id="' + id + '" name="' + ruta + '" value="' + o.id + '" data-campo="' + ruta + '"' + (sel ? ' checked' : '') + (o.ok || sel ? '' : ' disabled') + '>' +
        '<label for="' + id + '"><span class="trat-nom">' + T.tratamiento.opciones[o.id].nombre + (sug.opcion === o.id || (sug.opcion === 'evitar_o_aceptar' && (o.id === 'evitar' || o.id === 'aceptar')) ? ' <span class="trat-sug">sugerido</span>' : '') +
        '</span><span class="trat-det">' + o.detalle + '</span></label>';
    });
    h += '</fieldset>';
    var tabla = '<p class="ap-tit">Las cuatro estrategias</p><dl class="estrategias">' + L.TRATAMIENTOS.map(function (id) {
      var x = T.tratamiento.opciones[id]; return '<div><dt>' + x.nombre + '</dt><dd>' + x.que + ' ' + x.cuando + ' <span class="tenue">Ej.: ' + x.ejemplo + '</span></dd></div>';
    }).join('') + '</dl>';
    h += margen(tabla + '<p>' + T.tratamiento.criterio + '</p>');
    d.push(diapo('Qué haces con este riesgo', h));

    if (t.opcion === 'aceptar' && L.pideFAR('aceptar', res, umbralAc())) {
      var b = 'riesgos.' + k + '.tratamiento.far.', far = t.far || {}, niv = L.nivel(res.sin.riesgo);
      var f = '<p class="lead">Aceptas un riesgo ' + niv + ' (' + res.sin.riesgo + '), sobre tu umbral. Déjalo por escrito.</p>';
      f += areaTexto({ ruta: b + 'motivo', etiqueta: '¿Por qué lo aceptas?', valor: far.motivo, err: 'far-motivo', filas: 2 });
      f += areaTexto({ ruta: b + 'complementarios', etiqueta: 'Controles que lo bajan de forma indirecta (opcional)', valor: far.complementarios, filas: 2 });
      f += seleccion({ ruta: b + 'nivelEstimado', etiqueta: 'Nivel estimado con esos controles (opcional)', opciones: opciones([{ id: 'Bajo', nombre: 'Bajo' }, { id: 'Medio', nombre: 'Medio' }, { id: 'Alto', nombre: 'Alto' }], far.nivelEstimado, 'Sin estimar') });
      f += margen('<p>' + T.tratamiento.umbral + '</p>');
      d.push(diapo('Excepción: por qué lo aceptas', f));
      f = '<p class="lead">Una excepción no es para siempre: anota qué harás y hasta cuándo.</p>';
      f += areaTexto({ ruta: b + 'plan', etiqueta: 'Plan de acción', valor: far.plan, err: 'far-plan', filas: 2 });
      f += campo({ ruta: b + 'fecha', etiqueta: 'Fecha límite del plan', valor: far.fecha, tipo: 'date', err: 'far-fecha' });
      if (far.aceptadoEl) f += '<p class="pista-izq">Aceptado el ' + L.fmtFecha(far.aceptadoEl) + '. Revisión cada 3 meses: la próxima, el <b>' + L.fmtFecha(L.sumarMeses(far.aceptadoEl, 3)) + '</b>.</p>';
      d.push(diapo('Excepción: el plan', f));
    }
    return d;
  }

  function tablaRes(idTitulo, con, filas, extra) {
    var ex = filas.filter(function (f) { return f.expl; }).map(function (f) { return '<li><b>' + f.etq + '</b> ' + f.expl + '</li>'; }).concat(extra || []);
    return '<div class="tabla-env" tabindex="0" role="region" aria-labelledby="' + idTitulo + '"><table class="res"><thead><tr><th scope="col"><span class="solo-lector">Dato</span></th><th scope="col">Sin control</th>' + (con ? '<th scope="col">Con control</th>' : '') + '</tr></thead><tbody>' +
      filas.map(function (f) { return f.html; }).join('') + '</tbody></table></div>' +
      (ex.length ? margen('<p class="ap-tit">¿De dónde salió cada número?</p><ul class="de-donde-lista">' + ex.join('') + '</ul>') : '');
  }
  function fila(etq, sin, con, explicacion, destacada) {
    var dos = con !== null && con !== undefined && con !== false;
    return { etq: etq, expl: explicacion, html: '<tr' + (destacada ? ' class="destacada"' : '') + '><th scope="row">' + etq + '</th><td>' + sin + '</td>' + (dos ? '<td>' + con + '</td>' : '') + '</tr>' };
  }
  function notaP(p) { return p + ' <span class="tenue">' + L.PALABRA_P[p] + '</span>'; }
  function cambio(v, cambia) { return cambia ? '<b>' + v + '</b> <span class="cambia">cambia</span>' : v; }
  function costoFormula(ctl) {
    if (ctl.tipoCosto === 'unico') return 'precio ÷ años de vida = ' + L.fmtPesos(L.leerPesos(ctl.costo)) + ' ÷ ' + esc(ctl.vida);
    return 'se paga cada año';
  }

  /* ================= 5. Resumen ================= */
  function resumen() {
    var a = Estado.analisis, h = cabecera('resumen'), d = [];
    var items = [], incompletos = [];
    a.riesgos.forEach(function (r) { var res = Calculo.de(r); if (res.ok) items.push({ r: r, resultado: res }); else incompletos.push(r); });
    var orden = L.ordenar(items);
    var falta = incompletos.length ? nota('Hay ' + incompletos.length + ' amenaza(s) con datos incompletos que no entran en la lista: ' + incompletos.map(function (r) { return esc(nombreRiesgo(r)); }).join(', ') + '.') : '';
    if (!orden.length) d.push(diapo('Lista ordenada', nota('Todavía no hay riesgos completos para ordenar.') + falta));
    else {
      var l = '<p class="ayuda">De mayor a menor riesgo residual (P × I con control). Si empatan, primero el de mayor ALE con control.</p>';
      l += '<ol class="ranking">';
      orden.forEach(function (it, n) {
        var res = it.resultado, con = res.con, vn = con ? Calculo.netoControl(res.control.id) : null;
        l += '<li class="rk"><span class="rk-n" aria-hidden="true">' + (n + 1) + '</span><div class="rk-cuerpo">' +
          '<p class="rk-titulo">' + boton('abrirRiesgo', esc(nombreRiesgo(it.r)), 'btn-enlace', ' data-id=\"' + esc(it.r.id) + '\"') + '</p>' +
          '<p class="rk-sub">' + (con ? esc(res.control.nombre) : 'Sin control') + ' · <span class="trat ' + tratamientoDe(it.r, res).clase + '">' + tratamientoDe(it.r, res).texto + '</span></p></div>' +
          '<div class="rk-datos"><span class="rk-cuali">' + nivelHtml(res.sin.riesgo) + (con ? ' <span aria-hidden="true">→</span><span class="solo-lector">pasa a</span> ' + nivelHtml(con.riesgo) : '') + '</span>' +
          '<span class="rk-cuanti">' + S('ALE') + ' ' + L.fmtPesos(L.residual(res).ale) + (vn ? ' · ' + veredictoHtml(vn.veredicto) : '') + '</span></div></li>';
      });
      l += '</ol>';
      d.push(diapo('Lista ordenada', l + falta));

      var m = '<p class="ayuda">Probabilidad hacia arriba, impacto hacia la derecha. El número en el círculo es el lugar del riesgo en la lista.</p>';
      m += '<div class="calores">' + matriz(orden, 'sin', 'Sin control') + matriz(orden, 'con', 'Con control') + '</div>';
      m += margen('<p>' + E.matriz + '</p>');
      d.push(diapo('Matriz de calor', m, { clase: 'sec-ancha' }));
    }

    var c = '<p class="ayuda">La lista única de controles. Cada uno se anota una vez y su costo se cuenta una vez, aunque proteja varias amenazas.</p>';
    if (!a.controles.length) c += nota('Todavía no hay controles. Se crean en el paso de la amenaza.');
    c += '<ul class="lista-controles">';
    a.controles.forEach(function (ctl, k) {
      var usos = usosDe(ctl.id), vn = Calculo.netoControl(ctl.id), costo = L.costoDeControl(ctl);
      c += '<li class="control"><details data-recordar="ctl-' + esc(ctl.id) + '"' + (Estado.ui.abiertos['ctl-' + ctl.id] ? ' open' : '') + '><summary class="control-sum">' +
        '<span class="control-nom">' + esc(ctl.nombre || 'Control sin nombre') + '</span>' +
        '<span class="tenue">' + (costo ? L.fmtPesos(costo) + ' al año' : 'costo incompleto') + ' · ' + (usos ? 'en ' + usos + (usos === 1 ? ' amenaza' : ' amenazas') : 'sin usar') + '</span>' +
        (usos && vn ? veredictoHtml(vn.veredicto) : '') + '</summary>' + editorControl(ctl, k, true) + '</details></li>';
    });
    c += '</ul>';
    d.push(diapo('Controles', c));

    var exc = items.filter(function (it) { return it.r.tratamiento && it.r.tratamiento.opcion === 'aceptar' && L.pideFAR('aceptar', it.resultado, umbralAc()); });
    if (exc.length) {
      var x = '<p class="lead">Riesgos sobre tu umbral que aceptaste igual. Cada uno con su plan y su revisión cada 3 meses.</p><ul class="excepciones">';
      exc.forEach(function (it) {
        var far = it.r.tratamiento.far || {}, falta = Object.keys(L.erroresFAR(far)).length;
        x += '<li class="excepcion"><p class="exc-tit">' + boton('abrirRiesgo', esc(nombreRiesgo(it.r)), 'btn-enlace', ' data-id=\"' + esc(it.r.id) + '\"') + ' ' + nivelHtml(it.resultado.sin.riesgo) + '</p>' +
          (falta ? '<p class="trat trat-falta">Formulario incompleto</p>' : '') +
          '<dl class="exc-datos">' + (far.motivo ? '<div><dt>Motivo</dt><dd>' + esc(far.motivo) + '</dd></div>' : '') +
          (far.plan ? '<div><dt>Plan</dt><dd>' + esc(far.plan) + (far.fecha ? ' <span class="tenue">· hasta el ' + L.fmtFecha(far.fecha) + '</span>' : '') + '</dd></div>' : '') +
          (far.nivelEstimado ? '<div><dt>Nivel estimado</dt><dd>' + esc(far.nivelEstimado) + '</dd></div>' : '') +
          (far.aceptadoEl ? '<div><dt>Próxima revisión</dt><dd>' + L.fmtFecha(L.sumarMeses(far.aceptadoEl, 3)) + '</dd></div>' : '') + '</dl></li>';
      });
      d.push(diapo('Aceptados con excepción', x + '</ul>'));
    }

    var g = '<p class="ayuda">El análisis se recuerda en este navegador. Para llevarlo a otro lado, descárgalo como archivo. Nada se envía a ningún servidor.</p>';
    g += '<div class="acciones">' + boton('exportar', 'Descargar el análisis (.json)', 'btn btn-primario') + boton('abrir', 'Abrir un análisis guardado', 'btn btn-texto') + '</div>';
    d.push(diapo('Guardar', g));
    return mazo('resumen', d, null, h);
  }

  function matriz(orden, lado, titulo) {
    var marcas = {};
    orden.forEach(function (it, n) {
      var x = lado === 'con' ? (it.resultado.con || it.resultado.sin) : it.resultado.sin;
      var key = x.p + '-' + x.impacto; (marcas[key] = marcas[key] || []).push(n + 1);
    });
    var h = '<div class="calor-env"><table class="calor"><caption>' + titulo + '</caption><thead><tr><td></td>';
    for (var i = 1; i <= 5; i++) h += '<th scope="col">I ' + i + '</th>';
    h += '</tr></thead><tbody>';
    for (var p = 5; p >= 1; p--) {
      h += '<tr><th scope="row">P ' + p + '</th>';
      for (var j = 1; j <= 5; j++) {
        var v = p * j, n = L.nivel(v), m = marcas[p + '-' + j];
        h += '<td class="celda nivel-' + n.toLowerCase() + (m ? ' con-marca' : '') + '"><span class="v">' + v + '</span><span class="n">' + n + '</span>' +
          (m ? '<span class="marcas">' + m.map(function (x) { return '<span class="marca-riesgo"><span class="solo-lector">riesgo </span>' + x + '</span>'; }).join('') + '</span>' : '') + '</td>';
      }
      h += '</tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ================= Ejemplo guiado ================= */
  function guia() {
    var g = Estado.ui.guia, pasos = Guia.pasos, d = Guia.datos();
    var p = pasos[g.paso], resp = g.respuestas[g.paso];
    var valor = function (x) { return typeof x === 'function' ? x(d) : x; };
    var h = '<div class="guia">';

    // Roadmap
    var rm = '<ol class="ruta">', grupo = null;
    pasos.forEach(function (x, k) {
      if (x.grupo !== grupo) { grupo = x.grupo; rm += '<li class="ruta-grupo" aria-hidden="true">' + esc(grupo) + '</li>'; }
      var hecho = g.respuestas[k] !== undefined || (x.fin && k < g.paso);
      rm += '<li><button type="button" class="ruta-paso' + (hecho ? ' hecho' : '') + '" data-accion="guiaIr" data-k="' + k + '"' + (k === g.paso ? ' aria-current="step"' : '') + '>' +
        '<span class="ruta-n" aria-hidden="true">' + (k + 1) + '</span><span class="ruta-t">' + esc(x.titulo) + (x.ops.length ? '<span class="ruta-ops">' + x.ops.map(function (o) { return T.operaciones[o]; }).join(' · ') + '</span>' : '') + '</span></button></li>';
    });
    rm += '</ol>';
    h += '<nav class="guia-ruta" aria-label="Recorrido del ejemplo"><details' + (Estado.ui.rutaAbierta ? ' open' : '') + ' class="ruta-det"><summary>Recorrido · paso ' + (g.paso + 1) + ' de ' + pasos.length + '</summary>' + rm + '</details><div class="ruta-fija">' + rm + '</div></nav>';

    // Paso
    h += '<article class="guia-paso"><header class="cab"><div class="guia-arriba"><p class="cab-paso">Ejemplo guiado · Tu celular · ' + esc(p.grupo) + '</p>' +
      boton('guia', '<span aria-hidden="true">←</span> Volver al análisis', 'btn btn-texto btn-chico') + '</div>';
    h += '<h1 tabindex="-1">' + esc(p.titulo) + '</h1>';
    h += '<p class="cab-ops">' + '<span class="lado-chip ' + (p.cuali ? 'lado-cuali">Notas' : 'lado-cuanti">Pesos') + '</span> ' + (p.ops.length ? '<span class="tenue">Operación:</span> ' + opsHtml(p.ops) : '') + '</p>';
    h += '<progress class="progreso" max="' + pasos.length + '" value="' + (g.paso + 1) + '" aria-label="Avance del ejemplo: paso ' + (g.paso + 1) + ' de ' + pasos.length + '"></progress></header>';
    h += '<p class="situacion">' + valor(p.situacion) + '</p>';
    if (p.visual) h += '<div class="guia-visual">' + valor(p.visual) + '</div>';

    if (p.pregunta) {
      h += '<fieldset class="pregunta"><legend>' + esc(p.pregunta) + '</legend><div class="pregunta-ops">';
      p.opciones.forEach(function (o, k) {
        var id = 'g-op-' + k, elegida = resp === k;
        h += '<input type="radio" name="guia-op" id="' + id + '" value="' + k + '" data-guia-op' + (elegida ? ' checked' : '') + (resp !== undefined ? ' disabled' : '') + '>' +
          '<label for="' + id + '" class="op-guia' + (resp !== undefined ? (o.ok ? ' es-ok' : (elegida ? ' es-no' : '')) : '') + '">' + esc(valor(o.texto)) +
          (resp !== undefined && o.ok ? '<span class="op-marca">Respuesta</span>' : '') + '</label>';
      });
      h += '</div></fieldset>';
      h += '<div class="revelado" id="revelado" tabindex="-1">';
      if (resp !== undefined) {
        var o = p.opciones[resp];
        h += '<p class="revelado-tit ' + (o.ok ? 'ok' : 'no') + '">' + esc(o.titulo) + '</p><p>' + valor(o.expl) + '</p>';
        if (p.versus) h += versus();
        if (p.tarjetas) h += '<div class="tarjetas">' + p.tarjetas.map(function (t) { var s = T.siglas[t.sigla]; return '<div class="tarjeta-sigla"><p class="ts-sigla">' + t.sigla + '</p><p class="ts-en" lang="en">' + esc(s.en) + '</p><p>' + esc(t.texto) + '</p></div>'; }).join('') + '</div>';
        if (p.tabla === 'P') h += tablaP(p.titulo === 'El borde de P' ? 4 : 5);
        if (p.tabla === 'Dinero') h += tablaDinero(d.ro.sin.piezas.dinero);
        if (p.tabla === 'nivel') h += tablaNiveles(p.titulo === 'Y en notas' ? d.ro.con.riesgo : d.ro.sin.riesgo);
        if (p.confusion) h += '<p class="tropiezo"><span class="tropiezo-etq">Tropiezo frecuente</span> ' + esc(p.confusion) + '</p>';
      }
      h += '</div>';
    }

    var bloqueado = p.pregunta && resp === undefined;
    h += '<div class="guia-nav">' + boton('guiaAnt', '<span aria-hidden="true">←</span> Anterior', 'btn btn-texto', g.paso === 0 ? ' disabled' : '');
    if (p.fin) h += boton('guiaFin', 'Abrir el ejemplo en el programa <span aria-hidden="true">→</span>', 'btn btn-primario');
    else h += boton('guiaSig', 'Siguiente <span aria-hidden="true">→</span>', 'btn btn-primario', bloqueado ? ' aria-disabled="true" aria-describedby="guia-bloq"' : '');
    h += '</div>' + (bloqueado ? '<p class="tenue guia-bloq" id="guia-bloq">Responde la pregunta para seguir.</p>' : '');
    h += '</article></div>';
    return h;
  }

  /* ---------------- Valores en vivo ---------------- */
  var vivos = {
    umbral: function () { var u = L.leerPesos(Estado.analisis.umbral); return u && u.n > 0n ? 'Umbral: <b>' + L.fmtPesos(u) + '</b>' : ''; },
    costoControl: function (k) {
      var ctl = Estado.analisis.controles[+k]; if (!ctl) return '';
      var c = L.costoDeControl(ctl); if (c === null) return '';
      return 'Costo anual: <b>' + L.fmtPesos(c) + '</b>' + (ctl.tipoCosto === 'unico' && estudio() ? ' ' + formula('= ' + L.fmtPesos(L.leerPesos(ctl.costo)) + ' ÷ ' + esc(ctl.vida) + ' años') : '');
    },
    va: function () {
      var act = Estado.activo(Estado.ui.activoId); if (!act) return '';
      var va = L.vaDeActivo(act);
      if (va === null) return 'VA: <span class="tenue">completa los valores</span>';
      return '<span class="rv-etq">VA</span> <b class="rv-num">' + L.fmtPesos(va) + '</b>' + (estudio() ? ' ' + formula('= ' + act.partes.map(function (p) { return L.fmtPesos(L.leerPesos(p.valor)); }).join(' + ')) : '');
    },
    escalaD: function () {
      var act = Estado.activo(Estado.ui.activoId), mtd = act ? L.mtdDeActivo(act) : null;
      if (!mtd) return '';
      if (estudio()) return margen('<p>' + E.mtd + '</p>' + tablaEscalaD(mtd));
      return '<p class="vivo">Límites entre notas: ' + [144n, 12n, 3n, 1n].map(function (x) { return L.fmtMinutos(L.div(mtd, x)); }).join(' · ') + '</p>';
    },
    aro: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r) return '';
      var v = L.leerEntero(r.veces), a = L.leerEntero(r.anios);
      if (v === null || a === null || v <= 0n || a <= 0n) return '';
      var aro = L.aro(v, a), p = L.notaP(aro);
      return '<span class="rv-etq">ARO</span> <b class="rv-num">' + aroTexto(aro) + '</b> <span class="rv-flecha" aria-hidden="true">→</span> <span class="rv-etq">P</span> <b class="rv-num">' + p + '</b> ' + L.PALABRA_P[p] +
        (estudio() ? ' ' + formula(v + ' ÷ ' + a) : '');
    },
    margenP: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r || !estudio()) return '';
      var v = L.leerEntero(r.veces), a = L.leerEntero(r.anios), p = (v && a && v > 0n && a > 0n) ? L.notaP(L.aro(v, a)) : null;
      return margen('<p>' + E.aro + '</p>' + tablaP(p) + tropiezo(7) + tropiezo(1));
    },
    aroCon: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r) return '';
      var ap = r.aplicacion, v = L.leerEntero(ap.veces), a = L.leerEntero(ap.anios);
      if (v === null || a === null || a <= 0n) return '';
      var aro = L.aro(v, a), p = L.notaP(aro);
      return '<span class="rv-etq">ARO con control</span> <b class="rv-num">' + aroTexto(aro) + '</b> → <span class="rv-etq">P</span> <b class="rv-num">' + p + '</b> ' + L.PALABRA_P[p];
    },
    sle: function () {
      var res = Calculo.parcial(); if (!res) return '';
      return '<span class="rv-etq">SLE</span> <b class="rv-num">' + L.fmtPesos(res.sle) + '</b>' + (estudio() ? ' ' + formula('VA × FE = ' + L.fmtPesos(res.va) + ' × ' + L.fmtPct(res.fe)) : '');
    },
    feCon: function () {
      var res = Calculo.de(Estado.riesgo(Estado.ui.riesgoId));
      if (!res.ok || !res.con) return '';
      var t = '<span class="rv-etq">FE con control</span> <b class="rv-num">' + L.fmtPct(res.con.fe) + '</b> → <span class="rv-etq">SLE</span> <b class="rv-num">' + L.fmtPesos(res.con.sle) + '</b>';
      if (res.con.cubierto && estudio()) t += ' ' + formula('(' + L.fmtPesos(res.va) + ' − ' + L.fmtPesos(res.con.cubierto) + ') ÷ ' + L.fmtPesos(res.va));
      return t;
    },
    impactoSin: function () {
      var res = Calculo.de(Estado.riesgo(Estado.ui.riesgoId));
      if (!res.ok) return '<p class="pista">Cuando estén todas las notas (y el umbral y el activo), aquí ves el impacto.</p>';
      var pz = res.sin.piezas, max = res.sin.impacto;
      var items = [['Confidencialidad', pz.c], ['Integridad', pz.i], ['Disponibilidad', pz.d], ['Dinero', pz.dinero]];
      var h = '<div class="piezas">';
      items.forEach(function (x) { h += '<div class="pieza' + (x[1] === max ? ' pieza-max' : '') + '"><span class="pieza-nom">' + x[0] + '</span><span class="pieza-val">' + x[1] + '</span>' + (x[1] === max ? '<span class="pieza-etq">la más alta</span>' : '') + '</div>'; });
      h += '</div><p class="total-i"><span class="total-i-etq">Impacto</span> <b>' + max + '</b> <span class="tenue">' + L.PALABRA_I[max] + '</span></p>';
      h += margen('<p>' + formula('I = máximo(' + [pz.c, pz.i, pz.d, pz.dinero].join(', ') + ') = ' + max) + '</p><p>' + E.impacto + ' Dinero sale del SLE: ' + L.fmtPesos(res.sin.sle) + ' con umbral ' + L.fmtPesos(res.umbral) + '.</p>' + tablaDinero(pz.dinero) + tropiezo(9));
      return h;
    },
    notaD: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r) return '';
      var act = Estado.activo(r.activoId), mtd = act ? L.mtdDeActivo(act) : null, n = L.notaDDe(r.d, mtd);
      if (n === null) return mtd === null ? '<span class="tenue">Falta el MTD del activo para traducir el tiempo a nota.</span>' : '';
      return '<span class="rv-etq">Nota</span> <b class="rv-num">' + n + '</b> ' + L.PALABRA_I[n] +
        margen('<p>Con un MTD de ' + L.fmtMinutos(mtd) + ', este tiempo da nota ' + n + '. ' + E.mtd + '</p>' + tablaEscalaD(mtd));
    },
    erroresActivo: function () {
      var res = Calculo.de(Estado.riesgo(Estado.ui.riesgoId)), faltan = [];
      if (res.errores.umbral) faltan.push(['inicio', 'el umbral de dinero']);
      if (res.errores.va) faltan.push(['activo', 'el VA del activo']);
      if (res.errores.mtd) faltan.push(['activo', 'el MTD del activo']);
      if (!faltan.length) return '';
      return nota('Para calcular falta ' + faltan.map(function (x) { return boton('ir', x[1], 'btn-enlace', ' data-destino="' + x[0] + '"'); }).join(' y ') + '.', 'nota-aviso');
    },
    avisoPrecio: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r) return '';
      var ctl = Estado.analisis.controles[Estado.indice('controles', r.aplicacion.controlId)], va = L.vaDeActivo(Estado.activo(r.activoId));
      if (!ctl || !L.controlMasCaroQueVA(ctl, va)) return '';
      return nota('<p>' + (ctl.tipoCosto === 'unico' ? 'El precio' : 'El costo anual') + ' de «' + esc(ctl.nombre || 'este control') + '» (' + L.fmtPesos(L.leerPesos(ctl.costo)) + ') es mayor que lo que vale el activo (' + L.fmtPesos(va) + '). Revisa si de verdad conviene.</p>', 'nota-aviso');
    },
    avisos: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId), res = Calculo.de(r), h = '';
      if (res.ok && res.con) {
        var vn = Calculo.netoControl(res.control.id);
        if (vn && L.cmp(vn.neto, 0) <= 0) h += nota('<p>Con estos datos, «' + esc(res.control.nombre || 'el control') + '» no ahorra más de lo que cuesta: valor neto ' + L.fmtPesos(vn.neto) + ' al año. No impide seguir; es para que lo tengas en cuenta.</p>', 'nota-aviso');
      }
      if (!res.ok || !res.avisos.length) return h;
      var k = Estado.indice('riesgos', r.id);
      return h + nota('<p>' + res.avisos.map(function (x) { return esc(T.avisos[x]); }).join('</p><p>') + '</p>' + casilla('riesgos.' + k + '.aplicacion.confirmado', r.aplicacion.confirmado, 'Sí, lo confirmo'), 'nota-aviso');
    }
  };

  function errores(pantalla) {
    var a = Estado.analisis, e = {};
    function errCtl(c, k) {
      if (!String(c.nombre || '').trim()) e['ctl-nombre-' + k] = 'Ponle un nombre al control.';
      if (L.leerPesos(c.costo) === null) e['ctl-costo-' + k] = 'Escribe un monto en pesos, sin decimales (puede ser 0).';
      if (c.tipoCosto === 'unico') { var v = L.leerEntero(c.vida); if (v === null || v <= 0n) e['ctl-vida-' + k] = 'Escribe cuántos años dura: un entero mayor que 0.'; }
    }
    if (pantalla === 'inicio') {
      var u = L.leerPesos(a.umbral); if (u === null || u.n === 0n) e.umbral = 'Escribe un monto mayor que $0, sin decimales. Ej.: 2.000.000';
    } else if (pantalla === 'resultado') {
      var rr = Estado.riesgo(Estado.ui.riesgoId), rs = rr ? Calculo.de(rr) : null;
      if (rs && rs.ok && rr.tratamiento && L.pideFAR(rr.tratamiento.opcion, rs, a.umbralAceptacion)) {
        var ef = L.erroresFAR(rr.tratamiento.far);
        Object.keys(ef).forEach(function (x) { e['far-' + x] = ef[x]; });
      }
    } else if (pantalla === 'resumen') {
      a.controles.forEach(errCtl);
    } else if (pantalla === 'activo') {
      var act = Estado.activo(Estado.ui.activoId);
      if (act) {
        act.partes.forEach(function (p, j) { if (L.leerPesos(p.valor) === null) e['parte-' + j] = 'Escribe un monto en pesos, sin decimales.'; });
        if (L.mtdDeActivo(act) === null) e.mtd = 'Escribe un tiempo mayor que 0.';
      }
    } else if (pantalla === 'amenaza') {
      var r = Estado.riesgo(Estado.ui.riesgoId);
      if (r) {
        var ev = Calculo.de(r).errores || {};
        Object.keys(ev).forEach(function (x) { e[x] = ev[x]; });
        var k = Estado.indice('controles', r.aplicacion && r.aplicacion.controlId);
        if (k >= 0) errCtl(a.controles[k], k);
      }
    }
    return e;
  }

  var pantallas = { inicio: inicio, activo: activo, amenaza: amenaza, resultado: resultado, resumen: resumen, guia: guia };
  return {
    pantalla: function (id) { return (pantallas[id] || inicio)(); },
    titulo: function (id) {
      if (id === 'guia') return 'Ejemplo guiado';
      var p = T.pantallas.filter(function (x) { return x.id === id; })[0]; return p ? p.titulo : '';
    },
    vivos: vivos, errores: errores, esc: esc, S: S
  };
})();

/* Cálculo para la pantalla actual. */
var Calculo = (function () {
  var L = Logica;
  return {
    de: function (r) {
      if (!r) return { ok: false, errores: {} };
      return L.evaluar(r, Estado.activo(r.activoId), Estado.analisis);
    },
    parcial: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r) return null;
      var act = Estado.activo(r.activoId); if (!act) return null;
      var va = L.vaDeActivo(act), fe = L.leerDecimal(r.fe);
      if (va === null || fe === null || L.cmp(fe, 100) > 0) return null;
      var feQ = L.fePorcentaje(fe);
      return { va: va, fe: feQ, sle: L.sle(va, feQ) };
    },
    netoControl: function (controlId) {
      var a = Estado.analisis;
      return L.valorNetoPorControl(a, a.riesgos.map(function (r) { return Calculo.de(r); }))[controlId];
    }
  };
})();
