import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import GradientHeader from '../components/GradientHeader'; // наш кастомный header



const PrivacyPolicyScreen = () => {
  return (
    <View style={styles.container}>
            <GradientHeader title="" showBackButton = {true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Политика конфиденциальности</Text>

        <Text style={styles.section}>
          Приложение Voucherly, действующее на территории Республики Узбекистан, уважает вашу конфиденциальность. Настоящая политика объясняет, как мы собираем, используем и защищаем ваши персональные данные.
        </Text>

        <Text style={styles.subTitle}>1. Общие положения</Text>
        <Text style={styles.section}>
          Настоящая политика составлена в соответствии с Законом Республики Узбекистан "О персональных данных". Используя приложение Voucherly, вы соглашаетесь с условиями этой политики.
        </Text>

        <Text style={styles.subTitle}>2. Какие данные мы собираем</Text>
        <Text style={styles.section}>
          Мы можем собирать следующие категории данных: имя, фамилия, номер телефона, адрес электронной почты, история заказов, технические данные устройства (IP-адрес, версия ОС и др.).
        </Text>

        <Text style={styles.subTitle}>3. Как мы используем данные</Text>
        <Text style={styles.section}>
          Ваши данные используются исключительно для регистрации, покупки ваучеров, отображения заказов, улучшения качества сервиса, обратной связи и отправки уведомлений (по согласию).
        </Text>

        <Text style={styles.subTitle}>4. Как мы защищаем ваши данные</Text>
        <Text style={styles.section}>
          Все данные хранятся на защищённых серверах Firebase (Google). Мы используем SSL-шифрование и ограниченный доступ сотрудников к данным.
        </Text>

        <Text style={styles.subTitle}>5. Передача третьим лицам</Text>
        <Text style={styles.section}>
          Мы не передаём ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законодательством Республики Узбекистан.
        </Text>

        <Text style={styles.subTitle}>6. Хранение данных</Text>
        <Text style={styles.section}>
          Персональные данные хранятся столько, сколько это необходимо для выполнения целей, указанных в данной политике, либо в пределах, установленных законом.
        </Text>

        <Text style={styles.subTitle}>7. Ваши права</Text>
        <Text style={styles.section}>
          Вы имеете право запросить доступ, изменение или удаление ваших персональных данных, написав нам на email, указанный в приложении.
        </Text>

        <Text style={styles.subTitle}>8. Изменения политики</Text>
        <Text style={styles.section}>
          Мы можем время от времени обновлять данную политику. Все изменения публикуются на этой странице.
        </Text>

        <Text style={styles.section}>Дата последнего обновления: 29 мая 2025</Text>
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