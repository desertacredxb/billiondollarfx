import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE
  ? `${process.env.NEXT_PUBLIC_API_BASE}/api/ai`
  : "http://localhost:5000/api/ai";

export interface ChatResponse {
  success: boolean;
  reply: string;
  conversationId: string;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export const aiService = {
  sendMessage: async (
    message: string,
    conversationId?: string,
  ): Promise<ChatResponse> => {
    const { data } = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
      message,
      conversationId,
    });
    return data;
  },

  resetConversation: async (
    conversationId: string,
  ): Promise<{ success: boolean }> => {
    const { data } = await axios.post(`${API_BASE_URL}/reset`, {
      conversationId,
    });
    return data;
  },

  getHistory: async (
    conversationId: string,
  ): Promise<{ success: boolean; history: HistoryMessage[] }> => {
    const { data } = await axios.get(`${API_BASE_URL}/history`, {
      params: { conversationId },
    });
    return data;
  },
};
