/**
 * FormFieldsBlock — Renders dynamic form fields from block.fields array.
 * Each field has { id, label, type, placeholder }.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface FormField {
  id: string;
  label?: string;
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
}

interface FormFieldsBlockProps {
  block: {
    fields: FormField[];
    style?: any;
  };
}

const FormFieldsBlock: React.FC<FormFieldsBlockProps> = ({ block }) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const fields = block.fields || [];

  const onChangeField = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));

    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: id, value }));
  };

  return (
    <View style={[styles.container, block?.style]}>
      {fields.map((field) => (
        <View key={field.id} style={styles.fieldGroup}>
          {Boolean(field.label) && <Text style={styles.label}>{field.label}</Text>}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={values[field.id] || ''}
              onChangeText={(v) => onChangeField(field.id, v)}
              placeholder={field.placeholder || ''}
              placeholderTextColor="rgba(67, 33, 4, 0.3)"
              keyboardType={field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
              returnKeyType="next"
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 12,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.semiBold,
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderColor: '#d0902d',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: '#1a1a1a',
    height: 44,
  },
});

export default FormFieldsBlock;
