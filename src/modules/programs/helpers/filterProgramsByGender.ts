import type { CatalogGender, Program } from '../models/program';

// Программы вкладки каталога: «Мужская» — с опцией forMen, «Женская» — с
// forWomen; программа с обеими опциями попадает в обе вкладки.
export function filterProgramsByGender<
  T extends Pick<Program, 'forMen' | 'forWomen'>,
>(programs: T[], gender: CatalogGender): T[] {
  return programs.filter((p) => (gender === 'men' ? p.forMen : p.forWomen));
}
