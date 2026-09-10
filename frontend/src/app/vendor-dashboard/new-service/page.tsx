"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryInput from "@/components/vendor-signup/CategoryInput";
import Header from "@/components/shared/Headers/Header";
import { CREATE_SERVICE } from "@/graphql/mutations";
import { FIND_SERVICES_BY_VENDOR } from "@/graphql/queries";
import { useMutation } from "@apollo/client";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Footer from "@/components/shared/Footer";
import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { uploadOfferingBanner } from "@/api/upload/offering/banner.upload";
import { uploadOfferingImageShowcase } from "@/api/upload/offering/imageShowcase.upload";

const AddNewService: React.FC = () => {
  const { vendor } = useVendorAuth();
  const router = useRouter();

  const [createService, { loading }] = useMutation(CREATE_SERVICE);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [createdOfferingId, setCreatedOfferingId] = useState<string | null>(null);
  const [createdServiceName, setCreatedServiceName] = useState<string>("");

  // Step 2 Media Upload States
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showcasePreviews, setShowcasePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Handle category selection from the CategoryInput component
  const handleCategoryChange = (selectedCategory: string) => {
    setFormData({
      ...formData,
      category: selectedCategory,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }
    if (!formData.category.trim()) {
      toast.error("Please select a category");
      return;
    }

    try {
      const response = await createService({
        variables: {
          input: {
            name: formData.name.trim(),
            category: formData.category.trim(),
            vendor_id: vendor?.id,
          },
        },
        refetchQueries: [
          { query: FIND_SERVICES_BY_VENDOR, variables: { id: vendor?.id } },
        ],
        awaitRefetchQueries: true,
      });

      const newId = response.data?.createOffering?.id;
      if (newId) {
        setCreatedOfferingId(newId);
        setCreatedServiceName(formData.name.trim());
        setStep(2);
        toast.success("Service created! You can now upload photos or skip this step.");
      } else {
        toast.success("Service created successfully!");
        router.push("/vendor-dashboard");
      }
    } catch (err) {
      console.error("Error creating service:", err);
      toast.error("Could not create new service");
    }
  };

  // Step 2: Banner Upload
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdOfferingId) return;

    setBannerPreview(URL.createObjectURL(file));
    setIsUploadingBanner(true);

    try {
      const uploadedUrl = await uploadOfferingBanner(file, createdOfferingId);
      setBannerPreview(uploadedUrl);
      toast.success("Banner uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload banner:", err);
      toast.error("Failed to upload banner.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Step 2: Showcase Image Upload
  const handleShowcaseChange = (slotIndex: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdOfferingId) return;

    const newPreviews = [...showcasePreviews];
    newPreviews[slotIndex] = URL.createObjectURL(file);
    setShowcasePreviews(newPreviews);
    setUploadingSlot(slotIndex);

    try {
      const uploadedUrls = await uploadOfferingImageShowcase([file], createdOfferingId, slotIndex);
      if (uploadedUrls && uploadedUrls.length > 0) {
        newPreviews[slotIndex] = uploadedUrls[0];
        setShowcasePreviews([...newPreviews]);
      }
      toast.success(`Photo ${slotIndex + 1} uploaded successfully!`);
    } catch (err) {
      console.error(`Failed to upload photo ${slotIndex + 1}:`, err);
      toast.error(`Failed to upload photo ${slotIndex + 1}.`);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSkip = () => {
    toast.success("Service created! You can add photos anytime from your dashboard.");
    router.push("/vendor-dashboard");
  };

  const handleFinish = () => {
    toast.success("Service created successfully!");
    if (createdOfferingId) {
      router.push(`/services/${createdOfferingId}`);
    } else {
      router.push("/vendor-dashboard");
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-lightYellow font-title min-h-screen flex items-center justify-center py-8">
        <div className="flex flex-col md:flex-row min-h-[650px] w-full md:w-11/12 lg:w-9/12 shadow-lg rounded-2xl overflow-hidden bg-white">
          {/* Left Image Section */}
          <div className="relative w-full md:w-5/12 min-h-[250px] md:min-h-[650px]">
            <Image
              src="/images/onBoard1.webp"
              layout="fill"
              objectFit="cover"
              alt="onboard image"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-xs uppercase tracking-widest text-orange font-semibold">
                {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
              </span>
              <h3 className="text-2xl font-bold mt-1">
                {step === 1 ? "Create Your Service" : "Add Photos & Showcase"}
              </h3>
              <p className="text-sm text-gray-200 mt-2">
                {step === 1
                  ? "Start by giving your service a clear name and selecting its category."
                  : "Upload photos now so couples can see your work, or skip and add them later."}
              </p>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="relative w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between">
            {step === 1 ? (
              <div className="flex flex-col items-center justify-center my-auto">
                <h2 className="text-3xl font-semibold text-center mb-2">Add New Service</h2>
                <p className="text-sm text-gray-500 mb-8 text-center">
                  Tell couples what service you offer
                </p>

                <form onSubmit={onSubmit} className="w-full max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name
                    </label>
                    <Input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange"
                      name="name"
                      placeholder="e.g. Elegant Wedding Photography"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <CategoryInput onCategoryChange={handleCategoryChange} />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="signup"
                      className="w-full py-3"
                      disabled={loading}
                    >
                      {loading ? "Creating Service..." : "Continue to Add Photos"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Add Photos for {createdServiceName}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload images right away or skip this step and add them later.
                      </p>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Cover Banner (Optional)
                    </label>
                    <div className="w-full h-[150px] border-2 border-dashed border-gray-300 hover:border-orange rounded-xl relative overflow-hidden bg-gray-50 flex items-center justify-center transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={handleBannerChange}
                        disabled={isUploadingBanner}
                      />
                      {isUploadingBanner && (
                        <div className="absolute inset-0 bg-white/80 z-30 flex items-center justify-center">
                          <span className="animate-spin text-2xl mr-2">⌛</span>
                          <span className="text-xs text-gray-600 font-medium">Uploading banner...</span>
                        </div>
                      )}
                      {bannerPreview ? (
                        <Image
                          src={bannerPreview}
                          alt="Banner Preview"
                          className="object-cover w-full h-full"
                          fill
                        />
                      ) : (
                        <div className="flex flex-col items-center pointer-events-none p-4 text-center">
                          <CiCirclePlus size={28} className="text-orange mb-1" />
                          <span className="text-xs font-medium text-gray-600">Click to upload cover banner</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG or WEBP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Showcase Photos Upload */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Showcase Photos (Optional - up to 5)
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {Array(5)
                        .fill(null)
                        .map((_, index) => {
                          const preview = showcasePreviews[index];
                          const isThisUploading = uploadingSlot === index;

                          return (
                            <div
                              key={index}
                              className="aspect-square border-2 border-dashed border-gray-300 hover:border-orange rounded-xl relative overflow-hidden bg-gray-50 flex items-center justify-center transition-colors"
                            >
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleShowcaseChange(index)}
                                disabled={isThisUploading}
                                title={`Upload photo ${index + 1}`}
                              />
                              {isThisUploading && (
                                <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                                  <span className="animate-spin text-sm">⌛</span>
                                </div>
                              )}
                              {preview ? (
                                <Image
                                  src={preview}
                                  alt={`Showcase ${index + 1}`}
                                  className="object-cover w-full h-full"
                                  fill
                                />
                              ) : (
                                <div className="flex flex-col items-center pointer-events-none p-1 text-center">
                                  <CiCirclePlus size={20} className="text-orange mb-0.5" />
                                  <span className="text-[10px] text-gray-500 font-medium">#{index + 1}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Actions: Upload images right away / Skip step */}
                <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    className="w-full sm:w-auto px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Skip this step
                  </Button>
                  <Button
                    type="button"
                    variant="signup"
                    onClick={handleFinish}
                    className="w-full sm:w-auto px-6 py-2"
                  >
                    Finish & View Service
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddNewService;
