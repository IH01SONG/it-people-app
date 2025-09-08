// 전역 사용자 위치 관리 유틸리티

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  isUserSet: boolean; // 사용자가 직접 설정했는지 여부
}

// 기본 위치 (홍대입구)
const DEFAULT_LOCATION: UserLocation = {
  lat: 37.5502,
  lng: 126.9235,
  address: "홍대입구",
  isUserSet: false
};

// 로컬 스토리지 키
const LOCATION_STORAGE_KEY = 'user_location';

// 저장된 사용자 위치 가져오기
export const getSavedUserLocation = (): UserLocation | null => {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 사용자 위치 저장하기
export const saveUserLocation = (location: UserLocation): void => {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('위치 저장 실패:', error);
  }
};

// 현재 GPS 위치 가져오기
export const getCurrentPosition = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Kakao Maps API로 주소 변환
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].road_address?.region_2depth_name || 
                             result[0].address?.region_2depth_name ||
                             result[0].road_address?.region_3depth_name ||
                             result[0].address?.region_3depth_name ||
                             '현재 위치';
              
              const userLocation: UserLocation = {
                lat: latitude,
                lng: longitude,
                address,
                isUserSet: false // GPS로 가져온 것은 자동 위치
              };
              
              resolve(userLocation);
            } else {
              // 주소 변환 실패 시 좌표만 사용
              resolve({
                lat: latitude,
                lng: longitude,
                address: '현재 위치',
                isUserSet: false
              });
            }
          });
        } else {
          // Kakao Maps가 없는 경우
          resolve({
            lat: latitude,
            lng: longitude,
            address: '현재 위치',
            isUserSet: false
          });
        }
      },
      (error) => {
        console.log('위치 정보를 가져올 수 없습니다:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000 // 5분간 캐시
      }
    );
  });
};

// 최종 사용자 위치 결정 (우선순위: 사용자 설정 > GPS > 기본값)
export const getUserLocation = async (): Promise<UserLocation> => {
  // 1. 사용자가 직접 설정한 위치 확인
  const savedLocation = getSavedUserLocation();
  if (savedLocation && savedLocation.isUserSet) {
    return savedLocation;
  }

  try {
    // 2. GPS로 현재 위치 가져오기
    const currentLocation = await getCurrentPosition();
    return currentLocation;
  } catch {
    // 3. 모든 방법 실패 시 기본 위치
    return DEFAULT_LOCATION;
  }
};

// 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}