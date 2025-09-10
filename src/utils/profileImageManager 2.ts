/**
 * 프로필 이미지 관리 유틸리티
 * LocalStorage + Cloudinary를 활용한 하이브리드 방식
 */

interface ProfileImageData {
  id: string;
  url: string;
  thumbnail: string;
  uploadedAt: string;
  source: 'local' | 'cloudinary' | 'external';
}

interface ImageUploadOptions {
  quality?: number; // 0-1, 기본값 0.8
  maxWidth?: number; // 기본값 800px
  maxHeight?: number; // 기본값 800px
  thumbnailSize?: number; // 기본값 150px
}

class ProfileImageManager {
  private readonly STORAGE_KEY = 'it_people_profile_images';
  private readonly CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'it-people-profiles';
  private readonly CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

  /**
   * 이미지 파일을 압축하고 리사이징
   */
  private async compressImage(
    file: File, 
    options: ImageUploadOptions = {}
  ): Promise<{ original: string; thumbnail: string }> {
    const {
      quality = 0.8,
      maxWidth = 800,
      maxHeight = 800,
      thumbnailSize = 150
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // 원본 이미지 리사이징
          const { width, height } = this.calculateDimensions(
            img.width, img.height, maxWidth, maxHeight
          );
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const originalDataUrl = canvas.toDataURL('image/jpeg', quality);

            // 썸네일 생성
            const thumbSize = Math.min(width, height, thumbnailSize);
            canvas.width = thumbSize;
            canvas.height = thumbSize;
            
            const offsetX = (width - thumbSize) / 2;
            const offsetY = (height - thumbSize) / 2;
            
            ctx.drawImage(img, offsetX, offsetY, thumbSize, thumbSize, 0, 0, thumbSize, thumbSize);
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);

            resolve({
              original: originalDataUrl,
              thumbnail: thumbnailDataUrl
            });
          } else {
            reject(new Error('Canvas context not available'));
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 이미지 크기 계산 (비율 유지)
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Cloudinary에 이미지 업로드
   */
  private async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'profile_images');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * LocalStorage에서 프로필 이미지 데이터 가져오기
   */
  private getStoredImages(): ProfileImageData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored images:', error);
      return [];
    }
  }

  /**
   * LocalStorage에 프로필 이미지 데이터 저장
   */
  private saveToStorage(images: ProfileImageData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving images to storage:', error);
      // LocalStorage 용량 초과 시 오래된 이미지 삭제
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanOldImages();
        // 다시 시도
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
        } catch (retryError) {
          console.error('Retry save failed:', retryError);
        }
      }
    }
  }

  /**
   * 오래된 이미지 정리 (용량 관리)
   */
  private cleanOldImages(): void {
    const images = this.getStoredImages();
    // 최근 10개만 유지
    const recentImages = images
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 10);
    
    this.saveToStorage(recentImages);
  }

  /**
   * 프로필 이미지 업로드 (하이브리드 방식)
   */
  async uploadProfileImage(
    file: File,
    useCloudinary: boolean = false,
    options: ImageUploadOptions = {}
  ): Promise<ProfileImageData> {
    try {
      // 이미지 압축 및 리사이징
      const { original, thumbnail } = await this.compressImage(file, options);

      let imageUrl: string;
      let source: 'local' | 'cloudinary';

      if (useCloudinary) {
        // Cloudinary 업로드 시도
        try {
          imageUrl = await this.uploadToCloudinary(file);
          source = 'cloudinary';
        } catch (error) {
          console.warn('Cloudinary upload failed, falling back to local storage');
          imageUrl = original;
          source = 'local';
        }
      } else {
        // LocalStorage 사용
        imageUrl = original;
        source = 'local';
      }

      const imageData: ProfileImageData = {
        id: Date.now().toString(),
        url: imageUrl,
        thumbnail,
        uploadedAt: new Date().toISOString(),
        source
      };

      // LocalStorage에 메타데이터 저장 (Cloudinary 사용시에도 캐싱용)
      const images = this.getStoredImages();
      images.push(imageData);
      this.saveToStorage(images);

      return imageData;
    } catch (error) {
      console.error('Profile image upload failed:', error);
      throw error;
    }
  }

  /**
   * 외부 URL로부터 프로필 이미지 설정
   */
  async setProfileImageFromUrl(url: string): Promise<ProfileImageData> {
    try {
      // URL 유효성 검사
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Invalid image URL');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      // 썸네일 생성을 위해 이미지 로드
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const thumbnail = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const size = 150;
          canvas.width = size;
          canvas.height = size;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            reject(new Error('Canvas context not available'));
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });

      const imageData: ProfileImageData = {
        id: Date.now().toString(),
        url,
        thumbnail,
        uploadedAt: new Date().toISOString(),
        source: 'external'
      };

      const images = this.getStoredImages();
      images.push(imageData);
      this.saveToStorage(images);

      return imageData;
    } catch (error) {
      console.error('Set profile image from URL failed:', error);
      throw error;
    }
  }

  /**
   * 저장된 프로필 이미지 목록 조회
   */
  getStoredProfileImages(): ProfileImageData[] {
    return this.getStoredImages();
  }

  /**
   * 프로필 이미지 삭제
   */
  deleteProfileImage(imageId: string): boolean {
    try {
      const images = this.getStoredImages();
      const filteredImages = images.filter(img => img.id !== imageId);
      this.saveToStorage(filteredImages);
      return true;
    } catch (error) {
      console.error('Delete profile image failed:', error);
      return false;
    }
  }

  /**
   * 현재 프로필 이미지 설정
   */
  setCurrentProfileImage(imageId: string): void {
    localStorage.setItem('current_profile_image_id', imageId);
  }

  /**
   * 현재 프로필 이미지 가져오기
   */
  getCurrentProfileImage(): ProfileImageData | null {
    try {
      const currentId = localStorage.getItem('current_profile_image_id');
      if (!currentId) return null;

      const images = this.getStoredImages();
      return images.find(img => img.id === currentId) || null;
    } catch (error) {
      console.error('Get current profile image failed:', error);
      return null;
    }
  }

  /**
   * 스토리지 사용량 확인 (대략적인 계산)
   */
  getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      const images = this.getStoredImages();
      const totalSize = images.reduce((size, img) => {
        return size + (img.url.length * 2) + (img.thumbnail.length * 2); // UTF-16 기준
      }, 0);

      const maxStorage = 5 * 1024 * 1024; // 5MB (대략적인 LocalStorage 한계)
      
      return {
        used: totalSize,
        total: maxStorage,
        percentage: Math.round((totalSize / maxStorage) * 100)
      };
    } catch (error) {
      console.error('Get storage usage failed:', error);
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
    }
  }

  /**
   * 전체 프로필 이미지 데이터 초기화
   */
  clearAllImages(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('current_profile_image_id');
    } catch (error) {
      console.error('Clear all images failed:', error);
    }
  }
}

// 싱글톤 인스턴스 생성
const profileImageManager = new ProfileImageManager();

export default profileImageManager;
export type { ProfileImageData, ImageUploadOptions };