import { useMutation } from "@tanstack/react-query";
import appService from "../../../services/app.service";
import {
  IUploadFileRequest,
  IUploadFileResponse,
} from "../interfaces/expense-report.interfaces";

export const useUploadFile = () => {
  return useMutation<IUploadFileResponse[], Error, IUploadFileRequest>({
    mutationFn: async (
      request: IUploadFileRequest
    ): Promise<IUploadFileResponse[]> => {
      const formData = new FormData();
      request.files.forEach((file) => {
        formData.append("file", file); // Append each file to the 'file' field
      });
      if (request.bucketName) {
        formData.append("bucketName", request.bucketName);
      }

      const res = await appService.post("/mongo-file-storage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data: IUploadFileResponse[]) => {
      console.log("Archivos Subidos", data);
      // queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      console.log("Error", error);
    },
  });
};

export const useDownloadFile = () => {
  return useMutation<
    { blob: Blob; filename: string }, // Return both the file Blob and the filename
    Error,
    string // Input is the mongoFileId
  >({
    mutationFn: async (mongoFileId: string) => {
      const response = await appService.get(`/mongo-file-storage/download/${mongoFileId}`, {
        responseType: "blob", // Ensure the response is treated as a Blob
      });

      // Extract filename from content-disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = `file-${mongoFileId}`; // Fallback filename
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      return {
        blob: response.data,
        filename,
      };
    },
    onError: (error: Error) => {
      console.error("Error downloading file:", error);
    },
  });
};