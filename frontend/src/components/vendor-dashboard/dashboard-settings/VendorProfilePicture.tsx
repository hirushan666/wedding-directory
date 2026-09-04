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
    <div className="flex items-center gap-5 pb-6 mb-6 border-b border-gray-100">
      <div
        className="relative group cursor-pointer w-20 h-20 rounded-full flex-shrink-0"
        onClick={handleContainerClick}
        title="Click to change profile picture"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-orange/20 shadow-md">
          <Image
            src={profilePic || "/images/visitorPlaceholder.png"}
            alt="Vendor Profile Picture"
            width={80}
            height={80}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Camera badge */}
        <div className="absolute -bottom-1 -right-1 bg-orange text-white p-2 rounded-full shadow-md hover:bg-orange/90 transition-colors ring-2 ring-white">
          <FiCamera className="text-sm" />
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-orange">Profile Photo</span>
        <h4 className="text-base font-medium text-gray-900 mt-0.5">Display Picture</h4>
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={handleContainerClick}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange bg-orange/10 hover:bg-orange/20 active:scale-95 rounded-lg transition-all disabled:opacity-50"
          >
            <FiUploadCloud className="text-sm" />
            {isUploading ? "Updating..." : "Change Photo"}
          </button>
          <span className="text-xs text-gray-400">JPG, PNG, WEBP &bull; Max 5MB</span>
        </div>
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
