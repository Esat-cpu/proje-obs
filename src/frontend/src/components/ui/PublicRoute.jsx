import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicRoute({ children }) {
    const { isAuthenticated, role } = useAuth();

    // Kullanıcı zaten giriş yapmışsa, rolüne göre kendi paneline yönlendir
    if (isAuthenticated) {
        if (role === "Ogrenci") {
            return <Navigate to="/student" replace />;
        } else if (role === "Akademisyen") {
            return <Navigate to="/academician" replace />;
        }
    }

    // Giriş yapmamışsa, LoginHomePage veya giriş formunu normal bir şekilde göster
    return children;
}