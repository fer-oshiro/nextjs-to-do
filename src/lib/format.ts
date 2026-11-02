/**
 * Fuso fixo: o card é renderizado no servidor (UTC na Vercel) e depois
 * hidratado no navegador. Sem um fuso explícito, as horas sairiam diferentes
 * nos dois lados e o React acusaria erro de hidratação.
 */
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}
