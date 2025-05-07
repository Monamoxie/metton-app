import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";

// -- // --
export const getProfile = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get("/identity/user/profile", {
      headers: Utils.getAuthApiHeader(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- // --
export const updateProfile = async (
  payload: FormData
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.patch(
      "/identity/user/profile",
      payload,
      {
        headers: {
          ...Utils.getAuthApiHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};
