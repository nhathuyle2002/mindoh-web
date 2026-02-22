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
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

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
          background: COLORS.gradients.primary,
          color: COLORS.text.secondary,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Mindoh Finance'}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ 
              bgcolor: '#81FBB8', 
              width: 40, 
              height: 40,
              border: '2px solid #28C76F',
              fontWeight: 600,
              color: '#1a202c',
            }}>
              {state.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, color: '#2d3748' }}>
              {state.user?.username}
            </Typography>
            <Button 
              startIcon={<Logout />} 
              onClick={handleLogout}
              sx={{
                bgcolor: '#ffffff',
                color: '#2d3748',
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#f7fafc',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
            background: COLORS.gradients.sidebar,
            color: COLORS.text.secondary,
            borderRight: `1px solid ${COLORS.background.border}`,
            boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
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
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: 2,
          m: 2,
          mb: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <Box component="img" src="/favicon.svg" alt="Mindoh logo" sx={{ width: 36, height: 36 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#2d3748', letterSpacing: 1 }}>
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
                  color: '#4a5568',
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, #81FBB8 0%, #28C76F 100%)',
                    color: '#1a202c',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(40, 199, 111, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #81FBB8 0%, #28C76F 100%)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(129, 251, 184, 0.15)',
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
          background: '#f8f9fa',
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
