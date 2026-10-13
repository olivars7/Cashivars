# Plan: Mejoras UX en Cards.tsx

## Overview

Mejorar la experiencia visual y funcional de la página de Tarjetas (`src/pages/Cards.tsx`).
La persistencia en localStorage ya funciona correctamente (via `useStore` + `storage.ts`).
Todos los cambios son dentro del componente `Cards.tsx` y la constante `GRADIENT_OPTIONS`.
No se toca el store, ni el servicio de storage, ni ningún otro archivo salvo lo indicado.

**Scope:** Solo `src/pages/Cards.tsx` y `src/mocks/mockData.ts` (para alinear gradientes del seed).

---

## Sub-Tasks

---

### Sub-Task 1 — Agregar gradientes azul y morado a `GRADIENT_OPTIONS`

**Status:** [ ] pending

**Intent:**
Las tarjetas del seed data (`bbva1` con `from-blue-700 to-blue-950` y `nu1` con `from-purple-700 to-purple-950`)
usan gradientes que no existen en `GRADIENT_OPTIONS`. Al editar esas tarjetas, ningún color aparece
seleccionado en el picker, lo que confunde al usuario y puede llevar a guardar con el color por defecto.

**Expected Outcomes:**
- `GRADIENT_OPTIONS` incluye `from-blue-700 to-blue-950` (Azul BBVA) y `from-purple-700 to-purple-950` (Morado Nu).
- Al abrir edición de cualquier tarjeta del seed, el color correcto aparece resaltado en el picker.
- No se rompe ningún gradiente existente.

**Todo List:**
1. En `src/pages/Cards.tsx`, agregar dos entradas a `GRADIENT_OPTIONS`:
   - `{ label: 'Azul', value: 'from-blue-700 to-blue-950' }`
   - `{ label: 'Morado', value: 'from-purple-700 to-purple-950' }`
2. Verificar que Tailwind tenga esas clases disponibles (están en el seed data por lo que ya están purgadas/usadas).

**Relevant Context:**
- `GRADIENT_OPTIONS` → `src/pages/Cards.tsx:9-16`
- Seed cards → `src/mocks/mockData.ts:47-74`

---

### Sub-Task 2 — Fix de validación y etiqueta para tarjetas de débito

**Status:** [ ] pending

**Intent:**
Las tarjetas de débito no tienen límite de crédito (`limit=0`), pero la validación actual en
`handleSubmit` rechaza el formulario cuando `limit <= 0`. Esto hace imposible guardar una
tarjeta de tipo débito. Además, la etiqueta del campo de balance dice "Saldo usado (MXN)",
lo cual es semánticamente incorrecto para débito (el balance es el saldo disponible, no usado).

**Expected Outcomes:**
- Se puede guardar exitosamente una tarjeta de tipo `debit` con `limit=0`.
- Cuando el tipo es `debit`, el campo de balance muestra la etiqueta "Saldo disponible (MXN)".
- Cuando el tipo es `credit`, el campo sigue mostrando "Saldo usado (MXN)".
- La validación de límite solo aplica cuando el tipo es `credit`.

**Todo List:**
1. En `handleSubmit`, cambiar la condición de validación:
   - Antes: `isNaN(limit) || limit <= 0`
   - Después: `isNaN(limit) || (form.type === 'credit' && limit <= 0)`
2. En el JSX del campo `balance`, hacer la etiqueta condicional según `form.type`:
   - `form.type === 'debit' ? 'Saldo disponible (MXN)' : 'Saldo usado (MXN)'`

**Relevant Context:**
- Validación → `src/pages/Cards.tsx:65-90`
- Etiqueta del campo balance → `src/pages/Cards.tsx:400-405`

---

### Sub-Task 3 — Ocultar barra de uso de crédito para tarjetas de débito

**Status:** [ ] pending

**Intent:**
La barra de "Uso del crédito" y su porcentaje solo tienen sentido para tarjetas de crédito.
Las tarjetas de débito del seed tienen `limit=0`, lo que hace que `usedPct` devuelva 0% siempre,
mostrando una barra vacía sin información útil. Para débito, es más informativo mostrar el saldo disponible directamente.

**Expected Outcomes:**
- Para tarjetas de tipo `credit`: se muestra la barra de uso igual que hoy.
- Para tarjetas de tipo `debit`: no se muestra la barra de uso; en su lugar, se muestra el saldo disponible como texto simple.
- El panel de información (`info panel`) mantiene su estructura visual.

**Todo List:**
1. En el info panel de cada card, envolver la sección de la barra en un condicional:
   - `card.type === 'credit'` → mostrar barra de uso (comportamiento actual)
   - `card.type === 'debit'` → mostrar `<p>Saldo disponible: {fmt(card.balance)}</p>` con estilos consistentes

**Relevant Context:**
- Barra de uso → `src/pages/Cards.tsx:183-202`
- Función `usedPct` → `src/pages/Cards.tsx:92-93`

---

### Sub-Task 4 — Formatear fechas de corte y pago a formato legible

**Status:** [ ] pending

**Intent:**
Las fechas se almacenan en formato `YYYY-MM-DD` y se muestran tal cual en la tarjeta visual
y en el panel de info. Para el usuario es más amigable ver "15 Jul 2026" que "2026-07-15".
Las tarjetas del seed tienen fechas vacías (`''`), por lo que hay que manejar el caso vacío.

**Expected Outcomes:**
- Las fechas no vacías se muestran en formato `DD MMM YYYY` en español (ej. "15 jul 2026").
- Las fechas vacías muestran un placeholder como "—" o "Sin fecha".
- El cambio aplica en la tarjeta visual (frontal) y en el panel de info debajo.

**Todo List:**
1. Crear una función helper `fmtDate(dateStr: string): string` dentro del componente o como constante al nivel del módulo:
   - Si `dateStr` está vacío: devuelve `'—'`
   - Si no: `new Date(dateStr + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })`
   - Nota: agregar `T12:00:00` para evitar off-by-one por UTC en `new Date('YYYY-MM-DD')`.
2. Reemplazar las 4 ocurrencias donde se muestra la fecha cruda (`card.cutDate`, `card.paymentDate`) por `fmtDate(card.cutDate)` y `fmtDate(card.paymentDate)`.

**Relevant Context:**
- Fecha de corte en tarjeta visual → `src/pages/Cards.tsx:170`
- Fecha de corte en info panel → `src/pages/Cards.tsx:214`
- Fecha de pago en info panel → `src/pages/Cards.tsx:224`

---

### Sub-Task 5 — Preview de la tarjeta en tiempo real dentro del modal

**Status:** [ ] pending

**Intent:**
El modal de creación/edición solo tiene campos de texto; el usuario no puede ver cómo quedará
la tarjeta hasta después de guardar. Agregar un mini-preview visual de la tarjeta dentro del
modal que se actualice en tiempo real mientras el usuario escribe mejora la experiencia al elegir colores y verificar el diseño.

**Expected Outcomes:**
- Dentro del modal, encima de los campos del formulario, aparece un preview reducido (escala pequeña)
  de la tarjeta que usa los valores actuales de `form` (nombre, banco, lastFour, red, tipo, gradiente).
- El preview se actualiza en tiempo real conforme el usuario cambia los campos.
- El preview usa la misma estructura visual que la tarjeta en el listado.
- Si campos están vacíos, muestra placeholders (ej. "Tu Tarjeta", "Banco", "••••").

**Todo List:**
1. Extraer el JSX de la tarjeta visual (el `<div className="relative w-full h-44...">`) a un sub-componente
   interno o a una función de render dentro de `Cards()` que acepte los datos como props/parámetro.
   - Llamarlo `CardPreview` (función local o componente local al archivo).
   - Parámetros: `name, bank, lastFour, network, type, gradient, balance, limit, cutDate`.
2. Usar `CardPreview` en el listado (para no duplicar código) y también dentro del modal,
   pasando los valores de `form` con fallbacks para campos vacíos.
3. El preview en el modal puede tener una escala menor usando `transform: scale(0.85)` o similar con `origin-top`.

**Relevant Context:**
- Tarjeta visual actual → `src/pages/Cards.tsx:137-173`
- Modal → `src/pages/Cards.tsx:256-530`

---

### Sub-Task 6 — Confirmación antes de eliminar una tarjeta

**Status:** [ ] pending

**Intent:**
El botón "Eliminar" en cada tarjeta ejecuta `deleteCreditCard(card.id)` inmediatamente sin
ninguna confirmación. Si el usuario hace clic por accidente, la tarjeta se pierde (junto con
la referencia `cardId` en las transacciones que la usaban). Se debe agregar un paso de confirmación.

**Expected Outcomes:**
- Al hacer clic en "Eliminar", se muestra un pequeño diálogo/modal de confirmación dentro del mismo componente.
- El diálogo muestra el nombre de la tarjeta a eliminar.
- Si el usuario confirma, se ejecuta `deleteCreditCard`.
- Si cancela, la tarjeta permanece intacta.
- El diseño del diálogo es consistente con el modal existente (mismos estilos de botones y fondo).

**Todo List:**
1. Agregar estado local `deletingCardId: string | null` (null = ningún diálogo abierto).
2. El botón "Eliminar" setea `deletingCardId = card.id` en lugar de llamar `deleteCreditCard` directamente.
3. Renderizar un pequeño modal de confirmación cuando `deletingCardId !== null`:
   - Overlay con mismo `z-[60]` y `modal-overlay`.
   - Contenido: "¿Eliminar [nombre de la tarjeta]?", botón "Cancelar" y botón "Eliminar" en rojo.
   - "Cancelar" → `setDeletingCardId(null)`.
   - "Eliminar" → `deleteCreditCard(deletingCardId)` + `setDeletingCardId(null)`.

**Relevant Context:**
- Botón eliminar → `src/pages/Cards.tsx:240-247`
- Modal existente (referencia de estilos) → `src/pages/Cards.tsx:257-530`
- `deleteCreditCard` en store → `src/hooks/useStore.ts:114-116`

---

## Implementation Order

Los sub-tasks están ordenados de menor a mayor complejidad. Cada uno es independiente
y puede implementarse, revisarse y aprobarse por separado antes de pasar al siguiente.

```
Sub-Task 1 → Sub-Task 2 → Sub-Task 3 → Sub-Task 4 → Sub-Task 5 → Sub-Task 6
(Gradientes)  (Débito fix)  (Barra UX)  (Fechas fmt)  (Preview)    (Confirmar)
```
