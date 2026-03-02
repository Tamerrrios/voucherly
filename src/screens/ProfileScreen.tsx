import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../context/AuthContext';

import { Navigation } from '../navigation/Navigation';
import { Linking } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { AppLanguage } from '../localization/translations';

const ROW_GAP = 12;

const ProfileScreen = () => {
  const { logout, user } = useAuth();
  const { t, language, setLanguage } = useLocalization();


  const handleLogout = async () => {
    try {
      await logout();
      Navigation.jumpToHomeTab();
    } catch (e) {
      console.warn('Logout error', e);
    }
  };

  const menuItems: Array<{
    key: string;
    title: string;
    iconName: string;
    color?: string;
    onPress: () => void;
  }> = [
      // {
      //   key: 'vouchers',
      //   title: 'Мои ваучеры',
      //   iconName: 'ticket-outline',
      //   onPress: () => Navigation.navigate(Routes.MyVouchers),
      // },
      {
        key: 'lang',
        title: t('profile.language'),
        iconName: 'language-outline',
        onPress: () => setLanguageModalVisible(true),
      },
      {
        key: 'privacy',
        title: t('profile.privacy'),
        iconName: 'document-text-outline',
        onPress: () => {
          Linking.openURL('https://voucherly.uz/privacy');
        },
      },
      {
        key: 'logout',
        title: t('profile.logout'),
        iconName: 'log-out-outline',
        color: '#E53935',
        onPress: handleLogout,
      },
    ];

  const displayName =
    (user as any)?.displayName ||
    (user as any)?.name ||
    (user as any)?.email?.split('@')?.[0] ||
    t('common.guest');

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLanguageSelect = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
    setLanguageModalVisible(false);
  };


  return (
    <View style={styles.container}>
      <GradientHeader title={t('profile.title')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Шапка */}
        <Animated.View entering={FadeInUp.duration(280)} style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={22} color="#6B7280" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {!!(user as any)?.email && (
              <Text style={styles.email} numberOfLines={1}>
                {(user as any)?.email}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Меню */}
        <View style={{ height: ROW_GAP }} />

        {menuItems.map((item, idx) => (
          <Animated.View
            key={item.key}
            entering={FadeInUp.delay(idx * 80)}
            style={styles.rowCardShadow}
          >
            <Pressable
              android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
              style={styles.row}
              onPress={item.onPress}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={item.iconName}
                    size={20}
                    color={item.color ?? '#1F2937'}
                  />
                </View>
                <Text
                  style={[
                    styles.rowText,
                    item.color ? { color: item.color } : null,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </Animated.View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.languageModalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t('profile.languageTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile.languageSubtitle')}</Text>

            <Pressable style={styles.langRow} onPress={() => handleLanguageSelect('uz')}>
              <Text style={styles.langLabel}>{t('profile.languageUz')}</Text>
              {language === 'uz' && <Ionicons name="checkmark" size={20} color="#E53935" />}
            </Pressable>

            <Pressable style={styles.langRow} onPress={() => handleLanguageSelect('ru')}>
              <Text style={styles.langLabel}>{t('profile.languageRu')}</Text>
              {language === 'ru' && <Ionicons name="checkmark" size={20} color="#E53935" />}
            </Pressable>

            <Pressable style={styles.langRow} onPress={() => handleLanguageSelect('en')}>
              <Text style={styles.langLabel}>{t('profile.languageEn')}</Text>
              {language === 'en' && <Ionicons name="checkmark" size={20} color="#E53935" />}
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={() => setLanguageModalVisible(false)}>
              <Text style={styles.cancelText}>{t('profile.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 16, paddingBottom: 24 },

  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  rowCardShadow: {
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden', // для ripple на Android
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  languageModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
    color: '#6B7280',
  },
  langRow: {
    minHeight: 46,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  cancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
});