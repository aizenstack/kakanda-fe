import React, { useState, useEffect, useRef } from "react";
import Icon from "../../components/_Icon";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { Toast } from "primereact/toast";

const CAROUSEL_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop",
        title: "Manajemen Koperasi Modern",
        desc: "Sistem Point of Sale yang terintegrasi untuk kemudahan transaksi"
    },
    {
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
        title: "Laporan Real-time",
        desc: "Pantau perkembangan bisnis Anda kapanpun dan dimanapun"
    },
    {
        url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1000&auto=format&fit=crop",
        title: "Keamanan Terjamin",
        desc: "Sistem yang aman dan dapat diandalkan untuk koperasi Anda"
    }
];

export default function Login() {
    const navigate = useNavigate();
    const toast = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nik: "", password: "" });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const nik = formData.nik?.trim();
        const pwd = formData.password?.trim();

        if (!nik || !pwd) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'NIK/NIP dan Password wajib diisi',
                life: 3000
            });
            return;
        }

        setLoading(true);
        try {
            console.log("Login attempt initiated...");
            const response = await authService.login(nik, pwd);
            const user = response.data?.user || response.data?.data;

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                toast.current?.show({
                    severity: 'success',
                    summary: 'Login Berhasil',
                    detail: `Selamat datang kembali, ${user.name || 'User'}`,
                    life: 2000
                });

                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
        } catch (error) {
            console.error("Login submission failed:", error);
            
            let message = 'NIK/NIP atau Password salah';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            toast.current?.show({
                severity: 'error',
                summary: 'Login Gagal',
                detail: message,
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="flex min-h-screen bg-slate-50">
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 rounded-r-3xl shadow-2xl">
                    {CAROUSEL_IMAGES.map((img, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                                }`}
                        >
                            <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover scale-105 transition-transform duration-[10000ms] ease-out"
                                style={{
                                    transform: idx === currentSlide ? 'scale(1)' : 'scale(1.05)'
                                }}
                            />

                            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                                <div className="w-12 h-1 bg-blue-500 rounded-full mb-6" />
                                <h2 className="text-4xl font-black mb-4 tracking-tight drop-shadow-md">
                                    {img.title}
                                </h2>
                                <p className="text-lg text-slate-200 font-medium drop-shadow-sm max-w-md">
                                    {img.desc}
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-12 right-12 z-20 flex gap-2">
                        {CAROUSEL_IMAGES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-blue-500" : "w-2 bg-white/40 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="2" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#pattern)" />
                        </svg>
                    </div>

                    <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                        <div className="mb-10 text-center lg:text-left">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30">
                                <Icon name="Store" size={28} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                Selamat Datang
                            </h1>
                            <h2 className="text-sm text-slate-500 font-medium">
                                Masuk menggunakan NIK / NIP dan Password Anda
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.05em] ml-1">
                                    NIK / NIP (Nomor Induk)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Icon name="User" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masukkan NIK atau NIP Anda"
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]"
                                        value={formData.nik}
                                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.05em]">
                                        Password
                                    </label>
                                    <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-all">
                                        Lupa Password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Icon name="Lock" size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Masukkan password Anda"
                                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black text-sm py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_10px_25px_-6px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <i className="pi pi-spin pi-spinner mr-2"></i>
                                ) : (
                                    <>
                                        Masuk
                                        <Icon name="ArrowRight" size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-12 text-center text-xs font-semibold text-slate-400">
                            © {new Date().getFullYear()} Koperasi POS System. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}