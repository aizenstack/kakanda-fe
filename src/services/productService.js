import http from "./http";

export const productService = {
    getAll: (params) => http.get("products", { params }),
    getById: (id) => http.get(`products/${id}`),
    create: (data) => http.post("products", data),
    update: (id, data) => http.put(`products/${id}`, data),
    delete: (id) => http.delete(`products/${id}`),

    createDetail: (data) => http.post("product-details", data),
    adjustStock: (detailId, data) => http.post(`product-details/${detailId}/adjust`, data),
    getConsignmentInfo: (detailId) => http.get(`product-details/${detailId}/consignment`),
    settleConsignment: (detailId, data) => http.post(`product-details/${detailId}/consignment/settle`, data),
    syncAsis: (id) => http.post(`products/${id}/sync-asis`),
    exportProducts: async (type = 'all') => {
        const response = await http.get(`products/export?type=${type}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Laporan_Produk_${type}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};
