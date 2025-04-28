import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  Tab,
} from "@nextui-org/react";
import {
  BorderBottom,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Upload, Loader2, Video, X } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../axios/axios";
import Header from "../components/Header";

const Banner = () => {
  // Get adminId from localStorage
  const [adminId, setAdminId] = useState("");
  const [activeTab, setActiveTab] = useState("ecom");

  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");
    if (storedAdminId) {
      setAdminId(storedAdminId);
    } else {
      toast.error("Admin ID not found. Please login again.");
    }
  }, []);

  // Image Banner States
  const [bannerForm, setBannerForm] = useState({
    title: "",
    image: [],
  });
  const [banners, setBanners] = useState([]);
  const [editingEcomBanner, setEditingEcomBanner] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddEcomBanner, setShowAddEcomBanner] = useState(false);

  // Video Banner States
  const [videoBannerForm, setVideoBannerForm] = useState({
    title: "",
    videos: [],
  });
  const [videoBanners, setVideoBanner] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploadMode, setUploadMode] = useState("single");
  const [showAddVideoBanner, setShowAddVideoBanner] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Fetch Banners
  const fetchEcomBanner = useCallback(async () => {
    if (!adminId) return;

    try {
      const response = await axiosInstance.get(`/banner/${adminId}`);
      if (response.data && response.data.data) {
        setBanners(response.data.data);
      }
    } catch (err) {
      toast.error("Error loading Ecom Banner");
      console.error("Error fetching Ecom Banner:", err);
    }
  }, [adminId]);

  const fetchVideoBanner = useCallback(async () => {
    if (!adminId) return;

    try {
      const response = await axiosInstance.get(`/videoBanners/${adminId}`);
      if (response.data && response.data.data) {
        setVideoBanner(response.data.data);
      }
    } catch (err) {
      toast.error("Error loading Video Banner");
      console.error("Error fetching Video Banner:", err);
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      fetchEcomBanner();
      fetchVideoBanner();
    }
  }, [fetchEcomBanner, fetchVideoBanner, adminId]);

  // Image Banner Handlers
  const handleEcomBannerInputChange = (e) => {
    const { name, value } = e.target;
    setBannerForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileImgChangeEcomBanner = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setBannerForm((prevState) => ({
        ...prevState,
        image: fileArray,
      }));
    }
  };

  const handleAddEcomBanner = async () => {
    if (!bannerForm.title.trim()) {
      toast.error("Please enter a title for the banner");
      return;
    }

    if (bannerForm.image.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", bannerForm.title);
      formData.append("adminId", adminId);

      bannerForm.image.forEach((img) => {
        formData.append("image", img);
      });

      await axiosInstance.post(`/addBanner`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Ecom Banner added successfully!");
      setShowAddEcomBanner(false);
      setBannerForm({ title: "", image: [] });

      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      await fetchEcomBanner();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add Ecom Banner.";
      toast.error(errorMessage);
      console.error("Error adding Ecom Banner:", error);
    }
  };

  const handleEditEcomBanner = (banner) => {
    setIsEditMode(true);
    setEditingEcomBanner(banner);
    setBannerForm({
      title: banner.title,
      image: [],
    });
    setShowAddEcomBanner(true);
  };

  const handleUpdateEcomBanner = async () => {
    if (!bannerForm.title.trim()) {
      toast.error("Please enter a title for the banner");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", bannerForm.title);
      formData.append("adminId", adminId);

      if (bannerForm.image && bannerForm.image.length > 0) {
        bannerForm.image.forEach((img) => {
          formData.append("image", img);
        });
      }

      await axiosInstance.put(`/banner/${editingEcomBanner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Ecom Banner updated successfully!");
      setShowAddEcomBanner(false);
      setBannerForm({ title: "", image: [] });
      setIsEditMode(false);
      setEditingEcomBanner(null);

      await fetchEcomBanner();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update Ecom Banner.";
      toast.error(errorMessage);
      console.error("Error updating Ecom Banner:", error);
    }
  };

  const handleDeleteEcomBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this Ecom Banner?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/banner/${bannerId}/${adminId}`);
      toast.success("Ecom Banner deleted successfully");
      await fetchEcomBanner();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting Ecom Banner";
      toast.error(errorMessage);
      console.error("Error deleting Ecom Banner:", error);
    }
  };

  // Video Banner Handlers
  const handleInputVideoBannerChange = (e) => {
    const { name, value } = e.target;
    setVideoBannerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoBannerChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 500 * 1024 * 1024; // 500MB
      return isVideo && isValidSize;
    });

    if (validFiles.length === 0) {
      setMessage({
        type: "error",
        text: "Please select valid video files under 500MB",
      });
      return;
    }

    if (uploadMode === "single") {
      setVideoBannerForm((prev) => ({
        ...prev,
        videos: validFiles.slice(0, 1),
      }));
    } else {
      setVideoBannerForm((prev) => ({
        ...prev,
        videos: [...prev.videos, ...validFiles].slice(0, 5),
      }));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeVideo = (index) => {
    setVideoBannerForm((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitVideoBanner = async () => {
    if (!videoBannerForm.title.trim()) {
      setMessage({ type: "error", text: "Please enter a title" });
      return;
    }

    if (videoBannerForm.videos.length === 0) {
      setMessage({ type: "error", text: "Please select at least one video" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", videoBannerForm.title);
      videoBannerForm.videos.forEach((video) => {
        formData.append("video", video);
      });

      const response = await axiosInstance.post(
        `/video-banner/create/${adminId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!response.data.success) throw new Error("Upload failed");

      toast.success(
        response.data.message || "Video banner created successfully"
      );
      setShowAddVideoBanner(false);
      setVideoBannerForm({ title: "", videos: [] });
      await fetchVideoBanner();
    } catch (error) {
      console.error("Submit error:", error);
      setMessage({
        type: "error",
        text: "Failed to save banner. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideoBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this Video Banner?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/videoBanner/${bannerId}/${adminId}`);
      toast.success("Video Banner deleted successfully");
      await fetchVideoBanner();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting Video Banner";
      toast.error(errorMessage);
      console.error("Error deleting Video Banner:", error);
    }
  };

  // Reset forms
  const openAddEcomBanner = () => {
    setIsEditMode(false);
    setEditingEcomBanner(null);
    setBannerForm({ title: "", image: [] });
    setShowAddEcomBanner(true);
  };

  const closeAddEcomBanner = () => {
    setShowAddEcomBanner(false);
    setBannerForm({ title: "", image: [] });
    setIsEditMode(false);
    setEditingEcomBanner(null);
  };

  const openAddVideoBanner = () => {
    setVideoBannerForm({ title: "", videos: [] });
    setMessage(null);
    setShowAddVideoBanner(true);
  };

  const closeAddVideoBanner = () => {
    setShowAddVideoBanner(false);
    setVideoBannerForm({ title: "", videos: [] });
    setMessage(null);
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Render Ecom Banner Form
  const renderEcomBannerForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-96">
        <h3 className="text-lg font-semibold mb-4">
          {isEditMode ? "Edit Ecom Banner" : "Add New Ecom Banner"}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Enter Banner Title"
            value={bannerForm.title}
            onChange={handleEcomBannerInputChange}
            className="w-[300px] p-2 border-2 border-gray-500 rounded-lg"
            required
          />
          <div>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              id="ecom-image-uploader"
              onChange={handleFileImgChangeEcomBanner}
              className="hidden"
              multiple
            />
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload banner images
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Select one or more images
              </p>
            </div>
          </div>
          {bannerForm.image.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Selected Images ({bannerForm.image.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {Array.from(bannerForm.image).map((file, index) => (
                  <div key={index} className="relative">
                    <div className="text-xs bg-gray-100 p-2 rounded truncate">
                      {file.name.substring(0, 20)}
                      {file.name.length > 20 ? "..." : ""}
                    </div>
                    <Button
                      size="sm"
                      isIconOnly
                      color="danger"
                      className="absolute -top-2 -right-2"
                      onClick={() => {
                        const newImages = [...bannerForm.image];
                        newImages.splice(index, 1);
                        setBannerForm({
                          ...bannerForm,
                          image: newImages,
                        });
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              auto
              flat
              className="bg-red-500 text-white rounded-lg"
              onClick={closeAddEcomBanner}
            >
              Cancel
            </Button>

            <Button
              auto
              className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white hover:bg-blue-700 rounded-lg"
              onClick={
                isEditMode ? handleUpdateEcomBanner : handleAddEcomBanner
              }
            >
              {isEditMode ? "Update Banner" : "Add Banner"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render Video Banner Form
  const renderVideoBannerForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Video Banner</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              auto
              onClick={() => setUploadMode("single")}
              color={uploadMode === "single" ? "primary" : "default"}
              className={
                uploadMode === "single" ? "bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-lg" : ""
              }
            >
              Single
            </Button>
            <Button
              size="sm"
              auto
              onClick={() => setUploadMode("multiple")}
              color={uploadMode === "multiple" ? "primary" : "default"}
              className={
                uploadMode === "multiple" ? "bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-lg" : ""
              }
            >
              Multiple
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Enter Video Banner Title"
            value={videoBannerForm.title}
            onChange={handleInputVideoBannerChange}
            className="w-[300px] p-2 border-2 border-gray-500 rounded-lg"
            required
          />
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              name="video"
              ref={fileInputRef}
              onChange={handleVideoBannerChange}
              accept="video/*"
              multiple={uploadMode === "multiple"}
              className="hidden"
            />
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click or drag videos to upload
              {uploadMode === "multiple" && " (up to 5 videos)"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 500MB
            </p>
          </div>
          {videoBannerForm.videos.length > 0 && (
            <div className="space-y-2">
              {videoBannerForm.videos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-gray-500" />
                    <div className="text-sm">
                      <p className="font-medium truncate max-w-[200px]">
                        {video.name}
                      </p>
                      <p className="text-gray-500">
                        {(video.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    isIconOnly
                    color="danger"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {message && (
            <div
              className={`p-2 rounded text-sm ${
                message.type === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button auto flat className="bg-red-500 text-white rounded-lg" onClick={closeAddVideoBanner}>
              Cancel
            </Button>
            <Button
              auto
              className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-lg"
              onClick={handleSubmitVideoBanner}
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              ) : (
                "Add Video Banner"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render Ecom Banners List
  const renderEcomBannersList = () => {
    return (
      <div className="bg-white rounded-lg shadow-md py-8">
        <div className="flex justify-between items-center mb-4 px-8">
          <h3 className="text-lg font-semibold">Ecom Banners</h3>
          <Button
            auto
            size="sm"
            onClick={openAddEcomBanner}
            className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] hover:bg-blue-600 text-white rounded-lg p-4"
          >
            Add New Banner
          </Button>
        </div>
        <table className="min-w-full border-collapse table-auto">
          <thead className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white">
            <tr>
              <th className="px-4 py-3 w-[300px] text-left">Image</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 w-[120px] text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {banners.length > 0 ? (
              banners.map((banner) => (
                <tr key={banner._id} className="border-b border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-300">
                    {banner.imageUrl && banner.imageUrl[0] && (
                      <img
                        src={banner.imageUrl[0]}
                        alt={banner.title}
                        className="w-[60px] h-[60px] object-cover rounded"
                      />
                    )}
                  </td>

                  <td className="px-4 py-3 border-r border-gray-300">
                    {banner.title}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEcomBanner(banner)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                      >
                        <EditIcon fontSize="small" />
                      </button>

                      <button
                        onClick={() => handleDeleteEcomBanner(banner._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No banners available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Video Banners List
  const renderVideoBannersList = () => {
    return (
      <div className="bg-white rounded-lg shadow-md py-8">
        <div className="flex justify-between items-center mb-4  px-8">
          <h3 className="text-lg font-semibold">Video Banners</h3>
          <Button auto className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white p-4 rounded-lg" size="sm" onClick={openAddVideoBanner}>
            Add New Video Banner
          </Button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white">
              <th className="py-2 px-12 text-left w-[300px]">Video</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videoBanners.length > 0 ? (
              videoBanners.map((banner, i) => (
                <tr key={i}>
                  <td className="p-2 px-12">
                    {banner.videos && banner.videos.length > 0 ? (
                      <div className="max-w-[280px]">
                        <Slider {...sliderSettings}>
                          {banner.videos.map((video, index) => (
                            <div key={index} className="p-1">
                              <video
                                src={video.location}
                                controls
                                style={{
                                  width: "100%",
                                  height: "150px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            </div>
                          ))}
                        </Slider>
                      </div>
                    ) : (
                      <span>No Videos Available</span>
                    )}
                  </td>
                  <td className="p-2 text-xl">{banner.title}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      color="danger"
                      isIconOnly
                      onClick={() => handleDeleteVideoBanner(banner._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No video banners available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Custom tabs with background color for active tab
  const CustomTabs = () => {
    return (
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${
            activeTab === "ecom"
              ? "bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-t-lg"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("ecom")}
        >
          Ecom Banners
        </button>
        <button
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${
            activeTab === "video"
              ? "bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-t-lg"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("video")}
        >
          Video Banners
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] min-h-screen">
      <Header
        title="Banner Management"
        description="Update and manage your banner content for your ecommerce platform."
      />
      <div className="px-6 md:px-10 lg:px-16 py-6">
        <div className="mb-6">
          <CustomTabs />

          <div className="mt-4">
            {activeTab === "ecom"
              ? showAddEcomBanner
                ? renderEcomBannerForm()
                : renderEcomBannersList()
              : showAddVideoBanner
              ? renderVideoBannerForm()
              : renderVideoBannersList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
