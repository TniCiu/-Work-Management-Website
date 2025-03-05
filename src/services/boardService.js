import { slugify } from "~/utils/formatters"
import { boardModel } from "~/models/boardModel"
import ApiError from "~/utils/ApiError"
import { StatusCodes } from "http-status-codes"
import { cloneDeep } from "lodash"
import { columnModel } from "~/models/columnModel"
import { cardModel } from "~/models/cardModel"
import { ObjectId } from 'mongodb';
const getAll = async () => {
    try {
        // Gọi hàm từ model để lấy danh sách các bảng
        const boards = await boardModel.getAll()
        return boards
    } catch (error) {
        throw error
    }
}

const createdNew = async (reqBody) => {
    try {  
    // Làm thêm các xử lý logic tùy đặc thủ đồ án 
    
        const newBoard = {
            ...reqBody,
            slug: slugify(reqBody.title)
            // title:'test gắn mặc dịnh val'
        }


    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database 
    const createdBoard = await boardModel.createdNew(newBoard)
    // console.log(createdBoard)

    // Lấy bản ghi board sau khi gọi 
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log(getNewBoard)
    // Làm thêm các xử lý logic với các Collection khác tùy đặc thủ đồ án  
    // Notification về cho admin khi có 1 cái Board mới được tạo 


    // Trả kết quả về trong Service 
      return getNewBoard
    } catch (error) {throw error }

}   
const addColumnsAndCardsToBoard = async (boardId, columns) => {
    try {
        // Kiểm tra xem board có tồn tại không
        const board = await boardModel.findOneById(new ObjectId(boardId));
        if (!board) {
            throw new Error('Board not found');
        }

        const columnOrderIds = []; // Mảng lưu trữ các column ID dưới dạng chuỗi

        // Duyệt qua từng column để thêm vào
        for (const column of columns) {
            const newColumn = {
                title: column.title,
                boardId, // Sử dụng chuỗi cho boardId
                cardOrderIds: [], // Thiết lập giá trị mặc định
                createdAt: new Date(),
            };

            // Thêm column vào database
            const createdColumn = await columnModel.createdNew(newColumn);

            // Thêm columnId vào mảng columnOrderIds
            const columnIdString = createdColumn.insertedId.toString();
            columnOrderIds.push(columnIdString);

            // Thêm cards nếu có
            if (column.cards && Array.isArray(column.cards)) {
                for (const card of column.cards) {
                    const newCard = {
                        title: card.title,
                        attachments: card.attachments || null, // Bao gồm attachments
                        columnId: columnIdString, // Sử dụng chuỗi cho columnId
                        boardId, // Sử dụng chuỗi cho boardId
                        createdAt: new Date(),
                        comments: [], // Thiết lập giá trị mặc định
                    };

                    // Lưu card vào database
                    await cardModel.createdNew(newCard);
                }
            }
        }

        // Cập nhật trường columnOrderIds trong bảng
        await boardModel.updateById(boardId, { columnOrderIds });

        // Lấy lại board đã cập nhật
        const updatedBoard = await boardModel.findOneById(new ObjectId(boardId));
        return updatedBoard;
    } catch (error) {
        throw new Error(`Error adding columns and cards to board: ${error.message}`);
    }
};




const getDetails = async (boardId) => {
    try {  
    const board = await boardModel.getDetails(boardId)
    if(!board){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found !')
    }

    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
        column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id) )
        // column.cards = resBoard.cards.filter(card => card.columnId === column._id)
    })

    delete resBoard.cards

    return resBoard
    } catch (error) {throw error }

}  
const update = async (boardId,reqBody) => {
    try {  
    const updateData= {
        ...reqBody,
        updatedAt: Date.now()
    
    }
    const updatedBoard = await boardModel.update(boardId,updateData)
    

    return updatedBoard
    } catch (error) {throw error }

}
const deleteBoard = async (boardId) => {
    try {
        // Tìm và xóa board theo id
        const deletedBoard = await boardModel.deleteOneById(boardId)

        if (!deletedBoard) {
            throw new Error('Board not found!')
        }

        // Tìm và lấy tất cả các cột thuộc về board này
        const columns = await columnModel.findByBoardId(boardId)

        if (!columns || columns.length === 0) {
            console.log('Board deleted successfully, but no columns found!')
            return { deleteResult: 'Board deleted successfully, but no columns found!' }
            
        }

        for (const column of columns) {
            await cardModel.deleteManyByColumnId(column._id)
        }

        // Xóa tất cả các cột thuộc về board
        await columnModel.deleteManyByBoardId(boardId)

        console.log('Board, Columns, and Cards deleted successfully!');
        return { deleteResult: 'Board, Columns, and Cards deleted successfully!' }
    } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
    try {  
    //B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (là xóa _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId,{
        cardOrderIds:reqBody.prevCard0rderIds,
        updatedAt:Date.now()
    })

    //B2: Cập nhật mảng cardOrderIds của Column tiếp theo (thêm _id vào mảng)
    await columnModel.update(reqBody.nextColumnId,{
        cardOrderIds:reqBody.nextCard0rderIds,
        updatedAt:Date.now()
  })
    //B3: Cập nhật lại trường ColumbId mới vào cái Card đã kéo 
    await cardModel.update(reqBody.currentCardId,{
        columnId:reqBody.nextColumnId
    })
    

    return reqBody
    } catch (error) {throw error }

}
const getUserBoards = async (ownerIds) => {
    try {
        const boards = await boardModel.getUserBoards(ownerIds);
        return boards;
    } catch (error) {
        throw error;
    }
}

export const boardService = {
    getAll,
    createdNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    deleteBoard,
    getUserBoards,
    addColumnsAndCardsToBoard
}