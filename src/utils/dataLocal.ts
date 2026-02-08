/**
 * Retorna a data local no formato YYYY-MM-DD.
 * Usa getFullYear/getMonth/getDate para evitar o problema de
 * toISOString() que converte para UTC e pode retornar o dia errado
 * em fusos negativos como o Brasil (UTC-3).
 */
export const dataLocalFormatada = (date?: Date): string => {
  const d = date ?? new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
