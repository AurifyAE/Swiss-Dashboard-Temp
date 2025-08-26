import axiosInstance from '../axios/axios';

// Get User Data
export const getUserData = (userName) => {
    return axiosInstance.get(`/data/${userName}`);
};

// Update User Data
export const updateUserData = (userId, userData) => {
    return axiosInstance.put(`/update-profile/${userId}`, {userData});
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

// Upload Logo
export const uploadLogo = (userName, file) => {
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("userName", userName);

    return axiosInstance.post('/update-logo', formData, {
        headers: {
            "Content-Type": "multipart/form-data", 
        },
    });
};