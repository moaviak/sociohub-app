import { api } from "@/store/api";
import { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { JoinRequest, Society } from "@/types";

interface SocietyKPIsResponse {
  members: number;
  activeEvents: number;
  totalTeams: number;
  upcomingEventRegistrations: number;
}

export const SocietiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSociety: builder.query<Society, { societyId: string }>({
      query: ({ societyId }) => ({
        url: `/society/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Society>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
          return [{ type: "Societies", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    getSocieties: builder.query<
      (Society & { isMember: boolean; hasRequestedToJoin: boolean })[],
      { search?: string }
    >({
      query: ({ search }) => ({
        url: "/society",
        params: { search },
      }),
      transformResponse: (
        response: ApiResponse<
          (Society & { isMember: boolean; hasRequestedToJoin: boolean })[]
        >
      ) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.map(({ id }) => ({ type: "Societies" as const, id })),
            { type: "Societies", id: "LIST" },
          ];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
    sendJoinRequest: builder.mutation<
      JoinRequest,
      {
        societyId: string;
        whatsappNo: string;
        semester: number;
        interestedRole: string;
        reason: string;
        expectations: string;
        skills?: string;
      }
    >({
      query: (body) => ({
        url: "/student/send-request",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<JoinRequest>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Societies", id: result.societyId }];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
    cancelJoinRequest: builder.mutation<
      JoinRequest,
      {
        societyId: string;
      }
    >({
      query: ({ societyId }) => ({
        url: `/student/cancel-request/${societyId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<JoinRequest>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Societies", id: result.societyId }];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
    getSocietyKPIs: builder.query<SocietyKPIsResponse, string>({
      query: (societyId) => `/society/${societyId}/kpis`,
      transformResponse: (response: ApiResponse<SocietyKPIsResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetSocietyQuery,
  useGetSocietiesQuery,
  useCancelJoinRequestMutation,
  useSendJoinRequestMutation,
  useGetSocietyKPIsQuery,
} = SocietiesApi;
