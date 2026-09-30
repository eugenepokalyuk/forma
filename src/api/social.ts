import { apiClient } from '@/api/client';
import type {
  Comment,
  FollowRequestAction,
  FollowRequestItem,
  Post,
  PublicUser,
  SocialSummary,
} from '@/api/types';

// Соответствует forma-next/src/services/Api/social/social.api.ts —
// та же лента, тот же Django-бэкенд, поля уже camelCase.

export function fetchFeed(before?: string) {
  return apiClient
    .get<Post[]>('/social/feed', { params: before ? { before } : undefined })
    .then((res) => res.data);
}

export function searchUsers(q: string) {
  return apiClient
    .get<PublicUser[]>('/social/search', { params: { q } })
    .then((res) => res.data);
}

export function fetchPublicProfile(publicId: string) {
  return apiClient
    .get<PublicUser>(`/social/users/${publicId}`)
    .then((res) => res.data);
}

export function followUser(publicId: string) {
  return apiClient
    .post<PublicUser>(`/social/users/${publicId}/follow`)
    .then((res) => res.data);
}

export function unfollowUser(publicId: string) {
  return apiClient
    .delete<PublicUser>(`/social/users/${publicId}/follow`)
    .then((res) => res.data);
}

export function fetchFollowing() {
  return apiClient
    .get<PublicUser[]>('/social/following')
    .then((res) => res.data);
}

export function fetchFollowers() {
  return apiClient
    .get<PublicUser[]>('/social/followers')
    .then((res) => res.data);
}

export function fetchFollowRequests() {
  return apiClient
    .get<FollowRequestItem[]>('/social/requests')
    .then((res) => res.data);
}

export function fetchOutgoingRequests() {
  return apiClient
    .get<PublicUser[]>('/social/requests/outgoing')
    .then((res) => res.data);
}

export function respondToFollowRequest(
  followId: string,
  action: FollowRequestAction,
) {
  return apiClient
    .post(`/social/requests/${followId}`, { action })
    .then((res) => res.data);
}

export function fetchSocialSummary() {
  return apiClient
    .get<SocialSummary>('/social/summary')
    .then((res) => res.data);
}

export function likePost(postId: string) {
  return apiClient
    .post<Post>(`/social/posts/${postId}/like`)
    .then((res) => res.data);
}

export function unlikePost(postId: string) {
  return apiClient
    .delete<Post>(`/social/posts/${postId}/like`)
    .then((res) => res.data);
}

export function fetchComments(postId: string) {
  return apiClient
    .get<Comment[]>(`/social/posts/${postId}/comments`)
    .then((res) => res.data);
}

export function addComment(postId: string, text: string) {
  return apiClient
    .post<Comment>(`/social/posts/${postId}/comments`, { text })
    .then((res) => res.data);
}

export function deleteComment(postId: string, commentId: string) {
  return apiClient.delete(`/social/posts/${postId}/comments/${commentId}`);
}
