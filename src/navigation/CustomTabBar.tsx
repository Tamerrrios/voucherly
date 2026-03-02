import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom - 8, 8),
        },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          // иконку берём из options.tabBarIcon, если она задана
          const iconNode =
            typeof options.tabBarIcon === "function"
              ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? "#E53935" : "#9CA3AF",
                size: 23,
              })
              : null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              //   testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.9}
              style={styles.tab}
            >
              <View style={styles.icon}>{iconNode}</View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? "#E53935" : "#7D8491",
                    fontWeight: isFocused ? "700" : "600",
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 6,
  },
  bar: {
    height: BAR_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ECE8E3",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 9 },
      },
      android: {
        elevation: 9,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  icon: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});