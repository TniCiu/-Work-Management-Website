import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Popover,
  TextField,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LabelIcon from '@mui/icons-material/Label';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

const rightPaneStyle = {
  width: '200px',
  display: 'flex',
  flexDirection: 'column',
};

const optionButtonStyle = {
  justifyContent: 'flex-start',
  marginBottom: '8px',
  marginLeft: '8px',
  color: '#333333',
  fontSize: '12.5px',
};

const CardInformationRightPane = ({ board, card, handleCoverButtonClick }) => {
  const [anchorEl, setAnchorEl] = useState(null); // Quản lý vị trí Popover
  const [checklistTitle, setChecklistTitle] = useState(""); // Tên checklist
  const [copyItems, setCopyItems] = useState(""); // Nhập items để copy

  // Mở Popover
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // Thêm Checklist
  const handleAddChecklist = () => {
    console.log("Checklist Title:", checklistTitle);
    console.log("Copy Items:", copyItems);
    // Thêm logic xử lý lưu checklist tại đây
    handleClosePopover();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'checklist-popover' : undefined;

  return (
    <Box sx={rightPaneStyle}>
      <Typography
        variant="h6"
        component="h3"
        sx={{
          color: '#0984e3',
          justifyContent: 'flex-start',
          marginBottom: '8px',
          marginLeft: '8px',
          fontSize: '0.875rem',
        }}
      >
        Add To Card
      </Typography>
      <Button sx={optionButtonStyle} startIcon={<GroupIcon />}>
        Join
      </Button>
      <Button
        sx={optionButtonStyle}
        startIcon={<AddPhotoAlternateIcon />}
        onClick={handleCoverButtonClick}
      >
        Cover
      </Button>
      <Button sx={optionButtonStyle} startIcon={<LabelIcon />}>
        Labels
      </Button>
      <Button
        sx={optionButtonStyle}
        startIcon={<ChecklistIcon />}
        onClick={handleOpenPopover}
      >
        Checklist
      </Button>

      {/* Popover Form Checklist */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '-10px',
              transform: 'translateY(-50%)',
              width: '0',
              height: '0',
              borderStyle: 'solid',
              borderWidth: '10px 10px 10px 0',
              borderColor: 'transparent #fff transparent transparent',
              zIndex: 1,
            },
          },
        }}
      >
        <Box sx={{ padding: 2, width: '300px' }}>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            Add Checklist
          </Typography>
          <TextField
            label="Title"
            fullWidth
            value={checklistTitle}
            onChange={(e) => setChecklistTitle(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="items"
            fullWidth
            value={copyItems}
            onChange={(e) => setCopyItems(e.target.value)}
            multiline
            rows={3}
            placeholder="Enter items separated by commas"
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={handleAddChecklist}
          >
            Add
          </Button>
        </Box>
      </Popover>

      <Button startIcon={<AttachFileIcon />} fullWidth sx={optionButtonStyle}>
        Attachment
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography
        variant="h6"
        component="h3"
        sx={{
          color: '#0984e3',
          justifyContent: 'flex-start',
          marginBottom: '8px',
          marginLeft: '8px',
          fontSize: '0.875rem',
        }}
      >
        Power-Ups
      </Typography>
      <Button startIcon={<AspectRatioIcon />} fullWidth sx={optionButtonStyle}>
        Card Size
      </Button>
      <Button startIcon={<AddToDriveIcon />} fullWidth sx={optionButtonStyle}>
        Google Drive
      </Button>
      <Button fullWidth sx={optionButtonStyle}>
        + Add Power-Ups
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography
        variant="h6"
        component="h3"
        sx={{
          color: '#0984e3',
          justifyContent: 'flex-start',
          marginBottom: '8px',
          marginLeft: '8px',
          fontSize: '0.875rem',
        }}
      >
        Actions
      </Typography>
      <Button startIcon={<ContentCopyIcon />} fullWidth sx={optionButtonStyle}>
        Copy
      </Button>
      <Button startIcon={<AcUnitIcon />} fullWidth sx={optionButtonStyle}>
        Make Template
      </Button>
      <Button startIcon={<MoveToInboxIcon />} fullWidth sx={optionButtonStyle}>
        Archive
      </Button>
    </Box>
  );
};

export default CardInformationRightPane;
