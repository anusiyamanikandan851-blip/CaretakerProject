import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EmergencyButton from '../components/EmergencyButton';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const menuItems = [
    {
      title: 'Search Caretakers',
      icon: '🔍',
      description: 'Find the best caretakers for your needs',
      route: 'CaretakerSearch',
      color: COLORS.primary
    },
    {
      title: 'My Bookings',
      icon: '📅',
      description: 'View and manage your bookings',
      route: 'MyBookings',
      color: COLORS.secondary
    },
    {
      title: 'Profile',
      icon: '👤',
      description: 'View and edit your profile',
      route: 'Profile',
      color: COLORS.warning
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.userName}>{user?.name}!</Text>
      </View>

      <View style={styles.emergencyContainer}>
        <EmergencyButton />
        <Text style={styles.emergencyText}>24/7 Emergency Support</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Why Choose Us?</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoText}>Verified & Trusted Caretakers</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoText}>Background Checked Professionals</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoText}>Real-time Location Tracking</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoText}>24/7 Customer Support</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 25,
    paddingTop: 40
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white
  },
  emergencyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10
  },
  emergencyText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.gray
  },
  menuContainer: {
    padding: 15
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  menuIcon: {
    fontSize: 40,
    marginRight: 15
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center'
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4
  },
  menuDescription: {
    fontSize: 13,
    color: COLORS.gray
  },
  infoSection: {
    padding: 15,
    paddingBottom: 30
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  infoIcon: {
    fontSize: 20,
    color: COLORS.success,
    marginRight: 12,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 15,
    color: COLORS.dark,
    flex: 1
  }
});

export default HomeScreen;