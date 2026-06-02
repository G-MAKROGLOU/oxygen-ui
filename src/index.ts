// ─── Design Tokens ───────────────────────────────────────────────────────────
// Full token set: import { vars, semanticTokens, palette } from '@geomak/ui'
// Subpath import:  import { vars } from '@geomak/ui/tokens'
export { vars, semanticTokens, palette } from './tokens'
export type {
    SemanticColorKey, SemanticSharedKey,
    VarColorKey, VarRadiusKey, VarShadowKey,
    VarTypoKey, VarDensityKey, VarMotionKey, VarZIndexKey,
} from './tokens'

// ─── Utilities ────────────────────────────────────────────────────────────────
export { default as COLORS } from './utils/colors'

// ─── Icons ────────────────────────────────────────────────────────────────────
export { default as Icon } from './icons/icons'

// ─── Layout components ───────────────────────────────────────────────────────
// Structural primitives that re-anchor or compose rendering.
//
// Portal — SSR-safe DOM relocator. Wrap any `position: fixed` element in
// `<Portal>` to escape ancestor `transform` / `filter` / `contain` containing
// blocks. Use whenever a component anchors itself to the viewport (overlays,
// drawers, full-screen loaders). See `src/components/layout/Portal.tsx` for
// the full rationale and examples.
export { default as Portal } from './components/layout/Portal'
export type { PortalProps } from './components/layout/Portal'

// Box / Flex / Grid — tokenised layout primitives. Use them in place of
// className-only `<div>`s when you want padding, surface, border, radius,
// shadow, or flex/grid behaviour spelled out via design-system tokens.
export { default as Box } from './components/layout/Box'
export type {
    BoxProps,
    Spacing,
    BoxBackground,
    BoxBorder,
    BoxRadius,
    BoxShadow,
} from './components/layout/Box'

export { default as Flex } from './components/layout/Flex'
export type {
    FlexProps,
    FlexDirection,
    FlexAlign,
    FlexJustify,
    FlexWrap,
} from './components/layout/Flex'

export { default as Grid } from './components/layout/Grid'
export type { GridProps } from './components/layout/Grid'

// ─── Core components ─────────────────────────────────────────────────────────
// Avatar — circular / rounded-square user avatar with image-fallback +
// optional presence dot. Built on `@radix-ui/react-avatar`.
export { default as Avatar } from './components/core/Avatar'
export type {
    AvatarProps,
    AvatarSize,
    AvatarShape,
    AvatarStatus,
} from './components/core/Avatar'

// Typography — polymorphic text primitive with semantic variants
// (display / h1-h4 / subtitle / body / caption / overline / code).
export { default as Typography } from './components/core/Typography'
export type {
    TypographyProps,
    TypographyVariant,
    TypographyColor,
    TypographyWeight,
    TypographyAlign,
} from './components/core/Typography'


export { default as IconButton } from './components/core/IconButton'
export type { IconButtonProps } from './components/core/IconButton'

export { default as MenuButton } from './components/core/MenuButton'
export type { MenuButtonProps, MenuButtonItem } from './components/core/MenuButton'

export { default as Modal } from './components/core/Modal'
export type { ModalProps, ModalSize } from './components/core/Modal'

export { default as Drawer } from './components/core/Drawer'
export type { DrawerProps, DrawerSize } from './components/core/Drawer'

export { default as Tooltip, TooltipProvider } from './components/core/Tooltip'
export type { TooltipProps } from './components/core/Tooltip'

export { default as Tabs } from './components/core/Tabs'
export type {
    TabsProps,
    TabsListProps,
    TabsTriggerProps,
    TabsPanelProps,
    TabsAddProps,
    TabsVariant,
    TabsSize,
    TabsOrientation,
} from './components/core/Tabs'

export { default as Tree } from './components/core/Tree'
export type { TreeProps, TreeNode, TreeItemClickPayload } from './components/core/Tree'

export { default as Accordion } from './components/core/Accordion'
export type { AccordionProps, AccordionItemProps } from './components/core/Accordion'

export { default as Breadcrumbs } from './components/core/Breadcrumbs'
export type { BreadcrumbsProps, BreadcrumbItem } from './components/core/Breadcrumbs'

export { default as Badge } from './components/core/Badge'
export type { BadgeProps, BadgeTone, BadgeVariant, BadgeSize } from './components/core/Badge'

export { default as Stepper } from './components/core/Stepper'
export type { StepperProps, StepperStep, StepperActiveStatus } from './components/core/Stepper'

export { default as Timeline } from './components/core/Timeline'
export type { TimelineProps, TimelineEvent, TimelineStatus } from './components/core/Timeline'

export { default as Kbd } from './components/core/Kbd'
export type { KbdProps, KbdSize } from './components/core/Kbd'

export { default as Card } from './components/core/Card'
export type { CardProps, CardMediaProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './components/core/Card'

export { default as CardCarousel } from './components/core/CardCarousel'
export type { CardCarouselProps } from './components/core/CardCarousel'

export { default as Chat } from './components/core/Chat'
export type { ChatProps, ChatMessage } from './components/core/Chat'

export { default as Statistic } from './components/core/Statistic'
export type { StatisticProps, StatisticDelta, StatisticSize, DeltaDirection } from './components/core/Statistic'

export { default as FAB } from './components/core/FAB'
export type { FABProps, FABAction, FABPosition, FABSize, FABTone } from './components/core/FAB'

export { default as PopConfirm } from './components/core/PopConfirm'
export type { PopConfirmProps, PopConfirmTone } from './components/core/PopConfirm'

export { default as LogoutTimer } from './components/core/LogoutTimer'
export type { LogoutTimerProps } from './components/core/LogoutTimer'

export { default as Scheduler } from './components/core/Scheduler'
export type { SchedulerProps, SchedulerEvent, SchedulerView, SchedulerRange } from './components/core/Scheduler'

export { default as Cart } from './components/core/Cart'
export type { CartProps, CartLineItem, CartSummaryRow } from './components/core/Cart'

export { CartProvider, useCart } from './components/core/CartProvider'
export type { CartProviderProps, CartContextValue, CartItemInput } from './components/core/CartProvider'

export { default as CartButton } from './components/core/CartButton'
export type { CartButtonProps } from './components/core/CartButton'

export { default as EmptyCart } from './components/core/EmptyCart'
export type { EmptyCartProps } from './components/core/EmptyCart'

export { default as Checkout } from './components/core/Checkout'
export type { CheckoutProps } from './components/core/Checkout'

export {
    NotificationProvider,
    useNotification,
} from './components/core/Notification'
export type { NotificationPayload } from './components/core/Notification'

export { default as LoadingSpinner } from './components/core/LoadingSpinner'
export type { LoadingSpinnerProps } from './components/core/LoadingSpinner'

export { default as FadingBase } from './components/core/FadingBase'
export type { FadingBaseProps } from './components/core/FadingBase'

export { default as List } from './components/core/List'
export type { ListProps, ListItem } from './components/core/List'

export { default as ScalableContainer } from './components/core/ScalableContainer'
export type { ScalableContainerProps } from './components/core/ScalableContainer'

export { default as GridCard } from './components/core/GridCard'
export type { GridCardProps, GridCardItem } from './components/core/GridCard'

export { default as OpaqueGridCard } from './components/core/OpaqueGridCard'
export type { OpaqueGridCardProps } from './components/core/OpaqueGridCard'

export { default as CatalogGrid } from './components/core/CatalogGrid'
export type { CatalogGridProps } from './components/core/CatalogGrid'

export { default as CatalogCarousel } from './components/core/CatalogCarousel'
export type { CatalogCarouselProps } from './components/core/CatalogCarousel'

export { default as Catalog } from './components/core/Catalog'
export type { CatalogProps } from './components/core/Catalog'

export { default as ContextMenu } from './components/core/ContextMenu'
export type {
    ContextMenuProps,
    ContextMenuActionItem,
    ContextMenuPosition,
} from './components/core/ContextMenu'

export { default as Wizard } from './components/core/Wizard'
export type { WizardProps, WizardStep } from './components/core/Wizard'

export { default as Table } from './components/core/Table'
export type {
    TableProps,
    TableColumn,
    PaginationOptions,
    ExpandRowOptions,
} from './components/core/Table'

/** Theme-toggle switch (moon/sun icons, accent track) */
export { default as ThemeSwitch } from './components/core/Switch'
export type { ThemeSwitchProps } from './components/core/Switch'

export { default as TopBar } from './components/core/TopBar'
export type { TopBarProps } from './components/core/TopBar'

export { default as Sidebar } from './components/core/Sidebar'
export type { SidebarProps, SidebarItem, SidebarSection } from './components/core/Sidebar'

export { default as MegaMenu } from './components/core/MegaMenu'
export type {
    MegaMenuProps,
    MegaMenuItemProps,
    MegaMenuPanelProps,
    MegaMenuSectionProps,
    MegaMenuLinkProps,
    MegaMenuFeaturedProps,
} from './components/core/MegaMenu'

export { default as AppShell } from './components/core/AppShell'
export type { AppShellProps } from './components/core/AppShell'

export { default as SecureLayout } from './components/core/SecureLayout'
export type { SecureLayoutProps } from './components/core/SecureLayout'

export { default as ThemeProvider } from './components/core/ThemeProvider'
export type {
    ThemeProviderProps,
    ThemeConfig,
    ThemeColors,
    ThemeRadius,
    ThemeShadows,
    ThemeTypography,
    ThemeDensity,
    ThemeMotion,
} from './components/core/ThemeProvider'

export { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonCard } from './components/core/Skeleton'
export type { SkeletonBoxProps, SkeletonTextProps, SkeletonCircleProps, SkeletonCardProps } from './components/core/Skeleton'

// ─── Input components ─────────────────────────────────────────────────────────
export { default as Button } from './components/inputs/Button'
export type { ButtonProps } from './components/inputs/Button'

export { default as TextInput } from './components/inputs/TextInput'
export type { TextInputProps } from './components/inputs/TextInput'

export { default as NumberInput } from './components/inputs/NumberInput'
export type { NumberInputProps } from './components/inputs/NumberInput'

export { default as Password } from './components/inputs/Password'
export type { PasswordProps } from './components/inputs/Password'

export { default as SearchInput } from './components/inputs/SearchInput'
export type { SearchInputProps } from './components/inputs/SearchInput'

export { default as Checkbox } from './components/inputs/Checkbox'
export type { CheckboxProps } from './components/inputs/Checkbox'

export { default as RadioGroup } from './components/inputs/RadioGroup'
export type { RadioGroupProps, RadioOption } from './components/inputs/RadioGroup'

/** Shared input field foundation — exported for consumers building custom inputs. */
export { Field, fieldShell, FieldLabel, FieldHelpIcon } from './components/inputs/_field'
export type { FieldProps, FieldShellOptions, FieldSize, FieldLabelProps } from './components/inputs/_field'

/** Form variant of Switch (custom thumb icons) */
export { default as Switch } from './components/inputs/Switch'
export type { SwitchInputProps } from './components/inputs/Switch'

export { default as Dropdown } from './components/inputs/Dropdown'
export type { DropdownProps, DropdownItem } from './components/inputs/Dropdown'

export { default as AutoComplete } from './components/inputs/AutoComplete'
export type { AutoCompleteProps } from './components/inputs/AutoComplete'

export { default as TreeSelect } from './components/inputs/TreeSelect'
export type { TreeSelectProps } from './components/inputs/TreeSelect'

export { default as FileInput } from './components/inputs/FileInput'
export type { FileInputProps } from './components/inputs/FileInput'

export { default as Temporal } from './components/inputs/DatePicker'
export type { DatePickerProps, TemporalPickerProps } from './components/inputs/DatePicker'

export { default as TextArea } from './components/inputs/TextArea'
export type { TextAreaProps } from './components/inputs/TextArea'

export { default as SegmentedControl } from './components/inputs/SegmentedControl'
export type { SegmentedControlProps, SegmentedOption } from './components/inputs/SegmentedControl'

export { default as Slider } from './components/inputs/Slider'
export type { SliderProps, SliderValue, SliderMark } from './components/inputs/Slider'

export { default as TagsInput } from './components/inputs/TagsInput'
export type { TagsInputProps } from './components/inputs/TagsInput'

export { default as OtpInput } from './components/inputs/OtpInput'
export type { OtpInputProps } from './components/inputs/OtpInput'

export { default as Rating } from './components/inputs/Rating'
export type { RatingProps } from './components/inputs/Rating'

export { default as TimePicker } from './components/inputs/TimePicker'
export type { TimePickerProps } from './components/inputs/TimePicker'

export { default as DateRangePicker } from './components/inputs/DateRangePicker'
export type { DateRangePickerProps, DateRange, DateRangePreset } from './components/inputs/DateRangePicker'

export { default as ColorPicker } from './components/inputs/ColorPicker'
export type { ColorPickerProps } from './components/inputs/ColorPicker'

// ── Form API ────────────────────────────────────────────────────────────────
// Zero-dependency form layer: useForm + <Form> + native validation +
// dynamic field arrays. See ./form for the full surface.
export {
    useForm,
    Form,
    FormField,
    useFormField,
    useFieldArray,
    useFormStore,
    FormContext,
    FormStore,
    runFieldRules,
    isRequired,
    patterns,
} from './form'
export type {
    UseFormReturn,
    FormProps,
    FormFieldProps,
    UseFormFieldOptions,
    FieldArrayItem,
    UseFieldArrayReturn,
    FormStoreOptions,
    ValidateTrigger,
    ErrorMap,
    FieldSnapshot,
    FieldBindings,
    FieldKind,
    FieldRule,
    FieldRules,
    RulesMap,
    FormValues,
} from './form'

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useLocalStorage } from './hooks/useLocalStorage'
export { useMediaQuery, useBreakpoint } from './hooks/useMediaQuery'
export type { Breakpoint, BreakpointState } from './hooks/useMediaQuery'
export { useJwt } from './hooks/useJwt'
export type { JwtResult } from './hooks/useJwt'

// ── Composite form components ─────────────────────────────────────────────────
export { default as CreditCardForm } from './components/forms/CreditCardForm'
export type { CreditCardFormProps, CreditCardValue } from './components/forms/CreditCardForm'
export {
    CARD_BRANDS,
    detectBrand,
    luhnValid,
    formatCardNumber,
    formatExpiry,
    onlyDigits,
    cardNumberError,
    expiryError,
    cvvError,
} from './components/forms/creditCard'
export type { CardBrand } from './components/forms/creditCard'
