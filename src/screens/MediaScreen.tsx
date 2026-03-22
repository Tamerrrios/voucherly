import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useOrder } from '../context/OrderContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation';
import { useLocalization } from '../context/LocalizationContext';


const audioRecorderPlayer = new AudioRecorderPlayer();

const COPY = {
  ru: {
    step: 'Шаг 1 из 2',
    screenTitle: 'Персонализация подарка',
    screenSubtitle: 'Создайте особенный момент для близкого человека',
    addPhoto: 'Добавить фото',
    addPhotoSub: 'Сделайте ваш подарок незабываемым',
    senderNameLabel: 'ИМЯ ОТПРАВИТЕЛЯ',
    senderNamePlaceholder: 'Например: Темур',
    messageLabel: 'ЛИЧНОЕ СООБЩЕНИЕ',
    messagePlaceholder: 'Напишите тёплое пожелание...',
    change: 'Изменить',
    remove: 'Удалить',
    preview: 'Посмотреть превью',
    continue: 'Перейти к оплате',
  },
  uz: {
    step: '1/2-qadam',
    screenTitle: 'Sovg‘ani shaxsiylashtirish',
    screenSubtitle: 'Yaqiningiz uchun alohida lahza yarating',
    addPhoto: 'Rasm qo‘shish',
    addPhotoSub: 'Sovg‘angizni unutilmas qiling',
    senderNameLabel: 'YUBORUVCHI ISMI',
    senderNamePlaceholder: 'Masalan: Temur',
    messageLabel: 'SHAXSIY XABAR',
    messagePlaceholder: 'Samimiy tilak yozing...',
    change: 'O‘zgartirish',
    remove: 'Olib tashlash',
    preview: 'Ko‘rib chiqish',
    continue: 'To‘lovga o‘tish',
  },
  en: {
    step: 'Step 1 of 2',
    screenTitle: 'Gift Personalization',
    screenSubtitle: 'Create a special moment for your loved one',
    addPhoto: 'Add photo',
    addPhotoSub: 'Make your gift unforgettable',
    senderNameLabel: 'SENDER NAME',
    senderNamePlaceholder: 'For example: Temur',
    messageLabel: 'PERSONAL MESSAGE',
    messagePlaceholder: 'Write a warm wish...',
    change: 'Change',
    remove: 'Remove',
    preview: 'Preview',
    continue: 'Proceed to payment',
  },
} as const;

const MediaScreen = () => {
  const insets = useSafeAreaInsets();
  const { language } = useLocalization();
  const t = COPY[language];
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [comment, setComment] = useState('');
  const { setOrder } = useOrder();
  const [recordSecs, setRecordSecs] = useState(0);


  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return (
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('Ошибка запроса разрешений:', err);
        return false;
      }
    }
    return true;
  };



  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const recordAudio = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setIsRecording(true);
    setRecordSecs(0);

    await audioRecorderPlayer.startRecorder();

    audioRecorderPlayer.addRecordBackListener((e) => {
      setRecordSecs(e.currentPosition);
      return;
    });
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setAudioUri(result);
    setAudioDuration(recordSecs);
  };

  const playAudio = async () => {
    if (audioUri) {
      await audioRecorderPlayer.startPlayer(audioUri);
    }
  };

  const handleSetOrder = async () => {

    setOrder({
      imageUrl: imageUri ?? undefined,
      audioUrl: audioUri ?? undefined,
      senderName: senderName.trim() || 'Анонимный отправитель',
      comment,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerSurface}>
        <View style={styles.headerGlassLayer} pointerEvents="none" />

        <View style={[styles.topHeaderRow, { paddingTop: insets.top + 8 }]}> 
          <BackButton onPress={() => Navigation.goBack()} size={36} iconSize={16} />
          <View style={styles.topHeaderTextWrap}>
            <Text style={styles.screenTitle}>{t.screenTitle}</Text>
            <Text style={styles.screenSubtitle}>{t.screenSubtitle}</Text>
          </View>
          <View style={styles.topHeaderSpacer} />
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepLabel}>{t.step}</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.headerSeparator} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          <View style={styles.senderCard}>
            <Text style={styles.messageLabel}>{t.senderNameLabel}</Text>
            <View style={styles.messageInputShell}>
              <TextInput
                style={styles.senderInput}
                placeholder={t.senderNamePlaceholder}
                placeholderTextColor="#A6A8AE"
                value={senderName}
                onChangeText={setSenderName}
                maxLength={60}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.photoHero, imageUri ? styles.photoHeroActive : null]}
            onPress={pickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.iconHalo}>
                <Ionicons name="image-outline" size={34} color="#DD7368" />
              </View>
            )}

            <Text style={styles.photoTitle}>{t.addPhoto}</Text>
            <Text style={styles.photoSubtitle}>{t.addPhotoSub}</Text>

            {imageUri ? (
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoActionBtn} onPress={pickImage}>
                  <Text style={styles.photoActionText}>{t.change}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoActionBtn}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.photoActionText}>{t.remove}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </TouchableOpacity>

          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>{t.messageLabel}</Text>
            <View style={styles.messageInputShell}>
              <TextInput
                style={styles.input}
                placeholder={t.messagePlaceholder}
                placeholderTextColor="#A6A8AE"
                value={comment}
                onChangeText={setComment}
                multiline
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => {
              handleSetOrder();
              Navigation.navigate(Routes.MediaPreview);
            }}
          >
            <Ionicons name="eye-outline" size={18} color="#4A5160" style={styles.previewIcon} />
            <Text style={styles.previewBtnText}>{t.preview}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.ctaArea, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleSetOrder();
            Navigation.navigate(Routes.Checkout);
          }}
        >
          <Text style={styles.buttonText}>{t.continue}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerSurface: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 7,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  stepContainer: {
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E818A',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E8E9ED',
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#E53935',
  },
  topHeaderRow: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,126,138,0.25)',
  },
  topHeaderTextWrap: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  topHeaderSpacer: {
    width: 36,
    height: 36,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#23242A',
    textAlign: 'center',
  },
  screenSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#7D8088',
    lineHeight: 18,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },
  contentContainer: {
    paddingTop: 34,
    paddingBottom: 24,
  },
  mainCard: {
    borderRadius: 30,
    backgroundColor: '#FCFCFC',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  photoHero: {
    borderRadius: 28,
    backgroundColor: '#F4F6FA',
    minHeight: 300,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E7EF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  photoHeroActive: {
    borderColor: '#DDA09A',
    shadowOpacity: 0.08,
  },
  photoPreview: {
    width: '100%',
    height: 170,
    borderRadius: 20,
    marginBottom: 16,
  },
  iconHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF3F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  photoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22232A',
    marginBottom: 6,
  },
  photoSubtitle: {
    fontSize: 15,
    color: '#7D8088',
    textAlign: 'center',
    marginBottom: 10,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  senderCard: {
    borderRadius: 22,
    backgroundColor: '#F4F6FA',
    borderWidth: 1,
    borderColor: '#E2E7EF',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  senderInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
    minHeight: 46,
    color: '#22242A',
  },
  photoActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F5F6F8',
  },
  photoActionText: {
    color: '#5F636B',
    fontSize: 13,
    fontWeight: '600',
  },
  messageCard: {
    marginTop: 30,
    borderRadius: 22,
    backgroundColor: '#F4F6FA',
    borderWidth: 1,
    borderColor: '#E2E7EF',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#646B78',
    marginBottom: 13,
  },
  messageInputShell: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DFE8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
    minHeight: 104,
    color: '#22242A',
    lineHeight: 23,
    textAlignVertical: 'top',
  },
  previewBtn: {
    marginTop: 28,
    minHeight: 56,
    borderRadius: 17,
    backgroundColor: '#FEFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderColor: '#D9DDE5',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },
  previewIcon: {
    marginRight: 8,
  },
  previewBtnText: {
    fontSize: 15,
    color: '#454C5B',
    fontWeight: '700',
  },
  ctaArea: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  button: {
    backgroundColor: '#E53935',
    minHeight: 62,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  audioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  recordingContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  recordingText: {
    color: '#E53935',
    fontSize: 16,
    marginVertical: 8,
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default MediaScreen;