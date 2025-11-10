import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    try {
      console.log('📝 Starting registration process...');
      const { name, email, password, confirmPassword, phone, city } = formData;

      console.log('Received form data:', {
        name,
        email,
        phone,
        city,
        hasPassword: !!password
      });

      // Validate fields
      if (!name?.trim() || !email?.trim() || !password?.trim() ||
          !confirmPassword?.trim() || !phone?.trim() || !city?.trim()) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      console.log('✅ Validation passed, sending registration request...');
      setLoading(true);

      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        address: { city: city.trim() },
        role: 'user'
      };

      console.log('🔄 Registration Process:');
      console.log('1. Formatted User Data:', { ...userData, password: '[HIDDEN]' });

      const result = await register(userData);

      if (result.success) {
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  phone: '',
                  city: '',
                });
                navigation.replace('Login'); // Navigate to sign-in screen
              }
            }
          ],
          { cancelable: false }
        );
      } else if (result.message?.includes('already exists')) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Please login instead.',
          [{
            text: 'Go to Login',
            onPress: () => navigation.replace('Login')
          }]
        );
      } else {
        const errorMessage = result.message || 'Registration failed. Please try again.';
        console.error('❌ Registration failed:', errorMessage);
        Alert.alert('Registration Failed', errorMessage);
      }
    } catch (error) {
      console.error('❌ Registration Error:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our caretaker service</Text>
          </View>

          {/* Card container */}
          <View style={styles.card}>
            <View style={styles.form}>
              {[
                { key: 'name', label: 'Full Name' },
                { key: 'email', label: 'Email', keyboard: 'email-address' },
                { key: 'phone', label: 'Phone', keyboard: 'phone-pad' },
                { key: 'city', label: 'City' },
                { key: 'password', label: 'Password', secure: true },
                { key: 'confirmPassword', label: 'Confirm Password', secure: true },
              ].map(({ key, label, keyboard, secure }) => (
                <View style={styles.inputContainer} key={key}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                    value={formData[key]}
                    onChangeText={value => handleChange(key, value)}
                    keyboardType={keyboard || 'default'}
                    secureTextEntry={secure}
                    autoCapitalize={key === 'email' ? 'none' : 'sentences'}
                  />
                </View>
              ))}

              {/* Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already have an account?{' '}
                  <Text style={styles.linkBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Table Section */}
          <View style={styles.table}>
            <Text style={styles.tableTitle}>Your Entered Details</Text>
            {[
              { label: 'Full Name', value: formData.name },
              { label: 'Email', value: formData.email },
              { label: 'Phone', value: formData.phone },
              { label: 'City', value: formData.city },
              { label: 'Password', value: formData.password ? '••••••' : '' },
            ].map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>{item.label}</Text>
                <Text style={styles.tableCellValue}>{item.value || '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  container: {
    minHeight: '100%',
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    marginVertical: 15,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }
      : Platform.OS === 'android'
      ? { elevation: 2 }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        }),
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  linkBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    marginTop: 15,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }
      : {}),
  },
  tableTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
    padding: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableCellLabel: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  tableCellValue: {
    color: COLORS.gray,
  },
});
