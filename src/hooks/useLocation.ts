import { useState, useRef, useCallback } from "react";
import { useKakaoLoader } from "react-kakao-maps-sdk";

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState("위치 확인 중...");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const currentCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const currentLocationRef = useRef<string>("위치 확인 중...");
  const [locationLoading, setLocationLoading] = useState(true);

  // 카카오맵 SDK 로더
  const [mapLoading, mapError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY || "0c537754f8fad9d1b779befd5d75dc07",
    libraries: ["services"],
  });

  // 현재 위치를 가져오는 함수
  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);

    // 카카오맵이 로딩 중이면 대기
    if (mapLoading) {
      setCurrentLocation("지도 로딩 중...");
      setLocationLoading(false);
      return;
    }

    // 카카오맵 로딩 에러가 있으면 기본값 사용
    if (mapError) {
      console.error("❌ 카카오맵 로딩 에러:", mapError);
      setCurrentLocation("홍대입구");
      currentLocationRef.current = "홍대입구";
      setLocationLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      console.error("❌ Geolocation이 지원되지 않습니다.");
      setCurrentLocation("홍대입구");
      currentLocationRef.current = "홍대입구";
      setLocationLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5분간 캐시
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const coords = { lat: latitude, lng: longitude };
      currentCoordsRef.current = coords;
      setCurrentCoords(coords);

      // 주소 변환을 Promise로 래핑하여 완료 후 게시글 로드
      try {
        if (!window.kakao || !window.kakao.maps) {
          console.warn("⚠️ 카카오맵 SDK 미로드, 기본 위치명 사용");
          setCurrentLocation("현재 위치");
          currentLocationRef.current = "현재 위치";
          setLocationLoading(false);
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();

        // Promise로 래핑하여 주소 변환 완료 후 게시글 로드
        await new Promise<void>((resolve) => {
          geocoder.coord2Address(
            longitude,
            latitude,
            (result: unknown, status: unknown) => {
              let location = "현재 위치";

              if (status === window.kakao.maps.services.Status.OK) {
                if (result && Array.isArray(result) && result[0]) {
                  const region = (result[0] as Record<string, unknown>)
                    .address as Record<string, unknown>;
                  location = region.region_3depth_name as string;

                  if (!location || location.trim() === "") {
                    location = region.region_2depth_name as string;
                  }

                  if (!location || location.trim() === "") {
                    location = "알 수 없는 위치";
                  }
                }
              }

              setCurrentLocation(location);
              currentLocationRef.current = location;
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("❌ 주소 변환 실패:", error);
        setCurrentLocation("현재 위치");
        currentLocationRef.current = "현재 위치";
      }
    } catch (error) {
      console.error("❌ 위치 가져오기 실패:", error as Error);
      setCurrentLocation("홍대입구");
      currentLocationRef.current = "홍대입구";
    } finally {
      setLocationLoading(false);
    }
  }, [mapLoading, mapError]);

  return {
    currentLocation,
    currentCoords,
    currentCoordsRef,
    currentLocationRef,
    locationLoading,
    mapLoading,
    mapError,
    getCurrentLocation,
  };
}