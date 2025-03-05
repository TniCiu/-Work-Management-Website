import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
import { boardcast } from '~/sockets'; // Đúng tên hàm
const createNew = async (req, res, next) => {
  try {
      const createdCard = await cardService.createdNew(req.body);

      // Phát sự kiện WebSocket
      boardcast("update_board", {
          type: "card_created",
          columnId: createdCard.columnId,
          card: createdCard,
      });

      res.status(StatusCodes.CREATED).json(createdCard);
  } catch (error) {
      next(error);
  }
};

const update = async (req, res) => {
    try {
      const cardId = req.params.id;
      const updatedCard = await cardService.update(cardId, req.body);
  
      // Gửi sự kiện WebSocket với `boardId`
      boardcast("update_board", {
        type: "update_card",
        boardId: updatedCard.boardId, // Truyền `boardId`
        cardId,
        updates: req.body, // Chỉ gửi các trường được cập nhật
      });
  
      res.status(200).json(updatedCard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

const addMemberToCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { memberId } = req.body;
        const updatedCard = await cardService.addMemberToCard(cardId, memberId);
        res.status(200).json(updatedCard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const cardController = {
    createNew,
    update,
    addMemberToCard
}