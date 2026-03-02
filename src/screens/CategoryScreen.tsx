import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import GradientHeader from '../components/GradientHeader';
import firestore from '@react-native-firebase/firestore';
import { useLocalization } from '../context/LocalizationContext';

// ---- Types ----
export type Category = {
    id: string;
    name: string; // title shown under the image
    imageUrl?: string; // remote url for preview
};

// ---- API ----
async function fetchCategories(): Promise<Category[]> {
    // Root collection "categories" (per your screenshot)
    const snap = await firestore().collection('categories').get();

    return snap.docs.map(d => {
        const data = d.data() as any;
        // Support various field names just in case (name/title, image/imageUrl/icon)
        const name = data.name ?? data.title ?? data.categoryName ?? '—';
        const imageUrl = data.imageUrl ?? data.image ?? data.iconUrl ?? undefined;
        return { id: d.id, name, imageUrl } as Category;
    });
}

// ---- UI Card ----
const CategoryCard: React.FC<{
    item: Category;
    size: number;
    index: number;
    onPress?: (c: Category) => void;
}> = ({ item, size, index, onPress }) => {
    // --- Appearance animation (fade + slight scale) ---
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.96)).current;

    useEffect(() => {
        const delay = index * 80; // мягкая каскадная анимация
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 320,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 360,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, [index, opacity, scale]);

    return (
        <Animated.View style={{ width: size, height: size, opacity, transform: [{ scale }] }}>
            <Pressable
                onPress={() => onPress?.(item)}
                style={[styles.card, { flex: 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
            >
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.cardImage, styles.cardImageFallback]}>
                        <Text style={styles.fallbackEmoji}>🎁</Text>
                    </View>
                )}
                <View style={styles.cardFooter}>
                    <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

// ---- Screen ----
const PADDING = 16;
const GAP = 12;

const CategoryScreen: React.FC<any> = ({ navigation }) => {
    const { language } = useLocalization();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copy = {
        ru: { loadFail: 'Не удалось загрузить категории', refreshFail: 'Обновить не удалось', loading: 'Загрузка категорий…', error: 'Ошибка', retry: 'Повторить', vouchers: 'Ваучеры', empty: 'Категории пока пустые' },
        uz: { loadFail: 'Kategoriyalarni yuklab bo‘lmadi', refreshFail: 'Yangilab bo‘lmadi', loading: 'Kategoriyalar yuklanmoqda…', error: 'Xatolik', retry: 'Qayta urinish', vouchers: 'Vaucherlar', empty: 'Kategoriyalar hozircha bo‘sh' },
        en: { loadFail: 'Failed to load categories', refreshFail: 'Failed to refresh', loading: 'Loading categories…', error: 'Error', retry: 'Retry', vouchers: 'Vouchers', empty: 'No categories yet' },
    }[language];

    const itemSize = useMemo(() => {
        const w = Dimensions.get('window').width;
        // 2 columns: total horizontal padding = PADDING*2, gap between = GAP
        return Math.floor((w - PADDING * 2 - GAP) / 2);
    }, []);

    const load = useCallback(async () => {
        setError(null);
        try {
            const items = await fetchCategories();
            // Optional sort by name
            items.sort((a, b) => a.name.localeCompare(b.name));
            setData(items);
        } catch (e: any) {
            console.error(e);
            setError(e?.message ?? copy.loadFail);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const items = await fetchCategories();
            items.sort((a, b) => a.name.localeCompare(b.name));
            setData(items);
        } catch (e) {
            // keep old data, show toast-like inline error
            setError(copy.refreshFail);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const openCategory = useCallback((c: Category) => {
        navigation.navigate('Vouchers', {
            categoryId: c.id,
            categoryName: c.name,
        });
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.hint}>{copy.loading}</Text>
            </View>
        );
    }

    if (error && data.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorTitle}>{copy.error}</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={load}>
                    <Text style={styles.retryText}>{copy.retry}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <GradientHeader title={copy.vouchers} />
            <FlatList
                data={data}
                keyExtractor={(it) => it.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
                ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item, index }) => (
                    <CategoryCard item={item} size={itemSize} index={index} onPress={openCategory} />
                )}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.hint}>{copy.empty}</Text>
                    </View>
                }
            />
        </View>

    );
};

export default CategoryScreen;

// ---- Styles ----
const styles = StyleSheet.create({
    listContent: {
        paddingTop: PADDING,
        paddingBottom: PADDING + 8,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    cardImage: {
        flex: 1,
        width: '100%',
    },
    cardImageFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    fallbackEmoji: { fontSize: 36 },
    cardFooter: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.06)',
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    hint: { color: '#6B7280', marginTop: 8 },
    errorTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    errorText: { color: '#EF4444', textAlign: 'center' },
    retryBtn: {
        marginTop: 12,
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    retryText: { color: '#fff', fontWeight: '700' },
});
