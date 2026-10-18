/** Returns the letters of a 1-based column number: 1 is A, 26 is Z, and 27 is AA */
export const toColumnLetter = (column: number): string => {
  let temp: number;
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }

  return letter;
};

/** Returns a sheet title quoted for A1 notation, as the API requires for titles with spaces or punctuation */
export const quoteSheetTitle = (title: string): string => `'${title.replace(/'/g, "''")}'`;
