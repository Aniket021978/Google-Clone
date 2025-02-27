export const trim = (value) => value.trim();

export const upperCase = (value) => value.toUpperCase();

export const lowerCase = (value) => value.toLowerCase();

export const removeDuplicates = (data) => {
  return [...new Set(data.flat())];
};

export const findAndReplace = (data, findValue, replaceValue) => {
  return data.map((row) =>
    row.map((cell) => (cell === findValue ? replaceValue : cell))
  );
};
