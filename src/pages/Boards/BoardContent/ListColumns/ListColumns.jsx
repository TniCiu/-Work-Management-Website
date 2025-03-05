import {toast} from 'react-toastify'
import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { generateColumnsAndCardsAPI,fetchBoardDetailsAPI } from '~/apis'
import { useEffect} from 'react'
function ListColumns({
  board,
  columns,
  createNewColumn,
  createNewCard,
  selectedImage,
  deleteColumnDetails,
  updateColumnTitle,
  setBoard,
  mockData,
  setMockData,  // Thêm setMockData để cập nhật mockData
}) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  useEffect(() => {
  }, [board]);
  
  const addNewColumn = () => {
    if (!newColumnTitle) {
      return;
    }

    const newColumnData = {
      title: newColumnTitle
    };
    createNewColumn(newColumnData);

    toggleOpenNewColumnForm();
    setNewColumnTitle('');
  };

  // Hàm hủy thay đổi mockData
  const cancelChanges = () => {
    setMockData(null);
    toast.info("Changes have been canceled");
  };
  
  
  
  const applyChanges = async () => {
    try {
      if (!board || !mockData) {
        return;
      }
  
      const updatedData = await generateColumnsAndCardsAPI(board._id, mockData);
  
      if (Array.isArray(updatedData)) {
        // Sau khi apply changes, gọi fetchBoardDetailsAPI để lấy dữ liệu mới nhất của board
        const refreshedBoard = await fetchBoardDetailsAPI(board._id);
  
        if (refreshedBoard) {
          setBoard({
            ...refreshedBoard,
            columns: refreshedBoard.columns.map(column => ({
              ...column,
              cards: column.cards || [] // Đảm bảo `cards` luôn tồn tại
            }))
          });
          setMockData(null); // Xóa mockData
          toast.success("Successfully applied changes and updated board");
        } else {
          throw new Error("Failed to fetch updated board details");
        }
      } else {
        throw new Error("Invalid data returned from generateColumnsAndCardsAPI");
      }
    } catch (error) {
      toast.error("Failed to apply changes or refresh board");
    }
  };
  
  
  const columnsToRender = mockData && mockData.length > 0 ? mockData : board.columns;
  return (
    <Box sx ={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "relative"

    }}>
      <Box sx = {{
        flex: "1"
      }}>
        <SortableContext sx = {{
          height: "100%"
        }} items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
        <Box
                sx={{
                  backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  '&::-webkit-scrollbar-track': { m: 2 }
                }}
              >
                {columnsToRender?.map((column) => (
                  <Column
                    board={board}
                    key={column._id}
                    column={column}
                    createNewCard={createNewCard}
                    updateColumnTitle={updateColumnTitle}
                    deleteColumnDetails={deleteColumnDetails}
                  />
                ))}


                {/* Add new column */}
                {!openNewColumnForm ? (
                  <Box
                    onClick={toggleOpenNewColumnForm}
                    sx={{
                      minWidth: '250px',
                      maxWidth: '250px',
                      mx: 2,
                      borderRadius: '6px',
                      height: 'fit-content',
                      bgcolor: '#ffffff3d'
                    }}
                  >
                    <Button
                      startIcon={<NoteAddIcon />}
                      sx={{
                        color: 'white',
                        width: '100%',
                        justifyContent: 'flex-start',
                        pl: 2.5,
                        py: 1
                      }}
                    >
                      Add New Column
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      minWidth: '250px',
                      maxWidth: '250px',
                      mx: 2,
                      p: 1,
                      borderRadius: '6px',
                      height: 'fit-content',
                      bgcolor: '#ffffff3d',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <TextField
                      label="Enter column title..."
                      type="text"
                      size="small"
                      variant="outlined"
                      autoFocus
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      sx={{
                        '& label': { color: 'white' },
                        '& input': { color: 'white' },
                        '& label.Mui-focused': { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'white' },
                          '&:hover fieldset': { borderColor: 'white' },
                          '&.Mui-focused fieldset': { borderColor: 'white' }
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        onClick={addNewColumn}
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{
                          boxShadow: 'none',
                          border: '0.5px solid',
                          borderColor: (theme) => theme.palette.success.main,
                          '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                        }}
                      >
                        Add Column
                      </Button>
                      <CloseIcon
                        fontSize="small"
                        sx={{
                          color: 'white',
                          cursor: 'pointer',
                          '&:hover': { color: (theme) => theme.palette.warning.light }
                        }}
                        onClick={toggleOpenNewColumnForm}
                      />
                    </Box>
                  </Box>
                )}
        </Box>
        </SortableContext>
      </Box>
      {mockData && mockData.length > 0 && (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 2,
      mt: 1,
      position: "absolute",
      bottom: "20px", 
      right: "10px",
      bottom:"600px"
    }}
  >
    <Button
      variant="outlined"
      color="error"
      onClick={cancelChanges}
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: (theme) => theme.palette.error.main,
        padding: '6px 18px', // Adjust padding for a more professional look
        fontSize: '0.875rem', // Slightly larger font size for readability
        textTransform: 'none',
        borderRadius: '8px', // Add rounded corners for a softer look
        '&:hover': {
          bgcolor: (theme) => theme.palette.error.light,
          borderColor: (theme) => theme.palette.error.dark,
        },
        '&:active': {
          bgcolor: (theme) => theme.palette.error.dark,
          borderColor: (theme) => theme.palette.error.main,
        }
      }}
    >
      Cancel
    </Button> 
     <Button
      variant="contained"
      color="primary"
      onClick={applyChanges}
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: (theme) => theme.palette.primary.main,
        padding: '6px 18px', // Adjust padding for a more professional look
        fontSize: '0.875rem', // Slightly larger font size for readability
        textTransform: 'none',
        borderRadius: '8px', // Add rounded corners for a softer look
        '&:hover': {
          bgcolor: (theme) => theme.palette.primary.dark,
        },
        '&:active': {
          bgcolor: (theme) => theme.palette.primary.main,
        }
      }}
    >
      Apply
    </Button> 
        </Box>
      )}
    </Box>
  );
}
export default ListColumns