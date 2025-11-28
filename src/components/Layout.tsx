import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Stack,
} from '@mui/material';
import {
  Assessment,
  List as ListIcon,
  AccountBalance,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Summary', icon: <Assessment />, path: '/summary' },
    { text: 'Transactions', icon: <ListIcon />, path: '/dashboard' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Mindoh Finance'}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {state.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {state.user?.username}
            </Typography>
            <Button startIcon={<Logout />} onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1e293b',
            color: 'white',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance sx={{ color: 'primary.light', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Mindoh
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 600 : 400 
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          pt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
