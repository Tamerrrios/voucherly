// import { createRef } from "react";
// import {
//   CommonActions,
//   StackActions,
//   type NavigationContainerRef,
// } from "@react-navigation/native";
// import type { RootStackParamList } from "./types";
// import { Routes as R } from "./types";


// export type RouteName = keyof RootStackParamList;
// export type ScreenParams<T extends RouteName> =
//   RootStackParamList[T] extends undefined ? undefined : RootStackParamList[T];

// export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

// class _Navigation {
//   getParent() {
//     throw new Error('Method not implemented.');
//   }
//       Routes = R;
//   /** Получить текущий маршрут */
//   getCurrentRoute = () => {
//     return navigationRef.current?.getCurrentRoute() ?? null;
//   };

//   /** Вернуться назад */
//   goBack = (timeoutMs = 0) => {
//     const action = CommonActions.goBack();
//     setTimeout(() => navigationRef.current?.dispatch(action), timeoutMs);
//   };

// /** Перейти на экран */
// navigate = <T extends RouteName>(
//   routeName: T,
//   params?: ScreenParams<T>,
//   timeoutMs = 0
// ) => {
//   setTimeout(() => {
//     navigationRef.current?.navigate({
//       name: routeName,
//       params,
//     } as never);
//   }, timeoutMs);
// };

//   /** Пуш в стек */
//   push = <T extends RouteName>(
//     routeName: T,
//     params?: ScreenParams<T>,
//     timeoutMs = 0
//   ) => {
//     const action = StackActions.push(routeName, params);
//     setTimeout(() => navigationRef.current?.dispatch(action), timeoutMs);
//   };

//   /** Заменить текущий экран */
//   replace = <T extends RouteName>(
//     routeName: T,
//     params?: ScreenParams<T>,
//     timeoutMs = 0
//   ) => {
//     const action = StackActions.replace(routeName, params);
//     setTimeout(() => navigationRef.current?.dispatch(action), timeoutMs);
//   };

//   /** Сбросить стек и открыть экран */
//   reset = <T extends RouteName>(routeName: T, params?: ScreenParams<T>) => {
//     setTimeout(() => {
//       navigationRef.current?.reset({
//         index: 0,
//         routes: [{ name: routeName, params }],
//       });
//     }, 0);
//   };

//   /** Вернуться на корень стека */
//   popToTop = () => {
//     const action = StackActions.popToTop();
//     setTimeout(() => navigationRef.current?.dispatch(action), 0);
//   };

//   /** Вернуться на конкретный экран */
//   popTo = <T extends RouteName>(routeName: T) => {
//     const action = StackActions.popTo(routeName);
//     setTimeout(() => navigationRef.current?.dispatch(action), 0);
//   };

//   /** Слушатель изменения состояния */
//   onStateChange = () => {
//     const currentRoute = this.getCurrentRoute();
//     if (currentRoute?.name) {
//       // сюда можно вставить аналитику
//     }
//   };
// }

// export const Navigation = new _Navigation();

// /** Упрощённые прямые функции */
// export const navigate = Navigation.navigate;
// export const goBack = Navigation.goBack;

import { createRef } from "react";
import {
  CommonActions,
  StackActions,
  TabActions,                 // 👈 добавить
  type NavigationContainerRef,
} from "@react-navigation/native";
import type { RootStackParamList } from "./types";
import { Routes as R } from "./types";
// (опц) если у тебя есть тип табов:
// import type { TabParamList } from "./types";

export type RouteName = keyof RootStackParamList;
export type ScreenParams<T extends RouteName> =
  RootStackParamList[T] extends undefined ? undefined : RootStackParamList[T];

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

class _Navigation {
  // 🔧 Реализуем getParent()
  getParent() {
    // parent = верхний навигатор (у твоих экранов это BottomTabs)
    return (navigationRef.current as any)?.getParent?.();
  }

  Routes = R;

  getCurrentRoute = () => navigationRef.current?.getCurrentRoute() ?? null;

  jumpToHomeTab = () => {
  navigationRef.current?.dispatch(
    CommonActions.navigate({
      name: this.Routes.Main,
      params: { screen: this.Routes.Home },
    })
  );
};

  goBack = (timeoutMs = 0) => {
    const action = CommonActions.goBack();
    setTimeout(() => navigationRef.current?.dispatch(action), timeoutMs);
  };

  navigate = <T extends RouteName>(routeName: T, params?: ScreenParams<T>, timeoutMs = 0) => {
    setTimeout(() => {
      navigationRef.current?.navigate({ name: routeName, params } as never);
    }, timeoutMs);
  };

  push = <T extends RouteName>(routeName: T, params?: ScreenParams<T>, timeoutMs = 0) => {
    const action = StackActions.push(routeName, params);
    setTimeout(() => navigationRef.current?.dispatch(action), timeoutMs);
  };

  replace = <T extends RouteName>(routeName: T, params?: ScreenParams<T>, timeoutMs = 0) => {
    const action = StackActions.replace(routeName, params);
    setTimeout(() => navigationRef.current?.dispatch(action), timeoutMs);
  };

  reset = <T extends RouteName>(routeName: T, params?: ScreenParams<T>) => {
    setTimeout(() => {
      navigationRef.current?.reset({ index: 0, routes: [{ name: routeName, params }] });
    }, 0);
  };

  popToTop = () => {
    const action = StackActions.popToTop();
    setTimeout(() => navigationRef.current?.dispatch(action), 0);
  };

  popTo = <T extends RouteName>(routeName: T) => {
    const action = StackActions.popTo(routeName);
    setTimeout(() => navigationRef.current?.dispatch(action), 0);
  };

  onStateChange = () => {
    const currentRoute = this.getCurrentRoute();
    if (currentRoute?.name) {
      // аналитика, логирование и т.п.
    }
  };

  // 🆕 Переключение вкладки BottomTabs (Home, CategoryScreen, Profile)
  jumpToTab = (tabName: string /* или keyof TabParamList */) => {
    this.getParent()?.dispatch(TabActions.jumpTo(tabName as never));
  };
}

export const Navigation = new _Navigation();
export const navigate = Navigation.navigate;
export const goBack = Navigation.goBack;