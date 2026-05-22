export const CASHEA_LEVELS: Record<number, number> = {
  1: 0.40,
  2: 0.50,
  3: 0.60,
};

export const CATEGORY_ICONS: Record<string, string> = {
  comida: '🍔',
  bebida: '🥤',
  transporte: '🚗',
  deudas: '💳',
  servicios: '💡',
  otros: '📦',
  salario: '💼',
  freelance: '💻',
  inversion: '📈',
  ahorro: '🐷',
};

export const SAVINGS_TIPS = [
  '💡 Ahorra al menos el 10% de tus ingresos cada mes.',
  '💡 Usa la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro.',
  '💡 Lleva un registro de todos tus gastos, por pequeños que sean.',
  '💡 Espera 24 horas antes de hacer una compra impulsiva.',
  '💡 Prepara café en casa en lugar de comprarlo fuera.',
  '💡 Revisa tus suscripciones y cancela las que no uses.',
  '💡 Congela tu tarjeta de crédito en apps de compras.',
  '💡 Usa efectivo para controlar mejor tus gastos.',
  '💡 Compra al por mayor productos no perecederos.',
  '💡 Lleva tu almuerzo al trabajo al menos 3 veces por semana.',
];

export const ABLY_CONFIG = {
  key: 'hj73nA.ZZRryw:cmLgtKT3ESGdxxRJdcLC8zCEybVG7eyGdccZmKtFPus',
  channelName: 'listamigo-chat',
};

export const LOCAL_STORAGE_KEYS = {
  marketLists: 'market_lists_v2',
  currentListId: 'currentListId',
  transactions: 'finance_transactions',
  savingsGoal: 'savings_goal',
  dollarRate: 'dollarRate',
  lastUpdate: 'lastUpdate',
  theme: 'theme',
  notificationPrefs: 'notification_prefs',
  debts: 'finance_debts',
  oldMarketProducts: 'market_products',
} as const;

export const BARCODE_PRODUCT_DB: Record<string, { name: string; price: number; unit: string }> = {
  '7591000110165': { name: 'Harina PAN (1kg)', price: 2.50, unit: '1kg' },
  '7591000110172': { name: 'Harina PAN (500g)', price: 1.50, unit: '500g' },
  '7591001001000': { name: 'Arroz Diana (1kg)', price: 1.20, unit: '1kg' },
  '7591002002002': { name: 'Azúcar Rio Turbio (1kg)', price: 1.00, unit: '1kg' },
  '7591003003003': { name: 'Aceite Maíz (1L)', price: 3.00, unit: '1L' },
  '7591004004004': { name: 'Leche Completa (1L)', price: 2.00, unit: '1L' },
  '7591005005005': { name: 'Café Madrid (250g)', price: 3.50, unit: '250g' },
  '7591006006006': { name: 'Pasta Diana (500g)', price: 0.90, unit: '500g' },
  '7591007007007': { name: 'Atún (lata)', price: 1.80, unit: 'lata' },
  '7591008008008': { name: 'Margarina Mavesa', price: 1.50, unit: '500g' },
  '7591009009009': { name: 'Queso Guayanés', price: 2.50, unit: '500g' },
  '7591010001010': { name: 'Carne Molida (1kg)', price: 5.00, unit: '1kg' },
  '7591011001111': { name: 'Pollo (1kg)', price: 3.50, unit: '1kg' },
  '7591012002121': { name: 'Huevos (cartón 30)', price: 4.00, unit: '30un' },
  '7591013003131': { name: 'Pan Bimbo (grande)', price: 2.50, unit: '1un' },
  '7591014004141': { name: 'Mantequilla (500g)', price: 2.00, unit: '500g' },
  '7591015005151': { name: 'Jabón en Polvo (1kg)', price: 2.80, unit: '1kg' },
  '7591016006161': { name: 'Cloro (1L)', price: 1.20, unit: '1L' },
  '7591017007171': { name: 'Papel Higiénico (4un)', price: 2.00, unit: '4un' },
  '7591018008181': { name: 'Coca Cola (2L)', price: 2.00, unit: '2L' },
  '7591019009191': { name: 'Cerveza Polar (6pk)', price: 4.50, unit: '6pk' },
  '7591020000202': { name: 'Ron Santa Teresa (1L)', price: 8.00, unit: '1L' },
  '7591021001212': { name: 'Agua Mineral (1.5L)', price: 0.80, unit: '1.5L' },
};
