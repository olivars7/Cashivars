export type TransactionType = 'income' | 'expense';
export type PaymentMedio = 'cash' | 'debit' | 'credit' | 'promise';

export interface Transaction {
  id: string;
  date: string;
  concept: string;
  category: string;
  type: TransactionType;
  amount: number;
  medio: PaymentMedio;
  cardId: string | null;
}

export interface SavingsGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  weeklyContribution: number;
  weeksLeft: number;
}

export interface Debt {
  id: string;
  creditor: string;
  amount: number;
  dueDate: string;
  priority: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  lastFour: string;
  balance: number;
  limit: number;
  cutDate: string;
  paymentDate: string;
  network: 'Visa' | 'Mastercard';
  type: 'credit' | 'debit';
  gradient: string;
}

// ─── Tarjetas — 2 débito: BBVA + NU ─────────────────────────────────────────
export const creditCards: CreditCard[] = [
  {
    id: 'bbva1',
    name: 'BBVA Débito',
    bank: 'BBVA',
    lastFour: '4412',
    balance: 8450,
    limit: 0,
    cutDate: '',
    paymentDate: '',
    network: 'Visa',
    type: 'debit',
    gradient: 'from-blue-700 to-blue-950',
  },
  {
    id: 'nu1',
    name: 'Nu Cuenta',
    bank: 'Nu',
    lastFour: '7823',
    balance: 3210,
    limit: 0,
    cutDate: '',
    paymentDate: '',
    network: 'Mastercard',
    type: 'debit',
    gradient: 'from-purple-700 to-purple-950',
  },
];

// ─── Transacciones — 5 por mes, Ene–Dic 2025 + Ene–Jun 2026 ─────────────────
// Combinaciones usadas: todas las (type × medio × cardId/null) más representativas
export const transactions: Transaction[] = [
  // ── Enero 2025 ──────────────────────────────────────────────────────────────
  { id: 'p2501a', date: '2025-01-03', concept: 'Salario Enero',           category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2501b', date: '2025-01-05', concept: 'Renta Enero',             category: 'Hogar',           type: 'expense', amount: 5500,  medio: 'promise', cardId: null },
  { id: 'p2501c', date: '2025-01-12', concept: 'Supermercado Walmart',    category: 'Alimentación',    type: 'expense', amount: 1340,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2501d', date: '2025-01-18', concept: 'Freelance Diseño',        category: 'Extra',           type: 'income',  amount: 2800,  medio: 'cash',    cardId: null },
  { id: 'p2501e', date: '2025-01-25', concept: 'Pago Luz CFE',            category: 'Servicios',       type: 'expense', amount: 680,   medio: 'debit',   cardId: 'bbva1' },

  // ── Febrero 2025 ─────────────────────────────────────────────────────────────
  { id: 'p2502a', date: '2025-02-03', concept: 'Salario Febrero',         category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2502b', date: '2025-02-07', concept: 'Cena San Valentín',       category: 'Alimentación',    type: 'expense', amount: 1100,  medio: 'cash',    cardId: null },
  { id: 'p2502c', date: '2025-02-12', concept: 'Pago Internet Telmex',    category: 'Servicios',       type: 'expense', amount: 499,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2502d', date: '2025-02-20', concept: 'Venta Ropa Usada',        category: 'Extra',           type: 'income',  amount: 650,   medio: 'promise', cardId: null },
  { id: 'p2502e', date: '2025-02-26', concept: 'Gimnasio Feb',            category: 'Salud',           type: 'expense', amount: 550,   medio: 'debit',   cardId: 'bbva1' },

  // ── Marzo 2025 ───────────────────────────────────────────────────────────────
  { id: 'p2503a', date: '2025-03-03', concept: 'Salario Marzo',           category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2503b', date: '2025-03-08', concept: 'Taller Mecánico',         category: 'Transporte',      type: 'expense', amount: 1800,  medio: 'cash',    cardId: null },
  { id: 'p2503c', date: '2025-03-14', concept: 'Curso Online Platzi',     category: 'Educación',       type: 'expense', amount: 599,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2503d', date: '2025-03-20', concept: 'Bono Proyecto Empresa',   category: 'Trabajo',         type: 'income',  amount: 4000,  medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2503e', date: '2025-03-28', concept: 'Super Chedraui',          category: 'Alimentación',    type: 'expense', amount: 1420,  medio: 'debit',   cardId: 'nu1' },

  // ── Abril 2025 ───────────────────────────────────────────────────────────────
  { id: 'p2504a', date: '2025-04-02', concept: 'Salario Abril',           category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2504b', date: '2025-04-08', concept: 'Gasolina Viaje Pascua',   category: 'Transporte',      type: 'expense', amount: 1100,  medio: 'cash',    cardId: null },
  { id: 'p2504c', date: '2025-04-14', concept: 'Ropa Temporada',          category: 'Ropa',            type: 'expense', amount: 1780,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2504d', date: '2025-04-19', concept: 'Devolución Amazon',       category: 'Extra',           type: 'income',  amount: 380,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2504e', date: '2025-04-26', concept: 'Pago Telcel',             category: 'Servicios',       type: 'expense', amount: 399,   medio: 'debit',   cardId: 'bbva1' },

  // ── Mayo 2025 ────────────────────────────────────────────────────────────────
  { id: 'p2505a', date: '2025-05-02', concept: 'Salario Mayo',            category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2505b', date: '2025-05-07', concept: 'Consulta Médica',         category: 'Salud',           type: 'expense', amount: 700,   medio: 'cash',    cardId: null },
  { id: 'p2505c', date: '2025-05-13', concept: 'Netflix + Spotify',       category: 'Entretenimiento', type: 'expense', amount: 430,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2505d', date: '2025-05-21', concept: 'Cobro Deuda Amigo',       category: 'Extra',           type: 'income',  amount: 1200,  medio: 'promise', cardId: null },
  { id: 'p2505e', date: '2025-05-28', concept: 'Plomero Reparación',      category: 'Hogar',           type: 'expense', amount: 850,   medio: 'cash',    cardId: null },

  // ── Junio 2025 ───────────────────────────────────────────────────────────────
  { id: 'p2506a', date: '2025-06-02', concept: 'Salario Junio',           category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2506b', date: '2025-06-09', concept: 'Almuerzo Familiar',       category: 'Alimentación',    type: 'expense', amount: 1350,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2506c', date: '2025-06-15', concept: 'Seguro Auto Semestral',   category: 'Transporte',      type: 'expense', amount: 2400,  medio: 'cash',    cardId: null },
  { id: 'p2506d', date: '2025-06-20', concept: 'Ingreso Cuarto Renta',    category: 'Extra',           type: 'income',  amount: 2000,  medio: 'cash',    cardId: null },
  { id: 'p2506e', date: '2025-06-27', concept: 'Vitaminas Suplementos',   category: 'Salud',           type: 'expense', amount: 480,   medio: 'debit',   cardId: 'bbva1' },

  // ── Julio 2025 ───────────────────────────────────────────────────────────────
  { id: 'p2507a', date: '2025-07-01', concept: 'Salario Julio',           category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2507b', date: '2025-07-07', concept: 'Cine + Cena',             category: 'Entretenimiento', type: 'expense', amount: 760,   medio: 'cash',    cardId: null },
  { id: 'p2507c', date: '2025-07-14', concept: 'Supermercado Soriana',    category: 'Alimentación',    type: 'expense', amount: 1100,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2507d', date: '2025-07-20', concept: 'Quincena Extra',          category: 'Trabajo',         type: 'income',  amount: 4500,  medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2507e', date: '2025-07-28', concept: 'Predial Anual',           category: 'Hogar',           type: 'expense', amount: 1900,  medio: 'promise', cardId: null },

  // ── Agosto 2025 ──────────────────────────────────────────────────────────────
  { id: 'p2508a', date: '2025-08-04', concept: 'Salario Agosto',          category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2508b', date: '2025-08-09', concept: 'Utiles Escolares',        category: 'Educación',       type: 'expense', amount: 920,   medio: 'cash',    cardId: null },
  { id: 'p2508c', date: '2025-08-16', concept: 'Rappi Súper',             category: 'Alimentación',    type: 'expense', amount: 550,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2508d', date: '2025-08-22', concept: 'Freelance Video Edición', category: 'Extra',           type: 'income',  amount: 3500,  medio: 'cash',    cardId: null },
  { id: 'p2508e', date: '2025-08-29', concept: 'Corte Cabello + Barba',   category: 'Personal',        type: 'expense', amount: 200,   medio: 'cash',    cardId: null },

  // ── Septiembre 2025 ──────────────────────────────────────────────────────────
  { id: 'p2509a', date: '2025-09-01', concept: 'Salario Septiembre',      category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2509b', date: '2025-09-08', concept: 'Gasolina Septiembre',     category: 'Transporte',      type: 'expense', amount: 900,   medio: 'cash',    cardId: null },
  { id: 'p2509c', date: '2025-09-15', concept: 'Suscripción Disney+',     category: 'Entretenimiento', type: 'expense', amount: 179,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2509d', date: '2025-09-21', concept: 'Venta Electrónico FB',    category: 'Extra',           type: 'income',  amount: 1500,  medio: 'cash',    cardId: null },
  { id: 'p2509e', date: '2025-09-27', concept: 'Dentista Revisión',       category: 'Salud',           type: 'expense', amount: 800,   medio: 'promise', cardId: null },

  // ── Octubre 2025 ─────────────────────────────────────────────────────────────
  { id: 'p2510a', date: '2025-10-01', concept: 'Salario Octubre',         category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2510b', date: '2025-10-10', concept: 'Halloween Disfraz',       category: 'Personal',        type: 'expense', amount: 450,   medio: 'cash',    cardId: null },
  { id: 'p2510c', date: '2025-10-17', concept: 'Super Walmart Oct',       category: 'Alimentación',    type: 'expense', amount: 1280,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2510d', date: '2025-10-22', concept: 'Bono Productividad',      category: 'Trabajo',         type: 'income',  amount: 3000,  medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2510e', date: '2025-10-29', concept: 'Gas LP Cilindro',         category: 'Hogar',           type: 'expense', amount: 350,   medio: 'cash',    cardId: null },

  // ── Noviembre 2025 ───────────────────────────────────────────────────────────
  { id: 'p2511a', date: '2025-11-03', concept: 'Salario Noviembre',       category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2511b', date: '2025-11-11', concept: 'Buen Fin Compras',        category: 'Ropa',            type: 'expense', amount: 2600,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2511c', date: '2025-11-18', concept: 'Pago Predial',            category: 'Hogar',           type: 'expense', amount: 1100,  medio: 'promise', cardId: null },
  { id: 'p2511d', date: '2025-11-23', concept: 'Ingreso Cuarto Nov',      category: 'Extra',           type: 'income',  amount: 2000,  medio: 'cash',    cardId: null },
  { id: 'p2511e', date: '2025-11-29', concept: 'Cena Restaurante',        category: 'Alimentación',    type: 'expense', amount: 980,   medio: 'cash',    cardId: null },

  // ── Diciembre 2025 ───────────────────────────────────────────────────────────
  { id: 'p2512a', date: '2025-12-01', concept: 'Salario Diciembre',       category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2512b', date: '2025-12-08', concept: 'Regalos Navidad',         category: 'Personal',        type: 'expense', amount: 3200,  medio: 'cash',    cardId: null },
  { id: 'p2512c', date: '2025-12-15', concept: 'Aguinaldo Empresa',       category: 'Trabajo',         type: 'income',  amount: 18500, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2512d', date: '2025-12-21', concept: 'Cena Nochebuena',         category: 'Alimentación',    type: 'expense', amount: 1800,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2512e', date: '2025-12-28', concept: 'Gasolina Viaje Año Nuevo',category: 'Transporte',      type: 'expense', amount: 1200,  medio: 'cash',    cardId: null },

  // ── Enero 2026 ───────────────────────────────────────────────────────────────
  { id: 'p2601a', date: '2026-01-05', concept: 'Salario Enero 2026',      category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2601b', date: '2026-01-09', concept: 'Renta Enero 2026',        category: 'Hogar',           type: 'expense', amount: 5800,  medio: 'promise', cardId: null },
  { id: 'p2601c', date: '2026-01-15', concept: 'Supermercado Ene 26',     category: 'Alimentación',    type: 'expense', amount: 1450,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2601d', date: '2026-01-22', concept: 'Freelance App Móvil',     category: 'Extra',           type: 'income',  amount: 5000,  medio: 'cash',    cardId: null },
  { id: 'p2601e', date: '2026-01-28', concept: 'Seguro Gastos Médicos',   category: 'Salud',           type: 'expense', amount: 1200,  medio: 'debit',   cardId: 'bbva1' },

  // ── Febrero 2026 ─────────────────────────────────────────────────────────────
  { id: 'p2602a', date: '2026-02-03', concept: 'Salario Feb 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2602b', date: '2026-02-10', concept: 'Pago Internet Feb 26',    category: 'Servicios',       type: 'expense', amount: 549,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2602c', date: '2026-02-14', concept: 'Cena San Valentín 26',    category: 'Alimentación',    type: 'expense', amount: 1250,  medio: 'cash',    cardId: null },
  { id: 'p2602d', date: '2026-02-20', concept: 'Ingreso Cuarto Feb 26',   category: 'Extra',           type: 'income',  amount: 2000,  medio: 'cash',    cardId: null },
  { id: 'p2602e', date: '2026-02-26', concept: 'Ropa Temporada Feb 26',   category: 'Ropa',            type: 'expense', amount: 1900,  medio: 'debit',   cardId: 'nu1' },

  // ── Marzo 2026 ───────────────────────────────────────────────────────────────
  { id: 'p2603a', date: '2026-03-02', concept: 'Salario Mar 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2603b', date: '2026-03-07', concept: 'Taller Mecánico Mar 26',  category: 'Transporte',      type: 'expense', amount: 2100,  medio: 'cash',    cardId: null },
  { id: 'p2603c', date: '2026-03-14', concept: 'Curso React Avanzado',    category: 'Educación',       type: 'expense', amount: 899,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2603d', date: '2026-03-20', concept: 'Bono Q1 Empresa',         category: 'Trabajo',         type: 'income',  amount: 5000,  medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2603e', date: '2026-03-28', concept: 'Cena Familiar Mar 26',    category: 'Alimentación',    type: 'expense', amount: 1600,  medio: 'cash',    cardId: null },

  // ── Abril 2026 ───────────────────────────────────────────────────────────────
  { id: 'p2604a', date: '2026-04-01', concept: 'Salario Abr 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2604b', date: '2026-04-08', concept: 'Gasolina Abr 26',         category: 'Transporte',      type: 'expense', amount: 1050,  medio: 'cash',    cardId: null },
  { id: 'p2604c', date: '2026-04-15', concept: 'Netflix + Disney Abr 26', category: 'Entretenimiento', type: 'expense', amount: 520,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2604d', date: '2026-04-21', concept: 'Venta Celular Usado',     category: 'Extra',           type: 'income',  amount: 3200,  medio: 'promise', cardId: null },
  { id: 'p2604e', date: '2026-04-28', concept: 'Pago Predial Abr 26',     category: 'Hogar',           type: 'expense', amount: 1100,  medio: 'promise', cardId: null },

  // ── Mayo 2026 ────────────────────────────────────────────────────────────────
  { id: 'p2605a', date: '2026-05-04', concept: 'Salario May 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2605b', date: '2026-05-10', concept: 'Vitaminas May 26',        category: 'Salud',           type: 'expense', amount: 520,   medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2605c', date: '2026-05-16', concept: 'Super Soriana May 26',    category: 'Alimentación',    type: 'expense', amount: 1380,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2605d', date: '2026-05-22', concept: 'Cobro Deuda Colega',      category: 'Extra',           type: 'income',  amount: 900,   medio: 'cash',    cardId: null },
  { id: 'p2605e', date: '2026-05-29', concept: 'Plomero May 26',          category: 'Hogar',           type: 'expense', amount: 600,   medio: 'cash',    cardId: null },

  // ── Junio 2026 ───────────────────────────────────────────────────────────────
  { id: 'p2606a', date: '2026-06-01', concept: 'Salario Jun 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2606b', date: '2026-06-09', concept: 'Seguro Auto Jun 26',      category: 'Transporte',      type: 'expense', amount: 2600,  medio: 'cash',    cardId: null },
  { id: 'p2606c', date: '2026-06-16', concept: 'Cine + Museo Jun 26',     category: 'Entretenimiento', type: 'expense', amount: 480,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2606d', date: '2026-06-22', concept: 'Freelance Dashboard',     category: 'Extra',           type: 'income',  amount: 6500,  medio: 'cash',    cardId: null },
  { id: 'p2606e', date: '2026-06-29', concept: 'Pago Telcel Jun 26',      category: 'Servicios',       type: 'expense', amount: 449,   medio: 'debit',   cardId: 'bbva1' },

  // ── Julio 2026 ───────────────────────────────────────────────────────────────
  { id: 'p2607a', date: '2026-07-01', concept: 'Salario Jul 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2607b', date: '2026-07-08', concept: 'Renta Jul 2026',          category: 'Hogar',           type: 'expense', amount: 5800,  medio: 'promise', cardId: null },
  { id: 'p2607c', date: '2026-07-14', concept: 'Super Chedraui Jul 26',   category: 'Alimentación',    type: 'expense', amount: 1320,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2607d', date: '2026-07-21', concept: 'Ingreso Cuarto Jul 26',   category: 'Extra',           type: 'income',  amount: 2000,  medio: 'cash',    cardId: null },
  { id: 'p2607e', date: '2026-07-27', concept: 'Gasolina Jul 26',         category: 'Transporte',      type: 'expense', amount: 950,   medio: 'cash',    cardId: null },

  // ── Agosto 2026 ──────────────────────────────────────────────────────────────
  { id: 'p2608a', date: '2026-08-03', concept: 'Salario Ago 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2608b', date: '2026-08-10', concept: 'Útiles Escolares Ago 26', category: 'Educación',       type: 'expense', amount: 1100,  medio: 'cash',    cardId: null },
  { id: 'p2608c', date: '2026-08-17', concept: 'Netflix + Max Ago 26',    category: 'Entretenimiento', type: 'expense', amount: 560,   medio: 'debit',   cardId: 'nu1' },
  { id: 'p2608d', date: '2026-08-23', concept: 'Freelance Branding',      category: 'Extra',           type: 'income',  amount: 4200,  medio: 'cash',    cardId: null },
  { id: 'p2608e', date: '2026-08-29', concept: 'Dentista Ago 26',         category: 'Salud',           type: 'expense', amount: 950,   medio: 'debit',   cardId: 'bbva1' },

  // ── Septiembre 2026 ──────────────────────────────────────────────────────────
  { id: 'p2609a', date: '2026-09-01', concept: 'Salario Sep 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2609b', date: '2026-09-07', concept: 'Ropa Temporada Sep 26',   category: 'Ropa',            type: 'expense', amount: 2100,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2609c', date: '2026-09-14', concept: 'Pago Internet Sep 26',    category: 'Servicios',       type: 'expense', amount: 549,   medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2609d', date: '2026-09-20', concept: 'Venta Bicicleta',         category: 'Extra',           type: 'income',  amount: 3800,  medio: 'promise', cardId: null },
  { id: 'p2609e', date: '2026-09-26', concept: 'Taller Mecánico Sep 26',  category: 'Transporte',      type: 'expense', amount: 1750,  medio: 'cash',    cardId: null },

  // ── Octubre 2026 ─────────────────────────────────────────────────────────────
  { id: 'p2610a', date: '2026-10-01', concept: 'Salario Oct 2026',        category: 'Trabajo',         type: 'income',  amount: 20000, medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2610b', date: '2026-10-09', concept: 'Halloween Disfraz 26',    category: 'Personal',        type: 'expense', amount: 520,   medio: 'cash',    cardId: null },
  { id: 'p2610c', date: '2026-10-15', concept: 'Super Walmart Oct 26',    category: 'Alimentación',    type: 'expense', amount: 1390,  medio: 'debit',   cardId: 'nu1' },
  { id: 'p2610d', date: '2026-10-22', concept: 'Bono Q3 Empresa',         category: 'Trabajo',         type: 'income',  amount: 5000,  medio: 'debit',   cardId: 'bbva1' },
  { id: 'p2610e', date: '2026-10-28', concept: 'Gas LP Oct 26',           category: 'Hogar',           type: 'expense', amount: 380,   medio: 'cash',    cardId: null },
];

export const totalIncome = transactions
  .filter((t) => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

export const totalExpenses = transactions
  .filter((t) => t.type === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);

export const balance = totalIncome - totalExpenses;

// ─── Ahorros ─────────────────────────────────────────────────────────────────
export const savingsGoals: SavingsGoal[] = [
  { id: 'sv1', title: 'Fondo de Emergencia',   current: 12000, target: 30000, weeklyContribution: 500,  weeksLeft: 36 },
  { id: 'sv2', title: 'Viaje a Europa',         current: 8500,  target: 40000, weeklyContribution: 800,  weeksLeft: 39 },
  { id: 'sv3', title: 'MacBook Pro',            current: 18000, target: 25000, weeklyContribution: 700,  weeksLeft: 10 },
  { id: 'sv4', title: 'Enganche Departamento',  current: 35000, target: 80000, weeklyContribution: 1500, weeksLeft: 30 },
];

// ─── Deudas ──────────────────────────────────────────────────────────────────
export const debts: Debt[] = [
  { id: 'db1', creditor: 'Mamá',           amount: 1200,  dueDate: '2026-08-01', priority: true },
  { id: 'db2', creditor: 'Carlos (amigo)', amount: 2500,  dueDate: '2026-08-20', priority: false },
  { id: 'db3', creditor: 'Banco BBVA',     amount: 15000, dueDate: '2026-09-15', priority: false },
  { id: 'db4', creditor: 'INFONAVIT',      amount: 48000, dueDate: '2027-01-01', priority: false },
  { id: 'db5', creditor: 'Préstamo Auto',  amount: 32000, dueDate: '2027-06-01', priority: true },
];

// ─── Analytics helpers (derivados — solo para Analytics.tsx si los necesita estático) ──
export const categoryExpenses = [
  { name: 'Alimentación', value: 0 },
];

export const monthlyComparison = [
  { month: '', income: 0, expenses: 0 },
];
