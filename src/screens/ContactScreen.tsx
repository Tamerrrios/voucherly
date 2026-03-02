
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
import Contacts from 'react-native-contacts';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressHeader from '../components/ProgressHeader';
import { useOrder } from '../context/OrderContext';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation';
import { useLocalization } from '../context/LocalizationContext';

const ContactScreen = () => {
  const { language } = useLocalization();
  const [phone, setPhone] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const navigation = useNavigation();
  const { setOrder } = useOrder();
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const copy = {
    ru: {
      noAccess: 'Нет доступа',
      allowContacts: 'Разрешите доступ к контактам в настройках телефона.',
      error: 'Ошибка',
      loadFailed: 'Не удалось загрузить контакты',
      title: '📱 Укажите получателя',
      placeholder: 'Введите номер телефона',
      contacts: 'Контакты из телефона',
      noNumber: 'Нет номера',
      noName: 'Без имени',
      continue: 'Продолжить',
      steps: ['Медиа', 'Оплата', 'Поделиться'],
    },
    uz: {
      noAccess: 'Ruxsat yo‘q',
      allowContacts: 'Telefon sozlamalarida kontaktlarga ruxsat bering.',
      error: 'Xatolik',
      loadFailed: 'Kontaktlarni yuklab bo‘lmadi',
      title: '📱 Qabul qiluvchini kiriting',
      placeholder: 'Telefon raqamini kiriting',
      contacts: 'Telefon kontaktlari',
      noNumber: 'Raqam yo‘q',
      noName: 'Nomsiz',
      continue: 'Davom etish',
      steps: ['Media', 'To‘lov', 'Ulashish'],
    },
    en: {
      noAccess: 'No access',
      allowContacts: 'Allow access to contacts in phone settings.',
      error: 'Error',
      loadFailed: 'Unable to load contacts',
      title: '📱 Enter recipient',
      placeholder: 'Enter phone number',
      contacts: 'Phone contacts',
      noNumber: 'No number',
      noName: 'No name',
      continue: 'Continue',
      steps: ['Media', 'Payment', 'Share'],
    },
  }[language];


  const isUzbekPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return /^998[0-9]{9}$/.test(cleaned);
  };

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const permission = await Contacts.checkPermission();

      if (permission === 'undefined') {
        const result = await Contacts.requestPermission();
        if (result !== 'authorized') {
          Alert.alert(
            copy.noAccess,
            copy.allowContacts
          );
          return;
        }
      } else if (permission === 'denied') {
        Alert.alert(
          copy.noAccess,
          copy.allowContacts
        );
        return;
      }

      // Используем getAll() вместо getContactsMatchingString('')
      const data = await Contacts.getAll();

      // Фильтруем контакты, у которых есть номера телефонов
      const filtered = data.filter(
        (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
      );

      console.log('Загружено контактов:', filtered.length); 
      setContacts(filtered);
    } catch (err) {
      console.error('Ошибка при получении контактов:', err);
      Alert.alert(copy.error, copy.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);


  const handleNext = () => {
    if (phone.trim()) {
      setOrder({ receiverPhone: phone });
      Navigation.navigate(Routes.MediaScreen);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ProgressHeader currentStep={1} steps={copy.steps} />

      <Text style={styles.title}>{copy.title}</Text>

      <View style={{ position: 'relative', marginHorizontal: 0 }}>
        <TextInput
          style={styles.input}
          placeholder={copy.placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {phone.length > 0 && (
          <TouchableOpacity
            onPress={() => setPhone('')}
            style={styles.clearIcon}
          >
            <Text style={{ fontSize: 16, color: '#999' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>{copy.contacts}</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.recordID}
        renderItem={({ item }) => {
          const name =
            item.displayName || `${item.givenName || ''} ${item.familyName || ''}`.trim();

          const phone = item.phoneNumbers?.[0]?.number || copy.noNumber;

          return (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => setPhone(phone)}
            >
              <View style={styles.contactText}>
                <Text style={styles.contactName}>{name || copy.noName}</Text>
                <Text style={styles.contactPhone}>{phone}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        style={{ marginBottom: 30 }}
      />
      <TouchableOpacity
        style={[
          styles.button,
          (!isUzbekPhone(phone) || phone.trim() === '') && styles.buttonDisabled
        ]}
        onPress={handleNext}
        disabled={!isUzbekPhone(phone)}
      >
        <Text style={styles.buttonText}>{copy.continue}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  input: {
    borderColor: '#1C1C1E',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    paddingRight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  contactText: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    color: '#888',
  },
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
    marginHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  profileIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
  },
  clearIcon: {
    position: 'absolute',
    right: 30,
    top: 14,
    padding: 5,
  },

});

export default ContactScreen;


