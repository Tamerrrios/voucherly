// VoucherCodeModal.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import Clipboard from '@react-native-clipboard/clipboard';

interface VoucherCodeModalProps {
  visible: boolean;
  code: string | null;
  onClose: () => void;
}

const VoucherCodeModal: React.FC<VoucherCodeModalProps> = ({ visible, code, onClose }) => {
  if (!code) return null;

  const handleCopy = () => {
    Clipboard.setString(code);
    Alert.alert('Скопировано', `Код: ${code}`);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <View style={styles.content}>
        <Text style={styles.title}>Код ваучера</Text>
        <View style={styles.codeBox}>
          <Text style={styles.code}>{code}</Text>
        </View>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Text style={styles.copyText}>Скопировать</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default VoucherCodeModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  codeBox: {
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 20,
  },
  code: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  copyButton: {
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  copyText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 16,
    color: '#666',
  },
});
