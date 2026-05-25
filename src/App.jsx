import { Suspense } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { LoadingScreen } from "./components/common/LoadingScreen";

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen fullScreen />}>
      <AppRoutes />
    </Suspense>
  );
}