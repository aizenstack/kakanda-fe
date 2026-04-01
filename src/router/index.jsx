import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Login from "../views/auth/Login";
import NotFound from "../views/auth/NotFound";

import Layout from "../layout/Layout";
import Home from "../views/Dashboard";
import Products from "../views/products/DashboardProducts";
import History from "../views/sales/DashboardHistorySales";
import Sales from "../views/sales/DashboardSales";
import PaymentMethod from "../views/settings/PaymentMethodSettings";
import PrinterThermalConfig from "../views/settings/PrinterThermalConfig";

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const ProtectedRoute = () => {
  const token = getCookie("access_token");
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};

const AuthRedirect = () => {
    const token = getCookie("access_token");
    if (token) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthRedirect />}>
            <Route path="/auth">
                <Route path="login" element={<Login />} />
            </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="data-penjualan" element={<History />} />
                <Route path="pengaturan/metode-pembayaran" element={<PaymentMethod />} />
                <Route path="pengaturan/printer" element={<PrinterThermalConfig />} />
            </Route>
            <Route path="sales" element={<Sales />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

