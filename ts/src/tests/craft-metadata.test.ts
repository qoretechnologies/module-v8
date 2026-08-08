/*
  Copyright (C) 2026 Qore Technologies, s.r.o., all rights reserved
*/

import CraftAppEn from '../i18n/en/apps/Craft';

describe('Craft application metadata', () => {
  it('uses headings as Markdown rather than indenting the whole description as code', () => {
    expect(CraftAppEn.longDesc).toContain('\n## API Configuration Requirements\n');
    expect(CraftAppEn.longDesc).not.toMatch(/\n\s{4}## API Configuration Requirements/);
    expect(CraftAppEn.longDesc.trimStart()).toBe(CraftAppEn.longDesc);
  });
});
