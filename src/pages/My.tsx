import { useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Avatar, 
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Badge
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpIcon from "@mui/icons-material/Help";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";

export default function My() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  
  const userStats = {
    submittedTitles: 12,
    receivedFeedbacks: 47,
    averageRating: 4.2,
    helpfulVotes: 23
  };

  const menuItems = [
    { 
      icon: <HistoryIcon />, 
      text: "제출 내역", 
      badge: userStats.submittedTitles,
      onClick: () => navigate('/my/activity')
    },
    { 
      icon: <FavoriteIcon />, 
      text: "즐겨찾기", 
      badge: 8 
    },
    { 
      icon: <TrendingUpIcon />, 
      text: "내 통계" 
    },
    { 
      icon: <SettingsIcon />, 
      text: "설정",
      onClick: () => navigate('/my/settings')
    },
    { 
      icon: <HelpIcon />, 
      text: "도움말 & 지원",
      onClick: () => navigate('/inquiry')
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 bg-white min-h-screen">
      {/* 상단 헤더 */}
      <div className="py-4 text-center">
        <Typography variant="h6" fontWeight={700} color="#333">
          마이페이지
        </Typography>
      </div>

      {/* 프로필 카드 */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          <Avatar
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'white',
              color: '#FFC107'
            }}
          >
            <PersonIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" color="white" fontWeight={700} mb={0.5}>
              IT 개발자
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.9)" mb={1}>
              안녕하세요! 좋은 글 제목으로 소통해요 ✍️
            </Typography>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate('/my/personal-info-edit')}
              sx={{
                bgcolor: 'white',
                color: '#FFC107',
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              프로필 수정
            </Button>
          </Box>
        </Box>

        {/* 통계 */}
        <Box display="flex" justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h6" color="white" fontWeight={700}>
              {userStats.submittedTitles}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">
              제출한 제목
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="white" fontWeight={700}>
              {userStats.receivedFeedbacks}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">
              받은 피드백
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="white" fontWeight={700}>
              {userStats.averageRating}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">
              평균 평점
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="white" fontWeight={700}>
              {userStats.helpfulVotes}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">
              도움됨 투표
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 레벨 정보 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 2.5,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <div className="text-2xl">🏆</div>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600} color="#333">
              타이틀 마스터 Lv.3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              다음 레벨까지 8개의 제목 필요
            </Typography>
          </Box>
        </Box>
        <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, height: 8, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#FFD700', width: '60%', height: '100%', borderRadius: 2 }} />
        </Box>
      </Card>

      {/* 메뉴 리스트 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => (
            <div key={index}>
              <ListItem 
                onClick={item.onClick}
                sx={{ 
                  py: 2, 
                  px: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.04)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#666' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  slotProps={{
                    primary: {
                      fontWeight: 500,
                      color: '#333'
                    }
                  }}
                />
                {item.badge && (
                  <Badge 
                    badgeContent={item.badge} 
                    color="primary" 
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#FFD700',
                        color: '#333'
                      }
                    }}
                  />
                )}
              </ListItem>
              {index < menuItems.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Card>

      {/* 추가 메뉴 - 약관 및 계정관리 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <List sx={{ p: 0 }}>
          <ListItem 
            onClick={() => navigate('/my/terms')}
            sx={{ 
              py: 2, 
              px: 3,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255, 215, 0, 0.04)'
              }
            }}
          >
            <ListItemText 
              primary="약관"
              slotProps={{
                primary: {
                  fontWeight: 500,
                  color: '#333'
                }
              }}
            />
          </ListItem>
          <Divider />
          <ListItem 
            onClick={() => navigate('/my/account-management')}
            sx={{ 
              py: 2, 
              px: 3,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255, 215, 0, 0.04)'
              }
            }}
          >
            <ListItemText 
              primary="계정관리"
              slotProps={{
                primary: {
                  fontWeight: 500,
                  color: '#333'
                }
              }}
            />
          </ListItem>
        </List>
      </Card>

      {/* 알림 설정 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <NotificationsIcon sx={{ color: '#666' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={500} color="#333">
                푸시 알림
              </Typography>
              <Typography variant="body2" color="text.secondary">
                새로운 피드백 알림을 받아요
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#FFD700',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#FFD700',
              },
            }}
          />
        </Box>
      </Card>

      {/* 로그아웃 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <ListItem 
          sx={{ 
            py: 2, 
            px: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: '#f44336' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="로그아웃"
            slotProps={{
              primary: {
                fontWeight: 500,
                color: '#f44336'
              }
            }}
          />
        </ListItem>
      </Card>

      {/* 앱 정보 */}
      <Box textAlign="center" mt={4} mb={2}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          IT People App v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary">
          더 나은 글쓰기를 위한 피드백 플랫폼
        </Typography>
      </Box>
    </div>
  );
}
