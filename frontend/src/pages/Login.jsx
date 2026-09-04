import React, { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser } from "../utils/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser({ email, password });

            localStorage.setItem("userInfo", JSON.stringify(data));
            window.dispatchEvent(new Event("authChange"));

            navigate("/admin");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 select-none font-sans">
            <div className="w-full max-w-md bg-white border-2 border-wildcats-red rounded-none shadow-2xl overflow-hidden">
                <div className="p-8 sm:p-10 flex flex-col items-center">
                    <h1 className="font-wildcats font-bold text-lg text-wildcats-blue uppercase tracking-wider mb-6 text-center">
                        ADMIN LOGIN
                    </h1>

                    {error && (
                        <div className="w-full bg-wildcats-red/10 border border-wildcats-red text-wildcats-red text-[11px] uppercase tracking-wider p-3 rounded-none mb-6 text-center font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-semibold text-wildcats-blue/80 uppercase tracking-[0.2em]">
                                EMAIL ADDRESS
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border rounded-none px-3.5 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-wildcats-red focus:bg-white transition-colors"
                                placeholder="user@example.com"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-semibold text-wildcats-blue/80 uppercase tracking-[0.2em]">
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border rounded-none px-3.5 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-wildcats-red focus:bg-white transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-wildcats-blue hover:bg-wildcats-red text-white font-semibold text-[11px] uppercase tracking-[0.24em] py-3 rounded-none transition-colors duration-150 disabled:opacity-50"
                        >
                            {loading ? "LOGGING IN..." : "LOG IN"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}