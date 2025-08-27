import { api } from "@/store/api";
import { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { setError, setLoading, setSessionId } from "./slice";
import { ChatMessage } from "./types";

const chatBotApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation<{ sessionId: string }, void>({
      query: () => ({
        url: "/chatbot/session",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ sessionId: string }>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        dispatch(setLoading(true));
        queryFulfilled
          .then(({ data }) => {
            dispatch(setSessionId(data.sessionId));
          })
          .catch((error) => {
            console.error("Failed to create session:", error);
            dispatch(setError(error.message));
          })
          .finally(() => {
            dispatch(setLoading(false));
          });
      },
    }),
    sendQuery: builder.mutation<
      ChatMessage,
      { sessionId: string; query: string }
    >({
      query: (args) => ({
        url: "/chatbot/query",
        method: "POST",
        body: args,
      }),
      transformResponse: (
        response: ApiResponse<{
          response: string;
          intermediateSteps: unknown[];
        }>
      ) => {
        return {
          id: Date.now().toString(),
          isUser: false,
          text: response.data.response,
          timestamp: new Date().toISOString(),
        };
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const { useCreateSessionMutation, useSendQueryMutation } = chatBotApi;
