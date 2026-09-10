"use client";
import React, { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { IoMdCloudUpload, IoMdTrash } from "react-icons/io";
import { uploadOfferingBanner } from "@/api/upload/offering/banner.upload";
import { uploadOfferingImageShowcase } from "@/api/upload/offering/imageShowcase.upload";
import { uploadOfferingVideoShowcase } from "@/api/upload/offering/videoShowcase.upload";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { FIND_PORTFOLIO_BY_ID, DELETE_SHOWCASE_IMAGE, DELETE_BANNER_IMAGE, DELETE_SHOWCASE_VIDEO } from "@/graphql/queries";

const EditPortfolio: React.FC = () => {
  const params = useParams();
  // Ensure id is a string
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { loading, error, data, refetch: refetchPortfolio } = useQuery(FIND_PORTFOLIO_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const portfolio = data?.findOfferingById;

  // States for banner upload
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  // States for photo showcase upload
  const [showcasePreviews, setShowcasePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // States for video upload
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [deleteBannerImage] = useMutation(DELETE_BANNER_IMAGE);
  const [deleteShowcaseImage] = useMutation(DELETE_SHOWCASE_IMAGE);
  const [deleteShowcaseVideo] = useMutation(DELETE_SHOWCASE_VIDEO);

  // Update the state when data is fetched
  useEffect(() => {
    if (portfolio) {
      setBannerPreview(portfolio.banner || null);

      const initialPreviews = Array(5).fill(null);
      if (portfolio.photo_showcase && Array.isArray(portfolio.photo_showcase)) {
        portfolio.photo_showcase.forEach((url: string, index: number) => {
          if (index < 5) initialPreviews[index] = url;
        });
      }
      setShowcasePreviews(initialPreviews);

      if (portfolio.video_showcase && Array.isArray(portfolio.video_showcase) && portfolio.video_showcase.length > 0) {
        setVideoPreview(portfolio.video_showcase[0]);
      } else if (typeof portfolio.video_showcase === "string") {
        setVideoPreview(portfolio.video_showcase);
      } else {
        setVideoPreview(null);
      }
    }
  }, [portfolio]);

  if (loading) return <p className="p-4">Loading Photos & Media...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  // Handle Banner File Selection & Auto-upload
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);
    setBannerFile(file);
    setIsBannerUploading(true);

    try {
      await uploadOfferingBanner(file, id);
      await refetchPortfolio();
      setBannerFile(null);
      toast.success("Banner updated successfully!");
    } catch (err) {
      console.error("Failed to upload banner:", err);
      toast.error("Failed to upload banner. Please try again.");
    } finally {
      setIsBannerUploading(false);
    }
  };

  // Handle Save Banner
  const handleSaveBanner = async () => {
    if (!bannerFile || !id) return;
    setIsBannerUploading(true);
    try {
      await uploadOfferingBanner(bannerFile, id);
      await refetchPortfolio();
      setBannerFile(null);
      toast.success("Banner saved successfully!");
    } catch (err) {
      console.error("Failed to save banner:", err);
      toast.error("Failed to save banner.");
    } finally {
      setIsBannerUploading(false);
    }
  };

  // Handle Showcase Image Selection & Auto-upload for that specific slot
  const handleShowcaseChange = (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const newPreviews = [...showcasePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setShowcasePreviews(newPreviews);
    setUploadingSlot(index);

    try {
      await uploadOfferingImageShowcase([file], id, index);
      await refetchPortfolio();
      toast.success(`Image ${index + 1} uploaded successfully!`);
    } catch (err) {
      console.error(`Failed to upload showcase image ${index + 1}:`, err);
      toast.error(`Failed to upload image ${index + 1}.`);
      await refetchPortfolio();
    } finally {
      setUploadingSlot(null);
    }
  };

  // Handle Video File Selection
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    setVideoFile(file);
    setIsVideoUploading(true);

    try {
      await uploadOfferingVideoShowcase([file], id);
      await refetchPortfolio();
      setVideoFile(null);
      toast.success("Video uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload video:", err);
      toast.error("Failed to upload video.");
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!videoFile || !id) return;
    setIsVideoUploading(true);
    try {
      await uploadOfferingVideoShowcase([videoFile], id);
      await refetchPortfolio();
      setVideoFile(null);
      toast.success("Video saved successfully!");
    } catch (err) {
      console.error("Failed to upload video:", err);
      toast.error("Failed to upload video.");
    } finally {
      setIsVideoUploading(false);
    }
  };

  // Handle Delete Showcase Image
  const handleDeleteShowcase = async (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteShowcaseImage({
        variables: { id, index },
      });
      await refetchPortfolio();
      toast.success("Image removed successfully!");
    } catch (err) {
      console.error("Failed to delete image:", err);
      toast.error("Failed to delete image.");
    }
  };

  // Handle Delete Banner
  const handleDeleteBanner = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteBannerImage({
        variables: { id },
      });
      await refetchPortfolio();
      setBannerPreview(null);
      setBannerFile(null);
      toast.success("Banner deleted successfully!");
    } catch (err) {
      console.error("Failed to delete banner:", err);
      toast.error("Failed to delete banner.");
    }
  };

  // Handle Delete Video
  const handleDeleteVideo = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteShowcaseVideo({
        variables: { id },
      });
      await refetchPortfolio();
      setVideoPreview(null);
      setVideoFile(null);
      toast.success("Video deleted successfully!");
    } catch (err) {
      console.error("Failed to delete video:", err);
      toast.error("Failed to delete video.");
    }
  };

  return (
    <Fragment>
      <div className="bg-white rounded-2xl p-6 px-8 shadow-lg mb-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-title text-[30px] font-bold">Photos & Media</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your service banner, photo showcase gallery, and promotional video.
            </p>
          </div>
        </div>
        <hr className="w-[180px] h-px my-4 bg-gray-500 border-0 dark:bg-gray-700"></hr>

        {/* Upload Banner Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="font-body text-[16px] font-semibold">Upload Banner</label>
              <p className="text-xs text-gray-500">Main header image displayed on your service profile (Max 5MB)</p>
            </div>
            <div className="flex gap-2 items-center">
              {bannerPreview && (
                <button
                  type="button"
                  onClick={handleDeleteBanner}
                  className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Banner"
                >
                  <IoMdTrash size={22} className="text-red-500" />
                </button>
              )}
              {bannerFile && (
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={isBannerUploading}
                  className="px-3 py-1 bg-orange text-white text-xs rounded-md hover:bg-orange/90 flex items-center gap-1"
                >
                  {isBannerUploading ? "Saving..." : "Save Banner"}
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 w-full h-[250px] border-2 border-dashed border-gray-300 hover:border-orange rounded-xl flex justify-center items-center relative overflow-hidden bg-gray-50 transition-colors">
            <input
              id="bannerUpload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              onChange={handleBannerChange}
              disabled={isBannerUploading}
            />
            {isBannerUploading && (
              <div className="absolute inset-0 bg-white/80 z-30 flex flex-col items-center justify-center">
                <span className="animate-spin text-3xl mb-2">⌛</span>
                <p className="text-sm text-gray-700 font-medium">Uploading banner...</p>
              </div>
            )}
            {bannerPreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={bannerPreview}
                  alt="Banner Preview"
                  className="object-cover w-full h-full"
                  width={900}
                  height={600}
                  priority
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
                    Click to replace banner
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <CiCirclePlus size={36} className="text-orange mb-2" />
                <p className="text-sm font-medium text-gray-700">Click or drag image to upload banner</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Showcase Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="font-body text-[16px] font-semibold">Upload Photo Showcase</label>
              <p className="text-xs text-gray-500">Showcase up to 5 photos of your work in the service gallery</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-3">
            {Array(5)
              .fill(null)
              .map((_, index) => {
                const preview = showcasePreviews[index];
                const isUploadingThis = uploadingSlot === index;

                return (
                  <div key={index} className="relative w-full">
                    <div
                      className={`aspect-square w-full border-2 rounded-xl flex flex-col justify-center items-center relative overflow-hidden transition-all duration-200 ${
                        preview
                          ? "border-gray-200 shadow-sm"
                          : "border-dashed border-gray-300 hover:border-orange bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleShowcaseChange(index)}
                        disabled={isUploadingThis}
                        title={`Upload Photo ${index + 1}`}
                      />

                      {isUploadingThis && (
                        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                          <span className="animate-spin text-2xl mb-1">⌛</span>
                          <span className="text-[11px] text-gray-600 font-medium">Uploading...</span>
                        </div>
                      )}

                      {preview ? (
                        <div className="relative w-full h-full group">
                          <Image
                            src={preview}
                            alt={`Showcase ${index + 1}`}
                            className="object-cover w-full h-full rounded-xl"
                            fill
                          />
                          <button
                            type="button"
                            onClick={(e) => handleDeleteShowcase(index, e)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-full 
                                     shadow-md z-20 transition-colors duration-200 text-red-500"
                            title="Remove photo"
                          >
                            <IoMdTrash size={16} />
                          </button>
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white text-xs bg-black/60 px-2 py-0.5 rounded-full">
                              Change photo
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center p-4 text-center pointer-events-none">
                          <CiCirclePlus size={28} className="text-orange mb-1" />
                          <span className="text-xs font-medium text-gray-600">Photo {index + 1}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">Click to add</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Upload Video Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="font-body text-[16px] font-semibold">Upload a Video</label>
              <p className="text-xs text-gray-500">Add a video highlight of your service (MP4/WebM, max 50MB)</p>
            </div>
            <div className="flex gap-2 items-center">
              {videoPreview && (
                <button
                  type="button"
                  onClick={handleDeleteVideo}
                  className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Video"
                >
                  <IoMdTrash size={22} className="text-red-500" />
                </button>
              )}
              {videoFile && (
                <button
                  type="button"
                  onClick={handleSaveVideo}
                  disabled={isVideoUploading}
                  className="px-3 py-1 bg-orange text-white text-xs rounded-md hover:bg-orange/90 flex items-center gap-1"
                >
                  {isVideoUploading ? "Saving..." : "Save Video"}
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 w-full h-[250px] border-2 border-dashed border-gray-300 hover:border-orange rounded-xl flex justify-center items-center relative overflow-hidden bg-gray-50 transition-colors">
            <input
              id="videoUpload"
              type="file"
              accept="video/mp4,video/webm"
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              onChange={handleVideoChange}
              disabled={isVideoUploading}
            />
            {isVideoUploading && (
              <div className="absolute inset-0 bg-white/80 z-30 flex flex-col items-center justify-center">
                <span className="animate-spin text-3xl mb-2">⌛</span>
                <p className="text-sm text-gray-700 font-medium">Uploading video...</p>
              </div>
            )}
            {videoPreview ? (
              <div className="relative w-full h-full">
                <video className="object-cover w-full h-full rounded-xl" controls>
                  <source src={videoPreview} type="video/mp4" />
                </video>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <CiCirclePlus size={36} className="text-orange mb-2" />
                <p className="text-sm font-medium text-gray-700">Click or drag video to upload</p>
                <p className="text-xs text-gray-400 mt-1">MP4 or WebM (Max 50MB)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditPortfolio;
