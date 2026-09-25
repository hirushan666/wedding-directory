"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client";
import { FIND_PACKAGES_BY_OFFERING } from "@/graphql/queries";
import {
  UPDATE_PACKAGE,
  DELETE_PACKAGE,
  CREATE_PACKAGE,
} from "@/graphql/mutations";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { uploadPackageImage } from "@/api/upload/package/package.upload";
import { PackagesSkeleton } from "@/components/ui/shimmer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiPackage,
  FiX,
  FiCheck,
  FiShield,
  FiEdit2,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

interface Package {
  id?: string;
  name: string;
  description: string;
  pricing: number;
  features: string[];
  offeringId?: string;
  visible: boolean;
  requiresReservation: boolean;
  requiresApproval?: boolean;
  image?: string | null;
}

type ViewMode = "list" | "add" | "edit";

const createEmptyPackage = (offeringId: string, count: number): Package => ({
  name: `Package ${count + 1}`,
  description: "",
  pricing: 0,
  features: [""],
  offeringId,
  visible: true,
  requiresReservation: false,
  requiresApproval: false,
  image: "",
});

const EditPackages: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const offeringId = params.id as string;

  const { loading, error, data, refetch } = useQuery(
    FIND_PACKAGES_BY_OFFERING,
    {
      variables: { serviceId: offeringId },
      fetchPolicy: "network-only",
    },
  );

  const [packages, setPackages] = useState<Package[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [formPackage, setFormPackage] = useState<Package>(
    createEmptyPackage(offeringId, 0),
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  const [createPackage] = useMutation(CREATE_PACKAGE, {
    refetchQueries: [
      {
        query: FIND_PACKAGES_BY_OFFERING,
        variables: { serviceId: offeringId },
      },
    ],
  });
  const [updatePackage] = useMutation(UPDATE_PACKAGE, {
    refetchQueries: [
      {
        query: FIND_PACKAGES_BY_OFFERING,
        variables: { serviceId: offeringId },
      },
    ],
  });
  const [deletePackage] = useMutation(DELETE_PACKAGE, {
    refetchQueries: [
      {
        query: FIND_PACKAGES_BY_OFFERING,
        variables: { serviceId: offeringId },
      },
    ],
  });

  useEffect(() => {
    const fetched: Package[] | undefined = data?.findPackagesByService;
    if (fetched) {
      setPackages(fetched);

      const action = searchParams.get("action");
      const packageId = searchParams.get("packageId");

      if (action === "add") {
        setFormPackage(createEmptyPackage(offeringId, fetched.length));
        setViewMode("add");
      } else if (action === "edit" && packageId) {
        const target = fetched.find((p) => p.id === packageId);
        if (target) {
          setFormPackage({
            ...target,
            features: target.features?.length > 0 ? [...target.features] : [""],
          });
          setViewMode("edit");
        }
      }
    }
  }, [data, searchParams, offeringId]);

  // Handlers for switching views
  const handleOpenAdd = () => {
    setFormPackage(createEmptyPackage(offeringId, packages.length));
    setViewMode("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenEdit = (pkg: Package) => {
    setFormPackage({
      ...pkg,
      features: pkg.features?.length > 0 ? [...pkg.features] : [""],
    });
    setViewMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setViewMode("list");
    router.replace(`/services/edit/${offeringId}?section=packages`, {
      scroll: false,
    });
  };

  // Form field change handlers
  const handleFieldChange = (
    field: keyof Package,
    value: string | number | boolean,
  ) => {
    setFormPackage((prev) => ({
      ...prev,
      [field]: field === "pricing" ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleFeatureChange = (featureIndex: number, value: string) => {
    setFormPackage((prev) => {
      const updated = [...prev.features];
      updated[featureIndex] = value;
      return { ...prev, features: updated };
    });
  };

  const addFeature = () => {
    setFormPackage((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (featureIndex: number) => {
    setFormPackage((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== featureIndex),
    }));
  };

  const handleRequiresReservationChange = (requiresReservation: boolean) => {
    setFormPackage((prev) => ({
      ...prev,
      requiresReservation,
      ...(requiresReservation ? { requiresApproval: false } : {}),
    }));
  };

  const handleRequiresApprovalChange = (requiresApproval: boolean) => {
    setFormPackage((prev) => ({
      ...prev,
      requiresApproval,
      ...(requiresApproval ? { requiresReservation: false } : {}),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const fileUrl = await uploadPackageImage(file);
      setFormPackage((prev) => ({
        ...prev,
        image: fileUrl,
      }));
      toast.success("Package image uploaded!");
    } catch (err) {
      console.error("Failed to upload package image:", err);
      toast.error("Failed to upload package image.");
    } finally {
      setIsUploadingImage(null as unknown as boolean);
    }
  };

  const handleRemoveImage = () => {
    setFormPackage((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // Direct visibility toggle from the card
  const handleToggleVisibilityDirectly = async (
    pkg: Package,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!pkg.id) return;

    const newVisibility = !pkg.visible;
    try {
      const validFeatures = (pkg.features || []).filter((f) => f.trim() !== "");
      await updatePackage({
        variables: {
          input: {
            id: pkg.id,
            name: pkg.name.trim(),
            description: pkg.description.trim(),
            pricing: pkg.pricing,
            features: validFeatures,
            visible: newVisibility,
            requiresReservation: pkg.requiresReservation,
            requiresApproval: Boolean(pkg.requiresApproval),
            image: pkg.image || null,
          },
        },
      });
      toast.success(`Package set to ${newVisibility ? "visible" : "hidden"}`);
      await refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update visibility: ${errorMessage}`);
    }
  };

  // Save (Create or Update)
  const handleSavePackage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formPackage.name.trim()) {
      toast.error("Package name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const validFeatures = formPackage.features.filter((f) => f.trim() !== "");

      if (viewMode === "add" || !formPackage.id) {
        const result = await createPackage({
          variables: {
            input: {
              name: formPackage.name.trim(),
              description: formPackage.description.trim(),
              pricing: formPackage.pricing,
              features: validFeatures,
              visible: formPackage.visible,
              requiresReservation: formPackage.requiresReservation,
              requiresApproval: Boolean(formPackage.requiresApproval),
              image: formPackage.image || null,
            },
            serviceId: offeringId,
          },
        });

        if (result.data?.createPackage) {
          toast.success("Package created successfully!");
          await refetch();
          setViewMode("list");
          router.replace(`/services/edit/${offeringId}?section=packages`, {
            scroll: false,
          });
        }
      } else {
        const result = await updatePackage({
          variables: {
            input: {
              id: formPackage.id,
              name: formPackage.name.trim(),
              description: formPackage.description.trim(),
              pricing: formPackage.pricing,
              features: validFeatures,
              visible: formPackage.visible,
              requiresReservation: formPackage.requiresReservation,
              requiresApproval: Boolean(formPackage.requiresApproval),
              image: formPackage.image || null,
            },
          },
        });

        if (result.data?.updatePackage) {
          toast.success("Package updated successfully!");
          await refetch();
          setViewMode("list");
          router.replace(`/services/edit/${offeringId}?section=packages`, {
            scroll: false,
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save package: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleOpenDeletePackage = (pkg: Package) => {
    setPackageToDelete(pkg);
  };

  const handleConfirmDeletePackage = async () => {
    if (!packageToDelete?.id) return;
    const packageId = packageToDelete.id;

    setDeletingId(packageId);
    try {
      const result = await deletePackage({ variables: { id: packageId } });

      if (result.data?.deletePackage) {
        toast.success("Package deleted successfully!");
        setPackages((prev) => prev.filter((p) => p.id !== packageId));
        setPackageToDelete(null);
        await refetch();
        if (viewMode !== "list") {
          handleBackToList();
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete package: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <PackagesSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-2xl p-8 shadow-sm border border-red-100 dark:border-red-900/30 text-red-600">
        <p>Error loading packages: {error.message}</p>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="space-y-6 font-body">
        {/* ============================================================ */}
        {/* VIEW: LIST (CARDS) */}
        {/* ============================================================ */}
        {viewMode === "list" && (
          <div className="space-y-6">
            {/* Header section matching Settings page theme */}
            <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
                      <FiPackage className="text-lg" />
                    </div>
                    <h2 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                      Service Packages
                    </h2>
                  </div>
                  <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
                    Configure package tiers, pricing in LKR, and booking
                    requirements for couples.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all whitespace-nowrap"
                >
                  <FiPlus className="text-base" />
                  <span>Add Package</span>
                </button>
              </div>
            </div>

            {/* Empty state */}
            {packages.length === 0 && (
              <div className="bg-white dark:bg-darkSurface rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-zinc-800">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-orange/10 flex items-center justify-center text-orange mb-4">
                  <FiPackage className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold font-title text-gray-900 dark:text-zinc-100 mb-1">
                  No packages added yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto mb-5">
                  Create customizable service packages with clear LKR pricing
                  and feature inclusions for prospective couples.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all"
                >
                  <FiPlus className="text-base" />
                  <span>Create First Package</span>
                </button>
              </div>
            )}

            {/* Packages Cards Grid */}
            {packages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg, index) => {
                  const validFeatures = (pkg.features || []).filter(
                    (f) => f.trim() !== "",
                  );
                  const isDeleting = deletingId === pkg.id;

                  return (
                    <div
                      key={pkg.id || index}
                      className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-gray-200 dark:hover:border-zinc-700 transition-all duration-200 group"
                    >
                      {/* Top Media / Header Area */}
                      <div>
                        {pkg.image ? (
                          <div className="relative w-full h-44 bg-gray-100 dark:bg-darkElevated overflow-hidden">
                            <Image
                              src={pkg.image}
                              alt={pkg.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                            {/* Badge and Visibility on image */}
                            <div className="absolute top-3 left-3 z-10">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white uppercase tracking-wider">
                                Package #{index + 1}
                              </span>
                            </div>

                            <div className="absolute top-3 right-3 z-10">
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleToggleVisibilityDirectly(pkg, e)
                                }
                                title={
                                  pkg.visible
                                    ? "Hide Package"
                                    : "Make Package Visible"
                                }
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-colors ${
                                  pkg.visible
                                    ? "bg-emerald-500/90 text-white"
                                    : "bg-gray-800/80 text-gray-300"
                                }`}
                              >
                                {pkg.visible ? (
                                  <FiEye className="text-xs" />
                                ) : (
                                  <FiEyeOff className="text-xs" />
                                )}
                                <span>
                                  {pkg.visible ? "Visible" : "Hidden"}
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 pb-0 flex items-center justify-between">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange/10 text-orange uppercase tracking-wider">
                              Package #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleToggleVisibilityDirectly(pkg, e)
                              }
                              title={
                                pkg.visible
                                  ? "Hide Package"
                                  : "Make Package Visible"
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                pkg.visible
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700"
                              }`}
                            >
                              {pkg.visible ? (
                                <FiEye className="text-xs" />
                              ) : (
                                <FiEyeOff className="text-xs" />
                              )}
                              <span>{pkg.visible ? "Visible" : "Hidden"}</span>
                            </button>
                          </div>
                        )}

                        {/* Card Main Content */}
                        <div className="p-5 sm:p-6 space-y-4">
                          <div>
                            <h3 className="font-title text-xl font-bold text-gray-900 dark:text-zinc-100 leading-snug line-clamp-1">
                              {pkg.name || "Untitled Package"}
                            </h3>
                            {pkg.description && (
                              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                                {pkg.description}
                              </p>
                            )}
                          </div>

                          {/* Pricing Badge & Details */}
                          <div className="flex flex-wrap items-baseline gap-2 pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                            <span className="text-2xl font-bold font-title text-orange">
                              LKR {Number(pkg.pricing || 0).toLocaleString()}
                            </span>
                            {pkg.pricing > 0 && (
                              <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                                (20% advance: LKR{" "}
                                {(Number(pkg.pricing) * 0.2).toLocaleString()})
                              </span>
                            )}
                          </div>

                          {/* Booking Rules Tags */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {pkg.requiresReservation && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange/10 text-orange border border-orange/20">
                                <FiCalendar className="text-xs shrink-0" />
                                <span>Date Reservation</span>
                              </span>
                            )}
                            {pkg.requiresApproval && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                <FiShield className="text-xs shrink-0" />
                                <span>Vendor Approval</span>
                              </span>
                            )}
                            {!pkg.requiresReservation &&
                              !pkg.requiresApproval && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800/80 text-gray-600 dark:text-zinc-400">
                                  <FiPackage className="text-xs shrink-0" />
                                  <span>Standard Booking</span>
                                </span>
                              )}
                          </div>

                          {/* Features Summary */}
                          {validFeatures.length > 0 && (
                            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 space-y-2">
                              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                Inclusions ({validFeatures.length})
                              </span>
                              <ul className="space-y-1.5">
                                {validFeatures
                                  .slice(0, 3)
                                  .map((feat, fIndex) => (
                                    <li
                                      key={fIndex}
                                      className="flex items-start gap-2 text-xs text-gray-700 dark:text-zinc-300"
                                    >
                                      <FiCheck className="text-emerald-500 shrink-0 text-sm mt-0.5" />
                                      <span className="line-clamp-1">
                                        {feat}
                                      </span>
                                    </li>
                                  ))}
                                {validFeatures.length > 3 && (
                                  <li className="text-[11px] font-medium text-orange pl-5">
                                    +{validFeatures.length - 3} more inclusions
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 sm:p-5 pt-3 bg-gray-50/50 dark:bg-darkElevated/30 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkElevated hover:bg-orange hover:text-white dark:hover:bg-orange dark:hover:text-white border border-gray-200 dark:border-zinc-700 hover:border-orange dark:hover:border-orange rounded-xl shadow-sm transition-all"
                        >
                          <FiEdit2 className="text-sm" />
                          <span>Edit Package</span>
                        </button>

                        {pkg.id && (
                          <button
                            type="button"
                            onClick={() => handleOpenDeletePackage(pkg)}
                            disabled={deletingId === pkg.id}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-gray-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-900/40"
                            title="Delete Package"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW: ADD OR EDIT PACKAGE FORM */}
        {/* ============================================================ */}
        {(viewMode === "add" || viewMode === "edit") && (
          <div className="space-y-6">
            {/* Top Navigation & Header */}
            <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-orange dark:hover:text-orange transition-colors mb-4 group"
              >
                <FiArrowLeft className="text-base group-hover:-translate-x-1 transition-transform" />
                <span>Back to Packages</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
                      {viewMode === "add" ? (
                        <FiPlus className="text-lg" />
                      ) : (
                        <FiEdit2 className="text-lg" />
                      )}
                    </div>
                    <h2 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                      {viewMode === "add"
                        ? "Add New Package"
                        : `Edit Package: ${formPackage.name || "Untitled"}`}
                    </h2>
                  </div>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                    {viewMode === "add"
                      ? "Create a new service tier with pricing in LKR and customizable features."
                      : "Modify package details, booking rules, features, and visibility."}
                  </p>
                </div>

                {/* Visibility toggle pill in form header */}
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 self-start sm:self-auto">
                  <span
                    className={`text-xs font-semibold ${
                      formPackage.visible
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {formPackage.visible
                      ? "Visible to Couples"
                      : "Hidden from Couples"}
                  </span>
                  <Switch
                    checked={formPackage.visible}
                    onCheckedChange={(checked) =>
                      handleFieldChange("visible", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Form Container */}
            <form
              onSubmit={handleSavePackage}
              className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6"
            >
              {/* Package Image Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Package Image{" "}
                  <span className="text-xs font-normal text-gray-400 dark:text-zinc-500">
                    (Optional)
                  </span>
                </label>
                {formPackage.image ? (
                  <div className="relative w-full sm:w-64 h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 group bg-gray-50 dark:bg-darkElevated">
                    <Image
                      src={formPackage.image}
                      alt={formPackage.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-full shadow-md text-red-500 transition-colors z-20"
                      title="Remove image"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploadingImage}
                      />
                      <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full font-medium">
                        Change Image
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="w-full sm:w-64 h-32 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-orange rounded-xl relative flex flex-col items-center justify-center bg-gray-50 dark:bg-darkElevated hover:bg-gray-100 dark:hover:bg-darkElevated/70 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                          Uploading image...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-3 pointer-events-none">
                        <CiCirclePlus size={28} className="text-orange mb-1" />
                        <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                          Add Package Image
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                          JPG, PNG or WEBP (Max 5MB)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-5">
                {/* Package Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                    Package Name <span className="text-orange">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPackage.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="e.g. Premium Buffet & Catering / Full Day Coverage"
                    className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 dark:text-zinc-100 dark:bg-darkElevated"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formPackage.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Provide a helpful summary of what this package offers to couples..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 dark:text-zinc-100 dark:bg-darkElevated resize-y placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                  />
                </div>

                {/* Price with special LKR Badge */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                    Package Price <span className="text-orange">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="h-11 px-4 rounded-l-xl bg-orange/10 border border-r-0 border-gray-300 dark:border-zinc-700 flex items-center justify-center text-orange font-bold text-sm tracking-wider select-none">
                      LKR
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={
                        formPackage.pricing === 0 ? "" : formPackage.pricing
                      }
                      onChange={(e) =>
                        handleFieldChange("pricing", e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full h-11 px-3.5 text-base font-semibold text-gray-900 dark:text-zinc-100 rounded-r-xl border border-gray-300 dark:border-zinc-700 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-400 placeholder:font-normal dark:bg-darkElevated"
                      required
                    />
                  </div>

                  {/* Formatted price preview */}
                  {formPackage.pricing > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange/10 text-orange font-bold font-title text-sm">
                        LKR {Number(formPackage.pricing).toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">
                        (Online advance 20%:{" "}
                        <span className="font-semibold text-gray-800 dark:text-zinc-200">
                          LKR{" "}
                          {(Number(formPackage.pricing) * 0.2).toLocaleString()}
                        </span>
                        )
                      </span>
                    </div>
                  )}
                </div>

                {/* Requires Date Reservation card */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    formPackage.requiresApproval
                      ? "bg-gray-100/60 dark:bg-darkElevated/50 border-gray-200 dark:border-zinc-700 opacity-60"
                      : "bg-gray-50/80 dark:bg-darkElevated border-gray-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center text-orange flex-shrink-0">
                      <FiCalendar className="text-lg" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                        Requires Date Reservation
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">
                        {formPackage.requiresApproval
                          ? "Disabled because Vendor Approval is enabled for this package."
                          : "Strict 1-booking exclusive lock. Automatically blocks the date on your calendar upon booking (ideal for venues and solo professionals)."}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={formPackage.requiresReservation}
                    disabled={formPackage.requiresApproval}
                    onCheckedChange={handleRequiresReservationChange}
                  />
                </div>

                {/* Requires Vendor Approval card */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    formPackage.requiresReservation
                      ? "bg-gray-100/60 dark:bg-darkElevated/50 border-gray-200 dark:border-zinc-700 opacity-60"
                      : "bg-gray-50/80 dark:bg-darkElevated border-gray-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <FiShield className="text-lg" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                        Requires Prior Vendor Approval
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">
                        {formPackage.requiresReservation
                          ? "Disabled because Date Reservation is enabled for this package."
                          : "Couples submit a date request for your review. You have full discretion and can accept multiple bookings for the same day (no automatic date blocking)."}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(formPackage.requiresApproval)}
                    disabled={formPackage.requiresReservation}
                    onCheckedChange={handleRequiresApprovalChange}
                  />
                </div>

                {/* Features Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                      Included Features & Inclusions{" "}
                      <span className="text-xs font-normal text-gray-400 dark:text-zinc-500">
                        ({formPackage.features.filter((f) => f.trim()).length})
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2.5">
                    {formPackage.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs flex-shrink-0 font-bold">
                          <FiCheck className="text-sm" />
                        </div>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(fIndex, e.target.value)
                          }
                          placeholder="Inclusion detail (e.g. 5 hours coverage, 2 photographers)"
                          className="w-full h-10 px-3.5 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 dark:text-zinc-100 dark:bg-darkElevated"
                        />
                        {formPackage.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(fIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex-shrink-0"
                            title="Remove feature"
                          >
                            <FiX className="text-base" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orange/80 bg-orange/10 hover:bg-orange/15 px-3 py-2 rounded-xl transition-colors mt-3"
                  >
                    <FiPlus className="text-sm" />
                    <span>Add Another Feature</span>
                  </button>
                </div>
              </div>

              {/* Form Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800">
                {viewMode === "edit" && formPackage.id ? (
                  <button
                    type="button"
                    onClick={() => handleOpenDeletePackage(formPackage)}
                    disabled={isSaving || deletingId === formPackage.id}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all disabled:opacity-50"
                  >
                    <FiTrash2 className="text-base" />
                    <span>Delete Package</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-darkElevated rounded-xl border border-gray-200 dark:border-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>
                        {viewMode === "add"
                          ? "Create Package"
                          : "Update Package"}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Package Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(packageToDelete)}
        onClose={() => !deletingId && setPackageToDelete(null)}
        onConfirm={handleConfirmDeletePackage}
        title="Delete Package"
        message={`Are you sure you want to permanently delete ${
          packageToDelete?.name ? `"${packageToDelete.name}"` : "this package"
        }? This action cannot be undone.`}
        confirmText="Delete Package"
        cancelText="Cancel"
        variant="danger"
        isLoading={Boolean(deletingId)}
      />
    </Fragment>
  );
};

export default EditPackages;
