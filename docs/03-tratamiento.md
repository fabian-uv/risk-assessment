# 03 · Tratamiento del riesgo

Complementa `01-problema.md` y `02-algoritmo.md`: qué se hace con un riesgo una vez calculado. Las ideas vienen de las guías habituales sobre el tema (INCIBE, ISO 31000, CIS Controls v8), contadas con palabras propias.

Las decisiones marcadas **(por defecto)** no venían cerradas por las fuentes: son la opción que tomó el programa y se pueden cambiar.

## 1. Las cuatro opciones

Cada amenaza analizada termina con un **tratamiento elegido por la persona**:

| Tratamiento | Qué es | En el programa |
|---|---|---|
| **Mitigar** | Bajar la probabilidad o el impacto con un control | Se aplica el control de la amenaza; queda el **riesgo residual** (con control). |
| **Transferir** | Que un tercero pague la pérdida: seguro, contrato, proveedor | Igual que mitigar, pero el control está marcado como **seguro o contrato**. No elimina el riesgo: queda residual. |
| **Aceptar** | Asumir el riesgo a conciencia | **Sin control**: se asume el **riesgo inherente** (sin control). |
| **Evitar** | Dejar la actividad o el activo | Solo se registra la decisión. Sin cálculo. |

- **(por defecto)** Mitigar y Transferir piden que la amenaza tenga un control. Si el control está marcado como seguro o contrato, corresponde Transferir; si no, Mitigar.
- **(por defecto)** Aceptar se refiere al riesgo **sin control**. Así la pantalla dice siempre qué riesgo se asume y con qué nivel.

## 2. Sugerencia (nunca decide sola)

El programa sugiere y explica por qué; la persona elige. Reglas, en orden:

1. Si el riesgo **sin control** está dentro del **umbral de aceptación** → sugerir **Aceptar**.
2. Si el control de la amenaza tiene **valor neto > 0** → sugerir **Mitigar** (o **Transferir** si es un seguro o contrato).
3. Si no → sugerir **Evitar o Aceptar con excepción** (sección 3), explicando que ninguna medida compensa su costo.

- **(por defecto)** La regla 1 usa el riesgo **sin control** (inherente), no el residual: lo que pregunta es si vale la pena hacer algo.
- El valor neto es el **del control** (decisión 10 de `01-problema.md`): si protege varias amenazas, suma sus reducciones y resta el costo una vez.
- El criterio es **costo-beneficio e impacto**. Otras fuentes lo simplifican por probabilidad (baja → aceptar, media → transferir, alta → evitar); el modo estudio lo menciona.

## 3. Umbral de aceptación y excepción (FAR-lite)

- **Umbral de aceptación**: nivel hasta el que se acepta sin trámite. Va con el análisis. Por defecto **Bajo**; **(por defecto)** también se puede elegir **Medio**.
- Aceptar un riesgo dentro del umbral no pide nada.
- Aceptar uno por encima es una **excepción** y pide un formulario corto (FAR-lite, *Formulario de Aceptación de Riesgos*):
  - motivo (obligatorio);
  - controles complementarios que lo reducen indirectamente (opcional);
  - nivel estimado después de ellos (opcional);
  - plan de acción (obligatorio) con **fecha límite** (obligatoria);
  - **revisión cada 3 meses**: **(por defecto)** se cuenta desde la fecha en que se aceptó y se muestra la próxima fecha.
- Las excepciones aparecen aparte en el resumen y se guardan en el JSON.

## 4. Avisos al elegir un control (no bloquean)

- El **precio** del control es mayor que el **VA** del activo. **(por defecto)** «Precio» es el precio de compra si se paga una vez, o el costo anual si se paga cada año.
- El **valor neto ≤ 0**: el control cuesta más de lo que ahorra.
- En modo estudio: el beneficio de un control debe poder medirse; por eso se pide el valor con control y su origen.

## 5. Datos

En cada control: `transfiere` (sí/no: es un seguro o contrato).
En el análisis: `umbralAceptacion` (`Bajo` o `Medio`).
En cada amenaza: `tratamiento = { opcion, far: { motivo, complementarios, nivelEstimado, plan, fecha, aceptadoEl } }`.
**(por defecto)** Un análisis antiguo con `aceptado: true` se lee como `opcion: 'aceptar'`.

## 6. Casos de prueba

Celular de $150.000, umbral de Dinero $2.000.000, umbral de aceptación Bajo. Verificados con fracciones exactas en `tools/verificar_casos.py` y en `tests/`.

| # | Caso | Esperado |
|---|---|---|
| T17 | Rotura con carcasa: valor neto +$20.000; 15 Alto → 5 Medio | Sugerir **Mitigar** |
| T18 | Robo con borrado remoto: valor neto $0; 20 Alto → 16 Alto | Sugerir **Evitar o Aceptar con excepción** |
| T19 | Robo con seguro (borrado ya puesto): valor neto −$17.333; sin control 16 Alto | No sugerir el seguro; si se acepta, **pide el FAR-lite** |
| T20 | Riesgo Bajo (P × I ≤ 4) | Sugerir **Aceptar**, sin formulario |

## 7. Fuera por ahora

- La lista de los 18 controles CIS v8 como sugerencias de nombre: queda para una versión futura.
- Una comparación de marcos de referencia (ISO 31000, MAGERIT, OCTAVE).
