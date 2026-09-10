"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client";
import { FIND_PACKAGES_BY_OFFERING } from "@/graphql/queries";
import { UPDATE_PACKAGE, DELETE_PACKAGE, CREATE_PACKAGE } from "@/graphql/mutations";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";

import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { uploadPackageImage } from "@/api/upload/package/package.upload";

interface Package {
  id?: string;
  name: string;
  description: string;
  pricing: number;
  features: string[];
  offeringId?: string;
  visible: boolean;
  requiresReservation: boolean;
  image?: string | null;
}

const EditPackages: React.FC = () => {
  const params = useParams();
  const offeringId = params.id as string;

  const { loading, error, data, refetch } = useQuery(FIND_PACKAGES_BY_OFFERING, {
    variables: { offeringId },
    fetchPolicy: "network-only",
  });

  const [packages, setPackages] = useState<Package[]>([]);
  const [uploadingPackageIndex, setUploadingPackageIndex] = useState<number | null>(null);

  const [createPackage] = useMutation(CREATE_PACKAGE, {
    refetchQueries: [{ query: FIND_PACKAGES_BY_OFFERING, variables: { offeringId } }],
  });
  const [updatePackage] = useMutation(UPDATE_PACKAGE, {
    refetchQueries: [{ query: FIND_PACKAGES_BY_OFFERING, variables: { offeringId } }],
  });
  const [deletePackage] = useMutation(DELETE_PACKAGE, {
    refetchQueries: [{ query: FIND_PACKAGES_BY_OFFERING, variables: { offeringId } }],
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

  const handleSavePackage = async (pkg: Package) => {
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
    }
  };

  const handleDeletePackage = async (packageId: string) => {
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
        visible: false,
        requiresReservation: false,
        image: "",
      },
    ]);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Fragment>
      <div className="bg-white rounded-2xl p-4 px-8 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="font-title text-[30px]">Packages</h2>
          <Button onClick={addNewPackage}>Add New Package</Button>
        </div>

        <hr className="my-4" />

        {packages.map((pkg, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3>{pkg.name}</h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label>Visible</label>
                  <Switch
                    checked={pkg.visible}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange(index, checked)
                    }
                  />
                </div>

                {pkg.id && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeletePackage(pkg.id!)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>

            {/* Package Image Section */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Package Image (Optional)
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
                    <Trash2 size={16} />
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
                      <span className="text-xs text-gray-500 font-medium">Uploading image...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-3 pointer-events-none">
                      <CiCirclePlus size={28} className="text-orange mb-1" />
                      <span className="text-xs font-medium text-gray-600">Add 1 Image (Optional)</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG or WEBP (Max 5MB)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              value={pkg.name}
              onChange={(e) =>
                handlePackageChange(index, "name", e.target.value)
              }
              placeholder="Name"
            />

            <Input
              value={pkg.description}
              onChange={(e) =>
                handlePackageChange(index, "description", e.target.value)
              }
              placeholder="Description"
              className="mt-2"
            />

            <Input
              type="number"
              value={pkg.pricing}
              onChange={(e) =>
                handlePackageChange(index, "pricing", e.target.value)
              }
              className="mt-2"
            />

            <div className="flex items-center gap-2 mt-3">
              <label>Requires Reservation?</label>
              <Switch
                checked={pkg.requiresReservation}
                onCheckedChange={(checked) =>
                  handleRequiresReservationChange(index, checked)
                }
              />
            </div>

            <div className="mt-3">
              {pkg.features.map((feature, fIndex) => (
                <Input
                  key={fIndex}
                  value={feature}
                  onChange={(e) =>
                    handleFeatureChange(index, fIndex, e.target.value)
                  }
                  className="mt-2"
                  placeholder="Feature"
                />
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => addFeature(index)}>
                Add Feature
              </Button>
              <Button onClick={() => handleSavePackage(pkg)}>
                {pkg.id ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default EditPackages;
