const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 임포트 (컨트롤러가 분리된 구조)
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const requestsRoutes = require('./routes/requests');

// 라우트 연결
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/join-requests', requestsRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IT People App API Server',
    version: '1.0.0'
  });
});

// 404 에러 핸들링
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '요청하신 API 엔드포인트를 찾을 수 없습니다.'
  });
});

// 전역 에러 핸들링
app.use((err, req, res, next) => {
  console.error('전역 에러:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB 연결
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/it-people-app'
    );
    console.log(`MongoDB 연결됨: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 서버 시작
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`개발 모드: http://localhost:${PORT}`);
    console.log('사용 가능한 라우트:');
    console.log('  POST   /api/auth/signup');
    console.log('  POST   /api/auth/login');
    console.log('  GET    /api/auth/me');
    console.log('  GET    /api/posts');
    console.log('  POST   /api/posts');
    console.log('  GET    /api/posts/nearby');
    console.log('  GET    /api/users/me');
    console.log('  PUT    /api/users/me');
    console.log('  POST   /api/join-requests/posts/:postId/request-join');
  });
};

// 우아한 종료
process.on('SIGINT', () => {
  console.log('서버 종료 중...');
  mongoose.connection.close();
  process.exit(0);
});

startServer();

module.exports = app;