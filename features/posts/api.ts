import { api } from "@/store/api";
import { Post, PostComment } from "./types";
import { ApiResponse } from "@/store/api-response";
import { ApiErrorResponse, createApiError } from "@/store/api-error";

interface GetRecentPostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<Post, FormData>({
      query: (formData) => ({
        url: "/cms",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Post>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Posts", id: "LIST" }],
    }),
    getSocietyPosts: builder.query<Post[], string>({
      query: (societyId) => `/cms/society/${societyId}`,
      transformResponse: (response: ApiResponse<Post[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Posts" as const, id })),
              { type: "Posts", id: "LIST" },
            ]
          : [{ type: "Posts", id: "LIST" }],
    }),
    togglePostLike: builder.mutation<
      void,
      { postId: string; action: "LIKE" | "UNLIKE" }
    >({
      query: ({ postId, action }) => ({
        url: `/cms/${postId}/like`,
        method: "POST",
        body: { action },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: postId },
      ],
    }),
    getPostById: builder.query<Post, string>({
      query: (postId) => `/cms/${postId}`,
      transformResponse: (response: ApiResponse<Post>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => [{ type: "Posts", id: result?.id }],
    }),
    addComment: builder.mutation<void, { postId: string; content: string }>({
      query: ({ postId, content }) => ({
        url: `/cms/${postId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: postId },
      ],
    }),
    updatePost: builder.mutation<Post, { postId: string; data: FormData }>({
      query: ({ postId, data }) => ({
        url: `/cms/${data.get("societyId")}/${postId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Post>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: "LIST" },
        { type: "Posts", id: postId },
      ],
    }),
    deletePost: builder.mutation<void, { postId: string; societyId: string }>({
      query: ({ postId, societyId }) => ({
        url: `/cms/${societyId}/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: "LIST" },
        { type: "Posts", id: postId },
      ],
    }),
    getComments: builder.query<PostComment[], { postId: string }>({
      query: ({ postId }) => `/cms/${postId}/comments`,
      transformResponse: (response: ApiResponse<PostComment[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (_, __, { postId }) => [{ type: "Posts", id: postId }],
    }),
    getRecentPosts: builder.infiniteQuery<
      GetRecentPostsResponse,
      { limit?: number },
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        maxPages: 3,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          return lastPageParam < lastPage.totalPages
            ? lastPageParam + 1
            : undefined;
        },
        getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
          return firstPageParam > 1 ? firstPageParam - 1 : undefined;
        },
      },
      query: ({ queryArg, pageParam }) => {
        const { limit = 10 } = queryArg;
        const params = new URLSearchParams({
          page: pageParam.toString(),
          limit: limit.toString(),
        });

        return {
          url: `/cms?${params.toString()}`,
        };
      },
      transformResponse: (response: ApiResponse<GetRecentPostsResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: [{ type: "Posts", id: "LIST" }],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetSocietyPostsQuery,
  useTogglePostLikeMutation,
  useGetPostByIdQuery,
  useAddCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetCommentsQuery,
  useGetRecentPostsInfiniteQuery,
} = postApi;
