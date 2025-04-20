import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function ChartComponent() {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [inputLabel, setInputLabel] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleAddData = () => {
    if (inputLabel && inputValue) {
      setLabels([...labels, inputLabel]);
      setData([...data, Number(inputValue)]);
      setInputLabel("");
      setInputValue("");
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Values",
        data,
        backgroundColor: ["red", "blue", "green", "yellow", "purple"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Dynamic Charts</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Label"
          value={inputLabel}
          onChange={(e) => setInputLabel(e.target.value)}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Value"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border p-2"
        />
        <button onClick={handleAddData} className="bg-blue-500 text-white p-2">Add</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bar Chart</h3>
          <Bar data={chartData} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Pie Chart</h3>
          <Pie data={chartData} />
        </div>
      </div>
    </div>
  );
}
