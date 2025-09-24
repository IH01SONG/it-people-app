import { joinRequestApi } from '../lib/joinRequest.api';

// 로컬 매핑 유틸
const KEY = "joinReqMap";

export function linkReqMap(postId: string, requestId: string) {
  const map = new Map<string,string>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  map.set(postId, requestId);
  localStorage.setItem(KEY, JSON.stringify([...map]));
}

export function unlinkReqMap(postId: string) {
  const map = new Map<string,string>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  map.delete(postId);
  localStorage.setItem(KEY, JSON.stringify([...map]));
}

export async function findRequestIdByPost(postId: string): Promise<string | undefined> {
  const map = new Map<string,string>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  if (map.has(postId)) return map.get(postId)!;

  const sent = await joinRequestApi.getSentMany(["pending","approved"]);
  // 같은 postId 중 최신(예: createdAt 내림차순)이면 그걸 사용
  const found = sent
    .filter((r: any) => {
      const reqPostId = r.post?._id || r.post?.id || r.postId;
      return String(reqPostId) === String(postId) && (r.status === "pending" || r.status === "approved");
    })
    .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

  if (found?.id || found?._id) {
    const foundId = found.id || found._id;
    linkReqMap(postId, foundId);
    return foundId;
  }

  return undefined;
}