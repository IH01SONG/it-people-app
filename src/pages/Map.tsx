import { useState } from "react";
import { Map as KakaoMap, MapMarker, Circle } from "react-kakao-maps-sdk";
import { TextField, Box, Typography, Card, CardContent, Button } from "@mui/material";

interface Post {
  id: number;
  title: string;
  content: string;
  location: {
    lat: number;
    lng: number;
  };
  author: string;
  createdAt: string;
}

export default function Map() {
  const [radius, setRadius] = useState<number>(1000);
  const [center, setCenter] = useState({
    lat: 37.566826,
    lng: 126.9786567,
  });

  const mockPosts: Post[] = [
    {
      id: 1,
      title: "맛집 추천!",
      content: "이 근처 정말 맛있는 음식점 발견했어요",
      location: { lat: 37.566826, lng: 126.9786567 },
      author: "맛집헌터",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "카페 추천",
      content: "분위기 좋은 카페 있어요",
      location: { lat: 37.567326, lng: 126.9796567 },
      author: "카페러버",
      createdAt: "2024-01-14",
    },
  ];

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  const postsInRadius = mockPosts.filter((post) => {
    const distance = calculateDistance(
      center.lat,
      center.lng,
      post.location.lat,
      post.location.lng
    );
    return distance <= radius;
  });

  return (
    <div className="flex flex-col h-screen">
      <Box className="p-4 bg-white shadow-md">
        <Typography variant="h6" className="mb-3">
          반경 설정
        </Typography>
        <div className="flex items-center gap-4">
          <TextField
            label="반경 (미터)"
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            variant="outlined"
            size="small"
            InputProps={{
              inputProps: {
                min: 100,
                max: 5000,
                step: 100,
              },
            }}
            className="w-40"
          />
          <Button
            variant="contained"
            onClick={() => setRadius(1000)}
            size="small"
          >
            기본값 (1km)
          </Button>
        </div>
      </Box>

      <div className="flex-1">
        <KakaoMap
          center={center}
          style={{ width: "100%", height: "100%" }}
          level={5}
          onClick={(_, mouseEvent) => {
            const latlng = mouseEvent.latLng;
            setCenter({
              lat: latlng.getLat(),
              lng: latlng.getLng(),
            });
          }}
        >
          <MapMarker
            position={center}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              size: { width: 24, height: 35 },
            }}
          />
          
          <Circle
            center={center}
            radius={radius}
            strokeWeight={2}
            strokeColor="#FF6B6B"
            strokeOpacity={0.8}
            fillColor="#FF6B6B"
            fillOpacity={0.1}
          />
        </KakaoMap>
      </div>

      <Box className="p-4 bg-gray-50 max-h-60 overflow-y-auto">
        <Typography variant="h6" className="mb-3">
          반경 내 게시물 ({postsInRadius.length}개)
        </Typography>
        {postsInRadius.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            반경 내에 게시물이 없습니다.
          </Typography>
        ) : (
          <div className="space-y-2">
            {postsInRadius.map((post) => (
              <Card key={post.id} variant="outlined" className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <Typography variant="subtitle2" className="font-medium">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mt-1">
                    {post.content}
                  </Typography>
                  <div className="flex justify-between items-center mt-2">
                    <Typography variant="caption" color="text.secondary">
                      작성자: {post.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.createdAt}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
