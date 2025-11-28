import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Mindoh Finance'}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 40, 
              height: 40,
              border: '2px solid rgba(255,255,255,0.3)',
              fontWeight: 600,
            }}>
              {state.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
              {state.user?.username}
            </Typography>
            <Button 
              startIcon={<Logout />} 
              onClick={handleLogout}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                },
              }}
            >
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
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 2,
          m: 2,
          mb: 3,
        }}>
          <AccountBalance sx={{ color: '#667eea', fontSize: 36 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: 1 }}>
            Mindoh
          </Typography>
        </Box>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                    borderLeft: '4px solid #667eea',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.12) 100%)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem',
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
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
