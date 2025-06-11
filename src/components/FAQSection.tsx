import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const faqData = [
  {
    question: 'Как воспользоваться ваучером?',
    answer: 'Вы можете показать QR-код из приложения на кассе партнёра.',
  },
  {
    question: 'Можно ли вернуть деньги за ваучер?',
    answer: 'Нет, ваучеры не подлежат возврату согласно условиям оферты.',
  },
  {
    question: 'Сколько действует ваучер?',
    answer: 'Срок действия указан на ваучере, обычно 30 дней с момента покупки.',
  },
  {
    question: 'Могу ли я подарить ваучер?',
    answer: 'Да, вы можете передать код ваучера другому человеку.',
  },
];

const FAQSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<null | number>(null);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Часто задаваемые вопросы</Text>
      {faqData.map((item, index) => (
        <View key={index} style={styles.item}>
          <TouchableOpacity onPress={() => toggle(index)} style={styles.questionRow}>
            <Text style={styles.question}>{item.question}</Text>
            <Image
              source={
                expandedIndex === index
                  ? require('../../assets/images/up-arrows.png')
                  : require('../../assets/images/down-arrow.png')
              }
              style={styles.icon}
            />
          </TouchableOpacity>
          {expandedIndex === index && <Text style={styles.answer}>{item.answer}</Text>}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default FAQSection;