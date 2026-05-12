import axiosClient from "./axiosClient";

export const academicianService = {
    getDashboardSummary: async () => {
        //!backend endpointe istek
        const response = await axiosClient.get('/api/academician/summary');
        return response.data;
    },

};
