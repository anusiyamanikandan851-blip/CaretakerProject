// Change this to your computer's IP address when testing on physical device
// For iOS simulator use: http://localhost:5000
// For Android emulator use: http://10.0.2.2:5000
// For physical device use: http://YOUR_IP_ADDRESS:5000

export const API_URL = 'http://10.1.50.37:5000/api';


export const COLORS = {
  primary: '#4A90E2',
  secondary: '#50C878',
  danger: '#E74C3C',
  warning: '#F39C12',
  dark: '#2C3E50',
  light: '#ECF0F1',
  white: '#FFFFFF',
  gray: '#95A5A6',
  success: '#27AE60'
};

export const SPECIALIZATIONS = [
  { label: 'Child Care', value: 'child-care' },
  { label: 'Elderly Care', value: 'elderly-care' },
  { label: 'Both', value: 'both' }
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};