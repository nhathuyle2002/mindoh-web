import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Summary from './components/Summary';
import Layout from './components/Layout';
import AddExpense from './components/AddExpense';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Summary />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/summary" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
