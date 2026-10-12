# Plan: Transacciones Mejoradas + Gestión de Tarjetas

## Top-Level Overview

Expandir el sistema de transacciones con dos campos nuevos (`medio` y `cardId`), eliminar la columna "Tipo" de la tabla (el tipo se sigue guardando y se comunica visualmente con el color del monto), añadir una columna "Medio" que muestre el medio y la tarjeta asociada, expandir el modelo `CreditCard` con campos adicionales relevantes, crear una nueva página dedicada "Tarjetas" para gestión CRUD de tarjetas, y mover la sección de tarjetas fuera de `Debts.tsx`.

Todo el estado ya se persiste automáticamente en localStorage vía `useEffect` en `useStoreState` — no se necesita nueva lógica de persistencia, solo actualizar los tipos y el seed data.

---

## Sub-Task 1: Expandir los tipos en `mockData.ts`

**Status**: `[ ] pending`

**Intent**:
Actualizar los tipos `Transaction` y `CreditCard` para incluir los nuevos campos, y actualizar el seed data para que el compilador TypeScript no rompa en el resto de archivos.

**Expected Outcomes**:
- `Transaction` incluye `medio: PaymentMedio` y `cardId: string | null`
- `CreditCard` incluye `type: 'credit' | 'debit'`, `bank: string`, `paymentDate: string`; el campo `gradient` se puede mantener o reemplazar por `color: string`
- El seed data de transacciones tiene valores de `medio` y `cardId` coherentes
- El seed data de credit cards tiene los campos nuevos con valores reales

**Todo List**:
1. Definir y exportar el tipo `PaymentMedio = 'cash' | 'debit' | 'credit' | 'promise'`
2. Agregar `medio: PaymentMedio` y `cardId: string | null` a la interfaz `Transaction`
3. Agregar `type: 'credit' | 'debit'`, `bank: string`, `paymentDate: string` a `CreditCard`
4. Actualizar las 8 transacciones del seed data con valores de `medio` y `cardId` apropiados
5. Actualizar las 2 credit cards del seed data con los campos nuevos (banco, fecha de pago, tipo)

**Relevant Context**:
- `src/mocks/mockData.ts` — único archivo a modificar en este sub-task
- Los seed data de transacciones son: Salario (income), Renta (expense), Walmart (expense), Netflix/Spotify (expense), Freelance (income), Gasolina (expense), Gimnasio (expense), Cena (expense)
- Valores sugeridos para `medio` en el seed: Salario → `cash`, Renta → `promise`, Walmart → `debit`, Netflix → `credit` (BBVA Azul id:'1'), Freelance → `cash`, Gasolina → `debit`, Gimnasio → `cash`, Cena → `credit` (Citibanamex id:'2')

---

## Sub-Task 2: Actualizar `Transactions.tsx` — tabla y formulario

**Status**: `[ ] pending`

**Intent**:
Eliminar la columna "Tipo" de la tabla, agregar la columna "Medio" que muestra `Medio · Nombre de Tarjeta` si aplica, y actualizar el formulario modal para incluir los campos `medio` y `cardId`.

**Expected Outcomes**:
- La tabla tiene 5 columnas: Fecha, Concepto, Categoría, Medio, Monto, Acciones (la columna Tipo desaparece; el Tipo solo determina el color del monto)
- La columna "Medio" muestra un badge con el label del medio (Efectivo / Débito / Crédito / Promesa) y si tiene tarjeta, el nombre de la tarjeta después (ej: "Crédito · BBVA Azul")
- El formulario modal incluye un select de `medio` y un select de `cardId` que aparece solo cuando `medio` es `'credit'` o `'debit'`; el select de tarjeta se llena desde `creditCards` del store
- Si no hay tarjetas y se selecciona crédito/débito, el select muestra "Sin tarjetas registradas" y queda deshabilitado
- El campo `colSpan` del empty-state pasa de 6 a 6 (mismo count, solo cambia qué columnas son)
- El `EMPTY_FORM` incluye `medio: 'cash'` y `cardId: null`
- La lógica del filtro de tipo (Ingresos / Gastos) se mantiene igual

**Todo List**:
1. Agregar `medio` y `cardId` al `EMPTY_FORM`
2. Importar `PaymentMedio` y `CreditCard` desde `mockData`
3. Importar `creditCards` desde el store (`useStore`)
4. En el `openEdit`, mapear `t.medio` y `t.cardId` al formulario
5. En `handleSubmit`, incluir `medio` y `cardId` en el payload
6. Eliminar la columna `<th>Tipo</th>` del encabezado de la tabla
7. Eliminar la celda `<td>` con el badge de tipo en cada fila
8. Agregar columna `<th>Medio</th>` con badge visual (antes de Monto)
9. En el modal, agregar el select de `medio` con las 4 opciones
10. Agregar el select condicional de `cardId` (visible solo cuando `medio === 'credit' || medio === 'debit'`)

**Relevant Context**:
- `src/pages/Transactions.tsx` — único archivo a modificar
- El store ya expone `creditCards` vía `useStore`
- El badge de Medio puede seguir el estilo de los otros badges (rounded-full, colores por tipo):
  - `cash` → gris
  - `debit` → azul
  - `credit` → púrpura
  - `promise` → naranja

---

## Sub-Task 3: Expandir `useStore.ts` y `storage.ts` para nuevos campos de `CreditCard`

**Status**: `[ ] pending`

**Intent**:
Asegurar que los nuevos campos de `CreditCard` sean correctamente manejados en el store y que la clave de storage ya exista (ya existe `CREDIT_CARDS`). No se necesita nueva lógica, pero confirmar que `addCreditCard` y `editCreditCard` aceptan los campos nuevos.

**Expected Outcomes**:
- El store acepta y persiste los nuevos campos de `CreditCard` sin cambios adicionales (ya usa `Omit<CreditCard, 'id'>` que soporta cualquier campo del tipo)
- No es necesario agregar nuevas claves en `storage.ts` — `cashivars_credit_cards` ya existe

**Todo List**:
1. Verificar que `Omit<CreditCard, 'id'>` en `addCreditCard` y `editCreditCard` ya acepta los campos nuevos (esto sucede automáticamente al actualizar la interfaz)
2. No se requieren cambios en `useStore.ts` ni `storage.ts`

**Relevant Context**:
- `src/hooks/useStore.ts` líneas 87-97 — métodos de CreditCard
- `src/services/storage.ts` — la clave `CREDIT_CARDS` ya existe
- Este sub-task es principalmente de verificación, no de implementación

---

## Sub-Task 4: Crear la página `Cards.tsx` — gestión CRUD de tarjetas

**Status**: `[ ] pending`

**Intent**:
Crear una nueva página dedicada para ver, agregar, editar y eliminar tarjetas. Cada tarjeta mostrará todos sus datos (banco, nombre, últimos 4 dígitos, tipo crédito/débito, límite/balance, fecha de corte, fecha de pago). Habrá un botón de añadir y acciones de editar/eliminar por tarjeta.

**Expected Outcomes**:
- Página con grid de tarjetas, una por card
- Cada tarjeta muestra: nombre, banco, red (Visa/Mastercard), tipo (Crédito/Débito), últimos 4 dígitos, balance actual, límite, fecha de corte, fecha de pago
- Botón "Añadir Tarjeta" abre modal con formulario
- Formulario tiene: nombre, banco, últimos 4 dígitos, red (Visa/Mastercard), tipo (crédito/débito), límite, balance, fecha de corte, fecha de pago, color/gradient
- Botones de editar y eliminar por cada tarjeta
- Estado vacío si no hay tarjetas registradas
- Acciones del store: `addCreditCard`, `editCreditCard`, `deleteCreditCard`

**Todo List**:
1. Crear `src/pages/Cards.tsx`
2. Implementar grid de tarjetas con diseño visual (similar al de Debts.tsx pero CRUD completo)
3. Implementar modal de formulario (add/edit) con todos los campos de `CreditCard`
4. Usar `addCreditCard`, `editCreditCard`, `deleteCreditCard` del store
5. Manejar estado vacío

**Relevant Context**:
- `src/pages/Debts.tsx` líneas 15-54 — inspiración para el diseño visual de las tarjetas
- `src/mocks/mockData.ts` interfaz `CreditCard` — todos los campos a incluir en el formulario
- El formulario de `Transactions.tsx` es el patrón de modal a seguir

---

## Sub-Task 5: Registrar la ruta `/cards` y actualizar la navegación

**Status**: `[ ] pending`

**Intent**:
Agregar la nueva página `Cards` al router de la app y a los menús de navegación (sidebar desktop + topbar mobile), y quitar la sección de tarjetas de `Debts.tsx` para que solo muestre la lista de deudas snowball.

**Expected Outcomes**:
- Ruta `/cards` funciona y renderiza `Cards.tsx`
- El sidebar y topbar mobile tienen un nuevo enlace "Tarjetas" con ícono apropiado (ej: `CreditCard` de lucide-react)
- `Debts.tsx` ya no muestra el bloque de tarjetas de crédito; solo muestra la lista de deudas
- La navegación completa queda: Dashboard, Transacciones, Tarjetas, Analíticas, Ahorros, Deudas

**Todo List**:
1. En `src/App.tsx`, importar `Cards` y agregar `<Route path="cards" element={<Cards />} />`
2. En `src/components/Sidebar.tsx`, agregar NavLink a `/cards` con ícono `CreditCard`
3. En `src/components/TopbarMobile.tsx`, agregar NavLink a `/cards` con ícono `CreditCard`
4. En `src/pages/Debts.tsx`, eliminar el bloque JSX de tarjetas de crédito (el `map` de `creditCards`) y el título "Tarjetas de Crédito"

**Relevant Context**:
- `src/App.tsx` — patrón de rutas existente
- `src/components/Sidebar.tsx` — lista de NavLinks existente
- `src/components/TopbarMobile.tsx` — lista de NavLinks existente
- `src/pages/Debts.tsx` — bloque de tarjetas a eliminar
