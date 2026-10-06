import { filterProgramsByGender } from '../helpers/filterProgramsByGender';

describe('filterProgramsByGender', () => {
  const men = { id: 'men', forMen: true, forWomen: false };
  const women = { id: 'women', forMen: false, forWomen: true };
  const both = { id: 'both', forMen: true, forWomen: true };
  const none = { id: 'none', forMen: false, forWomen: false };
  const programs = [men, women, both, none];

  it('«Мужская» — программы с опцией «Мужская», в том числе с обеими', () => {
    expect(filterProgramsByGender(programs, 'men')).toEqual([men, both]);
  });

  it('«Женская» — программы с опцией «Женская», в том числе с обеими', () => {
    expect(filterProgramsByGender(programs, 'women')).toEqual([women, both]);
  });
});
