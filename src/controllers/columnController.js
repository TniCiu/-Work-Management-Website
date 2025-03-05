import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'
import { boardcast } from '~/sockets'; // Đúng tên hàm
const getDetails = async (req, res, next) => {
    try {
        // console.log('req.params:',req.params)
        const columnId = req.params.id

        const column = await columnService.getDetails(columnId)

        // Có kết quả thì trả về phía Client 
        res.status(StatusCodes.OK).json(column)
        
    } catch (error) { next(error) }

}
const createNew = async (req, res, next) => {
    try {     
        const createColumn = await columnService.createdNew(req.body)
        // Phát sự kiện WebSocket
        boardcast('update_board', {
            type: 'column_created',
            newColumn: createColumn, 
        });
        res.status(StatusCodes.CREATED).json(createColumn)
    } catch (error) { next(error) }

}

const update = async (req, res, next) => {
    try {
      const columnId = req.params.id;
  
      // Gọi service để cập nhật dữ liệu cột
      const updateColumn = await columnService.update(columnId, req.body);
  
      // Phát sự kiện WebSocket tới tất cả client để đồng bộ dữ liệu
      boardcast("update_board", {
        type: "card_moved_same_column",
        columnId,
        cardOrderIds: req.body.cardOrderIds,
      });
  
      // Trả về kết quả cập nhật cho client
      res.status(StatusCodes.OK).json(updateColumn);
    } catch (error) {
      next(error);
    }
  };
  
const deleteItem = async (req, res, next) => {
    try {
        const columnId = req.params.id

        const result = await columnService.deleteItem(columnId)
            // Phát sự kiện WebSocket
            boardcast('update_board', {
                type: 'column_deleted',
                columnId, // Chỉ gửi ID của cột bị xóa
            });
        // Có kết quả thì trả về phía Client 
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }

}

export const columnController = {
    getDetails,
    createNew,
    update,
    deleteItem
}