/**
 * 파일 업로드 유틸리티
 * 백엔드 파일 업로드 API와 GCS 직접 업로드를 처리
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://it-people-server-140857839854.asia-northeast3.run.app/api';

interface UploadUrlResponse {
  success: boolean;
  fileId: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: string;
  maxFileSize: number;
  fileRecord: {
    id: string;
    originalName: string;
    domain: string;
    category: string;
  };
}

interface UploadCompleteResponse {
  success: boolean;
  message: string;
  user?: any;
  file: {
    _id: string;
    originalName: string;
    publicUrl: string;
    domain: string;
    category: string;
  };
}

interface FileListResponse {
  success: boolean;
  files: Array<{
    _id: string;
    originalName: string;
    storedName: string;
    extension: string;
    mimeType: string;
    domain: string;
    category: string;
    publicUrl: string;
    size: number;
    humanReadableSize: string;
    dimensions?: {
      width: number;
      height: number;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class FileUploadError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "FileUploadError";
    this.status = status;
  }
}

/**
 * API 호출 헬퍼
 */
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token") || localStorage.getItem("auth_token");
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new FileUploadError(
      `파일 업로드 API 요청 실패: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}

/**
 * 파일 업로드 API
 */
export const fileUploadApi = {
  // 프로필 이미지 업로드
  profile: {
    // 업로드 URL 생성
    getUploadUrl: (fileName: string, fileType: string, fileSize: number) =>
      apiCall<UploadUrlResponse>("/upload/profile/url", {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      }),

    // 업로드 완료 처리
    complete: (fileId: string, uploadInfo: { 
      size: number; 
      dimensions?: { width: number; height: number } 
    }) =>
      apiCall<UploadCompleteResponse>("/upload/profile/complete", {
        method: "POST",
        body: JSON.stringify({ fileId, uploadInfo }),
      }),
  },

  // 게시글 이미지 업로드
  post: {
    // 업로드 URL 생성
    getUploadUrl: (fileName: string, fileType: string, fileSize: number) =>
      apiCall<UploadUrlResponse>("/upload/post/url", {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      }),

    // 업로드 완료 처리
    complete: (fileId: string, uploadInfo: { 
      size: number; 
      dimensions?: { width: number; height: number } 
    }, postId?: string) =>
      apiCall<UploadCompleteResponse>("/upload/post/complete", {
        method: "POST",
        body: JSON.stringify({ fileId, uploadInfo, postId }),
      }),
  },

  // 채팅 이미지 업로드
  chat: {
    // 업로드 URL 생성
    getUploadUrl: (fileName: string, fileType: string, fileSize: number) =>
      apiCall<UploadUrlResponse>("/upload/chat/url", {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      }),

    // 업로드 완료 처리
    complete: (fileId: string, uploadInfo: { size: number }, messageId?: string) =>
      apiCall<UploadCompleteResponse>("/upload/chat/complete", {
        method: "POST",
        body: JSON.stringify({ fileId, uploadInfo, messageId }),
      }),
  },

  // 파일 관리
  files: {
    // 사용자 파일 목록 조회
    getAll: (params?: {
      domain?: string;
      category?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.domain) queryParams.append("domain", params.domain);
      if (params?.category) queryParams.append("category", params.category);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const query = queryParams.toString();
      return apiCall<FileListResponse>(`/upload/files${query ? `?${query}` : ""}`);
    },

    // 특정 파일 조회
    getById: (fileId: string) =>
      apiCall<{ success: boolean; file: any }>(`/upload/files/${fileId}`),

    // 파일 메타데이터 업데이트
    updateMetadata: (fileId: string, metadata: {
      description?: string;
      tags?: string[];
      accessLevel?: string;
    }) =>
      apiCall<{ success: boolean; message: string; file: any }>(`/upload/files/${fileId}/metadata`, {
        method: "PUT",
        body: JSON.stringify(metadata),
      }),

    // 파일 사용 등록
    registerUsage: (fileId: string, resourceType: string, resourceId: string) =>
      apiCall<{ success: boolean }>(`/upload/files/${fileId}/usage`, {
        method: "POST",
        body: JSON.stringify({ resourceType, resourceId }),
      }),

    // 파일 사용 해제
    unregisterUsage: (fileId: string, resourceType: string, resourceId: string) =>
      apiCall<{ success: boolean }>(`/upload/files/${fileId}/usage`, {
        method: "DELETE",
        body: JSON.stringify({ resourceType, resourceId }),
      }),

    // 파일 삭제
    delete: (fileId: string, force: boolean = false) =>
      apiCall<{ success: boolean; message: string }>("/upload/file", {
        method: "DELETE",
        body: JSON.stringify({ fileId, force }),
      }),
  },
};

/**
 * 통합 파일 업로드 함수
 * @param file 업로드할 파일
 * @param domain 파일 도메인 ('profile', 'post', 'chat')
 * @param onProgress 업로드 진행률 콜백 (선택사항)
 */
export async function uploadFile(
  file: File,
  domain: 'profile' | 'post' | 'chat',
  onProgress?: (progress: number) => void
): Promise<UploadCompleteResponse> {
  try {
    // 1. 업로드 URL 요청
    onProgress?.(10);
    const uploadApi = fileUploadApi[domain];
    const { fileId, uploadUrl, publicUrl } = await uploadApi.getUploadUrl(
      file.name,
      file.type,
      file.size
    );

    // 2. GCS에 파일 직접 업로드
    onProgress?.(20);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new FileUploadError('파일 업로드 실패', uploadResponse.status);
    }

    onProgress?.(80);

    // 3. 이미지 차원 정보 가져오기 (이미지 파일인 경우)
    let dimensions: { width: number; height: number } | undefined;
    if (file.type.startsWith('image/')) {
      dimensions = await getImageDimensions(file);
    }

    // 4. 서버에 업로드 완료 알림
    const uploadInfo = {
      size: file.size,
      ...(dimensions && { dimensions }),
    };

    const result = await uploadApi.complete(fileId, uploadInfo);
    onProgress?.(100);

    return result;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
}

/**
 * 이미지 파일의 차원 정보를 가져오는 헬퍼 함수
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지 차원 정보를 가져올 수 없습니다.'));
    };
    
    img.src = objectUrl;
  });
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 파일 타입이 지원되는 이미지인지 확인
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') && 
         ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
}

/**
 * 파일 크기가 제한을 초과하지 않는지 확인
 */
export function isFileSizeValid(file: File, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export { FileUploadError };