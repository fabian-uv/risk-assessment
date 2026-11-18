/* Estado del análisis: lectura/escritura por ruta, guardado local y archivos JSON.
   Nada sale del navegador. */
var Estado = (function () {
  'use strict';
  var analisis = null;
  var ui = { pantalla: 'inicio', activoId: null, riesgoId: null, tocados: {}, guia: { paso: 0, respuestas: {} }, rutaAbierta: false, abiertos: {}, diapo: {} };
  var prefs = { estudio: true };

  function nuevoId(pref) { return pref + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function vacio() {
    return { version: 1, umbral: '', umbralAceptacion: 'Bajo', controles: [], activos: [], riesgos: [] };
  }
  function nuevoActivo() {
    return { id: nuevoId('act'), tipo: 'computador', nombre: '', partes: [{ nombre: 'Equipo', valor: '' }, { nombre: 'Datos', valor: '' }], mtd: { valor: '', unidad: 'd' } };
  }
  function nuevoRiesgo(activoId) {
    return { id: nuevoId('r'), activoId: activoId, familia: '', amenaza: '', etiqueta: '',
      veces: '', anios: '', fe: '', c: '', i: '', d: { modo: 'duracion', valor: '', unidad: 'h', nota: '' },
      origenes: { aro: 'propia', fe: 'propia', impacto: 'propia' },
      aplicacion: { controlId: '', cambiaAro: false, veces: '', anios: '', cambiaFe: false, feModo: 'pct', fe: '', cubierto: '',
        cambiaPiezas: false, piezas: { c: '', i: '', d: { modo: 'nota', valor: '', unidad: 'h', nota: '' } }, origen: 'propia', confirmado: false },
      tratamiento: { opcion: '', far: {} } };
  }
  function nuevoControl() { return { id: nuevoId('ctl'), nombre: '', tipoCosto: 'anual', costo: '', vida: '', origen: 'mercado', transfiere: false }; }

  // Completa lo que falte (análisis de una versión anterior) y descarta valores que no
  // estén en las listas permitidas: un archivo importado puede traer cualquier cosa.
  // Copia de la plantilla los objetos y listas que falten o vengan con otro tipo.
  function completar(obj, plantilla) {
    Object.keys(plantilla).forEach(function (k) {
      var p = plantilla[k];
      if (Array.isArray(p)) { if (!Array.isArray(obj[k])) obj[k] = p; }
      else if (esObjeto(p)) { if (!esObjeto(obj[k])) obj[k] = p; else completar(obj[k], p); }
    });
    return obj;
  }
  function normalizar(a) {
    if (['Bajo', 'Medio'].indexOf(a.umbralAceptacion) < 0) a.umbralAceptacion = 'Bajo';
    a.activos.forEach(function (x) {
      completar(x, nuevoActivo());
      x.partes = x.partes.filter(esObjeto);
    });
    a.riesgos.forEach(function (x) { completar(x, nuevoRiesgo(x.activoId)); });
    a.controles.forEach(function (c) {
      if (['anual', 'unico'].indexOf(c.tipoCosto) < 0) c.tipoCosto = 'anual';
      c.transfiere = c.transfiere === true;
    });
    a.riesgos.forEach(function (r) {
      var t = r.tratamiento;
      if (!t || typeof t !== 'object') t = r.tratamiento = { opcion: r.aceptado === true ? 'aceptar' : '', far: {} };
      if (Logica.TRATAMIENTOS.indexOf(t.opcion) < 0) t.opcion = '';
      if (!t.far || typeof t.far !== 'object') t.far = {};
      delete r.aceptado;
    });
    return a;
  }
  function esObjeto(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
  function valido(a) {
    return esObjeto(a) && Array.isArray(a.controles) && Array.isArray(a.activos) && Array.isArray(a.riesgos) &&
      [a.controles, a.activos, a.riesgos].every(function (lista) {
        return lista.every(function (x) { return esObjeto(x) && typeof x.id === 'string'; });
      }) &&
      a.riesgos.every(function (r) { return a.activos.some(function (x) { return x.id === r.activoId; }); });
  }

  function leerLocal(clave) {
    try { var s = localStorage.getItem(clave); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function escribirLocal(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); return true; } catch (e) { return false; }
  }

  var temporizador = null;
  function guardar() {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { escribirLocal(CONFIG.claveGuardado, analisis); }, 250);
  }

  function seleccionarPorDefecto() {
    if (!analisis.activos.some(function (a) { return a.id === ui.activoId; })) ui.activoId = analisis.activos[0] ? analisis.activos[0].id : null;
    if (!analisis.riesgos.some(function (r) { return r.id === ui.riesgoId; })) ui.riesgoId = analisis.riesgos[0] ? analisis.riesgos[0].id : null;
  }

  function reemplazar(a) {
    analisis = normalizar(a); ui.tocados = {};
    seleccionarPorDefecto(); guardar();
  }

  return {
    iniciar: function () {
      var guardado = leerLocal(CONFIG.claveGuardado);
      analisis = normalizar(valido(guardado) ? guardado : Ejemplo.celular());
      var p = leerLocal(CONFIG.clavePrefs);
      if (p && typeof p.estudio === 'boolean') prefs.estudio = p.estudio;
      seleccionarPorDefecto();
    },
    get analisis() { return analisis; },
    ui: ui,
    prefs: prefs,
    guardarPrefs: function () { escribirLocal(CONFIG.clavePrefs, prefs); },
    guardar: guardar,

    // Rutas tipo "riesgos.2.aplicacion.fe"
    leer: function (ruta) {
      return ruta.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, analisis);
    },
    escribir: function (ruta, valor) {
      var partes = ruta.split('.'), o = analisis;
      for (var k = 0; k < partes.length - 1; k++) {
        if (o[partes[k]] == null) o[partes[k]] = {};
        o = o[partes[k]];
      }
      o[partes[partes.length - 1]] = valor;
      guardar();
    },

    activo: function (id) { return analisis.activos.filter(function (a) { return a.id === id; })[0] || null; },
    riesgo: function (id) { return analisis.riesgos.filter(function (r) { return r.id === id; })[0] || null; },
    indice: function (lista, id) { for (var k = 0; k < analisis[lista].length; k++) if (analisis[lista][k].id === id) return k; return -1; },

    agregarControl: function () { var c = nuevoControl(); analisis.controles.push(c); guardar(); return c; },
    quitarControl: function (id) {
      analisis.controles = analisis.controles.filter(function (c) { return c.id !== id; });
      analisis.riesgos.forEach(function (r) { if (r.aplicacion && r.aplicacion.controlId === id) r.aplicacion.controlId = ''; });
      guardar();
    },
    agregarActivo: function () { var a = nuevoActivo(); analisis.activos.push(a); ui.activoId = a.id; guardar(); return a; },
    quitarActivo: function (id) {
      analisis.activos = analisis.activos.filter(function (a) { return a.id !== id; });
      analisis.riesgos = analisis.riesgos.filter(function (r) { return r.activoId !== id; });
      seleccionarPorDefecto(); guardar();
    },
    agregarRiesgo: function () {
      var r = nuevoRiesgo(ui.activoId || (analisis.activos[0] && analisis.activos[0].id) || '');
      analisis.riesgos.push(r); ui.riesgoId = r.id; ui.tocados = {}; guardar(); return r;
    },
    quitarRiesgo: function (id) { analisis.riesgos = analisis.riesgos.filter(function (r) { return r.id !== id; }); seleccionarPorDefecto(); guardar(); },

    cargarEjemplo: function () { reemplazar(Ejemplo.celular()); },
    empezarVacio: function () { reemplazar(vacio()); },

    exportar: function () {
      var blob = new Blob([JSON.stringify(analisis, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = CONFIG.archivo;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    },
    importar: function (archivo, listo) {
      var lector = new FileReader();
      lector.onload = function () {
        try {
          var a = JSON.parse(lector.result);
          if (!valido(a)) throw new Error('formato');
          reemplazar(a); listo(null);
        } catch (e) { listo('El archivo no es un análisis válido.'); }
      };
      lector.onerror = function () { listo('No se pudo leer el archivo.'); };
      lector.readAsText(archivo);
    }
  };
})();
