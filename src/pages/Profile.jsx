import React, { useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import { getUserData } from "../api/api";

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
    buildingName: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
  });
  const [socialMediaIcons, setSocialMediaIcons] = useState(
    Array(4).fill().map(() => ({ icon: null, link: "" }))
  );

  const userName = localStorage.getItem("userName") || "";

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
        buildingName: userData.buildingName || "",
        city: userData.city || "",
        country: userData.country || "",
        latitude: userData.latitude || "",
        longitude: userData.longitude || "",
      });

      // Set S3 logo URL
      if (userData.logo) {
        setImage(userData.logo);
      }

      if (userData.socialMedia) {
        setSocialMediaIcons(userData.socialMedia.map((item, index) => ({
          icon: item.icon || null,
          link: item.link || ""
        })).concat(Array(4).fill().map(() => ({ icon: null, link: "" }))).slice(0, 4));
      }
    }
  }, [userData]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserData(userName);
      if (response.data?.success) {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileUpload = useCallback((file, setter, index = null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (index !== null) {
        setSocialMediaIcons(prev => {
          const newIcons = [...prev];
          newIcons[index] = { ...newIcons[index], icon: reader.result };
          return newIcons;
        });
      } else {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSocialMediaLinkChange = useCallback((index, value) => {
    setSocialMediaIcons(prev => {
      const newIcons = [...prev];
      newIcons[index] = { ...newIcons[index], link: value };
      return newIcons;
    });
  }, []);

  const handleRemoveFile = useCallback((type, index = null) => {
    if (type === "logo") {
      setImage(null);
    } else if (type === "socialIcon" && index !== null) {
      setSocialMediaIcons(prev => {
        const newIcons = [...prev];
        newIcons[index] = { ...newIcons[index], icon: null };
        return newIcons;
      });
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const submissionData = {
      logo: image,
      ...formData,
      socialMedia: socialMediaIcons.filter(icon => icon.icon || icon.link)
    };
    console.log("Form submitted:", submissionData);
    // API call with submissionData
  }, [image, formData, socialMediaIcons]);

  const handleReset = useCallback(() => {
    setImage(null);
    setFormData({
      companyName: "",
      emailAddress: "",
      phoneNumber: "",
      whatsappNumber: "",
      buildingName: "",
      city: "",
      country: "",
      latitude: "",
      longitude: "",
    });
    setSocialMediaIcons(Array(4).fill().map(() => ({ icon: null, link: "" })));
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full">
      <Header
        title="Company Profile"
        description="Update and manage your company profile details seamlessly."
      />
      <form onSubmit={handleSubmit} className="bg-white rounded-xl mx-16 px-16 py-10 mb-20">
        {/* Company Logo Section */}
        <section className="flex flex-col items-start">
          <h2 className="font-inter font-bold text-[18px]">Company Logo</h2>
          <div className="flex flex-row items-center gap-8 mt-5">
            <div className={`w-[70px] h-[70px] rounded-[50%] ${image ? "bg-white" : "bg-gray-300"} flex items-center justify-center overflow-hidden`}>
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
              onChange={(e) => handleFileUpload(e.target.files[0], setImage)}
              className="hidden"
              id="logo-upload"
            />

            <label
              htmlFor="logo-upload"
              className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
            >
              {image ? "Change Logo" : "Upload Company Logo"}
            </label>

            {image && (
              <button
                type="button"
                onClick={() => handleRemoveFile("logo")}
                className="border-2 text-[#156AEF] border-[#32B4DB] rounded-md font-semibold px-5 py-2 text-md"
              >
                Remove
              </button>
            )}
          </div>
        </section>

        {/* Organisation Information Section */}
        <section className="flex flex-col items-start mt-14">
          <h2 className="font-inter font-bold text-[18px]">
            Organisation Information
          </h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-5 w-3/4">
            {[
              { label: "Company Name", name: "companyName", type: "text" },
              { label: "Email Address", name: "emailAddress", type: "email" },
              { label: "Phone Number", name: "phoneNumber", type: "number" },
              {
                label: "Whatsapp Number",
                name: "whatsappNumber",
                type: "number",
              },
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
                      field.type === "number"
                        ? "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none appearance-none"
                        : ""
                    }`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Address Section */}
        <section className="flex flex-col items-start mt-14">
          <h2 className="font-inter font-bold text-[18px]">Address</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-5 w-3/4">
            {[
              {
                label: "Building Name/ Number",
                name: "buildingName",
                type: "text",
              },
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

        {/* Social Media Section */}
        <section className="flex flex-col items-start mt-14">
          <h2 className="font-inter font-bold text-[18px]">Social Media</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 mt-5 w-1/2">
            {socialMediaIcons.map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-5">
                  <label className="font-inter font-semibold text-[16px] text-[#737272]">
                    Add Icon
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e.target.files[0], null, null, index)
                    }
                    className="hidden"
                    id={`social-icon-upload-${index}`}
                  />
                  <label
                    htmlFor={`social-icon-upload-${index}`}
                    className={`w-[50px] h-[50px] rounded-[50%] ${
                      item.icon ? "bg-white" : "bg-gray-300"
                    } flex items-center justify-center cursor-pointer`}
                  >
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt={`Social Media Icon ${index + 1}`}
                        className="w-full h-full object-cover rounded-[50%]"
                      />
                    )}
                  </label>

                  {item.icon && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("socialIcon", index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex items-end gap-5 mt-3">
                  <label className="font-inter font-semibold text-[16px] text-[#737272]">
                    Add Link
                  </label>
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) =>
                      handleSocialMediaLinkChange(index, e.target.value)
                    }
                    className="border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 font-semibold w-[200px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <div className="flex flex-row justify-end mt-5 gap-5">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleReset}
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