import { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

interface KakaoPlace {
  place_name: string;
  x: string;
  y: string;
  [key: string]: any;
}

interface KakaoMaps {
  Map: any;
  LatLng: any;
  Marker: any;
  event: {
    addListener: (map: any, event: string, callback: (mouseEvent: any) => void) => void;
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
  onLocationChange: (location: string, coords: { lat: number; lng: number }) => void;
  searchKeyword?: string;
}

export default function MapPicker({ onLocationChange, searchKeyword }: MapPickerProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const isSearchingRef = useRef(false);

  // 거리 계산 함수
  const getDistance = useCallback((pos1: any, pos2: any): number => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = pos1.getLat() * Math.PI/180;
    const φ2 = pos2.getLat() * Math.PI/180;
    const Δφ = (pos2.getLat() - pos1.getLat()) * Math.PI/180;
    const Δλ = (pos2.getLng() - pos1.getLng()) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }, []);

  // 좌표로 상호명/주소 검색하는 함수 (지도 이동 없음)
  const searchPlaceByCoords = useCallback((lat: number, lng: number) => {
    if (!window.kakao?.maps?.services) {
      onLocationChange(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`, { lat, lng });
      return;
    }

    const places = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();
    const position = new window.kakao.maps.LatLng(lat, lng);
    
    // 1단계: 주변 상호/시설 검색 (반경 50m)
    places.categorySearch('', (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        // 가장 가까운 장소 찾기
        let closestPlace: KakaoPlace | null = null;
        let minDistance = Infinity;
        
        result.forEach((place: any) => {
          const placePos = new window.kakao.maps.LatLng(place.y, place.x);
          const distance = getDistance(position, placePos);
          
          if (distance < minDistance && distance < 50) { // 50m 이내
            minDistance = distance;
            closestPlace = place as KakaoPlace;
          }
        });
        
        if (closestPlace) {
          onLocationChange(closestPlace.place_name, { lat, lng });
          return;
        }
      }
      
      // 2단계: 주소로 변환
      geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const address = result[0].address.address_name;
          onLocationChange(address, { lat, lng });
        } else {
          // 최후의 수단: 좌표 표시
          onLocationChange(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`, { lat, lng });
        }
      });
    }, {
      location: position,
      radius: 100,
      sort: window.kakao.maps.services.SortBy.DISTANCE
    });
  }, [getDistance, onLocationChange]);

  // 키워드로 장소 검색하는 함수 (외부에서 호출)
  const searchByKeyword = useCallback((keyword: string) => {
    if (!keyword.trim() || !map || !window.kakao?.maps?.services || isSearchingRef.current) return;
    
    isSearchingRef.current = true;
    const places = new window.kakao.maps.services.Places();
    
    // 현재 지도 중심점을 기준으로 검색
    const mapCenter = map.getCenter();
    const searchOptions = {
      location: mapCenter,
      radius: 20000, // 20km 반경
      sort: window.kakao.maps.services.SortBy.DISTANCE // 거리순 정렬
    };
    
    places.keywordSearch(keyword, (result: any[], status: string) => {
      isSearchingRef.current = false;
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const place = result[0];
        const newPosition = new window.kakao.maps.LatLng(place.y, place.x);
        
        map.setCenter(newPosition);
        marker.setPosition(newPosition);
        const newCoords = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
        setCoords(newCoords);
        onLocationChange(place.place_name, newCoords);
      }
    }, searchOptions);
  }, [map, marker, onLocationChange]);

  // 외부에서 검색 키워드가 변경될 때 처리
  useEffect(() => {
    if (searchKeyword && searchKeyword.trim() && 
        !searchKeyword.includes("위도:") && 
        !searchKeyword.includes("경도:") && 
        searchKeyword !== "현재 위치") {
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
        const initializeMapWithLocation = (lat: number, lng: number, isCurrentLocation: boolean) => {
          const mapOption = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3
          };

          const mapInstance = new window.kakao.maps.Map(mapRef.current, mapOption);
          setMap(mapInstance);

          // 마커 생성
          const markerPosition = new window.kakao.maps.LatLng(lat, lng);
          const markerInstance = new window.kakao.maps.Marker({
            position: markerPosition,
            draggable: true
          });
          markerInstance.setMap(mapInstance);
          setMarker(markerInstance);
          setCoords({ lat, lng });

          // 지도 클릭 이벤트
          window.kakao.maps.event.addListener(mapInstance, 'click', (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            const clickLat = latlng.getLat();
            const clickLng = latlng.getLng();

            markerInstance.setPosition(latlng);
            setCoords({ lat: clickLat, lng: clickLng });
            searchPlaceByCoords(clickLat, clickLng);
          });

          // 마커 드래그 이벤트
          window.kakao.maps.event.addListener(markerInstance, 'dragend', () => {
            const position = markerInstance.getPosition();
            const dragLat = position.getLat();
            const dragLng = position.getLng();

            setCoords({ lat: dragLat, lng: dragLng });
            searchPlaceByCoords(dragLat, dragLng);
          });

          // 초기 위치 설정
          if (isCurrentLocation) {
            onLocationChange("현재 위치", { lat, lng });
          } else {
            searchPlaceByCoords(lat, lng);
          }
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
              const defaultLng = 126.9780;
              initializeMapWithLocation(defaultLat, defaultLng, false);
            }
          );
        } else {
          const defaultLat = 37.5665;
          const defaultLng = 126.9780;
          initializeMapWithLocation(defaultLat, defaultLng, false);
        }
      } catch (error) {
        console.error('지도 초기화 오류:', error);
        onLocationChange("위치를 불러올 수 없습니다", { lat: 0, lng: 0 });
      }
    };

    initMap();
  }, [searchPlaceByCoords, onLocationChange]);

  // 현재 위치로 돌아가기
  const returnToCurrentLocation = () => {
    if (!map || !marker) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);
        
        map.setCenter(currentPosition);
        marker.setPosition(currentPosition);
        setCoords({ lat: latitude, lng: longitude });
        onLocationChange("현재 위치", { lat: latitude, lng: longitude });
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