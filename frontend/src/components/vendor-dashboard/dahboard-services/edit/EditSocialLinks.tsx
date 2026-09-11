"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { FIND_SERVICE_BY_ID } from "@/graphql/queries";
import { UPDATE_SERVICE_SOCIALS } from "@/graphql/mutations";
import toast from "react-hot-toast";
import { FiShare2 } from "react-icons/fi";
import { GoGlobe } from "react-icons/go";
import { SlSocialFacebook, SlSocialInstagram } from "react-icons/sl";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";

interface SocialFormState {
  website: string;
  x: string;
  tiktok: string;
  facebook: string;
  instagram: string;
}

const EditSocialLinks: React.FC = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { loading, error, data, refetch } = useQuery(FIND_SERVICE_BY_ID, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const serviceData = data?.findOfferingById;

  const [form, setForm] = useState<SocialFormState>({
    website: "",
    x: "",
    tiktok: "",
    facebook: "",
    instagram: "",
  });

  useEffect(() => {
    if (serviceData) {
      setForm({
        website: serviceData.website || "",
        x: serviceData.x || "",
        tiktok: serviceData.tiktok || "",
        facebook: serviceData.facebook || "",
        instagram: serviceData.instagram || "",
      });
    }
  }, [serviceData]);

  const [updateSocials, { loading: isSaving }] = useMutation(
    UPDATE_SERVICE_SOCIALS,
    {
      refetchQueries: [{ query: FIND_SERVICE_BY_ID, variables: { id } }],
      onCompleted: () => {
        toast.success("Social links updated successfully!");
        refetch();
      },
      onError: (err) => {
        toast.error("Failed to update social links.");
        console.error("Error updating social links:", err);
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateSocials({
        variables: {
          id,
          input: {
            website: form.website.trim(),
            x: form.x.trim(),
            tiktok: form.tiktok.trim(),
            facebook: form.facebook.trim(),
            instagram: form.instagram.trim(),
          },
        },
      });
    } catch (err) {
      console.error("Failed to save social links:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span>Loading social links...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-red-600">
        <p>Error loading service: {error.message}</p>
      </div>
    );
  }

  const socialFields = [
    {
      name: "website",
      label: "Website URL",
      icon: GoGlobe,
      value: form.website,
      placeholder: "https://www.yourbusiness.com",
    },
    {
      name: "instagram",
      label: "Instagram Profile URL",
      icon: SlSocialInstagram,
      value: form.instagram,
      placeholder: "https://www.instagram.com/yourhandle",
    },
    {
      name: "facebook",
      label: "Facebook Page URL",
      icon: SlSocialFacebook,
      value: form.facebook,
      placeholder: "https://www.facebook.com/yourpage",
    },
    {
      name: "tiktok",
      label: "TikTok Profile URL",
      icon: FaTiktok,
      value: form.tiktok,
      placeholder: "https://www.tiktok.com/@yourhandle",
    },
    {
      name: "x",
      label: "X (Twitter) Profile URL",
      icon: FaXTwitter,
      value: form.x,
      placeholder: "https://x.com/yourhandle",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 font-body">
      {/* Header section matching Settings theme */}
      <div className="pb-6 mb-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
            <FiShare2 className="text-lg" />
          </div>
          <h2 className="font-title text-2xl font-bold text-gray-900">
            Social & Web Links
          </h2>
        </div>
        <p className="text-gray-500 font-body text-sm mt-1">
          Connect your official website and social media profiles so couples can easily discover and follow your storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {socialFields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
              </label>
              <div className="relative flex items-center">
                <div className="h-11 px-3.5 rounded-l-xl bg-gray-50 border border-r-0 border-gray-300 flex items-center justify-center text-gray-400 select-none">
                  <Icon className="text-base text-gray-500" />
                </div>
                <input
                  type="url"
                  name={field.name}
                  value={field.value}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="w-full h-11 px-3.5 text-sm rounded-r-xl border border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>
          );
        })}

        {/* Footer save button integrated inside the card */}
        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Social Links</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSocialLinks;
