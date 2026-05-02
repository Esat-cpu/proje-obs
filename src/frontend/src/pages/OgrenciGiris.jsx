import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { User, Eye, EyeOff, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const OgrenciGiris = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ ogr_no: "", sifre: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.ogr_no.trim()) newErrors.ogr_no = t("error.required", "Bu alan zorunludur.");
        if (!formData.sifre.trim()) newErrors.sifre = t("error.required", "Bu alan zorunludur.");
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            console.log("Öğrenci giriş isteği:", formData);
        } catch (err) {
            setErrors({ general: t("error.login", "Giriş başarısız.") });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color)" }}>

            {/* Üst bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "var(--text-main)", fontSize: "14px", fontWeight: "500" }}>
                    ← {t("nav.backToHome", "Ana Sayfaya Dön")}
                </Link>
            </div>

            {/* Orta kart */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "16px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 2px 16px rgba(59,111,212,0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

                    {/* İkon */}
                    <div style={{ width: "64px", height: "64px", backgroundColor: "#dce8fb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={32} color="var(--primary-blue)" />
                    </div>

                    {/* Başlık */}
                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
                            {t("portal.student", "Öğrenci")}
                        </h2>
                        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--text-muted)" }}>
                            {t("form.login", "Giriş Yap")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                                {t("form.ogrNo", "Öğrenci Numarası")}
                            </label>
                            <input
                                type="text"
                                name="ogr_no"
                                value={formData.ogr_no}
                                onChange={handleChange}
                                placeholder="20211234567"
                                style={{ padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${errors.ogr_no ? "red" : "var(--border-color)"}`, backgroundColor: "var(--bg-color)", color: "var(--text-main)", fontSize: "14px", outline: "none" }}
                            />
                            {errors.ogr_no && <span style={{ fontSize: "12px", color: "red" }}>{errors.ogr_no}</span>}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                                {t("form.password", "Şifre")}
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="sifre"
                                    value={formData.sifre}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px", border: `1.5px solid ${errors.sifre ? "red" : "var(--border-color)"}`, backgroundColor: "var(--bg-color)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-muted)" }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.sifre && <span style={{ fontSize: "12px", color: "red" }}>{errors.sifre}</span>}
                        </div>

                        {errors.general && <span style={{ fontSize: "12px", color: "red" }}>{errors.general}</span>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary-blue)", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: "4px" }}
                        >
                            {loading ? t("form.loading", "Giriş yapılıyor...") : t("form.loginBtn", "Giriş")}
                        </button>
                    </form>
                </div>
            </div>

            {/* Alt logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
                <GraduationCap size={18} color="var(--primary-blue)" />
                <span>{t("app.title", "OBS - Öğrenci Bilgi Sistemi")}</span>
            </div>
        </div>
    );
};

export default OgrenciGiris;