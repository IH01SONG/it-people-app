import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography, TextField, List, ListItem, ListItemText } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (coords: { lat: number; lng: number; address?: string }) => void;
  center?: { lat: number; lng: number };
};

export default function MapPicker({ open, onClose, onSelect, center }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const mapObjRef = useRef<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    if (!window.kakao || !window.kakao.maps) return;
    
    // Kakao Maps Services 라이브러리 로드 확인
    if (!window.kakao.maps.services) {
      console.warn('Kakao Maps Services library is not loaded');
    }

    const kakao = window.kakao;
    const map = new kakao.maps.Map(mapRef.current!, {
      center: new kakao.maps.LatLng(
        center?.lat || 37.5665,
        center?.lng || 126.978
      ),
      level: 4,
    });
    mapObjRef.current = map;
    const marker = new kakao.maps.Marker({ position: map.getCenter() });
    marker.setMap(map);
    markerRef.current = marker;

    kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);
      setSelectedPlace(null); // 직접 클릭시 선택된 장소 초기화
      
      if (kakao.maps.services) {
        // 클릭한 좌표 주변에서 키워드 검색으로 상호 찾기
        const ps = new kakao.maps.services.Places();
        
        // 여러 카테고리의 장소를 순차적으로 검색
        const categories = ['MT1', 'CS2', 'PS3', 'SC4', 'AC5', 'PK6', 'OL7', 'SW8', 'BK9', 'CT1', 'AG2', 'PO3', 'AT4', 'AD5', 'FD6', 'CE7', 'HP8', 'PM9'];
        let foundPlace = false;
        let searchIndex = 0;
        
        const searchNextCategory = () => {
          if (searchIndex >= categories.length || foundPlace) {
            if (!foundPlace) {
              fallbackToAddress(latlng);
            }
            return;
          }
          
          ps.categorySearch(categories[searchIndex], (places: any, status: any) => {
            if (status === kakao.maps.services.Status.OK && places.length > 0 && !foundPlace) {
              // 가장 가까운 상호 찾기
              let nearestPlace = null;
              let minDistance = Infinity;
              
              places.forEach((place: any) => {
                const distance = Math.sqrt(
                  Math.pow(parseFloat(place.x) - latlng.getLng(), 2) + 
                  Math.pow(parseFloat(place.y) - latlng.getLat(), 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nearestPlace = place;
                }
              });
              
              // 상호가 충분히 가까우면 (약 30m 이내) 상호명 사용
              if (nearestPlace && minDistance < 0.0003) {
                foundPlace = true;
                setSelectedPlace({
                  place_name: nearestPlace.place_name,
                  x: latlng.getLng(),
                  y: latlng.getLat()
                });
                return;
              }
            }
            
            searchIndex++;
            searchNextCategory();
          }, {
            location: latlng,
            radius: 50, // 50m 반경 내에서 검색
            sort: kakao.maps.services.SortBy.DISTANCE
          });
        };
        
        searchNextCategory();
      } else {
        // services가 로드되지 않은 경우 기본 좌표 표시
        setSelectedPlace({ 
          place_name: `위도: ${latlng.getLat().toFixed(4)}, 경도: ${latlng.getLng().toFixed(4)}`, 
          x: latlng.getLng(), 
          y: latlng.getLat() 
        });
      }
    });
    
    // 주소로 대체하는 함수
    const fallbackToAddress = (latlng: any) => {
      if (kakao.maps.services.Geocoder) {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0]?.road_address?.address_name || result[0]?.address?.address_name;
            setSelectedPlace({ place_name: address, x: latlng.getLng(), y: latlng.getLat() });
          } else {
            setSelectedPlace({ 
              place_name: `위도: ${latlng.getLat().toFixed(4)}, 경도: ${latlng.getLng().toFixed(4)}`, 
              x: latlng.getLng(), 
              y: latlng.getLat() 
            });
          }
        });
      }
    };
  }, [open, center]);

  if (!open) return null;

  const handleSearch = () => {
    if (!searchKeyword.trim() || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;
    
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data.slice(0, 5)); // 상위 5개 결과만 표시
      }
    });
  };

  const handlePlaceSelect = (place: any) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const newPosition = new window.kakao.maps.LatLng(lat, lng);
    
    if (mapObjRef.current && markerRef.current) {
      mapObjRef.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);
      // 검색에서 선택한 경우 상호명 우선 표시
      setSelectedPlace({
        place_name: place.place_name,
        address_name: place.address_name,
        x: lng,
        y: lat
      });
      setSearchResults([]);
      setSearchKeyword("");
    }
  };

  const handleConfirm = () => {
    const pos = markerRef.current?.getPosition();
    if (!pos) return onClose();
    
    const placeName = selectedPlace?.place_name || selectedPlace?.address_name;
    onSelect({ 
      lat: pos.getLat(), 
      lng: pos.getLng(),
      address: placeName
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.5)",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "white",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          p: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={1}>
          만날 위치 선택
        </Typography>
        
        {/* 검색 필드 */}
        <Box display="flex" gap={1} mb={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="장소명을 검색해주세요 (예: 홍대입구역, 스타벅스 홍대점)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            onClick={handleSearch}
            variant="contained"
            sx={{ bgcolor: "#E762A9", "&:hover": { bgcolor: "#D554A0" }, minWidth: 60 }}
          >
            <SearchIcon />
          </Button>
        </Box>
        
        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <Box mb={2}>
            <List sx={{ bgcolor: "#f8f9fa", borderRadius: 2, maxHeight: 120, overflow: "auto" }}>
              {searchResults.map((place, index) => (
                <ListItem
                  key={index}
                  onClick={() => handlePlaceSelect(place)}
                  sx={{ py: 0.5, "&:hover": { bgcolor: "rgba(231, 98, 169, 0.1)", cursor: "pointer" } }}
                >
                  <ListItemText
                    primary={place.place_name}
                    secondary={place.address_name}
                    primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: "0.8rem" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* 선택된 장소 표시 */}
        {selectedPlace && (
          <Box mb={2} p={1.5} bgcolor="rgba(231, 98, 169, 0.1)" borderRadius={2}>
            <Typography variant="body2" fontWeight={600} color="#E762A9">
              선택된 장소: {selectedPlace.place_name || selectedPlace.address_name}
            </Typography>
          </Box>
        )}
        <Box
          ref={mapRef}
          sx={{
            width: "100%",
            height: 360,
            borderRadius: 2,
            overflow: "hidden",
            mb: 2,
          }}
        />
        <Box display="flex" gap={1}>
          <Button 
            onClick={onClose} 
            fullWidth 
            variant="outlined"
            sx={{ borderColor: "#E762A9", color: "#E762A9" }}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            fullWidth
            variant="contained"
            sx={{ bgcolor: "#E762A9", "&:hover": { bgcolor: "#D554A0" } }}
          >
            확인
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

declare global {
  interface Window {
    kakao: any;
  }
}
