import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import GradientHeader from '../components/GradientHeader'; // наш кастомный header
import { useLocalization } from '../context/LocalizationContext';



const PrivacyPolicyScreen = () => {
  const { language } = useLocalization();

  const copy = {
    ru: {
      title: 'Политика конфиденциальности',
      intro:
        'Приложение Voucherly уважает вашу конфиденциальность. Настоящая политика объясняет, как мы собираем, используем и защищаем ваши персональные данные.',
      sections: [
        { h: '1. Общие положения', b: 'Политика составлена в соответствии с законодательством Республики Узбекистан. Используя приложение, вы соглашаетесь с её условиями.' },
        { h: '2. Какие данные мы собираем', b: 'Мы можем собирать имя, email, номер телефона, историю заказов и технические данные устройства.' },
        { h: '3. Как мы используем данные', b: 'Данные используются для регистрации, оформления заказов, отображения ваучеров, поддержки и улучшения сервиса.' },
        { h: '4. Защита данных', b: 'Данные хранятся в защищённой инфраструктуре и передаются по защищённым каналам.' },
        { h: '5. Передача третьим лицам', b: 'Мы не передаём персональные данные третьим лицам без законных оснований или вашего согласия.' },
        { h: '6. Хранение данных', b: 'Данные хранятся столько, сколько необходимо для целей сервиса и требований закона.' },
        { h: '7. Ваши права', b: 'Вы можете запросить доступ, исправление или удаление данных через контакты поддержки.' },
        { h: '8. Изменения политики', b: 'Мы можем обновлять политику. Актуальная версия всегда доступна на этой странице.' },
      ],
      updated: 'Дата последнего обновления: 28 февраля 2026',
    },
    uz: {
      title: 'Maxfiylik siyosati',
      intro:
        'Voucherly ilovasi sizning maxfiyligingizni hurmat qiladi. Ushbu siyosat shaxsiy ma’lumotlaringiz qanday yig‘ilishi, ishlatilishi va himoyalanishini tushuntiradi.',
      sections: [
        { h: '1. Umumiy qoidalar', b: 'Siyosat O‘zbekiston Respublikasi qonunchiligiga muvofiq tuzilgan. Ilovadan foydalanish orqali siz shartlarga rozilik bildirasiz.' },
        { h: '2. Qaysi ma’lumotlar yig‘iladi', b: 'Ism, email, telefon raqami, buyurtmalar tarixi va qurilma texnik ma’lumotlari yig‘ilishi mumkin.' },
        { h: '3. Ma’lumotlardan foydalanish', b: 'Ma’lumotlar ro‘yxatdan o‘tish, buyurtmalar, vaucherlarni ko‘rsatish, qo‘llab-quvvatlash va servisni yaxshilash uchun ishlatiladi.' },
        { h: '4. Ma’lumotlarni himoya qilish', b: 'Ma’lumotlar himoyalangan infratuzilmada saqlanadi va xavfsiz kanallar orqali uzatiladi.' },
        { h: '5. Uchinchi shaxslarga uzatish', b: 'Qonuniy asos yoki roziligingiz bo‘lmasa, ma’lumotlar uchinchi shaxslarga berilmaydi.' },
        { h: '6. Saqlash muddati', b: 'Ma’lumotlar xizmat maqsadlari va qonun talablari uchun zarur muddatda saqlanadi.' },
        { h: '7. Huquqlaringiz', b: 'Qo‘llab-quvvatlash orqali ma’lumotlarga kirish, tuzatish yoki o‘chirishni so‘rashingiz mumkin.' },
        { h: '8. Siyosatdagi o‘zgarishlar', b: 'Siyosat vaqti-vaqti bilan yangilanishi mumkin. Amaldagi versiya shu sahifada bo‘ladi.' },
      ],
      updated: 'So‘nggi yangilanish sanasi: 2026-yil 28-fevral',
    },
    en: {
      title: 'Privacy Policy',
      intro:
        'Voucherly respects your privacy. This policy explains how we collect, use, and protect your personal data.',
      sections: [
        { h: '1. General provisions', b: 'This policy is prepared in accordance with the laws of the Republic of Uzbekistan. By using the app, you agree to these terms.' },
        { h: '2. Data we collect', b: 'We may collect your name, email, phone number, order history, and technical device information.' },
        { h: '3. How we use data', b: 'Data is used for registration, order processing, voucher display, support, and service improvement.' },
        { h: '4. Data protection', b: 'Data is stored in protected infrastructure and transferred through secure channels.' },
        { h: '5. Third-party sharing', b: 'We do not share personal data with third parties without legal grounds or your consent.' },
        { h: '6. Data retention', b: 'Data is retained as long as necessary for service purposes and legal requirements.' },
        { h: '7. Your rights', b: 'You can request access, correction, or deletion of your data via support contacts.' },
        { h: '8. Policy updates', b: 'We may update this policy from time to time. The latest version is always available on this page.' },
      ],
      updated: 'Last updated: February 28, 2026',
    },
  }[language];

  return (
    <View style={styles.container}>
            <GradientHeader title="" showBackButton = {true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{copy.title}</Text>

        <Text style={styles.section}>
          {copy.intro}
        </Text>

        {copy.sections.map((section) => (
          <View key={section.h}>
            <Text style={styles.subTitle}>{section.h}</Text>
            <Text style={styles.section}>{section.b}</Text>
          </View>
        ))}

        <Text style={styles.section}>{copy.updated}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  section: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default PrivacyPolicyScreen;