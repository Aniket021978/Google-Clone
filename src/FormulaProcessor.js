export const evaluateFormula = (formula, data) => {
  try {
    if (!formula.startsWith("=")) return formula;

    // Agar sirf '=' likha ho ya invalid format ho, to error na do, bas return karo
    if (formula === "=" || !/^=\w+\(.*\)$/.test(formula)) return formula;

    const match = formula.match(/^=(\w+)\((.+)\)$/);
    if (!match) return formula; // Invalid formula error ki jagah as it is return

    const [, func, range] = match;
    const cells = range.split(/[:,\s]+/);

    let values = cells.map((cell) => {
      const colLetters = cell.match(/[A-Z]+/)[0]; 
      const rowNumber = parseInt(cell.match(/\d+/)[0], 10) - 1;

      let colIndex = colLetters
        .split("")
        .reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65), 0);

      return parseFloat(data[rowNumber]?.[colIndex]) || 0;
    });

    switch (func.toUpperCase()) {
      case "SUM":
        return values.reduce((acc, val) => acc + val, 0);
      case "AVERAGE":
        return values.length ? values.reduce((acc, val) => acc + val, 0) / values.length : formula;
      case "MAX":
        return Math.max(...values);
      case "MIN":
        return Math.min(...values);
      case "COUNT":
        return values.filter((val) => !isNaN(val)).length;
      default:
        return formula; // Agar function nahi mila to error ki jagah original formula return
    }
  } catch {
    return formula;
  }
};
