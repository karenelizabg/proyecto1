import { Navigate, Route, Routes } from "react-router-dom";
import { SearchPage } from "@/pages/SearchPage";
import { AnnotateScreen } from "@/components/annotate/AnnotateScreen";
import { DashboardPage } from "@/pages/Dashboard";
import { UploadScreen } from "@/components/upload/UploadScreen";
import { AppLayout } from "@/components/layout/AppLayout";

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/search"
        element={
          <AppLayout>
            <SearchPage />
          </AppLayout>
        }
      />
      <Route
        path="/upload"
        element={
          <AppLayout>
            <UploadScreen />
          </AppLayout>
        }
      />
      {/* Annotate es un modo de enfoque de pantalla completa a propósito: sin
          nav global, con su propio botón "Volver". Ver GlobalNav.tsx. */}
      <Route path="/annotate/:imageId" element={<AnnotateScreen />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
