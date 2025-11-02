import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI } from '../services/api';
import { COLORS } from '../utils/constants';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: COLORS.primary },
    { title: 'Total Caretakers', value: stats?.totalCaretakers || 0, icon: '👨‍⚕️', color: COLORS.secondary },
    { title: 'Approved', value: stats?.approvedCaretakers || 0, icon: '✅', color: COLORS.success },
    { title: 'Pending', value: stats?.pendingCaretakers || 0, icon: '⏳', color: COLORS.warning },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: '📅', color: COLORS.primary },
    { title: 'Active', value: stats?.activeBookings || 0, icon: '🔄', color: COLORS.success }
  ];

  const menuItems = [
    {
      title: 'Manage Caretakers',
      subtitle: 'View, approve, and manage caretakers',
      icon: '👨‍⚕️',
      route: 'AdminCaretakers',
      color: COLORS.primary
    },
    {
      title: 'View Users',
      subtitle: 'See all registered users',
      icon: '👥',
      route: 'AdminUsers',
      color: COLORS.secondary
    },
    {
      title: 'View Bookings',
      subtitle: 'Monitor all bookings',
      icon: '📅',
      route: 'AdminBookings',
      color: COLORS.warning
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage your caretaker service</Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: '2%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 8
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600'
  },
  menuSection: {
    padding: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  menuIcon: {
    fontSize: 35,
    marginRight: 15
  },
  menuContent: {
    flex: 1
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.gray
  },
  arrow: {
    fontSize: 30,
    color: COLORS.gray
  }
});

export default AdminDashboardScreen;