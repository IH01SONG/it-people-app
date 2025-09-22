import { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

interface KakaoMaps {
  Map: any;
  LatLng: any;
  Marker: any;
  event: {
    addListener: (
      map: any,
      event: string,
      callback: (mouseEvent: any) => void
    ) => void;
  };
  services: {
    Places: any;
    Geocoder: any;
    Status: {
      OK: string;
    };
    SortBy: {
      DISTANCE: string;
      ACCURACY: string;
    };
  };
  load: (callback: () => void) => void;
}

declare global {
  interface Window {
    kakao: {
      maps: KakaoMaps;
    };
  }
}

interface MapPickerProps {
  onLocationChange: (
    location: string,
    coords: { lat: number; lng: number }
  ) => void;
  searchKeyword?: string;
}

export default function MapPicker({
  onLocationChange,
  searchKeyword,
}: MapPickerProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const isSearchingRef = useRef(false);
  const lastSearchCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // 좌표로 상호명/주소 검색하는 함수 (지도 이동 없음) - debounce 적용
  const searchPlaceByCoords = useCallback(
    (lat: number, lng: number) => {
      // 같은 좌표면 중복 검색 방지 (10m 이내)
      if (lastSearchCoordsRef.current) {
        const distance =
          Math.sqrt(
            Math.pow(lat - lastSearchCoordsRef.current.lat, 2) +
              Math.pow(lng - lastSearchCoordsRef.current.lng, 2)
          ) * 111000; // 대략적인 미터 변환

        if (distance < 10) {
          return; // 10m 이내면 중복 검색하지 않음
        }
      }

      // 기존 타이머 클리어
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // 500ms debounce 적용
      searchTimeoutRef.current = setTimeout(() => {
        lastSearchCoordsRef.current = { lat, lng };

        if (!window.kakao?.maps?.services) {
          onLocationChange(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`, {
            lat,
            lng,
          });
          return;
        }

        // 간단한 주소 변환만 수행 (categorySearch 제거로 API 호출 최소화)
        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            // 도로명 주소 우선, 없으면 지번 주소 사용
            const roadAddress = result[0].road_address;
            const address = roadAddress ? roadAddress.address_name : result[0].address.address_name;
            onLocationChange(address, { lat, lng });
          } else {
            // 최후의 수단: 좌표 표시
            onLocationChange(
              `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`,
              { lat, lng }
            );
          }
        });
      }, 500);
    },
    [onLocationChange]
  );

  // 키워드로 장소 검색하는 함수 (외부에서 호출)
  const searchByKeyword = useCallback(
    (keyword: string) => {
      if (
        !keyword.trim() ||
        !map ||
        !window.kakao?.maps?.services ||
        isSearchingRef.current
      )
        return;

      isSearchingRef.current = true;
      const places = new window.kakao.maps.services.Places();

      // 현재 지도 중심점을 기준으로 검색
      const mapCenter = map.getCenter();
      const searchOptions = {
        location: mapCenter,
        radius: 20000, // 20km 반경
        sort: window.kakao.maps.services.SortBy.ACCURACY, // 정확도 우선 정렬
      };

      places.keywordSearch(
        keyword,
        (result: any[], status: string) => {
          isSearchingRef.current = false;
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            // 검색 키워드와 정확히 일치하거나 가장 관련성이 높은 장소 찾기
            let bestMatch = result[0]; // 기본값은 첫 번째 결과

            // 1. 정확한 이름 매칭 우선 (역, 학교, 공공기관 등)
            const exactMatch = result.find((place: any) =>
              place.place_name.toLowerCase().includes(keyword.toLowerCase()) &&
              (place.category_name.includes('지하철') ||
               place.category_name.includes('철도') ||
               place.category_name.includes('역') ||
               place.category_name.includes('학교') ||
               place.category_name.includes('관공서') ||
               place.category_name.includes('병원') ||
               place.category_name.includes('은행') ||
               place.category_name.includes('마트') ||
               place.category_name.includes('백화점'))
            );

            if (exactMatch) {
              bestMatch = exactMatch;
            } else {
              // 2. 이름이 정확히 일치하는 것 찾기
              const nameMatch = result.find((place: any) =>
                place.place_name.toLowerCase() === keyword.toLowerCase() ||
                place.place_name.toLowerCase().includes(keyword.toLowerCase())
              );

              if (nameMatch) {
                bestMatch = nameMatch;
              }
            }

            const newPosition = new window.kakao.maps.LatLng(bestMatch.y, bestMatch.x);

            map.setCenter(newPosition);
            marker.setPosition(newPosition);
            const newCoords = {
              lat: parseFloat(bestMatch.y),
              lng: parseFloat(bestMatch.x),
            };
            onLocationChange(bestMatch.place_name, newCoords);

            // 디버깅용 로그
            console.log('🔍 검색 결과:', {
              keyword,
              totalResults: result.length,
              selectedPlace: bestMatch.place_name,
              category: bestMatch.category_name,
              allResults: result.map((p: any) => ({
                name: p.place_name,
                category: p.category_name
              }))
            });
          }
        },
        searchOptions
      );
    },
    [map, marker, onLocationChange]
  );

  // 외부에서 검색 키워드가 변경될 때 처리
  useEffect(() => {
    if (
      searchKeyword &&
      searchKeyword.trim() &&
      !searchKeyword.includes("위도:") &&
      !searchKeyword.includes("경도:")
    ) {
      const timer = setTimeout(() => {
        searchByKeyword(searchKeyword);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchKeyword, searchByKeyword]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initMap, 100);
        return;
      }

      try {
        const initializeMapWithLocation = (
          lat: number,
          lng: number,
          isCurrentLocation: boolean
        ) => {
          const mapOption = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3,
          };

          const mapInstance = new window.kakao.maps.Map(
            mapRef.current,
            mapOption
          );
          setMap(mapInstance);

          // 마커 생성
          const markerPosition = new window.kakao.maps.LatLng(lat, lng);
          const markerInstance = new window.kakao.maps.Marker({
            position: markerPosition,
            draggable: true,
          });
          markerInstance.setMap(mapInstance);
          setMarker(markerInstance);

          // 지도 클릭 이벤트
          window.kakao.maps.event.addListener(
            mapInstance,
            "click",
            (mouseEvent: any) => {
              const latlng = mouseEvent.latLng;
              const clickLat = latlng.getLat();
              const clickLng = latlng.getLng();

              markerInstance.setPosition(latlng);
              searchPlaceByCoords(clickLat, clickLng);
            }
          );

          // 마커 드래그 이벤트
          window.kakao.maps.event.addListener(markerInstance, "dragend", () => {
            const position = markerInstance.getPosition();
            const dragLat = position.getLat();
            const dragLng = position.getLng();

            searchPlaceByCoords(dragLat, dragLng);
          });

          // 초기 위치는 지도만 설정하고, 사용자가 선택하기 전까지는 주소를 표시하지 않음
          // 사용자가 지도를 클릭하거나 마커를 드래그할 때만 주소 표시
        };

        // 현재 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              initializeMapWithLocation(latitude, longitude, true);
            },
            () => {
              const defaultLat = 37.5665;
              const defaultLng = 126.978;
              initializeMapWithLocation(defaultLat, defaultLng, false);
            }
          );
        } else {
          const defaultLat = 37.5665;
          const defaultLng = 126.978;
          initializeMapWithLocation(defaultLat, defaultLng, false);
        }
      } catch (error) {
        console.error("지도 초기화 오류:", error);
        onLocationChange("위치를 불러올 수 없습니다", { lat: 0, lng: 0 });
      }
    };

    initMap();
  }, [searchPlaceByCoords, onLocationChange]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 현재 위치로 돌아가기
  const returnToCurrentLocation = () => {
    if (!map || !marker) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = new window.kakao.maps.LatLng(
          latitude,
          longitude
        );

        map.setCenter(currentPosition);
        marker.setPosition(currentPosition);
        // 현재 위치도 실제 주소로 변환
        searchPlaceByCoords(latitude, longitude);
      });
    }
  };

  return (
    <Box
      sx={{
        border: "2px solid #E762A9",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height: "250px",
          bgcolor: "#f5f5f5",
        }}
      />

      {/* 현재 위치로 돌아가기 버튼 */}
      <IconButton
        onClick={returnToCurrentLocation}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "1px solid #E762A9",
          color: "#E762A9",
          width: 36,
          height: 36,
          "&:hover": {
            backgroundColor: "#E762A9",
            color: "white",
          },
          transition: "all 0.2s ease",
        }}
        disabled={!map || !marker}
      >
        <MyLocationIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box
        sx={{
          p: 2,
          bgcolor: "rgba(231, 98, 169, 0.05)",
          borderTop: "1px solid rgba(231, 98, 169, 0.2)",
        }}
      >
        <Box sx={{ fontSize: "12px", color: "#E762A9", mb: 0.5 }}>
          💡 위치를 입력하거나 지도를 클릭하여 위치를 선택해주세요
        </Box>
        <Box sx={{ fontSize: "12px", color: "#E762A9" }}>
          🖱️ 마커를 드래그하여 정확한 위치를 조정할 수 있습니다
        </Box>
      </Box>
    </Box>
  );
}
