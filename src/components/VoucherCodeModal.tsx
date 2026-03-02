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
import { useLocalization } from '../context/LocalizationContext';

interface VoucherCodeModalProps {
  visible: boolean;
  code?: string | null;
  onClose: () => void;

  // кастомизация текста
  title?: string;
  description?: string;

  // управление UI
  showCodeBox?: boolean;
  showCopyButton?: boolean;
  showBottomCloseButton?: boolean;
  allowBackdropClose?: boolean;

  // кастомизация подписей
  copyButtonLabel?: string;
  closeButtonLabel?: string;

  // колбэки
  onCopied?: (code: string) => void;
}

const VoucherCodeModal: React.FC<VoucherCodeModalProps> = ({
  visible,
  code,
  onClose,

  title,
  description,

  showCodeBox = true,
  showCopyButton = true,
  showBottomCloseButton = true,
  allowBackdropClose = true,

  copyButtonLabel,
  closeButtonLabel,

  onCopied,
}) => {
  const { language } = useLocalization();
  const defaults = {
    ru: { title: 'Код ваучера', copy: 'Скопировать', close: 'Закрыть', copied: 'Скопировано', code: 'Код' },
    uz: { title: 'Vaucher kodi', copy: 'Nusxalash', close: 'Yopish', copied: 'Nusxalandi', code: 'Kod' },
    en: { title: 'Voucher Code', copy: 'Copy', close: 'Close', copied: 'Copied', code: 'Code' },
  }[language];
  const hasCode = !!code;

  const resolvedTitle = title ?? defaults.title;
  const resolvedCopyButton = copyButtonLabel ?? defaults.copy;
  const resolvedCloseButton = closeButtonLabel ?? defaults.close;

  const handleCopy = () => {
    if (!code) return;
    Clipboard.setString(code);
    onCopied?.(code);
    Alert.alert(defaults.copied, `${defaults.code}: ${code}`);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={allowBackdropClose ? onClose : undefined}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <View style={styles.content}>
        {/* маленькая плашка сверху */}
        <View style={styles.handle} />

        {/* Заголовок */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {resolvedTitle}
          </Text>
        </View>

        {/* Описание (по центру) */}
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}

        {/* Опциональный бокс с кодом */}
        {showCodeBox && hasCode && (
          <View style={styles.codeBox}>
            <Text style={styles.code}>{code}</Text>
          </View>
        )}

        {/* Кнопка "Скопировать" */}
        {showCopyButton && hasCode && (
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <Text style={styles.copyText}>{resolvedCopyButton}</Text>
          </TouchableOpacity>
        )}

        {/* Нижняя кнопка "Закрыть" */}
        {showBottomCloseButton && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{resolvedCloseButton}</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
    lineHeight: 21,
  },
  codeBox: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 18,
  },
  code: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  copyButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  copyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  closeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});