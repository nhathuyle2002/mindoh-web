import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Button,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Assessment,
  List as ListIcon,
  Logout,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Summary', icon: <Assessment />, path: '/summary' },
    { text: 'Transactions', icon: <ListIcon />, path: '/transactions' },
  ];

  // Drawer content (used for mobile hamburger menu)
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{
        px: 2.5, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 1.5,
        background: 'linear-gradient(160deg, #1e2d50 0%, #090912 100%)',
      }}>
        <Box component="img" src="/favicon.svg" alt="Mindoh logo" sx={{ width: 36, height: 36 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#a3ffcb', letterSpacing: 0.5 }}>
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
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                sx={{
                  borderRadius: 2,
                  pl: selected ? 1.5 : 2,
                  borderLeft: selected ? '3px solid #28C76F' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  color: selected ? '#28C76F' : '#4a5568',
                  bgcolor: selected ? 'rgba(40,199,111,0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(40,199,111,0.08)', color: '#28C76F' },
                  '&.Mui-selected': { bgcolor: 'rgba(40,199,111,0.08)' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: selected ? 600 : 500, fontSize: '0.925rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User section */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: '#28C76F', width: 34, height: 34, fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            {state.user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#1a202c' }}>
              {state.user?.name || state.user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: '#718096' }}>
              @{state.user?.username}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => { navigate('/settings'); setDrawerOpen(false); }}
            sx={{ color: '#718096', '&:hover': { color: '#28C76F' } }}>
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Button
          fullWidth size="small"
          startIcon={<Logout sx={{ fontSize: 16 }} />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start', color: '#718096', borderRadius: 2, px: 1.5, fontWeight: 500,
            '&:hover': { bgcolor: 'rgba(234,84,85,0.08)', color: '#EA5455' },
          }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Top AppBar ── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'linear-gradient(160deg, rgba(30,45,80,0.92) 0%, rgba(9,9,18,0.92) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Hamburger — always visible */}
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(true)}
            sx={{ color: 'rgba(255,255,255,0.8)', mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box component="img" src="/favicon.svg" alt="logo"
            sx={{ width: 28, height: 28, cursor: 'pointer' }}
            onClick={() => navigate('/summary')}
          />
          <Typography
            variant="h6"
            onClick={() => navigate('/summary')}
            sx={{ fontWeight: 800, color: '#a3ffcb', letterSpacing: 0.3, cursor: 'pointer', flexGrow: 1 }}
          >
            Mindoh
          </Typography>

          {/* Right side: settings + logout */}
          <IconButton size="small" onClick={() => navigate('/settings')}
            sx={{ color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#a3ffcb' } }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleLogout}
            sx={{ color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#EA5455' } }}>
            <Logout fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ── Navigation drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="temporary"
        anchor="left"
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRight: '1px solid #e9ecef',
            boxShadow: '4px 0 24px rgba(0,0,0,0.10)',
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Page content ── */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f4f6f9', pt: { xs: '56px', sm: '64px' } }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
