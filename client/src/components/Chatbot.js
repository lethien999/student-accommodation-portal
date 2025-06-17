import React, { useState, useEffect } from 'react';
import { Chatbot as ChatbotKit } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { FaComments, FaTimes } from 'react-icons/fa';

const config = {
  initialMessages: [
    {
      type: 'text',
      message: 'Xin chào! Tôi là trợ lý ảo của trang web tìm nhà trọ. Tôi có thể giúp gì cho bạn?',
      id: 'welcome',
    },
  ],
  customComponents: {
    botMessageBox: (props) => (
      <div className="bot-message-box">
        <div className="bot-message">{props.message}</div>
      </div>
    ),
    userMessageBox: (props) => (
      <div className="user-message-box">
        <div className="user-message">{props.message}</div>
      </div>
    ),
  },
  customStyles: {
    background: '#f5f5f5',
    fontFamily: 'Arial',
    headerBgColor: '#4a5568',
    headerFontColor: '#fff',
    headerFontSize: '16px',
    botBubbleColor: '#4a5568',
    botFontColor: '#fff',
    userBubbleColor: '#4299e1',
    userFontColor: '#fff',
  },
};

const actionProvider = {
  handleMessage: (message) => {
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('giá') || lowerMessage.includes('phí')) {
      response = 'Giá nhà trọ được hiển thị trên trang chi tiết của từng nhà trọ. Bạn có thể xem giá và liên hệ chủ nhà để thương lượng.';
    } else if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('vị trí')) {
      response = 'Địa chỉ chi tiết của nhà trọ được hiển thị trên trang chi tiết. Bạn cũng có thể xem vị trí trên bản đồ để biết chính xác vị trí.';
    } else if (lowerMessage.includes('tiện ích') || lowerMessage.includes('amenities')) {
      response = 'Các tiện ích của nhà trọ được liệt kê trong phần mô tả chi tiết. Thông thường bao gồm: wifi, điều hòa, nóng lạnh, giường, tủ, bàn học...';
    } else if (lowerMessage.includes('đăng ký') || lowerMessage.includes('đăng nhập')) {
      response = 'Bạn có thể đăng ký hoặc đăng nhập bằng cách nhấp vào nút tương ứng ở góc trên bên phải của trang web.';
    } else if (lowerMessage.includes('đánh giá') || lowerMessage.includes('review')) {
      response = 'Bạn có thể xem đánh giá của người dùng khác và thêm đánh giá của mình sau khi đăng nhập vào hệ thống.';
    } else {
      response = 'Tôi có thể giúp bạn tìm hiểu về giá cả, địa chỉ, tiện ích, cách đăng ký/đăng nhập, và đánh giá của nhà trọ. Bạn muốn biết thêm thông tin gì?';
    }

    return {
      type: 'text',
      message: response,
    };
  },
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Thêm CSS cho chatbot
    const style = document.createElement('style');
    style.textContent = `
      .chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
      }
      .chatbot-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #4a5568;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }
      .chatbot-button:hover {
        background-color: #2d3748;
      }
      .chatbot-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }
      .chatbot-header {
        padding: 15px;
        background: #4a5568;
        color: white;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .close-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
      }
      .bot-message-box {
        margin: 10px;
        padding: 10px;
        background: #4a5568;
        color: white;
        border-radius: 10px;
        max-width: 80%;
      }
      .user-message-box {
        margin: 10px;
        padding: 10px;
        background: #4299e1;
        color: white;
        border-radius: 10px;
        max-width: 80%;
        margin-left: auto;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <div className="chatbot-button" onClick={() => setIsOpen(true)}>
          <FaComments size={24} />
        </div>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Trợ lý ảo</span>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <ChatbotKit
            config={config}
            actionProvider={actionProvider}
            messageHistory={[]}
          />
        </div>
      )}
    </div>
  );
};

export default Chatbot; 