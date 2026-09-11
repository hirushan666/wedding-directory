"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/VisitorAuthContext";
import { uploadProfilePicture } from "@/api/upload/visitor.upload";
import { ProfilePictureProps } from "@/types/uploadTypes";
import { Camera, Loader2 } from "lucide-react";

const ProfilePicture: React.FC<ProfilePictureProps> = ({ profilePic, setProfilePic }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { visitor } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleProfilePicClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && visitor?.id) {
      setIsUploading(true);
      try {
        const fileUrl = await uploadProfilePicture(file, visitor.id);
        setProfilePic(fileUrl || '/images/dashboardProfilePic.webp');
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div
      className="relative w-64 sm:w-72 h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md cursor-pointer group border border-amber-100/60 bg-gray-50 shrink-0"
      onClick={handleProfilePicClick}
      title="Click to change couple photo"
    >
      <Image
        src={profilePic || '/images/dashboardProfilePic.webp'}
        alt="Wedding couple photo"
        fill
        sizes="(max-width: 768px) 256px, 288px"
        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        priority
      />

      {/* Hover or Uploading Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1.5 ${
          isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={24} className="animate-spin text-orange" />
            <span className="text-xs font-medium">Uploading...</span>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Camera size={18} />
            </div>
            <span className="text-xs font-medium tracking-wide">Change Photo</span>
          </>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleProfilePicChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ProfilePicture;

