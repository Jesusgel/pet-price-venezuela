/**
 * Formatea un número al estándar monetario venezolano: Bs. 1.234,56
 * (punto para separar miles, coma para separar decimales con 2 dígitos)
 */
export function formatBs(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Bs. 0,00';
  }
  const num = Number(amount);
  const [intPart, decPart = '00'] = num.toFixed(2).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Bs. ${formattedInt},${decPart}`;
}

/**
 * Retorna solo el valor numérico formateado en estilo venezolano (sin el prefijo "Bs.")
 * Útil para layouts donde el prefijo "Bs." tiene un estilo o tamaño tipográfico separado.
 */
export function formatBsNumber(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0,00';
  }
  const num = Number(amount);
  const [intPart, decPart = '00'] = num.toFixed(2).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedInt},${decPart}`;
}

/**
 * Formatea un número a moneda USD: $1,234.56
 */
export function formatUSD(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '$0.00';
  }
  const num = Number(amount);
  const [intPart, decPart = '00'] = num.toFixed(2).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${formattedInt}.${decPart}`;
}
