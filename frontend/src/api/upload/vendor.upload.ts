import request from "@/utils/request";

export const uploadVendorProfilePicture = async (file: File, vendorId: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("vendorId", vendorId);

  try {
    const response = await request.post("/upload/vendor-profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.fileUrl;
  } catch (error: any) {
    // If /upload/vendor-profile-picture returns 404, fallback to /upload/profile-picture
    if (error?.response?.status === 404) {
      try {
        const fallbackResponse = await request.post("/upload/profile-picture", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return fallbackResponse.data.fileUrl;
      } catch (fallbackError) {
        console.error("Fallback upload to /upload/profile-picture failed:", fallbackError);
        throw fallbackError;
      }
    }
    console.error("Error uploading vendor profile picture:", error);
    throw error;
  }
};
