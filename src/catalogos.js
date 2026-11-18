/* Listas cerradas: tipos de activo, familias de amenazas (inspiradas en MAGERIT),
   orígenes de cada estimación y unidades de tiempo. */
var CATALOGOS = {
  tiposActivo: [
    { id: 'celular', nombre: 'Celular' },
    { id: 'computador', nombre: 'Computador' },
    { id: 'tablet', nombre: 'Tablet' },
    { id: 'disco', nombre: 'Disco duro o respaldo' },
    { id: 'servidor', nombre: 'Servidor' },
    { id: 'basedatos', nombre: 'Base de datos' },
    { id: 'web', nombre: 'Sitio web o tienda en línea' },
    { id: 'red', nombre: 'Red o router' },
    { id: 'papel', nombre: 'Documentos en papel' },
    { id: 'otro', nombre: 'Otro' }
  ],
  familias: [
    { id: 'naturales', nombre: 'Desastres naturales', ayuda: 'Los causa la naturaleza.',
      amenazas: [
        { id: 'terremoto', nombre: 'Terremoto' },
        { id: 'inundacion', nombre: 'Inundación' },
        { id: 'incendio_natural', nombre: 'Incendio forestal o tormenta eléctrica' }
      ] },
    { id: 'industrial', nombre: 'Origen industrial', ayuda: 'Fallas del entorno técnico: luz, agua, clima.',
      amenazas: [
        { id: 'corte_luz', nombre: 'Corte de electricidad' },
        { id: 'voltaje', nombre: 'Daño por voltaje' },
        { id: 'agua', nombre: 'Fuga de agua' },
        { id: 'temperatura', nombre: 'Calor o falla de climatización' }
      ] },
    { id: 'errores', nombre: 'Errores y fallos no intencionados', ayuda: 'Pasan sin querer: nadie buscó el daño.',
      amenazas: [
        { id: 'caida', nombre: 'Se cae y se rompe' },
        { id: 'configuracion', nombre: 'Mala configuración' },
        { id: 'borrado', nombre: 'Borrado accidental' },
        { id: 'desgaste', nombre: 'Falla por desgaste' }
      ] },
    { id: 'ataques', nombre: 'Ataques deliberados', ayuda: 'Alguien quiere causar el daño.',
      amenazas: [
        { id: 'robo', nombre: 'Robo' },
        { id: 'fuerza_bruta', nombre: 'Fuerza bruta a contraseñas' },
        { id: 'malware', nombre: 'Programa malicioso (malware)' },
        { id: 'suplantacion', nombre: 'Suplantación de identidad' },
        { id: 'dos', nombre: 'Denegación de servicio' }
      ] }
  ],
  origenes: [
    { id: 'mercado', nombre: 'Dato del fabricante o precio de mercado' },
    { id: 'propio', nombre: 'Historial propio' },
    { id: 'sector', nombre: 'Estadística o norma del sector' },
    { id: 'experto', nombre: 'Opinión de un experto' },
    { id: 'propia', nombre: 'Estimación propia' }
  ],
  unidades: [
    { id: 'min', nombre: 'minutos' },
    { id: 'h', nombre: 'horas' },
    { id: 'd', nombre: 'días' },
    { id: 'sem', nombre: 'semanas' }
  ]
};
CATALOGOS.buscar = function (lista, id) {
  for (var k = 0; k < lista.length; k++) if (lista[k].id === id) return lista[k];
  return null;
};
CATALOGOS.amenaza = function (familiaId, amenazaId) {
  var f = CATALOGOS.buscar(CATALOGOS.familias, familiaId);
  return f ? CATALOGOS.buscar(f.amenazas, amenazaId) : null;
};
