/**
 * Compara dos fechas y determina si son el mismo día.
 * @param date1 La primera fecha a comparar.
 * @param date2 La segunda fecha a comparar.
 * @returns Verdadero si las fechas son el mismo día, falso en caso contrario.
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toISOString().slice(0, 10) === date2.toISOString().slice(0, 10);
}