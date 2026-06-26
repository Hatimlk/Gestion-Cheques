import { toCardinal } from "n2words/fr-FR";

export function amountToFrench(amount: number): string {
  if (isNaN(amount) || amount < 0) return "";

  const dirhams = Math.floor(amount);
  const centimes = Math.round((amount - dirhams) * 100);

  let result = "";

  if (dirhams > 0) {
    result += toCardinal(dirhams);
    result += " DHs";
  } else {
    result += "zéro DHs";
  }

  if (centimes > 0) {
    result += " et ";
    result += String(centimes).padStart(2, '0');
    result += " Cts";
  } else {
    result += " et 00 Cts";
  }

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}
