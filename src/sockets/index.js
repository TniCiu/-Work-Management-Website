import { WebSocketServer } from "ws";

let wss;

// Khởi tạo WebSocket Server
export const initializeWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("Client connected:", ws._socket.remoteAddress);

        ws.on("message", (message) => {
            try {
                const { event, data } = JSON.parse(message);
                console.log("Received message:", { event, data });

                // Xử lý các sự kiện
                handleWebSocketEvent(event, data);
            } catch (err) {
                console.error("Message parsing error:", err);
            }
        });

        ws.on("close", () => console.log("Client disconnected!"));
        ws.on("error", (err) => console.error("WebSocket error:", err));
    });

    console.log("WebSocket Server initialized!");
};

// Gửi message tới tất cả client
export const boardcast = (event, data) => {
    if (!wss) return;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event, data }));
        }
    });
};

// Xử lý các sự kiện WebSocket
const handleWebSocketEvent = (event, data) => {
    switch (event) {
        case "column_created":
            handleColumnCreated(data);
            break;

        case "card_created":
            handleCardCreated(data);
            break;

        case "column_deleted":
            handleColumnDeleted(data);
            break;

        case "column_moved":
            handleColumnMoved(data);
            break;

        case "card_moved_same_column":
            handleCardMovedSameColumn(data);
            break;

        case "card_moved_different_column":
            handleCardMovedDifferentColumn(data);
            break;
            case "update_card": // Thêm xử lý update_card
            handleUpdateCard(data);
            break;
        default:
            console.warn("Unknown WebSocket event:", event);
    }
};

// Xử lý sự kiện tạo cột
const handleColumnCreated = (data) => {
    console.log("Handling column_created:", data);
    boardcast("update_board", {
        type: "column_created",
        newColumn: data.newColumn,
    });
};

// Xử lý sự kiện tạo thẻ
const handleCardCreated = (data) => {
    console.log("Handling card_created:", data);
    boardcast("update_board", {
        type: "card_created",
        columnId: data.columnId,
        card: data.card,
    });
};

// Xử lý sự kiện xóa cột
const handleColumnDeleted = (data) => {
    console.log("Handling column_deleted:", data);
    boardcast("update_board", {
        type: "column_deleted",
        columnId: data.columnId,
    });
};

// Xử lý sự kiện di chuyển cột
const handleColumnMoved = (data) => {
    console.log("Handling column_moved:", data);
    boardcast("update_board", {
        type: "column_moved",
        columnOrderIds: data.columnOrderIds,
    });
};

// Xử lý sự kiện di chuyển thẻ trong cùng một cột
const handleCardMovedSameColumn = (data) => {
    console.log("Handling card_moved_same_column:", data);
    boardcast("update_board", {
        type: "card_moved_same_column",
        columnId: data.columnId,
        cardOrderIds: data.cardOrderIds,
    });
};

// Xử lý sự kiện di chuyển thẻ giữa các cột
const handleCardMovedDifferentColumn = (data) => {
    console.log("Handling card_moved_different_column:", data);
    boardcast("update_board", {
        type: "card_moved_different_column",
        prevColumnId: data.prevColumnId,
        prevCardOrderIds: data.prevCardOrderIds,
        nextColumnId: data.nextColumnId,
        nextCardOrderIds: data.nextCardOrderIds,
        currentCardId: data.currentCardId,
    });
};
const handleUpdateCard = (data) => {
    console.log("Handling update_card:", data);

    // Broadcast sự kiện tới tất cả client
    boardcast("update_board", {
        type: "update_card",
        cardId: data.cardId,
        boardId: data.boardId,
        updates: data.updates, // Chỉ gửi trường được cập nhật
    });
};

