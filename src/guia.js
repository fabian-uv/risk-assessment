/* Ejemplo guiado del celular: un paso por pantalla, con pregunta antes de revelar.
   Todas las cifras salen de Logica sobre el ejemplo precargado (src/ejemplo.js),
   así el texto nunca se desfasa del cálculo. */
var Guia = (function () {
  'use strict';
  var L = Logica;

  function datos() {
    var a = Ejemplo.celular(), act = a.activos[0];
    var ev = {};
    a.riesgos.forEach(function (r) { ev[r.id] = L.evaluar(r, act, a); });
    var ro = ev['r-rotura'], rb = ev['r-robo'], sg = ev['r-seguro'];
    var f = L.fmtPesos;
    return {
      va: f(ro.va), aparato: f(L.leerPesos(act.partes[0].valor)), datos: f(L.leerPesos(act.partes[1].valor)), umbral: f(ro.umbral),
      ro: ro, rb: rb, sg: sg, f: f,
      netoRo: L.valorNeto(ro.reduccion, ro.costo), netoSg: L.valorNeto(sg.reduccion, sg.costo)
    };
  }

  // Operaciones del roadmap
  var OPS = { suma: 'Suma', divide: 'Divide', multiplica: 'Multiplica', tabla: 'Tabla', maximo: 'Máximo', resta: 'Resta', compara: 'Compara' };

  function antesDespues(a, b) {
    return '<div class="ad"><div class="ad-caja"><span class="ad-etq">Sin control</span>' + a + '</div><span class="ad-flecha" aria-hidden="true">→</span><div class="ad-caja ad-caja-b"><span class="ad-etq">Con control</span>' + b + '</div></div>';
  }
  function cifra(etq, v) { return '<div class="cifra"><span class="cifra-etq">' + etq + '</span><span class="cifra-v">' + v + '</span></div>'; }

  var pasos = [
    { grupo: 'Se cae y se rompe', titulo: 'El activo', ops: ['suma'],
      situacion: function (d) { return 'Empecemos por lo que quieres proteger: tu celular. El aparato cuesta ' + d.aparato + ', y lo que tienes guardado (fotos, contactos, apuntes) lo valoras en ' + d.datos + '.'; },
      visual: function (d) { return '<div class="cifras">' + cifra('Aparato', d.aparato) + '<span class="op" aria-hidden="true">+</span>' + cifra('Datos', d.datos) + '<span class="op" aria-hidden="true">=</span>' + cifra('VA', '?') + '</div>'; },
      pregunta: '¿Cuánto vale el activo?',
      opciones: [
        { texto: function (d) { return d.aparato + ', lo que costó el aparato'; }, ok: false,
          titulo: 'Casi: te faltan los datos.', expl: function (d) { return 'Si el celular desaparece, también pierdes lo que tenía dentro. El valor del activo es el conjunto: ' + d.aparato + ' + ' + d.datos + ' = ' + d.va + '.'; } },
        { texto: function (d) { return d.va + ', aparato más datos'; }, ok: true,
          titulo: 'Exacto.', expl: function (d) { return 'El VA suma todo lo que pierdes con el activo: ' + d.aparato + ' + ' + d.datos + ' = ' + d.va + '.'; } }
      ],
      tarjetas: [{ sigla: 'VA', texto: 'Cuánto vale el activo completo, en pesos.' }],
      confusion: 'Contar solo el precio del aparato y olvidar que los datos también valen.' },

    { grupo: 'Se cae y se rompe', titulo: 'Cuánto duele', ops: ['multiplica'],
      situacion: function () { return 'Cuando se te cae, la pantalla suele trizarse. Estimas que cada caída te cuesta el 30 % del valor.'; },
      visual: function (d) { return '<div class="cifras">' + cifra('VA', d.va) + '<span class="op" aria-hidden="true">×</span>' + cifra('FE', '30 %') + '<span class="op" aria-hidden="true">=</span>' + cifra('SLE', '?') + '</div>'; },
      pregunta: 'Ese 30 %, ¿qué dice?',
      opciones: [
        { texto: 'Que se cae el 30 % de las veces', ok: false,
          titulo: 'Ojo: eso sería la frecuencia.', expl: function (d) { return 'Cada cuánto pasa lo mide el ARO. El 30 % es el FE: qué parte del valor se pierde cada vez. Una caída cuesta ' + d.va + ' × 30 % = ' + d.f(d.ro.sin.sle) + '.'; } },
        { texto: 'Que pierdes el 30 % del valor cada vez que pasa', ok: true,
          titulo: 'Así es.', expl: function (d) { return 'Eso es el FE. Multiplicado por el VA da la pérdida de un solo evento: ' + d.va + ' × 30 % = ' + d.f(d.ro.sin.sle) + '. Ese número es el SLE.'; } }
      ],
      tarjetas: [{ sigla: 'FE', texto: 'Qué parte del valor se pierde en un evento.' }, { sigla: 'SLE', texto: 'Cuánto pierdes en un evento: VA × FE.' }],
      confusion: 'Confundir el FE (cuánto duele) con el ARO (cada cuánto pasa).' },

    { grupo: 'Se cae y se rompe', titulo: 'Cada cuánto y cuánto al año', ops: ['divide', 'multiplica'],
      situacion: function (d) { return 'Se te cae más o menos 1 vez al año: el ARO es 1 ÷ 1 = 1. La pérdida esperada al año es el SLE por el ARO: ' + d.f(d.ro.sin.sle) + ' × 1 = ' + d.f(d.ro.sin.ale) + '.'; },
      visual: function (d) { return '<div class="cifras">' + cifra('SLE', d.f(d.ro.sin.sle)) + '<span class="op" aria-hidden="true">×</span>' + cifra('ARO', '1') + '<span class="op" aria-hidden="true">=</span>' + cifra('ALE', d.f(d.ro.sin.ale)) + '</div>'; },
      pregunta: 'Si se cayera 5 veces al año, ¿qué le pasa al ALE?',
      opciones: [
        { texto: function (d) { return 'Baja: ' + d.f(d.ro.sin.sle) + ' ÷ 5'; }, ok: false,
          titulo: 'Es al revés.', expl: function (d) { return 'Más caídas significan más pérdida. El ARO sería 5 y se multiplica: ' + d.f(d.ro.sin.sle) + ' × 5 = ' + d.f(L.mul(d.ro.sin.sle, 5)) + ' al año.'; } },
        { texto: function (d) { return 'Sube: ' + d.f(d.ro.sin.sle) + ' × 5'; }, ok: true,
          titulo: 'Correcto.', expl: function (d) { return 'Con 5 caídas al año el ARO es 5, y el ALE sube a ' + d.f(L.mul(d.ro.sin.sle, 5)) + '. El ALE es un promedio de lo que pierdes al año, no una predicción.'; } }
      ],
      tarjetas: [{ sigla: 'ARO', texto: 'Veces al año: veces ÷ años.' }, { sigla: 'ALE', texto: 'Pérdida esperada al año: SLE × ARO.' }],
      confusion: 'Dividir por las veces en vez de multiplicar por el ARO.' },

    { grupo: 'Se cae y se rompe', titulo: 'De pesos a notas: P', ops: ['tabla'], tabla: 'P', cuali: true,
      situacion: function () { return 'Ahora cambiamos de lado: del cuantitativo (pesos) al cualitativo (notas de 1 a 5). El ARO se traduce a una nota P con la tabla.'; },
      pregunta: 'Con un ARO de 1, ¿qué nota P le toca?',
      opciones: [
        { texto: '4 · Probable', ok: false,
          titulo: 'Mira el borde.', expl: function () { return '1 está justo en el límite entre 4 y 5. La regla del borde manda a la nota más alta, para no subestimar el riesgo: P = 5.'; } },
        { texto: '5 · Frecuente', ok: true,
          titulo: 'Bien.', expl: function () { return '«1 vez al año o más» es la fila 5. Y si cae justo en un límite, va a la nota más alta.'; } }
      ],
      tarjetas: [{ sigla: 'P', texto: 'Probabilidad: nota de 1 a 5 que sale del ARO.' }],
      confusion: 'Mezclar cuanti y cuali sin avisar: en el cuali se usa la nota P, no el ARO.' },

    { grupo: 'Se cae y se rompe', titulo: 'El impacto', ops: ['tabla', 'maximo'], tabla: 'Dinero', cuali: true,
      situacion: function (d) { var p = d.ro.sin.piezas; return 'El impacto se mira pieza por pieza: confidencialidad ' + p.c + ' (nadie ve tus datos), integridad ' + p.i + ' (nada cambia), disponibilidad ' + p.d + ' (pasas un día sin celular) y Dinero ' + p.dinero + ' (' + d.f(d.ro.sin.sle) + ' frente a un umbral de ' + d.umbral + ').'; },
      visual: function (d) { var p = d.ro.sin.piezas; return '<div class="piezas">' + [['Confidencialidad', p.c], ['Integridad', p.i], ['Disponibilidad', p.d], ['Dinero', p.dinero]].map(function (x) { return '<div class="pieza"><span class="pieza-nom">' + x[0] + '</span><span class="pieza-val">' + x[1] + '</span></div>'; }).join('') + '</div>'; },
      pregunta: '¿Cuál es el impacto I?',
      opciones: [
        { texto: '2, el promedio redondeado', ok: false,
          titulo: 'No se promedia.', expl: function (d) { return 'El impacto es la pieza más alta: máximo(1, 1, 3, 2) = ' + d.ro.sin.impacto + '. Un promedio escondería el daño que más duele.'; } },
        { texto: '3, la pieza más alta', ok: true,
          titulo: 'Eso es.', expl: function (d) { return 'I = máximo(1, 1, 3, 2) = ' + d.ro.sin.impacto + '. Se puntúa cada pieza por separado porque cada control suele bajar solo algunas.'; } }
      ],
      tarjetas: [{ sigla: 'I', texto: 'Impacto: la más alta de C, I, D y Dinero.' }, { sigla: 'CIA', texto: 'Las tres piezas clásicas de la seguridad.' }],
      confusion: 'Puntuar el evento («se cae») y no la consecuencia («qué pierdo»).' },

    { grupo: 'Se cae y se rompe', titulo: 'El nivel de riesgo', ops: ['multiplica', 'tabla'], tabla: 'nivel', cuali: true,
      situacion: function () { return 'Con P e I ya puedes calcular el riesgo cualitativo, multiplicando las dos notas.'; },
      pregunta: '¿Qué se multiplica?',
      opciones: [
        { texto: 'ARO × I = 1 × 3', ok: false,
          titulo: 'Te cambiaste de lado.', expl: function (d) { return 'El ARO vive en el lado de los pesos. En las notas se usa P: ' + d.ro.sin.p + ' × ' + d.ro.sin.impacto + ' = ' + d.ro.sin.riesgo + ', nivel ' + d.ro.sin.nivel + '.'; } },
        { texto: 'P × I = 5 × 3', ok: true,
          titulo: 'Correcto.', expl: function (d) { return d.ro.sin.p + ' × ' + d.ro.sin.impacto + ' = ' + d.ro.sin.riesgo + '. En la tabla, 15 a 25 es nivel ' + d.ro.sin.nivel + '.'; } }
      ],
      confusion: 'Usar el ARO en vez de la nota P al multiplicar en el cuali.' },

    { grupo: 'Se cae y se rompe', titulo: 'El control', ops: [],
      situacion: function () { return 'Ya sabes que tu celular cae 1 vez al año y que cada caída cuesta el 30 %. Ahora le pones una carcasa resistente.'; },
      visual: function () { return antesDespues('Cae 1 vez · pierdes 30 %', 'Con carcasa: ?'); },
      pregunta: '¿Qué cambia con la carcasa?',
      opciones: [
        { texto: 'Se cae menos veces', ok: false,
          titulo: 'Suena razonable, pero no.', expl: function () { return 'La carcasa no evita que se te resbale de la mano: actúa después, cuando ya va cayendo. Bajar las veces sería bajar el ARO, como hace una alarma contra robo.'; } },
        { texto: 'Se cae igual, pero se rompe menos', ok: true,
          titulo: 'Justo eso.', expl: function () { return 'La carcasa amortigua el golpe: no cambia el ARO, baja el FE. Estimas que con ella cada caída cuesta el 10 %.'; } }
      ],
      versus: true,
      confusion: 'Creer que todo control baja el ARO y el FE a la vez. Casi siempre baja solo uno.' },

    { grupo: 'Se cae y se rompe', titulo: 'Cuánto ahorras', ops: ['multiplica', 'resta'],
      situacion: function (d) { return 'Con carcasa el FE baja a 10 %: el SLE queda en ' + d.va + ' × 10 % = ' + d.f(d.ro.con.sle) + ', y con 1 caída al año el ALE también es ' + d.f(d.ro.con.ale) + '.'; },
      visual: function (d) { return antesDespues('ALE ' + d.f(d.ro.sin.ale), 'ALE ' + d.f(d.ro.con.ale)); },
      pregunta: '¿Cuánto te ahorra la carcasa al año?',
      opciones: [
        { texto: function (d) { return d.f(d.ro.con.ale); }, ok: false,
          titulo: 'Ese es lo que todavía pierdes.', expl: function (d) { return d.f(d.ro.con.ale) + ' es el ALE con carcasa. El ahorro es la diferencia: ' + d.f(d.ro.sin.ale) + ' − ' + d.f(d.ro.con.ale) + ' = ' + d.f(d.ro.reduccion) + '.'; } },
        { texto: function (d) { return d.f(d.ro.reduccion); }, ok: true,
          titulo: 'Bien.', expl: function (d) { return 'La reducción es ALE sin control − ALE con control: ' + d.f(d.ro.sin.ale) + ' − ' + d.f(d.ro.con.ale) + ' = ' + d.f(d.ro.reduccion) + ' al año.'; } }
      ],
      confusion: 'Confundir el costo del control con la pérdida anual: son cosas distintas.' },

    { grupo: 'Se cae y se rompe', titulo: 'El costo al año', ops: ['divide'],
      situacion: function () { return 'La carcasa cuesta $30.000 y dura 3 años. Para compararla con un ahorro anual, su costo también tiene que ser anual.'; },
      pregunta: '¿Cuál es el costo anual de la carcasa?',
      opciones: [
        { texto: '$30.000', ok: false,
          titulo: 'Así la pagarías tres veces.', expl: function (d) { return 'La compras una vez y te dura 3 años: $30.000 ÷ 3 = ' + d.f(d.ro.costo) + ' al año. Si tomaras $30.000 cada año, el valor neto daría $0 y parecería un empate.'; } },
        { texto: '$10.000', ok: true,
          titulo: 'Correcto.', expl: function (d) { return 'Precio ÷ años de vida = $30.000 ÷ 3 = ' + d.f(d.ro.costo) + '. Aquí se divide; el ALE, en cambio, se multiplica.'; } }
      ],
      confusion: 'Comparar periodos distintos: un precio de una vez contra una pérdida de cada año.' },

    { grupo: 'Se cae y se rompe', titulo: 'El valor neto', ops: ['resta', 'compara'],
      situacion: function (d) { return 'Tienes el ahorro (' + d.f(d.ro.reduccion) + ' al año) y el costo (' + d.f(d.ro.costo) + ' al año). Falta juntarlos.'; },
      pregunta: '¿Cómo se juntan?',
      opciones: [
        { texto: function (d) { return 'Se suma el costo a la pérdida: ' + d.f(d.ro.con.ale) + ' + ' + d.f(d.ro.costo); }, ok: false,
          titulo: 'Así se mezclan dos preguntas.', expl: function (d) { return 'Primero se mide cuánto riesgo queda; el costo se descuenta al final del ahorro: ' + d.f(d.ro.reduccion) + ' − ' + d.f(d.ro.costo) + ' = +' + d.f(d.netoRo) + '.'; } },
        { texto: function (d) { return 'Se resta el costo al ahorro: ' + d.f(d.ro.reduccion) + ' − ' + d.f(d.ro.costo); }, ok: true,
          titulo: 'Exacto.', expl: function (d) { return 'Valor neto = ' + d.f(d.ro.reduccion) + ' − ' + d.f(d.ro.costo) + ' = +' + d.f(d.netoRo) + '. Positivo: conviene. Cero sería empate; negativo, no conviene.'; } }
      ],
      confusion: 'Equivocarse con el signo: un valor neto negativo significa que el control cuesta más de lo que ahorra.' },

    { grupo: 'Se cae y se rompe', titulo: 'Y en notas', ops: ['maximo', 'multiplica'], tabla: 'nivel', cuali: true,
      situacion: function (d) { return 'Con carcasa casi no hay días sin celular (disponibilidad baja a ' + d.ro.con.piezas.d + ') y la pérdida de ' + d.f(d.ro.con.sle) + ' queda en Dinero ' + d.ro.con.piezas.dinero + '. P sigue en ' + d.ro.con.p + ': la carcasa no cambia cuántas veces se cae.'; },
      visual: function (d) { return antesDespues(d.ro.sin.p + ' × ' + d.ro.sin.impacto + ' = ' + d.ro.sin.riesgo + ' · ' + d.ro.sin.nivel, d.ro.con.p + ' × ' + d.ro.con.impacto + ' = ' + d.ro.con.riesgo + ' · ?'); },
      pregunta: '¿Cambió de nivel?',
      opciones: [
        { texto: 'No, P sigue en 5, así que sigue Alto', ok: false,
          titulo: 'Mira la otra nota.', expl: function (d) { return 'P no cambia, pero I baja de ' + d.ro.sin.impacto + ' a ' + d.ro.con.impacto + ': ' + d.ro.con.p + ' × ' + d.ro.con.impacto + ' = ' + d.ro.con.riesgo + ', nivel ' + d.ro.con.nivel + '.'; } },
        { texto: 'Sí, baja a Medio', ok: true,
          titulo: 'Así es.', expl: function (d) { return d.ro.con.p + ' × ' + d.ro.con.impacto + ' = ' + d.ro.con.riesgo + ': mejora ' + d.ro.mejora + ' puntos, de ' + d.ro.sin.nivel + ' a ' + d.ro.con.nivel + '. Aquí pesos y notas dicen lo mismo: conviene.'; } }
      ] },

    { grupo: 'Robo', titulo: 'El borde de P', ops: ['divide', 'tabla'], tabla: 'P', cuali: true,
      situacion: function (d) { return 'Otra amenaza para el mismo celular: que te lo roben. Es un ataque deliberado, distinto de la caída. Calculas que pasa 1 vez cada 3 años, y te quedas sin aparato ni datos (FE 100 %): el ALE es ' + d.va + ' × 1/3 = ' + d.f(d.rb.sin.ale) + '.'; },
      pregunta: '1 vez cada 3 años es 0,333… ¿Qué nota P le toca?',
      opciones: [
        { texto: '3 · Ocasional, porque 0,3 queda bajo 1/3', ok: false,
          titulo: 'El redondeo te jugó en contra.', expl: function () { return '1 ÷ 3 no es 0,3: es exactamente 1/3, el borde entre 3 y 4. En el borde va a la nota más alta: P = 4. Por eso el programa calcula con fracciones, nunca con decimales redondeados.'; } },
        { texto: '4 · Probable, porque 1/3 está justo en el borde', ok: true,
          titulo: 'Muy bien.', expl: function () { return 'Con la fracción exacta, 1/3 cae en el límite y sube a la nota más alta: P = 4.'; } }
      ],
      confusion: 'Redondear antes de comparar: en el borde cambia la nota.' },

    { grupo: 'Robo', titulo: 'Borrado remoto', ops: ['resta', 'maximo'],
      situacion: function (d) { var s = d.rb.sin.piezas, c = d.rb.con.piezas; return 'Activas el borrado y bloqueo remoto, que viene incluido (costo $0). Si te roban, borras el celular a distancia: confidencialidad e integridad bajan de ' + s.c + ' a ' + c.c + '. La disponibilidad sigue en ' + c.d + ': el borrado no te devuelve el celular.'; },
      visual: function (d) { return antesDespues(d.rb.sin.riesgo + ' · ' + d.rb.sin.nivel, d.rb.con.riesgo + ' · ' + d.rb.con.nivel); },
      pregunta: '¿Cambia el ALE con el borrado remoto?',
      opciones: [
        { texto: 'Sí, baja porque proteges los datos', ok: false,
          titulo: 'En pesos no cambia.', expl: function (d) { return 'El robo pasa igual de seguido y pierdes igual el aparato y los datos: ALE ' + d.f(d.rb.sin.ale) + ' antes y después. El valor neto es $0: empate en pesos.'; } },
        { texto: 'No: en pesos da lo mismo, pero en notas mejora', ok: true,
          titulo: 'Exacto.', expl: function (d) { return 'ALE ' + d.f(d.rb.con.ale) + ' sin cambio, pero el riesgo cualitativo baja de ' + d.rb.sin.riesgo + ' a ' + d.rb.con.riesgo + '. Mejora ' + d.rb.mejora + ' puntos aunque siga en ' + d.rb.con.nivel + '.'; } }
      ],
      confusion: 'Fiarse solo del color: un riesgo puede mejorar sin cambiar de nivel.' },

    { grupo: 'Robo', titulo: 'El seguro', ops: ['resta', 'divide'],
      situacion: function (d) { return 'Con el borrado ya puesto, evalúas un seguro contra robo. Paga $80.000 (el 80 % del aparato) y no cubre los datos. Cuesta unos $44.000 al año.'; },
      pregunta: 'Con seguro, ¿cuál es el FE?',
      opciones: [
        { texto: '20 %, lo que no cubre del aparato', ok: false,
          titulo: 'Te faltó el valor total.', expl: function (d) { return 'El 80 % es del aparato, no de los ' + d.va + '. Lo que sigue perdiéndose es ' + d.va + ' − $80.000 = $70.000, o sea ' + L.fmtPct(d.sg.con.fe) + ' del valor.'; } },
        { texto: '46,67 %, lo que sigue perdiéndose', ok: true,
          titulo: 'Correcto.', expl: function (d) { return 'FE = (' + d.va + ' − $80.000) ÷ ' + d.va + ' = ' + L.fmtPct(d.sg.con.fe) + '. El FE mide lo que sigue perdiéndose, no lo que cubre el control. Sin redondear a 50 %.'; } }
      ],
      confusion: 'Leer el FE al revés, o tomar el 80 % del aparato como si fuera del valor total.' },

    { grupo: 'Robo', titulo: 'Cuando no coinciden', ops: ['multiplica', 'resta', 'compara'],
      situacion: function (d) { return 'Con seguro el ALE baja a ' + d.f(d.sg.con.ale) + ': ahorras ' + d.f(d.sg.reduccion) + ' al año, pero el seguro cuesta $44.000. Valor neto: ' + d.f(d.netoSg) + '. En notas, en cambio, el riesgo baja de ' + d.sg.sin.riesgo + ' a ' + d.sg.con.riesgo + ' (' + d.sg.con.nivel + ').'; },
      visual: function (d) { return '<div class="cifras">' + cifra('En pesos', d.f(d.netoSg)) + cifra('En notas', d.sg.sin.riesgo + ' → ' + d.sg.con.riesgo) + '</div>'; },
      pregunta: '¿Qué hace el programa cuando pesos y notas no coinciden?',
      opciones: [
        { texto: 'Elige el lado de los pesos', ok: false,
          titulo: 'No decide por ti.', expl: function () { return 'Muestra los dos veredictos. Los pesos hablan del promedio de plata a lo largo de los años; las notas, de cuánto duele cuando pasa. La decisión es tuya: puedes contratar el seguro o aceptar el riesgo.'; } },
        { texto: 'Muestra los dos y deja que decidas tú', ok: true,
          titulo: 'Eso.', expl: function () { return 'En este ejemplo la decisión fue no contratarlo y aceptar el riesgo: si te lo roban, compras otro. En el programa eso se marca con «Lo acepto».'; } }
      ],
      confusion: 'Creer que todo control conviene: hay que compararlo con su costo.' },

    { grupo: 'Cierre', titulo: 'El resumen', ops: ['compara'], fin: true,
      situacion: function () { return 'Recorriste el análisis completo de dos amenazas. En la lista final, los riesgos se ordenan por lo que queda después del control: primero el robo (16, Alto), después la rotura con carcasa (5, Medio).'; },
      visual: function () { return '<ol class="mini-lista"><li><span class="nivel nivel-alto"><b>16</b> Alto</span> Robo, con borrado remoto</li><li><span class="nivel nivel-medio"><b>5</b> Medio</span> Se cae y se rompe, con carcasa</li></ol>'; } }
  ];

  return { pasos: pasos, datos: datos, OPS: OPS };
})();
