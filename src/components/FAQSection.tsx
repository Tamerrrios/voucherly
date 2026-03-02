// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// if (Platform.OS === 'android') {
//   UIManager.setLayoutAnimationEnabledExperimental?.(true);
// }

// const faqData = [
//   {
//     question: 'Как воспользоваться ваучером?',
//     answer: 'Покажите код на кассе партнёра.' ,
//   },
//   {
//     question: 'Можно ли вернуть деньги за ваучер?',
//     answer: 'Нет, ваучеры не подлежат возврату согласно условиям оферты.',
//   },
//   {
//     question: 'Сколько действует ваучер?',
//     answer: 'Срок действия указан на ваучере, обычно 30 дней с момента покупки.',
//   },
//   {
//     question: 'Могу ли я подарить ваучер?',
//     answer: 'Да, вы можете передать код ваучера другому человеку.',
//   },
// ];

// const FAQSection = () => {
//   const [expandedIndex, setExpandedIndex] = useState<null | number>(null);

//   const toggle = (index: number) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedIndex(expandedIndex === index ? null : index);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Часто задаваемые вопросы</Text>
//       {faqData.map((item, index) => (
//         <View key={index} style={styles.item}>
//           <TouchableOpacity onPress={() => toggle(index)} style={styles.questionRow}>
//             <Text style={styles.question}>{item.question}</Text>
//             <Image
//               source={
//                 expandedIndex === index
//                   ? require('../../assets/images/up-arrows.png')
//                   : require('../../assets/images/down-arrow.png')
//               }
//               style={styles.icon}
//             />
//           </TouchableOpacity>
//           {expandedIndex === index && <Text style={styles.answer}>{item.answer}</Text>}
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 16,
//     paddingTop: 24,
//     paddingBottom: 40,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#333',
//     marginBottom: 16,
//   },
//   item: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   questionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   question: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   answer: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#555',
//     lineHeight: 20,
//   },
//   icon: {
//     width: 20,
//     height: 20,
//   },
// });

// export default FAQSection;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLocalization } from '../context/LocalizationContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQSection = () => {
  const { language } = useLocalization();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const copy = {
    ru: {
      title: 'Часто задаваемые вопросы',
      items: [
        {
          question: 'Как воспользоваться ваучером?',
          answer: 'Покажите код на кассе партнёра.',
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
      ],
    },
    uz: {
      title: 'Ko‘p so‘raladigan savollar',
      items: [
        {
          question: 'Vaucherdan qanday foydalanaman?',
          answer: 'Hamkor kassasida vaucheringiz kodini ko‘rsating.',
        },
        {
          question: 'Vaucher uchun pulni qaytarib olish mumkinmi?',
          answer: 'Yo‘q, oferta shartlariga ko‘ra vaucherlar qaytarilmaydi.',
        },
        {
          question: 'Vaucher qancha muddat amal qiladi?',
          answer: 'Amal qilish muddati vaucherdagi ma’lumotda ko‘rsatiladi, odatda 30 kun.',
        },
        {
          question: 'Vaucherni sovg‘a qila olamanmi?',
          answer: 'Ha, vaucher kodini boshqa insonga yuborishingiz mumkin.',
        },
      ],
    },
    en: {
      title: 'Frequently asked questions',
      items: [
        {
          question: 'How do I use a voucher?',
          answer: 'Show the voucher code at the partner checkout.',
        },
        {
          question: 'Can I get a refund for a voucher?',
          answer: 'No, vouchers are non-refundable according to the offer terms.',
        },
        {
          question: 'How long is a voucher valid?',
          answer: 'The validity period is shown on the voucher, usually 30 days after purchase.',
        },
        {
          question: 'Can I gift a voucher to someone else?',
          answer: 'Yes, you can share the voucher code with another person.',
        },
      ],
    },
  }[language];

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{copy.title}</Text>
      {copy.items.map((item, index) => {
        const expanded = expandedIndex === index;
        return (
          <View key={index} style={styles.item}>
            <TouchableOpacity onPress={() => toggle(index)} style={styles.questionRow} activeOpacity={0.8}>
              <Text style={styles.question} numberOfLines={2}>
                {item.question}
              </Text>
              <View style={styles.iconBox}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#333"
                  style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                />
              </View>
            </TouchableOpacity>

            {expanded && <Text style={styles.answer}>{item.answer}</Text>}
          </View>
        );
      })}
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
    alignItems: 'center',
    paddingVertical: 2, // стабильная зона нажатия
  },
  question: {
    flex: 1,               // не двигаем иконку
    marginRight: 8,        // небольшой отступ от иконки
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
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FAQSection;