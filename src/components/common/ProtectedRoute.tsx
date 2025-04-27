import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    // console.log("isAuthenticated", isAuthenticated);

    if (isLoading) {
        // Mostrar un componente de carga mientras se verifica la autenticación
        return <div>Loading...</div>;
      }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
};