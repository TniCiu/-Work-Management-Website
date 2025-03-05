import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mapOrder } from '~/utils/sorts'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' // Import useParams từ react-router-dom
import { 
  fetchBoardDetailsAPI, 
  createNewColumnAPI, 
  createNewCardAPI,
  updateBoardDetailsAPI,
  updatecolumnDetailsAPI,
  moveCardToDifferentColumnAPI,
  deleteColumnDetailsAPI,
  ideaFromAI,
   
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography } from '@mui/material'
import {toast} from 'react-toastify'
import {initializeWebSocket, sendWebSocketMessage,getWebSocket } from '../../client/websocketClient'
function Board() {
  const [board, setBoard] = useState(null)
  const { id } = useParams() // Lấy id từ đường dẫn
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [seclectIdeaAI, setSeclectIdeaAI] = useState(null)

  useEffect(() => {
    // Khởi tạo WebSocket khi component được mount
    initializeWebSocket('ws://localhost:2903',setBoard); // Thay bằng URL server WebSocket của bạn
    return () => {
      // Đóng WebSocket khi component bị unmount
      const socket = getWebSocket();
      if (socket) socket.close();
    };
  }, []);
  
  
  const handleFileChange = (imageUrl) => {
    setSelectedImage(imageUrl)
  }
  useEffect(() => {
    // Gọi API để lấy chi tiết của board với id được truyền qua đường dẫn
    if (id) {
      fetchBoardDetailsAPI(id)
        .then((board) => {
          if (!board || !board._id) {
            console.error("Invalid board data received:", board);
            toast.error("Failed to load board details.");
            return;
          }
  
          console.log("Fetched board:", board); // Log dữ liệu trả về từ API
  
          board.columns = mapOrder(board?.columns, board?.columnOrderIds, '_id');
  
          board.columns.forEach((column) => {
            if (isEmpty(column.cards)) {
              column.cards = [generatePlaceholderCard(column)];
              column.cardOrderIds = [generatePlaceholderCard(column)._id];
            } else {
              column.cards = mapOrder(column.cards, column.cardOrderIds, '_id');
            }
          });
  
          setBoard(board); // Cập nhật state với board đã xử lý
        })
        .catch((error) => {
          console.error("Error fetching board details:", error);
          toast.error("Failed to load board details.");
        });
    }
  }, [id, selectedImage]);

  const createNewColumn = async (newColumnData) => {
    let createdColumn;
    if (board) {
        createdColumn = await createNewColumnAPI({
            ...newColumnData,
            boardId: board._id, // Sử dụng id của board
        });
    } else {
        console.error("Board is not loaded yet.");
        return;
    }

    createdColumn.cards = [generatePlaceholderCard(createdColumn)];
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id];

    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);

    // Gửi sự kiện WebSocket
    sendWebSocketMessage("update_board", {
      type: "column_created",
      newColumn: {
          _id: createdColumn._id,
          title: createdColumn.title,
          boardId: createdColumn.boardId,
          cardOrderIds: createdColumn.cardOrderIds,
          createdAt: createdColumn.createdAt,
          updatedAt: createdColumn.updatedAt,
          _destroy: createdColumn._destroy,
      },
  });
  
};

  

  const createNewCard = async (newCardData) => {
    let createdCard
    if (board) {
      createdCard = await createNewCardAPI({
        ...newCardData,
        boardId: board._id // Sử dụng id của board
      });
    } else {
      console.error('Board is not loaded yet.');
      return
    }
  
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {

      if(columnToUpdate.cards.some(card =>card.FE_PlaceholderCard)){
        columnToUpdate.cards =[createdCard]
        columnToUpdate.cardOrderIds.push[createdCard._id]

      }else{
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id) 
      }
        
    }
    setBoard(newBoard)
     // Gửi sự kiện WebSocket
  sendWebSocketMessage("update_board", {
    type: "card_created",
    columnId: createdCard.columnId,
    card: createdCard,
  });

  }
  const updateColumnTitle = async (columnId, newTitle) => {
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.title = newTitle
      setBoard(newBoard)
    }
    updatecolumnDetailsAPI(columnId, { title: newTitle })
      .then(() => {
        toast.success("Column title updated successfully")
      })
      .catch((error) => {
        toast.error("Failed to update column title: " + error.message)
      })
  }
  
  const moveColums = (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    setBoard(newBoard);
  
    // Gửi sự kiện WebSocket
    sendWebSocketMessage("update_board", {
      type: "column_moved",
      columnOrderIds: newBoard.columnOrderIds,
    });
  
    // Gửi API để lưu trạng thái mới trên server
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds });
  };
  

  const moveCardInTheSameColumn = (dndOrderedCards,dndOrderedCardsIds,columnId) =>{
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) { 
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardsIds
    }
    setBoard(newBoard)
    sendWebSocketMessage("update_board", {
      type: "column_moved",
      columnOrderIds: newBoard.columnOrderIds,
    });
    updatecolumnDetailsAPI(columnId,{ cardOrderIds: dndOrderedCardsIds })
  } 
  if(!board){
    return (
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap:2,
        with:'100vw',
        height:'100vh'
        }}>
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    );
  }

  const deleteColumnDetails = (columnId) => {
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== columnId)
    setBoard(newBoard)
     // Gửi sự kiện WebSocket
  // Gửi sự kiện WebSocket
  sendWebSocketMessage("update_board", {
    type: "column_deleted",
    columnId, // Chỉ gửi ID của cột bị xóa
});
    deleteColumnDetailsAPI(columnId).then(res => {
      toast.success(res?.deleteResult)
    })
  }


/**
 * Khi di chuyển card sang Column khác:
 * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (là xóa _id của Card ra khỏi mảng)
 * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (thêm _id vào mảng)
 * B3: Cập nhật lại trường ColumbId mới vào cái Card đã kéo 
 * => làm một API support riêng.
 */
const moveCardToDifferentColumn = (
  currentCardId, 
  prevColumnId, 
  nextColumnId,
  dndOrderedColumns
) => {
  const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id);
  const newBoard = { ...board };
  newBoard.columns = dndOrderedColumns;
  newBoard.columnOrderIds = dndOrderedColumnsIds;
  setBoard(newBoard);

  let prevCard0rderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds || [];
  if (prevCard0rderIds[0]?.includes('placeholder-card')) prevCard0rderIds = [];
  const updateData = {
    currentCardId,
    prevColumnId,
    prevCard0rderIds,
    nextColumnId,
    nextCard0rderIds:
      dndOrderedColumns.find((c) => c._id === nextColumnId)?.cardOrderIds,
  };


  // Gửi yêu cầu API cập nhật dữ liệu
  moveCardToDifferentColumnAPI(updateData)
   

   // Gửi sự kiện WebSocket
   sendWebSocketMessage("update_board", {
    type: "card_moved_different_column",
    ...updateData,
  });
};


  const handleIdeaAIClick = () => {
    if (board) {
      const data = {
        title: board?.title || '',
        startDate: board?.startDate || '',
        endDate: board?.endDate || '',
      };
      setIsLoading(true); // Bắt đầu loading
      ideaFromAI(data)
        .then((rawJson) => {
          if (rawJson) {
            const messageContent = JSON.parse(rawJson)
            setSeclectIdeaAI(messageContent); // Lưu kết quả từ API
            console.log('AI Response Content:', rawJson)
          } else {
            console.warn('No valid data from AI')
          }
        })
        .catch((error) => {
          console.error('Error fetching AI response:', error)
        })
        .finally(() => {
          setIsLoading(false); // Kết thúc loading
        })
    }
  }
  
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar selectedImage={selectedImage}/>
      <BoardBar board={board} selectedImage={selectedImage} onFileChange={handleFileChange}  onIdeaClick={handleIdeaAIClick}  isLoading={isLoading} />
      <BoardContent 
        board={board} 
        setBoard={setBoard}
        createNewColumn={createNewColumn}  
        createNewCard={createNewCard} 
        updateColumnTitle = {updateColumnTitle} 
        moveColums = {moveColums}
        moveCardInTheSameColumn = {moveCardInTheSameColumn}
        moveCardToDifferentColumn ={moveCardToDifferentColumn}
        deleteColumnDetails = {deleteColumnDetails}
        selectedImage={selectedImage}
        seclectIdeaAI={seclectIdeaAI}
      />
    </Container>
  )
}

export default Board
