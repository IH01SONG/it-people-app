import React, { useState } from 'react';
import { Box, Typography, IconButton, Stack, Switch, FormControlLabel } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const LocationPermissionSettings: React.FC = () => {
  const navigate = useNavigate();
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleToggleLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationEnabled(event.target.checked);
    // Implement logic to update actual location permission setting
    alert(`위치 권한이 ${event.target.checked ? '활성화' : '비활성화'}되었습니다.`);
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          위치 권한 설정
        </Typography>
      </Box>
      <Box p={2}>
        <Stack spacing={3} mt={3}>
          <FormControlLabel
            control={<Switch checked={locationEnabled} onChange={handleToggleLocation} />}
            label={<Typography variant="body1">위치 정보 사용</Typography>}
            labelPlacement="start"
            sx={{ justifyContent: 'space-between', margin: 0 }}
          />
          <Typography variant="body2" color="text.secondary">
            위치 정보 사용을 허용하면 주변 사용자 및 장소 기반 서비스를 이용할 수 있습니다. 이 설정은 언제든지 변경할 수 있습니다.
          </Typography>
          {/* Additional location settings can be added here */}
        </Stack>
      </Box>
    </Box>
  );
};

export default LocationPermissionSettings;
