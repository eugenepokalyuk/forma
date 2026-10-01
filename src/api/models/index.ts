// Типы отражают camelCase-ответы Django (djangorestframework-camel-case).
// id программ/тренировок/сессий — 8-символьный short_id (строка).
// id упражнения — UUID (именно его шлём в логи подходов).

export * from './user';
export * from './program';
export * from './session';
export * from './social';
export * from './bro';
export * from './stats';
export * from './water';
export * from './achievement';
export * from './reaction';
export * from './error';
