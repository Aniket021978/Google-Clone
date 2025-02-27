import React, { useState, useEffect } from "react";
import "./Spreadsheet.css";
import { evaluateFormula } from "./FormulaProcessor";
import ChartComponent from "./ChartComponent";

const ROWS = 20;
const COLS = 10;

const Spreadsheet = () => {
  const [data, setData] = useState([]);
  const [currentSheet, setCurrentSheet] = useState("Sheet1");
  const [sheets, setSheets] = useState(["Sheet1"]);
  const [cellFormat, setCellFormat] = useState({}); 
  const [globalFormat, setGlobalFormat] = useState({
    bold: false,
    italic: false,
  });
  const [dragging, setDragging] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [searchResult, setSearchResult] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const savedSheets = JSON.parse(localStorage.getItem("sheets")) || [
      "Sheet1",
    ];
    setSheets(savedSheets);

    const savedData =
      JSON.parse(localStorage.getItem(currentSheet)) ||
      Array.from({ length: ROWS }, () => Array(COLS).fill(""));
    setData(savedData);

    const savedFormats = JSON.parse(localStorage.getItem("cellFormat")) || {};

    if (!savedFormats["Sheet1"]) {
      savedFormats["Sheet1"] = {};
    }

    if (!savedFormats[currentSheet]) {
      savedFormats[currentSheet] = {};
    }

    setCellFormat(savedFormats);
  }, [currentSheet]);

  useEffect(() => {
    if (data.length) {
      localStorage.setItem(currentSheet, JSON.stringify(data));
    }

    const savedFormats = JSON.parse(localStorage.getItem("cellFormat")) || {};
    savedFormats[currentSheet] = cellFormat[currentSheet] || {};

    if (!savedFormats["Sheet1"]) {
      savedFormats["Sheet1"] = {};
    }

    localStorage.setItem("cellFormat", JSON.stringify(savedFormats));
  }, [data, cellFormat, currentSheet]);

  const handleChange = (row, col, value) => {
    const newData = [...data];
    newData[row][col] = value.startsWith("=")
      ? evaluateFormula(value, newData)
      : value;
    setData(newData);
  };

  const formatCell = (row, col, style, value) => {
    setCellFormat((prev) => {
      const updatedFormat = {
        ...prev,
        [currentSheet]: {
          ...prev[currentSheet],
          [`${row}-${col}`]: {
            ...prev[currentSheet]?.[`${row}-${col}`],
            [style]: value,
          },
        },
      };

      localStorage.setItem("cellFormat", JSON.stringify(updatedFormat));
      return updatedFormat;
    });
  };

  const applyGlobalFormat = (style) => {
    if (selectedCell.row !== null && selectedCell.col !== null) {
      formatCell(
        selectedCell.row,
        selectedCell.col,
        style,
        !cellFormat[currentSheet]?.[
          `${selectedCell.row}-${selectedCell.col}`
        ]?.[style]
      );

      if (currentSheet !== "Sheet1") {
        formatCell(
          selectedCell.row,
          selectedCell.col,
          style,
          !cellFormat["Sheet1"]?.[`${selectedCell.row}-${selectedCell.col}`]?.[
            style
          ]
        );
      }
    }
  };

  const addSheet = () => {
    const sheetNumbers = sheets
      .map((sheet) => sheet.match(/^Sheet(\d+)$/))
      .filter((match) => match)
      .map((match) => parseInt(match[1], 10));

    const nextSheetNumber = sheetNumbers.length
      ? Math.max(...sheetNumbers) + 1
      : 2;
    const newSheetName = `Sheet${nextSheetNumber}`;

    setSheets([...sheets, newSheetName]);
    setCurrentSheet(newSheetName);

    const newData = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
    setData(newData);
    localStorage.setItem(newSheetName, JSON.stringify(newData));
    localStorage.setItem("sheets", JSON.stringify([...sheets, newSheetName]));
    setCellFormat((prev) => ({
      ...prev,
      [newSheetName]: {},
    }));
  };

  const removeSheet = (sheetName) => {
    if (sheetName === "Sheet1") {
      return;
    }

    const updatedSheets = sheets.filter((sheet) => sheet !== sheetName);
    setSheets(updatedSheets);
    localStorage.setItem("sheets", JSON.stringify(updatedSheets));
    localStorage.removeItem(sheetName);

    if (currentSheet === sheetName) {
      setCurrentSheet(updatedSheets[0] || "Sheet1");
    }
  };

  const addRow = () => {
    const newData = [...data, Array(data[0]?.length || COLS).fill("")];
    setData(newData);
  };

  const deleteRow = () => {
    if (data.length > 1) {
      const newData = data.slice(0, -1);
      setData(newData);
    }
  };

  const addColumn = () => {
    const newData = data.map((row) => [...row, ""]);
    setData(newData);
  };

  const deleteColumn = () => {
    if (data[0].length > 1) {
      const newData = data.map((row) => row.slice(0, -1));
      setData(newData);
    }
  };

  const handleDragStart = (row, col) => {
    setDragging({ row, col, value: data[row][col] });
  };

  const handleDrop = (row, col) => {
    if (!dragging) return;

    const newData = [...data];
    const targetCell = newData[row][col];
    if (targetCell === "") {
      newData[row][col] = dragging.value;
      newData[dragging.row][dragging.col] = "";
    } else {
      return;
    }

    setData(newData);
    setDragging(null);
  };

  const trimCells = () => {
    const selection = document.activeElement;
    if (selection && selection.tagName === "INPUT") {
      const [row, col] = selection.id.split("-").slice(1).map(Number);
      const newData = [...data];
      newData[row][col] =
        typeof newData[row][col] === "string"
          ? newData[row][col].trim()
          : newData[row][col];
      setData(newData);
    }
  };

  const upperCells = () => {
    const newData = data.map((row) =>
      row.map((cell) => (typeof cell === "string" ? cell.toUpperCase() : cell))
    );
    setData(newData);
  };

  const lowerCells = () => {
    const newData = data.map((row) =>
      row.map((cell) => (typeof cell === "string" ? cell.toLowerCase() : cell))
    );
    setData(newData);
  };

  const removeDuplicates = () => {
    if (selectedColumn === null) {
      alert("Please select a column first.");
      return;
    }

    const seen = new Set();
    const newData = data.map((row) => {
      if (seen.has(row[selectedColumn])) {
        row[selectedColumn] = "";
      } else {
        seen.add(row[selectedColumn]);
      }
      return row;
    });

    setData(newData);
  };

  const findAndReplace = (findText, replaceText) => {
    const newData = data.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (
          selectedColumn !== null &&
          colIndex !== selectedColumn
        ) {
          return cell;
        }
        if (typeof cell === "string" && cell.includes(findText)) {
          return cell.replace(new RegExp(findText, "g"), replaceText);
        }
        return cell;
      })
    );
    setData(newData);
  };
  
  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === "Enter") {
      const value = searchInput;
      if (value.startsWith("=")) {
        const result = evaluateFormula(value, data);
        setSearchInput(result); // Replace input with the evaluated result
      }
    }
  };
  return (
    <div className="spreadsheet">
      <h1>Google Sheets Clone</h1>
      <div className="search-bar">
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
          placeholder="Enter formula or text e.g  =SUM(A1:A2)"
        />
      </div>
      <div className="toolbar">
        <button onClick={addSheet}>+ Add Sheet</button>
        <button onClick={addRow}>+ Row</button>
        <button onClick={deleteRow}>- Row</button>
        <button onClick={addColumn}>+ Column</button>
        <button onClick={deleteColumn}>- Column</button>
        <button onClick={() => applyGlobalFormat("bold")}>Bold</button>
        <button onClick={() => applyGlobalFormat("italic")}>Italic</button>
        <button onClick={trimCells}>TRIM</button>
        <button onClick={upperCells}>UPPER</button>
        <button onClick={lowerCells}>LOWER</button>
        <button onClick={removeDuplicates}>REMOVE DUPLICATES</button>
        <button
  onClick={() => {
    document.getElementById("findReplacePopup").style.display = "block";
  }}
>
  FIND AND REPLACE
</button>
      </div>
      <div id="findReplacePopup" className="popup">
  <div className="popup-content">
    <span
      className="close-btn"
      onClick={() =>
        (document.getElementById("findReplacePopup").style.display = "none")
      }
    >
      ✖
    </span>
    <h3>Find and Replace</h3>
    <input
      type="text"
      id="findText"
      placeholder="Enter text to find"
    />
    <input
      type="text"
      id="replaceText"
      placeholder="Enter text to replace with"
    />
    <button
      onClick={() => {
        const findText = document.getElementById("findText").value;
        const replaceText = document.getElementById("replaceText").value;
        findAndReplace(findText, replaceText);
        document.getElementById("findReplacePopup").style.display = "none";
      }}
    >
      Replace
    </button>
  </div>
</div>
      <div className="toolbar close-icon">
        {sheets.map((sheet) => (
          <div
            key={sheet}
            className={`sheet-tab ${sheet === currentSheet ? "active" : ""}`}
            onClick={() => setCurrentSheet(sheet)}
            onMouseEnter={() => setDragging(null)} 
          >
            {sheet}
            {sheets.length > 1 && sheet !== "Sheet1" && (
              <span
                className="close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSheet(sheet);
                }}
              >
                ✖
              </span>
            )}
          </div>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: data[0]?.length || COLS }, (_, colIndex) => (
              <th
                key={colIndex}
                className="column-header"
                onClick={() => setSelectedColumn(colIndex)}
                style={{
                  backgroundColor:
                    selectedColumn === colIndex ? "#ddd" : "transparent",
                }}
              >
                {String.fromCharCode(65 + colIndex)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="row-header">{rowIndex + 1}</td>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(rowIndex, colIndex)}
                >
                  <input
                    id={`cell-${rowIndex}-${colIndex}`}
                    type="text"
                    value={cell}
                    onChange={(e) =>
                      handleChange(rowIndex, colIndex, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const nextRow = rowIndex + 1;
                        if (nextRow < data.length) {
                          document
                            .querySelector(`#cell-${nextRow}-${colIndex}`)
                            ?.focus();
                        }
                      }
                    }}
                    className="cell"
                    draggable
                    onDragStart={() => handleDragStart(rowIndex, colIndex)}
                    onClick={() =>
                      setSelectedCell({ row: rowIndex, col: colIndex })
                    } // Update selectedCell
                    style={{
                      fontWeight: cellFormat[currentSheet]?.[
                        `${rowIndex}-${colIndex}`
                      ]?.bold
                        ? "bold"
                        : "normal",
                      fontStyle: cellFormat[currentSheet]?.[
                        `${rowIndex}-${colIndex}`
                      ]?.italic
                        ? "italic"
                        : "normal",
                      color:
                        cellFormat[currentSheet]?.[`${rowIndex}-${colIndex}`]
                          ?.color || "black",
                      fontSize:
                        cellFormat[currentSheet]?.[`${rowIndex}-${colIndex}`]
                          ?.fontSize || "14px",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ChartComponent data={data} />
    </div>
  );
};

export default Spreadsheet;
