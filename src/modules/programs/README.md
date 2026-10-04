# programs — программы тренировок

- `queries.ts` — `useCatalog`, `useExerciseCatalog` (каталог упражнений: сутки и в кэше на
  устройстве, предзагрузка — `exerciseCatalogQueryOptions`), `useProgram`, `useUserPrograms`, `useAddUserProgram`, `useRemoveUserProgram`, `useReactions`, `useCachedProgram`; ключи — `programKeys`
- `models/` — программа, неделя, тренировка, упражнение; упражнение каталога; реакции
- `helpers/formatProgramSubtitle` — «В зале. 3 раза в неделю»
- `components/ProgramCard` — карточка программы в каталоге
- `components/ProgramPreviewCard` — обложка во всю ширину (закреплённая в каталоге, шапка страницы программы);
  с `scrollY` — параллакс: фото едет медленнее и растягивается при оттягивании, текст гаснет;
  затемнение под статус-бар (`topShadeHeight`) живёт в слое фото
- `components/ProgramReactions` — счётчики реакций на программу
