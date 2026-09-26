"use client";
import React, { Fragment, useEffect, useState } from "react";
import BusinessCategory from "@/components/vendor-signup/CategoryInput";
import CityInput from "@/components/vendor-signup/CityInput";
import MapLocationPicker, { LocationResult } from "@/components/shared/MapLocationPicker";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { EditProfileProps, ProfileData } from "@/types/serviceTypes";
import { useMutation, useQuery } from "@apollo/client";
import { FIND_SERVICE_BY_ID } from "@/graphql/queries";
import { useParams, useRouter } from "next/navigation";
import { UPDATE_SERVICE_PROFILE, DELETE_OFFERING } from "@/graphql/mutations";
import toast from "react-hot-toast";
import { FiInfo, FiChevronDown, FiMapPin } from "react-icons/fi";
import { GeneralFormSkeleton } from "@/components/ui/shimmer";
import ConfirmModal from "@/components/ui/ConfirmModal";

const EditGeneral: React.FC<EditProfileProps> = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const { loading, error, data } = useQuery(FIND_SERVICE_BY_ID, {
    variables: { id },
  });

  const [deleteOffering] = useMutation(DELETE_OFFERING);

  // Form state
  const [profile, setProfile] = useState<ProfileData>({
    category: "",
    businessPhone: "",
    businessEmail: "",
    description: "",
    showCategoryDropdown: false,
    city: "",
    location: "",
    latitude: null,
    longitude: null,
  });

  const [serviceVisibility, setServiceVisibility] = useState(false);

  // Update state with fetched data
  useEffect(() => {
    const service = data?.findServiceById;
    if (service) {
      setProfile({
        category: service.category || "",
        businessPhone: "",
        businessEmail: "",
        description: service.description || "",
        showCategoryDropdown: false,
        city: service.city || "",
        location: service.location || "",
        latitude: service.latitude ?? null,
        longitude: service.longitude ?? null,
      });
      setServiceVisibility(service.visible || false);
    }
  }, [data]);

  // Update mutation
  const [updateVendor, { loading: isUpdating }] = useMutation(
    UPDATE_SERVICE_PROFILE,
    {
      refetchQueries: [{ query: FIND_SERVICE_BY_ID, variables: { id } }],
      onCompleted: () => {
        toast.success("Updated Successfully!");
      },
      onError: (error) => {
        toast.error("Error updating");
        console.error("Error updating vendor:", error);
      },
    },
  );

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  // Handle category change from the dropdown
  const handleCategoryChange = (category: string) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      category: category,
      showCategoryDropdown: false,
    }));
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setProfile((prev) => ({
      ...prev,
      showCategoryDropdown: !prev.showCategoryDropdown,
    }));
  };

  const handleMapConfirm = (result: LocationResult) => {
    setProfile((prev) => ({
      ...prev,
      city: result.city || prev.city,
      location: result.address || prev.location,
      latitude: result.lat,
      longitude: result.lng,
    }));
    setIsMapOpen(false);
    toast.success("Location pinned from map!");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVendor({
        variables: {
          id,
          input: {
            category: profile.category,
            description: profile.description,
            visible: serviceVisibility,
            city: profile.city || null,
            location: profile.location || null,
            latitude:
              profile.latitude !== null && profile.latitude !== undefined
                ? Number(profile.latitude)
                : null,
            longitude:
              profile.longitude !== null && profile.longitude !== undefined
                ? Number(profile.longitude)
                : null,
          },
        },
      });
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  // Handle service visibility toggle
  const handleVisibilityToggle = () => {
    setServiceVisibility(!serviceVisibility);
  };

  // Handle delete service
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const { data } = await deleteOffering({
        variables: { id: id as string },
      });
      if (data?.deleteService ?? data?.deleteOffering) {
        toast.success("Service deleted successfully");
        setIsDeleteModalOpen(false);
        router.push("/vendor-dashboard");
      } else {
        toast.error("Failed to delete service");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Error deleting service: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <GeneralFormSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-2xl p-8 shadow-sm border border-red-100 dark:border-red-900/30 text-red-600">
        <p>Error loading service: {error.message}</p>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="space-y-6 font-body">
        {/* Main General Information Card */}
        <div className="bg-white dark:bg-darkSurface rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
                  <FiInfo className="text-lg" />
                </div>
                <h2 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  General Information
                </h2>
              </div>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                Configure your service category, description, and visibility on
                the directory.
              </p>
            </div>

            {/* Service Visibility Pill */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 self-start sm:self-auto">
              <span
                className={`text-xs font-semibold ${
                  serviceVisibility
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-zinc-500"
                }`}
              >
                {serviceVisibility
                  ? "Visible to Couples"
                  : "Hidden from Couples"}
              </span>
              <Switch
                checked={serviceVisibility}
                onCheckedChange={handleVisibilityToggle}
              />
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Business Category
              </label>
              <div className="relative">
                {profile.showCategoryDropdown ? (
                  <div className="rounded-xl mt-1">
                    <BusinessCategory
                      onCategoryChange={handleCategoryChange}
                      initialCategory={profile.category}
                    />
                  </div>
                ) : (
                  <div
                    onClick={toggleCategoryDropdown}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 flex items-center justify-between cursor-pointer hover:border-orange dark:hover:border-orange transition-colors text-sm"
                  >
                    <span>{profile.category || "Select Category"}</span>
                    <FiChevronDown className="text-gray-400 text-base" />
                  </div>
                )}
              </div>
            </div>

            {/* Service Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* City / Region */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  City / Region
                </label>
                <CityInput
                  placeholder={profile.city || "Select City / Region"}
                  value={profile.city}
                  onCityChange={(city) => setProfile((prev) => ({ ...prev, city }))}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 flex items-center justify-between hover:border-orange dark:hover:border-orange transition-colors text-sm"
                />
              </div>

              {/* Specific Location / Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Specific Location / Address
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orange-600 transition-colors"
                  >
                    <FiMapPin className="w-3.5 h-3.5" />
                    Pick on Map
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    name="location"
                    value={profile.location || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. 123 Beach Road, Negombo"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 text-sm focus:border-orange focus:ring-2 focus:ring-orange/20"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="shrink-0 h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 hover:border-orange hover:bg-orange/10 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    title="Open map to pin exact location"
                  >
                    <FiMapPin className="w-4 h-4 text-orange" />
                  </button>
                </div>
                {profile.latitude !== null && profile.latitude !== undefined && profile.longitude !== null && profile.longitude !== undefined && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Map pin set: {Number(profile.latitude).toFixed(4)}, {Number(profile.longitude).toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                rows={5}
                name="description"
                value={profile.description || ""}
                onChange={handleInputChange}
                placeholder="Describe your service, experience, specialties, and what makes your offering unique..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 dark:text-zinc-100 dark:bg-darkElevated resize-y placeholder:text-gray-400 dark:placeholder:text-zinc-600 leading-relaxed"
              />
            </div>

            {/* Unified Card Footer with Save Button */}
            <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone: Delete Service */}
        <div className="bg-white dark:bg-darkSurface rounded-2xl p-6 sm:p-8 shadow-sm border border-red-200/70 dark:border-red-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-title text-xl font-bold text-red-600 dark:text-red-400">
                Delete Service
              </h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 max-w-xl">
                Permanently delete this service listing and all associated
                packages, media, and reviews. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenDeleteModal}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] rounded-xl shadow-sm shadow-red-500/20 transition-all disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Service</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Service Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteService}
        title="Delete Service"
        message="Are you sure you want to permanently delete this service listing? All associated packages, showcase media, and reviews will be permanently removed. This action cannot be undone."
        confirmText="Delete Service"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Interactive Map Location Picker Modal */}
      <MapLocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialLat={profile.latitude ? Number(profile.latitude) : undefined}
        initialLng={profile.longitude ? Number(profile.longitude) : undefined}
        initialCity={profile.city || undefined}
        initialAddress={profile.location || undefined}
        title="Pin Service Location"
      />
    </Fragment>
  );
};

export default EditGeneral;
