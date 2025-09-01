import React, { useState } from 'react';
import { Box, Button, Typography, Modal, Stack } from '@mui/material';

interface AreaSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectArea: (autonomousDistrict: string | null, generalDistrict: string | null) => void;
}

const autonomousDistricts = [
  '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구',
  '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구',
  '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구',
];

const generalDistricts = [
  '가평군', '고양시 덕양구', '고양시 일산동구', '고양시 일산서구', '과천시', '광명시',
  '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시 분당구',
  '성남시 수정구', '성남시 중원구', '수원시 권선구', '수원시 영통구', '수원시 장안구',
  '수원시 팔달구', '시흥시', '안산시 단원구', '안산시 상록구', '안성시', '안양시 동안구',
  '안양시 만안구', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시 기흥구',
  '용인시 수지구', '용인시 처인구', '의왕시', '의정부시', '이천시', '파주시', '평택시',
  '포천시', '하남시', '화성시',
];

const AreaSelectionModal: React.FC<AreaSelectionModalProps> = ({ open, onClose, onSelectArea }) => {
  const [selectedAutonomousDistrict, setSelectedAutonomousDistrict] = useState<string | null>(null);
  const [selectedGeneralDistrict, setSelectedGeneralDistrict] = useState<string | null>(null);

  const handleSelect = () => {
    onSelectArea(selectedAutonomousDistrict, selectedGeneralDistrict);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="area-selection-modal-title"
      aria-describedby="area-selection-modal-description"
    >
      <Box
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%', // Half width of the screen
          maxWidth: 500, // Max width for larger screens
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography id="area-selection-modal-title" variant="h6" component="h2" mb={2} textAlign="center">
          활동 지역 설정
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, overflowY: 'auto' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>자치구</Typography>
            {autonomousDistricts.map((district) => (
              <Button
                key={district}
                fullWidth
                onClick={() => setSelectedAutonomousDistrict(district)}
                variant={selectedAutonomousDistrict === district ? 'contained' : 'text'}
                sx={{ justifyContent: 'flex-start' }}
              >
                {district}
              </Button>
            ))}
          </Box>
          <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, overflowY: 'auto' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>일반구</Typography>
            {generalDistricts.map((district) => (
              <Button
                key={district}
                fullWidth
                onClick={() => setSelectedGeneralDistrict(district)}
                variant={selectedGeneralDistrict === district ? 'contained' : 'text'}
                sx={{ justifyContent: 'flex-start' }}
              >
                {district}
              </Button>
            ))}
          </Box>
        </Stack>
        {selectedAutonomousDistrict || selectedGeneralDistrict ? (
          <Typography variant="subtitle2" color="text.secondary" mt={2} textAlign="center">
            현재 선택된 지역: {selectedAutonomousDistrict} {selectedGeneralDistrict}
          </Typography>
        ) : (
          <Typography variant="subtitle2" color="text.secondary" mt={2} textAlign="center">
            지역을 선택해주세요.
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSelect}
          sx={{ mt: 3, py: 1.5 }}
        >
          선택 완료
        </Button>
      </Box>
    </Modal>
  );
};

export default AreaSelectionModal;
