import React from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  Assessment,
  List as ListIcon,
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
    { text: 'Transactions', icon: <ListIcon />, path: '/transactions' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#ffffff',
            borderRight: '1px solid #e9ecef',
            boxShadow: '2px 0 16px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Logo area — dark navy matching favicon */}
        <Box sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: 'linear-gradient(160deg, #1e2d50 0%, #090912 100%)',
        }}>
          <Box component="img" src="/favicon.svg" alt="Mindoh logo" sx={{ width: 38, height: 38 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#a3ffcb', letterSpacing: 0.5 }}>
            Mindoh
          </Typography>
        </Box>

        {/* Nav items */}
        <List sx={{ px: 1.5, pt: 2, flexGrow: 1 }}>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    pl: selected ? 1.5 : 2,
                    borderLeft: selected ? '3px solid #28C76F' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    color: selected ? '#28C76F' : '#4a5568',
                    bgcolor: selected ? 'rgba(40, 199, 111, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(40, 199, 111, 0.08)',
                      color: '#28C76F',
                      transform: 'translateX(2px)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(40, 199, 111, 0.08)',
                      '&:hover': { bgcolor: 'rgba(40, 199, 111, 0.12)' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: selected ? 600 : 500,
                      fontSize: '0.925rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* User section at bottom */}
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{
              bgcolor: '#28C76F',
              width: 36,
              height: 36,
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#fff',
            }}>
              {state.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#1a202c' }}>
                {state.user?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#718096' }}>
                Personal
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            startIcon={<Logout sx={{ fontSize: 16 }} />}
            onClick={handleLogout}
            size="small"
            sx={{
              justifyContent: 'flex-start',
              color: '#718096',
              borderRadius: 2,
              px: 1.5,
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'rgba(234, 84, 85, 0.08)',
                color: '#EA5455',
              },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: '#f4f6f9',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
