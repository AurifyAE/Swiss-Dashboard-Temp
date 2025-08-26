import React, { useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import { getUserData, updateUserData, uploadLogo } from "../api/api";

// Predefined platform icons
const platformIcons = {
  facebook: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%3A3B5998'%3E%3Cpath d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z'/%3E%3C/svg%3E",
  twitter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%3A1DA1F2'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
  instagram: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%3AE1306C'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.148 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 3.668.227 1.981 1.97 1.826 5.354.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.155 3.384 1.898 5.071 5.282 5.226 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c3.384-.155 5.071-1.842 5.226-5.226.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.155-3.384-1.842-5.071-5.226-5.226C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100-2.881 1.44 1.44 0 000 2.881z'/%3E%3C/svg%3E",
  linkedin: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%3A0A66C2'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h-.003z'/%3E%3C/svg%3E",
  whatsapp: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%3A25D366'%3E%3Cpath d='M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.112 1.517 5.862L0 24l6.305-1.653C8.072 23.39 10.008 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.195 18.315c-.34 1.01-1.01 1.832-2.008 2.315-.998.482-2.087.573-3.315.256-1.228-.317-2.555-.947-4.02-1.896-2.93-1.896-4.82-4.213-5.746-6.996-.926-2.783-.258-5.78 1.92-7.97.57-.57 1.245-.856 2.02-.856.775 0 1.55.286 2.125.856l.574.574c.285.285.428.66.428 1.035s-.143.75-.428 1.035l-.573.574c-.285.285-.66.428-1.035.428-.375 0-.75-.143-1.035-.428l-.573-.573c-.57-.57-1.245-.856-2.02-.856s-1.45.286-2.02.856c-1.71 1.71-2.378 4.707-1.452 7.49.926 2.783 2.816 5.1 5.746 6.996 1.465.948 2.792 1.578 4.02 1.896 1.228.317 2.317.226 3.315-.256.998-.482 1.668-1.305 2.008-2.315.34-1.01.114-1.99-.573-2.677l-.573-.573c-.285-.285-.66-.428-1.035-.428s-.75.143-1.035.428l-.573.573c-.285.285-.66.428-1.035.428s-.75-.143-1.035-.428l-.573-.573c-.285-.285-.428-.66-.428-1.035s.143-.75.428-1.035l.573-.573c.285-.285.66-.428 1.035-.428s.75.143 1.035.428l.573.573c.57.57 1.245.856 2.02.856s1.45-.286 2.02-.856c.687-.687.913-1.667.573-2.677z'/%3E%3C/svg%3E",
  default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%3A6B7280'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z'/%3E%3C/svg%3E"
};

function Profile() {
  // Form states
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    emailAddress: "",
    phoneNumber: "",
    whatsappNumber: "",
    buildingNameNumber: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
  });
  const [socialMediaIcons, setSocialMediaIcons] = useState([]);
  const [newSocialMedia, setNewSocialMedia] = useState({ platform: "", link: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // Track index of link being edited

  const userName = localStorage.getItem("userName") || "";
  const adminId = localStorage.getItem("adminId") || "";

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        companyName: userData.companyName || "",
        emailAddress: userData.email || "",
        phoneNumber: userData.contact || "",
        whatsappNumber: userData.whatsapp || "",
        buildingNameNumber: userData.address.buildingNameNumber || "",
        city: userData.address.city || "",
        country: userData.address.country || "",
        latitude: userData.address.latitude || "",
        longitude: userData.address.longitude || "",
      });

      if (userData.logo) {
        setImage(userData.logo);
      }

      if (userData.socialMedia) {
        setSocialMediaIcons(
          userData.socialMedia.map((item) => ({
            platform: item.platform || "",
            link: item.link || "",
          }))
        );
      }
    }
  }, [userData]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserData(userName);
      console.log(response.data);
      if (response.data?.success) {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: "error", text: "Failed to fetch user data." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewSocialMediaChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewSocialMedia((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddSocialMedia = useCallback(async () => {
    if (newSocialMedia.platform && newSocialMedia.link) {
      let updatedSocialMediaIcons = [...socialMediaIcons];

      if (editIndex !== null) {
        updatedSocialMediaIcons[editIndex] = { ...newSocialMedia };
      } else {
        updatedSocialMediaIcons = [...updatedSocialMediaIcons, { ...newSocialMedia }];
      }

      setSocialMediaIcons(updatedSocialMediaIcons);
      setNewSocialMedia({ platform: "", link: "" });
      setEditIndex(null);
      setIsModalOpen(false);

      const address = {
        buildingNameNumber: formData.buildingNameNumber,
        city: formData.city,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const updatedUserData = {
        userName: userName,
        email: formData.emailAddress,
        mobile: formData.phoneNumber,
        companyName: formData.companyName,
        whatsapp: formData.whatsappNumber,
        address: address,
        socialMedia: updatedSocialMediaIcons.filter((item) => item.platform && item.link),
      };

      setIsLoading(true);
      try {
        const response = await updateUserData(adminId, updatedUserData);
        if (response.data?.success) {
          setMessage({
            type: "success",
            text: editIndex !== null
              ? "Social media link updated successfully!"
              : "Social media link added successfully!",
          });
          await fetchUserData();
        } else {
          setMessage({
            type: "error",
            text: response.data?.message || "Failed to update profile with social media.",
          });
          setSocialMediaIcons(socialMediaIcons);
        }
      } catch (error) {
        console.error("Error updating user data with social media:", error);
        setMessage({
          type: "error",
          text: "An error occurred while updating the social media link.",
        });
        setSocialMediaIcons(socialMediaIcons);
      } finally {
        setIsLoading(false);
      }
    } else {
      setMessage({ type: "error", text: "Please fill in both platform and link." });
    }
  }, [newSocialMedia, socialMediaIcons, formData, userName, adminId, editIndex]);

  const handleEditSocialMedia = useCallback((index) => {
    setNewSocialMedia(socialMediaIcons[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  }, [socialMediaIcons]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setMessage({ type: "", text: "" });

      const address = {
        buildingNameNumber: formData.buildingNameNumber,
        city: formData.city,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const userData = {
        userName: userName,
        email: formData.emailAddress,
        mobile: formData.phoneNumber,
        companyName: formData.companyName,
        whatsapp: formData.whatsappNumber,
        address: address,
        socialMedia: socialMediaIcons.filter((item) => item.platform || item.link),
      };

      try {
        const response = await updateUserData(adminId, userData);
        if (response.data?.success) {
          setMessage({ type: "success", text: "Profile updated successfully!" });
          await fetchUserData();
        } else {
          setMessage({
            type: "error",
            text: response.data?.message || "Failed to update profile.",
          });
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        setMessage({
          type: "error",
          text: "An error occurred while updating the profile.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, socialMediaIcons, userName, adminId]
  );

  const handleReset = useCallback(() => {
    setImage(null);
    setFormData({
      companyName: "",
      emailAddress: "",
      phoneNumber: "",
      whatsappNumber: "",
      buildingNameNumber: "",
      city: "",
      country: "",
      latitude: "",
      longitude: "",
    });
    setSocialMediaIcons([]);
    setMessage({ type: "", text: "" });
  }, []);

  const handleLogoUpload = async (file) => {
    if (!file) return;

    setIsLoading(true);
    try {
      const response = await uploadLogo(userName, file);
      console.log("Response from uploadLogo:", response.data); // Debug log
      if (response.data.success) {
        setImage(response.data.data?.logo || response.data.logo); // Use response.data.logo
        setMessage({ type: "success", text: "Logo uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to upload logo." });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred while uploading the logo.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full">
      <Header
        title="Company Profile"
        description="Update and manage your company profile details seamlessly."
      />
      {message.text && (
        <div
          className={`mx-16 mb-5 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl mx-16 px-16 py-10 mb-20"
      >
        <section className="flex flex-col items-start">
          <h2 className="font-inter font-bold text-[18px]">Company Logo</h2>
          <div className="flex flex-row items-center gap-8 mt-5">
            <div
              className={`w-[70px] h-[70px] rounded-[50%] ${
                image ? "bg-white" : "bg-gray-300"
              } flex items-center justify-center overflow-hidden`}
            >
              {image && (
                <img
                  src={image}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "fallback-image-url";
                  }}
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
            >
              {image ? "Change Logo" : "Upload Company Logo"}
            </label>
          </div>
        </section>

        <section className="flex flex-col items-start mt-14">
          <h2 className="font-inter font-bold text-[18px]">
            Organisation Information
          </h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-5 w-3/4">
            {[
              { label: "Company Name", name: "companyName", type: "text" },
              { label: "Email Address", name: "emailAddress", type: "email" },
              { label: "Phone Number", name: "phoneNumber", type: "tel" },
              { label: "Whatsapp Number", name: "whatsappNumber", type: "tel" },
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="font-inter font-semibold text-[16px] text-[#737272]">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className={`border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 mt-3 font-semibold
                    ${
                      field.type === "tel"
                        ? "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none appearance-none"
                        : ""
                    }`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start mt-14">
          <h2 className="font-inter font-bold text-[18px]">Address</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-5 w-3/4">
            {[
              { label: "Building Name/ Number", name: "buildingNameNumber", type: "text" },
              { label: "City", name: "city", type: "text" },
              { label: "Country", name: "country", type: "text" },
              { label: "Latitude", name: "latitude", type: "text" },
              { label: "Longitude", name: "longitude", type: "text" },
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="font-inter font-semibold text-[16px] text-[#737272]">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className="border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 mt-3 font-semibold"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start mt-14">
          <h2 className="font-inter font-bold text-[18px]">Social Media</h2>
          <button
            type="button"
            onClick={() => {
              setNewSocialMedia({ platform: "", link: "" });
              setEditIndex(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer mt-5"
          >
            Add Social Media
          </button>
          <div className="mt-5 w-1/2">
            {socialMediaIcons.length > 0 ? (
              <div className="space-y-3">
                {socialMediaIcons.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden"
                        style={{
                          backgroundColor:
                            item.platform.toLowerCase() === "whatsapp"
                              ? "#25D366"
                              : item.platform.toLowerCase() === "facebook"
                              ? "#3B5998"
                              : item.platform.toLowerCase() === "twitter"
                              ? "#1DA1F2"
                              : item.platform.toLowerCase() === "instagram"
                              ? "#E1306C"
                              : item.platform.toLowerCase() === "linkedin"
                              ? "#0A66C2"
                              : "#6B7280", // Default color
                        }}
                      >
                        <img
                          src={platformIcons[item.platform.toLowerCase()] || platformIcons.default}
                          alt={`${item.platform} Icon`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-inter font-semibold text-[16px] uppercase text-gray-800">
                          {item.platform}
                        </span>
                        <span className="font-inter text-[14px] text-gray-600 ml-2">
                          {item.link}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditSocialMedia(index)}
                      className="text-gray-500 hover:text-[#156AEF] focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-inter text-[16px] text-[#737272]">
                No social media links added yet.
              </p>
            )}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[400px]">
              <h2 className="font-inter font-bold text-[18px] mb-5">
                {editIndex !== null ? "Update Social Media" : "Add Social Media"}
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="font-inter font-semibold text-[16px] text-[#737272]">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    name="platform"
                    value={newSocialMedia.platform}
                    onChange={handleNewSocialMediaChange}
                    placeholder="e.g., Facebook, Twitter"
                    className="border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 mt-2 font-semibold"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-inter font-semibold text-[16px] text-[#737272]">
                    Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={newSocialMedia.link}
                    onChange={handleNewSocialMediaChange}
                    placeholder="https://"
                    className="border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 mt-2 font-semibold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleAddSocialMedia}
                  className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
                >
                  {editIndex !== null ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewSocialMedia({ platform: "", link: "" });
                    setEditIndex(null);
                    setIsModalOpen(false);
                  }}
                  className="border-2 text-[#156AEF] border-[#32B4DB] rounded-md font-semibold px-5 py-2 text-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row justify-end mt-5 gap-5">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="border-2 text-[#156AEF] border-[#32B4DB] rounded-md font-semibold px-5 py-2 text-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;