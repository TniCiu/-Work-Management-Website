import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { styled } from '@mui/system';

const StyledMenu = styled(Menu)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  padding: 0,
  '& .MuiMenuItem-root': {
    borderRadius: '8px',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .MuiDivider-root': {
    margin: '8px 0',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

function Templates() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mock data for templates
  const templates = [
    { name: "1-on-1 Meeting Agenda", icon: <CheckIcon /> },
    { name: "Agile Board Template", icon: <CheckIcon /> },
    { name: "Company Overview", icon: <CheckIcon /> },
    { name: "Design Huddle", icon: <CheckIcon /> },
    { name: "Go To Market Strategy Template", icon: <CheckIcon /> },
    { name: "Kanban Template", icon: <CheckIcon /> },
    { name: "Project Management", icon: <CheckIcon /> },
    { name: "Remote Team Meetings", icon: <CheckIcon /> },
    { name: "Simple Project Board", icon: <CheckIcon /> },
    { name: "Teaching: Weekly Planning", icon: <CheckIcon /> },
  ];

  return (
    <Box>
      <StyledButton
        id="basic-button-templates"
        aria-controls={open ? 'basic-menu-templates' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Templates
      </StyledButton>
      
      <StyledMenu
        id="basic-menu-templates"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-templates',
        }}
      >
        <MenuItem disabled>
          <ListItemText>Template</ListItemText>
        </MenuItem>
        <Divider />
        {templates.map((template, index) => (
          <MenuItem key={index}>
            <ListItemIcon>{template.icon}</ListItemIcon>
            <ListItemText>
              {`Ý tưởng ${index + 1}: ${template.name}`}
            </ListItemText>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem>
        </MenuItem>
        <MenuItem>
        </MenuItem>
      </StyledMenu>
    </Box>
  );
}

export default Templates;
