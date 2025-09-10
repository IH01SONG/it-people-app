/**
 * 목 소켓 매니저 - 개발용
 * Socket.IO 없이 실시간 기능을 시뮬레이션
 */

import { mockMessages, mockCurrentUser } from './mockData';

class MockSocketManager {
  private eventListeners: { [event: string]: Function[] } = {};
  private isRegistered = false;
  private currentRooms: Set<string> = new Set();

  /**
   * 사용자 등록
   */
  register(userId: string): void {
    console.log(`[Mock Socket] User ${userId} registered`);
    this.isRegistered = true;
  }

  /**
   * 채팅방 입장
   */
  joinChatRoom(roomId: string): void {
    console.log(`[Mock Socket] Joined chat room: ${roomId}`);
    this.currentRooms.add(roomId);
    
    // 입장 후 잠시 뒤 가상의 메시지 받기 시뮬레이션 (개발 테스트용)
    setTimeout(() => {
      if (this.currentRooms.has(roomId) && Math.random() > 0.7) {
        this.simulateIncomingMessage(roomId);
      }
    }, 3000 + Math.random() * 5000);
  }

  /**
   * 채팅방 나가기
   */
  leaveChatRoom(roomId: string): void {
    console.log(`[Mock Socket] Left chat room: ${roomId}`);
    this.currentRooms.delete(roomId);
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    console.log(`[Mock Socket] Event listener registered for: ${event}`);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      console.log(`[Mock Socket] Event listener removed for: ${event}`);
    }
  }

  /**
   * 연결 종료
   */
  disconnect(): void {
    console.log('[Mock Socket] Disconnected');
    this.isRegistered = false;
    this.currentRooms.clear();
    this.eventListeners = {};
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.isRegistered;
  }

  /**
   * 가상의 수신 메시지 시뮬레이션
   */
  private simulateIncomingMessage(roomId: string): void {
    const messages = mockMessages[roomId];
    if (!messages || messages.length === 0) return;

    // 상대방이 보낸 메시지 중 하나를 랜덤으로 선택
    const otherMessages = messages.filter(msg => !msg.isMe);
    if (otherMessages.length === 0) return;

    const randomMessage = otherMessages[Math.floor(Math.random() * otherMessages.length)];
    
    // 새로운 메시지 생성
    const simulatedMessage = {
      _id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: this.getRandomResponse(),
      type: "text",
      sender: randomMessage.sender,
      createdAt: new Date().toISOString(),
      isMe: false
    };

    // 메시지를 목 데이터에 추가
    messages.push(simulatedMessage);

    // 리스너들에게 새 메시지 이벤트 전송
    if (this.eventListeners['newMessage']) {
      this.eventListeners['newMessage'].forEach(callback => {
        callback(simulatedMessage);
      });
    }

    console.log(`[Mock Socket] Simulated incoming message in room ${roomId}:`, simulatedMessage.content);
  }

  /**
   * 랜덤 응답 메시지 생성
   */
  private getRandomResponse(): string {
    const responses = [
      "네, 알겠습니다!",
      "좋은 아이디어네요 👍",
      "언제 시간 되실까요?",
      "더 자세한 내용 알려주세요",
      "참여하고 싶어요!",
      "어떻게 진행하면 될까요?",
      "기대됩니다! 😊",
      "질문이 있는데요",
      "도움이 필요하면 말씀해주세요",
      "수고하셨습니다!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 특정 이벤트 강제 발생 (개발/테스트용)
   */
  simulate(event: string, data: any): void {
    console.log(`[Mock Socket] Simulating event: ${event}`, data);
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
}

// 싱글톤 인스턴스 생성
const mockSocketManager = new MockSocketManager();

export default mockSocketManager;