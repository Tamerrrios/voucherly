import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import auth from '@react-native-firebase/auth';

import { isTelegramAuthConfigured, TELEGRAM_LOGIN_PAGE_URL } from '../config/telegramAuth';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

type TelegramLoginWebViewProps = {
  visible: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
};

type TelegramWebViewMessage =
  | { type: 'telegram_auth_success'; token: string }
  | { type: 'telegram_auth_error'; message?: string };

const TelegramLoginWebView: React.FC<TelegramLoginWebViewProps> = ({
  visible,
  onClose,
  onAuthSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLocalization();

  const reportTelegramIssue = (message: string) => {
    console.warn(`[TelegramLogin] ${message}`);
  };

  const ensureConfigured = () => {
    if (isTelegramAuthConfigured()) return true;
    reportTelegramIssue(t('login.telegramNotConfiguredMessage'));
    return false;
  };

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as TelegramWebViewMessage;

        if (payload.type === 'telegram_auth_error') {
          reportTelegramIssue(payload.message || t('wallet.openTelegramPageError'));
          onClose();
          return;
        }

        if (payload.type === 'telegram_auth_success') {
          if (!payload.token) {
            reportTelegramIssue(t('login.telegramMissingToken'));
            onClose();
            return;
          }

          setSubmitting(true);
          await auth().signInWithCustomToken(payload.token);
          setSubmitting(false);
          onClose();
          onAuthSuccess();
        }
      } catch {
        reportTelegramIssue(t('login.telegramInvalidResponse'));
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    [onAuthSuccess, onClose, t],
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      useNativeDriver
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{t('wallet.telegramLogin')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.85}>
            <Text style={styles.closeText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>

        <WebView
          source={{ uri: ensureConfigured() ? TELEGRAM_LOGIN_PAGE_URL : 'about:blank' }}
          onMessage={handleMessage}
          onError={() => {
            reportTelegramIssue(t('wallet.openTelegramPageError'));
            onClose();
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#D45E52" />
            </View>
          )}
        />

        {submitting && (
          <View style={styles.overlay}>
            <ActivityIndicator size="small" color="#D45E52" />
            <Text style={styles.overlayText}>{t('wallet.signingIn')}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    height: '92%',
  },
  topBar: {
    height: 54,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Font.semibold,
    fontSize: 16,
    color: '#1F2937',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  closeText: {
    fontFamily: Font.medium,
    color: '#4B5563',
    fontSize: 13,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    gap: 6,
  },
  overlayText: {
    fontFamily: Font.medium,
    color: '#6B7280',
    fontSize: 12,
  },
});

export default TelegramLoginWebView;
