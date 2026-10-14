# Plan de Trading

**Lee esto en otros idiomas:** [Português](README.md) · [English](README.en.md)

Aplicación local-first para ayudar al trader a prepararse antes de la sesión, definir escenarios condicionales, preservar lo que realmente había planificado y compararlo después con el mercado real y con su propia ejecución.

> Nombre de trabajo del proyecto. Nombres finales sugeridos: **Mapa de Trade**, **Plano de Pregão** y **Trade Blueprint**.

## Objetivo

La herramienta no intenta predecir el mercado. Organiza el proceso de decisión del trader antes de la apertura alrededor de cuatro preguntas:

1. **¿Cuál es mi tesis y qué escenarios considero relevantes para la próxima sesión?**
2. **¿Qué evidencias existen contra mi tesis?**
3. **¿Qué haré si se materializa el escenario A, B o C?**
4. **Después de la sesión, qué hizo el mercado, qué hice yo y cuánto respeté el plan original?**

## Funcionalidades actuales — v0.3

### Sistema de trading

- reglas de Entrada, Salida, Riesgo, Horario, Contexto, Comportamiento y otras categorías;
- justificación para cada regla;
- activación/desactivación;
- imágenes explicativas.

### Biblioteca de setups

- registro de patrones operativos reutilizables;
- contexto ideal, criterios de entrada, confirmación e invalidación;
- modelo de stop, objetivo/gestión y situaciones que deben evitarse;
- cuidados conductuales;
- ejemplos visuales;
- aplicación de un setup directamente al escenario A de un plan diario, manteniendo la posibilidad de adaptarlo al contexto concreto de la sesión.

### Planes de trading

- plan por activo y fecha;
- sesgo inicial, contexto, niveles, eventos y riesgo máximo;
- condiciones para no operar;
- checklist premercado;
- escenarios A/B/C con gatillo, confirmación, acción, invalidación, stop, objetivos y prohibiciones;
- campo específico de **evidencias contra la tesis** para reducir el sesgo de confirmación;
- plan conductual en formato “si ocurre X, haré Y”;
- imágenes de la planificación.

### Congelación y versionado

La planificación tiene dos estados:

- **Borrador:** puede modificarse libremente;
- **Congelado:** el sistema crea una fotografía inmutable del plan antes de la sesión.

Si es necesario modificar un plan ya congelado, el trader crea una **nueva versión**. Las versiones anteriores permanecen preservadas con su fecha y hora.

Esto evita que la revisión posterior reescriba retrospectivamente lo que el trader realmente pensaba antes de operar.

### Planificado × Mercado real × Mi ejecución

La revisión separa tres capas:

1. **Planificado** — usa la última versión congelada como referencia;
2. **Mercado real** — describe lo que realmente ocurrió y qué escenario predominó;
3. **Mi ejecución** — registra lo que el trader realmente hizo, sus desviaciones y el resultado.

Si el plan nunca fue congelado, el sistema lo indica claramente y usa el borrador actual únicamente como referencia no inmutable.

### Idiomas

La interfaz admite:

- **Português (Brasil)**;
- **English**;
- **Español**.

El idioma se cambia en **Configuración > Idioma de la interfaz**. La preferencia se guarda localmente y forma parte de la copia de seguridad JSON.

La localización solo afecta a la interfaz. Los textos creados por el trader — reglas, setups, hipótesis, escenarios, revisiones y notas — no se traducen ni se reescriben de forma destructiva al cambiar el idioma.

### Datos y copias de seguridad

- aplicación local-first sin servidor obligatorio;
- persistencia en `localStorage` en el MVP web;
- compresión de imágenes antes de guardarlas;
- copia de seguridad JSON completa;
- restauración de copias;
- migración automática de los schemas v1 y v2 al **schema v3**;
- tema claro/oscuro, lista configurable de activos y preferencia persistente de idioma.

## Filosofía técnica

El proyecto sigue principios ya utilizados en **Trade Journal Tracker**:

- React + TypeScript;
- datos locales propiedad del usuario;
- schema versionado;
- migraciones explícitas;
- imágenes comprimidas;
- copia integral en JSON;
- separación progresiva entre interfaz, dominio y persistencia.

El MVP web guarda los datos en el navegador. El roadmap prevé una versión de escritorio con **Tauri + SQLite**, mayor capacidad para imágenes, copias automáticas y una aplicación instalable completamente local.

## Ejecutar localmente

Requisitos: Node.js 20+ y npm.

```bash
npm install
npm run dev
```

Para verificar tipos y generar la versión de producción:

```bash
npm run typecheck
npm run build
npm run preview
```

## Copia de seguridad

En **Configuración > Copia de seguridad y recuperación**:

- usa **Exportar copia JSON** para guardar una copia completa;
- usa **Importar copia JSON** para restaurar datos compatibles.

Las copias de los schemas v1 y v2 se migran automáticamente a v3. El sistema no fabrica versiones congeladas para planes antiguos, ya que eso crearía una falsa evidencia de que estaban bloqueados antes de la sesión.

## Documentación

- [`docs/PRODUCT-SPEC.md`](docs/PRODUCT-SPEC.md) — especificación funcional;
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — fases completadas y próximas evoluciones.

## Privacidad

El MVP no envía planes, reglas, setups, imágenes ni revisiones a un servidor. Los datos permanecen en el almacenamiento local del navegador salvo que el usuario los exporte explícitamente.
