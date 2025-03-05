import axios from 'axios'
import { API_AI, API_ROOT } from '~/utils/constans'
import { sendWebSocketMessage } from '~/client/websocketClient'
//IdeaFormAI
const token = "pat_mp6ixUrzAxSorKz7UJY8FLcvAF6ooUcAOrzQOeUxDp4idpBSrRnjeajGTW5q8bJm"
export const ideaFromAI = async (data) => {
    const body = {
        conversation_id: "31223",
        bot_id: "7447940004602904577",
        user: "demo",
        query: `tôi muốn lên ý quản lý công việc về ${data.title}, với thời gian bắt đầu là ${data.startDate} và thời gian kết thúc ${data.endDate}, hoàn thiện và đày đủ nhất có thể, lên kế hoạch chi tiết, mở rộng thêm Lưu ý :trả về dữ liệu json 1 hàng  và loại bỏ khoảng cách và dữ liệu  vào thời gian bắt đầu và kết thúc`,
        stream: false,
    };

    try {
        const response = await axios.post(API_AI, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response?.data?.messages?.[0]?.content) {
            const rawJson = response.data.messages[0].content
                .replace(/```json|```/g, "")
                .trim();
            return rawJson; // Trả về dữ liệu đã xử lý
        } else {
            console.warn("Invalid response structure:", response.data);
            return null;
        }
    } catch (error) {
        console.error("Error in ideaFromAI:", error);
        return null;
    }
};



// user
export const loginAPI = async (credentials) => {
    try {
        // Gửi yêu cầu POST đến endpoint đăng nhập của máy chủ API với thông tin đăng nhập
        const response = await axios.post(`${API_ROOT}/v1/Users/login`, credentials);
        return response.data; // Trả về dữ liệu từ phản hồi của máy chủ API
    } catch (error) {
        throw error; // Xử lý lỗi nếu có
    }
};
export const signupAPI = async (userData) => {
    try {
        const response = await axios.post(`${API_ROOT}/v1/Users/`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const LoginwithGoogleAPI = async (token ) => {
    try {
        const response = await axios.post(`${API_ROOT}/v1/Users/login/google`, token );
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const fetchUserBoardsAPI = async (ownerIds) => {
    try {
        const response = await axios.get(`${API_ROOT}/v1/boards/users/${ownerIds}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserInfoAPI = async (userId) => {
    try {
        const response = await axios.get(`${API_ROOT}/v1/Users/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserInfoAPI = async (userId, updateData) => {
    try {
        const response = await axios.put(`${API_ROOT}/v1/Users/${userId}`, updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchInforUserBoardsAPI = async (ownerIds) => {
    try {
        const response = await axios.get(`${API_ROOT}/v1/boards/${ownerIds}/members`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
//Boards 
export const fetchAllBoardsAPI = async () => {
    const response = await axios.get(`${API_ROOT}/v1/boards`);
    return response.data
}
export const fetchBoardDetailsAPI = async (boardId) => {
    const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)

    return response.data

}
export const updateBoardDetailsAPI = async (boardId, updateData) => {
    const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)

    return response.data

}
export const moveCardToDifferentColumnAPI = async (updateData) => {
    const response = await axios.put(`${API_ROOT}/v1/boards/supports/moving_cards`, updateData)

    return response.data

}
export const generateColumnsAndCardsAPI = async (boardId, DataAI) => {
    try {
      const response = await axios.post(
        `${API_ROOT}/v1/boards/${boardId}/columns-and-cards`,
        { boardId, columns: DataAI }
      );
  
  
      if (response.data && response.data.columnOrderIds) {
        // Giả sử bạn cần tạo danh sách columns dựa trên `columnOrderIds`
        const columns = response.data.columnOrderIds.map((id, index) => ({
          _id: id,
          title: `Column ${index + 1}`, // Nếu không có tiêu đề, bạn có thể tạo tạm
          cards: [], // Hoặc xử lý thêm logic để lấy danh sách cards từ dữ liệu khác
        }));
  
        return columns;
      } else {
        return []; // Trả về mảng rỗng nếu không có dữ liệu hợp lệ
      }
    } catch (error) {
      console.error("Error in API call:", error.response?.data || error.message || error);
      throw error;
    }
  };
  
  

export const createNewBoardAPI = async (newBoardData) => {
    const response = await axios.post(`${API_ROOT}/v1/boards`, newBoardData)
    return response.data
}

export const deleteBoardDetailsAPI = async (boardId) => {
    const response = await axios.delete(`${API_ROOT}/v1/boards/${boardId}`)
    return response.data
}



//Columns 
export const createNewColumnAPI = async (newColumnData) => {
    const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)

    return response.data
 
}
export const updatecolumnDetailsAPI = async (columnId, updateData) => {
    const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)

    return response.data

}
export const deleteColumnDetailsAPI = async (columnId) => {
    const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`)

    return response.data

}


//Cards
 export const createNewCardAPI = async (newCardData) => {
     const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
    
    return response.data
  }
  export const updateCardDetailsAPI = async (cardId, updatedFields, boardId) => {
    try {
      const response = await axios.put(`${API_ROOT}/v1/cards/${cardId}`, updatedFields);
  
      if (response.status === 200) {
        sendWebSocketMessage("update_board", {
            type: "update_card",
            cardId: cardId,
            updates: updatedFields,
            boardId: boardId
          });

      } else {
        console.warn("Card updated but WebSocket event not sent due to non-200 response");
      }
  
      return response.data;
    } catch (error) {
      console.error("Failed to update card details:", error.message);
      throw error;
    }
  };
  
  
  export const addMemberToCardAPI = async (cardId, memberId) => {
    try {
        const response = await axios.post(`${API_ROOT}/v1/cards/${cardId}/members`, { memberId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// invitation
export const fetchInvitationsAPI = async (invitedUserId) => {
    try {
        const response = await axios.get(`${API_ROOT}/v1/Invitation/invited/${invitedUserId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const sendInvitationAPI = async (invitationData) => {
    try {
        const response = await axios.post(`${API_ROOT}/v1/Invitation`, invitationData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const acceptInvitationAPI = async (invitationId) => {
    try {
        const response = await axios.patch(`${API_ROOT}/v1/Invitation/${invitationId}/accept`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const declineInvitationAPI = async (invitationId) => {
    try {
        const response = await axios.patch(`${API_ROOT}/v1/Invitation/${invitationId}/decline`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

