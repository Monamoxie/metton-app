import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";

// -- // --
export const getUserProfile = async (): Promise<ApiResponse> => {
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
