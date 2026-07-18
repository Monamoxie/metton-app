import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import { CreateWorkspaceInput } from "@/types/workspace";

// -- List the current user's workspaces --
export const listWorkspaces = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get("/workspace/", {
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

// -- Fetch a single workspace the current user belongs to, by slug --
export const getWorkspace = async (slug: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get(`/workspace/${slug}/`, {
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

// -- Create a workspace, with the current user as owner --
export const createWorkspace = async (
  payload: CreateWorkspaceInput
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post("/workspace/", payload, {
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
