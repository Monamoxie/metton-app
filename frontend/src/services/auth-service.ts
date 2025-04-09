import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import { SignupInputs } from "@/types/identity";

export const createAccount = async (
  payload: SignupInputs
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post("/identity/signup", payload, {
      headers: Utils.getDefaultApiHeader(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};
