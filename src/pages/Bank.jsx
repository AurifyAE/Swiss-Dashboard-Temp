import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import BankDetailsModal from "../components/bank/BankDetailsModal";
import {
  saveBankDetails,
  updateBankDetails,
  deleteBankDetails,
  getUserData,
} from "../api/api";
import { bankLogoMap } from "../utils/bankLogoMap";

function Bank() {
  const title = "Bank Details";
  const description = "Update and manage your company bank details here.";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState([]);
  const [editingBank, setEditingBank] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const userName = localStorage.getItem("userName") || {};

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getUserData(userName);

      if (response.data && response.data.success) {
        const bankDetailsData = response.data.data?.bankDetails || [];
        setBankDetails(
          Array.isArray(bankDetailsData) ? bankDetailsData : [bankDetailsData]
        );
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData) => {
    setIsLoading(true);
    try {
      const dataWithUserName = { ...formData, userName };

      if (editingBank !== null) {
        const bankToUpdate = bankDetails[editingBank];
        const response = await updateBankDetails({
          ...dataWithUserName,
          bankDetailId: bankToUpdate._id,
        });

        if (response.data.success) {
          const updatedBankDetails = [...bankDetails];
          updatedBankDetails[editingBank] = response.data.data;
          setBankDetails(updatedBankDetails);
        }
      } else {
        const response = await saveBankDetails(dataWithUserName);

        if (response.data.success) {
          setBankDetails([...bankDetails, response.data.data]);
        }
      }
    } catch (error) {
      console.error("Error saving bank details:", error);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setEditingBank(null);
    }
  };

  const handleEdit = (index) => {
    setEditingBank(index);
    setIsModalOpen(true);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteIndex === null) return;

    const bankToDelete = bankDetails[deleteIndex];
    setIsLoading(true);

    try {
      const response = await deleteBankDetails(userName, bankToDelete._id);

      if (response.data.success) {
        const updatedBankDetails = [...bankDetails];
        updatedBankDetails.splice(deleteIndex, 1);
        setBankDetails(updatedBankDetails);
      }
    } catch (error) {
      console.error(
        "Error deleting bank details:",
        error.response?.data || error
      );
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteIndex(null);
    }
  };

  const handleAddNew = () => {
    setEditingBank(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBank(null);
  };

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full min-h-screen">
      <Header title={title} description={description} />
      <div className="mx-16 my-10">
        <div className="flex justify-end">
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Add"}
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white p-10 rounded-xl mt-5 text-center">
            <p className="text-[#737272] text-lg">Loading bank details...</p>
          </div>
        ) : bankDetails.length === 0 ? (
          <div className="bg-white p-10 rounded-xl mt-5 text-center">
            <p className="text-[#737272] text-lg">
              No bank details added yet. Click the "Add" button to add your
              first bank details.
            </p>
          </div>
        ) : (
          bankDetails.map((bank, index) => (
            <div
              key={index}
              className="bg-white grid grid-cols-6 gap-x-6 gap-y-8 p-10 rounded-xl mt-5"
            >
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  Holder Name
                </label>
                <span className="text-[18px] font-semibold">
                  {bank.holderName}
                </span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  Bank Name
                </label>
                <span className="text-[18px] font-semibold">
                  {bank.bankName}
                </span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  Account Number
                </label>
                <span className="text-[18px] font-semibold">
                  {bank.accountNumber}
                </span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  IBAN
                </label>
                <span className="text-[18px] font-semibold">{bank.iban}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  IFSC
                </label>
                <span className="text-[18px] font-semibold">{bank.ifsc}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  SWIFT
                </label>
                <span className="text-[18px] font-semibold">{bank.swift}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  Branch
                </label>
                <span className="text-[18px] font-semibold">{bank.branch}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  City
                </label>
                <span className="text-[18px] font-semibold">{bank.city}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  Country
                </label>
                <span className="text-[18px] font-semibold">
                  {bank.country}
                </span>
              </div>
              <div className="flex flex-col">
                {bank.logo ? (
                  <img src={bank.logo} alt="Bank Logo" className="w-40 h-20" />
                ) : bank.bankName && bankLogoMap[bank.bankName] ? (
                  <img
                    src={bankLogoMap[bank.bankName]}
                    alt="Bank Logo"
                    className="w-40 h-20"
                  />
                ) : (
                  <span className="text-[16px] text-gray-400">No logo</span>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-[#737272] text-[16px] font-semibold">
                  Action
                </label>
                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(index)}
                    className="bg-gradient-to-r from-[#F44336] to-[#D32F2F] px-4 py-2 rounded-md text-white text-md font-semibold"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BankDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editData={editingBank !== null ? bankDetails[editingBank] : null}
        isLoading={isLoading}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="text-gray-600">
              Do you really want to delete this bank detail?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={handleDeleteConfirmed}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bank;
