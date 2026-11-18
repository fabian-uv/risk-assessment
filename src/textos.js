/* Textos de la interfaz y del modo estudio. Se editan aquí sin tocar la lógica ni el HTML. */
var TEXTOS = {
  siglas: {
    VA: { en: 'Asset Value', es: 'valor del activo' },
    MTD: { en: 'Maximum Tolerable Downtime', es: 'cuánto tiempo puedes estar sin él' },
    ARO: { en: 'Annualized Rate of Occurrence', es: 'veces que pasa al año' },
    FE: { en: 'Exposure Factor', es: 'parte del valor que se pierde cada vez' },
    SLE: { en: 'Single Loss Expectancy', es: 'pérdida en un solo evento' },
    ALE: { en: 'Annualized Loss Expectancy', es: 'pérdida esperada al año' },
    P: { en: 'Probability', es: 'probabilidad, nota de 1 a 5' },
    I: { en: 'Impact', es: 'impacto, nota de 1 a 5' },
    CIA: { en: 'Confidentiality, Integrity, Availability', es: 'confidencialidad, integridad y disponibilidad' }
  },

  // Operaciones que muestra el roadmap
  operaciones: { suma: 'Suma', resta: 'Resta', multiplica: 'Multiplica', divide: 'Divide', maximo: 'Máximo', tabla: 'Tabla', compara: 'Compara', ordena: 'Ordena' },

  pantallas: [
    { id: 'inicio', corto: 'Inicio', titulo: 'Empecemos', ops: [],
      queHacemos: 'Fijamos lo que vale para todo el análisis: el umbral de dinero catastrófico y hasta qué nivel aceptas un riesgo sin trámite.' },
    { id: 'activo', corto: 'Activo', titulo: 'El activo', ops: ['suma'],
      queHacemos: 'Sumamos lo que vale el activo y fijamos cuánto tiempo puedes estar sin él antes de que sea grave.' },
    { id: 'amenaza', corto: 'Amenaza', titulo: 'La amenaza y su control', ops: ['divide', 'multiplica', 'tabla', 'maximo'],
      queHacemos: 'Calculamos el riesgo sin control (inherente), elegimos o creamos el control con su costo al año y anotamos qué cambia.' },
    { id: 'resultado', corto: 'Resultado', titulo: 'El resultado', ops: ['resta', 'compara'],
      queHacemos: 'Comparamos antes y después del control, en pesos y en notas, y decides qué haces con el riesgo.' },
    { id: 'resumen', corto: 'Resumen', titulo: 'El resumen', ops: ['ordena'],
      queHacemos: 'Ordenamos los riesgos por lo que queda después del control, los ubicamos en la matriz y revisamos la lista de controles.' }
  ],

  piezas: {
    c: { nombre: 'Confidencialidad', pregunta: '¿Quién podría ver lo que no debe?' },
    i: { nombre: 'Integridad', pregunta: '¿Alguien podría cambiar datos o actuar en tu nombre?' },
    d: { nombre: 'Disponibilidad', pregunta: '¿Cuánto tiempo quedarías sin poder usarlo?' }
  },

  // Errores comunes (docs/01-problema.md §8), con número para citarlos donde corresponde
  errores: {
    1: 'Dividir por las veces en vez de multiplicar por el ARO. Si pasa 5 veces al año, el ALE sube.',
    2: 'Confundir FE con ARO. El FE es cuánto duele; el ARO, cada cuánto pasa.',
    3: 'Confundir el costo del control con la pérdida anual (ALE). Son cosas distintas.',
    4: 'Sumar el costo del control a la pérdida. Primero se mide cuánto riesgo queda; el costo se resta al final, en el valor neto.',
    5: 'Comparar periodos distintos. Un costo de una sola vez se divide por los años de vida; el ALE, en cambio, se multiplica.',
    6: 'Equivocarse con el signo. Un valor neto negativo significa que el control cuesta más de lo que ahorra.',
    7: 'Redondear antes de comparar o calcular. 1 ÷ 3 es 0,333…, no 0,3: en el borde cambia la nota.',
    8: 'Creer que el ALE es una predicción. Es un promedio a lo largo de los años.',
    9: 'Puntuar el evento y no la consecuencia. «Robo de contraseñas» no tiene impacto por sí solo: depende de lo que esa contraseña abre.',
    10: 'Creer que todo control conviene. Hay que compararlo con su costo.',
    11: 'Fiarse solo del color. Un riesgo puede mejorar sin cambiar de nivel.',
    12: 'Usar el ARO en vez de la nota P en el cuali. El ARO se multiplica por pesos; en notas, primero se traduce con la tabla.',
    13: 'Pensar que todo control baja el ARO y el FE. Casi siempre baja solo uno, o solo piezas del impacto.',
    14: 'Leer el FE al revés. El FE es lo que sigue perdiéndose, no lo que cubre el control.',
    15: 'Confundir un porcentaje del aparato con uno del valor total.',
    16: 'Suponer un control perfecto. Un FE de 0 % casi nunca es realista: queda un riesgo residual.',
    17: 'Mezclar cuanti y cuali sin avisar. Siempre hay que saber en qué lado estás: pesos o notas.'
  },

  // Explicaciones del modo estudio por lugar
  estudio: {
    umbral: 'El umbral es por análisis: a una persona y a una empresa no les duele igual perder $500.000. Con él, una pérdida en pesos se traduce a una nota de Dinero.',
    costoControl: 'Costo anual = precio ÷ años de vida. Un pago único se reparte entre los años que dura el control, para compararlo con una pérdida que es anual.',
    va: 'Operación: suma. El VA es el activo completo, no solo el aparato: los datos también valen.',
    vaError: 'Contar solo el aparato y olvidar lo que valen los datos.',
    mtd: 'El MTD es cuánto tiempo puedes estar sin poder usar el activo antes de que el daño sea grave, sea cual sea la causa: se rompió, te lo robaron o está en reparación. En informática se dice que el equipo está «caído». Con ese tiempo se arma la escala de disponibilidad de este activo: cada nota es una fracción del MTD.',
    aro: 'Operación: divide (veces ÷ años) y después tabla, para pasar del ARO a la nota P.',
    fe: 'Operación: multiplica. SLE = VA × FE es lo que pierdes en un solo evento.',
    impacto: 'Operación: tabla y máximo. Cada pieza se puntúa por separado y el impacto es la más alta.',
    control: 'Un control puede cambiar el ARO (pasa menos), el FE (duele menos) o piezas del impacto. Piensa cuál antes de marcar.',
    versus: [
      { titulo: 'Baja el ARO', pregunta: '¿Hace que pase menos veces?', sigla: 'ARO', ejemplo: 'Una alarma contra robo, el doble factor de autenticación.' },
      { titulo: 'Baja el FE', pregunta: '¿Pasa igual, pero duele menos?', sigla: 'FE', ejemplo: 'Una carcasa, un respaldo, un seguro.' },
      { titulo: 'Baja piezas', pregunta: '¿Protege algo que no se mide en plata?', sigla: 'CIA', ejemplo: 'El borrado remoto: tus datos quedan a salvo aunque el aparato no vuelva.' }
    ],
    resultadoCuanti: 'Operación: resta. Reducción = ALE sin control − ALE con control; valor neto = reducción − costo anual.',
    resultadoCuali: 'Operación: compara. Mejora = P × I sin control − P × I con control, en puntos.',
    matriz: 'Cada casilla muestra P × I y su nivel. El nivel es grueso: un 10 y un 8 son ambos Medio aunque el control haya ayudado. Por eso se miran también el número y los puntos.'
  },

  veredictoCuali: {
    mejora: function (n, de, a) { var pts = n + (n === 1 ? ' punto' : ' puntos'); return de === a ? 'Mejora ' + pts + ', pero sigue en ' + a : 'Mejora ' + pts + ': de ' + de + ' a ' + a; },
    igual: function () { return 'No cambia'; },
    empeora: function (n) { return 'Empeora ' + (-n) + ' puntos: revisa los datos del control'; }
  },

  noCoinciden: 'En pesos y en notas el control no apunta al mismo lado. Los pesos hablan del promedio de plata a lo largo de los años; las notas, de cuánto duele cuando pasa. La decisión es tuya.',
  empateConMejora: 'En pesos da lo mismo, pero en notas el riesgo baja: el control protege algo que no se mide en plata.',

  // Tratamiento del riesgo (docs/03-tratamiento.md).
  tratamiento: {
    opciones: {
      mitigar: { nombre: 'Mitigar', que: 'Bajar la probabilidad o el impacto con un control.', cuando: 'Cuando un control ahorra más de lo que cuesta.', ejemplo: 'Una carcasa para el celular.' },
      transferir: { nombre: 'Transferir', que: 'Que otro pague la pérdida: un seguro, un contrato, un proveedor.', cuando: 'Cuando el golpe en plata es grande y alguien lo cubre por un precio razonable. El riesgo no desaparece.', ejemplo: 'Un seguro contra robo.' },
      aceptar: { nombre: 'Aceptar', que: 'Asumir el riesgo tal como está, sin control, a conciencia.', cuando: 'Cuando el riesgo es bajo, o cuando ninguna medida compensa su costo.', ejemplo: 'No asegurar un audífono barato.' },
      evitar: { nombre: 'Evitar', que: 'Dejar la actividad o el activo que trae el riesgo.', cuando: 'Cuando el riesgo es alto y nada lo baja a un costo razonable. Se pierde también lo que la actividad te da.', ejemplo: 'No llevar el notebook del trabajo en la micro.' }
    },
    motivos: {
      dentro_umbral: 'El riesgo sin control ya está dentro de lo que aceptas sin trámite: no hace falta hacer más.',
      neto_positivo: 'El control ahorra más de lo que cuesta al año.',
      nada_compensa: 'Ninguna medida de este análisis compensa su costo y el riesgo no es bajo.'
    },
    criterio: 'Aquí se elige por costo-beneficio e impacto. Otras fuentes lo simplifican solo por probabilidad (baja: aceptar; media: transferir; alta: evitar), pero así queda fuera lo que cuesta cada medida.',
    umbral: 'El umbral de aceptación es el nivel de riesgo que asumes sin más trámite. Aceptar algo por encima es una excepción: se deja por escrito por qué, con un plan, una fecha límite y una revisión cada 3 meses.',
    medible: 'El beneficio de un control tiene que poder medirse: por eso se pide el valor con control y de dónde sale.'
  },

  avisos: {
    fe0: 'Pusiste el FE con control en 0 %. Casi ningún control es perfecto: ¿seguro que no se pierde nada?',
    aro0: 'Pusiste que con el control no pasa nunca. Casi ningún control es perfecto: ¿seguro?',
    pieza_c: 'La confidencialidad baja de 5 a 1. Casi ningún control es perfecto: ¿seguro?',
    pieza_i: 'La integridad baja de 5 a 1. Casi ningún control es perfecto: ¿seguro?',
    pieza_d: 'La disponibilidad baja de 5 a 1. Casi ningún control es perfecto: ¿seguro?'
  }
};
