import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { Text } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// User Screens
import BookingScreen from '../screens/BookingScreen';
import CaretakerDetailScreen from '../screens/CaretakerDetailScreen';
import CaretakerSearchScreen from '../screens/CaretakerSearchScreen';
import HomeScreen from '../screens/HomeScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Admin Screens
import AdminCaretakersScreen from '../screens/AdminCaretakersScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// User Tab Navigator
const UserTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray,
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
      }}
    />
    <Tab.Screen
      name="CaretakerSearch"
      component={CaretakerSearchScreen}
      options={{
        tabBarLabel: 'Search',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>🔍</Text>,
      }}
    />
    <Tab.Screen
      name="MyBookings"
      component={MyBookingsScreen}
      options={{
        tabBarLabel: 'Bookings',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>📅</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray,
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="AdminDashboard"
      component={AdminDashboardScreen}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
      }}
    />
    <Tab.Screen
      name="AdminCaretakers"
      component={AdminCaretakersScreen}
      options={{
        tabBarLabel: 'Caretakers',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Sign Up' }}
          />
        </>
      ) : user.role === 'admin' ? (
        <>
          <Stack.Screen
            name="AdminTabs"
            component={AdminTabs}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="UserTabs"
            component={UserTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CaretakerDetail"
            component={CaretakerDetailScreen}
            options={{ title: 'Caretaker Details' }}
          />
          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{ title: 'Book Service' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
