let socket;

export const initializeWebSocket = (url, setBoard) => {
  socket = new WebSocket(url);

  socket.onopen = () => console.log("WebSocket connected!");
  socket.onclose = () => console.log("WebSocket disconnected!");
  socket.onerror = (error) => console.error("WebSocket error:", error);

  socket.onmessage = (message) => {
    try {
      const { event, data } = JSON.parse(message.data);
      console.log("WebSocket Received Data:", { event, data });
  
      if (event === "update_board") {
        setBoard((prevBoard) => {
          if (!prevBoard) return prevBoard;
  
          let newBoard = { ...prevBoard }; // Khai báo biến newBoard duy nhất
  
          switch (data.type) {
            case "column_created":
              const { newColumn } = data;
              if (!newColumn) {
                console.error("Missing newColumn data for column_created event.");
                return prevBoard;
              }
              newBoard.columns = [...newBoard.columns, newColumn];
              newBoard.columnOrderIds = [...newBoard.columnOrderIds, newColumn._id];
              console.log("Updated board after column_created:", newBoard);
              break;
  
            case "column_deleted":
              const { columnId } = data;
              if (!columnId) {
                console.error("Missing columnId for column_deleted event.");
                return prevBoard;
              }
              newBoard.columns = newBoard.columns.filter((col) => col._id !== columnId);
              newBoard.columnOrderIds = newBoard.columnOrderIds.filter((id) => id !== columnId);
              console.log("Updated board after column_deleted:", newBoard);
              break;
  
            case "column_moved":
              const { columnOrderIds } = data;
              if (!columnOrderIds) {
                console.error("Missing columnOrderIds for column_moved event.");
                return prevBoard;
              }
              newBoard.columnOrderIds = columnOrderIds;
              newBoard.columns = columnOrderIds.map((id) =>
                newBoard.columns.find((col) => col._id === id)
              );
              console.log("Updated board after column_moved:", newBoard);
              break;
              case "card_created": {
                const { columnId, card } = data;
    
                const columnToUpdate = newBoard.columns.find(
                  (column) => column._id === columnId
                );
    
                if (columnToUpdate) {
                  columnToUpdate.cards = [...(columnToUpdate.cards || []), card];
                  columnToUpdate.cardOrderIds = [
                    ...(columnToUpdate.cardOrderIds || []),
                    card._id,
                  ];
    
                  console.log("Updated column after card_created:", columnToUpdate);
                } else {
                  console.error(`Column with ID ${columnId} not found`);
                }
                break;
              }
              case "card_moved_same_column":{
                const { columnId, cardOrderIds } = data;
            
                if (!columnId || !cardOrderIds) {
                  console.error("Missing columnId or cardOrderIds for card_moved_same_column event.");
                  return prevBoard;
                }
            
                const columnToUpdate = newBoard.columns.find((column) => column._id === columnId);
            
                if (columnToUpdate) {
                  columnToUpdate.cardOrderIds = cardOrderIds;
                  columnToUpdate.cards = cardOrderIds.map((id) =>
                    columnToUpdate.cards.find((card) => card._id === id)
                  );
            
                  console.log("Updated column after card_moved_same_column:", columnToUpdate);
                } else {
                  console.error(`Column with ID ${columnId} not found`);
                }
            
                break; 
              }
              case "card_moved_different_column": {
                const {
                  prevColumnId,
                  nextColumnId,
                  currentCardId,
                  prevCard0rderIds,
                  nextCard0rderIds,
                } = data;
              
                const prevColumn = newBoard.columns.find((col) => col._id === prevColumnId);
                const nextColumn = newBoard.columns.find((col) => col._id === nextColumnId);
              
                if (!prevColumn || !nextColumn) {
                  console.warn("Columns not found for card_moved_different_column. Syncing data...");
                  fetchBoardDetailsAPI().then((newBoardData) => setBoard(newBoardData));
                  return prevBoard;
                }
              
                let movedCard = prevColumn.cards.find((card) => card._id === currentCardId);
              
                if (!movedCard) {
                  console.warn("Card not found in prevColumn. Trying nextColumn...");
                  movedCard = nextColumn.cards.find((card) => card._id === currentCardId);
                }
              
                if (!movedCard) {
                  console.error("Card not found in both prevColumn and nextColumn. Skipping update...");
                  return prevBoard;
                }
              
                // Loại bỏ thẻ khỏi cột trước
                prevColumn.cards = prevColumn.cards.filter((card) => card._id !== currentCardId);
                prevColumn.cardOrderIds = prevCard0rderIds;
              
                // Thêm thẻ vào cột mới dựa trên thứ tự
                nextColumn.cards = nextCard0rderIds.map((cardId) =>
                  cardId === currentCardId
                    ? movedCard
                    : nextColumn.cards.find((card) => card._id === cardId)
                );
                nextColumn.cardOrderIds = nextCard0rderIds;
              
                console.log("Updated board after card_moved_different_column:", newBoard);
                return {
                  ...prevBoard,
                  columns: newBoard.columns,
                };
              }
              
              
            case "update_card":
              const { cardId, updates, boardId } = data;
              if (!boardId || boardId !== prevBoard._id) {
                console.error("Board ID is missing or does not match the current board:", data);
                return prevBoard;
              }
              if (!cardId || !updates || typeof updates !== "object") {
                console.error("Invalid card update data:", { cardId, updates });
                return prevBoard;
              }
              newBoard.columns = prevBoard.columns.map((column) => {
                if (column.cards.some((card) => card._id === cardId)) {
                  return {
                    ...column,
                    cards: column.cards.map((card) =>
                      card._id === cardId
                        ? { ...card, ...updates }
                        : card
                    ),
                  };
                }
                return column;
              });
              console.log("Updated board after update_card:", newBoard);
              break;
  
            default:
              console.warn("Unknown action type:", data.type);
              break;
          }
  
          return newBoard; // Trả về newBoard sau khi xử lý
        });
      } else {
        console.warn("Unknown WebSocket event:", event);
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  };
  
};

export const getWebSocket = () => socket;

export const sendWebSocketMessage = (event, data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  } else {
    console.error("WebSocket is not connected!");
  }
};
