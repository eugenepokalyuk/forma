export function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// «214 156» вместо «214156» — разряды через узкий пробел, как принято в ru-RU.
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}

// Малые нагрузки — в кг, крупные — в тоннах: 850 → «850 кг», 12540 → «12,5 т».
export function formatTonnage(kg: number): string {
  if (kg >= 1000) {
    const tonnes = kg / 1000;
    const text =
      tonnes >= 100 ? Math.round(tonnes).toString() : tonnes.toFixed(1);
    return `${text.replace('.', ',')} т`;
  }
  return `${formatNumber(kg)} кг`;
}
