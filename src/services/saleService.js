import http from "./http";

export const saleService = {
    generateTrxNumber: () => http.get("transaction_code"),
    getAll: (params) => http.get("sales", { params }),
    create: (data) => http.post("sales", data),
    getDetail: (code) => http.get(`sales/${code}`),
    getPaymentMethods: () => http.get("/payment-methods"),
    getCoas: () => http.get("/coas"),
    uploadClosing: (data) => http.post("/accounting/preview-closing", data),
};
