import React, { useState, useEffect } from 'react';

import { bankLogoMap } from '../../utils/bankLogoMap'; 

const BankDetailsModal = ({ isOpen, onClose, onSave, editData }) => {
  const initialBankState = {
    holderName: '',
    bankName: '',
    accountNumber: '',
    iban: '',
    ifsc: '',
    swift: '',
    branch: '',
    city: '',
    country: '',
    logo: ''
  };

  const [formData, setFormData] = useState(initialBankState);
  const [errors, setErrors] = useState({});

  // Function to get the logo image
  const getBankLogo = (bankName) => {
    return bankLogoMap[bankName] || null;
  };

  // Reset form or populate with edit data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData(initialBankState);
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevData => {
      const updatedData = { ...prevData, [name]: value };

      // Update logo when bank name changes
      if (name === 'bankName') {
        const logoFileName = bankLogoMap[value];
        updatedData.logo = logoFileName || '';
      }

      return updatedData;
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fields = ['holderName', 'bankName', 'accountNumber', 'iban', 'ifsc', 'swift', 'branch', 'city', 'country'];

    fields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Additional validation for account number
    if (formData.accountNumber && !/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account Number must be numeric';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">{editData ? 'Edit Bank Details' : 'Add Bank Details'}</h2>

        <div className="grid grid-cols-6 gap-6 w-full">
          {/* Bank Name Dropdown */}
          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">Bank Name</label>
            <select
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select a Bank</option>
              {Object.keys(bankLogoMap).map((bankName) => (
                <option key={bankName} value={bankName}>
                  {bankName}
                </option>
              ))}
            </select>
            {errors.bankName && <p className="text-red-500 text-sm">{errors.bankName}</p>}
          </div>

          {/* Other Form Fields */}
          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">Holder Name</label>
            <input
              type="text"
              name="holderName"
              value={formData.holderName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.holderName && <p className="text-red-500 text-sm">{errors.holderName}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.accountNumber && <p className="text-red-500 text-sm">{errors.accountNumber}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">IBAN</label>
            <input
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.iban && <p className="text-red-500 text-sm">{errors.iban}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">IFSC</label>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.ifsc && <p className="text-red-500 text-sm">{errors.ifsc}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">SWIFT</label>
            <input
              type="text"
              name="swift"
              value={formData.swift}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.swift && <p className="text-red-500 text-sm">{errors.swift}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.branch && <p className="text-red-500 text-sm">{errors.branch}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-[#737272] font-semibold mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
          </div>

          {/* Bank Logo */}
          {formData.bankName && (
            <div className="col-span-2 flex justify-center">
              <div className="mt-4">
                <label className="block text-[#737272] font-semibold mb-2">Bank Logo</label>
                {getBankLogo(formData.bankName) ? (
                  <img
                    src={getBankLogo(formData.bankName)}
                    alt={formData.bankName}
                    className="max-h-16 max-w-full rounded-md bg-gray-100 object-contain"
                  />
                ) : (
                  <div className="max-h-16 w-full rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                    No logo available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8 gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white font-semibold"
          >
            {editData ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsModal;
