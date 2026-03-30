import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export const useAuth = () => {
	const authContext = useContext(AuthContext);

	if (!authContext) {
		throw new Error("useAuth debe usarse dentro de AuthProvider");
	}

	return authContext;
};
