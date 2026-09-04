"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { uploadVendorProfilePicture } from "@/api/upload/vendor.upload";
import { toast } from "react-hot-toast";
import { FiCamera, FiUploadCloud } from "react-icons/fi";

interface VendorProfilePictureProps {
  vendorId: string;
  initialPic?: string;
  onUploadSuccess?: (fileUrl: string) => void;
}

const VendorProfilePicture: React.FC<VendorProfilePictureProps> = ({
  vendorId,
  initialPic,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string>(
    initialPic || "/images/visitorPlaceholder.png"
  );
  const [isUploading, setIsUploading] = useState(false);

  // Sync state if initialPic changes from parent query
  React.useEffect(() => {
    if (initialPic) {
      setProfilePic(initialPic);
    }
  }, [initialPic]);

  const handleContainerClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP formats are supported");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Updating profile picture...", {
      style: { background: "#333", color: "#fff" },
    });

    try {
      const fileUrl = await uploadVendorProfilePicture(file, vendorId);
      setProfilePic(fileUrl);
      if (onUploadSuccess) {
        onUploadSuccess(fileUrl);
      }
      toast.success("Profile picture updated successfully!", {
        id: toastId,
        style: { background: "#333", color: "#fff" },
      });
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      toast.error("Failed to update profile picture. Please try again.", {
        id: toastId,
        style: { background: "#333", color: "#fff" },
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 mb-6 bg-gray-50 border border-gray-200 rounded-xl">
      <div
        className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-orange shadow-sm flex-shrink-0"
        onClick={handleContainerClick}
        title="Click to change profile picture"
      >
        <Image
          src={profilePic || "/images/visitorPlaceholder.png"}
          alt="Vendor Profile Picture"
          width={96}
          height={96}
          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-75"
        />

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FiCamera className="text-white text-2xl" />
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <h4 className="font-semibold text-gray-800 text-base">Profile Picture</h4>
        <p className="text-sm text-gray-500 mb-3">
          JPG, PNG or WEBP (Max 5MB). Click to upload or replace.
        </p>
        <button
          type="button"
          onClick={handleContainerClick}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange hover:bg-orange/90 rounded-md shadow-sm transition-colors disabled:opacity-50"
        >
          <FiUploadCloud className="text-base" />
          {isUploading ? "Updating..." : "Change Picture"}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
};

export default VendorProfilePicture;
