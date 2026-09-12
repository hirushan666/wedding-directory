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
import { useParams } from "next/navigation";
import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { uploadPackageImage } from "@/api/upload/package/package.upload";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiPackage,
  FiX,
  FiCheck,
  FiShield,
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

const EditPackages: React.FC = () => {
  const params = useParams();
  const offeringId = params.id as string;

  const { loading, error, data, refetch } = useQuery(
    FIND_PACKAGES_BY_OFFERING,
    {
      variables: { offeringId },
      fetchPolicy: "network-only",
    }
  );

  const [packages, setPackages] = useState<Package[]>([]);
  const [uploadingPackageIndex, setUploadingPackageIndex] = useState<
    number | null
  >(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const [createPackage] = useMutation(CREATE_PACKAGE, {
    refetchQueries: [
      { query: FIND_PACKAGES_BY_OFFERING, variables: { offeringId } },
    ],
  });
  const [updatePackage] = useMutation(UPDATE_PACKAGE, {
    refetchQueries: [
      { query: FIND_PACKAGES_BY_OFFERING, variables: { offeringId } },
    ],
  });
  const [deletePackage] = useMutation(DELETE_PACKAGE, {
    refetchQueries: [
      { query: FIND_PACKAGES_BY_OFFERING, variables: { offeringId } },
    ],
  });

  useEffect(() => {
    if (data?.findPackagesByOffering) {
      setPackages(data.findPackagesByOffering);
    }
  }, [data]);

  const handlePackageChange = (
    index: number,
    field: keyof Package,
    value: string
  ) => {
    const updatedPackages = [...packages];

    if (field === "pricing") {
      updatedPackages[index] = {
        ...updatedPackages[index],
        pricing: parseFloat(value) || 0,
      };
    } else {
      updatedPackages[index] = {
        ...updatedPackages[index],
        [field]: value,
      };
    }

    setPackages(updatedPackages);
  };

  const handleFeatureChange = (
    packageIndex: number,
    featureIndex: number,
    value: string
  ) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].features[featureIndex] = value;
    setPackages(updatedPackages);
  };

  const addFeature = (packageIndex: number) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].features.push("");
    setPackages(updatedPackages);
  };

  const removeFeature = (packageIndex: number, featureIndex: number) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].features = updatedPackages[
      packageIndex
    ].features.filter((_, i) => i !== featureIndex);
    setPackages(updatedPackages);
  };

  const handleVisibilityChange = (packageIndex: number, visible: boolean) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      visible,
    };
    setPackages(updatedPackages);
  };

  const handleRequiresReservationChange = (
    packageIndex: number,
    requiresReservation: boolean
  ) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      requiresReservation,
      ...(requiresReservation ? { requiresApproval: false } : {}),
    };
    setPackages(updatedPackages);
  };

  const handleRequiresApprovalChange = (
    packageIndex: number,
    requiresApproval: boolean
  ) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      requiresApproval,
      ...(requiresApproval ? { requiresReservation: false } : {}),
    };
    setPackages(updatedPackages);
  };

  const handleImageChange = async (
    packageIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPackageIndex(packageIndex);
    try {
      const fileUrl = await uploadPackageImage(file);
      const updatedPackages = [...packages];
      updatedPackages[packageIndex] = {
        ...updatedPackages[packageIndex],
        image: fileUrl,
      };
      setPackages(updatedPackages);
      toast.success("Package image uploaded!");
    } catch (err) {
      console.error("Failed to upload package image:", err);
      toast.error("Failed to upload package image.");
    } finally {
      setUploadingPackageIndex(null);
    }
  };

  const handleRemoveImage = (packageIndex: number) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      image: "",
    };
    setPackages(updatedPackages);
  };

  const handleSavePackage = async (pkg: Package, index: number) => {
    if (!pkg.name.trim()) {
      toast.error("Package name cannot be empty");
      return;
    }

    setSavingIndex(index);
    try {
      const validFeatures = pkg.features.filter((f) => f.trim() !== "");

      if (!pkg.id) {
        const result = await createPackage({
          variables: {
            input: {
              name: pkg.name.trim(),
              description: pkg.description.trim(),
              pricing: pkg.pricing,
              features: validFeatures,
              visible: pkg.visible,
              requiresReservation: pkg.requiresReservation,
              requiresApproval: Boolean(pkg.requiresApproval),
              image: pkg.image || null,
            },
            offeringId,
          },
        });

        if (result.data?.createPackage) {
          toast.success("Package created successfully!");
          await refetch();
        }
      } else {
        const result = await updatePackage({
          variables: {
            input: {
              id: pkg.id,
              name: pkg.name.trim(),
              description: pkg.description.trim(),
              pricing: pkg.pricing,
              features: validFeatures,
              visible: pkg.visible,
              requiresReservation: pkg.requiresReservation,
              requiresApproval: Boolean(pkg.requiresApproval),
              image: pkg.image || null,
            },
          },
        });

        if (result.data?.updatePackage) {
          toast.success("Package updated successfully!");
          await refetch();
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save package: ${errorMessage}`);
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const result = await deletePackage({ variables: { id: packageId } });

      if (result.data?.deletePackage) {
        toast.success("Package deleted successfully!");
        await refetch();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete package: ${errorMessage}`);
    }
  };

  const addNewPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        name: `Package ${prev.length + 1}`,
        description: "",
        pricing: 0,
        features: [""],
        offeringId,
        visible: true,
        requiresReservation: false,
        requiresApproval: false,
        image: "",
      },
    ]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span>Loading packages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-red-600">
        <p>Error loading packages: {error.message}</p>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="space-y-6">
        {/* Header section matching Settings page theme */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
                  <FiPackage className="text-lg" />
                </div>
                <h2 className="font-title text-2xl font-bold text-gray-900">
                  Service Packages
                </h2>
              </div>
              <p className="text-gray-500 font-body text-sm mt-1">
                Configure package tiers, pricing in LKR, and booking requirements for couples.
              </p>
            </div>
            <button
              type="button"
              onClick={addNewPackage}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all whitespace-nowrap"
            >
              <FiPlus className="text-base" />
              <span>Add New Package</span>
            </button>
          </div>
        </div>

        {/* Empty state */}
        {packages.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange/10 flex items-center justify-center text-orange mb-4">
              <FiPackage className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold font-title text-gray-900 mb-1">
              No packages added yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
              Create customizable service packages with clear LKR pricing and feature inclusions for prospective couples.
            </p>
            <button
              type="button"
              onClick={addNewPackage}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all"
            >
              <FiPlus className="text-base" />
              <span>Create First Package</span>
            </button>
          </div>
        )}

        {/* Packages list */}
        {packages.map((pkg, index) => {
          const isCurrentSaving = savingIndex === index;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all hover:border-gray-200 font-body"
            >
              {/* Package Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange/10 text-orange uppercase tracking-wider">
                    Package #{index + 1}
                  </span>
                  <h3 className="font-title text-xl font-bold text-gray-900">
                    {pkg.name || "Untitled Package"}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Visibility toggle pill */}
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span
                      className={`text-xs font-semibold ${
                        pkg.visible ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {pkg.visible ? "Visible" : "Hidden"}
                    </span>
                    <Switch
                      checked={pkg.visible}
                      onCheckedChange={(checked) =>
                        handleVisibilityChange(index, checked)
                      }
                    />
                  </div>

                  {/* Delete package button */}
                  {pkg.id && (
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id!)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 hover:border-red-200"
                      title="Delete Package"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  )}
                </div>
              </div>

              {/* Package Image Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Package Image <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                {pkg.image ? (
                  <div className="relative w-full sm:w-64 h-40 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
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
                        onChange={(e) => handleImageChange(index, e)}
                        disabled={uploadingPackageIndex === index}
                      />
                      <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full font-medium">
                        Change Image
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="w-full sm:w-64 h-32 border-2 border-dashed border-gray-300 hover:border-orange rounded-xl relative flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleImageChange(index, e)}
                      disabled={uploadingPackageIndex === index}
                    />
                    {uploadingPackageIndex === index ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="animate-spin text-2xl mb-1">⌛</span>
                        <span className="text-xs text-gray-500 font-medium">
                          Uploading image...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-3 pointer-events-none">
                        <CiCirclePlus size={28} className="text-orange mb-1" />
                        <span className="text-xs font-medium text-gray-700">
                          Add Package Image
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package Name <span className="text-orange">*</span>
                  </label>
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) =>
                      handlePackageChange(index, "name", e.target.value)
                    }
                    placeholder="e.g. Premium Buffet & Catering / Full Day Coverage"
                    className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={pkg.description}
                    onChange={(e) =>
                      handlePackageChange(index, "description", e.target.value)
                    }
                    placeholder="Provide a helpful summary of what this package offers to couples..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800 resize-y placeholder:text-gray-400"
                  />
                </div>

                {/* Price with special LKR Badge */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package Price <span className="text-orange">*</span>
                  </label>
                  <div className="relative flex items-center">
                    {/* Special LKR badge */}
                    <div className="h-11 px-4 rounded-l-xl bg-orange/10 border border-r-0 border-gray-300 flex items-center justify-center text-orange font-bold text-sm tracking-wider select-none">
                      LKR
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={pkg.pricing === 0 ? "" : pkg.pricing}
                      onChange={(e) =>
                        handlePackageChange(index, "pricing", e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full h-11 px-3.5 text-base font-semibold text-gray-900 rounded-r-xl border border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>

                  {/* Formatted price preview */}
                  {pkg.pricing > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange/10 text-orange font-bold font-title text-sm">
                        LKR {Number(pkg.pricing).toLocaleString()}
                      </span>
                      <span className="text-gray-500 font-medium">
                        (Online advance 20%:{" "}
                        <span className="font-semibold text-gray-800">
                          LKR {(Number(pkg.pricing) * 0.2).toLocaleString()}
                        </span>
                        )
                      </span>
                    </div>
                  )}
                </div>

                {/* Requires Date Reservation card */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  pkg.requiresApproval ? "bg-gray-100/60 border-gray-200 opacity-60" : "bg-gray-50/80 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center text-orange flex-shrink-0">
                      <FiCalendar className="text-lg" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        Requires Date Reservation
                      </div>
                      <div className="text-xs text-gray-500">
                        {pkg.requiresApproval
                          ? "Disabled because Vendor Approval is enabled for this package."
                          : "Couples must select an available date on your calendar to book this package."}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={pkg.requiresReservation}
                    disabled={pkg.requiresApproval}
                    onCheckedChange={(checked) =>
                      handleRequiresReservationChange(index, checked)
                    }
                  />
                </div>

                {/* Requires Vendor Approval card */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  pkg.requiresReservation ? "bg-gray-100/60 border-gray-200 opacity-60" : "bg-gray-50/80 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <FiShield className="text-lg" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        Requires Prior Vendor Approval
                      </div>
                      <div className="text-xs text-gray-500">
                        {pkg.requiresReservation
                          ? "Disabled because Date Reservation is enabled for this package."
                          : "Couples select a date & submit a request for your approval before they can pay."}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(pkg.requiresApproval)}
                    disabled={pkg.requiresReservation}
                    onCheckedChange={(checked) =>
                      handleRequiresApprovalChange(index, checked)
                    }
                  />
                </div>

                {/* Features Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Included Features & Inclusions{" "}
                      <span className="text-xs font-normal text-gray-400">
                        ({pkg.features.filter((f) => f.trim()).length})
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2.5">
                    {pkg.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0 font-bold">
                          <FiCheck className="text-sm" />
                        </div>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(index, fIndex, e.target.value)
                          }
                          placeholder={`Inclusion detail (e.g. 5 hours coverage, 2 photographers)`}
                          className="w-full h-10 px-3.5 text-sm rounded-xl border border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all text-gray-800"
                        />
                        {pkg.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index, fIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
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
                    onClick={() => addFeature(index)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orange/80 bg-orange/10 hover:bg-orange/15 px-3 py-2 rounded-xl transition-colors mt-3"
                  >
                    <FiPlus className="text-sm" />
                    <span>Add Another Feature</span>
                  </button>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleSavePackage(pkg, index)}
                  disabled={isCurrentSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm shadow-orange/20 transition-all disabled:opacity-50"
                >
                  {isCurrentSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{pkg.id ? "Update Package" : "Create Package"}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};

export default EditPackages;
