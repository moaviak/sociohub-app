import { api } from "@/store/api";
import { Task } from "./types";
import { ApiResponse } from "@/store/api-response";
import { ApiErrorResponse, createApiError } from "@/store/api-error";

export const TasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserTasks: builder.query<Task[], { limit?: number }>({
      query: ({ limit = "" }) => ({
        url: `/tasks?limit=${limit}`,
      }),
      transformResponse: (response: ApiResponse<Task[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result && !("error" in result)) {
          return [
            ...result.map((item) => ({
              type: "Tasks" as const,
              id: item.id,
            })),
            { type: "Tasks", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
    }),
    createTask: builder.mutation<Task, { description: string }>({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    completeTask: builder.mutation<Task, { id: string; isCompleted: boolean }>({
      query: (data) => ({
        url: `/tasks/${data.id}/complete`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    starTask: builder.mutation<Task, { id: string; isStarred: boolean }>({
      query: (data) => ({
        url: `/tasks/${data.id}/star`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    assignTask: builder.mutation<
      Task,
      { description: string; memberId: string; societyId: string }
    >({
      query: (data) => ({
        url: "/tasks/assign",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    deleteTask: builder.mutation<Task, { id: string }>({
      query: (data) => ({
        url: `/tasks/${data.id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    updateTask: builder.mutation<Task, { id: string; description: string }>({
      query: (data) => ({
        url: `/tasks/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
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
  useGetUserTasksQuery,
  useCreateTaskMutation,
  useCompleteTaskMutation,
  useStarTaskMutation,
  useAssignTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} = TasksApi;
