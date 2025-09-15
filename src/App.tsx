// ./src/App.tsx

import '@xyflow/react/dist/style.css';
import "katex/dist/katex.min.css";
import '@/index.css'

import ProgrammStruktur from "@/Ordnung/Struktur.tsx";
 
export default function App() {
  console.log("App component rendered");
  return (<ProgrammStruktur />);
}