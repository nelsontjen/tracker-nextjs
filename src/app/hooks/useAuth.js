import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    const isExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.replace("/login");
    };

    // === Cek login & set auto logout ===
    useEffect(() => {
        const t = localStorage.getItem("token");
        if (!t || isExpired(t)) {
            localStorage.removeItem("token");
            router.replace("/login");
        } else {
            setToken(t);
            setLoading(false);
            const payload = JSON.parse(atob(t.split(".")[1]));
            const expireTime = payload.exp * 1000;
            const remainingTime = expireTime - Date.now();

            const timerId = setTimeout(() => {
                handleLogout();
            }, remainingTime);

            return () => clearTimeout(timerId);
        }
    }, [router]);

    return { token, loading, handleLogout };
}
