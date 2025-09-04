import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, Stack } from '@mui/material';

interface AreaSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectArea: (autonomousDistrict: string | null, generalDistrict: string | null) => void;
}

const administrativeDivisions: { [key: string]: string[] } = {
  "서울특별시": [
    '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구',
    '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구',
    '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구',
  ],
  "부산광역시": [
    '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구',
    '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군',
  ],
  "대구광역시": [
    '중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군',
  ],
  "인천광역시": [
    '중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군',
  ],
  "광주광역시": [
    '동구', '서구', '남구', '북구', '광산구',
  ],
  "대전광역시": [
    '동구', '중구', '서구', '유성구', '대덕구',
  ],
  "울산광역시": [
    '중구', '남구', '동구', '북구', '울주군',
  ],
  "세종특별자치시": [
    '세종특별자치시',
  ],
  "경기도": [
    '수원시 장안구', '수원시 권선구', '수원시 팔달구', '수원시 영통구', '고양시 덕양구', '고양시 일산동구', '고양시 일산서구', '용인시 처인구', '용인시 기흥구', '용인시 수지구', '성남시 수정구', '성남시 중원구', '성남시 분당구', '부천시', '안산시 상록구', '안산시 단원구', '안양시 만안구', '안양시 동안구', '화성시', '평택시', '의정부시', '파주시', '김포시', '시흥시', '광명시', '광주시', '군포시', '하남시', '오산시', '이천시', '안성시', '구리시', '남양주시', '포천시', '양주시', '여주시', '동두천시', '과천시', '의왕시', '가평군', '양평군', '연천군',
  ],
  "강원특별자치도": [
    '춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군',
  ],
  "충청북도": [
    '청주시 상당구', '청주시 서원구', '청주시 흥덕구', '청주시 청원구', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군',
  ],
  "충청남도": [
    '천안시 동남구', '천안시 서북구', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군',
  ],
  "전북특별자치도": [
    '전주시 완산구', '전주시 덕진구', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군',
  ],
  "전라남도": [
    '목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군',
  ],
  "경상북도": [
    '포항시 남구', '포항시 북구', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군',
  ],
  "경상남도": [
    '창원시 의창구', '창원시 성산구', '창원시 마산합포구', '창원시 마산회원구', '창원시 진해구', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군',
  ],
  "제주특별자치도": [
    '제주시', '서귀포시',
  ],
};

const AreaSelectionModal: React.FC<AreaSelectionModalProps> = ({ open, onClose, onSelectArea }) => {
  const [selectedCityProvince, setSelectedCityProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Reset selected district when city/province changes
  useEffect(() => {
    setSelectedDistrict(null);
  }, [selectedCityProvince]);

  const handleSelect = () => {
    onSelectArea(selectedCityProvince, selectedDistrict);
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
          width: '90%', // Adjusted width for two columns
          maxWidth: 700, // Increased max width
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
          {/* Left Column: City/Province Selection */}
          <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, overflowY: 'auto' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>시/도</Typography>
            {Object.keys(administrativeDivisions).map((cityProvince) => (
              <Button
                key={cityProvince}
                fullWidth
                onClick={() => {
                  setSelectedCityProvince(cityProvince);
                }}
                variant={selectedCityProvince === cityProvince ? 'contained' : 'text'}
                sx={{ justifyContent: 'flex-start' }}
              >
                {cityProvince}
              </Button>
            ))}
          </Box>

          {/* Right Column: District/County/Borough Selection */}
          <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, overflowY: 'auto' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>시/군/구</Typography>
            {selectedCityProvince &&
              administrativeDivisions[selectedCityProvince].map((district) => (
                <Button
                  key={district}
                  fullWidth
                  onClick={() => {
                    setSelectedDistrict(district);
                  }}
                  variant={selectedDistrict === district ? 'contained' : 'text'}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {district}
                </Button>
              ))}
            {!selectedCityProvince && (
              <Typography variant="body2" color="text.secondary">좌측에서 시/도를 선택해주세요.</Typography>
            )}
          </Box>
        </Stack>
        {(selectedCityProvince || selectedDistrict) ? (
          <Typography variant="subtitle2" color="text.secondary" mt={2} textAlign="center">
            현재 선택된 지역: {selectedCityProvince} {selectedDistrict}
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
