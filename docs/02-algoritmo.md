# Algoritmo

> Proyecto: Risk Assessment. Parte de `01-problema.md`.
> Se escribió antes del código: define el cálculo en orden, y la app lo implementa en `src/logica.js`.

**Regla de siglas:** cada sigla va con su nombre en inglés y su traducción (glosario en `01-problema.md`, sección 11).

---

## 1. Idea general

El programa recorre **seis pasos** (del 0 al 5). Los pasos 1 a 4 se repiten por cada activo y amenaza; el paso 5 se hace una sola vez al final.

| Paso | Nombre | Qué hace | Operación principal |
|---|---|---|---|
| 0 | Al empezar | Pide el umbral | Ninguna |
| 1 | Activo | Pide tipo, nombre, VA y MTD | **Suma** (aparato + datos) |
| 2 | Amenaza sin control | Calcula el riesgo inherente | **Divide**, **multiplica**, **máximo**, **tabla** |
| 3 | Control | Elige o crea el control y pide qué cambia | Ninguna (datos) y **divide** (costo anual) |
| 4 | Cálculo antes y después | Calcula el riesgo residual y el veredicto | **Resta** |
| 5 | Resumen final | Dibuja la matriz de calor y ordena los riesgos | **Ordena** |

En **modo estudio**, cada paso muestra además: qué estamos haciendo, qué operación toca, la tabla de referencia a la vista, el significado de cada sigla y los errores comunes de ese paso.

---

## 2. Datos que maneja el programa

Se describen como estructuras, sin atarse a un lenguaje de programación.

### Análisis (uno por sesión de trabajo)

| Campo | Tipo | Detalle |
|---|---|---|
| `umbral` | dinero (pesos) | Monto catastrófico. Marca la nota 5 de Dinero |
| `umbral_aceptacion` | Bajo o Medio | Hasta qué nivel se acepta un riesgo sin trámite (ver `03-tratamiento.md`) |
| `controles` | lista de Control | Se llena una vez |
| `activos` | lista de Activo | |

### Control

| Campo | Tipo | Detalle |
|---|---|---|
| `nombre` | texto | Ej. "Carcasa Rhinoshield" |
| `costo_anual` | dinero | Si se paga una vez: `precio ÷ años_de_vida` |
| `origen_costo` | opción | Ver orígenes en la sección 2.1 |
| `transfiere` | sí / no | Si es un seguro o un contrato que traspasa la pérdida a un tercero |

### Activo

| Campo | Tipo | Detalle |
|---|---|---|
| `tipo` | opción de lista | Computador, celular, servidor, etc. |
| `nombre` | texto | Etiqueta |
| `VA` | dinero | Puede armarse sumando partes (aparato + datos) |
| `MTD` | duración | Tiempo máximo tolerable de caída |
| `amenazas` | lista de Amenaza | |

### Amenaza (siempre dentro de un activo)

| Campo | Tipo | Detalle |
|---|---|---|
| `tipo` | opción de lista | Elegida entre las 4 familias |
| `veces`, `años` | enteros positivos | Dan el ARO (Annualized Rate of Occurrence) |
| `FE_sin` | porcentaje (0 a 100) | Exposure Factor sin control |
| `piezas_sin` | C, I, D (1 a 5) + duración de caída | Ver paso 2 |
| `aplicacion` | Aplicación | El control que se le aplica (uno por amenaza) |
| `tratamiento` | opción + formulario | Mitigar, transferir, aceptar o evitar; si se acepta por encima del umbral, el formulario de excepción (ver `03-tratamiento.md`) |
| `origenes` | un origen por cada estimación | Ver 2.1 |

### Aplicación (un control aplicado a una amenaza)

| Campo | Tipo | Detalle |
|---|---|---|
| `control` | referencia a un Control de la lista | El costo no se repite aquí |
| `ARO_nuevo` | opcional | Solo si el control hace que pase menos seguido |
| `FE_nuevo` | opcional | Solo si el control hace que duela menos |
| `piezas_nuevas` | opcional | Solo las piezas C, I, D que el control cambia |

### 2.1 Origen de cada estimación

Dato del fabricante o precio de mercado · historial propio · estadística o norma del sector · opinión de un experto · estimación propia.

---

## 3. Funciones básicas (reglas exactas)

**Regla de oro: no se usan decimales para calcular.** Los valores como ARO y FE se guardan como **fracciones exactas** (por ejemplo, 1 vez cada 3 años es `1/3`, no `0,333`). Solo se redondea **al mostrar en pantalla**. Así se evitan los errores de borde (1/3 nunca queda como 0,3).

```
aro(veces, años)         = veces / años                       # fracción exacta
sle(va, fe)              = va * fe
ale(sle, aro)            = sle * aro
reduccion(ale_sin, ale_con) = ale_sin - ale_con
costo_anual(precio, años_vida) = precio / años_vida
valor_neto(reduccion, costo_anual) = reduccion - costo_anual
```

### Nota de probabilidad P a partir del ARO

El borde va a la nota más alta.

```
nota_p(aro):
    si aro >= 1      : 5
    si aro >= 1/3    : 4
    si aro >= 1/5    : 3
    si aro >= 1/10   : 2
    si no            : 1
```

### Nota de disponibilidad D a partir de la duración y el MTD

Se compara con multiplicación de enteros (sin dividir). El borde va a la nota más alta.

```
nota_d(duracion, mtd):
    si duracion >= mtd        : 5
    si 3 * duracion >= mtd    : 4
    si 12 * duracion >= mtd   : 3
    si 144 * duracion >= mtd  : 2
    si no                     : 1
```

### Nota de Dinero a partir de la pérdida y el umbral

```
nota_dinero(perdida, umbral):
    si perdida >= umbral : 5
    notas 1 a 4          : PENDIENTE (cómo se reparten bajo el umbral)
```

La `perdida` que se compara es el **SLE** de la amenaza (lo que se pierde en un evento).

### Impacto I, riesgo y nivel

```
impacto(c, i, d, dinero) = máximo(c, i, d, dinero)
riesgo(p, i)             = p * i

nivel(r):
    si r <= 4  : Bajo
    si r <= 12 : Medio
    si no      : Alto          # los valores posibles son 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25
```

### Veredicto del valor neto

```
veredicto(neto):
    si neto > 0 : "Conviene"
    si neto = 0 : "Empate: da lo mismo en pesos"
    si neto < 0 : "No conviene en pesos"
```

---

## 4. Los seis pasos, en detalle

### Paso 0. Al empezar

**Entrada:** umbral de Dinero, modo estudio sí o no.

**Qué hace:** guarda los datos del análisis. No calcula nada.

**Validaciones:**
- El umbral debe ser mayor que 0.

**Modo estudio muestra:** qué es el umbral y por qué es por análisis.

---

### Paso 1. Ficha del activo

**Entrada:** tipo, nombre, VA (o sus partes para sumar) y MTD.

**Qué hace:** `VA = suma de las partes` si se entregaron por partes.

**Validaciones:** VA mayor que 0; MTD mayor que 0.

**Modo estudio muestra:** la diferencia entre el precio del aparato y el valor del activo completo (los datos también valen). *Error común: contar solo el aparato.*

---

### Paso 2. Ficha de la amenaza, sin control (riesgo inherente)

**Entrada:** tipo de amenaza, veces y años, FE sin control, piezas C e I, duración de la caída (para D), y el origen de cada estimación.

**Orden de los cálculos:**

```
1. aro        = veces / años
2. sle_sin    = VA * FE_sin
3. ale_sin    = sle_sin * aro
4. p_sin      = nota_p(aro)                          # lado cuali: se traduce con la tabla
5. d_sin      = nota_d(duracion, MTD)
6. dinero_sin = nota_dinero(sle_sin, umbral)
7. i_sin      = impacto(c_sin, i_sin_pieza, d_sin, dinero_sin)
8. riesgo_sin = p_sin * i_sin
9. nivel_sin  = nivel(riesgo_sin)
```

**Salida:** ARO, SLE, ALE sin control; P, I, riesgo y nivel sin control.

**Validaciones:** `veces` y `años` enteros mayores que 0; FE entre 0 y 100; C e I entre 1 y 5.

**Modo estudio muestra:**
- Rótulos "lado cuanti (pesos)" para los pasos 1 a 3 y "lado cuali (notas)" para los pasos 4 a 9.
- La tabla de P a la vista cuando se traduce el ARO. *Error común: usar el ARO (0,333) en vez de la nota P (4) al multiplicar en el cuali.*
- Para el impacto, las cuatro piezas con la más alta marcada. *Error común: puntuar el evento y no la consecuencia.*
- Un recordatorio: **el ALE se obtiene multiplicando** (SLE × ARO), nunca dividiendo.

---

### Paso 3. Control (el "después")

**Entrada:** el control de la amenaza, elegido de la lista de controles del análisis o creado ahí mismo (nombre y costo anual), y qué cambia (ARO, FE, piezas del impacto, o varios) con su valor nuevo y su origen.

**Qué hace:** guarda la Aplicación. Un control nuevo entra a la lista única del análisis; si otra amenaza usa el mismo control, se elige de la lista y su costo no se pide de nuevo ni se duplica.

**Validaciones:**
- Cada control necesita nombre y un costo anual mayor o igual a 0 (puede ser 0, como un borrado remoto incluido en el celular).
- Si el costo viene de una compra única, se pide la vida útil en años y el programa divide.
- Al menos una de las tres cosas debe cambiar.
- Si el nuevo FE es 0% o una pieza del impacto queda en 1 cuando antes era 5, el programa pide confirmar ("casi ningún control es perfecto, ¿seguro?").
- Si el control es un seguro, se puede pedir el **monto cubierto** en pesos: `FE_nuevo = (VA − cubierto) / VA`.

**Modo estudio muestra:** que cada control se anota una vez y su costo no se duplica, y cómo se lleva un pago único a costo anual; el versus de tarjetas "baja el ARO / baja el FE / baja piezas del impacto", con la pregunta antes de la explicación. *Errores comunes: creer que todo control baja las dos cosas; leer el FE al revés (es lo que sigue perdiéndose, no lo que cubre el control).*

---

### Paso 4. Cálculo antes y después

Para el control de la amenaza:

```
aro_con      = ARO_nuevo si existe, si no aro
fe_con       = FE_nuevo si existe, si no FE_sin
sle_con      = VA * fe_con
ale_con      = sle_con * aro_con
reduccion    = ale_sin - ale_con
p_con        = nota_p(aro_con)
piezas_con   = piezas_nuevas si existen, si no las de "sin control"
dinero_con   = nota_dinero(sle_con, umbral)
i_con        = impacto(c_con, i_con_pieza, d_con, dinero_con)
riesgo_con   = p_con * i_con
nivel_con    = nivel(riesgo_con)
mejora       = riesgo_sin - riesgo_con          # en puntos
```

**Valor neto:** se calcula **por control**, no por amenaza, para no contar su costo dos veces:

```
valor_neto(control) = suma de las reducciones de todas las amenazas donde se aplica - costo_anual(control)
```

Cuando un control se aplica a una sola amenaza, coincide con `reduccion - costo_anual`.

**Salida:** ALE antes y después, reducción, costo anual, valor neto y veredicto (cuanti); P × I antes y después, puntos de mejora y si cambió de nivel (cuali).

**Cuando los veredictos no coinciden** (cuanti "no conviene", cuali "mejora"), el programa muestra ambos, lo explica en una frase y **no decide por el usuario**. La decisión es del usuario, al elegir el tratamiento (ver `03-tratamiento.md`).

**Modo estudio muestra:** las dos barras (ALE sin y con control), la resta con los números puestos y la diferencia entre "lo que ahorras" y "lo que cuesta". *Errores comunes: sumar el costo a la pérdida; dividir el costo por las veces; dejar el signo mal.*

---

### Paso 5. Resumen final (se hace una vez)

**Entrada:** todos los riesgos calculados. No pide datos ni calcula nada nuevo.

**Qué hace:**

1. **Matriz de calor 5×5**: marca cada riesgo en su casilla (P en vertical, I en horizontal), con el **antes** y el **después** del control. Cada casilla muestra el valor P × I y el color del nivel.
2. **Lista ordenada**: de mayor a menor `riesgo_con` (el residual), y en empate de mayor a menor `ale_con`.

```
ordenar(riesgos) por (riesgo_residual descendente, ale_residual descendente)
```

**Salida:** la matriz y la lista, cada fila con el número, el color, los puntos de mejora y el tratamiento que eligió el usuario.

**Modo estudio muestra:** cómo leer la matriz y el límite del cuali (el color es grueso, por eso se muestra también el número y los puntos).

---

## 5. Casos de borde que el algoritmo debe manejar

| Situación | Qué hace el programa |
|---|---|
| ARO justo en un límite (1/3, 1/5, 1/10, 1) | Va a la nota más alta; se compara con fracciones exactas |
| FE de 0% o 100% | Se acepta; el 0% pide confirmación (paso 3) |
| Un control que no cambia nada | Se rechaza (paso 3) |
| Valor neto exactamente 0 | Veredicto "empate" |
| Un control compartido por varias amenazas | Su costo se cuenta una vez (valor neto por control) |
| Pérdida igual o mayor que el umbral | Dinero = 5 |
| Duración de caída igual al MTD | Disponibilidad = 5 |
| Amenaza sin ningún control | Se calcula solo el inherente; no hay residual ni valor neto |
| Dos amenazas del mismo activo con la misma etiqueta | Se permite (ej.: dos robos distintos), se distinguen por el nombre |

---

## 6. Decisiones tomadas

1. **Un control por amenaza.** Cada amenaza se evalúa con un solo control a la vez, contra su riesgo inherente. Combinar varios controles sobre la misma amenaza queda para más adelante.
2. **Valor neto por control.** Se suman las reducciones de todas las amenazas que protege el control y se resta su costo anual una sola vez. Si protege una sola amenaza, coincide con el valor de esa amenaza.
3. **Fracciones del MTD** para la escala de disponibilidad: 1/144, 1/12, 1/3 y 1.
4. **Notas de Dinero** a partir del umbral: 5 si la pérdida llega al umbral; 4, 3 y 2 desde 1/5, 1/20 y 1/100 del umbral.
5. **Lista ordenada** por riesgo residual (P × I); si empatan, por ALE residual.
6. **Tratamiento del riesgo** (evitar, aceptar, transferir, mitigar): en `03-tratamiento.md`.

Para más adelante: la amenaza "pérdida" (extravío) del celular, que no está en el ejemplo.

---

## 7. Cómo se va a probar

Todo caso de `docs/01-problema.md`, sección 9, se convierte en una prueba automática. Las pruebas se escriben **antes** del código y usan fracciones exactas.

| # | Función o paso | Entrada | Resultado esperado |
|---|---|---|---|
| T1 | `ale` | SLE 150.000; 2 veces en 5 años | ARO 2/5; ALE 60.000 |
| T2 | `ale` | SLE 20.000; 5 veces en 1 año | ARO 5; ALE 100.000 |
| T3 | `ale` | SLE 1.000.000; 1 vez en 10 años | ARO 1/10; ALE 100.000 |
| T4 | `nota_p` | 1 vez en 3 años | 4 |
| T5 | `nota_p` | 1 vez en 10 años | 2 |
| T6 | `nota_p` | 1 vez en 1 año | 5 |
| T7 | `nota_p` | 1 vez en 5 años | 3 |
| T8 | `nota_d` | duración = MTD | 5 |
| T9 | `nota_d` | MTD 720 min: 5, 60, 240 min | 2, 3, 4 (los bordes pasan a la nota más alta) |
| T10 | `nivel` | 4, 5, 12, 15 | Bajo, Medio, Medio, Alto |
| T11 | Computador | VA 2.000.000; FE 100% a 50%; ARO 1/10; respaldo 40.000 | ALE 200.000 a 100.000; neto +60.000 |
| T12 | Computador cuali | P 2; I 5 a 4 | 10 Medio a 8 Medio; mejora 2 puntos |
| T13 | Celular rotura | VA 150.000; ARO 1; FE 30% a 10%; carcasa 30.000 en 3 años | SLE 45.000 a 15.000; costo 10.000; neto +20.000; 15 Alto a 5 Medio |
| T14 | Celular robo | ARO 1/3; FE 100%; piezas 5, 5, 4 a 3, 3, 4 | P 4; I 5 a 4; 20 Alto a 16 Alto; ALE 50.000 sin cambio |
| T15 | Celular seguro | cubre 80.000; costo 44.000 al año | FE 70.000/150.000; ALE 23.333,33; neto −17.333,33; 12 Medio |
| T16 | Orden final | Robo 16 y Rotura 5 | Robo primero, rotura segundo |

---

## 8. Cuidados para cuando se programe

- Usar **fracciones exactas** (y enteros para pesos) en todo cálculo; redondear solo al mostrar.
- Separar el **cálculo** (funciones puras, fáciles de probar) de lo que se **muestra** (modo estudio).
- Los textos del modo estudio (explicaciones, errores comunes, tarjetas) viven aparte del código de cálculo, para poder editarlos sin tocarlo.
- Datos de ejemplo siempre ficticios; no subir material del curso al repositorio.

---

## 9. Documentos relacionados

- `03-tratamiento.md`: qué se hace con cada riesgo después de calcularlo.
- La organización del programa (archivos y formato de guardado) está en el `README.md`.
