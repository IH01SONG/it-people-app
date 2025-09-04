// src/lib/api.ts
import axios from './axios';

export const api = {
  signup: (payload: {
    email: string;
    password: string;
    name: string;
    birth: string;      // 서버가 기대하는 키 이름
    nickname?: string;  // 선택 필드 가능
  }) => axios.post('/api/auth/signup', payload).then(r => r.data),

  login: (email: string, password: string) =>
    axios.post('/api/auth/login', { email, password })
         .then(r => r.data as { token: string }),

  getMe: () => axios.get('/api/me').then(r => r.data),
};
