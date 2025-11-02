import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { bookingAPI } from '../services/api';
import { COLORS } from '../utils/constants';

const BookingScreen = ({ route, navigation }) => {
  const { caretaker } = route.params;
  const [formData, setFormData] = useState({
    serviceType: caretaker.specialization === 'both' ? 'child-care' : caretaker.specialization,
    startDate: '',
    hours: '',
    address: '',
    specialRequirements: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const hours = parseFloat(formData.hours) || 0;
    return hours * caretaker.hourlyRate;
  };

  const handleSubmit = async () => {
    const { serviceType, startDate, hours, address } = formData;

    if (!startDate || !hours || !address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (parseFloat(hours) <= 0) {
      Alert.alert('Error', 'Hours must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        caretakerId: caretaker._id,
        serviceType,
        startDate: new Date(startDate),
        endDate: new Date(new Date(startDate).getTime() + parseFloat(hours) * 60 * 60 * 1000),
        hours: parseFloat(hours),
        address: { street: address },
        specialRequirements: formData.specialRequirements
      };

      await bookingAPI.create(bookingData);
      
      Alert.alert(
        'Success',
        'Booking created successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book {caretaker.name}</Text>
        <Text style={styles.subtitle}>Fill in the booking details</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Service Type *</Text>
          <View style={styles.radioContainer}>
            {caretaker.specialization === 'both' ? (
              <>
                <TouchableOpacity
                  style={[styles.radioButton, formData.serviceType === 'child-care' && styles.radioActive]}
                  onPress={() => handleChange('serviceType', 'child-care')}
                >
                  <Text style={[styles.radioText, formData.serviceType === 'child-care' && styles.radioTextActive]}>
                    Child Care
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, formData.serviceType === 'elderly-care' && styles.radioActive]}
                  onPress={() => handleChange('serviceType', 'elderly-care')}
                >
                  <Text style={[styles.radioText, formData.serviceType === 'elderly-care' && styles.radioTextActive]}>
                    Elderly Care
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.infoText}>
                {caretaker.specialization === 'child-care' ? 'Child Care' : 'Elderly Care'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date & Time *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM (e.g., 2025-11-01 09:00)"
            value={formData.startDate}
            onChangeText={(value) => handleChange('startDate', value)}
          />
          <Text style={styles.hint}>Format: YYYY-MM-DD HH:MM</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (Hours) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of hours"
            value={formData.hours}
            onChangeText={(value) => handleChange('hours', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Service Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter complete address"
            value={formData.address}
            onChangeText={(value) => handleChange('address', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Special Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requirements or instructions"
            value={formData.specialRequirements}
            onChangeText={(value) => handleChange('specialRequirements', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Caretaker:</Text>
            <Text style={styles.summaryValue}>{caretaker.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hourly Rate:</Text>
            <Text style={styles.summaryValue}>₹{caretaker.hourlyRate}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hours:</Text>
            <Text style={styles.summaryValue}>{formData.hours || 0}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Booking...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingTop: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9
  },
  form: {
    padding: 20
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: COLORS.white
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  hint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4
  },
  radioContainer: {
    flexDirection: 'row'
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white
  },
  radioActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  radioText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600'
  },
  radioTextActive: {
    color: COLORS.white
  },
  infoText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600'
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: 10
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default BookingScreen;