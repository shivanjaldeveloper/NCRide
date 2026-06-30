import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

interface Message { me: boolean; text: string; time: string; }

const INITIAL_MESSAGES: Message[] = [
  { me: false, text: 'I am at gate 3 of the building.', time: '4:38 PM' },
  { me: true,  text: 'Coming down in 30 seconds.',       time: '4:38 PM' },
  { me: false, text: 'No problem, take your time :)',    time: '4:39 PM' },
  { me: true,  text: 'OTP is 4281.',                    time: '4:40 PM' },
];

const CHAT_BG = '#F8F8F6';

const ChatScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(m => [...m, { me: true, text, time: 'Now' }]);
    setDraft('');
  };

  return (
    <ScreenShell topColor={CHAT_BG} bottomColor={CHAT_BG} backgroundColor={CHAT_BG}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <HeaderBack
          title="Rajat Kr. Saha" sub="DL 5C NC 4421 · Auto Rickshaw"
          onBack={() => navigation.goBack()}
          right={<TouchableOpacity style={styles.callBtn} activeOpacity={0.8}><Icon name="phone" size={18} stroke={Colors.ink} /></TouchableOpacity>}
        />

        <ScrollView style={styles.thread} contentContainerStyle={styles.threadContent} showsVerticalScrollIndicator={false}>
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubbleRow, m.me ? styles.bubbleRowMe : styles.bubbleRowThem]}>
              <View style={[styles.bubble, m.me ? styles.bubbleMe : styles.bubbleThem, m.me ? styles.bubbleMeRadius : styles.bubbleThemRadius]}>
                <Text style={[styles.bubbleText, m.me && styles.bubbleTextMe]}>{m.text}</Text>
                <Text style={[styles.bubbleTime, m.me ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>{m.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow} contentContainerStyle={styles.presetsContent}>
          {t.chat.presets.map(p => (
            <TouchableOpacity key={p} style={styles.presetChip} activeOpacity={0.8} onPress={() => setDraft(p)}>
              <Text style={styles.presetText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput value={draft} onChangeText={setDraft} placeholder={t.chat.placeholder} placeholderTextColor={Colors.textSecondary} style={styles.input} onSubmitEditing={handleSend} />
          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85} onPress={handleSend}>
            <Icon name="arrowRight" size={18} stroke={Colors.lime} sw={2.2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CHAT_BG },
  callBtn: { width: fscale(40), height: fscale(40), borderRadius: Radii.lg, backgroundColor: Colors.bgWhite, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  thread: { flex: 1 },
  threadContent: { paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  bubbleRow: { flexDirection: 'row', marginTop: Spacing.sm },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowThem: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '74%', paddingHorizontal: Spacing.md, paddingVertical: fscale(10), borderRadius: Radii.xl },
  bubbleMe: { backgroundColor: Colors.ink },
  bubbleThem: { backgroundColor: Colors.bgWhite, borderWidth: 0.5, borderColor: Colors.borderSoft },
  bubbleMeRadius: { borderBottomRightRadius: 6 },
  bubbleThemRadius: { borderBottomLeftRadius: 6 },
  bubbleText: { fontSize: fscale(13.5), lineHeight: fscale(18.9), color: Colors.ink },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: fscale(10), marginTop: 4, opacity: 0.5 },
  bubbleTimeMe: { color: '#fff', textAlign: 'right' },
  bubbleTimeThem: { color: Colors.ink, textAlign: 'left' },
  presetsRow: { flexGrow: 0, paddingBottom: Spacing.xs },
  presetsContent: { paddingHorizontal: Spacing.screen, gap: Spacing.xs },
  presetChip: { paddingHorizontal: Spacing.md, paddingVertical: fscale(8), borderRadius: Radii.pill, backgroundColor: Colors.bgWhite, borderWidth: 0.5, borderColor: Colors.border },
  presetText: { fontSize: fscale(12), fontWeight: '600', color: Colors.ink },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm, borderTopWidth: 0.5, borderTopColor: Colors.borderSoft, backgroundColor: CHAT_BG },
  input: { flex: 1, height: fscale(44), paddingHorizontal: Spacing.md, borderRadius: Radii.pill, backgroundColor: Colors.bgWhite, borderWidth: 0.5, borderColor: Colors.border, fontSize: fscale(14), color: Colors.ink },
  sendBtn: { width: fscale(44), height: fscale(44), borderRadius: fscale(22), backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
});

export default ChatScreen;
