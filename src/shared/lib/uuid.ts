// RFC4122 v4 на Math.random: crypto.getRandomValues в Hermes нет, а
// expo-crypto — нативный модуль, ради него пришлось бы пересобирать клиент.
// Для clientId/opId (уникальность в пределах одного пользователя) достаточно.
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
