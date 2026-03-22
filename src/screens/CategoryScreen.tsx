import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    RefreshControl,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import GradientHeader from '../components/GradientHeader';
import SearchBar from '../components/SearchBar';
import { useLocalization } from '../context/LocalizationContext';
import { AppLanguage } from '../localization/translations';

type CategoryItem = {
    id: string;
    name: string;
    subtitle: string;
    icon: string;
    popular?: boolean;
    accent: [string, string];
};

const PADDING = 16;
const GAP = 12;

const mockCategories: Record<AppLanguage, CategoryItem[]> = {
    ru: [
        { id: 'fashion', name: 'Мода и стиль', subtitle: 'Бутики и трендовые бренды', icon: 'shirt-outline', popular: true, accent: ['#FEE2E2', '#FBCFE8'] },
        { id: 'beauty', name: 'Красота и SPA', subtitle: 'Салоны и wellness-процедуры', icon: 'sparkles-outline', popular: true, accent: ['#FCE7F3', '#FDE68A'] },
        { id: 'food', name: 'Рестораны', subtitle: 'Ужины и гастро-впечатления', icon: 'restaurant-outline', popular: true, accent: ['#FEF3C7', '#FDE68A'] },
        { id: 'coffee', name: 'Кофейни', subtitle: 'Уютные места и specialty coffee', icon: 'cafe-outline', accent: ['#EDE9FE', '#DDD6FE'] },
        { id: 'electronics', name: 'Техника', subtitle: 'Гаджеты и электроника', icon: 'hardware-chip-outline', popular: true, accent: ['#DBEAFE', '#BFDBFE'] },
        { id: 'kids', name: 'Для детей', subtitle: 'Игрушки и семейные активности', icon: 'happy-outline', accent: ['#DCFCE7', '#BBF7D0'] },
        { id: 'home', name: 'Дом и интерьер', subtitle: 'Декор и полезные покупки', icon: 'home-outline', accent: ['#E0F2FE', '#BAE6FD'] },
        { id: 'sport', name: 'Спорт', subtitle: 'Фитнес и активный отдых', icon: 'barbell-outline', accent: ['#FFEDD5', '#FED7AA'] },
    ],
    uz: [
        { id: 'fashion', name: 'Moda va uslub', subtitle: 'Butiklar va trend brendlar', icon: 'shirt-outline', popular: true, accent: ['#FEE2E2', '#FBCFE8'] },
        { id: 'beauty', name: 'Go‘zallik va SPA', subtitle: 'Salonlar va wellness xizmatlari', icon: 'sparkles-outline', popular: true, accent: ['#FCE7F3', '#FDE68A'] },
        { id: 'food', name: 'Restoranlar', subtitle: 'Mazali kechki ovqat va taassurotlar', icon: 'restaurant-outline', popular: true, accent: ['#FEF3C7', '#FDE68A'] },
        { id: 'coffee', name: 'Kofeynyalar', subtitle: 'Qulay joylar va specialty coffee', icon: 'cafe-outline', accent: ['#EDE9FE', '#DDD6FE'] },
        { id: 'electronics', name: 'Texnika', subtitle: 'Gadjetlar va elektronika', icon: 'hardware-chip-outline', popular: true, accent: ['#DBEAFE', '#BFDBFE'] },
        { id: 'kids', name: 'Bolalar uchun', subtitle: 'O‘yinchoqlar va oilaviy hordiq', icon: 'happy-outline', accent: ['#DCFCE7', '#BBF7D0'] },
        { id: 'home', name: 'Uy va interyer', subtitle: 'Dekor va foydali xaridlar', icon: 'home-outline', accent: ['#E0F2FE', '#BAE6FD'] },
        { id: 'sport', name: 'Sport', subtitle: 'Fitness va faol dam olish', icon: 'barbell-outline', accent: ['#FFEDD5', '#FED7AA'] },
    ],
    en: [
        { id: 'fashion', name: 'Fashion & Style', subtitle: 'Boutiques and trending brands', icon: 'shirt-outline', popular: true, accent: ['#FEE2E2', '#FBCFE8'] },
        { id: 'beauty', name: 'Beauty & SPA', subtitle: 'Salons and wellness experiences', icon: 'sparkles-outline', popular: true, accent: ['#FCE7F3', '#FDE68A'] },
        { id: 'food', name: 'Restaurants', subtitle: 'Dining and signature experiences', icon: 'restaurant-outline', popular: true, accent: ['#FEF3C7', '#FDE68A'] },
        { id: 'coffee', name: 'Coffee Shops', subtitle: 'Cozy spots and specialty coffee', icon: 'cafe-outline', accent: ['#EDE9FE', '#DDD6FE'] },
        { id: 'electronics', name: 'Electronics', subtitle: 'Gadgets and smart devices', icon: 'hardware-chip-outline', popular: true, accent: ['#DBEAFE', '#BFDBFE'] },
        { id: 'kids', name: 'Kids', subtitle: 'Toys and family activities', icon: 'happy-outline', accent: ['#DCFCE7', '#BBF7D0'] },
        { id: 'home', name: 'Home & Interior', subtitle: 'Decor and practical shopping', icon: 'home-outline', accent: ['#E0F2FE', '#BAE6FD'] },
        { id: 'sport', name: 'Sport', subtitle: 'Fitness and active lifestyle', icon: 'barbell-outline', accent: ['#FFEDD5', '#FED7AA'] },
    ],
};

const copyByLanguage = {
    ru: {
        title: 'Ваучеры',
        popular: 'Популярные категории',
        allCategories: 'Все категории',
        results: 'Найдено',
        empty: 'По вашему запросу ничего не найдено',
    },
    uz: {
        title: 'Vaucherlar',
        popular: 'Ommabop kategoriyalar',
        allCategories: 'Barcha kategoriyalar',
        results: 'Topildi',
        empty: 'So‘rovingiz bo‘yicha hech narsa topilmadi',
    },
    en: {
        title: 'Vouchers',
        popular: 'Popular categories',
        allCategories: 'All categories',
        results: 'Found',
        empty: 'Nothing found for your query',
    },
} as const;

const CategoryScreen: React.FC<any> = ({ navigation }) => {
    const { language } = useLocalization();
    const copy = copyByLanguage[language];

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const allCategories = useMemo(() => mockCategories[language], [language]);

    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return allCategories;
        }

        return allCategories.filter(item => {
            const name = item.name.toLowerCase();
            const subtitle = item.subtitle.toLowerCase();
            return name.includes(query) || subtitle.includes(query);
        });
    }, [allCategories, searchQuery]);

    const featuredCategories = useMemo(
        () => allCategories.filter(item => item.popular).slice(0, 4),
        [allCategories],
    );

    const itemSize = useMemo(() => {
        const width = Dimensions.get('window').width;
        return Math.floor((width - PADDING * 2 - GAP) / 2);
    }, []);

    const openCategory = useCallback(
        (category: CategoryItem) => {
            navigation.navigate('Vouchers', {
                categoryId: category.id,
                categoryName: category.name,
            });
        },
        [navigation],
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 450);
    }, []);

    return (
        <View style={styles.container}>
            <GradientHeader title={copy.title} />

            <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.gridRow}
                ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={
                    <View>
                        <View style={styles.searchWrap}>
                            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
                        </View>

                        <Text style={styles.sectionTitle}>{copy.popular}</Text>
                        <FlatList
                            horizontal
                            data={featuredCategories}
                            keyExtractor={(item) => `featured-${item.id}`}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredList}
                            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => openCategory(item)}
                                    style={({ pressed }) => [styles.featuredCard, pressed ? styles.featuredCardPressed : null]}
                                >
                                    <LinearGradient colors={item.accent} style={styles.featuredGradient}>
                                        <Ionicons name={item.icon} size={20} color="#111827" />
                                        <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.featuredSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                    </LinearGradient>
                                </Pressable>
                            )}
                        />

                        <View style={styles.allHeaderRow}>
                            <Text style={styles.sectionTitle}>{copy.allCategories}</Text>
                            <Text style={styles.resultsText}>{copy.results}: {filteredCategories.length}</Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => openCategory(item)}
                        style={({ pressed }) => [
                            styles.gridCard,
                            { width: itemSize, minHeight: itemSize - 8 },
                            pressed ? styles.gridCardPressed : null,
                        ]}
                    >
                        <LinearGradient colors={item.accent} style={styles.gridIconWrap}>
                            <Ionicons name={item.icon} size={24} color="#111827" />
                        </LinearGradient>

                        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.gridSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons name="search-outline" size={26} color="#9CA3AF" />
                        <Text style={styles.emptyText}>{copy.empty}</Text>
                    </View>
                }
            />
        </View>
    );
};

export default CategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F6F4',
    },
    listContent: {
        paddingBottom: 24,
    },
    searchWrap: {
        paddingHorizontal: PADDING,
        paddingTop: PADDING,
        paddingBottom: 6,
    },
    sectionTitle: {
        paddingHorizontal: PADDING,
        marginTop: 12,
        marginBottom: 10,
        fontSize: 20,
        fontWeight: '700',
        color: '#191B22',
    },
    featuredList: {
        paddingHorizontal: PADDING,
        paddingBottom: 2,
    },
    featuredCard: {
        width: 196,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 3,
    },
    featuredCardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.985 }],
    },
    featuredGradient: {
        minHeight: 116,
        paddingHorizontal: 14,
        paddingVertical: 14,
        justifyContent: 'space-between',
    },
    featuredName: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    featuredSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: '#4B5563',
    },
    allHeaderRow: {
        marginTop: 8,
        marginBottom: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: PADDING,
    },
    resultsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#757C89',
    },
    gridRow: {
        gap: GAP,
        paddingHorizontal: PADDING,
    },
    gridCard: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        padding: 12,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ECE7E2',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
    },
    gridCardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.985 }],
    },
    gridIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridName: {
        marginTop: 12,
        fontSize: 15,
        fontWeight: '700',
        color: '#191B22',
    },
    gridSubtitle: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 17,
        color: '#757C89',
    },
    emptyWrap: {
        marginTop: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
        lineHeight: 21,
    },
});
