/* Arranque, navegación y eventos. */
(function () {
  'use strict';
  var main = document.getElementById('principal');
  var anunciador = document.getElementById('anunciador');

  document.title = CONFIG.nombre;
  document.querySelectorAll('[data-nombre-app]').forEach(function (el) { el.textContent = CONFIG.nombre; });

  Estado.iniciar();

  /* ---------- Navegación ---------- */
  function pintarPasos() {
    var nav = document.getElementById('pasos');
    nav.innerHTML = '<ol>' + TEXTOS.pantallas.map(function (p, k) {
      var actual = Estado.ui.pantalla === p.id;
      return '<li><button type="button" data-accion="ir" data-destino="' + p.id + '"' + (actual ? ' aria-current="step"' : '') + '>' +
        '<span class="paso-n" aria-hidden="true">' + (k + 1) + '</span><span class="paso-t">' + p.corto + '</span></button></li>';
    }).join('') + '</ol>';
  }

  function render(enfocar) {
    var foco = document.activeElement && document.activeElement.id;
    var y = window.scrollY;
    main.dataset.pantalla = Estado.ui.pantalla;
    main.innerHTML = Vistas.pantalla(Estado.ui.pantalla);
    document.title = Vistas.titulo(Estado.ui.pantalla) + ' · ' + CONFIG.nombre;
    pintarPasos();
    // En el ejemplo guiado: el botón de la barra sirve para volver y el modo estudio no aplica
    var enGuia = Estado.ui.pantalla === 'guia', bg = document.querySelector('.btn-guia');
    bg.textContent = enGuia ? 'Volver al análisis' : 'Ejemplo guiado';
    document.querySelector('.estudio-sw').hidden = enGuia;
    refrescar();
    if (enfocar) {
      var h1 = main.querySelector('h1'); window.scrollTo(0, 0);
      if (h1) h1.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, y);
      if (foco) { var el = document.getElementById(foco); if (el) el.focus({ preventScroll: true }); }
    }
  }

  function ir(destino, diapo) {
    Estado.ui.pantalla = destino; Estado.ui.intento = false; Estado.ui.tocados = {};
    Estado.ui.diapo[destino] = diapo || 0;
    render(true);
  }

  /* Diapositivas: una tarjeta a la vez dentro de cada paso. */
  // Todas las diapositivas del paso ocupan la misma pila: la tarjeta no cambia de alto al avanzar.
  function verDiapo(k) {
    Estado.ui.diapo[Estado.ui.pantalla] = k;
    render(false);
    var sec = main.querySelector('.pila > .sec:not([hidden])'); if (!sec) return;
    var h2 = sec.querySelector('h2');
    if (h2.getBoundingClientRect().top < 90) window.scrollTo(0, Math.max(0, h2.getBoundingClientRect().top + window.scrollY - 150));
    h2.focus({ preventScroll: true });
  }
  function diapoDe(el) {
    var secs = Array.prototype.slice.call(main.querySelectorAll('.pila > .sec'));
    return secs.indexOf(el.closest('.sec'));
  }

  /* ---------- Valores en vivo y errores ---------- */
  function refrescar() {
    main.querySelectorAll('[data-vivo]').forEach(function (el) {
      var fn = Vistas.vivos[el.dataset.vivo];
      el.innerHTML = fn ? fn(el.dataset.args) : '';
    });
    var errs = Vistas.errores(Estado.ui.pantalla);
    main.querySelectorAll('[data-err]').forEach(function (el) {
      var k = el.dataset.err, msg = errs[k];
      var visible = !!msg && (Estado.ui.intento || Estado.ui.tocados[k] || k === 'control' || k === 'costo');
      el.hidden = !visible;
      el.innerHTML = visible ? '<span class="icono-error" role="img" aria-label="Error">!</span> ' + Vistas.esc(msg) : '';
      var campo = main.querySelector('[data-errkey="' + k + '"]');
      if (campo) {
        campo.setAttribute('aria-invalid', visible ? 'true' : 'false');
        enlazarError(campo, visible);
      }
    });
    copiarEstudio();
  }

  // El material de estudio de la tarjeta visible se muestra en el apéndice de al lado.
  function copiarEstudio() {
    var ap = main.querySelector('.apendice-notas'); if (!ap) return;
    var sec = main.querySelector('.pila > .sec:not([hidden])');
    var partes = sec ? Array.prototype.map.call(sec.querySelectorAll('.margen'), function (m) { return '<div class="nota-estudio">' + m.innerHTML + '</div>'; }) : [];
    ap.innerHTML = partes.join('').replace(/(id|aria-controls)="tip-/g, '$1="ap-tip-');
  }

  // El mensaje se lista en aria-describedby solo mientras se ve.
  function enlazarError(campo, visible) {
    var id = campo.dataset.error; if (!id) return;
    var ids = (campo.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== id; });
    if (visible) ids.push(id);
    if (ids.length) campo.setAttribute('aria-describedby', ids.join(' ')); else campo.removeAttribute('aria-describedby');
  }

  var temporizadorAnuncio;
  function anunciar(texto) {
    clearTimeout(temporizadorAnuncio); anunciador.textContent = '';
    temporizadorAnuncio = setTimeout(function () { anunciador.textContent = texto; }, 500);
  }

  function valorDe(el) {
    if (el.type === 'checkbox') return el.checked;
    return el.value;
  }

  // Al cambiar estos campos cambia la estructura de la pantalla: se vuelve a dibujar.
  function cambiaEstructura(el) {
    return el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio';
  }

  main.addEventListener('input', function (ev) {
    var el = ev.target; if (!el.dataset || !el.dataset.campo) return;
    if (cambiaEstructura(el)) return; // lo maneja 'change'
    Estado.escribir(el.dataset.campo, valorDe(el));
    refrescar();
  });

  // Ejemplo guiado: elegir una respuesta revela la explicación
  main.addEventListener('change', function (ev) {
    var el = ev.target; if (!el.hasAttribute || !el.hasAttribute('data-guia-op')) return;
    var g = Estado.ui.guia; g.respuestas[g.paso] = +el.value;
    render(false);
    var rev = document.getElementById('revelado'); if (rev) rev.focus({ preventScroll: false });
  });
  main.addEventListener('toggle', function (ev) {
    if (ev.target.classList && ev.target.classList.contains('ruta-det')) Estado.ui.rutaAbierta = ev.target.open;
    if (ev.target.dataset && ev.target.dataset.recordar) Estado.ui.abiertos[ev.target.dataset.recordar] = ev.target.open;
  }, true);

  main.addEventListener('change', function (ev) {
    var el = ev.target; if (!el.dataset || !el.dataset.campo) return;
    if (!cambiaEstructura(el)) return;
    var ruta = el.dataset.campo;
    Estado.escribir(ruta, valorDe(el));
    if (/\.familia$/.test(ruta)) Estado.escribir(ruta.replace(/familia$/, 'amenaza'), '');
    // Al aceptar se anota la fecha (local) para contar la revisión cada 3 meses.
    if (/\.tratamiento\.opcion$/.test(ruta) && el.value === 'aceptar') {
      var rutaF = ruta.replace(/opcion$/, 'far'), far = Estado.leer(rutaF);
      if (!far || !far.aceptadoEl) {
        var h = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
        Estado.escribir(rutaF + '.aceptadoEl', h.getFullYear() + '-' + dd(h.getMonth() + 1) + '-' + dd(h.getDate()));
      }
    }
    if (el.dataset.errkey) Estado.ui.tocados[el.dataset.errkey] = true;
    render(false);
  });

  // Validación tras interactuar: el error aparece al salir del campo.
  main.addEventListener('blur', function (ev) {
    var el = ev.target;
    if (!el.dataset || !el.dataset.errkey || el.tagName === 'SELECT') return;
    var k = el.dataset.errkey;
    if (!el.value && !Estado.ui.intento) return;
    var ya = Estado.ui.tocados[k]; Estado.ui.tocados[k] = true;
    refrescar();
    var err = document.getElementById(el.dataset.error);
    if (!ya && err && !err.hidden) {
      var etq = el.labels && el.labels[0] ? el.labels[0].textContent + ': ' : '';
      anunciar(etq + err.textContent.replace(/^!\s*/, 'Error: '));
    }
  }, true);

  /* ---------- Acciones ---------- */
  var archivo = document.getElementById('archivo');
  archivo.addEventListener('change', function () {
    var f = archivo.files && archivo.files[0]; if (!f) return;
    Estado.importar(f, function (err) {
      archivo.value = '';
      if (err) { anunciar(err); alert(err); return; }
      anunciar('Análisis abierto.'); ir('inicio');
    });
  });

  var acciones = {
    ir: function (b) { ir(b.dataset.destino); },
    ejemplo: function () { Estado.cargarEjemplo(); anunciar('Ejemplo del celular cargado.'); ir('activo'); },
    vacio: function () {
      if (!confirm('¿Empezar un análisis vacío? Se reemplaza el actual (descárgalo antes si lo quieres guardar).')) return;
      Estado.empezarVacio(); anunciar('Análisis vacío.'); ir('inicio', 1);
    },
    abrir: function () { archivo.click(); },
    exportar: function () { Estado.exportar(); anunciar('Análisis descargado.'); },
    nuevoControl: function () {
      var r = Estado.riesgo(Estado.ui.riesgoId); if (!r) return;
      var c = Estado.agregarControl();
      Estado.escribir('riesgos.' + Estado.indice('riesgos', r.id) + '.aplicacion.controlId', c.id);
      render(false); anunciar('Control nuevo creado y aplicado a esta amenaza.');
      var el = document.querySelector('[data-campo="controles.' + Estado.indice('controles', c.id) + '.nombre"]'); if (el) el.focus();
    },
    quitarControl: function (b) {
      var usos = Estado.analisis.riesgos.filter(function (r) { return r.aplicacion && r.aplicacion.controlId === b.dataset.id; }).length;
      if (usos && !confirm('Este control se usa en ' + usos + (usos === 1 ? ' amenaza' : ' amenazas') + '. Si lo quitas, quedan sin control. ¿Quitarlo?')) return;
      Estado.quitarControl(b.dataset.id); render(false); anunciar('Control quitado.');
    },
    diapoIr: function (b) { verDiapo(+b.dataset.k); },
    panelEstudio: function () {
      Estado.ui.abiertos.estudio = Estado.ui.abiertos.estudio === false;
      render(false);
      var t = main.querySelector('.apendice-tirador'); if (t) t.focus();
    },
    diapoSig: function () { verDiapo((Estado.ui.diapo[Estado.ui.pantalla] || 0) + 1); },
    diapoAnt: function () {
      var k = Estado.ui.diapo[Estado.ui.pantalla] || 0;
      if (k > 0) return verDiapo(k - 1);
      var l = TEXTOS.pantallas, j = l.map(function (p) { return p.id; }).indexOf(Estado.ui.pantalla);
      if (j > 0) ir(l[j - 1].id, 99); // el mazo lo ajusta a su última diapositiva
    },
    agregarActivo: function () { Estado.agregarActivo(); Estado.ui.diapo.activo = 0; render(false); enfocarUltimo('[data-campo$=".nombre"]'); },
    quitarActivo: function (b) {
      if (!confirm('¿Quitar este activo y sus amenazas?')) return;
      Estado.quitarActivo(b.dataset.id); render(false); anunciar('Activo quitado.');
    },
    elegirActivo: function (b) { Estado.ui.activoId = b.dataset.id; Estado.ui.tocados = {}; render(false); },
    agregarParte: function () {
      var act = Estado.activo(Estado.ui.activoId); act.partes.push({ nombre: '', valor: '' }); Estado.guardar(); render(false);
      enfocarUltimo('.fila-parte input');
    },
    quitarParte: function (b) { var act = Estado.activo(Estado.ui.activoId); act.partes.splice(+b.dataset.j, 1); Estado.guardar(); render(false); },
    elegirRiesgo: function (b) { Estado.ui.riesgoId = b.dataset.id; Estado.ui.tocados = {}; Estado.ui.intento = false; render(false); },
    agregarRiesgo: function () { Estado.agregarRiesgo(); Estado.ui.diapo.amenaza = 0; render(false); var s = main.querySelector('[data-campo$=".familia"]'); if (s) s.focus(); },
    quitarRiesgo: function (b) {
      if (!confirm('¿Quitar esta amenaza?')) return;
      Estado.quitarRiesgo(b.dataset.id); render(false); anunciar('Amenaza quitada.');
    },
    abrirRiesgo: function (b) { Estado.ui.riesgoId = b.dataset.id; ir('resultado'); },
    guia: function () {
      if (Estado.ui.pantalla === 'guia') return ir(Estado.ui.volverA || 'inicio', Estado.ui.volverDiapo);
      Estado.ui.volverA = Estado.ui.pantalla; Estado.ui.volverDiapo = Estado.ui.diapo[Estado.ui.pantalla] || 0;
      ir('guia');
    },
    guiaIr: function (b) { Estado.ui.guia.paso = +b.dataset.k; Estado.ui.rutaAbierta = false; ir('guia'); },
    guiaAnt: function () { var g = Estado.ui.guia; if (g.paso > 0) { g.paso--; ir('guia'); } },
    guiaSig: function (b) {
      if (b.getAttribute('aria-disabled') === 'true') { anunciar('Responde la pregunta para seguir.'); var op = main.querySelector('[data-guia-op]'); if (op) op.focus(); return; }
      var g = Estado.ui.guia; if (g.paso < Guia.pasos.length - 1) { g.paso++; ir('guia'); }
    },
    guiaFin: function () {
      if (!confirm('¿Cargar el ejemplo del celular en el programa? Se reemplaza el análisis actual.')) return;
      Estado.cargarEjemplo(); Estado.ui.riesgoId = 'r-rotura'; ir('resultado');
    },
    verResultado: function () {
      var res = Calculo.de(Estado.riesgo(Estado.ui.riesgoId));
      if (!res.ok) {
        Estado.ui.intento = true; refrescar();
        var primero = main.querySelector('[aria-invalid="true"]');
        if (!primero) { anunciar('Faltan datos: revisa el umbral y el activo.'); return; }
        var k = diapoDe(primero), clave = primero.dataset.errkey;
        if (k >= 0) { Estado.ui.diapo.amenaza = k; render(false); }
        var el = main.querySelector('[data-errkey="' + clave + '"]');
        if (el && el.tagName === 'FIELDSET') el = el.querySelector('input:checked') || el.querySelector('input');
        if (el) el.focus();
        return;
      }
      ir('resultado');
    }
  };
  function enfocarUltimo(sel) { var l = main.querySelectorAll(sel); if (l.length) l[l.length - 1].focus(); }

  /* ---------- Siglas: explicación al pasar, enfocar o tocar ----------
     El globo es position: fixed para que no lo corte una tabla con scroll; aquí se ubica junto a la sigla. */
  function ubicarTip(btn) {
    var tip = btn && btn.nextElementSibling; if (!tip || !tip.getClientRects().length) return;
    var r = btn.getBoundingClientRect(), t = tip.getBoundingClientRect(), m = 8;
    tip.style.left = Math.max(m, Math.min(r.left + r.width / 2 - t.width / 2, innerWidth - m - t.width)) + 'px';
    tip.style.top = (r.bottom + 8 + t.height > innerHeight - m ? r.top - 8 - t.height : r.bottom + 8) + 'px';
  }
  function cerrarSiglas(excepto) {
    document.querySelectorAll('.sigla[aria-expanded="true"]').forEach(function (b) { if (b !== excepto) b.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('mouseover', function (ev) { var e = ev.target.closest && ev.target.closest('.sigla-env'); if (e) ubicarTip(e.firstElementChild); });
  document.addEventListener('focusin', function (ev) { if (ev.target.classList && ev.target.classList.contains('sigla')) ubicarTip(ev.target); });
  document.addEventListener('mouseout', function (ev) { var e = ev.target.closest && ev.target.closest('.sigla-env'); if (e && !e.contains(ev.relatedTarget)) e.classList.remove('cerrado'); });
  document.addEventListener('focusout', function (ev) { var e = ev.target.closest && ev.target.closest('.sigla-env'); if (e) e.classList.remove('cerrado'); });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    cerrarSiglas();
    document.querySelectorAll('.sigla-env:hover, .sigla-env:focus-within').forEach(function (e) { e.classList.add('cerrado'); });
  });
  window.addEventListener('scroll', function () {
    document.querySelectorAll('.sigla-tip').forEach(function (t) { ubicarTip(t.previousElementSibling); });
  }, { passive: true });

  document.addEventListener('click', function (ev) {
    var sg = ev.target.closest('.sigla');
    cerrarSiglas(sg);
    if (sg) {
      var abrir = sg.getAttribute('aria-expanded') !== 'true';
      sg.setAttribute('aria-expanded', String(abrir)); sg.parentNode.classList.toggle('cerrado', !abrir);
      ubicarTip(sg); return;
    }
    var b = ev.target.closest('[data-accion]'); if (!b) return;
    var fn = acciones[b.dataset.accion]; if (fn) { ev.preventDefault(); fn(b); }
  });

  /* ---------- Modo estudio (interruptor) ---------- */
  var sw = document.getElementById('modo-estudio');
  if (!('switch' in HTMLInputElement.prototype)) { sw.setAttribute('role', 'switch'); sw.classList.add('switch-respaldo'); }
  sw.checked = Estado.prefs.estudio;
  sw.addEventListener('change', function () {
    Estado.prefs.estudio = sw.checked; Estado.guardarPrefs();
    document.documentElement.classList.toggle('estudio-on', sw.checked);
    render(false);
    anunciar(sw.checked ? 'Modo estudio activado.' : 'Modo estudio desactivado.');
  });
  document.documentElement.classList.toggle('estudio-on', Estado.prefs.estudio);

  /* ---------- Tema: dos estados, el del sistema o el opuesto ---------- */
  var meta = document.querySelector('meta[name="color-scheme"]');
  var btnTema = document.getElementById('tema');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function sistema() { return mq.matches ? 'dark' : 'light'; }
  function guardadoTema() { try { return localStorage.getItem('color-scheme'); } catch (e) { return null; } }
  function actual() { return guardadoTema() || sistema(); }
  function pintarTema() {
    var oscuro = actual() === 'dark';
    btnTema.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    btnTema.dataset.oscuro = oscuro; // muestra el sol en oscuro y la luna en claro
  }
  btnTema.addEventListener('click', function () {
    var destino = actual() === 'dark' ? 'light' : 'dark';
    try { if (destino === sistema()) localStorage.removeItem('color-scheme'); else localStorage.setItem('color-scheme', destino); } catch (e) { /* sin guardado */ }
    meta.content = destino === sistema() ? 'light dark' : destino;
    if (destino !== sistema() && !guardadoTema()) meta.content = destino; // aplica aunque no se pueda guardar
    pintarTema();
  });
  mq.addEventListener('change', pintarTema);
  window.addEventListener('storage', function (e) {
    if (e.key === 'color-scheme') { meta.content = e.newValue || 'light dark'; pintarTema(); }
  });
  pintarTema();

  render(false);
})();
