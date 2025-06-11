import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'
import { Image } from 'react-native-animatable';
import BackButton from './BackButton';

interface Props {
  currentStep: number;
  steps: string[];
}

const ProgressHeader = ({ currentStep, steps }: Props) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>

      <BackButton
        onPress={() => navigation.goBack()}
        size={30}
        iconSize={24}
        style={{ position: 'absolute', top: 50, left: 20 }}
      />

      <View style={styles.overlay}>
        <View style={styles.stepsRow}>
          {steps.map((label, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: index + 1 === currentStep ? '#E53935' : '#ccc',
                  },
                ]}
              >
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: index + 1 === currentStep ? '#000' : '#666',
                    fontWeight: index + 1 === currentStep ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
              {index !== steps.length - 1 && <View style={styles.line} />}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 160,
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 12,
    marginTop: 100,
  },
  backBtn: {
    position: 'absolute',
    marginTop: 40,
    left: 16,
    zIndex: 10,
    // backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 6,
    // borderRadius: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  label: {
    marginLeft: 6,
    marginRight: 10,
    fontSize: 14,
  },
  line: {
    width: 18,
    height: 2,
    backgroundColor: '#bbb',
    marginHorizontal: 2,
  },
});

export default ProgressHeader;