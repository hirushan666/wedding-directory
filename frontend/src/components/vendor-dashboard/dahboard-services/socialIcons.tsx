import React from "react";
import { SlSocialFacebook, SlSocialInstagram } from "react-icons/sl";
import { GoGlobe } from "react-icons/go";
import { FaXTwitter } from "react-icons/fa6";
import { SocialTypes } from "@/types/offeringTypes";
import toast from "react-hot-toast";

const SocialIcons = ({ offering }: { offering?: SocialTypes }) => {
  const socialLinks = [
    {
      id: "website",
      name: "website",
      url: offering?.website,
      icon: GoGlobe,
      title: "Visit Website",
    },
    {
      id: "facebook",
      name: "Facebook",
      url: offering?.facebook,
      icon: SlSocialFacebook,
      title: "Visit Facebook Page",
    },
    {
      id: "instagram",
      name: "Instagram",
      url: offering?.instagram,
      icon: SlSocialInstagram,
      title: "Visit Instagram Profile",
    },
    {
      id: "x",
      name: "X (Twitter)",
      url: offering?.x,
      icon: FaXTwitter,
      title: "Visit X Profile",
    },
  ];

  const handleClick = (item: (typeof socialLinks)[0]) => {
    if (!item.url || item.url.trim().length === 0) {
      toast.error(`No ${item.name} link provided`);
      return;
    }

    const fullUrl =
      item.url.startsWith("http://") || item.url.startsWith("https://")
        ? item.url
        : `https://${item.url}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-row text-2xl items-center justify-end gap-x-4">
      {socialLinks.map((item) => {
        const Icon = item.icon;
        const hasLink = Boolean(item.url && item.url.trim().length > 0);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={`transition-all duration-150 cursor-pointer ${
              hasLink
                ? "text-orange hover:scale-110 active:scale-95"
                : "text-gray-300 hover:text-gray-400"
            }`}
            title={
              hasLink ? item.title : `No ${item.name} link provided`
            }
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

export default SocialIcons;