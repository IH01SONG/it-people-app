import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const terms = [
    {
      id: 'service',
      title: '서비스 이용약관',
      content: '이 서비스 이용약관은 IT People 앱의 서비스 이용에 대한 조건을 명시합니다. 사용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다. 자세한 내용은 앱 내에서 확인해주세요.',
    },
    {
      id: 'privacy',
      title: '개인정보 처리방침',
      content: 'IT People 앱은 사용자의 개인 정보를 보호하기 위해 최선을 다합니다. 개인 정보 처리 방침은 개인 정보의 수집, 이용, 제공, 파기 등에 대한 내용을 포함합니다. 자세한 내용은 앱 내에서 확인해주세요.',
    },
    {
      id: 'location',
      title: '위치정보 이용약관',
      content: 'IT People 앱은 사용자에게 위치 기반 서비스를 제공하기 위해 위치 정보를 이용합니다. 위치정보 이용약관은 위치 정보의 수집 및 이용 목적, 제공 범위 등에 대한 내용을 명시합니다. 자세한 내용은 앱 내에서 확인해주세요.',
    },
  ];

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          약관
        </Typography>
      </Box>
      <Box p={2}>
        {terms.map((term) => (
          <Accordion expanded={expanded === term.id} onChange={handleChange(term.id)} key={term.id}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls={`${term.id}-content`}
              id={`${term.id}-header`}
            >
              <Typography variant="subtitle1">{term.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ height: 'auto', overflow: 'auto' }}>
                <Typography variant="body2">{term.content}</Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default TermsAndConditions;
