import http from "./http";

export const masterService = {
    getBranches: (params) => http.get("branches", { params }),
    getWarehouses: (params) => http.get("warehouses", { params }),
    getCompanies: (params) => http.get("companies", { params }),
    getCategories: (params) => http.get("categories", { params }),
    getBrands: (params) => http.get("brands", { params }),
    getSuppliers: (params) => http.get("suppliers", { params }),
    getPaymentMethods: () => http.get("payment-methods"),
    updatePaymentMethod: (id, data) => http.put(`payment-methods/${id}`, data),
    getCoas: () => http.get("coas"),
    updateCoa: (id, data) => http.put(`coas/${id}`, data),
};
