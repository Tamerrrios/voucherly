import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
  const { logout, user, updateProfileName } = useAuth();
  const { t, language, setLanguage } = useLocalization();

  const languageOptions: Array<{ code: AppLanguage; label: string; nativeLabel: string }> = [
    { code: 'uz', label: t('profile.languageUz'), nativeLabel: 'O‘zbekcha' },
    { code: 'ru', label: t('profile.languageRu'), nativeLabel: 'Русский' },
    { code: 'en', label: t('profile.languageEn'), nativeLabel: 'English' },
  ];


  const handleLogout = async () => {
    try {
      setLogoutSheetVisible(false);
      setLoggingOut(true);
      await logout();
      Navigation.jumpToHomeTab();
    } catch (e) {
      console.log('Logout error', e);
    } finally {
      setLoggingOut(false);
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
        onPress: () => setLogoutSheetVisible(true),
      },
    ];

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [draftName, setDraftName] = useState((user?.name ?? '').trim());
  const [savingName, setSavingName] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = (user?.name ?? user?.displayName ?? '').trim() || t('profile.nameFallback');
  const secondaryText = user?.phone || user?.email || null;

  const handleLanguageSelect = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
    setLanguageModalVisible(false);
  };

  const openNameModal = () => {
    setDraftName((user?.name ?? user?.displayName ?? '').trim());
    setNameModalVisible(true);
  };

  const handleSaveName = async () => {
    const normalizedName = draftName.trim();
    if (normalizedName.length < 2) {
      Alert.alert(t('common.error'), t('profile.nameRequired'));
      return;
    }

    try {
      setSavingName(true);
      await updateProfileName(normalizedName);
      setNameModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('profile.nameRequired'));
    } finally {
      setSavingName(false);
    }
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
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Pressable style={styles.editNameButton} onPress={openNameModal}>
                <Ionicons name="create-outline" size={15} color="#B42318" />
              </Pressable>
            </View>
            {!!secondaryText && (
              <Text style={styles.email} numberOfLines={1}>
                {secondaryText}
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

        {/* Розыгрыш */}
        <Animated.View entering={FadeInUp.delay(200).duration(320)} style={{ marginTop: 8 }}>
          <Pressable style={({ pressed }) => [styles.raffleCard, pressed && { opacity: 0.85 }]} onPress={() => {}}>
            <View style={styles.raffleIconWrap}>
              <Ionicons name="trophy-outline" size={22} color="#E53935" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.raffleTitle}>Стать участником розыгрыша</Text>
              <Text style={styles.raffleSubtitle}>Выиграйте призы от наших партнёров</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </Animated.View>

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
            <View style={styles.modalHeaderBadge}>
              <Ionicons name="language-outline" size={16} color="#E53935" />
              <Text style={styles.modalHeaderBadgeText}>{t('profile.language')}</Text>
            </View>

            <Text style={styles.modalTitle}>{t('profile.languageTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile.languageSubtitle')}</Text>

            {languageOptions.map(option => {
              const isActive = language === option.code;

              return (
                <Pressable
                  key={option.code}
                  style={({ pressed }) => [
                    styles.langRow,
                    isActive ? styles.langRowActive : null,
                    pressed ? styles.langRowPressed : null,
                  ]}
                  onPress={() => handleLanguageSelect(option.code)}
                >
                  <View>
                    <Text style={[styles.langLabel, isActive ? styles.langLabelActive : null]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.langHint, isActive ? styles.langHintActive : null]}>
                      {option.nativeLabel}
                    </Text>
                  </View>

                  {isActive ? (
                    <View style={styles.langCheckActive}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.langCheckIdle} />
                  )}
                </Pressable>
              );
            })}

            <Pressable style={styles.cancelButton} onPress={() => setLanguageModalVisible(false)}>
              <Text style={styles.cancelText}>{t('profile.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setNameModalVisible(false)}>
          <Pressable style={styles.languageModalCard} onPress={() => {}}>
            <View style={styles.modalHeaderBadge}>
              <Ionicons name="pencil-outline" size={16} color="#E53935" />
              <Text style={styles.modalHeaderBadgeText}>{t('profile.editName')}</Text>
            </View>

            <Text style={styles.modalTitle}>{t('profile.editNameTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile.editNameSubtitle')}</Text>

            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor="#9CA3AF"
              style={styles.nameInput}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (savingName || draftName.trim().length < 2) ? styles.saveButtonDisabled : null,
                pressed ? styles.saveButtonPressed : null,
              ]}
              onPress={handleSaveName}
              disabled={savingName || draftName.trim().length < 2}
            >
              {savingName ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>{t('profile.saveName')}</Text>
              )}
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={() => setNameModalVisible(false)}>
              <Text style={styles.cancelText}>{t('profile.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={logoutSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutSheetVisible(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setLogoutSheetVisible(false)}>
          <Pressable style={styles.sheetCard} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetIconWrap}>
              <Ionicons name="log-out-outline" size={24} color="#E53935" />
            </View>

            <Text style={styles.sheetTitle}>{t('profile.logoutConfirmTitle')}</Text>
            <Text style={styles.sheetSubtitle}>{t('profile.logoutConfirmSubtitle')}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.sheetPrimaryButton,
                pressed ? styles.sheetPrimaryButtonPressed : null,
              ]}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.sheetPrimaryButtonText}>{t('profile.logoutConfirmButton')}</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.sheetSecondaryButton,
                pressed ? styles.sheetSecondaryButtonPressed : null,
              ]}
              onPress={() => setLogoutSheetVisible(false)}
              disabled={loggingOut}
            >
              <Text style={styles.sheetSecondaryButtonText}>{t('profile.cancel')}</Text>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  editNameButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEECEC',
    borderWidth: 1,
    borderColor: '#F9D2CE',
    marginLeft: 8,
  },

  raffleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    shadowColor: '#E53935',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  raffleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  raffleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  raffleSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.32)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -10 },
    shadowRadius: 20,
    elevation: 12,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  sheetSubtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  sheetPrimaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
  },
  sheetPrimaryButtonPressed: {
    opacity: 0.92,
  },
  sheetPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sheetSecondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#F9FAFB',
  },
  sheetSecondaryButtonPressed: {
    opacity: 0.86,
  },
  sheetSecondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  languageModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeaderBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEECEC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  modalHeaderBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#E53935',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  langRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langRowActive: {
    borderColor: '#F7B6B5',
    backgroundColor: '#FFF5F5',
    shadowColor: '#E53935',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  langRowPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  langLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  langLabelActive: {
    color: '#B42318',
  },
  langHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  langHintActive: {
    color: '#D92D20',
  },
  langCheckActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
  },
  langCheckIdle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButton: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  nameInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 14,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    shadowColor: '#E53935',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#F2A7A4',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonPressed: {
    opacity: 0.92,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
});
