import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";

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

interface FormData {
  title: string;
  content: string;
  venue: string;
  location: string;
  category: string;
  maxParticipants: number;
  meetingDate: string;
  tags: string[];
  image?: string;
}

export default function Step2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userLocation] = useState<string>("홍대입구");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    venue: "",
    location: "",
    category: "",
    maxParticipants: 4,
    meetingDate: "",
    tags: [],
    image: undefined,
  });

  const [images, setImages] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null); // 초기 현재위치 저장
  const [locationInput, setLocationInput] = useState("");
  const [map, setMap] = useState<unknown>(null);
  const [marker, setMarker] = useState<unknown>(null);
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false); // 프로그래밍적 업데이트 플래그
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<unknown>(null); // 마커 참조를 위한 ref 추가

  // 향후 위치 선택 기능 확장 시 사용
  const participantQuickOptions = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];


  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
      setFormData((prev) => ({
        ...prev,
        category: location.state.category,
      }));

    }
  }, [location.state, images.length]);

  // 지도 초기화
  const initializeMap = useCallback(() => {
    console.log('initializeMap 호출됨');
    if (!mapRef.current) {
      console.error('지도 컨테이너 요소가 없습니다');
      return;
    }
    if (map) {
      console.log('지도가 이미 초기화되어 있습니다');
      return;
    }
    
    // 먼저 현재 위치를 가져온 후 지도 초기화
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setInitialCoords({ lat: latitude, lng: longitude }); // 초기 위치 저장
          createMapWithLocation(latitude, longitude);
        },
        () => {
          // 위치를 가져올 수 없으면 홍대입구역 좌표 사용
          const defaultLat = 37.5563;
          const defaultLng = 126.9236;
          setCoords({ lat: defaultLat, lng: defaultLng });
          setInitialCoords({ lat: defaultLat, lng: defaultLng }); // 기본 위치도 초기 위치로 저장
          createMapWithLocation(defaultLat, defaultLng);
        }
      );
    } else {
      // Geolocation을 지원하지 않는 경우 기본 위치
      const defaultLat = 37.5563;
      const defaultLng = 126.9236;
      setCoords({ lat: defaultLat, lng: defaultLng });
      setInitialCoords({ lat: defaultLat, lng: defaultLng }); // 기본 위치도 초기 위치로 저장
      createMapWithLocation(defaultLat, defaultLng);
    }
  }, [map]);

  // 향상된 위치 검색 함수
  const searchAndDisplayAddress = useCallback((address: string) => {
    if (!address.trim() || !window.kakao?.maps?.services || !map) return;

    const searchQueries = preprocessSearchQuery(address);
    let searchIndex = 0;
    let found = false;

    const tryNextSearch = () => {
      if (found || searchIndex >= searchQueries.length) {
        return;
      }

      const currentQuery = searchQueries[searchIndex];
      
      // 1단계: 정확한 주소 검색
      tryAddressSearch(currentQuery, () => {
        // 2단계: 키워드 검색
        tryKeywordSearch(currentQuery, () => {
          // 3단계: 다음 검색어로 이동
          searchIndex++;
          tryNextSearch();
        });
      });
    };

    // 주소 검색 함수
    const tryAddressSearch = (query: string, onFail: () => void) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(query, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          found = true;
          const newCoords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          moveMapToLocation(newCoords);
          
          // 검색된 주소로 입력 필드 업데이트
          setIsProgrammaticUpdate(true);
          setLocationInput(query);
          setFormData(prev => ({ ...prev, location: query }));
        } else {
          onFail();
        }
      });
    };

    // 장소의 중요도 점수 계산 함수
    const calculatePlaceScore = (place: any, query: string, distance: number): number => {
      let score = 0;
      const placeName = place.place_name.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // 1. 정확한 이름 매칭 (높은 점수)
      if (placeName === queryLower) {
        score += 1000;
      } else if (placeName.includes(queryLower)) {
        score += 500;
      }
      
      // 2. 주요 랜드마크 우선순위 (역, 대학교, 공공기관 등)
      const landmarkTypes = ['역', '대학교', '대학', '시청', '구청', '공원', '병원', '터미널', '공항', '항구'];
      if (landmarkTypes.some(type => placeName.includes(type))) {
        score += 800;
      }
      
      // 3. 카테고리별 가중치
      if (place.category_group_code) {
        const categoryWeights: { [key: string]: number } = {
          'SW8': 900, // 지하철역
          'PK6': 700, // 주차장
          'OL7': 600, // 주유소
          'SC4': 500, // 학교
          'AC5': 400, // 학원
          'PS3': 300, // 약국
          'MT1': 100, // 대형마트
          'CS2': 50,  // 편의점
          'FD6': 30,  // 음식점
          'CE7': 20,  // 카페
        };
        
        score += categoryWeights[place.category_group_code] || 0;
      }
      
      // 4. 거리 패널티 (멀수록 점수 감소, 하지만 랜드마크는 덜 감소)
      const isLandmark = landmarkTypes.some(type => placeName.includes(type)) || place.category_group_code === 'SW8';
      const distancePenalty = isLandmark ? distance / 1000 : distance / 500; // 랜드마크는 거리 패널티 절반
      score -= distancePenalty;
      
      return score;
    };

    // 키워드 검색 함수
    const tryKeywordSearch = (query: string, onFail: () => void) => {
      const places = new window.kakao.maps.services.Places();
      
      // 기본 검색 옵션
      const searchOptions: any = {
        size: 15,
        sort: window.kakao.maps.services.SortBy.ACCURACY
      };

      // 현재 마커 위치가 있으면 해당 위치 중심으로 검색 (합리적인 반경으로 제한)
      if (coords) {
        searchOptions.location = new window.kakao.maps.LatLng(coords.lat, coords.lng);
        searchOptions.radius = 20000; // 20km 반경으로 축소
      }

      places.keywordSearch(query, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          found = true;
          
          let selectedPlace = result[0];
          
          // 현재 마커 위치가 있으면 점수 기반으로 최적 장소 선택
          if (coords && result.length > 1) {
            const currentPos = new window.kakao.maps.LatLng(coords.lat, coords.lng);
            let bestScore = -Infinity;
            
            result.forEach((place: any) => {
              const placePos = new window.kakao.maps.LatLng(place.y, place.x);
              const distance = getDistance(currentPos, placePos);
              const score = calculatePlaceScore(place, query, distance);
              
              if (score > bestScore) {
                bestScore = score;
                selectedPlace = place;
              }
            });
          }
          
          // 검색 결과로 지도 이동 및 마커 업데이트
          const newCoords = new window.kakao.maps.LatLng(selectedPlace.y, selectedPlace.x);
          
          // 지도를 검색된 위치로 이동하고 마커 업데이트
          moveMapToLocation(newCoords);
          
          // 검색된 장소명을 입력 필드에 업데이트
          setIsProgrammaticUpdate(true);
          setLocationInput(selectedPlace.place_name);
          setFormData(prev => ({ ...prev, location: selectedPlace.place_name }));
        } else {
          // 위치 제한 없이 전역 검색 재시도
          places.keywordSearch(query, (globalResult: any[], globalStatus: any) => {
            if (globalStatus === window.kakao.maps.services.Status.OK && globalResult.length > 0) {
              found = true;
              
              let selectedPlace = globalResult[0];
              
              // 전역 검색에서도 점수 기반 선택 적용
              if (coords && globalResult.length > 1) {
                const currentPos = new window.kakao.maps.LatLng(coords.lat, coords.lng);
                let bestScore = -Infinity;
                
                globalResult.forEach((place: any) => {
                  const placePos = new window.kakao.maps.LatLng(place.y, place.x);
                  const distance = getDistance(currentPos, placePos);
                  const score = calculatePlaceScore(place, query, distance);
                  
                  if (score > bestScore) {
                    bestScore = score;
                    selectedPlace = place;
                  }
                });
              }
              
              // 전역 검색 결과로 지도 이동 및 마커 업데이트
              const globalNewCoords = new window.kakao.maps.LatLng(selectedPlace.y, selectedPlace.x);
              
              // 지도를 검색된 위치로 이동하고 마커 업데이트
              moveMapToLocation(globalNewCoords);
              
              setIsProgrammaticUpdate(true);
              setLocationInput(selectedPlace.place_name);
              setFormData(prev => ({ ...prev, location: selectedPlace.place_name }));
            } else {
              onFail();
            }
          }, { size: 15, sort: window.kakao.maps.services.SortBy.ACCURACY }); // 위치 제한 없는 전역 검색
        }
      }, searchOptions);
    };

    // 지도 이동 및 마커 업데이트 (검색 시에만 사용)
    const moveMapToLocation = (coords: any) => {
      map.setCenter(coords);
      updateMarker(coords, map);
      setCoords({ lat: coords.getLat(), lng: coords.getLng() });
    };

    // 검색 시작
    tryNextSearch();
  }, [map, coords]);

  // 카카오 맵 API가 준비될 때까지 대기하는 함수
  const waitForKakaoMaps = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('카카오 맵 API 대기 시작');
      
      const checkKakao = (retryCount = 0) => {
        // window.kakao.maps가 완전히 로드되고 필요한 생성자들이 모두 있는지 확인
        if (window.kakao && 
            window.kakao.maps && 
            window.kakao.maps.LatLng && 
            window.kakao.maps.Map && 
            window.kakao.maps.Marker &&
            window.kakao.maps.services &&
            window.kakao.maps.services.Places &&
            window.kakao.maps.services.Geocoder) {
          
          console.log('카카오 맵 API 모든 객체 확인 완료');
          resolve();
        } else if (retryCount < 100) { // 최대 10초 대기
          console.log(`카카오 맵 API 객체 대기 중... (${retryCount + 1}/100)`);
          setTimeout(() => checkKakao(retryCount + 1), 100);
        } else {
          console.error('카카오 맵 API 초기화 시간 초과');
          reject(new Error('카카오 맵 API 객체 초기화 시간 초과'));
        }
      };
      
      // 즉시 확인 시작
      checkKakao();
    });
  }, []);

  // 지도 초기화 (컴포넌트 마운트 시)
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isMounted = true;
    let isInitializing = false; // 초기화 진행 중인지 추적하는 플래그

    const initMap = async () => {
      // 이미 지도가 있거나 초기화 중이면 중단
      if (map || isInitializing) {
        console.log('지도가 이미 존재하거나 초기화 중입니다.');
        return;
      }

      isInitializing = true;
      
      try {
        console.log('지도 초기화 시작');
        await waitForKakaoMaps();
        
        if (!isMounted || map) {
          isInitializing = false;
          return; // 컴포넌트가 언마운트되었거나 다른 곳에서 지도가 생성되면 중단
        }
        
        console.log('카카오 맵 API 준비 완료, 지도 생성 시작');
        
        // API가 완전히 준비된 후 지도 초기화
        initializeMap();
        
        cleanup = () => {
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
        };
      } catch (error) {
        console.error('카카오 맵 초기화 실패:', error);
      } finally {
        isInitializing = false;
      }
    };

    initMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;
      isInitializing = false;
      if (cleanup) cleanup();
    };
  }, []); // 의존성 배열을 빈 배열로 변경하여 한 번만 실행

  // 위치 입력값이 변경될 때 지도에 반영
  useEffect(() => {
    // 프로그래밍적 업데이트인 경우 검색하지 않음
    if (isProgrammaticUpdate) {
      setIsProgrammaticUpdate(false);
      return;
    }

    if (map && locationInput.trim() && locationInput !== "현재 위치") {
      const timer = setTimeout(() => {
        // 사용자가 직접 입력한 경우에만 검색 실행
        if (locationInput.trim().length > 1) {
          searchAndDisplayAddress(locationInput);
        }
      }, 1200); // 1.2초로 디바운싱 시간 증가

      return () => clearTimeout(timer);
    }
  }, [locationInput, map, searchAndDisplayAddress, isProgrammaticUpdate]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 위치 정보는 필수
    if (!coords) {
      alert("위치 정보를 설정해주세요. 지도를 클릭하거나 위치를 입력해주세요.");
      return;
    }

    try {
      // 이미지가 없으면 카테고리에 맞는 기본 이미지를 자동으로 추가
      const finalImages = images;

      // 위치 정보 설정 (필수)
      const displayLocation = locationInput || formData.location || userLocation;
      const locationData = {
        type: "Point" as const,
        coordinates: [coords.lng, coords.lat], // [경도, 위도] 순서
        address: displayLocation || "위치 정보", // 백엔드에서 address 필드 지원
      };

      // 백엔드 API 스키마에 맞춘 게시글 데이터
      const postPayload = {
        title: formData.title,
        content: formData.content,
        location: locationData, // 필수 필드 (address 포함)
        tags: formData.tags,
        maxParticipants: formData.maxParticipants,
        // 선택적 필드들 (카테고리는 백엔드 이슈로 임시 제외)
        // ...(formData.category && { category: formData.category }),
        ...(formData.venue && { venue: formData.venue }),
        ...(formData.meetingDate && { meetingDate: formData.meetingDate }),
        ...(finalImages.length > 0 && { images: finalImages }),
      };


      // 백엔드 API 호출
      await api.posts.create(postPayload);
      
      alert('게시글이 성공적으로 작성되었습니다!');
      navigate("/");
    } catch (error: unknown) {
      console.error("게시글 생성 실패:", error);
      
      let errorMessage = "게시글 생성에 실패했습니다.";
      if (error && typeof error === 'object' && 'status' in error) {
        if ((error as any).status === 401) {
          errorMessage = "로그인이 필요합니다.";
        } else if ((error as any).status === 400) {
          errorMessage = "입력 정보를 확인해주세요.";
        }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      alert(errorMessage + " 다시 시도해주세요.");
    }
  };

  const handleImageUpload = () => {
    if (images.length >= 3) return;
    fileInputRef.current?.click();
  };

  const handleFilesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 3 - images.length;
    const selected = files.slice(0, remainingSlots);

    const newUrls: string[] = selected.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newUrls]);

    // 입력 값 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // 마커 관리 함수 - 기존 마커 제거 후 새 마커 생성
  const updateMarker = (position: unknown, mapInstance: unknown) => {
    
    // 기존 마커들 완전 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // 잠시 대기 후 새 마커 생성 (기존 마커가 완전히 제거되도록)
    setTimeout(() => {
      const newMarker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstance,
      });
      
      // 참조 저장
      markerRef.current = newMarker;
      setMarker(newMarker);
      
    }, 50);
  };

  const createMapWithLocation = (lat: number, lng: number) => {
    console.log('createMapWithLocation 호출됨:', lat, lng);
    
    try {
      if (!mapRef.current) {
        console.error('지도 컨테이너가 없습니다');
        return;
      }
      if (map) {
        console.log('지도가 이미 생성되어 있습니다 - 생성 중단');
        return;
      }
      
      console.log('지도 생성 시도:', lat, lng);
      
      const options = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3,
      };

      console.log('카카오 맵 인스턴스 생성 중...');
      const mapInstance = new window.kakao.maps.Map(mapRef.current, options);
      console.log('카카오 맵 인스턴스 생성 완료');
      
      // 지도 상태 즉시 업데이트
      setMap(mapInstance);

      // 초기 마커 생성
      const initialPosition = new window.kakao.maps.LatLng(lat, lng);
      updateMarker(initialPosition, mapInstance);

      // 지도 클릭 이벤트 등록
      window.kakao.maps.event.addListener(mapInstance, "click", (mouseEvent: any) => {
        handleMapClick(mouseEvent, mapInstance);
      });

    } catch (error) {
      console.error('지도 생성 실패:', error);
    }
  };

  // 지도 클릭 이벤트 핸들러
  const handleMapClick = (mouseEvent: any, mapInstance: unknown) => {
    const latlng = mouseEvent.latLng;
    const lat = latlng.getLat();
    const lng = latlng.getLng();

    setCoords({ lat, lng });

    // 마커 위치를 클릭한 위치로 고정
    updateMarker(latlng, mapInstance);

    // 주변 장소 이름만 검색하여 텍스트 업데이트 (마커 위치는 변경하지 않음)
    searchNearbyPlacesForText(lat, lng);
  };

  // 주변 상호/장소 검색 함수 (마커 위치는 변경하지 않고 텍스트만 업데이트)
  const searchNearbyPlacesForText = (lat: number, lng: number) => {
    if (!window.kakao.maps.services) {
      fallbackToAddress(lat, lng);
      return;
    }

    const places = new window.kakao.maps.services.Places();
    const position = new window.kakao.maps.LatLng(lat, lng);
    
    // 먼저 주변 음식점/카페 검색 시도
    const searchCategories = ['FD6', 'CE7', 'CS2']; // 음식점, 카페, 편의점
    let searchIndex = 0;
    
    const searchByCategory = () => {
      if (searchIndex >= searchCategories.length) {
        // 모든 카테고리 검색 실패 시 키워드 검색 시도
        searchByKeyword();
        return;
      }
      
      places.categorySearch(searchCategories[searchIndex], (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          // 가장 가까운 장소 찾기
          let closestPlace = null;
          let minDistance = Infinity;
          
          result.forEach((place: any) => {
            const placePosition = new window.kakao.maps.LatLng(place.y, place.x);
            const distance = getDistance(position, placePosition);
            
            if (distance < minDistance && distance < 100) { // 100m 이내의 가장 가까운 장소
              minDistance = distance;
              closestPlace = place;
            }
          });
          
          if (closestPlace) {
            const placeName = closestPlace.place_name;
            // 마커 위치는 변경하지 않고 텍스트만 업데이트
            setIsProgrammaticUpdate(true);
            setLocationInput(placeName);
            setFormData(prev => ({ ...prev, location: placeName }));
            return;
          }
        }
        
        // 다음 카테고리 검색
        searchIndex++;
        searchByCategory();
      }, {
        location: position,
        radius: 200,
        sort: window.kakao.maps.services.SortBy.DISTANCE
      });
    };

    const searchByKeyword = () => {
      // 다양한 키워드로 검색 시도
      const keywords = ['상점', '건물', '매장', '시설'];
      let keywordIndex = 0;
      
      const tryKeywordSearch = () => {
        if (keywordIndex >= keywords.length) {
          // 모든 키워드 검색 실패 시 주소로 폴백
          fallbackToAddress(lat, lng);
          return;
        }
        
        places.keywordSearch(keywords[keywordIndex], (result: any[], status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            // 가장 가까운 장소 찾기
            let closestPlace = null;
            let minDistance = Infinity;
            
            result.forEach((place: any) => {
              const placePosition = new window.kakao.maps.LatLng(place.y, place.x);
              const distance = getDistance(position, placePosition);
              
              if (distance < minDistance && distance < 50) { // 50m 이내
                minDistance = distance;
                closestPlace = place;
              }
            });
            
            if (closestPlace) {
              const placeName = closestPlace.place_name;
              // 마커 위치는 변경하지 않고 텍스트만 업데이트
              setIsProgrammaticUpdate(true);
              setLocationInput(placeName);
              setFormData(prev => ({ ...prev, location: placeName }));
              return;
            }
          }
          
          // 다음 키워드로 시도
          keywordIndex++;
          tryKeywordSearch();
        }, {
          location: position,
          radius: 100,
          sort: window.kakao.maps.services.SortBy.DISTANCE
        });
      };
      
      tryKeywordSearch();
    };

    // 검색 시작
    searchByCategory();
  };

  // 두 좌표 간의 거리 계산 (미터)
  const getDistance = (pos1: any, pos2: any) => {
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
  };

  // 주소로 폴백하는 함수
  const fallbackToAddress = (lat: number, lng: number) => {
    if (window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const address = result[0].address.address_name;
          setIsProgrammaticUpdate(true);
          setLocationInput(address);
          setFormData(prev => ({ ...prev, location: address }));
        }
      });
    }
  };

  // 검색어 전처리 함수
  const preprocessSearchQuery = (query: string): string[] => {
    const cleaned = query.trim().replace(/\s+/g, ' ');
    
    // 다양한 검색 패턴 생성
    const variants = [cleaned];
    
    // 띄어쓰기 제거 버전
    variants.push(cleaned.replace(/\s/g, ''));
    
    // "근처", "앞", "뒤" 등 제거
    const withoutModifiers = cleaned.replace(/(근처|앞|뒤|옆|주변|부근)/g, '').trim();
    if (withoutModifiers && withoutModifiers !== cleaned) {
      variants.push(withoutModifiers);
    }
    
    // "역", "점", "지점" 등 추가/제거 버전
    if (!cleaned.includes('역') && !cleaned.includes('점')) {
      variants.push(cleaned + '역');
      variants.push(cleaned + '점');
    }
    
    return [...new Set(variants)].filter(v => v.length > 0);
  };


  // 현재 위치로 돌아가기 함수
  const returnToCurrentLocation = () => {
    if (!initialCoords || !map) {
      return;
    }

    const currentLocationCoords = new window.kakao.maps.LatLng(initialCoords.lat, initialCoords.lng);
    
    // 지도 중심을 현재 위치로 이동
    map.setCenter(currentLocationCoords);
    
    // 마커도 현재 위치로 이동
    updateMarker(currentLocationCoords, map);
    
    // 좌표 상태 업데이트
    setCoords({ lat: initialCoords.lat, lng: initialCoords.lng });
    
    // 위치 입력 필드를 "현재 위치"로 고정 설정 (검색하지 않음)
    setIsProgrammaticUpdate(true);
    setLocationInput("현재 위치");
    setFormData(prev => ({ ...prev, location: "현재 위치" }));
  };

  // 표시할 위치 텍스트 계산 함수
  const getDisplayLocation = () => {
    if (locationInput && locationInput.trim()) {
      return locationInput;
    }
    if (formData.location && formData.location.trim()) {
      return formData.location;
    }
    if (coords) {
      // 현재 위치와 동일한 좌표인지 확인
      if (initialCoords && 
          Math.abs(coords.lat - initialCoords.lat) < 0.001 && 
          Math.abs(coords.lng - initialCoords.lng) < 0.001) {
        return "현재 위치";
      }
      return "선택된 위치";
    }
    return "위치를 선택해주세요";
  };


  const isFormValid =
    formData.title.trim().length > 0 && formData.content.trim().length > 0;

  return (
    <Box
      sx={{
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        "@media (min-width:600px)": {
          maxWidth: "600px",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#E762A9",
          color: "white",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(231, 98, 169, 0.3)",
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            mr: 4,
            fontWeight: 700,
          }}
        >
          모임 상세 정보
        </Typography>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          px: 3,
          py: 3,
          maxWidth: "600px !important",
          "@media (min-width: 600px)": {
            maxWidth: "600px !important",
          },
        }}
      >
        {/* 항상 모바일 폭처럼 보이도록 */}

        {/* 프로그레스 */}
        <Box mb={4}>
          <Stepper activeStep={1} sx={{ mb: 2 }}>
            <Step>
              <StepLabel>카테고리 선택</StepLabel>
            </Step>
            <Step>
              <StepLabel>상세 정보</StepLabel>
            </Step>
            <Step>
              <StepLabel>완료</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* 선택된 카테고리 표시 */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            p: 2,
            mb: 3,
            background: "linear-gradient(135deg, #E762A9 0%, #D554A0 100%)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="body2" color="white" fontWeight={600} mb={1}>
            선택한 카테고리
          </Typography>
          <Typography variant="h6" color="white" fontWeight={700}>
            {selectedCategory}
          </Typography>
        </Card>

        {/* 제목 입력 */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="제목을 입력해 주세요(5-20글자)"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;
              if (title.length <= 20) {
                setFormData({ ...formData, title });
              }
            }}
            variant="outlined"
            helperText={`${formData.title.length}/20자`}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "#E762A9",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
        </Box>

        {/* 이미지 업로드 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#333">
            사진 첨부
          </Typography>
          <Box display="flex" gap={2}>
            {images.map((img, idx) => (
              <Box key={idx} sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={img}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                  }}
                />
                <IconButton
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "white",
                    color: "#666",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  ×
                </IconButton>
              </Box>
            ))}
            {images.length < 3 && (
              <Box
                onClick={handleImageUpload}
                sx={{
                  width: 80,
                  height: 80,
                  border: "2px dashed #E762A9",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: "rgba(231, 98, 169, 0.02)",
                  "&:hover": {
                    bgcolor: "rgba(231, 98, 169, 0.05)",
                    borderColor: "#D554A0",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <PhotoCameraIcon
                  sx={{ fontSize: 24, color: "#E762A9", mb: 0.5 }}
                />
                <Typography
                  variant="caption"
                  color="#E762A9"
                  textAlign="center"
                >
                  {images.length}/3
                  <br />
                  (선택)
                </Typography>
              </Box>
            )}
            {/* 모바일/데스크탑 파일 선택 인풋 (숨김) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />
          </Box>
        </Box>

        {/* 소개글 입력 */}
        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="소개글을 입력해 주세요 (최대 100글자)"
            value={formData.content}
            onChange={(e) => {
              const content = e.target.value;
              if (content.length <= 100) {
                setFormData({ ...formData, content });
              }
            }}
            helperText={`${formData.content.length}/100자`}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#E762A9",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
        </Box>

        {/* 만날 위치 및 시간 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            만날 위치 및 시간
          </Typography>

          {/* 날짜/시간 표시 */}
          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              mb: 2,
              bgcolor: "#f8f9fa",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOnIcon sx={{ fontSize: 16, color: "#E762A9" }} />
              <Typography 
                variant="body2" 
                fontWeight={600}
                sx={{
                  color: getDisplayLocation() === "위치를 선택해주세요" ? "#999" : "#333"
                }}
              >
                {getDisplayLocation()}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ●{" "}
              <span style={{ 
                color: formData.meetingDate ? "inherit" : "#999",
                fontStyle: formData.meetingDate ? "normal" : "italic"
              }}>
                {formData.meetingDate
                  ? new Date(formData.meetingDate).toLocaleDateString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      weekday: "short",
                    })
                  : "날짜를 선택해주세요"}
              </span>
              <br />●{" "}
              <span style={{ 
                color: formData.meetingDate ? "inherit" : "#999",
                fontStyle: formData.meetingDate ? "normal" : "italic"
              }}>
                {formData.meetingDate
                  ? new Date(formData.meetingDate).toLocaleTimeString("ko-KR", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "시간을 선택해주세요"}
              </span>
            </Typography>
          </Box>

          {/* 위치 입력 필드 */}
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="위치를 입력해주세요"
              value={locationInput}
              onChange={(e) => {
                const newLocation = e.target.value;
                setLocationInput(newLocation);
                setFormData({
                  ...formData,
                  location: newLocation || userLocation,
                });
                
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#E762A9",
                  },
                  "&.Mui-focused": {
                    borderColor: "#E762A9",
                    boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                  },
                },
              }}
            />
          </Box>

          {/* 지도 영역 */}
          <Box
            mb={3}
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
                zIndex: 1000, // 카카오 지도 컨트롤보다 높은 z-index 설정
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
                // 추가 스타일로 확실히 위에 표시되도록 설정
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: -1,
                },
              }}
              disabled={!initialCoords || !map}
            >
              <MyLocationIcon sx={{ fontSize: 20, position: "relative", zIndex: 1 }} />
            </IconButton>
            
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(231, 98, 169, 0.05)",
                borderTop: "1px solid rgba(231, 98, 169, 0.2)",
              }}
            >
              <Typography variant="caption" color="#E762A9">
                💡 위치를 입력하거나 지도를 클릭하여 위치를 선택해주세요
              </Typography>
            </Box>
          </Box>

          {/* 날짜/시간 설정 */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              type="date"
              value={
                formData.meetingDate ? formData.meetingDate.split("T")[0] : ""
              }
              onChange={(e) => {
                const date = e.target.value;
                const time = formData.meetingDate
                  ? formData.meetingDate.split("T")[1]
                  : "18:00";
                setFormData({
                  ...formData,
                  meetingDate: date ? `${date}T${time}` : "",
                });
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              type="time"
              value={
                formData.meetingDate
                  ? formData.meetingDate.split("T")[1]
                  : "18:00"
              }
              onChange={(e) => {
                const date = formData.meetingDate
                  ? formData.meetingDate.split("T")[0]
                  : new Date().toISOString().split("T")[0];
                setFormData({
                  ...formData,
                  meetingDate: `${date}T${e.target.value}`,
                });
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* 최대 모집 인원 - 직관적 컨트롤 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              최대 모집 인원
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton
                aria-label="decrease"
                onClick={() =>
                  setFormData({
                    ...formData,
                    maxParticipants: Math.max(2, formData.maxParticipants - 1),
                  })
                }
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                value={formData.maxParticipants}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^0-9]/g, "")) || 2;
                  setFormData({
                    ...formData,
                    maxParticipants: Math.min(30, Math.max(2, v)),
                  });
                }}
                slotProps={{
                  input: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "center", width: 64 },
                  }
                }}
                size="small"
              />
              <IconButton
                aria-label="increase"
                onClick={() =>
                  setFormData({
                    ...formData,
                    maxParticipants: Math.min(30, formData.maxParticipants + 1),
                  })
                }
                size="small"
              >
                <AddIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                명
              </Typography>
            </Box>

            {/* 빠른 선택 옵션 */}
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {participantQuickOptions.map((num) => (
                <Chip
                  key={num}
                  label={`${num}`}
                  size="small"
                  onClick={() =>
                    setFormData({ ...formData, maxParticipants: num })
                  }
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      formData.maxParticipants === num ? "#E762A9" : "white",
                    color: formData.maxParticipants === num ? "white" : "#666",
                    border: `1px solid ${
                      formData.maxParticipants === num ? "#E762A9" : "#e0e0e0"
                    }`,
                    "&:hover": {
                      bgcolor:
                        formData.maxParticipants === num
                          ? "#D554A0"
                          : "#f5f5f5",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* 해시태그 입력 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            해시태그 입력
          </Typography>

          {/* 해시태그 입력 필드 */}
          <TextField
            fullWidth
            placeholder="#태그입력"
            value={newTag}
            onChange={(e) => {
              // # 기호 자동 제거
              const value = e.target.value.replace(/^#+/, "");
              setNewTag(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (newTag.trim()) {
                  handleAddTag();
                }
              }
            }}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#E762A9",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />

          {/* 입력된 해시태그 표시 */}
          {formData.tags.length > 0 && (
            <Box mt={2}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={`#${tag}`}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    sx={{
                      bgcolor: "#E762A9",
                      color: "white",
                      fontWeight: 600,
                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255,255,255,0.8)",
                        "&:hover": {
                          color: "white",
                        },
                      },
                      "&:hover": {
                        bgcolor: "#D554A0",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* 완료 버튼 */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!isFormValid}
          sx={{
            bgcolor: "#E762A9",
            "&:hover": {
              bgcolor: "#D554A0",
            },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
            },
            borderRadius: 2,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 700,
            mb: 2,
          }}
        >
          완료
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          모임을 만들면 다른 사용자들이 참여 신청을 할 수 있어요
        </Typography>
      </Container>
    </Box>
  );
}