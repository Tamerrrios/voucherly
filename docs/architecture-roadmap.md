# Voucherly Architecture Roadmap

## 1) Target architecture (practical, without overengineering)

```text
src/
  app/                    # app-level bootstrap, providers, navigation wiring
    providers/
    navigation/
  domain/                 # pure business types and rules (no RN/Firebase imports)
    auth/
      types.ts
      rules.ts
    vouchers/
      types.ts
      rules.ts
    orders/
      types.ts
      rules.ts
  data/                   # all IO: Firebase, storage, network, mappers
    firebase/
      client.ts
      collections.ts
    repositories/
      authRepository.ts
      partnersRepository.ts
      ordersRepository.ts
      mediaRepository.ts
    mappers/
      partnerMapper.ts
      voucherMapper.ts
      orderMapper.ts
  features/               # vertical slices by user flow
    auth/
      screens/
      hooks/
      useCases/
    home/
      screens/
      components/
      hooks/
      useCases/
    partner/
      screens/
      components/
      hooks/
      useCases/
    checkout/
      screens/
      hooks/
      useCases/
    profile/
      screens/
      hooks/
      useCases/
    deepLink/
      hooks/
      useCases/
  shared/                 # cross-feature UI/utils/theme
    ui/
    theme/
    hooks/
    utils/
    constants/
    types/
```

## 2) Responsibility boundaries

- `features/*/screens`:
  - compose UI + call feature hooks/useCases.
  - no direct Firestore/Storage calls.
- `features/*/useCases`:
  - orchestration of business flow (validation, compose payload, retries, side effects ordering).
- `data/repositories`:
  - only place for Firebase SDK calls.
  - return typed entities, not raw document snapshots.
- `domain/*`:
  - source of truth for core types + business invariants.
- `shared/*`:
  - reusable UI primitives and utilities.

## 3) Mapping from current project to target

- `src/context/AuthContext.tsx` -> keep as app session state, move Firebase operations to `data/repositories/authRepository.ts`.
- `src/context/PartnersContext.tsx` -> keep as cache layer, fetch via `features/home/useCases/loadHomeData.ts`.
- `src/context/OrderContext.tsx` -> keep as checkout draft state.
- `src/api/homeApi.ts` -> split into:
  - `data/repositories/partnersRepository.ts`
  - `data/repositories/mediaRepository.ts`
- `src/screens/CheckoutScreen.tsx` -> split flow into:
  - `features/checkout/useCases/createOrder.ts`
  - `features/checkout/useCases/uploadAttachment.ts`
  - `features/checkout/useCases/generateVoucherCode.ts`
- `src/context/PendingGiftContext.tsx` -> keep provider, extract parser/use-case to `features/deepLink/useCases/parseGiftLink.ts`.

## 4) Iteration plan (2 sprints)

## Iteration 1 (stabilize architecture, no UX changes)

Goal: remove direct Firebase access from screens and centralize IO.

Tasks:
1. Create base folders: `src/domain`, `src/data`, `src/features`, `src/shared`.
2. Introduce typed entities:
   - `domain/vouchers/types.ts`
   - `domain/orders/types.ts`
   - `domain/auth/types.ts`
3. Extract repositories from `homeApi.ts`:
   - partners/banners/categories read ops
   - media upload op
4. Refactor `CheckoutScreen` to use a single `createOrder` use-case.
5. Keep current contexts API-compatible (no breaking changes for screens).

Exit criteria:
- No `firestore()` or `storage()` inside screens.
- `homeApi.ts` either removed or re-exporting repository methods temporarily.
- Build passes on iOS/Android.

## Iteration 2 (feature modularization)

Goal: vertical slices and easier independent development.

Tasks:
1. Move screens under `features/*/screens` (with barrel exports).
2. Move feature-specific components from `src/components` to each feature.
3. Keep truly generic components in `shared/ui`.
4. Move navigation type definitions into `app/navigation` and keep a single source for `TabParamList`.
5. Add lightweight use-case tests for:
   - order creation payload builder
   - deep link parser
   - partner filtering/search

Exit criteria:
- Feature folders own their screens + use-cases.
- Duplicate route/type definitions eliminated.
- 3–5 use-case tests green.

## 5) Immediate technical debt to fix first

1. Duplicate/competing tab types (`navigation/types/index.ts` vs `navigation/types/TabParamList.ts`).
2. `index.js` global handler uses `Alert` without import.
3. `config/firebaseConfig.ts` duplicates another Firebase init style (web SDK placeholder) and should be removed or clearly marked unused.
4. Empty `services/` and `store/` folders should either be adopted with defined purpose or removed to avoid architectural ambiguity.

## 6) Team conventions to lock in

- One file = one responsibility.
- UI components should be mostly stateless and typed.
- `any` is forbidden for new code; use domain types.
- All external IO behind repositories.
- New business logic starts in use-cases, not in screens.
- Keep route names and params in a single canonical module.

## 7) Suggested first PR sequence

1. PR-1: Navigation type unification + dead config cleanup.
2. PR-2: Repositories extraction from `homeApi.ts`.
3. PR-3: Checkout use-case extraction (no UI changes).
4. PR-4: Deep link parser extraction + tests.
5. PR-5: Feature folder migration (home + checkout first).
