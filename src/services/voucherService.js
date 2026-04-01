// import http from './http';

export const voucherService = {
  // Dipanggil saat tombol "Cek Saldo" ditekan
  checkBalance: async (voucherCode) => {
    /* 
      TODO: Jika endpoint dari rekan Anda sudah siap, hapus Promise dummy di bawah 
      dan gunakan (uncomment) baris kode ini:
      
      return await http.get(`/api/endpoint-cek-voucher?code=${voucherCode}`);
    */

    // DUMMY SIMULATION: Menyimulasikan jeda jaringan (loading server)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Anggap saja semua kode voucher valid kecuali '000000'
        if (voucherCode === '000000') {
          reject(new Error("Voucher tidak terdaftar atau hangus."));
        } else if (voucherCode === '111111') {
          // Simulasi member yang saldonya tinggal sangat sedikit
          resolve({
            data: {
              data: { name: 'Suhartono (Dummy Miskin)', no: voucherCode, saldo: 5000 }
            }
          });
        } else {
          // Keadaan normal/sukses untuk dummy testing
          resolve({
            data: {
              data: {
                name: 'Sultan Koperasi (Dummy)',
                no: voucherCode,
                saldo: 10000000 // 10 juta
              }
            }
          });
        }
      }, 600); // Tunggu setengah detik seperti server asli
    });
  },

  // Dipanggil saat "Konfirmasi Bayar" ditekan
  cutBalance: async (payload) => {
    /* 
      payload berisi: { 
        no_member: '...', 
        amount_to_cut: 50000, 
        trx_code: 'xxx' 
      }
      
      TODO: Sama seperti di atas, ganti return dummy di bawah dengan baris ini:
      
      return await http.post('/api/endpoint-potong-saldo', payload);
    */

    // DUMMY SIMULATION:
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulasi jika misal API menolak transaksi
        if (payload.amount_to_cut > 10000000) {
          reject(new Error("Gagal memotong saldo: Saldo tidak mencukupi di server pusat."));
        } else {
          resolve({
            data: {
              message: "Saldo di server pusat berhasil dipotong",
              data: {
                cut_amount: payload.amount_to_cut,
                remaining_balance: 10000000 - payload.amount_to_cut
              }
            }
          });
        }
      }, 800);
    });
  }
};
