import { createRoot } from "react-dom/client";
import Experience from "../components/life/Experience";
import "../app/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("The LIFE.exe mount point is missing.");
createRoot(root).render(<Experience />);
