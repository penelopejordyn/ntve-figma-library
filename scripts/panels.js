(() => {
  "use strict";

  const DEFAULT_PANEL_FRACTION = 0.4;
  const MIN_PANEL_FRACTION = 0.06;
  const MAX_PANEL_FRACTION = 0.93;
  const MIN_PANEL_WIDTH = 80;
  const PANEL_KEYBOARD_STEP = 0.05;

  const DEFAULT_COMPACT_NAVIGATOR_WIDTH = 240;
  const MIN_NAVIGATOR_DRAG_WIDTH = 40;
  const MAX_COMPACT_NAVIGATOR_WIDTH = 340;
  const COMPACT_NAVIGATOR_FRACTION = 0.45;
  const EXPANDED_ACTIVITY_RAIL_WIDTH = 44;
  const EXPANDED_SEPARATOR_WIDTH = 2;
  const MIN_EDITOR_FRACTION = 0.58;
  const NAVIGATOR_KEYBOARD_STEP = 20;

  const STATE_CLASSES = [
    "panel-state-none",
    "panel-state-open",
    "panel-state-preview",
    "panel-state-both",
    "panel-state-open-expanded",
    "panel-state-preview-expanded",
  ];

  const numberOrNull = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const readFlag = (element, attributeName, fallback = false) => {
    if (!element.hasAttribute(attributeName)) return fallback;
    const value = element.getAttribute(attributeName).trim().toLowerCase();
    return !["false", "0", "no", "off"].includes(value);
  };

  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));

  const storage = {
    read(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_error) {
        return null;
      }
    },
    write(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_error) {
        // The demos still work when storage is unavailable (private/embed modes).
      }
    },
  };

  const panelKind = (toggle) => {
    const value = (toggle.dataset.panelToggle || "").trim().toLowerCase();
    if (["open", "editor", "code", "code-editor"].includes(value)) return "open";
    if (["preview", "run", "local-preview"].includes(value)) return "preview";
    return null;
  };

  const setBooleanData = (element, name, value) => {
    element.dataset[name] = value ? "true" : "false";
  };

  const setLengthVariable = (element, name, value) => {
    element.style.setProperty(name, `${Math.max(0, value).toFixed(2)}px`);
  };

  function initializePanelDemo(demo, index) {
    const layoutRoot =
      demo.querySelector("[data-panel-shell]") ||
      demo.querySelector("[data-panel-workspace]") ||
      demo;
    const openLayer =
      demo.querySelector('[data-panel-layer="open"]') ||
      demo.querySelector("[data-open-panel]");
    const previewLayer =
      demo.querySelector('[data-panel-layer="preview"]') ||
      demo.querySelector("[data-preview-panel]");
    const primaryLayer =
      demo.querySelector('[data-panel-layer="primary"]') ||
      demo.querySelector("[data-primary-layer]");

    const explicitIdentity = (demo.dataset.panelDemo || demo.id || "").trim();
    const identity = explicitIdentity || `demo-${index + 1}`;
    const persistenceEnabled = demo.dataset.panelPersist !== "false";
    const panelStorageKey = `ntve-figma-library:${identity}:panel-fraction`;
    const navigatorStorageKey = `ntve-figma-library:${identity}:navigator-width`;

    let open = readFlag(
      demo,
      "data-open",
      demo.classList.contains("is-open") || demo.classList.contains("panel-state-open")
    );
    let preview = readFlag(
      demo,
      "data-preview",
      demo.classList.contains("is-preview") || demo.classList.contains("panel-state-preview")
    );

    const storedFraction = persistenceEnabled
      ? numberOrNull(storage.read(panelStorageKey))
      : null;
    const authoredFraction = numberOrNull(demo.dataset.panelFraction);
    let panelFraction = storedFraction ?? authoredFraction ?? DEFAULT_PANEL_FRACTION;
    let panelDrag = null;
    let navigatorDrag = null;
    let currentState = "none";
    let updateFrame = 0;

    const shellResizeHandles = demo.querySelectorAll(
      "[data-panel-resize], [data-shell-resize]"
    );
    const navigatorResizeHandles = demo.querySelectorAll("[data-navigator-resize]");

    const workspaceWidth = () => {
      const rectWidth = layoutRoot.getBoundingClientRect().width;
      return rectWidth > 0 ? rectWidth : layoutRoot.clientWidth || demo.clientWidth || 0;
    };

    const minimumPanelFraction = (width) => {
      if (!(width > 0)) return MIN_PANEL_FRACTION;
      return Math.min(
        MAX_PANEL_FRACTION,
        Math.max(MIN_PANEL_FRACTION, MIN_PANEL_WIDTH / width)
      );
    };

    const clampPanelFraction = (fraction, width = workspaceWidth()) => {
      const safeFraction = Number.isFinite(fraction)
        ? fraction
        : DEFAULT_PANEL_FRACTION;
      return clamp(safeFraction, minimumPanelFraction(width), MAX_PANEL_FRACTION);
    };

    const expandedPanel = () => {
      const openExpanded = open && readFlag(demo, "data-open-expanded");
      // Open has native precedence: an expanded editor suppresses Preview.
      if (openExpanded) return "open";
      if (preview && readFlag(demo, "data-preview-expanded")) return "preview";
      return null;
    };

    const stateName = () => {
      const expanded = expandedPanel();
      if (expanded === "open") return "open-expanded";
      if (expanded === "preview") return "preview-expanded";
      if (open && preview) return "both";
      if (open) return "open";
      if (preview) return "preview";
      return "none";
    };

    const shellCanResize = () =>
      (open || preview) && !expandedPanel() && workspaceWidth() >= 620;

    const panelGeometry = () => {
      const width = workspaceWidth();
      const boundary = (1 - panelFraction) * width;
      switch (currentState) {
        case "open":
          return {
            width,
            boundary,
            primary: boundary,
            openWidth: panelFraction * width,
            openLeft: boundary,
            previewWidth: 0,
          };
        case "preview":
          return {
            width,
            boundary,
            primary: boundary,
            openWidth: 0,
            openLeft: boundary,
            previewWidth: panelFraction * width,
          };
        case "both":
          return {
            width,
            boundary,
            // The native primary column retains its split width but becomes
            // visually/accessibly hidden underneath the Open layer.
            primary: boundary,
            openWidth: boundary,
            openLeft: 0,
            previewWidth: panelFraction * width,
          };
        case "open-expanded":
          return {
            width,
            boundary: 0,
            primary: 0,
            openWidth: width,
            openLeft: 0,
            previewWidth: 0,
          };
        case "preview-expanded":
          return {
            width,
            boundary: 0,
            primary: 0,
            openWidth: 0,
            openLeft: 0,
            previewWidth: width,
          };
        default:
          return {
            width,
            boundary: width,
            primary: width,
            openWidth: 0,
            openLeft: width,
            previewWidth: 0,
          };
      }
    };

    const setLayerVisibility = (layer, visible) => {
      if (!layer) return;
      setBooleanData(layer, "visible", visible);
      layer.setAttribute("aria-hidden", visible ? "false" : "true");
    };

    const updateToggle = (toggle) => {
      const kind = panelKind(toggle);
      if (!kind) return;
      const selected = kind === "open" ? open : preview;
      toggle.setAttribute("aria-pressed", selected ? "true" : "false");
      setBooleanData(toggle, "selected", selected);
      toggle.classList.toggle("is-selected", selected);
      if (toggle.tagName === "BUTTON" && !toggle.hasAttribute("type")) {
        toggle.setAttribute("type", "button");
      }

      const selectedLabel =
        toggle.dataset.labelSelected ||
        (kind === "open" ? "Close code editor" : "Close Preview panel");
      const unselectedLabel =
        toggle.dataset.labelUnselected ||
        (kind === "open" ? "Open code editor" : "Open Preview panel");
      toggle.setAttribute("aria-label", selected ? selectedLabel : unselectedLabel);
    };

    const updateShellHandleAccessibility = (handle) => {
      const width = workspaceWidth();
      const minimum = minimumPanelFraction(width);
      const enabled = shellCanResize();
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", "vertical");
      handle.setAttribute("aria-label", handle.dataset.resizeLabel || "Resize panel");
      handle.setAttribute("aria-valuemin", String(Math.round(minimum * 100)));
      handle.setAttribute("aria-valuemax", String(Math.round(MAX_PANEL_FRACTION * 100)));
      handle.setAttribute("aria-valuenow", String(Math.round(panelFraction * 100)));
      handle.setAttribute(
        "aria-valuetext",
        `Panel ${Math.round(panelFraction * 100)} percent; primary ${Math.round(
          (1 - panelFraction) * 100
        )} percent`
      );
      handle.setAttribute("aria-disabled", enabled ? "false" : "true");
      handle.tabIndex = enabled ? 0 : -1;
      setBooleanData(handle, "enabled", enabled);
    };

    const openPanelWidth = () => panelGeometry().openWidth;

    const navigatorMode = (handle) => {
      const owner = handle.closest("[data-navigator-mode]");
      const authoredMode =
        owner?.dataset.navigatorMode ||
        openLayer?.dataset.navigatorMode ||
        demo.dataset.navigatorMode;
      if (authoredMode === "expanded" || authoredMode === "compact") {
        return authoredMode;
      }
      return currentState === "open-expanded" ? "expanded" : "compact";
    };

    const navigatorBounds = (handle) => {
      const panelWidth = openPanelWidth();
      const mode = navigatorMode(handle);
      if (mode === "expanded") {
        const maximum = Math.max(
          MIN_NAVIGATOR_DRAG_WIDTH,
          panelWidth - EXPANDED_ACTIVITY_RAIL_WIDTH - EXPANDED_SEPARATOR_WIDTH -
            panelWidth * MIN_EDITOR_FRACTION
        );
        const preferred = Math.min(
          DEFAULT_COMPACT_NAVIGATOR_WIDTH,
          Math.max(160, panelWidth * 0.2)
        );
        return {
          mode,
          panelWidth,
          minimum: MIN_NAVIGATOR_DRAG_WIDTH,
          maximum,
          defaultWidth: Math.min(preferred, maximum),
          chromeWidth: EXPANDED_ACTIVITY_RAIL_WIDTH + EXPANDED_SEPARATOR_WIDTH,
        };
      }

      const maximum = Math.max(
        MIN_NAVIGATOR_DRAG_WIDTH,
        Math.min(panelWidth * COMPACT_NAVIGATOR_FRACTION, MAX_COMPACT_NAVIGATOR_WIDTH)
      );
      return {
        mode,
        panelWidth,
        minimum: MIN_NAVIGATOR_DRAG_WIDTH,
        maximum,
        defaultWidth: Math.min(DEFAULT_COMPACT_NAVIGATOR_WIDTH, maximum),
        chromeWidth: 1,
      };
    };

    const storedNavigatorWidth = persistenceEnabled
      ? numberOrNull(storage.read(navigatorStorageKey))
      : null;
    const authoredNavigatorWidth = numberOrNull(demo.dataset.navigatorWidth);
    let navigatorPreference = storedNavigatorWidth ?? authoredNavigatorWidth;
    let displayedNavigatorWidth = 0;

    const navigatorIsVisible = () => open && currentState !== "preview-expanded";

    const updateNavigator = (handle) => {
      const bounds = navigatorBounds(handle);
      const requested = navigatorPreference ?? bounds.defaultWidth;
      displayedNavigatorWidth = clamp(requested, bounds.minimum, bounds.maximum);
      const editorWidth = Math.max(
        0,
        bounds.panelWidth - bounds.chromeWidth - displayedNavigatorWidth
      );
      const enabled = navigatorIsVisible() && bounds.panelWidth > 0;

      demo.style.setProperty("--navigator-width", `${displayedNavigatorWidth.toFixed(2)}px`);
      demo.style.setProperty("--editor-width", `${editorWidth.toFixed(2)}px`);
      if (openLayer) {
        openLayer.style.setProperty(
          "--navigator-width",
          `${displayedNavigatorWidth.toFixed(2)}px`
        );
        openLayer.style.setProperty("--editor-width", `${editorWidth.toFixed(2)}px`);
      }

      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", "vertical");
      handle.setAttribute(
        "aria-label",
        handle.dataset.resizeLabel || "Resize file navigator"
      );
      handle.setAttribute("aria-valuemin", String(Math.round(bounds.minimum)));
      handle.setAttribute("aria-valuemax", String(Math.round(bounds.maximum)));
      handle.setAttribute("aria-valuenow", String(Math.round(displayedNavigatorWidth)));
      handle.setAttribute(
        "aria-valuetext",
        `Navigator ${Math.round(displayedNavigatorWidth)} pixels; editor ${Math.round(
          editorWidth
        )} pixels`
      );
      handle.setAttribute("aria-disabled", enabled ? "false" : "true");
      handle.tabIndex = enabled ? 0 : -1;
      handle.dataset.navigatorMode = bounds.mode;
      setBooleanData(handle, "enabled", enabled);
    };

    const update = () => {
      currentState = stateName();
      panelFraction = clampPanelFraction(panelFraction);
      const geometry = panelGeometry();
      const expanded = expandedPanel();

      setBooleanData(demo, "open", open);
      setBooleanData(demo, "preview", preview);
      setBooleanData(demo, "hasPanel", open || preview);
      setBooleanData(demo, "expanded", Boolean(expanded));
      demo.dataset.panelState = currentState;
      demo.dataset.expandedPanel = expanded || "none";
      demo.dataset.panelFraction = panelFraction.toFixed(5);
      demo.dataset.panelMinimum = minimumPanelFraction(geometry.width).toFixed(5);
      demo.dataset.panelMaximum = MAX_PANEL_FRACTION.toFixed(2);

      STATE_CLASSES.forEach((className) => demo.classList.remove(className));
      demo.classList.add(`panel-state-${currentState}`);
      demo.classList.toggle("has-open-panel", open);
      demo.classList.toggle("has-preview-panel", preview);
      demo.classList.toggle("has-panel", open || preview);
      demo.classList.toggle("has-expanded-panel", Boolean(expanded));

      demo.style.setProperty("--panel-fraction", panelFraction.toFixed(5));
      demo.style.setProperty("--primary-fraction", (1 - panelFraction).toFixed(5));
      layoutRoot.style.setProperty("--panel-fraction", panelFraction.toFixed(5));
      layoutRoot.style.setProperty("--primary-fraction", (1 - panelFraction).toFixed(5));
      setLengthVariable(demo, "--shell-primary-width", geometry.boundary);
      setLengthVariable(demo, "--primary-content-width", geometry.primary);
      setLengthVariable(
        demo,
        "--panel-width",
        expanded ? geometry.width : panelFraction * geometry.width
      );
      setLengthVariable(demo, "--open-panel-width", geometry.openWidth);
      setLengthVariable(demo, "--open-panel-left", geometry.openLeft);
      setLengthVariable(demo, "--preview-panel-width", geometry.previewWidth);

      setLayerVisibility(
        primaryLayer,
        ["none", "open", "preview"].includes(currentState)
      );
      setLayerVisibility(
        openLayer,
        ["open", "both", "open-expanded"].includes(currentState)
      );
      setLayerVisibility(
        previewLayer,
        ["preview", "both", "preview-expanded"].includes(currentState)
      );

      demo.querySelectorAll("[data-panel-toggle]").forEach(updateToggle);
      shellResizeHandles.forEach(updateShellHandleAccessibility);
      navigatorResizeHandles.forEach(updateNavigator);
    };

    const scheduleUpdate = () => {
      if (updateFrame) return;
      updateFrame = window.requestAnimationFrame(() => {
        updateFrame = 0;
        update();
      });
    };

    const persistPanelFraction = () => {
      if (persistenceEnabled) storage.write(panelStorageKey, String(panelFraction));
    };

    const persistNavigatorWidth = () => {
      if (persistenceEnabled) {
        storage.write(navigatorStorageKey, String(displayedNavigatorWidth));
      }
    };

    demo.querySelectorAll("[data-panel-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        const kind = panelKind(toggle);
        if (!kind) return;
        event.preventDefault();
        if (kind === "open") open = !open;
        if (kind === "preview") preview = !preview;
        update();
      });
    });

    shellResizeHandles.forEach((handle) => {
      handle.style.touchAction = "none";

      handle.addEventListener("pointerdown", (event) => {
        if (!shellCanResize() || event.isPrimary === false) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        const width = workspaceWidth();
        panelDrag = {
          pointerId: event.pointerId,
          startX: event.clientX,
          availableWidth: width,
          panelWidth: panelFraction * width,
        };
        try {
          handle.setPointerCapture(event.pointerId);
        } catch (_error) {
          // Window-level pointer events still complete the drag if capture fails.
        }
        setBooleanData(demo, "resizing", true);
        demo.dataset.resizeTarget = "panel";
        handle.dataset.resizing = "true";
        updateShellHandleAccessibility(handle);
      });

      const movePanelDrag = (event) => {
        if (!panelDrag || event.pointerId !== panelDrag.pointerId) return;
        event.preventDefault();
        const delta = event.clientX - panelDrag.startX;
        panelFraction = clampPanelFraction(
          (panelDrag.panelWidth - delta) / panelDrag.availableWidth,
          panelDrag.availableWidth
        );
        update();
      };

      handle.addEventListener("pointermove", movePanelDrag);
      window.addEventListener("pointermove", (event) => {
        if (event.target !== handle) movePanelDrag(event);
      });

      const endPanelDrag = (event) => {
        if (!panelDrag || (event && event.pointerId !== panelDrag.pointerId)) return;
        const pointerId = panelDrag.pointerId;
        panelDrag = null;
        if (handle.hasPointerCapture?.(pointerId)) {
          try {
            handle.releasePointerCapture(pointerId);
          } catch (_error) {
            // Capture may already have been released by the browser.
          }
        }
        persistPanelFraction();
        setBooleanData(demo, "resizing", false);
        demo.dataset.resizeTarget = "none";
        handle.dataset.resizing = "false";
        update();
      };

      handle.addEventListener("pointerup", endPanelDrag);
      handle.addEventListener("pointercancel", endPanelDrag);
      handle.addEventListener("lostpointercapture", endPanelDrag);
      window.addEventListener("pointerup", (event) => {
        if (
          panelDrag &&
          (event.pointerId === panelDrag.pointerId || event.pointerType === "mouse")
        ) {
          endPanelDrag();
        }
      });
      window.addEventListener("pointercancel", (event) => {
        if (panelDrag && event.pointerId === panelDrag.pointerId) endPanelDrag();
      });
      window.addEventListener("blur", () => {
        if (panelDrag) endPanelDrag();
      });
      handle.addEventListener("keydown", (event) => {
        if (!shellCanResize()) return;
        let step = 0;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") step = 1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") step = -1;
        if (!step) return;
        event.preventDefault();
        panelFraction = clampPanelFraction(
          panelFraction + step * PANEL_KEYBOARD_STEP
        );
        persistPanelFraction();
        update();
      });
    });

    navigatorResizeHandles.forEach((handle) => {
      handle.style.touchAction = "none";

      handle.addEventListener("pointerdown", (event) => {
        const bounds = navigatorBounds(handle);
        if (!navigatorIsVisible() || !(bounds.panelWidth > 0) || event.isPrimary === false) {
          return;
        }
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        navigatorDrag = {
          pointerId: event.pointerId,
          startX: event.clientX,
          width: displayedNavigatorWidth,
          handle,
        };
        try {
          handle.setPointerCapture(event.pointerId);
        } catch (_error) {
          // Window-level pointer events still complete the drag if capture fails.
        }
        setBooleanData(demo, "resizing", true);
        demo.dataset.resizeTarget = "navigator";
        handle.dataset.resizing = "true";
      });

      const moveNavigatorDrag = (event) => {
        if (
          !navigatorDrag ||
          navigatorDrag.handle !== handle ||
          event.pointerId !== navigatorDrag.pointerId
        ) {
          return;
        }
        event.preventDefault();
        navigatorPreference = Math.max(
          0,
          Math.round(navigatorDrag.width + event.clientX - navigatorDrag.startX)
        );
        updateNavigator(handle);
      };

      handle.addEventListener("pointermove", moveNavigatorDrag);
      window.addEventListener("pointermove", (event) => {
        if (event.target !== handle) moveNavigatorDrag(event);
      });

      const endNavigatorDrag = (event) => {
        if (
          !navigatorDrag ||
          navigatorDrag.handle !== handle ||
          (event && event.pointerId !== navigatorDrag.pointerId)
        ) {
          return;
        }
        const pointerId = navigatorDrag.pointerId;
        navigatorDrag = null;
        navigatorPreference = displayedNavigatorWidth;
        if (handle.hasPointerCapture?.(pointerId)) {
          try {
            handle.releasePointerCapture(pointerId);
          } catch (_error) {
            // Capture may already have been released by the browser.
          }
        }
        persistNavigatorWidth();
        setBooleanData(demo, "resizing", false);
        demo.dataset.resizeTarget = "none";
        handle.dataset.resizing = "false";
        update();
      };

      handle.addEventListener("pointerup", endNavigatorDrag);
      handle.addEventListener("pointercancel", endNavigatorDrag);
      handle.addEventListener("lostpointercapture", endNavigatorDrag);
      window.addEventListener("pointerup", (event) => {
        if (
          navigatorDrag &&
          (event.pointerId === navigatorDrag.pointerId || event.pointerType === "mouse")
        ) {
          endNavigatorDrag();
        }
      });
      window.addEventListener("pointercancel", (event) => {
        if (navigatorDrag && event.pointerId === navigatorDrag.pointerId) {
          endNavigatorDrag();
        }
      });
      window.addEventListener("blur", () => {
        if (navigatorDrag) endNavigatorDrag();
      });
      handle.addEventListener("keydown", (event) => {
        if (!navigatorIsVisible()) return;
        let step = 0;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") step = 1;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") step = -1;
        if (!step) return;
        event.preventDefault();
        navigatorPreference =
          displayedNavigatorWidth + step * NAVIGATOR_KEYBOARD_STEP;
        updateNavigator(handle);
        navigatorPreference = displayedNavigatorWidth;
        persistNavigatorWidth();
      });
    });

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(scheduleUpdate);
      observer.observe(layoutRoot);
    } else {
      window.addEventListener("resize", scheduleUpdate, { passive: true });
    }

    setBooleanData(demo, "resizing", false);
    demo.dataset.resizeTarget = "none";
    update();
  }

  const initialize = () => {
    document
      .querySelectorAll(".app-shell[data-panel-demo]")
      .forEach((demo, index) => initializePanelDemo(demo, index));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
