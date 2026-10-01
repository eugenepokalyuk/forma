import * as ReactQuery from '@tanstack/react-query';

import { addCommentApi } from './api/addCommentApi';
import { followUserApi } from './api/followUserApi';
import { getCommentsApi } from './api/getCommentsApi';
import { getFeedApi } from './api/getFeedApi';
import { getFollowersApi } from './api/getFollowersApi';
import { getFollowingApi } from './api/getFollowingApi';
import { getFollowRequestsApi } from './api/getFollowRequestsApi';
import { getSocialSummaryApi } from './api/getSocialSummaryApi';
import { likePostApi } from './api/likePostApi';
import { respondToFollowRequestApi } from './api/respondToFollowRequestApi';
import { searchUsersApi } from './api/searchUsersApi';
import { unfollowUserApi } from './api/unfollowUserApi';
import { unlikePostApi } from './api/unlikePostApi';
import type { FollowRequestAction, Post } from './models/social';
import { alertActionFailed } from '@/shared/ui';

// Значения ключей не менять без нужды — кэш персистится в MMKV между запусками.
export const socialKeys = {
  all: ['social'] as const,
  feed: ['feed'] as const,
  comments: (postId: string | null) => ['comments', postId] as const,
  search: (q: string) => ['social', 'search', q] as const,
  following: ['social', 'following'] as const,
  followers: ['social', 'followers'] as const,
  requests: ['social', 'requests'] as const,
  summary: ['social', 'summary'] as const,
};

// --- Лента ---

export function useFeed() {
  return ReactQuery.useInfiniteQuery({
    queryKey: socialKeys.feed,
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
        socialKeys.feed,
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
      void queryClient.invalidateQueries({ queryKey: socialKeys.feed });
    },
  });
}

export function useComments(postId: string | null) {
  return ReactQuery.useQuery({
    queryKey: socialKeys.comments(postId),
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
        queryKey: socialKeys.comments(postId),
      });
      void queryClient.invalidateQueries({ queryKey: socialKeys.feed });
    },
    // Текст остаётся в поле — можно отправить ещё раз.
    onError: () => alertActionFailed('отправить комментарий'),
  });
}

// --- Друзья ---

export function useSearchUsers(q: string, enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: socialKeys.search(q),
    queryFn: () => searchUsersApi(q),
    enabled,
  });
}

export function useFollowing(enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: socialKeys.following,
    queryFn: getFollowingApi,
    enabled,
  });
}

export function useFollowers(enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: socialKeys.followers,
    queryFn: getFollowersApi,
    enabled,
  });
}

export function useFollowRequests(enabled: boolean) {
  return ReactQuery.useQuery({
    queryKey: socialKeys.requests,
    queryFn: getFollowRequestsApi,
    enabled,
  });
}

export function useSocialSummary() {
  return ReactQuery.useQuery({
    queryKey: socialKeys.summary,
    queryFn: getSocialSummaryApi,
  });
}

// Любое изменение подписок затрагивает все социальные списки.
function useInvalidateSocial() {
  const queryClient = ReactQuery.useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: socialKeys.all });
}

export function useRespondToFollowRequest() {
  const invalidate = useInvalidateSocial();

  return ReactQuery.useMutation({
    mutationFn: ({ id, action }: { id: string; action: FollowRequestAction }) =>
      respondToFollowRequestApi(id, action),
    onSuccess: invalidate,
    onError: () => alertActionFailed('ответить на запрос'),
  });
}

export function useFollowUser(publicId: string) {
  const invalidate = useInvalidateSocial();

  return ReactQuery.useMutation({
    mutationFn: () => followUserApi(publicId),
    onSuccess: invalidate,
    onError: () => alertActionFailed('подписаться'),
  });
}

export function useUnfollowUser(publicId: string) {
  const invalidate = useInvalidateSocial();

  return ReactQuery.useMutation({
    mutationFn: () => unfollowUserApi(publicId),
    onSuccess: invalidate,
    onError: () => alertActionFailed('отписаться'),
  });
}
