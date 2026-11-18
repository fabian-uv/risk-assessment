# Definición del problema

> Proyecto: Risk Assessment, herramienta para aprender análisis de riesgos.
> Este documento define el problema. Las decisiones que dejaba abiertas se tomaron en `02-algoritmo.md` §6.

**Regla de siglas:** cada sigla aparece siempre con su nombre en inglés y su traducción en algún lugar visible (ver glosario en la sección 11).

---

## 1. Para quién es y qué problema resuelve

**Público principal: estudiantes** que están aprendiendo a hacer un análisis de riesgos, tanto **cuantitativo** (en pesos) como **cualitativo** (con notas de 1 a 5). El programa los guía paso a paso: el usuario entrega datos, el programa calcula y **explica cada cálculo** mientras lo hace.

**Uso secundario: diagnósticos pequeños y de práctica** en organizaciones chicas, para **ordenar y priorizar decisiones** (qué riesgo atender primero y si un control conviene).

**El problema:** calcular riesgos suele hacerse en planillas o en herramientas que asumen que ya conoces el método. Aquí lo distintivo es que el programa **muestra el trabajo**: fórmulas con los números puestos, el significado de cada sigla, cómo interpretar el resultado y los errores comunes.

**Herramientas existentes.** Ya hay herramientas profesionales (por ejemplo PILAR, la herramienta del método MAGERIT, y plataformas de GRC: Governance, Risk and Compliance). Este proyecto no compite con ellas: está pensado para aprender y para diagnósticos pequeños.

**Modo estudio.** Un interruptor que se puede cambiar en cualquier momento de la sesión. Los cálculos son los mismos; cambia cuánta explicación se ve. Incluye:

- **Ejemplos guiados** ya resueltos (celular, disco duro y otros), que se recorren con Anterior / Siguiente.
- **Roadmap** del recorrido, con el paso actual marcado y la **operación** que toca en cada paso (sumar, restar, multiplicar, dividir, tomar el máximo, consultar una tabla).
- **Tabla de referencia a la vista** cada vez que se pide traducir o clasificar un valor, rotulando en qué lado se está (cuanti o cuali).
- **Errores comunes** como guía, en el paso donde un estudiante suele tropezar.

---

## 2. Qué entra (datos)

### Al empezar un análisis (una sola vez por análisis)

| Dato | Detalle |
|---|---|
| **Umbral de Dinero** | Cuánto dinero sería catastrófico para quien sufre la pérdida (una persona o una organización). Cambia entre un análisis personal y uno de empresa, por eso es **por análisis**, no por programa |
| **Modo estudio** | Interruptor, se puede cambiar cuando se quiera |

### Por cada activo

| Dato | Detalle |
|---|---|
| **Tipo de activo** | Se elige de una lista (computador, celular, servidor, base de datos, etc.) y se le pone un nombre como etiqueta |
| **VA** (Asset Value) | Cuánto vale el activo, en pesos (por ejemplo, aparato + datos) |
| **MTD** (Maximum Tolerable Downtime) | Cuánto tiempo puede estar caído el activo antes de ser catastrófico. Con él se arma la escala de disponibilidad de ese activo |

### Por cada amenaza de un activo

Cada riesgo es una pareja **activo + amenaza**. La amenaza se elige de una lista organizada en 4 familias (sección 7).

| Dato | Detalle |
|---|---|
| **Veces y años** | Cuántas veces pasa la amenaza y en cuántos años (por ejemplo, 1 vez cada 3 años). El programa calcula el ARO (Annualized Rate of Occurrence) |
| **FE sin control** (Exposure Factor) | Porcentaje del valor que se pierde cada vez que pasa |
| **P** (Probabilidad) | Sale del ARO con la tabla de la sección 4.2. Se muestra como palabra (Improbable, Posible, Ocasional, Probable, Frecuente) y se guarda el número |
| **Piezas del impacto** | Una nota de 1 a 5 para confidencialidad, integridad y disponibilidad, más la pieza **Dinero** (ver 4.3) |
| **Controles que se le aplican** | Se eligen de la **lista de controles** del análisis o se crean ahí mismo. Cada control se anota una vez, con su **nombre** y su **costo anual** (si el costo es de una sola vez, se divide por los años de vida); si otra amenaza usa el mismo control, se elige de la lista y su costo no se duplica. Para cada uno se indica qué cambia y con qué valor nuevo (ver 4.5) |
| **Origen de cada estimación** | Dato del fabricante o precio de mercado, historial propio, estadística o norma del sector, opinión de un experto, o estimación propia |

---

## 3. Qué sale (resultados)

### Cuantitativo, por riesgo

1. **VA** (Asset Value)
2. **SLE** (Single Loss Expectancy): lo que se pierde una vez
3. **ARO** (Annualized Rate of Occurrence): veces al año
4. **ALE sin control** (Annualized Loss Expectancy): pérdida anual esperada sin protegerse
5. **ALE con control**
6. **Reducción** del ALE: ALE sin control − ALE con control
7. **Costo anual del control**
8. **Valor neto**: reducción − costo anual del control
9. **Veredicto** en una frase: positivo, conviene; cero, da lo mismo (empate); negativo, no conviene

### Cualitativo, por riesgo

1. P e I, con su nivel de riesgo, **sin control y con control**
2. **Comparación**: cuántos puntos mejoró y si cambió de nivel (por ejemplo, "mejoró 10 puntos, de Alto a Medio")
3. Una **frase guía** en palabras simples

### Cuando cuanti y cuali no coinciden

Puede pasar que el cuanti diga "no conviene" y el cuali diga "mejora" (caso del seguro contra robo, sección 9). El programa **muestra ambos veredictos y no decide por el usuario**: el cuanti habla del promedio de plata a lo largo de los años; el cuali habla de cuánto duele cuando pasa.

### Del conjunto de riesgos

- **Matriz de calor** 5×5 con cada riesgo marcado, con el antes y el después del control
- **Lista ordenada** de más a menos importante. Se ordena por riesgo residual P × I y, si empatan, por ALE.

---

## 4. Reglas

### 4.1 Fórmulas cuantitativas

| Fórmula | Significado |
|---|---|
| `SLE = VA × FE` | Pérdida por ocurrencia (Single Loss Expectancy) |
| `ARO = veces ÷ años` | Veces al año (1 vez cada 10 años = 0,1; 5 veces en 1 año = 5) |
| `ALE = SLE × ARO` | Pérdida anual esperada (es un promedio, no una predicción) |
| `Reducción = ALE sin control − ALE con control` | Beneficio del control |
| `Costo anual del control = precio ÷ años de vida` | Cuando el control se paga una sola vez |
| `Valor neto = Reducción − costo anual del control` | Positivo: conviene. Cero: empate. Negativo: no conviene |
| `FE con control = 100% − parte del valor que el control cubre` | Útil con seguros; el FE mide lo que **sigue perdiéndose**, no lo que cubre el control |

**Regla de redondeo:** no se redondea antes de comparar ni de calcular. Se trabaja con la fracción exacta (por ejemplo, un FE de 70.000 ÷ 150.000 = 46,67%, no 50%).

### 4.2 Probabilidad (P) según el ARO

**Regla del borde:** si un valor cae justo entre dos notas, **va a la nota más alta** (criterio conservador, para no subestimar el riesgo). La comparación usa las **veces y años** ingresados, **sin redondear**.

| Nota | Palabra | Significa | ARO |
|---|---|---|---|
| 1 | Improbable | Menos de 1 vez cada 10 años | menos de 0,1 |
| 2 | Posible | Cada 5 a 10 años | desde 0,1 hasta menos de 0,2 |
| 3 | Ocasional | Cada 3 a 5 años | desde 0,2 hasta menos de 1/3 |
| 4 | Probable | Cada 1 a 3 años | desde 1/3 hasta menos de 1 |
| 5 | Frecuente | 1 vez al año o más | 1 o más |

### 4.3 Impacto (I): cuatro piezas

El impacto se mide por la **consecuencia** (qué se pierde), no por el evento que la causa. La pregunta es: *"si esto pasa, ¿qué pierdo?"*. Una misma amenaza puede tener distinto impacto según el activo, y un mismo activo distinto impacto según la amenaza. Los valores son por defecto y el usuario los puede cambiar.

**Confidencialidad** (Confidentiality): que solo vea los datos quien debe verlos.

| Nota | Palabra | Consecuencia |
|---|---|---|
| 1 | Insignificante | Se expone información pública o sin valor |
| 2 | Menor | Datos internos poco sensibles, a pocas personas, sin uso posible para dañar |
| 3 | Moderado | Datos personales básicos (nombres, correos) de varias personas. Hay molestia y algún reclamo |
| 4 | Mayor | Datos personales de muchos clientes, o secretos del negocio, llegan a terceros desconocidos |
| 5 | Catastrófico | Datos sensibles (financieros, de salud, contraseñas, identidad) expuestos masivamente. Daño legal y de credibilidad grave |

**Integridad** (Integrity): que nadie cambie los datos ni actúe en tu nombre sin permiso. Para puntuarla se mira cuánto se altera, si se detecta y a quién afecta. Da lo mismo si el cambio fue malicioso o un error: la consecuencia es la misma. La suplantación (alguien que actúa con tu identidad) se puntúa aquí.

| Nota | Palabra | Consecuencia |
|---|---|---|
| 1 | Insignificante | Cambio mínimo sin efecto. Se detecta y se corrige el mismo día |
| 2 | Menor | Pocos datos alterados. Se detecta en pocos días y se corrige fácil |
| 3 | Moderado | Varios datos alterados. Causa errores o trabajo repetido y se corrige con esfuerzo |
| 4 | Mayor | Datos importantes alterados. Tarda semanas en detectarse, afecta decisiones o a varios clientes y corregirlo es caro |
| 5 | Catastrófico | Datos críticos alterados (dinero, pagos, registros clave). No se detecta por mucho tiempo o no se sabe qué cambió, y ya no se puede confiar en los datos |

**Disponibilidad** (Availability): que el servicio funcione cuando se necesita. Se mide por **duración**, pero **cada activo tiene su propia escala**, armada a partir de su MTD (Maximum Tolerable Downtime, tiempo máximo tolerable de caída). Los tramos son fracciones del MTD y el borde va a la nota más alta. Las fracciones son 1/144, 1/12, 1/3 y 1 del MTD.

| Nota | Palabra | Duración de la caída |
|---|---|---|
| 1 | Insignificante | Menos de 1/144 del MTD |
| 2 | Menor | Desde 1/144 hasta menos de 1/12 del MTD |
| 3 | Moderado | Desde 1/12 hasta menos de 1/3 del MTD |
| 4 | Mayor | Desde 1/3 hasta menos de 1 MTD |
| 5 | Catastrófico | 1 MTD o más |

*Ejemplo:* una tienda con MTD de 12 horas: 5 minutos, 1 hora, 4 horas y 12 horas son los límites entre notas. La comparación se hace con multiplicación de enteros, para evitar errores de decimales.

**Dinero.** Como el dinero no pesa igual para todos, el programa usa el **umbral** definido al empezar el análisis. Ese monto marca la nota 5. Funciona como una **regla de traducción**: convierte la pérdida en pesos en una nota de 1 a 5 para el cuali (el cuanti siempre usa los pesos reales). No es un filtro: un activo pequeño igual se analiza. Las notas 1 a 4 se reparten hacia abajo desde el umbral (ver `02-algoritmo.md`).

**Regla final:** `I = la más alta de (confidencialidad, integridad, disponibilidad, Dinero)`.

*Por qué se puntúa cada pieza por separado:* el impacto final lo decide la más alta, pero cada control suele bajar solo algunas piezas. Si todas se pusieran en 5, no se vería qué control ayuda a qué.

### 4.4 Nivel de riesgo

`Riesgo = P × I`, con tres niveles:

| P × I | Nivel |
|---|---|
| 1 a 4 | 🟩 Bajo |
| 5 a 12 | 🟨 Medio |
| 15 a 25 | 🟥 Alto |

Matriz de calor (probabilidad hacia arriba, impacto hacia la derecha):

| | I=1 | I=2 | I=3 | I=4 | I=5 |
|---|---|---|---|---|---|
| **P=5** | 🟨 5 | 🟨 10 | 🟥 15 | 🟥 20 | 🟥 25 |
| **P=4** | 🟩 4 | 🟨 8 | 🟨 12 | 🟥 16 | 🟥 20 |
| **P=3** | 🟩 3 | 🟨 6 | 🟨 9 | 🟨 12 | 🟥 15 |
| **P=2** | 🟩 2 | 🟩 4 | 🟨 6 | 🟨 8 | 🟨 10 |
| **P=1** | 🟩 1 | 🟩 2 | 🟩 3 | 🟩 4 | 🟨 5 |

**Riesgo inherente** es el que tiene el activo sin controles; **riesgo residual** es el que queda con controles. Se calculan los dos, en cuanti y en cuali.

**Límite conocido del cuali:** el nivel es grueso. Un riesgo de 10 y otro de 8 pueden quedar ambos en "medio" aunque el control sí mejoró. Por eso el programa muestra el **número y el color**, y la comparación en puntos.

### 4.5 Qué puede cambiar un control

Un control puede cambiar una o varias de estas cosas:

| Qué cambia | Cómo se nota | Ejemplo |
|---|---|---|
| **ARO** (pasa menos veces) | Baja el ARO y, con él, la nota P | Alarma, doble factor de autenticación |
| **FE** (pasa igual, duele menos) | Baja el FE, el SLE y el ALE | Carcasa, respaldo, seguro |
| **Piezas del impacto** (confidencialidad, integridad, disponibilidad) | Bajan las notas del cuali; el cuanti casi no cambia | Borrado y bloqueo remoto del celular |

Casi siempre un control baja solo una de las dos primeras. Un control **no se supone perfecto**: un FE de 0% o un impacto mínimo piden una confirmación ("casi ningún control es perfecto"), porque el riesgo residual rara vez es cero.

---

## 5. Qué NO hace

- **No reemplaza una auditoría profesional** hecha por un experto.
- **No es completamente objetivo:** los datos de entrada son estimaciones que ingresa el usuario según parámetros que no siempre son objetivos. Por eso el programa marca de dónde sale cada estimación.
- **No encuentra vulnerabilidades:** sirve para ordenar y priorizar decisiones, no para revisar si un sistema tiene fallas.
- **No es multiusuario** ni guarda historial de quién cambió qué.
- **Los datos se ingresan a mano:** no se conecta a inventarios ni a escáneres.
- **Su catálogo es pequeño.**
- **No está certificado.** Está inspirado en MAGERIT (ver sección 7), no es una implementación de MAGERIT.

---

## 6. Decisiones de diseño

| # | Decisión | Razón |
|---|---|---|
| 1 | Activo y amenaza se eligen de listas | No hay que inventar nombres |
| 2 | Amenazas en 4 familias (inspiradas en MAGERIT) | Da orden, y es un marco conocido en España e Hispanoamérica |
| 3 | P según el ARO, con el borde a la nota más alta | Ser precavido y no subestimar un riesgo |
| 4 | Impacto en cuatro piezas (C, I, D y Dinero), y vale la más alta | El daño no es solo plata, y cada control baja piezas distintas |
| 5 | Palabras con su significado en pantalla, números por debajo | No hay que memorizar números, y las notas dejan de depender de la opinión |
| 6 | Cuanti y cuali, antes y después del control | Se complementan: el cuali ordena rápido, el cuanti mira de cerca los riesgos grandes |
| 7 | Modo estudio con interruptor | Sirve a quien aprende y a quien ya sabe |
| 8 | Cada estimación marca su origen | Se sabe qué tan firme es cada número |
| 9 | Umbral y lista de controles por análisis | Una persona y una empresa no tienen el mismo umbral ni los mismos controles |
| 10 | Cada control se anota una vez y se enlaza a las amenazas | Así su costo no se cuenta dos veces |
| 11 | Escala de disponibilidad armada con el MTD de cada activo | Una tabla fija de horas sirve para una tienda, no para todos los activos |
| 12 | Cuando cuanti y cuali no coinciden, se muestran ambos | La decisión es del usuario; el programa no decide por él |

---

## 7. Marcos de referencia

### MAGERIT (referencia principal)

MAGERIT (Metodología de Análisis y Gestión de Riesgos de los Sistemas de Información) es la metodología publicada por el gobierno de España. Este proyecto sigue su esquema general, sin implementar el método completo.

| MAGERIT | Este proyecto |
|---|---|
| Activos, con su valor | Activo con VA |
| Catálogo de amenazas | Lista de amenazas |
| Valoración por dimensión (disponibilidad, integridad, confidencialidad) | Piezas del impacto |
| Degradación (fracción del valor que se pierde) | Equivalente al FE |
| Frecuencia | ARO |
| Impacto y riesgo | SLE, ALE y P × I |
| Salvaguardas | Controles |

**Familias de amenazas:**

| Familia | Ejemplo |
|---|---|
| Desastres naturales | Terremoto |
| Origen industrial | Daño por voltaje en discos duros |
| Errores y fallos no intencionados | Mala configuración, celular que se cae o se pierde |
| Ataques deliberados | Denegación de servicio, robo, fuerza bruta |

La diferencia entre errores y ataques es la **intención**. Las amenazas intencionales y las accidentales pueden afectar el mismo activo con probabilidades y controles distintos, por eso son amenazas separadas (por ejemplo, en un celular: caída, pérdida y robo).

### MITRE ATT&CK (referencia opcional, a futuro)

ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge: tácticas, técnicas y conocimiento común del adversario) describe **cómo atacan** los atacantes, paso a paso. No calcula riesgos. A futuro podría añadirse un campo opcional "técnica relacionada" en las amenazas deliberadas.

---

## 8. Errores comunes (material para el modo estudio)

1. **Dividir por las veces en vez de multiplicar por el ARO.** Si pasa 5 veces al año, el ARO es 5 y el ALE sube, no baja.
2. **Confundir FE con ARO.** FE es cuánto duele; ARO es cada cuánto pasa.
3. **Confundir el costo del control con la pérdida anual (ALE).** Son cosas distintas.
4. **Sumar el costo del control a la pérdida.** Primero se mide cuánto riesgo queda; el costo se resta al final, en el valor neto.
5. **Comparar periodos distintos.** Un costo de una sola vez hay que llevarlo a un valor anual (se divide por los años de vida; el ALE, en cambio, se multiplica).
6. **Equivocarse con el signo del valor neto.** Valor neto negativo significa que el control cuesta más de lo que ahorra.
7. **Redondear antes de comparar o de calcular.** 1 ÷ 3 es 0,333..., no 0,3, y en el borde cambia la nota (da P = 4, no 3). Un FE de 46,67% no es 50%.
8. **Creer que el ALE es una predicción.** Es un promedio.
9. **Puntuar el evento y no la consecuencia.** "Robo de contraseñas" no tiene impacto por sí solo: depende de lo que esa contraseña abre.
10. **Creer que todo control conviene.** Hay que compararlo con su costo.
11. **Fiarse solo del color.** Un riesgo puede mejorar sin cambiar de nivel.
12. **Usar el ARO (0,333) en vez de la nota P (4) en el cuali.** En el cuanti el ARO se multiplica por pesos; en el cuali primero se traduce a nota con la tabla y recién después se multiplican notas.
13. **Pensar que todo control baja las dos cosas (ARO y FE).** Casi siempre baja solo una, o solo piezas del impacto.
14. **Leer el FE al revés.** El FE es lo que **sigue perdiéndose**, no lo que cubre el control (FE = 100% − lo cubierto).
15. **Confundir un porcentaje del aparato con un porcentaje del valor total.** Si el seguro paga el 80% del aparato ($100.000), son $80.000, no el 80% de $150.000.
16. **Suponer un control perfecto.** Un FE de 0% o un impacto mínimo rara vez es realista: queda un riesgo residual.
17. **Mezclar cuanti y cuali sin avisar.** Siempre hay que saber en qué lado se está: pesos o notas.

---

## 9. Casos de prueba (se resuelven a mano antes de programar)

### Casos básicos

| Caso | Datos | Resultado esperado |
|---|---|---|
| Disco duro | SLE $150.000, 2 veces cada 5 años | ARO = 0,4; ALE = $60.000 |
| Riesgo A | SLE $20.000, 5 veces al año | ARO = 5; ALE = $100.000 |
| Riesgo B | SLE $1.000.000, 1 vez cada 10 años | ARO = 0,1; ALE = $100.000 |
| Computador (cuanti) | VA $2.000.000, FE 100% → 50% con respaldo, ARO 0,1, respaldo $40.000 al año | ALE $200.000 → $100.000; valor neto +$60.000 al año |
| Computador (cuali) | P = 2; I = 5 sin respaldo, I = 4 con respaldo | 10 (medio) → 8 (medio): mejora 2 puntos, mismo nivel |
| Borde de P | 1 vez cada 3 años | P = 4 |
| Borde de P | 1 vez cada 10 años | P = 2 |
| Borde de P | 1 vez al año | P = 5 |

### Celular: se cae y se rompe, con carcasa (errores no intencionados)

VA $150.000 (aparato $100.000 + datos $50.000). Umbral de Dinero $2.000.000. Carcasa $30.000, dura 3 años.

| Paso | Sin control | Con carcasa |
|---|---|---|
| ARO | 1 vez al año = 1 | 1 (la carcasa no evita la caída) |
| FE | 30% | 10% (estimación propia) |
| SLE | $45.000 | $15.000 |
| ALE | $45.000 | $15.000 |
| Reducción | | $30.000 |
| Costo anual del control | | $30.000 ÷ 3 = $10.000 |
| **Valor neto** | | **+$20.000: conviene** |
| P | 5 | 5 |
| Piezas (C, I, D, Dinero) | 1, 1, 3, bajo | 1, 1, 1, bajo |
| I | 3 | 1 |
| **P × I** | **15, Alto** | **5, Medio** (mejora 10 puntos) |

Si el costo se tomara como $30.000 cada año, el valor neto sería $0 (empate): por eso importa repartirlo entre los años de vida.

### Celular: robo (ataque deliberado), con borrado y bloqueo remoto

| Paso | Sin control | Con borrado remoto |
|---|---|---|
| ARO | 1 vez cada 3 años = 1/3 | 1/3 (no evita el robo) |
| FE | 100% | 100% |
| SLE | $150.000 | $150.000 |
| ALE | $50.000 | $50.000 |
| Reducción / valor neto | | $0 (costo $0: empate en pesos) |
| P | 4 | 4 |
| Piezas C, I, D | 5, 5, 4 | 3, 3, 4 (el borrado no devuelve el celular) |
| I | 5 | 4 |
| **P × I** | **20, Alto** | **16, Alto** (mejora 4 puntos, mismo nivel) |

### Celular: robo con seguro (decisión del usuario: no contratarlo)

Seguro que paga $80.000 (80% del aparato, con deducible; no cubre los datos). Costo de referencia: ~$3.674 al mes (Banco de Chile, Mi Smartphone Seguro, aproximado) = ~$44.000 al año.

| Paso | Valor |
|---|---|
| FE con seguro | ($150.000 − $80.000) ÷ $150.000 = 46,67% |
| SLE con seguro | $70.000 |
| ALE con seguro | $70.000 × 1/3 = $23.333 |
| Reducción | $50.000 − $23.333 = $26.667 |
| **Valor neto** | $26.667 − $44.000 = **−$17.333: no conviene** |
| Cuali con seguro | D baja de 4 a 2; I = 3; P × I = 4 × 3 = **12, Medio** (de 16, Alto) |

Cuanti y cuali no coinciden. El usuario **acepta el riesgo** (prefiere reponer el celular con tarjeta de crédito antes que pagar el seguro).

### Matriz de calor del celular (con los dos riesgos)

| Riesgo | Antes | Después | Orden propuesto (residual) |
|---|---|---|---|
| Robo (con borrado remoto, sin seguro) | 20, Alto | 16, Alto | 1.º |
| Rotura (con carcasa) | 15, Alto | 5, Medio | 2.º |

---

## 10. Para más adelante

Las decisiones que este documento dejaba abiertas (notas de Dinero, fracciones del MTD, orden de la lista) se tomaron en `02-algoritmo.md` §6, y el tratamiento del riesgo está en `03-tratamiento.md`. Queda fuera por ahora:

- La amenaza "pérdida" (extravío) del celular.

---

## 11. Glosario de siglas

| Sigla | Nombre en inglés | En español |
|---|---|---|
| VA | Asset Value | Valor del activo |
| FE | Exposure Factor | Factor de exposición: % del valor que se pierde en un evento |
| SLE | Single Loss Expectancy | Pérdida esperada por evento (VA × FE) |
| ARO | Annualized Rate of Occurrence | Tasa anual de ocurrencia (veces ÷ años) |
| ALE | Annualized Loss Expectancy | Pérdida anual esperada (SLE × ARO) |
| P | Probability | Probabilidad (nota 1 a 5, sale del ARO) |
| I | Impact | Impacto (nota 1 a 5, la pieza más alta) |
| C / I / D | Confidentiality / Integrity / Availability | Confidencialidad / integridad / disponibilidad |
| MTD | Maximum Tolerable Downtime | Tiempo máximo tolerable de caída |
| GRC | Governance, Risk and Compliance | Gobierno, riesgo y cumplimiento |
| MAGERIT | (en español) | Metodología de Análisis y Gestión de Riesgos de los Sistemas de Información |
| ATT&CK | Adversarial Tactics, Techniques, and Common Knowledge | Tácticas, técnicas y conocimiento común del adversario |
