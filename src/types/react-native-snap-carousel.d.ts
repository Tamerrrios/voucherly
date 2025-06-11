declare module 'react-native-snap-carousel' {
  import { Component } from 'react';
  import {
    FlatListProps,
    ViewStyle,
    StyleProp,
    ListRenderItemInfo,
  } from 'react-native';

  export interface CarouselProps<ItemT> extends Partial<FlatListProps<ItemT>> {
    data: ReadonlyArray<ItemT>;
    renderItem: (info: ListRenderItemInfo<ItemT>) => React.ReactNode;
    sliderWidth: number;
    itemWidth: number;
    layout?: 'default' | 'stack' | 'tinder';
    loop?: boolean;
    autoplay?: boolean;
    autoplayInterval?: number;
    inactiveSlideScale?: number;
    inactiveSlideOpacity?: number;
    containerCustomStyle?: StyleProp<ViewStyle>;
    contentContainerCustomStyle?: StyleProp<ViewStyle>;
  }

  export default class Carousel<ItemT> extends Component<CarouselProps<ItemT>> {}
}