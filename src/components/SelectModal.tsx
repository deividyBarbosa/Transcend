import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  showEmptyOption?: boolean;
}

export default function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  showEmptyOption = true,
}: SelectModalProps) {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {showEmptyOption && (
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedValue === '' && styles.optionSelected,
                ]}
                onPress={() => handleSelect('')}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedValue === '' && styles.optionTextSelected,
                  ]}
                >
                  -
                </Text>
              </TouchableOpacity>
            )}

            {options.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  selectedValue === option && styles.optionSelected,
                ]}
                onPress={() => handleSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedValue === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.muted,
  },
  scrollView: {
    maxHeight: 400,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
});