import { useContext, useState } from 'react';
import {
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
    city: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone, city } = formData;

    if (!name || !email || !password || !phone || !city) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      password,
      phone,
      address: { city }
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
    } else {
      Alert.alert('Success', 'Account created successfully!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our caretaker service</Text>
        </View>

        <View style={styles.form}>
          {['name', 'email', 'phone', 'city', 'password', 'confirmPassword'].map((field, index) => (
            <View style={styles.inputContainer} key={index}>
              <Text style={styles.label}>
                {field === 'confirmPassword' ? 'Confirm Password' :
                 field.charAt(0).toUpperCase() + field.slice(1)}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter your ${field}`}
                value={formData[field]}
                onChangeText={(value) => handleChange(field, value)}
                secureTextEntry={field.toLowerCase().includes('password')}
                keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                autoCapitalize={field === 'email' ? 'none' : 'sentences'}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold'
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center'
  },
  linkText: {
    color: COLORS.gray,
    fontSize: 14
  },
  linkBold: {
    color: COLORS.primary,
    fontWeight: 'bold'
  }
});

export default RegisterScreen;
