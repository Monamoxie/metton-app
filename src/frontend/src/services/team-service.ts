import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";

// -- List teams in a workspace --
export const listTeams = async (slug: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get(`/workspace/${slug}/teams/`, {
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

// -- Create a team in a workspace, with the current user as lead --
export const createTeam = async (
  slug: string,
  name: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(
      `/workspace/${slug}/teams/`,
      { name },
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
