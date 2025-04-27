import { BrowserRouter as Router, Routes, Route } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Upload from "./pages/Documents/Upload";
import SignIn from "./pages/AuthPages/SignIn";
import HistoryInvoice from "./pages/HistoryInvoice/History";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import NotFound from "./pages/OtherPage/NotFound";
import ExpenseReportDetail from "./pages/HistoryInvoice/ExpenseReporDetail";

export default function App() {


  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (

    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Upload />} />
                <Route path="/upload-invoice" element={<Upload />} />
                <Route path="/history-invoice" element={<HistoryInvoice />} />
                <Route path="/expense-report-detail/:id" element={<ExpenseReportDetail />} />
              </Route>
            </Route>

            {/* Rutas públicas */}
            <Route path="/signin" element={<SignIn />} />
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}