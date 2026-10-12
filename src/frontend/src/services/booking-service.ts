import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import { CreateBookingInput } from "@/types/booking";

// -- Public: a host's booking-page profile --
export const getPublicProfile = async (publicId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get(`/event/${publicId}/public-profile/`, {
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

// -- Public: bookable slots for a host in a date range --
export const getAvailableSlots = async (
  publicId: string,
  start: string,
  end: string,
  duration: number
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get(`/event/${publicId}/slots/`, {
      params: { start, end, duration },
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

// -- Public: create a booking with a host --
export const createBooking = async (
  publicId: string,
  payload: CreateBookingInput
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(`/event/${publicId}/book/`, payload, {
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
