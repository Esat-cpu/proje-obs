import axiosClient from "./axiosClient";

const academicianService = {
  // Akademisyenin kişisel ve akademik profil bilgilerini getirir
  getProfil: async () => {
    const response = await axiosClient.get("api/academician/profile/");
    return response.data;
  },

  // Hocanın sorumlu olduğu derslerin listesini getirir
  getDersler: async () => {
    const response = await axiosClient.get("api/academician/courses/");
    return response.data;
  },

  // Derslere kayıt olmak isteyen öğrencilerin onay bekleyen isteklerini getirir
  getKayitIstekleri: async () => {
    const response = await axiosClient.get("api/academician/enrollment-requests/");
    return response.data;
  },
  getDersOgrencileri: async (dersId) => {
    const response = await axiosClient.get(`api/academician/courses/${dersId}/students/`);
    return response.data;
  },
  notGir: async (kayitId, notlar) => {
    // notlar formatı: { vize_notu: 50, final_notu: 60 }
    const response = await axiosClient.patch(`api/academician/grades/${kayitId}/`, notlar);
    return response.data;
  },
  // Kayıt talebini onaylar
  onaylaKayit: async (enrollmentRequestId) => {
    const response = await axiosClient.patch(`api/academician/enrollment-requests/${enrollmentRequestId}/`, {
      durum: "onaylandi"
    });
    return response.data;
  },

  // Kayıt talebini reddeder
  reddetKayit: async (enrollmentRequestId) => {
    const response = await axiosClient.patch(`api/academician/enrollment-requests/${enrollmentRequestId}/`, {
      durum: "reddedildi"
    });
    return response.data;
  },
};

export default academicianService;
