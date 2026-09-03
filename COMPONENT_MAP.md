# Component Map

Use these names when turning the imported HTML layers into Figma components and variants.

## Foundations

- `Foundation/Color`: Light-mode background, foreground, muted, accent, border, popover, success, warning, destructive, and NTVE blue.
- `Foundation/Type`: SF/system text at 12, 14, 16, and 17; display text at 18, 20, and 46; 13px monospaced code.
- `Foundation/Space`: 6, 10, 16, 24, and 32.
- `Foundation/Radius`: 10 small, 16 medium, 24 large, and 28 pill.
- `Foundation/Elevation`: main card, floating popover, selected/pressed, and focus ring.
- `Foundation/Motion`: fast 220ms, standard 380ms, relaxed 520ms spring references.

## Primitives

- `Control/Icon Button`: default, hover, selected, focused, disabled; sizes 32, 36, and 44.
- `Control/Shell Button`: default, selected/close, disabled, busy.
- `Control/Panel Actions`: two-action and three-action groups.
- `Control/Button`: primary, outline, secondary, ghost, destructive; regular and compact.
- `Control/Field`: idle, focused, populated, disabled, error.
- `Control/Pill`: agent, model, reasoning, status.
- `Feedback/Status Icon`: running, waiting, paused, completed, failed, idle.
- `Surface/Card`: plain, muted, selected, hover, focus.
- `Structure/Divider`: horizontal and vertical.
- `Structure/Resize Handle`: idle and dragging.

## Navigation and app chrome

- `Navigation/Rail`: Create selected, Library selected, Agent selected, collapsed.
- `Navigation/Rail Item`: default, selected, pressed.
- `Navigation/Library Drawer`: closed and open.
  - Header and close control
  - New Task and Add Project action cards
  - In Progress section
  - Project group: collapsed and expanded
  - Session row: default, selected, active, failed
  - Filter: hidden and shown
- `Chrome/App Bar`: Home/Create and Agent/Chat variants.
- `Chrome/Route Title`: Create, Agent breadcrumb, title-editing.
- `Chrome/Panel Cluster`: Open closed/open, Preview closed/open, panel actions visible.

## Overlays

- `Overlay/Command Search`: default, query entered, result highlighted, no results.
- `Overlay/Command Section`: Actions, Appearance, Tasks, Projects.
- `Overlay/Command Row`: standard, detail, shortcut, selected, highlighted.
- `Overlay/Scrim`: Library 16% and command search 35%.

Settings destinations may appear as inert shell labels, but no Settings screen belongs in this library.

## Home / Create

- `Home/Canvas`: wide studio and narrowed-by-panel.
- `Home/Launch Header`: eyebrow, title, supporting copy, project selector.
- `Home/Prompt Composer`: empty, focused, filled, disabled, error.
- `Home/Runtime Selector`: full and compact.
- `Home/Quick Start`: Build, Understand, Review, Reimagine; full-card and compact-row variants.
- `Home/Workspace Card`: populated and no-project.
- `Home/Metric`: Files and Sessions.
- `Home/Recent Work`: populated and empty.

## Agent / Chat

- `Agent/Conversation Canvas`: empty, populated, working.
- `Agent/Initial State`: preparing, ready, setup failed.
- `Agent/Turn`: user-only, assistant response, working, queued, error.
- `Agent/User Bubble`: standard and system.
- `Agent/Process Group`: reasoning, file exploration, edit, command, subagent.
- `Agent/Response Metadata` and `Agent/Response Actions`.
- `Agent/Composer`: idle, focused, working/Stop, disabled, error, with review chips.
- `Agent/Composer Control`: agent, model, reasoning, send, stop.

## Open / Code Editor

- `Open/Panel`: closed, trailing, paired-with-Preview, expanded.
- `Open/Quick Toolbar`: navigator hidden/shown, search idle/focused/results.
- `Open/Activity Rail`: Files, Source Control, Graph; default and selected.
- `Open/File Navigator`: filter, folder expanded/collapsed, file default/selected.
- `Open/Tab Bar`: single, multiple, selected, dirty.
- `Open/Editor`: empty, Swift filler code, unsupported-file, loading, error.
- `Open/Recovery Banner`: hidden and shown.

Normal trailing mode uses quick-open and hides the activity rail. Expanded mode shows the 44px activity rail and persistent navigator.

## Preview

- `Preview/Panel`: closed, trailing, paired-with-Open, expanded.
- `Preview/Approximation Banner`: shown and dismissed.
- `Preview/Live Draft Banner`: hidden and shown.
- `Preview/Canvas`: filler app, loading, empty root, failed.
- `Preview/Diagnostics`: collapsed and expanded.

## Run dropdown

- `Run/Trigger`: closed, open, busy, disabled.
- `Run/Menu`: open visual state with Preview and Run on Device choices.
- `Run/Build Stage`: Preparing, Uploading, Waiting, Registering, Building, Signing, Verifying, Opening Installer.

The current Swift app implements the wide-layout Run control as a direct Run-on-device button; only compact overflow uses a native menu. The explicit Run dropdown in this library is therefore a user-directed visual variant, using the app's existing Preview and Run-on-device concepts. Its actions remain inert.

## Full compositions

- `Composition/Home`: default; Library open; command search open.
- `Composition/Agent`: empty, populated, working.
- `Composition/Home + Open` and `Composition/Agent + Open`.
- `Composition/Home + Preview` and `Composition/Agent + Preview`.
- `Composition/Open + Preview`: Open in the primary column, Preview trailing.
- `Composition/Open Expanded` and `Composition/Preview Expanded`.
- `Composition/Run Dropdown Open`.

For every panel composition, retain the 12px resize hit strip, 4px idle grip, 5px dragging grip, default 40% trailing width, 80px minimum width, and 6%–93% clamp range.
