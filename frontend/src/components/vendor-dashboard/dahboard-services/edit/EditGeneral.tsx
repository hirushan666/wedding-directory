"use client";
import React, { Fragment, useEffect, useState } from "react";
import BusinessCategory from "@/components/vendor-signup/CategoryInput";
import CityInput from "@/components/vendor-signup/CityInput";
import MapLocationPicker, { LocationResult } from "@/components/shared/MapLocationPicker";
import LocationSearchInput, { LocationSearchResult } from "@/components/shared/LocationSearchInput";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { EditProfileProps, ProfileData } from "@/types/serviceTypes";
import { useMutation, useQuery } from "@apollo/client";
import { FIND_SERVICE_BY_ID, FIND_SERVICES_BY_VENDOR } from "@/graphql/queries";
import { useParams, useRouter } from "next/navigation";
import { UPDATE_SERVICE_PROFILE, DELETE_OFFERING } from "@/graphql/mutations";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import toast from "react-hot-toast";
import { FiInfo, FiChevronDown, FiMapPin, FiCopy, FiExternalLink } from "react-icons/fi";
import { GeneralFormSkeleton } from "@/components/ui/shimmer";
import ConfirmModal from "@/components/ui/ConfirmModal";

const EditGeneral: React.FC<EditProfileProps> = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { vendor } = useVendorAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { loading, error, data } = useQuery(FIND_SERVICE_BY_ID, {
    variables: { id },
  });

  const canonicalServiceId = data?.findServiceById?.id || id;

  const [deleteOffering] = useMutation(DELETE_OFFERING);

  // Form state
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    slug: "",
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
        name: service.name || "",
        slug: service.slug || "",
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
      refetchQueries: [
        { query: FIND_SERVICE_BY_ID, variables: { id } },
        ...(canonicalServiceId && canonicalServiceId !== id
          ? [{ query: FIND_SERVICE_BY_ID, variables: { id: canonicalServiceId } }]
          : []),
      ],
      onCompleted: (result) => {
        toast.success("Updated Successfully!");
        const newSlug = result?.updateService?.slug;
        if (newSlug && newSlug !== id) {
          router.replace(`/services/edit/${newSlug}`);
        }
      },
      onError: (error) => {
        toast.error(error.message || "Error updating service");
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
  };

  const handleLocationSearchSelect = (result: LocationSearchResult) => {
    setProfile((prev) => ({
      ...prev,
      city: result.city || prev.city,
      location: result.address,
      latitude: result.lat,
      longitude: result.lng,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");
    setProfile((prev) => ({ ...prev, slug: value }));
  };

  const handleCopyUrl = () => {
    if (!profile.slug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/services/${profile.slug}`);
    setCopied(true);
    toast.success("Public link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sanitizedSlug = profile.slug
        ? profile.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")
        : undefined;

      await updateVendor({
        variables: {
          id: canonicalServiceId,
          input: {
            name: profile.name?.trim() || undefined,
            slug: sanitizedSlug,
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
    if (!canonicalServiceId) return;

    setIsDeleting(true);
    try {
      const { data } = await deleteOffering({
        variables: { id: canonicalServiceId as string },
        refetchQueries: vendor?.id
          ? [{ query: FIND_SERVICES_BY_VENDOR, variables: { id: vendor.id } }]
          : [],
        awaitRefetchQueries: true,
      });
      if (data?.deleteService ?? data?.deleteOffering) {
        toast.success("Service deleted successfully");
        setIsDeleteModalOpen(false);
        router.push("/vendor-dashboard/services");
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
        <div className="bg-white dark:bg-darkSurface rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
          {/* Header Row */}
          <div className="flex flex-row items-center justify-between gap-3 pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange shrink-0">
                  <FiInfo className="text-base sm:text-lg" />
                </div>
                <h2 className="font-title text-lg sm:text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  General Information
                </h2>
              </div>
              <p className="hidden sm:block text-gray-500 dark:text-zinc-400 text-sm mt-1">
                Configure your service category, description, and visibility on
                the directory.
              </p>
            </div>

            {/* Service Visibility Pill */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 shrink-0">
              <span
                className={`text-[11px] sm:text-xs font-semibold ${
                  serviceVisibility
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-zinc-500"
                }`}
              >
                {serviceVisibility
                  ? "Visible"
                  : "Hidden"}
              </span>
              <Switch
                checked={serviceVisibility}
                onCheckedChange={handleVisibilityToggle}
              />
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Service Name <span className="text-orange">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={profile.name || ""}
                onChange={handleInputChange}
                placeholder="e.g. Royal Palace Grand Ballroom"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 text-sm focus:border-orange focus:ring-2 focus:ring-orange/20"
                required
              />
            </div>

            {/* Custom URL (Slug) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Custom Public URL (Slug)
                </label>
                {profile.slug && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orange/80 transition-colors"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                      <span>{copied ? "Copied!" : "Copy Link"}</span>
                    </button>
                    <a
                      href={`/services/${profile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-orange dark:hover:text-orange transition-colors"
                    >
                      <FiExternalLink className="w-3.5 h-3.5" />
                      <span>View Live Page</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="h-11 px-3.5 rounded-l-xl bg-gray-50 dark:bg-darkElevated border border-r-0 border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 text-xs sm:text-sm font-mono select-none">
                  sayido.lk/services/
                </div>
                <input
                  type="text"
                  name="slug"
                  value={profile.slug || ""}
                  onChange={handleSlugChange}
                  placeholder="your-service-slug"
                  className="w-full h-11 px-3.5 text-sm rounded-r-xl border border-gray-300 dark:border-zinc-700 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 dark:text-zinc-100 dark:bg-darkElevated font-mono placeholder:font-sans placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">
                Customize your public web link. Use lowercase letters, numbers, and hyphens. Leaving blank will automatically generate one from the service name.
              </p>
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Business Category
              </label>
              <div className="relative">
                {profile.showCategoryDropdown ? (
                  <div className="rounded-xl mt-1">
                    <BusinessCategory
                      value={profile.category}
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
                  <div className="flex-1">
                    <LocationSearchInput
                      value={profile.location || ""}
                      onChange={(val) => setProfile((prev) => ({ ...prev, location: val }))}
                      onLocationSelect={handleLocationSearchSelect}
                      district={profile.city || undefined}
                      placeholder="Search area, landmark or hotel (e.g. Sivali Central, Shangri-La)..."
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 text-sm focus:border-orange focus:ring-2 focus:ring-orange/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="shrink-0 h-11 w-11 flex items-center justify-center rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated hover:border-orange hover:bg-orange/10 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="Open map to pin exact location"
                  >
                    <FiMapPin className="w-4 h-4 text-orange" />
                  </button>
                </div>
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
            <div className="flex items-center justify-end pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all disabled:opacity-50"
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
        <div className="bg-white dark:bg-darkSurface rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm border border-red-200/70 dark:border-red-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-title text-base sm:text-xl font-bold text-red-600 dark:text-red-400">
                Delete Service
              </h3>
              <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
                Permanently delete this service listing and all associated
                packages, media, and reviews. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenDeleteModal}
              disabled={isDeleting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] rounded-xl shadow-sm shadow-red-500/20 transition-all disabled:opacity-50 whitespace-nowrap self-stretch sm:self-auto"
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
