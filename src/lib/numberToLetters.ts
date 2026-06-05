import { toCardinal } from "n2words/fr-FR";

export function amountToFrench(amount: number): string {
  if (isNaN(amount) || amount < 0) return "";

  const dirhams = Math.floor(amount);
  const centimes = Math.round((amount - dirhams) * 100);

  let result = "";

  if (dirhams > 0) {
    result += toCardinal(dirhams);
    result += (dirhams > 1) ? " dirhams" : " dirham";
  } else {
    result += "zéro dirham";
  }

  if (centimes > 0) {
    result += " et ";
    result += toCardinal(centimes);
    result += (centimes > 1) ? " centimes" : " centime";
  }

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}
