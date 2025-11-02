import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../utils/constants';

const LoadingSpinner = ({ size = 'large', color = COLORS.primary }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white
  }
});

export default LoadingSpinner;