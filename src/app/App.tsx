import React, { Suspense, useEffect } from "react";
import { classNames } from "shared/lib/classNames/classNames";
import { useTheme } from "app/providers/ThemeProvider";
import { AppRouter } from "app/providers/router";
import { Navbar } from "widgets/Navbar";
import { Sidebar } from "widgets/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { getUserInited, userActions } from "entities/User";
import { PageLoader } from "widgets/PageLoader/PageLoader";

function App() {
	const { theme } = useTheme();
	const dispatch = useDispatch();
	const inited = useSelector(getUserInited);

	useEffect(() => {
		console.log("App: Initializing auth data...");
		dispatch(userActions.initAuthData());
	}, [dispatch]);

	useEffect(() => {
		console.log("App: inited =", inited);
	}, [inited]);

	if (!inited) {
		return (
			<div className={classNames("app", {}, [theme])}>
				<PageLoader />
			</div>
		);
	}

	return (
		<div className={classNames("app", {}, [theme])}>
			<Suspense fallback={<PageLoader />}>
				<Navbar />
				<div className="content-page">
					<Sidebar />
					<AppRouter />
				</div>
			</Suspense>
		</div>
	);
}

export default App;
