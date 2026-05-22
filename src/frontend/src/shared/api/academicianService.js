import axiosClient from "./axiosClient";

const academicianService = {
  // Akademisyenin kişisel ve akademik profil bilgilerini getirir
  getProfil: async () => {
    const response = await axiosClient.get("api/academician/profile/");
    return response.data;
  },

  // Hocanın sorumlu olduğu derslerin listesini getirir
  getDersler: async (page = 1) => {
    const pageNum = (typeof page === 'number' || typeof page === 'string') ? page : 1;
    const response = await axiosClient.get(`api/academician/courses/?page=${pageNum}`);
    const isPaginated = !Array.isArray(response.data);
    return {
      items: isPaginated ? (response.data.results || []) : response.data,
      next: isPaginated ? response.data.next : null,
      previous: isPaginated ? response.data.previous : null,
      count: isPaginated ? (response.data.count || 0) : response.data.length
    };
  },

  // Derslere kayıt olmak isteyen öğrencilerin onay bekleyen isteklerini getirir
  getKayitIstekleri: async (page = 1, status = '') => {
    const pageNum = (typeof page === 'number' || typeof page === 'string') ? page : 1;
    let url = `api/academician/enrollment-requests/?page=${pageNum}`;
    if (status && typeof status === 'string') {
      url += `&onay_durumu=${status}`;
    }
    const response = await axiosClient.get(url);
    const isPaginated = !Array.isArray(response.data);
    return {
      items: isPaginated ? (response.data.results || []) : response.data,
      next: isPaginated ? response.data.next : null,
      previous: isPaginated ? response.data.previous : null,
      count: isPaginated ? (response.data.count || 0) : response.data.length
    };
  },

  getDersOgrencileri: async (dersId, page = 1) => {
    const pageNum = (typeof page === 'number' || typeof page === 'string') ? page : 1;
    const response = await axiosClient.get(`api/academician/courses/${dersId}/students/?page=${pageNum}`);
    const isPaginated = !Array.isArray(response.data);
    return {
      items: isPaginated ? (response.data.results || []) : response.data,
      next: isPaginated ? response.data.next : null,
      previous: isPaginated ? response.data.previous : null,
      count: isPaginated ? (response.data.count || 0) : response.data.length
    };
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
