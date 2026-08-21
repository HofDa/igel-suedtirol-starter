import {describe, expect, it} from 'vitest';
import {isMunicipalityId, southTyrolMunicipalities} from './south-tyrol-municipalities';

describe('official South Tyrol municipalities', () => {
  it('contains the 116 unique official municipalities in both languages', () => {
    expect(southTyrolMunicipalities).toHaveLength(116);
    expect(new Set(southTyrolMunicipalities.map((entry) => entry.id)).size).toBe(116);
    expect(southTyrolMunicipalities.every((entry) => entry.de && entry.it)).toBe(true);
  });

  it('rejects invented municipality identifiers', () => {
    expect(isMunicipalityId('bozen')).toBe(true);
    expect(isMunicipalityId('invented-place')).toBe(false);
  });
});
