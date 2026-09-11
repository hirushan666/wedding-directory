"use client";

import React, { Fragment, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { GeneralData } from "@/types/vendorTypes";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useMutation, useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID } from "@/graphql/queries";
import CityInput from "@/components/vendor-signup/CityInput";
import { UPDATE_VENDOR } from "@/graphql/mutations";
import LocationInput from "@/components/vendor-signup/LocationInput";
import VendorProfilePicture from "./VendorProfilePicture";

const EditGeneral: React.FC = () => {
  const { vendor } = useVendorAuth();
  const { data, loading, error, refetch } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const vendorData = data?.findVendorById;

  const [general, setGeneral] = useState<GeneralData>({
    businessName: vendorData?.busname || "",
    city: vendorData?.city || "",
    location: vendorData?.location || "",
    about: vendorData?.about || "",
  });

  useEffect(() => {
    if (vendorData) {
      setGeneral({
        businessName: vendorData.busname || "",
        city: vendorData.city || "",
        location: vendorData.location || "",
        about: vendorData.about || "",
      });
    }
  }, [vendorData]);

  const [updateVendor, { loading: isUpdating }] = useMutation(UPDATE_VENDOR, {
    onCompleted: () => {
      toast.success("General information updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error("Error updating general information");
      console.error("Error updating vendor:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneral((prevGeneral) => ({
      ...prevGeneral,
      [name]: value,
    }));
  };

  const handleCityChange = (city: string) => {
    setGeneral((prevGeneral) => ({
      ...prevGeneral,
      city,
    }));
  };

  const handleLocationChange = (location: string) => {
    setGeneral((prevGeneral) => ({
      ...prevGeneral,
      location,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor?.id) return;

    updateVendor({
      variables: {
        id: vendor.id,
        input: {
          busname: general.businessName,
          city: general.city,
          location: general.location,
          about: general.about,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span>Loading information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="pb-6 mb-6 border-b border-gray-100">
        <h2 className="font-title text-2xl font-bold text-gray-900">General Information</h2>
        <p className="text-gray-500 font-body text-sm mt-1">
          Public storefront information displayed to prospective couples.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 font-body">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Name <span className="text-orange">*</span>
          </label>
          <Input
            name="businessName"
            value={general.businessName}
            onChange={handleInputChange}
            placeholder="e.g. Royal Blooms Floral Design"
            className="h-11 rounded-lg border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            About Your Business
          </label>
          <textarea
            name="about"
            rows={4}
            value={general.about}
            onChange={handleInputChange}
            placeholder="Describe your services, wedding experience, specialties, and what makes your business unique..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all resize-y text-gray-800 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            A helpful overview introduces your brand to couples on the directory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City <span className="text-orange">*</span>
            </label>
            <CityInput
              placeholder={general.city || "Select city"}
              onCityChange={handleCityChange}
              className="border border-gray-300 rounded-lg h-11 bg-white hover:border-gray-400 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all flex items-center text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location / Area <span className="text-orange">*</span>
            </label>
            <LocationInput
              placeholder={general.location || "City, Province or Address"}
              onLocationChange={handleLocationChange}
              className="border border-gray-300 rounded-lg h-11 bg-white hover:border-gray-400 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all flex items-center text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save General Information"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGeneral;
