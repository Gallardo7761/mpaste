import { useContext } from "react";
import { ConfigContext } from "@/context/ConfigContext.jsx";

export const useConfig = () => {
	const configContext = useContext(ConfigContext);

	if (!configContext) {
		throw new Error("useConfig debe usarse dentro de ConfigProvider");
	}

	return configContext;
};
