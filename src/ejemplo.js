/* Ejemplo precargado: el celular (docs/01-problema.md §9). Datos ficticios.
   Las duraciones de caída son ficticias y elegidas para dar las notas D de §9
   con un MTD de 1 semana (1/144 ≈ 70 min, 1/12 = 14 h, 1/3 = 56 h). */
(function (raiz, fabrica) {
  var E = fabrica();
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
  else raiz.Ejemplo = E;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function celular() {
    return {
      version: 1,
      umbral: '2.000.000', umbralAceptacion: 'Bajo',
      controles: [
        { id: 'ctl-carcasa', nombre: 'Carcasa resistente a caídas', tipoCosto: 'unico', costo: '30.000', vida: '3', origen: 'mercado' },
        { id: 'ctl-borrado', nombre: 'Borrado y bloqueo remoto', tipoCosto: 'anual', costo: '0', vida: '', origen: 'mercado' },
        { id: 'ctl-seguro', nombre: 'Seguro contra robo', tipoCosto: 'anual', costo: '44.000', vida: '', origen: 'mercado', transfiere: true }
      ],
      activos: [
        { id: 'act-celular', tipo: 'celular', nombre: 'Mi celular',
          partes: [{ nombre: 'Aparato', valor: '100.000' }, { nombre: 'Datos', valor: '50.000' }],
          mtd: { valor: '1', unidad: 'sem' } }
      ],
      riesgos: [
        { id: 'r-rotura', activoId: 'act-celular', familia: 'errores', amenaza: 'caida', etiqueta: 'Se cae y se rompe',
          veces: '1', anios: '1', fe: '30', c: 1, i: 1, d: { modo: 'duracion', valor: '1', unidad: 'd', nota: 3 },
          origenes: { aro: 'propio', fe: 'propia', impacto: 'propia' },
          aplicacion: { controlId: 'ctl-carcasa', cambiaAro: false, cambiaFe: true, feModo: 'pct', fe: '10',
            cambiaPiezas: true, piezas: { c: '', i: '', d: { modo: 'duracion', valor: '30', unidad: 'min', nota: '' } },
            origen: 'propia', confirmado: false },
          tratamiento: { opcion: 'mitigar', far: {} } },
        { id: 'r-robo', activoId: 'act-celular', familia: 'ataques', amenaza: 'robo', etiqueta: 'Robo',
          veces: '1', anios: '3', fe: '100', c: 5, i: 5, d: { modo: 'duracion', valor: '3', unidad: 'd', nota: 4 },
          origenes: { aro: 'propio', fe: 'propia', impacto: 'propia' },
          aplicacion: { controlId: 'ctl-borrado', cambiaAro: false, cambiaFe: false, feModo: 'pct', fe: '',
            cambiaPiezas: true, piezas: { c: '3', i: '3', d: { modo: 'nota', valor: '', unidad: 'h', nota: '' } },
            origen: 'mercado', confirmado: false },
          tratamiento: { opcion: '', far: {} } },
        { id: 'r-seguro', activoId: 'act-celular', familia: 'ataques', amenaza: 'robo', etiqueta: 'Robo, con borrado remoto ya puesto',
          veces: '1', anios: '3', fe: '100', c: 3, i: 3, d: { modo: 'duracion', valor: '3', unidad: 'd', nota: 4 },
          origenes: { aro: 'propio', fe: 'propia', impacto: 'propia' },
          aplicacion: { controlId: 'ctl-seguro', cambiaAro: false, cambiaFe: true, feModo: 'cubierto', fe: '', cubierto: '80.000',
            cambiaPiezas: true, piezas: { c: '', i: '', d: { modo: 'duracion', valor: '12', unidad: 'h', nota: '' } },
            origen: 'mercado', confirmado: false },
          // T19: el seguro no compensa; se acepta el riesgo Alto como excepción, con FAR-lite (datos ficticios)
          tratamiento: { opcion: 'aceptar', far: { motivo: 'El seguro cuesta más de lo que ahorra y el borrado remoto ya protege los datos.',
            complementarios: 'Bloqueo con huella y ubicación del equipo activada.', nivelEstimado: 'Medio',
            plan: 'Comparar otros seguros y revisar si conviene un equipo más barato.', fecha: '2027-03-31', aceptadoEl: '2026-11-17' } } }
      ]
    };
  }
  return { celular: celular };
});
