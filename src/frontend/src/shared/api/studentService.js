import axiosClient from "./axiosClient";

const studentService = {
  // Öğrencinin profil bilgilerini getirir
  getProfil: async () => {
    const response = await axiosClient.get("api/student/profile/");
    return response.data;
  },

  // Öğrencinin kayıtlı olduğu / aldığı dersleri getirir
  getDersler: async () => {
    const response = await axiosClient.get("api/student/courses/");
    return response.data;
  },

  // Öğrencinin seçebileceği (havuzdaki) mevcut dersleri getirir
  getMevcutDersler: async () => {
    const response = await axiosClient.get("api/student/available-courses/");
    return response.data;
  },

  // Yeni bir derse kayıt olma isteği atar
  dersKaydet: async (dersIdListesi) => {
    // Format: { "donem_dersi_ids": [1, 2, 3] }
    const response = await axiosClient.post("api/student/enrollments/", {
      donem_dersi_ids: dersIdListesi
    });
    return response.data;
  },

  // Kayıtlı olunan dersi siler / kaydı iptal eder
  dersSil: async (id) => {
    const response = await axiosClient.delete(`api/student/enroll/${id}/`);
    return response.data;
  },

  // Öğrencinin not dökümünü (transkript) getirir
  indirTranskriptPDF: async () => {
    // PDF indireceğimiz için responseType: 'blob' eklemek zorundayız
    const response = await axiosClient.get("api/student/transcript/pdf/", { responseType: 'blob' });
    return response.data;
  },
};

export default studentService;