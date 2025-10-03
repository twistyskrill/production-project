import { useEffect } from "react";

export const useInitialEffect = (callback: () => void) => {
	useEffect(() => {
		callback();
	}, []);
};
