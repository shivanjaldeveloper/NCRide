import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCCard, Icon, Row } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { useSavedPlaces } from './useSavedPlaces';
import type { SavedPlace } from './useSavedPlaces';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlaces'>;

const SavedPlacesScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { places, loading, addPlace, updatePlace, removePlace } =
    useSavedPlaces();

  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  const startRenaming = useCallback((place: SavedPlace) => {
    setDraftTitle(place.title);
    setEditingTitleId(place.id);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  }, []);

  const commitRename = useCallback(
    (id: string) => {
      const trimmed = draftTitle.trim();
      if (trimmed.length > 0) {
        updatePlace(id, { title: trimmed });
      }
      setEditingTitleId(null);
    },
    [draftTitle, updatePlace],
  );

  // Opens with no initial coords so LocationPickerScreen's own auto-locate
  // kicks in and refines against GOOD_ACCURACY_M before settling — same
  // precise-fix behaviour as pickup/dropoff, no shortcuts taken here.
  const handleAddPlace = useCallback(() => {
    navigation.navigate('LocationPicker', {
      field: 'dropoff',
      onPick: result => {
        console.log(
          `[SavedPlaces] new place picked → address="${result.address}", lat=${result.lat}, lng=${result.lng}, accuracy=${result.accuracy}`,
        );
        const id = `place_${Date.now()}`;
        const newPlace: SavedPlace = {
          id,
          icon: 'pin',
          title: 'New Place',
          sub: result.address,
          lat: result.lat,
          lng: result.lng,
          accuracy: result.accuracy,
        };
        addPlace(newPlace);
        startRenaming(newPlace);
      },
    });
  }, [navigation, addPlace, startRenaming]);

  const handleEditPlace = useCallback(
    (place: SavedPlace) => {
      navigation.navigate('LocationPicker', {
        field: 'dropoff',
        initialLat: place.lat,
        initialLng: place.lng,
        initialAddress: place.sub,
        initialSource: 'manual',
        onPick: result => {
          console.log(
            `[SavedPlaces] place ${place.id} updated → address="${result.address}", lat=${result.lat}, lng=${result.lng}, accuracy=${result.accuracy}`,
          );
          updatePlace(place.id, {
            sub: result.address,
            lat: result.lat,
            lng: result.lng,
            accuracy: result.accuracy,
          });
        },
      });
    },
    [navigation, updatePlace],
  );

  const handleDeletePlace = useCallback(
    (place: SavedPlace) => {
      Alert.alert(
        'Remove saved place',
        `Remove "${place.title}" from your saved places?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removePlace(place.id),
          },
        ],
      );
    },
    [removePlace],
  );

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack
          title={t.savedPlaces.title}
          onBack={() => navigation.goBack()}
          right={
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.8}
              onPress={handleAddPlace}
            >
              <Icon name="plus" size={20} stroke={Colors.ink} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Plain decorative map — no pins, since these aren't real
            positions relative to it */}
        <MapView height={fscale(180)} showRoute={false} showControls={false} />

        <View style={styles.list}>
          {loading && (
            <View style={styles.centerWrap}>
              <ActivityIndicator size="small" color={Colors.textTertiary} />
            </View>
          )}

          {!loading && places.length === 0 && (
            <View style={styles.centerWrap}>
              <Icon name="pin" size={28} stroke={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No saved places yet</Text>
              <Text style={styles.emptyText}>
                Tap the + button above to save your first location
              </Text>
            </View>
          )}

          {!loading &&
            places.map(p => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={1}
                onLongPress={() => handleDeletePlace(p)}
                delayLongPress={400}
              >
                <NCCard pad={12} style={styles.placeCard}>
                  {editingTitleId === p.id ? (
                    <View style={styles.renameRow}>
                      <TextInput
                        ref={titleInputRef}
                        style={styles.renameInput}
                        value={draftTitle}
                        onChangeText={setDraftTitle}
                        placeholder="Place name"
                        placeholderTextColor={Colors.textTertiary}
                        returnKeyType="done"
                        onSubmitEditing={() => commitRename(p.id)}
                        onBlur={() => commitRename(p.id)}
                      />
                      <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => commitRename(p.id)}
                      >
                        <Text style={styles.doneBtnText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => startRenaming(p)}
                    >
                      <Row
                        icon={p.icon}
                        title={p.title}
                        sub={p.sub}
                        accent={p.accent}
                        right={
                          <TouchableOpacity
                            style={styles.editBtn}
                            activeOpacity={0.8}
                            onPress={() => handleEditPlace(p)}
                          >
                            <Icon name="edit" size={16} stroke={Colors.ink} />
                          </TouchableOpacity>
                        }
                      />
                    </TouchableOpacity>
                  )}
                </NCCard>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },

  addBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { marginTop: Spacing.md, gap: Spacing.sm },
  placeCard: {},
  editBtn: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerWrap: {
    paddingVertical: fscale(36),
    alignItems: 'center',
    gap: fscale(8),
  },
  emptyTitle: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    marginTop: fscale(4),
  },
  emptyText: {
    fontSize: fscale(12.5),
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: fscale(24),
  },

  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  renameInput: {
    flex: 1,
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: fscale(4),
  },
  doneBtn: {
    paddingHorizontal: fscale(12),
    paddingVertical: fscale(6),
  },
  doneBtnText: {
    fontSize: fscale(13),
    fontWeight: '700',
    color: Colors.green,
  },
});

export default SavedPlacesScreen;
