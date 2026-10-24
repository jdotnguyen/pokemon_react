import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ACCENT } from './detail/shared';

/** Small centred dialog with one text field (Alert.prompt is iOS-only, so this works everywhere). */
export default function TextPrompt({ visible, title, initial = '', placeholder, confirmLabel = 'Save', onSubmit, onClose }) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (visible) setValue(initial);
  }, [visible, initial]);

  const submit = () => {
    onSubmit(value.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#9AA3AE"
            autoFocus
            selectTextOnFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={submit}
            style={styles.input}
          />
          <View style={styles.actions}>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} hitSlop={8} accessibilityRole="button">
              <Text style={styles.confirm}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  title: { fontSize: 17, fontWeight: '800', color: '#1F2A37', marginBottom: 12 },
  input: { height: 44, borderRadius: 12, backgroundColor: '#F1F3F6', paddingHorizontal: 14, fontSize: 16, color: '#1F2A37' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 18 },
  cancel: { fontSize: 16, color: '#8A94A1', fontWeight: '600' },
  confirm: { fontSize: 16, color: ACCENT, fontWeight: '700' },
});
