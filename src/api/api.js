import axiosInstance from '../axios/axios';

// Get User Data
export const getUserData = (userName) => {
    return axiosInstance.get(`/data/${userName}`);
};

// Save Bank Details
export const saveBankDetails = (data) => {
    return axiosInstance.post('/save-bank-details', data);
};

// Update Bank Details
export const updateBankDetails = async (data) => {
    return await axiosInstance.put('/update-bank-details', data);
};

export const deleteBankDetails = (userName, bankDetailId) => {
    return axiosInstance.delete('/delete-bank-details', {
      data: { userName, bankDetailId },
      headers: { "Content-Type": "application/json" } // Ensure JSON format
    });
  };
  