import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import { ScheduleOverride, UpdateScheduleInput } from "@/types/schedule";

// -- Fetch the current user's own schedule --
export const getSchedule = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get("/event/schedule/", {
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

// -- Create-or-update the current user's schedule --
export const updateSchedule = async (
  payload: UpdateScheduleInput
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.patch("/event/schedule/", payload, {
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

// -- Add a date override (holiday or custom one-off hours) --
export const addOverride = async (
  payload: ScheduleOverride
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(
      "/event/schedule/overrides/",
      payload,
      { headers: Utils.getAuthApiHeader() }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- Remove a date override --
export const removeOverride = async (date: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.delete(
      `/event/schedule/overrides/${date}/`,
      { headers: Utils.getAuthApiHeader() }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};
