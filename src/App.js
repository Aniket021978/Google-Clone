import React, { useState } from "react";
import Spreadsheet from "./Spreadsheet";

function App() {
  const [data, setData] = useState([]);

  return (
    <div className="App">
      <Spreadsheet setData={setData} />
    </div>
  );
}

export default App;
