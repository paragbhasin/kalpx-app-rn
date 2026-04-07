import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface PickerOption {
  id: string;
  label: string;
}

interface OptionPickerBlockProps {
  block: {
    id: string;
    label?: string;
    placeholder?: string;
    options: PickerOption[];
    style?: any;
  };
}

const OptionPickerBlock: React.FC<OptionPickerBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();
  const [visible, setVisible] = useState(false);

  const selectedId = (screenState[block.id] as string) || '';
  const selectedOption = block.options?.find((o) => o.id === selectedId);

  const selectOption = (option: PickerOption) => {
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: block.id, value: option.id }));
    setVisible(false);
  };

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.label) && <Text style={styles.label}>{block.label}</Text>}

      <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Text style={[styles.selectorText, !selectedOption && styles.placeholder]}>
          {selectedOption?.label || block.placeholder || 'Select an option...'}
        </Text>
        <Text style={styles.arrow}>{'\u25BE'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{block.label || 'Choose'}</Text>
            <FlatList
              data={block.options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, item.id === selectedId && styles.optionSelected]}
                  onPress={() => selectOption(item)}
                >
                  <Text style={[styles.optionText, item.id === selectedId && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {item.id === selectedId && <Text style={styles.checkmark}>{'\u2713'}</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#d0902d',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorText: {
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    flex: 1,
  },
  placeholder: {
    color: 'rgba(67, 33, 4, 0.3)',
  },
  arrow: {
    fontSize: 16,
    color: '#C9A84C',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: '#fffdf9',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
  },
  optionTextSelected: {
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
  },
  checkmark: {
    fontSize: 18,
    color: '#C9A84C',
  },
});

export default OptionPickerBlock;
