

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useNavigation } from '@react-navigation/native';
import ProgressHeader from '../components/ProgressHeader';
import MediaCard from '../components/MediaCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useOrder } from '../context/OrderContext';
import Svg, { Rect } from 'react-native-svg';
import { uploadImageToFirebaseAlt } from '../api/homeApi';

const audioRecorderPlayer = new AudioRecorderPlayer();

const MediaScreen =  () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [comment, setComment] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Media'>>();
  const { setOrder } = useOrder();
  const [recordSecs, setRecordSecs] = useState(0);
 const [isUploading, setIsUploading] = useState(false); 
  const [uploadError, setUploadError] = useState<string | null>(null);


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
    comment,
  });

  navigation.navigate('Preview');
};

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ProgressHeader currentStep={2} steps={['Получатель', 'Медиа', 'Оплата']} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📎 Прикрепите медиафайл</Text>

        <MediaCard
          title="Изображение"
          icon={require('../../assets/images/imageIcon.png')}
          hasMedia={!!imageUri}
          previewSource={require('../../assets/images/gallery.png')}
          previewUri={imageUri || undefined}
          onRemove={() => setImageUri(null)}
          onEdit={pickImage}
        />

        {/* <MediaCard
          title="Голосовое сообщение"
          icon={require('../../assets/images/audio-book.png')}
          hasMedia={!!audioUri}
          previewUri={undefined}
          onEdit={!audioUri ? recordAudio : undefined}
          onRemove={() => {
            setAudioUri(null);
            setAudioDuration(null);
          }}
        >
          {audioUri ? (
            <View style={styles.audioInfo}>
              <TouchableOpacity onPress={playAudio}>
                <Text style={styles.linkText}>▶️ Прослушать</Text>
              </TouchableOpacity>
              {audioDuration && (
                <Text style={styles.duration}>{formatDuration(audioDuration)}</Text>
              )}
            </View>
          ) : isRecording ? (
            <View style={styles.recordingContainer}>
              <ActivityIndicator size="small" color="#E53935" />
              <Text style={styles.recordingText}>
                Запись... {formatDuration(recordSecs)}
              </Text>
              <TouchableOpacity onPress={stopRecording}>
                <Text style={styles.linkText}>⏹ Остановить и прикрепить</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </MediaCard> */}

        <MediaCard title="Комментарий" icon={require('../../assets/images/comments.png')}>
          <TextInput
            style={styles.input}
            placeholder="Напишите пожелание..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
        </MediaCard>

        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => {
            handleSetOrder();
            navigation.navigate('Preview');
          }}
        >
          <Text style={styles.previewBtnText}>👀 Посмотреть как будет выглядеть открытка</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleSetOrder();
            navigation.navigate('Checkout');
          }}
        >
          <Text style={styles.buttonText}>Перейти к оплате</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 24, marginBottom: 16 },
  input: {
    backgroundColor: '#F3F3F3',
    padding: 12,
    borderRadius: 12,
    fontSize: 15,
    marginTop: 8,
    minHeight: 80,
  },
  previewBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  previewBtnText: { fontSize: 15, color: '#444' },
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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
  }
});

export default MediaScreen;