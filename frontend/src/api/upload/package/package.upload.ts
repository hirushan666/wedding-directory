import request from "@/utils/request";

/**
 * Upload a single package image
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Uploaded image URL
 */
export const uploadPackageImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await request.post("/upload/package-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.fileUrl;
  } catch (error) {
    throw error;
  }
};
