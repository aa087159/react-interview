import React from "react";
import { Pagination } from "./components/pagination";

function App() {
  const [currPage, setCurrPage] = React.useState<number>(1);
  const handleCurrPageChange = React.useCallback((page: number) => {
    setCurrPage(page);
  }, []);

  const handleSetRandomCurrPage = () => {
    setCurrPage(Math.floor(Math.random() * 50));
  };

  return (
    <div className="m-10">
      <Pagination
        total={50}
        currPage={currPage}
        onPageChange={handleCurrPageChange}
      />
      <button
        onClick={handleSetRandomCurrPage}
        className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Set to random page
      </button>
      <h1 className="text-lg mt-10">Current page: {currPage}</h1>
    </div>
  );
}

export default App;
