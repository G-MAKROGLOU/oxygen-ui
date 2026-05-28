## [5.0.2](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v5.0.1...v5.0.2) (2026-05-28)


### Bug Fixes

* **animations:** Notification + Wizard — visible enter/exit motion ([2abab65](https://github.com/G-MAKROGLOU/oxygen-ui/commit/2abab655076eb42d88ad01ecd2ce40ca01a08217))

## [5.0.1](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v5.0.0...v5.0.1) (2026-05-28)


### Bug Fixes

* critical bug batch — LoadingSpinner colour, Switch text leak, NumberInput corners, TreeSelect focus ([0355df1](https://github.com/G-MAKROGLOU/oxygen-ui/commit/0355df181571b1d318d0866dfc867b04903570ca))

# [5.0.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v4.0.0...v5.0.0) (2026-05-28)


* feat(DatePicker)!: Phase 5e — keyboard-navigable grid calendar rewrite ([6653e2b](https://github.com/G-MAKROGLOU/oxygen-ui/commit/6653e2be94ba9f02399ba9ebfc30105c692e8ab7))


### BREAKING CHANGES

* `DatePicker.value` is no longer required (`Date` →
`Date | null | undefined`). `disableBefore`/`disableAfter` are replaced
by `min`/`max` (Date only — string accepted previously is gone).
`onChange` signature changed: the previous synthetic event shape
`(e: { target: { value: Date, ... } }) => void` is replaced with
`(date: Date | null) => void`. Inline migration:

```diff
- onChange={({ target }) => setField('date', target.value)}
+ onChange={(date) => setField('date', date)}
```

Test count: 109 → 123 (+14).

Verified: typecheck, lint, 123/123 tests, library build, Storybook build.


# [4.0.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v3.0.0...v4.0.0) (2026-05-28)


* feat(TreeSelect)!: Phase 5d — actual hierarchical tree-select with keyboard nav ([e057618](https://github.com/G-MAKROGLOU/oxygen-ui/commit/e05761881d6e910a28ca2dccc8f2aa98d1b63833))


### BREAKING CHANGES

* TreeSelect now expects hierarchical `TreeSelectNode[]`
with optional `children`, not flat `TreeSelectItem[]`. The old
type-alias `TreeSelectItem` was removed; rename it to `TreeSelectNode`
in your imports. Flat consumers can pass an array with no `children`
on any node and the component behaves like the previous single-select.
The trigger is now a `<button>` not a `<div>` — any styles targeting
the previous `div[role="combobox"]` will need to update the selector.

Test count: 99 → 109 (+10).

Verified: typecheck, lint, 109/109 tests, library build.


# [3.0.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v2.0.0...v3.0.0) (2026-05-28)


* feat(Wizard)!: Phase 5a — SSR-safe portaled rewrite with focus trap ([130ea54](https://github.com/G-MAKROGLOU/oxygen-ui/commit/130ea54f2306425195480ce76b8f9472a6769694))


### BREAKING CHANGES

* `WizardStep.positioning?: 'natural' | 'center'` is
replaced by `WizardStep.placement?: 'right' | 'left' | 'top' | 'bottom'`.
The old values silently mapped to "right" and "centred over target"
respectively; the new model is explicit and supports four sides.
Consumers using `positioning` need to switch to `placement` — the
mapping is `'natural'` → `'right'` and `'center'` → `'bottom'` (closest
visual equivalent). Also: the default `storageKey` changed from
`'po_wizard'` to `'oxygen.wizard.completed'` so existing users get the
tour again. Pass `'po_wizard'` explicitly to preserve the old key.

Test count: 86 → 99 (+13).

Verified: typecheck, lint, 99/99 tests, library build.


# [2.0.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.9.0...v2.0.0) (2026-05-28)


* feat(ContextMenu)!: Phase 5b — rebuild on @radix-ui/react-context-menu ([308c4d0](https://github.com/G-MAKROGLOU/oxygen-ui/commit/308c4d06dd492ec6171125dc00124b9c5931b171))


### BREAKING CHANGES

* ContextMenu is now trigger-based instead of
coordinate-controlled. The previous API was:

```tsx
<ContextMenu
  items={items}
  position={{ x, y }}
  visible={visible}
  onClose={() => setVisible(false)}
/>
```

The new API wraps the right-clickable element directly:

```tsx
<ContextMenu items={items}>
  <Card vessel={vessel} />
</ContextMenu>
```

The new model is more idiomatic (matches the OS context-menu pattern), but
existing consumers managing `position` / `visible` state will need to
remove that state and wrap their target subtree. `ContextMenuPosition` is
re-exported as `@deprecated` so old imports keep compiling.

Test count: 81 → 86 (+5).

Verified: typecheck, lint, 86/86 tests, library build.


# [1.9.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.8.0...v1.9.0) (2026-05-28)


### Features

* **NumberInput:** Phase 5c — full rewrite with keyboard a11y + FP precision ([395742f](https://github.com/G-MAKROGLOU/oxygen-ui/commit/395742fc17468d15c8ec3d961db443b499ebfe5b))

# [1.8.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.7.5...v1.8.0) (2026-05-28)


### Features

* **LoadingSpinner:** enterprise visual redesign + size & inline variants ([90ee834](https://github.com/G-MAKROGLOU/oxygen-ui/commit/90ee834e86e452137ea1ddeb10131918912427de))

## [1.7.5](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.7.4...v1.7.5) (2026-05-28)


### Bug Fixes

* **a11y:** Phase 3 — form-error linkage + keyboard handlers on option items ([48ef9f5](https://github.com/G-MAKROGLOU/oxygen-ui/commit/48ef9f5455ee9f2d1223c67c69ddb143008c36c4))

## [1.7.4](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.7.3...v1.7.4) (2026-05-28)


### Bug Fixes

* **ThemeProvider:** sanitize CSS values before dangerouslySetInnerHTML ([645d6c8](https://github.com/G-MAKROGLOU/oxygen-ui/commit/645d6c8a99559b32530019741a6312ab2a55a7c7))

## [1.7.3](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.7.2...v1.7.3) (2026-05-28)


### Bug Fixes

* **Table:** generic typing + real <table> semantics + memoized search ([4c206c6](https://github.com/G-MAKROGLOU/oxygen-ui/commit/4c206c6fc75243f84172b70e9e92a17f94ef8d54))

## [1.7.2](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.7.1...v1.7.2) (2026-05-28)


### Bug Fixes

* **LoadingSpinner:** rebuild on Framer Motion + Tailwind animate-spin ([fccb36c](https://github.com/G-MAKROGLOU/oxygen-ui/commit/fccb36cc9e1290c29887aa8c1f9f5bc2f0f7cc13))

## [1.7.1](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.7.0...v1.7.1) (2026-05-28)


### Bug Fixes

* **components:** Phase 1a — bug-fix sweep across healthy components ([34d4513](https://github.com/G-MAKROGLOU/oxygen-ui/commit/34d45130587e8d2a93aebe08e86d7b0046a213f0))

# [1.7.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.6.2...v1.7.0) (2026-05-28)


### Features

* add reusable <Portal> helper + fix all unportaled fixed overlays ([3237641](https://github.com/G-MAKROGLOU/oxygen-ui/commit/3237641fc8f781f10025a219346ff86aaaf569d7))

## [1.6.2](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.6.1...v1.6.2) (2026-05-28)


### Bug Fixes

* **notification:** decouple opacity/position timing so motion is visible ([9bae224](https://github.com/G-MAKROGLOU/oxygen-ui/commit/9bae224cd63ba0eee36919fb9f7f9f3730d1ab9e))

## [1.6.1](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.6.0...v1.6.1) (2026-05-28)


### Bug Fixes

* **notification:** replace horizontal slide with y+scale animation ([0506f50](https://github.com/G-MAKROGLOU/oxygen-ui/commit/0506f50582491e5e8c06ce91701fe2290f692d8c))

# [1.6.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.5.3...v1.6.0) (2026-05-28)


### Features

* **notification:** animated enter/exit + countdown progress bar ([83b32ba](https://github.com/G-MAKROGLOU/oxygen-ui/commit/83b32ba3c197d704bfda61b24a6005489129a871))

## [1.5.3](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.5.2...v1.5.3) (2026-05-28)


### Bug Fixes

* styled Architecture table + Tooltip background color ([d274313](https://github.com/G-MAKROGLOU/oxygen-ui/commit/d274313cebc4d92a57ec2492ca07bb6d6ebaa05d))

## [1.5.2](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.5.1...v1.5.2) (2026-05-28)


### Bug Fixes

* resolve CI failures — lint unused imports + MDX emphasis parser crash ([f75bbd9](https://github.com/G-MAKROGLOU/oxygen-ui/commit/f75bbd941689aa8116d28fc2a7cb57d41e72f2b3))

## [1.5.1](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.5.0...v1.5.1) (2026-05-28)


### Bug Fixes

* MDX table rendering, sidebar sort order, remark-gfm ([fe65cf3](https://github.com/G-MAKROGLOU/oxygen-ui/commit/fe65cf37c9f8dc5babd390216a98d95beb998be3))

# [1.5.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.4.0...v1.5.0) (2026-05-28)


### Features

* SCSS migration + full design token parameterization ([4778546](https://github.com/G-MAKROGLOU/oxygen-ui/commit/47785467b73014de6b64313ffcd1e3b250ed02da))

# [1.4.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.3.0...v1.4.0) (2026-05-27)


### Features

* Phase E — fixes, new components, enterprise polish, dark mode stories ([6db1905](https://github.com/G-MAKROGLOU/oxygen-ui/commit/6db1905626e990a787102cd8794f2a255d6b6d50)), closes [#eef4fa](https://github.com/G-MAKROGLOU/oxygen-ui/issues/eef4fa)

# [1.3.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.2.0...v1.3.0) (2026-05-27)


### Features

* Phase C — Button variants, TopBar, ThemeSwitch cleanup, Notification animation ([64b2279](https://github.com/G-MAKROGLOU/oxygen-ui/commit/64b22792b7fe241cef5aabaad92405c99e41b776)), closes [#fff](https://github.com/G-MAKROGLOU/oxygen-ui/issues/fff)
* Phase D — MSW + Storybook integration for async story patterns ([2f143b8](https://github.com/G-MAKROGLOU/oxygen-ui/commit/2f143b894aece4e31b02448f596883956350602e))

# [1.2.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.1.0...v1.2.0) (2026-05-27)


### Features

* Phase B — design token layer (CSS vars, semantic tokens, Tailwind extension) ([f4d7b46](https://github.com/G-MAKROGLOU/oxygen-ui/commit/f4d7b468565dc8c0afbb826f23864561432dc08e))

# [1.1.0](https://github.com/G-MAKROGLOU/oxygen-ui/compare/v1.0.0...v1.1.0) (2026-05-27)


### Features

* Phase A — Tree fix, Framer Motion animations, PRODUCT.md ([910e21f](https://github.com/G-MAKROGLOU/oxygen-ui/commit/910e21f464733f27fe9890520f43d38eff7a8a08))

# 1.0.0 (2026-05-27)


### Bug Fixes

* rename postcss/tailwind configs to .cjs (package type is module) ([c787af1](https://github.com/G-MAKROGLOU/oxygen-ui/commit/c787af12ad995432bb436b83a564c4deef273255))


### Features

* initial @vesops/ui standalone package ([f82d1ef](https://github.com/G-MAKROGLOU/oxygen-ui/commit/f82d1ef9267755ce4a5bca6604c00c3c7be07f11))
* rename to @oxygen/ui, add ESLint, semantic-release, and CI/CD pipeline ([5b90355](https://github.com/G-MAKROGLOU/oxygen-ui/commit/5b903556d7542d9fb268570b358275af73415dce))
