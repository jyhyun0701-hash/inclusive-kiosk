import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./assets/styles/global.css";
import { initSpeech } from "./utils/speakSafe";
import { FocusManagerProvider } from "./context/FocusManagerContext";

initSpeech();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<FocusManagerProvider>
			<App />
		</FocusManagerProvider>
	</React.StrictMode>,
);
