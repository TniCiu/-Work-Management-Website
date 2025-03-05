import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import { boardcast } from '~/sockets'; // Đúng tên hàm

const getAll = async (req, res, next) => {
    try {
        // Gọi hàm từ service để lấy danh sách các bảng
        const boards = await boardService.getAll()

        // Trả về danh sách các bảng dưới dạng JSON
        res.status(StatusCodes.OK).json(boards)
    } catch (error) {
        // Nếu có lỗi, chuyển tiếp lỗi tới middleware xử lý lỗi tiếp theo
        next(error)
    }
}

const createNew = async (req, res, next) => {
    try {
      
        const createBoard = await boardService.createdNew(req.body)

        // Có kết quả thì trả về phía Client 
        res.status(StatusCodes.CREATED).json(createBoard)
    } catch (error) { next(error) }

}

const getDetails = async (req, res, next) => {
    try {
        // console.log('req.params:',req.params)
        const boardId = req.params.id

        const board = await boardService.getDetails(boardId)

        // Có kết quả thì trả về phía Client 
        res.status(StatusCodes.OK).json(board)
        
    } catch (error) { next(error) }

}
const update = async (req, res, next) => {
    try {
      const boardId = req.params.id;
  
      // Cập nhật thông tin bảng
      const updateBoard = await boardService.update(boardId, req.body);
  
      // Phát sự kiện WebSocket
      boardcast("update_board", {
        type: "column_moved",
        columnOrderIds: req.body.columnOrderIds,
      });
  
      res.status(StatusCodes.OK).json(updateBoard);
    } catch (error) {
      next(error);
    }
  };
  

const deleteBoard = async (req, res) => {
    const { id } = req.params;
    try {
        // Gọi hàm xóa board từ service hoặc repository
        const result = await boardService.deleteBoard(id)
        res.status(StatusCodes.OK).json(result) // Trả về mã trạng thái 204 - No Content nếu xóa thành công
    } catch (error) {
        console.error('Error deleting board:', error)
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR) // Trả về mã trạng thái 500 - Internal Server Error nếu có lỗi xảy ra
    }
}

const moveCardToDifferentColumn = async (req, res, next) => {
    try {
        
        const result = await boardService.moveCardToDifferentColumn(req.body)
        // Có kết quả thì trả về phía Client 
        boardcast('update_board', {
            type: 'card_moved_different_column',
            ...result
          });
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }

}

const getUserBoards = async (req, res) => {
    let ownerIds = req.params.ownerIds; // Lấy giá trị của ownerIds từ req.params

    // Chuyển ownerIds thành một mảng nếu nó không phải là mảng
    if (!Array.isArray(ownerIds)) {
        ownerIds = [ownerIds];
    }
    try {
        const boards = await boardService.getUserBoards(ownerIds);
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const  addColumnsAndCards = async (req, res) => {
    try {
        const { boardId, columns } = req.body;

        // Gọi service để xử lý thêm columns và cards
        const updatedBoard = await boardService.addColumnsAndCardsToBoard(boardId, columns);

        res.status(StatusCodes.OK).json(updatedBoard);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

const getBoardMembersInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const board = await boardModel.findOneById(id);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

     
        const owners = [];
        for (const ownerId of board.ownerIds) {
            const owner = await userModel.getUserDetails(ownerId);
            if (owner) {
                owners.push({
                    _id: owner._id,
                    email: owner.email,
                    username: owner.username,
                    avatar: owner.avatar
                });
            }
        }
        // Fetching members details
        const members = [];
        for (const memberId of board.memberIds) {
            const member = await userModel.getUserDetails(memberId);
            if (member) {
                members.push({
                    _id: member._id,
                    email: member.email,
                    username: member.username,
                    avatar: member.avatar
                });
            }
        }

        // Sending the response
        return res.status(200).json({
            board: {
                _id: board._id,
                title: board.title,
                description: board.description,
                type: board.type,
                owners ,
                members
            }
        });
    } catch (error) {
        console.error("Error in getBoardMembersInfo function:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};




export const boardController = {
    getAll,
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    deleteBoard,
    getUserBoards,
    getBoardMembersInfo,
    addColumnsAndCards
}