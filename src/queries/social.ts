import * as ReactQuery from '@tanstack/react-query';

import {
  addCommentApi,
  followUserApi,
  getCommentsApi,
  getFeedApi,
  getFollowersApi,
  getFollowingApi,
  getFollowRequestsApi,
  getSocialSummaryApi,
  likePostApi,
  respondToFollowRequestApi,
  searchUsersApi,
  unfollowUserApi,
  unlikePostApi,
  type FollowRequestAction,
  type Post,
} from '@/api';
import { queryKeys } from '@/queries/keys';

// --- Лента ---

export function useFeed() {
  return ReactQuery.useInfiniteQuery({
    queryKey: queryKeys.feed,
    queryFn: ({ pageParam }) => getFeedApi(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length > 0 ? lastPage[lastPage.length - 1].createdAt : undefined,
  });
}

// Лайк применяется к кэшу ленты сразу, при ошибке лента перезапрашивается.
export function useToggleLike() {
  const queryClient = ReactQuery.useQueryClient();

  return ReactQuery.useMutation({
    mutationFn: (post: Post) =>
      post.isLiked ? unlikePostApi(post.id) : likePostApi(post.id),
    onMutate: (post) => {
      queryClient.setQueryData<ReactQuery.InfiniteData<Post[]>>(
        queryKeys.feed,
        (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page) =>
              page.map((p) =>
                p.id === post.id
                  ? {
                      ...p,
                      isLiked: !p.isLiked,
                      likesCount: p.likesCount + (p.isLiked ? -1 : 1),
                    }
                  : p,
              ),
            ),
          };
        },
      );
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useComments(postId: string | null) {
  return ReactQuery.useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => getCommentsApi(postId as string),
    enabled: !!postId,
  });
}

export function useAddComment(postId: string | null) {
  const queryClient = ReactQuery.useQueryClient();

  return ReactQuery.useMutation({
    mutationFn: (text: string) => addCommentApi(postId as string, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments(postId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

// --- Друзья ---

export function useSearchUsers(q: string, enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: queryKeys.social.search(q),
    queryFn: () => searchUsersApi(q),
    enabled,
  });
}

export function useFollowing(enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: queryKeys.social.following,
    queryFn: getFollowingApi,
    enabled,
  });
}

export function useFollowers(enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: queryKeys.social.followers,
    queryFn: getFollowersApi,
    enabled,
  });
}

export function useFollowRequests(enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: queryKeys.social.requests,
    queryFn: getFollowRequestsApi,
    enabled,
  });
}

export function useSocialSummary() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.social.summary,
    queryFn: getSocialSummaryApi,
  });
}

// Любое изменение подписок затрагивает все социальные списки.
function useInvalidateSocial() {
  const queryClient = ReactQuery.useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: queryKeys.social.all });
}

export function useRespondToFollowRequest() {
  const invalidate = useInvalidateSocial();

  return ReactQuery.useMutation({
    mutationFn: ({ id, action }: { id: string; action: FollowRequestAction }) =>
      respondToFollowRequestApi(id, action),
    onSuccess: invalidate,
  });
}

export function useFollowUser(publicId: string) {
  const invalidate = useInvalidateSocial();

  return ReactQuery.useMutation({
    mutationFn: () => followUserApi(publicId),
    onSuccess: invalidate,
  });
}

export function useUnfollowUser(publicId: string) {
  const invalidate = useInvalidateSocial();

  return ReactQuery.useMutation({
    mutationFn: () => unfollowUserApi(publicId),
    onSuccess: invalidate,
  });
}
