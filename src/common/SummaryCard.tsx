import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { COLORS, BOX_SHADOWS } from '../constants/colors';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'income' | 'expense' | 'balance-positive' | 'balance-negative' | 'primary';
  breakdown?: Array<{ label: string; value: string }>;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, type, breakdown }) => {
  const getGradient = () => {
    switch (type) {
      case 'income':
        return COLORS.gradients.income;
      case 'expense':
        return COLORS.gradients.expense;
      case 'balance-positive':
        return COLORS.gradients.balancePositive;
      case 'balance-negative':
        return COLORS.gradients.balanceNegative;
      default:
        return COLORS.gradients.primary;
    }
  };

  const getShadow = () => {
    switch (type) {
      case 'income':
        return BOX_SHADOWS.income;
      case 'expense':
        return BOX_SHADOWS.expense;
      case 'balance-positive':
        return BOX_SHADOWS.balancePositive;
      case 'balance-negative':
        return BOX_SHADOWS.balanceNegative;
      default:
        return BOX_SHADOWS.card;
    }
  };

  const getHoverShadow = () => {
    switch (type) {
      case 'income':
        return BOX_SHADOWS.incomeHover;
      case 'expense':
        return BOX_SHADOWS.expenseHover;
      case 'balance-positive':
        return BOX_SHADOWS.balancePositiveHover;
      case 'balance-negative':
        return BOX_SHADOWS.balanceNegativeHover;
      default:
        return BOX_SHADOWS.cardHover;
    }
  };

  return (
    <Card
      sx={{
        flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
        minWidth: '280px',
        background: getGradient(),
        color: COLORS.text.primary,
        borderRadius: 3,
        boxShadow: getShadow(),
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: getHoverShadow(),
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.text.primary }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: COLORS.text.tertiary, fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(26, 32, 44, 0.1)', width: 48, height: 48, color: COLORS.text.primary }}>
            {icon}
          </Avatar>
        </Box>
        {breakdown && breakdown.length > 0 && (
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: `2px solid rgba(26, 32, 44, 0.1)`,
            }}
          >
            <Typography variant="caption" sx={{ color: COLORS.text.tertiary, mb: 1.5, display: 'block', fontWeight: 500 }}>
              By Currency:
            </Typography>
            {breakdown.map((item, index) => (
              <Box key={index} display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
