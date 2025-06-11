import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MediaCardProps {
  title: string;
  icon: ImageSourcePropType;
  children?: React.ReactNode;
  onEdit?: () => void;
  onRemove?: () => void;
  hasMedia?: boolean;
  previewUri?: string;
  previewSource?: ImageSourcePropType; // <--- добавь это
}

const MediaCard: React.FC<MediaCardProps> = ({
  title,
  icon,
  children,
  onEdit,
  onRemove,
  hasMedia,
  previewUri,
}) => {
  return (
    <TouchableOpacity onPress={onEdit} activeOpacity={0.8} style={styles.card}>
      <View style={styles.header}>
      <Image source={icon} style={styles.assetIcon} />

        <Text style={styles.title}>{title}</Text>
      </View>

      {hasMedia && previewUri && (
        <Image source={{ uri: previewUri }} style={styles.preview} />
      )}

      {children}

      {onRemove && hasMedia && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onRemove} style={styles.actionBtn}>
            <Image
              source={require('../../assets/images/delete.png')}
              style={{ width: 24, height: 24}}/>
            {/* // <Ionicons name="trash-outline" size={20} color="#E53935" /> */}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  assetIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
    marginRight: 8,
  },
});

export default MediaCard;