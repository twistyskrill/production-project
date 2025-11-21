import { useEffect, useRef, useState } from "react";

export function useFpsMonitor(pollInterval = 1000) {
	const frameCountRef = useRef(0);
	const rafRef = useRef(0);
	const [fps, setFps] = useState(0);

	useEffect(() => {
		const loop = () => {
			frameCountRef.current += 1;
			rafRef.current = requestAnimationFrame(loop);
		};
		rafRef.current = requestAnimationFrame(loop);
		const timer = setInterval(() => {
			setFps(frameCountRef.current);
			frameCountRef.current = 0;
		}, pollInterval);
		return () => {
			cancelAnimationFrame(rafRef.current);
			clearInterval(timer);
		};
	}, [pollInterval]);

	return fps;
}
