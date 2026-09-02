import { Navigate, Route, Routes } from "react-router-dom";
import { SearchPage } from "@/pages/SearchPage";
import { AnnotatePage } from "@/pages/AnnotatePage";

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/search" replace />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/annotate/:imageId" element={<AnnotatePage />} />
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Routes>
  );
}
