import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import { InviteInput } from "@/types/workspace";


export const inviteMembers = async (
  slug: string,
  invites: InviteInput[],
  teamSlug?: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(
      `/workspace/${slug}/invitations/`,
      { invites, ...(teamSlug ? { team_slug: teamSlug } : {}) },
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

// -- List pending invitations for a workspace --
export const listPendingInvitations = async (slug: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get(`/workspace/${slug}/invitations/`, {
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

// -- Preview an invitation by token, no auth required --
export const peekInvitation = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.get(`/workspace/invitations/${token}/`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- Revoke a pending invitation --
export const revokeInvitation = async (
  slug: string,
  invitationId: number
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.delete(
      `/workspace/${slug}/invitations/${invitationId}/`,
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

// -- Accept an invitation, joining its workspace/team --
export const acceptInvitation = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(
      `/workspace/invitations/${token}/accept/`,
      {},
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
