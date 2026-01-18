/* ================================================
   ZENO UI - JavaScript Components Library
   ================================================ */

(function () {
  "use strict";

  // ================================================
  // UTILITY FUNCTIONS
  // ================================================

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  function createRipple(event, element) {
    const circle = document.createElement("span");
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
    const rect = element.getBoundingClientRect();

    circle.style.cssText = `
      position: absolute;
      width: ${diameter}px;
      height: ${diameter}px;
      left: ${event.clientX - rect.left - radius}px;
      top: ${event.clientY - rect.top - radius}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    const computedPosition = window.getComputedStyle(element).position;
    if (computedPosition === "static") {
      element.style.position = "relative";
    }
    element.style.overflow = "hidden";
    element.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
  }

  // Add ripple animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ================================================
  // MODAL
  // ================================================

  const ZenoModal = {
    open(modalId) {
      const overlay = $(`#${modalId}`);
      if (!overlay) return;

      overlay.classList.add("active");
      document.body.style.overflow = "hidden";

      // Close on overlay click
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.close(modalId);
        }
      });

      // Close on escape key
      const escHandler = (e) => {
        if (e.key === "Escape") {
          this.close(modalId);
          document.removeEventListener("keydown", escHandler);
        }
      };
      document.addEventListener("keydown", escHandler);
    },

    close(modalId) {
      const overlay = $(`#${modalId}`);
      if (!overlay) return;

      overlay.classList.remove("active");
      document.body.style.overflow = "";
    },
  };

  // ================================================
  // ACTION SHEET
  // ================================================

  const ZenoActionSheet = {
    open(sheetId) {
      const overlay = $(`#${sheetId}-overlay`);
      const sheet = $(`#${sheetId}`);

      if (overlay) overlay.classList.add("active");
      if (sheet) sheet.classList.add("active");
      document.body.style.overflow = "hidden";

      // Close on overlay click
      if (overlay) {
        overlay.addEventListener(
          "click",
          () => {
            this.close(sheetId);
          },
          { once: true }
        );
      }
    },

    close(sheetId) {
      const overlay = $(`#${sheetId}-overlay`);
      const sheet = $(`#${sheetId}`);

      if (overlay) overlay.classList.remove("active");
      if (sheet) sheet.classList.remove("active");
      document.body.style.overflow = "";

      // Reset any active FAB icons
      $$(".fab.active").forEach((fab) => fab.classList.remove("active"));
    },
  };

  // ================================================
  // FULL PAGE SHEET
  // ================================================

  const ZenoFullPageSheet = {
    open(sheetId) {
      const overlay = $(`#${sheetId}-overlay`);
      const sheet = $(`#${sheetId}`);

      if (overlay) overlay.classList.add("active");
      if (sheet) sheet.classList.add("active");
      document.body.style.overflow = "hidden";

      // Close on overlay click
      if (overlay) {
        overlay.addEventListener(
          "click",
          () => {
            this.close(sheetId);
          },
          { once: true }
        );
      }

      // Close on escape key
      const escHandler = (e) => {
        if (e.key === "Escape") {
          this.close(sheetId);
          document.removeEventListener("keydown", escHandler);
        }
      };
      document.addEventListener("keydown", escHandler);
    },

    close(sheetId) {
      const overlay = $(`#${sheetId}-overlay`);
      const sheet = $(`#${sheetId}`);

      if (overlay) overlay.classList.remove("active");
      if (sheet) sheet.classList.remove("active");
      document.body.style.overflow = "";
    },
  };

  // ================================================
  // SIDEBAR
  // ================================================

  const ZenoSidebar = {
    isLargeScreen() {
      return window.innerWidth >= 1024;
    },

    open() {
      const sidebar = $(".sidebar");
      const overlay = $(".sidebar-overlay");

      if (sidebar) {
        sidebar.classList.add("open");
        sidebar.classList.remove("collapsed");
      }
      if (overlay) overlay.classList.add("active");
      // Only lock scroll on small screens
      if (!this.isLargeScreen()) {
        document.body.style.overflow = "hidden";
      }
    },

    close() {
      const sidebar = $(".sidebar");
      const overlay = $(".sidebar-overlay");

      if (sidebar) {
        sidebar.classList.remove("open");
        // On large screens, add collapsed class to hide it
        if (this.isLargeScreen()) {
          sidebar.classList.add("collapsed");
        }
      }
      if (overlay) overlay.classList.remove("active");
      document.body.style.overflow = "";
    },

    toggle() {
      const sidebar = $(".sidebar");
      if (!sidebar) return;

      if (this.isLargeScreen()) {
        // On large screens, toggle collapsed state
        if (sidebar.classList.contains("collapsed")) {
          sidebar.classList.remove("collapsed");
        } else {
          sidebar.classList.add("collapsed");
        }
      } else {
        // On small screens, normal toggle with overlay
        if (sidebar.classList.contains("open")) {
          this.close();
        } else {
          this.open();
        }
      }
    },

    init() {
      const overlay = $(".sidebar-overlay");
      if (overlay) {
        overlay.addEventListener("click", () => {
          // Only close sidebar on overlay click for small screens
          if (!this.isLargeScreen()) {
            this.close();
          }
        });
      }

      $$(".sidebar-close").forEach((btn) => {
        btn.addEventListener("click", () => this.close());
      });

      // Handle window resize - remove collapsed class when resizing to ensure proper behavior
      window.addEventListener("resize", () => {
        const sidebar = $(".sidebar");
        if (sidebar && !this.isLargeScreen()) {
          // When resizing to small screen, remove collapsed class
          // (it's only for large screen behavior)
          sidebar.classList.remove("collapsed");
        }
      });

      // Initialize collapsible sections
      this.initSections();
    },

    initSections() {
      $$(".sidebar-section-header").forEach((header) => {
        // Only make clickable if there's a toggle button (collapsible section)
        const toggle = $(".sidebar-section-toggle", header);
        if (toggle) {
          header.addEventListener("click", (e) => {
            e.stopPropagation();
            const section = header.closest(".sidebar-section");
            if (section) {
              const content = $(".sidebar-section-content", section);
              if (content) {
                const isCollapsed = section.classList.contains("collapsed");

                if (isCollapsed) {
                  // Expanding: measure natural height, then animate
                  // Remove collapsed class to allow measurement
                  section.classList.remove("collapsed");

                  // Get natural height
                  const naturalHeight = content.scrollHeight;

                  // Start from 0 and animate to natural height
                  content.style.maxHeight = "0";
                  // Force reflow
                  requestAnimationFrame(() => {
                    content.style.maxHeight = naturalHeight + "px";
                  });

                  // Clean up after animation completes
                  const transitionEnd = () => {
                    if (!section.classList.contains("collapsed")) {
                      content.style.maxHeight = "";
                    }
                    content.removeEventListener("transitionend", transitionEnd);
                  };
                  content.addEventListener("transitionend", transitionEnd);
                } else {
                  // Collapsing: set to current height, then animate to 0
                  const currentHeight = content.scrollHeight;
                  content.style.maxHeight = currentHeight + "px";

                  // Force reflow
                  requestAnimationFrame(() => {
                    section.classList.add("collapsed");
                    content.style.maxHeight = "0";
                  });
                }
              } else {
                // Fallback if content not found
                section.classList.toggle("collapsed");
              }
            }
          });
        }
      });
    },
  };

  // ================================================
  // MENU DROPDOWN
  // ================================================

  const ZenoMenuDropdown = {
    init() {
      $$(".menu-dropdown-wrapper").forEach((wrapper) => {
        const trigger = $(".menu-dropdown-trigger", wrapper);
        const dropdown = $(".menu-dropdown", wrapper);
        if (!trigger || !dropdown) return;

        // Toggle dropdown
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = wrapper.classList.contains("open");

          // Close all other dropdowns
          $$(".menu-dropdown-wrapper.open").forEach((w) => {
            if (w !== wrapper) {
              w.classList.remove("open");
            }
          });

          if (isOpen) {
            wrapper.classList.remove("open");
          } else {
            wrapper.classList.add("open");
            this.positionDropdown(wrapper, dropdown, trigger);
          }
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
          }
        });

        // Close on escape key
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && wrapper.classList.contains("open")) {
            wrapper.classList.remove("open");
          }
        });

        // Handle menu item clicks
        $$(".menu-item", dropdown).forEach((item) => {
          if (!item.disabled) {
            item.addEventListener("click", (e) => {
              e.stopPropagation();
              wrapper.classList.remove("open");
            });
          }
        });
      });
    },

    positionDropdown(wrapper, dropdown, trigger) {
      const rect = trigger.getBoundingClientRect();
      const dropdownHeight = dropdown.scrollHeight || 200;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Determine if dropdown should open upward
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        wrapper.classList.add("menu-dropdown-up");
      } else {
        wrapper.classList.remove("menu-dropdown-up");
      }
    },

    open(wrapperId) {
      const wrapper = $(wrapperId);
      if (wrapper) {
        const dropdown = $(".menu-dropdown", wrapper);
        const trigger = $(".menu-dropdown-trigger", wrapper);
        if (dropdown && trigger) {
          this.positionDropdown(wrapper, dropdown, trigger);
          wrapper.classList.add("open");
        }
      }
    },

    close(wrapperId) {
      const wrapper = wrapperId ? $(wrapperId) : null;
      if (wrapper) {
        wrapper.classList.remove("open");
      } else {
        $$(".menu-dropdown-wrapper.open").forEach((w) => {
          w.classList.remove("open");
        });
      }
    },
  };

  // ================================================
  // TOAST
  // ================================================

  const ZenoToast = {
    container: null,

    init() {
      if (!this.container) {
        this.container = document.createElement("div");
        this.container.className = "toast-container";
        document.body.appendChild(this.container);
      }
    },

    show({ title, message, type = "info", duration = 4000 }) {
      this.init();

      const icons = {
        success: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        error: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        warning: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
        info: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      };

      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        ${icons[type]}
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ""}
          ${message ? `<div class="toast-message">${message}</div>` : ""}
        </div>
      `;

      this.container.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });

      // Auto remove
      setTimeout(() => {
        this.hide(toast);
      }, duration);

      // Click to dismiss
      toast.addEventListener("click", () => {
        this.hide(toast);
      });

      return toast;
    },

    hide(toast) {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    },

    success(message, title = "Success") {
      return this.show({ title, message, type: "success" });
    },

    error(message, title = "Error") {
      return this.show({ title, message, type: "error" });
    },

    warning(message, title = "Warning") {
      return this.show({ title, message, type: "warning" });
    },

    info(message, title = "Info") {
      return this.show({ title, message, type: "info" });
    },
  };

  // ================================================
  // SELECT DROPDOWN
  // ================================================

  const ZenoSelect = {
    init() {
      $$(".select-wrapper:not([data-multiselect])").forEach((wrapper) => {
        const select = $(".select", wrapper);
        const dropdown = $(".select-dropdown", wrapper);

        if (!select || !dropdown) return;

        const options = $$(".select-option", dropdown);
        const placeholder = select.dataset.placeholder || "Select an option";

        // Set initial placeholder
        if (
          !select.textContent.trim() ||
          select.querySelector(".select-placeholder")
        ) {
          select.innerHTML = `<span class="select-placeholder">${placeholder}</span>`;
        }

        // Position dropdown with smart positioning
        const positionDropdown = () => {
          const selectRect = select.getBoundingClientRect();
          const dropdownHeight = dropdown.scrollHeight || 200;
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - selectRect.bottom;
          const spaceAbove = selectRect.top;

          // Determine if dropdown should open upward
          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            wrapper.classList.add("select-up");
          } else {
            wrapper.classList.remove("select-up");
          }
        };

        // Toggle dropdown
        select.addEventListener("click", (e) => {
          e.stopPropagation();

          // Close other open selects
          $$(".select-wrapper.open").forEach((w) => {
            if (w !== wrapper) {
              w.classList.remove("open");
              const sel = $(".select", w);
              if (sel) sel.classList.remove("open");
            }
          });

          // Position before opening
          positionDropdown();

          wrapper.classList.toggle("open");
          select.classList.toggle("open");
        });

        // Handle option selection
        options.forEach((option) => {
          option.addEventListener("click", () => {
            const value = option.dataset.value;
            const text = option.textContent.trim();

            // Update selected state
            options.forEach((o) => o.classList.remove("selected"));
            option.classList.add("selected");

            // Update select display
            select.innerHTML = text;
            select.dataset.value = value;

            // Close dropdown
            wrapper.classList.remove("open");
            select.classList.remove("open");

            // Dispatch change event
            const event = new CustomEvent("select-change", {
              detail: { value, text },
              bubbles: true,
            });
            wrapper.dispatchEvent(event);
          });
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
            select.classList.remove("open");
          }
        });

        // Reposition on scroll/resize
        window.addEventListener(
          "scroll",
          () => {
            if (wrapper.classList.contains("open")) {
              positionDropdown();
            }
          },
          { passive: true }
        );

        window.addEventListener(
          "resize",
          () => {
            if (wrapper.classList.contains("open")) {
              positionDropdown();
            }
          },
          { passive: true }
        );
      });
    },

    getValue(wrapper) {
      const select = $(".select", wrapper);
      return select ? select.dataset.value : null;
    },

    setValue(wrapper, value) {
      const option = $(`.select-option[data-value="${value}"]`, wrapper);
      if (option) {
        option.click();
      }
    },
  };

  // ================================================
  // MULTISELECT
  // ================================================

  const ZenoMultiselect = {
    init() {
      $$(".select-wrapper[data-multiselect]").forEach((wrapper) => {
        const multiselect = $(".multiselect", wrapper);
        const dropdown = $(".select-dropdown", wrapper);
        const options = $$(".select-option", dropdown);
        const placeholder =
          multiselect?.dataset.placeholder || "Select options";

        if (!multiselect || !dropdown) return;

        let selectedValues = [];

        const updateDisplay = () => {
          if (selectedValues.length === 0) {
            multiselect.innerHTML = `<span class="multiselect-placeholder">${placeholder}</span>`;
          } else {
            multiselect.innerHTML = selectedValues
              .map((v) => {
                const option = $(`.select-option[data-value="${v}"]`, dropdown);
                const text = option ? option.textContent.trim() : v;
                return `
                <span class="multiselect-tag" data-value="${v}">
                  ${text}
                  <svg class="multiselect-tag-remove" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              `;
              })
              .join("");

            // Add remove handlers
            $$(".multiselect-tag-remove", multiselect).forEach((btn) => {
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const tag = btn.closest(".multiselect-tag");
                const value = tag.dataset.value;
                selectedValues = selectedValues.filter((v) => v !== value);

                const option = $(
                  `.select-option[data-value="${value}"]`,
                  dropdown
                );
                if (option) option.classList.remove("selected");

                updateDisplay();
                dispatchChange();
              });
            });
          }
        };

        const dispatchChange = () => {
          const event = new CustomEvent("multiselect-change", {
            detail: { values: selectedValues },
            bubbles: true,
          });
          wrapper.dispatchEvent(event);
        };

        // Position dropdown with smart positioning
        const positionDropdown = () => {
          const selectRect = multiselect.getBoundingClientRect();
          const dropdownHeight = dropdown.scrollHeight || 200;
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - selectRect.bottom;
          const spaceAbove = selectRect.top;

          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            wrapper.classList.add("select-up");
          } else {
            wrapper.classList.remove("select-up");
          }
        };

        // Toggle dropdown
        const toggleDropdown = (e) => {
          if (e.target.closest(".multiselect-tag-remove")) return;
          e.stopPropagation();

          // Close other open selects
          $$(".select-wrapper.open").forEach((w) => {
            if (w !== wrapper) {
              w.classList.remove("open");
              const sel = $(".multiselect, .select", w);
              if (sel) sel.classList.remove("open");
            }
          });

          // Position before opening
          positionDropdown();

          wrapper.classList.toggle("open");
          multiselect.classList.toggle("open");
        };

        multiselect.addEventListener("click", toggleDropdown);

        // Reposition on scroll/resize
        window.addEventListener(
          "scroll",
          () => {
            if (wrapper.classList.contains("open")) {
              positionDropdown();
            }
          },
          { passive: true }
        );

        window.addEventListener(
          "resize",
          () => {
            if (wrapper.classList.contains("open")) {
              positionDropdown();
            }
          },
          { passive: true }
        );

        // Handle option selection
        options.forEach((option) => {
          option.addEventListener("click", (e) => {
            e.stopPropagation();
            const value = option.dataset.value;

            if (selectedValues.includes(value)) {
              selectedValues = selectedValues.filter((v) => v !== value);
              option.classList.remove("selected");
            } else {
              selectedValues.push(value);
              option.classList.add("selected");
            }

            updateDisplay();
            dispatchChange();
          });
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
            multiselect.classList.remove("open");
          }
        });

        updateDisplay();
      });
    },
  };

  // ================================================
  // AUTOCOMPLETE
  // ================================================

  const ZenoAutocomplete = {
    init() {
      $$(".autocomplete-wrapper").forEach((wrapper) => {
        const input = $(".autocomplete-input", wrapper);
        const dropdown = $(".autocomplete-dropdown", wrapper);
        const clearBtn = $(".autocomplete-clear", wrapper);

        // Get options from data attribute or from dropdown
        let allOptions = [];
        const optionsAttr = wrapper.dataset.options;

        if (optionsAttr) {
          try {
            allOptions = JSON.parse(optionsAttr);
          } catch (e) {
            console.error("Invalid options JSON");
          }
        } else {
          allOptions = $$(".autocomplete-option", dropdown).map((opt) => ({
            value: opt.dataset.value,
            text: opt.textContent.trim(),
          }));
        }

        let highlightedIndex = -1;

        const renderOptions = (filteredOptions) => {
          if (filteredOptions.length === 0) {
            dropdown.innerHTML = `<div class="autocomplete-empty">No results found</div>`;
          } else {
            dropdown.innerHTML = filteredOptions
              .map((opt, index) => {
                const query = input.value.toLowerCase();
                const text = opt.text || opt;
                const value = opt.value || opt;

                // Highlight matching text
                const regex = new RegExp(`(${query})`, "gi");
                const highlighted = text.replace(
                  regex,
                  '<span class="autocomplete-highlight">$1</span>'
                );

                return `
                <div class="autocomplete-option ${
                  index === highlightedIndex ? "highlighted" : ""
                }" 
                     data-value="${value}" data-index="${index}">
                  ${highlighted}
                </div>
              `;
              })
              .join("");
          }

          // Add click handlers
          $$(".autocomplete-option", dropdown).forEach((opt) => {
            opt.addEventListener("click", () => {
              selectOption(opt.dataset.value, opt.textContent.trim());
            });
          });
        };

        const selectOption = (value, text) => {
          input.value = text;
          input.dataset.value = value;
          wrapper.classList.remove("open");
          highlightedIndex = -1;

          const event = new CustomEvent("autocomplete-select", {
            detail: { value, text },
            bubbles: true,
          });
          wrapper.dispatchEvent(event);
        };

        const filterOptions = (query) => {
          if (!query) return allOptions;
          const lowerQuery = query.toLowerCase();
          return allOptions.filter((opt) => {
            const text = (opt.text || opt).toLowerCase();
            return text.includes(lowerQuery);
          });
        };

        // Input event
        input.addEventListener("input", () => {
          const query = input.value;
          const filtered = filterOptions(query);
          highlightedIndex = -1;
          renderOptions(filtered);
          positionDropdown();
          wrapper.classList.add("open");
        });

        // Position dropdown with smart positioning
        const positionDropdown = () => {
          const inputRect = input.getBoundingClientRect();
          const dropdownHeight = dropdown.scrollHeight || 200;
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - inputRect.bottom;
          const spaceAbove = inputRect.top;

          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            wrapper.classList.add("autocomplete-up");
          } else {
            wrapper.classList.remove("autocomplete-up");
          }
        };

        // Focus event
        input.addEventListener("focus", () => {
          if (input.value || allOptions.length > 0) {
            const filtered = filterOptions(input.value);
            renderOptions(filtered);
            positionDropdown();
            wrapper.classList.add("open");
          }
        });

        // Keyboard navigation
        input.addEventListener("keydown", (e) => {
          const options = $$(".autocomplete-option", dropdown);

          if (e.key === "ArrowDown") {
            e.preventDefault();
            highlightedIndex = Math.min(
              highlightedIndex + 1,
              options.length - 1
            );
            updateHighlight(options);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightedIndex = Math.max(highlightedIndex - 1, 0);
            updateHighlight(options);
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && options[highlightedIndex]) {
              const opt = options[highlightedIndex];
              selectOption(opt.dataset.value, opt.textContent.trim());
            }
          } else if (e.key === "Escape") {
            wrapper.classList.remove("open");
            highlightedIndex = -1;
          }
        });

        const updateHighlight = (options) => {
          options.forEach((opt, i) => {
            opt.classList.toggle("highlighted", i === highlightedIndex);
          });

          // Scroll into view
          if (options[highlightedIndex]) {
            options[highlightedIndex].scrollIntoView({ block: "nearest" });
          }
        };

        // Clear button
        if (clearBtn) {
          clearBtn.addEventListener("click", () => {
            input.value = "";
            input.dataset.value = "";
            input.focus();
            wrapper.classList.remove("open");
          });
        }

        // Close on outside click
        document.addEventListener("click", (e) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
            highlightedIndex = -1;
          }
        });
      });
    },
  };

  // ================================================
  // DUAL RANGE SLIDER
  // ================================================

  const ZenoDualRange = {
    init() {
      $$(".dual-range").forEach((wrapper) => {
        const minInput = $('input[data-range="min"]', wrapper);
        const maxInput = $('input[data-range="max"]', wrapper);
        const fill = $(".dual-range-fill", wrapper);
        const minDisplay = $(".dual-range-min");
        const maxDisplay = $(".dual-range-max");

        if (!minInput || !maxInput || !fill) return;

        const min = parseFloat(minInput.min) || 0;
        const max = parseFloat(minInput.max) || 100;

        const updateFill = () => {
          const minVal = parseFloat(minInput.value);
          const maxVal = parseFloat(maxInput.value);

          const minPercent = ((minVal - min) / (max - min)) * 100;
          const maxPercent = ((maxVal - min) / (max - min)) * 100;

          // Update fill bar position and width
          fill.style.left = minPercent + "%";
          fill.style.right = 100 - maxPercent + "%";
          fill.style.width = "auto";

          if (minDisplay) minDisplay.textContent = minVal;
          if (maxDisplay) maxDisplay.textContent = maxVal;

          // Dispatch event
          const event = new CustomEvent("dualrange-change", {
            detail: { min: minVal, max: maxVal },
            bubbles: true,
          });
          wrapper.dispatchEvent(event);
        };

        // Update z-index based on pointer position to allow grabbing either knob
        // when they are overlapping or close together
        let isDragging = false;

        const updateZIndex = (e) => {
          // Don't change z-index while actively dragging
          if (isDragging) return;

          const rect = wrapper.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const posPercent = ((clientX - rect.left) / rect.width) * 100;

          const minVal = parseFloat(minInput.value);
          const maxVal = parseFloat(maxInput.value);
          const minPercent = ((minVal - min) / (max - min)) * 100;
          const maxPercent = ((maxVal - min) / (max - min)) * 100;
          const midPoint = (minPercent + maxPercent) / 2;

          // If pointer is on the left side of the midpoint, prioritize min slider
          // If pointer is on the right side, prioritize max slider
          if (posPercent < midPoint) {
            minInput.style.zIndex = "5";
            maxInput.style.zIndex = "3";
          } else {
            minInput.style.zIndex = "3";
            maxInput.style.zIndex = "5";
          }
        };

        const startDrag = (e) => {
          updateZIndex(e);
          isDragging = true;
        };

        const endDrag = () => {
          isDragging = false;
        };

        wrapper.addEventListener("mousemove", updateZIndex);
        wrapper.addEventListener("touchmove", updateZIndex, { passive: true });

        minInput.addEventListener("mousedown", startDrag);
        minInput.addEventListener("touchstart", startDrag, { passive: true });
        maxInput.addEventListener("mousedown", startDrag);
        maxInput.addEventListener("touchstart", startDrag, { passive: true });

        document.addEventListener("mouseup", endDrag);
        document.addEventListener("touchend", endDrag);

        minInput.addEventListener("input", () => {
          const minVal = parseFloat(minInput.value);
          const maxVal = parseFloat(maxInput.value);

          if (minVal > maxVal) {
            minInput.value = maxVal;
          }
          updateFill();
        });

        maxInput.addEventListener("input", () => {
          const minVal = parseFloat(minInput.value);
          const maxVal = parseFloat(maxInput.value);

          if (maxVal < minVal) {
            maxInput.value = minVal;
          }
          updateFill();
        });

        // Initialize fill on load
        updateFill();
      });
    },

    getValue(wrapper) {
      const minInput = $('input[data-range="min"]', wrapper);
      const maxInput = $('input[data-range="max"]', wrapper);
      return {
        min: parseFloat(minInput?.value || 0),
        max: parseFloat(maxInput?.value || 100),
      };
    },

    setValue(wrapper, min, max) {
      const minInput = $('input[data-range="min"]', wrapper);
      const maxInput = $('input[data-range="max"]', wrapper);

      if (minInput) minInput.value = min;
      if (maxInput) maxInput.value = max;

      minInput?.dispatchEvent(new Event("input"));
    },
  };

  // ================================================
  // TABS
  // ================================================

  const ZenoTabs = {
    init() {
      $$(".tabs").forEach((tabContainer) => {
        const tabs = $$(".tab", tabContainer);
        const contents = $$(".tab-content", tabContainer);

        tabs.forEach((tab, index) => {
          tab.addEventListener("click", () => {
            // Remove active from all
            tabs.forEach((t) => t.classList.remove("active"));
            contents.forEach((c) => c.classList.remove("active"));

            // Add active to clicked
            tab.classList.add("active");
            if (contents[index]) {
              contents[index].classList.add("active");
            }
          });
        });
      });
    },
  };

  // ================================================
  // ACCORDION
  // ================================================

  const ZenoAccordion = {
    init() {
      $$(".accordion-header").forEach((header) => {
        header.addEventListener("click", () => {
          const item = header.closest(".accordion-item");
          const accordion = item.closest(".accordion");
          const isOpen = item.classList.contains("open");

          // Check if accordion allows multiple open
          const allowMultiple = accordion.hasAttribute("data-multiple");

          if (!allowMultiple) {
            // Close all other items
            $$(".accordion-item", accordion).forEach((i) => {
              i.classList.remove("open");
            });
          }

          // Toggle current item
          item.classList.toggle("open", !isOpen);
        });
      });
    },
  };

  // ================================================
  // SEGMENTED CONTROL
  // ================================================

  const ZenoSegmented = {
    init() {
      $$(".segmented").forEach((segmented) => {
        const buttons = $$(".segmented-btn", segmented);

        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            // Dispatch custom event
            const event = new CustomEvent("segmented-change", {
              detail: { value: btn.dataset.value || btn.textContent.trim() },
            });
            segmented.dispatchEvent(event);
          });
        });
      });
    },
  };

  // ================================================
  // STEPPER
  // ================================================

  const ZenoStepper = {
    init() {
      $$(".stepper").forEach((stepper) => {
        const minusBtn = $(".stepper-btn:first-child", stepper);
        const plusBtn = $(".stepper-btn:last-child", stepper);
        const valueEl = $(".stepper-value", stepper);

        const min = parseInt(stepper.dataset.min) || 0;
        const max = parseInt(stepper.dataset.max) || 999;
        const step = parseInt(stepper.dataset.step) || 1;
        let value = parseInt(stepper.dataset.value) || 0;

        const updateValue = (newValue) => {
          value = Math.max(min, Math.min(max, newValue));
          valueEl.textContent = value;
          minusBtn.disabled = value <= min;
          plusBtn.disabled = value >= max;

          // Dispatch custom event
          const event = new CustomEvent("stepper-change", {
            detail: { value },
          });
          stepper.dispatchEvent(event);
        };

        minusBtn.addEventListener("click", () => updateValue(value - step));
        plusBtn.addEventListener("click", () => updateValue(value + step));

        updateValue(value);
      });
    },
  };

  // ================================================
  // SEARCHBAR
  // ================================================

  const ZenoSearchbar = {
    init() {
      $$(".searchbar").forEach((searchbar) => {
        const input = $(".searchbar-input", searchbar);
        const clearBtn = $(".searchbar-clear", searchbar);

        if (clearBtn) {
          clearBtn.addEventListener("click", () => {
            input.value = "";
            input.focus();

            // Dispatch custom event
            const event = new CustomEvent("searchbar-clear");
            searchbar.dispatchEvent(event);
          });
        }

        input.addEventListener("input", () => {
          const event = new CustomEvent("searchbar-input", {
            detail: { value: input.value },
          });
          searchbar.dispatchEvent(event);
        });
      });
    },
  };

  // ================================================
  // CHIPS
  // ================================================

  const ZenoChips = {
    init() {
      $$(".chip-close").forEach((closeBtn) => {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const chip = closeBtn.closest(".chip");

          // Dispatch custom event
          const event = new CustomEvent("chip-remove", {
            detail: { value: chip.dataset.value || chip.textContent.trim() },
            bubbles: true,
          });
          chip.dispatchEvent(event);

          chip.remove();
        });
      });
    },
  };

  // ================================================
  // RANGE SLIDER
  // ================================================

  const ZenoRange = {
    init() {
      $$(".range").forEach((range) => {
        const updateBackground = () => {
          const min = range.min || 0;
          const max = range.max || 100;
          const value = range.value;
          const percentage = ((value - min) / (max - min)) * 100;

          range.style.background = `linear-gradient(to right, var(--primary) ${percentage}%, var(--bg-tertiary) ${percentage}%)`;
        };

        range.addEventListener("input", updateBackground);
        updateBackground();
      });
    },
  };

  // ================================================
  // FAB (Floating Action Button)
  // ================================================

  const ZenoFab = {
    init() {
      $$(".fab").forEach((fab) => {
        fab.addEventListener("click", (e) => {
          createRipple(e, fab);
          fab.classList.toggle("active");

          // Dispatch custom event
          const event = new CustomEvent("fab-click", {
            detail: { active: fab.classList.contains("active") },
          });
          fab.dispatchEvent(event);
        });
      });
    },
  };

  // ================================================
  // BUTTON RIPPLE EFFECT
  // ================================================

  const ZenoButtons = {
    init() {
      $$(".btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          createRipple(e, btn);
        });
      });
    },
  };

  // ================================================
  // TABBAR (Bottom Navigation)
  // ================================================

  const ZenoTabbar = {
    init() {
      $$(".tabbar").forEach((tabbar) => {
        const items = $$(".tabbar-item", tabbar);

        items.forEach((item) => {
          item.addEventListener("click", () => {
            items.forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            // Dispatch custom event
            const event = new CustomEvent("tabbar-change", {
              detail: {
                value:
                  item.dataset.value || item.querySelector("span")?.textContent,
              },
            });
            tabbar.dispatchEvent(event);
          });
        });
      });
    },
  };

  // ================================================
  // SMART POSITIONING UTILITY
  // ================================================

  const ZenoPosition = {
    // Calculate best position for floating elements (tooltips, popovers, dropdowns)
    calculate(triggerEl, floatingEl, preferredPosition = "top", offset = 8) {
      const triggerRect = triggerEl.getBoundingClientRect();
      const floatingRect = floatingEl.getBoundingClientRect();

      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Available space in each direction
      const space = {
        top: triggerRect.top,
        bottom: viewport.height - triggerRect.bottom,
        left: triggerRect.left,
        right: viewport.width - triggerRect.right,
      };

      // Check if preferred position has enough space
      const fits = {
        top: space.top >= floatingRect.height + offset,
        bottom: space.bottom >= floatingRect.height + offset,
        left: space.left >= floatingRect.width + offset,
        right: space.right >= floatingRect.width + offset,
      };

      // Determine final position (flip if needed)
      let position = preferredPosition;

      if (preferredPosition === "top" && !fits.top && fits.bottom) {
        position = "bottom";
      } else if (preferredPosition === "bottom" && !fits.bottom && fits.top) {
        position = "top";
      } else if (preferredPosition === "left" && !fits.left && fits.right) {
        position = "right";
      } else if (preferredPosition === "right" && !fits.right && fits.left) {
        position = "left";
      }

      // Calculate coordinates based on final position
      let coords = { top: 0, left: 0 };

      switch (position) {
        case "top":
          coords.top = triggerRect.top - floatingRect.height - offset;
          coords.left =
            triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
          break;
        case "bottom":
          coords.top = triggerRect.bottom + offset;
          coords.left =
            triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
          break;
        case "left":
          coords.top =
            triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2;
          coords.left = triggerRect.left - floatingRect.width - offset;
          break;
        case "right":
          coords.top =
            triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2;
          coords.left = triggerRect.right + offset;
          break;
      }

      // Constrain to viewport bounds (horizontal)
      const padding = 8;
      if (coords.left < padding) {
        coords.left = padding;
      } else if (coords.left + floatingRect.width > viewport.width - padding) {
        coords.left = viewport.width - floatingRect.width - padding;
      }

      // Constrain to viewport bounds (vertical)
      if (coords.top < padding) {
        coords.top = padding;
      } else if (coords.top + floatingRect.height > viewport.height - padding) {
        coords.top = viewport.height - floatingRect.height - padding;
      }

      return { position, coords };
    },

    // Apply position to element
    apply(floatingEl, coords, position) {
      floatingEl.style.top = `${coords.top}px`;
      floatingEl.style.left = `${coords.left}px`;
      floatingEl.setAttribute("data-position", position);
    },
  };

  // ================================================
  // TOOLTIP
  // ================================================

  const ZenoTooltip = {
    tooltip: null,
    currentTrigger: null,
    showTimeout: null,
    hideTimeout: null,

    init() {
      // Create single reusable tooltip element
      this.tooltip = document.createElement("div");
      this.tooltip.className = "tooltip";
      this.tooltip.style.display = "none";
      document.body.appendChild(this.tooltip);

      // Initialize tooltips from data attributes
      $$("[data-tooltip]").forEach((trigger) => {
        this.attach(trigger);
      });

      // Global cleanup handlers - single listeners for all tooltips
      window.addEventListener("scroll", () => this.hideImmediate(), {
        passive: true,
        capture: true,
      });
      window.addEventListener("resize", () => this.hideImmediate(), {
        passive: true,
      });
      document.addEventListener("visibilitychange", () => this.hideImmediate());

      // Hide on any click (tooltips shouldn't persist through clicks)
      document.addEventListener("mousedown", () => this.hideImmediate());
      document.addEventListener("touchstart", () => this.hideImmediate(), {
        passive: true,
      });
    },

    attach(trigger) {
      const show = () => {
        // Clear any pending hide
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;

        // If already showing for this trigger, don't restart
        if (
          this.currentTrigger === trigger &&
          this.tooltip.style.display !== "none"
        ) {
          return;
        }

        // Clear previous show timeout
        clearTimeout(this.showTimeout);

        // Delay before showing
        this.showTimeout = setTimeout(() => {
          this.currentTrigger = trigger;

          // Update tooltip content and variant
          this.tooltip.textContent = trigger.dataset.tooltip;
          this.tooltip.className = "tooltip";
          if (trigger.dataset.tooltipVariant === "dark") {
            this.tooltip.classList.add("tooltip-dark");
          }

          // Show and position
          this.tooltip.style.display = "";
          this.tooltip.classList.remove("show");

          // Position tooltip
          const preferredPosition = trigger.dataset.tooltipPosition || "top";
          const { position, coords } = ZenoPosition.calculate(
            trigger,
            this.tooltip,
            preferredPosition,
            8
          );
          ZenoPosition.apply(this.tooltip, coords, position);

          // Show with animation
          requestAnimationFrame(() => {
            if (this.currentTrigger === trigger) {
              this.tooltip.classList.add("show");
            }
          });
        }, 150);
      };

      const hide = () => {
        // Only hide if this is the current trigger
        if (this.currentTrigger !== trigger) return;

        clearTimeout(this.showTimeout);
        this.showTimeout = null;

        // Small delay to allow moving between trigger and tooltip
        this.hideTimeout = setTimeout(() => {
          if (this.currentTrigger === trigger) {
            this.tooltip.classList.remove("show");
            setTimeout(() => {
              if (this.currentTrigger === trigger) {
                this.tooltip.style.display = "none";
                this.currentTrigger = null;
              }
            }, 150);
          }
        }, 50);
      };

      trigger.addEventListener("mouseenter", show);
      trigger.addEventListener("mouseleave", hide);
      trigger.addEventListener("focus", show);
      trigger.addEventListener("blur", hide);

      // Also hide when clicking the trigger itself
      trigger.addEventListener("click", () => this.hideImmediate());
    },

    // Immediately hide without animation (for scroll, click, etc.)
    hideImmediate() {
      clearTimeout(this.showTimeout);
      clearTimeout(this.hideTimeout);
      this.showTimeout = null;
      this.hideTimeout = null;
      this.tooltip.classList.remove("show");
      this.tooltip.style.display = "none";
      this.currentTrigger = null;
    },

    // Programmatic show
    show(trigger, text, options = {}) {
      this.hideImmediate();

      this.currentTrigger = trigger;
      this.tooltip.textContent = text;
      this.tooltip.className = "tooltip";

      if (options.variant === "dark") {
        this.tooltip.classList.add("tooltip-dark");
      }

      this.tooltip.style.display = "";

      const preferredPosition = options.position || "top";
      const { position, coords } = ZenoPosition.calculate(
        trigger,
        this.tooltip,
        preferredPosition,
        8
      );
      ZenoPosition.apply(this.tooltip, coords, position);

      requestAnimationFrame(() => {
        this.tooltip.classList.add("show");
      });

      return this.tooltip;
    },

    // Programmatic hide
    hide() {
      this.tooltip.classList.remove("show");
      setTimeout(() => {
        this.tooltip.style.display = "none";
        this.currentTrigger = null;
      }, 150);
    },
  };

  // ================================================
  // POPOVER
  // ================================================

  const ZenoPopover = {
    activePopover: null,
    activeTrigger: null,

    init() {
      // Initialize popovers from data attributes
      $$("[data-popover]").forEach((trigger) => {
        this.attach(trigger);
      });

      // Close popover on outside click
      document.addEventListener("click", (e) => {
        if (
          this.activePopover &&
          !this.activePopover.contains(e.target) &&
          this.activeTrigger &&
          !this.activeTrigger.contains(e.target)
        ) {
          this.close();
        }
      });

      // Close on escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.activePopover) {
          this.close();
        }
      });

      // Reposition on scroll/resize
      let repositionTimeout;
      const reposition = () => {
        if (this.activePopover && this.activeTrigger) {
          clearTimeout(repositionTimeout);
          repositionTimeout = setTimeout(() => {
            const preferredPosition =
              this.activeTrigger.dataset.popoverPosition || "bottom";
            const { position, coords } = ZenoPosition.calculate(
              this.activeTrigger,
              this.activePopover,
              preferredPosition,
              12
            );
            ZenoPosition.apply(this.activePopover, coords, position);
          }, 10);
        }
      };

      window.addEventListener("scroll", reposition, { passive: true });
      window.addEventListener("resize", reposition, { passive: true });
    },

    attach(trigger) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();

        const popoverId = trigger.dataset.popover;
        const popover = $(`#${popoverId}`);

        if (!popover) return;

        // Toggle if clicking same trigger
        if (this.activePopover === popover && this.activeTrigger === trigger) {
          this.close();
          return;
        }

        // Close any existing popover
        this.close();

        // Show this popover
        this.show(trigger, popover);
      });
    },

    show(trigger, popover) {
      this.activeTrigger = trigger;
      this.activePopover = popover;

      // Position popover
      const preferredPosition = trigger.dataset.popoverPosition || "bottom";
      const { position, coords } = ZenoPosition.calculate(
        trigger,
        popover,
        preferredPosition,
        12
      );
      ZenoPosition.apply(popover, coords, position);

      // Show with animation
      requestAnimationFrame(() => {
        popover.classList.add("show");
      });

      // Dispatch event
      const event = new CustomEvent("popover-show", {
        detail: { trigger, popover },
        bubbles: true,
      });
      trigger.dispatchEvent(event);
    },

    close() {
      if (this.activePopover) {
        this.activePopover.classList.remove("show");

        // Dispatch event
        if (this.activeTrigger) {
          const event = new CustomEvent("popover-hide", {
            detail: {
              trigger: this.activeTrigger,
              popover: this.activePopover,
            },
            bubbles: true,
          });
          this.activeTrigger.dispatchEvent(event);
        }

        this.activePopover = null;
        this.activeTrigger = null;
      }
    },

    // Open programmatically
    open(triggerId, popoverId) {
      const trigger =
        typeof triggerId === "string" ? $(`#${triggerId}`) : triggerId;
      const popover =
        typeof popoverId === "string" ? $(`#${popoverId}`) : popoverId;

      if (trigger && popover) {
        this.close();
        this.show(trigger, popover);
      }
    },
  };

  // ================================================
  // DATE PICKER
  // ================================================

  const ZenoDatepicker = {
    instances: [],

    init() {
      $$(".datepicker-wrapper").forEach((wrapper) => {
        this.attach(wrapper);
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        $$(".datepicker-wrapper.open").forEach((wrapper) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
            const input = $(".datepicker-input", wrapper);
            if (input) input.classList.remove("open");
          }
        });
      });
    },

    attach(wrapper) {
      const input = $(".datepicker-input", wrapper);
      const dropdown = $(".datepicker-dropdown", wrapper);
      const clearBtn = $(".datepicker-clear", wrapper);

      if (!input || !dropdown) return;

      // Get configuration from data attributes
      const config = {
        format: wrapper.dataset.format || "MM/DD/YYYY",
        minDate: wrapper.dataset.minDate
          ? new Date(wrapper.dataset.minDate)
          : null,
        maxDate: wrapper.dataset.maxDate
          ? new Date(wrapper.dataset.maxDate)
          : null,
        disabledDates: wrapper.dataset.disabledDates
          ? JSON.parse(wrapper.dataset.disabledDates)
          : [],
        locale: wrapper.dataset.locale || "en-US",
        firstDayOfWeek: parseInt(wrapper.dataset.firstDay) || 0, // 0 = Sunday, 1 = Monday
        showTodayButton: wrapper.dataset.showToday !== "false",
        placeholder: input.placeholder || "Select date",
      };

      // State
      let selectedDate = wrapper.dataset.value
        ? new Date(wrapper.dataset.value)
        : null;
      let viewDate = selectedDate ? new Date(selectedDate) : new Date();
      let viewMode = "days"; // 'days', 'months', 'years'

      // Month and day names
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthNamesShort = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // Utility functions
      const formatDate = (date, format) => {
        if (!date) return "";
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();

        return format
          .replace("YYYY", y)
          .replace("YY", String(y).slice(-2))
          .replace("MM", String(m).padStart(2, "0"))
          .replace("M", m)
          .replace("DD", String(d).padStart(2, "0"))
          .replace("D", d);
      };

      const parseDate = (str, format) => {
        if (!str) return null;

        // Simple parsing for common formats
        const parts = str.split(/[\/\-\.]/);
        if (parts.length !== 3) return null;

        let year, month, day;

        if (format.startsWith("YYYY")) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
        } else if (format.startsWith("DD")) {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          year = parseInt(parts[2]);
        } else {
          // MM/DD/YYYY default
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }

        if (year < 100) year += 2000;

        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) return null;

        return date;
      };

      const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return (
          d1.getDate() === d2.getDate() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getFullYear() === d2.getFullYear()
        );
      };

      const isToday = (date) => isSameDay(date, new Date());

      const isDateDisabled = (date) => {
        if (config.minDate && date < config.minDate) return true;
        if (config.maxDate && date > config.maxDate) return true;

        return config.disabledDates.some((d) => isSameDay(new Date(d), date));
      };

      const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
      };

      const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
      };

      // Render functions
      const render = () => {
        switch (viewMode) {
          case "days":
            renderDays();
            break;
          case "months":
            renderMonths();
            break;
          case "years":
            renderYears();
            break;
        }
      };

      const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        // Adjust first day based on config
        let startOffset = (firstDay - config.firstDayOfWeek + 7) % 7;

        // Build weekday headers
        const weekdayHeaders = [];
        for (let i = 0; i < 7; i++) {
          const dayIndex = (i + config.firstDayOfWeek) % 7;
          weekdayHeaders.push(
            `<div class="datepicker-weekday">${dayNames[dayIndex].slice(
              0,
              2
            )}</div>`
          );
        }

        // Build days grid
        const days = [];

        // Previous month days
        for (let i = startOffset - 1; i >= 0; i--) {
          const day = daysInPrevMonth - i;
          const date = new Date(year, month - 1, day);
          const disabled = isDateDisabled(date);
          days.push(`
            <button class="datepicker-day other-month${disabled ? "" : ""}" 
                    data-date="${date.toISOString()}"
                    ${disabled ? "disabled" : ""}>
              ${day}
            </button>
          `);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const disabled = isDateDisabled(date);

          const classes = ["datepicker-day"];
          if (isSelected) classes.push("selected");
          if (isTodayDate) classes.push("today");

          days.push(`
            <button class="${classes.join(" ")}" 
                    data-date="${date.toISOString()}"
                    ${disabled ? "disabled" : ""}>
              ${day}
            </button>
          `);
        }

        // Next month days
        const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (startOffset + daysInMonth);
        for (let day = 1; day <= nextMonthDays; day++) {
          const date = new Date(year, month + 1, day);
          const disabled = isDateDisabled(date);
          days.push(`
            <button class="datepicker-day other-month" 
                    data-date="${date.toISOString()}"
                    ${disabled ? "disabled" : ""}>
              ${day}
            </button>
          `);
        }

        dropdown.innerHTML = `
          <div class="datepicker-header">
            <button class="datepicker-nav-btn" data-action="prev-month">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="datepicker-title">
              <button class="datepicker-month-btn" data-action="show-months">${
                monthNames[month]
              }</button>
              <button class="datepicker-year-btn" data-action="show-years">${year}</button>
            </div>
            <button class="datepicker-nav-btn" data-action="next-month">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="datepicker-weekdays">${weekdayHeaders.join("")}</div>
          <div class="datepicker-days">${days.join("")}</div>
          ${
            config.showTodayButton
              ? `
            <div class="datepicker-footer">
              <button class="datepicker-today-btn" data-action="today">Today</button>
              ${
                selectedDate
                  ? `<button class="datepicker-clear-btn" data-action="clear">Clear</button>`
                  : ""
              }
            </div>
          `
              : ""
          }
        `;

        attachDropdownListeners();
      };

      const renderMonths = () => {
        const year = viewDate.getFullYear();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const months = monthNamesShort
          .map((name, index) => {
            const isSelected =
              selectedDate &&
              selectedDate.getMonth() === index &&
              selectedDate.getFullYear() === year;
            const isCurrent = index === currentMonth && year === currentYear;

            const classes = ["datepicker-month-option"];
            if (isSelected) classes.push("selected");
            if (isCurrent && !isSelected) classes.push("current");

            return `<button class="${classes.join(
              " "
            )}" data-month="${index}">${name}</button>`;
          })
          .join("");

        dropdown.innerHTML = `
          <div class="datepicker-header">
            <button class="datepicker-nav-btn" data-action="prev-year">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="datepicker-title">
              <button class="datepicker-year-btn" data-action="show-years">${year}</button>
            </div>
            <button class="datepicker-nav-btn" data-action="next-year">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="datepicker-months">${months}</div>
        `;

        attachDropdownListeners();
      };

      const renderYears = () => {
        const currentYear = new Date().getFullYear();
        const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;

        const years = [];
        for (let i = 0; i < 12; i++) {
          const year = startYear + i;
          const isSelected =
            selectedDate && selectedDate.getFullYear() === year;
          const isCurrent = year === currentYear;

          const classes = ["datepicker-year-option"];
          if (isSelected) classes.push("selected");
          if (isCurrent && !isSelected) classes.push("current");

          years.push(
            `<button class="${classes.join(
              " "
            )}" data-year="${year}">${year}</button>`
          );
        }

        dropdown.innerHTML = `
          <div class="datepicker-header">
            <button class="datepicker-nav-btn" data-action="prev-decade">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="datepicker-title">
              <span style="font-weight: 600; font-size: 0.875rem;">${startYear} - ${
          startYear + 11
        }</span>
            </div>
            <button class="datepicker-nav-btn" data-action="next-decade">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="datepicker-years">${years.join("")}</div>
        `;

        attachDropdownListeners();
      };

      const attachDropdownListeners = () => {
        // Navigation buttons
        $$("[data-action]", dropdown).forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;

            switch (action) {
              case "prev-month":
                viewDate.setMonth(viewDate.getMonth() - 1);
                render();
                break;
              case "next-month":
                viewDate.setMonth(viewDate.getMonth() + 1);
                render();
                break;
              case "prev-year":
                viewDate.setFullYear(viewDate.getFullYear() - 1);
                render();
                break;
              case "next-year":
                viewDate.setFullYear(viewDate.getFullYear() + 1);
                render();
                break;
              case "prev-decade":
                viewDate.setFullYear(viewDate.getFullYear() - 12);
                render();
                break;
              case "next-decade":
                viewDate.setFullYear(viewDate.getFullYear() + 12);
                render();
                break;
              case "show-months":
                viewMode = "months";
                render();
                break;
              case "show-years":
                viewMode = "years";
                render();
                break;
              case "today":
                selectDate(new Date());
                break;
              case "clear":
                clearDate();
                break;
            }
          });
        });

        // Day selection
        $$(".datepicker-day:not(:disabled)", dropdown).forEach((day) => {
          day.addEventListener("click", (e) => {
            e.stopPropagation();
            const date = new Date(day.dataset.date);
            selectDate(date);
          });
        });

        // Month selection
        $$(".datepicker-month-option", dropdown).forEach((month) => {
          month.addEventListener("click", (e) => {
            e.stopPropagation();
            viewDate.setMonth(parseInt(month.dataset.month));
            viewMode = "days";
            render();
          });
        });

        // Year selection
        $$(".datepicker-year-option", dropdown).forEach((year) => {
          year.addEventListener("click", (e) => {
            e.stopPropagation();
            viewDate.setFullYear(parseInt(year.dataset.year));
            viewMode = "months";
            render();
          });
        });
      };

      const selectDate = (date) => {
        selectedDate = date;
        viewDate = new Date(date);
        input.value = formatDate(date, config.format);
        wrapper.classList.add("has-value");
        wrapper.dataset.value = date.toISOString();

        // Dispatch change event
        const event = new CustomEvent("datepicker-change", {
          detail: { date, formatted: input.value },
          bubbles: true,
        });
        wrapper.dispatchEvent(event);

        // Close dropdown
        closeDropdown();
      };

      const clearDate = () => {
        selectedDate = null;
        input.value = "";
        wrapper.classList.remove("has-value");
        delete wrapper.dataset.value;

        // Dispatch change event
        const event = new CustomEvent("datepicker-change", {
          detail: { date: null, formatted: "" },
          bubbles: true,
        });
        wrapper.dispatchEvent(event);

        render();
      };

      const positionDropdown = () => {
        const inputRect = input.getBoundingClientRect();
        const dropdownHeight = dropdown.scrollHeight || 300;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          wrapper.classList.add("datepicker-up");
        } else {
          wrapper.classList.remove("datepicker-up");
        }
      };

      const openDropdown = () => {
        // Close other open datepickers
        $$(".datepicker-wrapper.open").forEach((w) => {
          if (w !== wrapper) {
            w.classList.remove("open");
            const inp = $(".datepicker-input", w);
            if (inp) inp.classList.remove("open");
          }
        });

        viewMode = "days";
        viewDate = selectedDate ? new Date(selectedDate) : new Date();
        render();
        positionDropdown();
        wrapper.classList.add("open");
        input.classList.add("open");
      };

      const closeDropdown = () => {
        wrapper.classList.remove("open");
        input.classList.remove("open");
      };

      // Event listeners
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        if (wrapper.classList.contains("open")) {
          closeDropdown();
        } else {
          openDropdown();
        }
      });

      // Manual input
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const parsed = parseDate(input.value, config.format);
          if (parsed && !isDateDisabled(parsed)) {
            selectDate(parsed);
          }
        } else if (e.key === "Escape") {
          closeDropdown();
        }
      });

      input.addEventListener("blur", () => {
        // Validate manual input on blur
        if (input.value) {
          const parsed = parseDate(input.value, config.format);
          if (parsed && !isDateDisabled(parsed)) {
            selectedDate = parsed;
            viewDate = new Date(parsed);
            input.value = formatDate(parsed, config.format);
            wrapper.classList.add("has-value");
            wrapper.dataset.value = parsed.toISOString();
          } else if (selectedDate) {
            // Restore previous valid value
            input.value = formatDate(selectedDate, config.format);
          } else {
            input.value = "";
            wrapper.classList.remove("has-value");
          }
        }
      });

      // Clear button
      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          clearDate();
        });
      }

      // Reposition on scroll/resize
      window.addEventListener(
        "scroll",
        () => {
          if (wrapper.classList.contains("open")) {
            positionDropdown();
          }
        },
        { passive: true }
      );

      window.addEventListener(
        "resize",
        () => {
          if (wrapper.classList.contains("open")) {
            positionDropdown();
          }
        },
        { passive: true }
      );

      // Initialize with existing value
      if (wrapper.dataset.value) {
        const date = new Date(wrapper.dataset.value);
        if (!isNaN(date.getTime())) {
          selectedDate = date;
          input.value = formatDate(date, config.format);
          wrapper.classList.add("has-value");
        }
      }

      // Store instance for API access
      wrapper._datepicker = {
        getValue: () => selectedDate,
        setValue: (date) => {
          if (date) {
            selectDate(new Date(date));
          } else {
            clearDate();
          }
        },
        clear: clearDate,
        open: openDropdown,
        close: closeDropdown,
      };
    },

    // API methods
    getValue(wrapper) {
      return wrapper._datepicker?.getValue();
    },

    setValue(wrapper, date) {
      wrapper._datepicker?.setValue(date);
    },

    clear(wrapper) {
      wrapper._datepicker?.clear();
    },

    open(wrapper) {
      wrapper._datepicker?.open();
    },

    close(wrapper) {
      wrapper._datepicker?.close();
    },
  };

  // ================================================
  // TABLE / DATA TABLE
  // ================================================

  const ZenoTable = {
    init() {
      $$(".table-wrapper").forEach((wrapper) => {
        this.attach(wrapper);
      });
    },

    attach(wrapper) {
      const table = $(".table", wrapper);
      if (!table) return;

      // Sortable columns
      $$("th.sortable", table).forEach((th) => {
        th.addEventListener("click", () => {
          const columnIndex = Array.from(th.parentElement.children).indexOf(th);
          const tbody = $("tbody", table);
          const rows = Array.from($$("tr", tbody));
          const isAsc =
            th.classList.contains("sorted") && !th.classList.contains("desc");

          // Remove sorted class from all headers
          $$("th.sortable", table).forEach((header) => {
            header.classList.remove("sorted", "desc");
          });

          // Add sorted class to clicked header
          th.classList.add("sorted");
          if (isAsc) {
            th.classList.add("desc");
          }

          // Sort rows
          rows.sort((a, b) => {
            const aValue = a.children[columnIndex]?.textContent.trim() || "";
            const bValue = b.children[columnIndex]?.textContent.trim() || "";

            // Check if numeric
            const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ""));
            const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ""));

            if (!isNaN(aNum) && !isNaN(bNum)) {
              return isAsc ? bNum - aNum : aNum - bNum;
            }

            return isAsc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          });

          // Re-append sorted rows
          rows.forEach((row) => tbody.appendChild(row));

          // Dispatch event
          const event = new CustomEvent("table-sort", {
            detail: { column: columnIndex, direction: isAsc ? "desc" : "asc" },
            bubbles: true,
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Row selection
      const selectAllCheckbox = $(".table-select-all", wrapper);
      const rowCheckboxes = $$(".table-row-select", wrapper);

      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", () => {
          const checked = selectAllCheckbox.checked;
          rowCheckboxes.forEach((checkbox) => {
            checkbox.checked = checked;
            const row = checkbox.closest("tr");
            if (row) {
              row.classList.toggle("selected", checked);
            }
          });

          this.dispatchSelectionEvent(wrapper);
        });
      }

      rowCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const row = checkbox.closest("tr");
          if (row) {
            row.classList.toggle("selected", checkbox.checked);
          }

          // Update select all checkbox
          if (selectAllCheckbox) {
            const allChecked = Array.from(rowCheckboxes).every(
              (cb) => cb.checked
            );
            const someChecked = Array.from(rowCheckboxes).some(
              (cb) => cb.checked
            );
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
          }

          this.dispatchSelectionEvent(wrapper);
        });
      });
    },

    dispatchSelectionEvent(wrapper) {
      const selected = $$(".table-row-select:checked", wrapper);
      const values = Array.from(selected).map(
        (cb) => cb.value || cb.closest("tr")?.dataset.id
      );

      const event = new CustomEvent("table-selection", {
        detail: { selected: values, count: values.length },
        bubbles: true,
      });
      wrapper.dispatchEvent(event);
    },

    getSelectedRows(wrapper) {
      const selected = $$(".table-row-select:checked", wrapper);
      return Array.from(selected).map((cb) => cb.closest("tr"));
    },
  };

  // ================================================
  // PAGINATION
  // ================================================

  const ZenoPagination = {
    init() {
      $$(".pagination").forEach((pagination) => {
        this.attach(pagination);
      });
    },

    attach(pagination) {
      const buttons = $$(".pagination-btn", pagination);

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.disabled) return;

          const action = btn.dataset.action;
          const page = btn.dataset.page;

          // Handle page number click
          if (page) {
            $$(".pagination-btn.active", pagination).forEach((b) => {
              b.classList.remove("active");
            });
            btn.classList.add("active");

            this.dispatchEvent(pagination, parseInt(page));
          }

          // Handle action buttons (prev, next, first, last)
          if (action) {
            const currentPage = parseInt(
              $(".pagination-btn.active", pagination)?.dataset.page || 1
            );
            const totalPages = parseInt(pagination.dataset.totalPages || 1);
            let newPage = currentPage;

            switch (action) {
              case "first":
                newPage = 1;
                break;
              case "prev":
                newPage = Math.max(1, currentPage - 1);
                break;
              case "next":
                newPage = Math.min(totalPages, currentPage + 1);
                break;
              case "last":
                newPage = totalPages;
                break;
            }

            if (newPage !== currentPage) {
              this.goToPage(pagination, newPage);
            }
          }
        });
      });
    },

    goToPage(pagination, page) {
      const pageBtn = $(`.pagination-btn[data-page="${page}"]`, pagination);
      if (pageBtn) {
        $$(".pagination-btn.active", pagination).forEach((b) => {
          b.classList.remove("active");
        });
        pageBtn.classList.add("active");
      }

      this.dispatchEvent(pagination, page);
      this.updateNavigationState(pagination, page);
    },

    updateNavigationState(pagination, currentPage) {
      const totalPages = parseInt(pagination.dataset.totalPages || 1);

      const firstBtn = $('[data-action="first"]', pagination);
      const prevBtn = $('[data-action="prev"]', pagination);
      const nextBtn = $('[data-action="next"]', pagination);
      const lastBtn = $('[data-action="last"]', pagination);

      if (firstBtn) firstBtn.disabled = currentPage <= 1;
      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
      if (lastBtn) lastBtn.disabled = currentPage >= totalPages;
    },

    dispatchEvent(pagination, page) {
      const event = new CustomEvent("page-change", {
        detail: { page },
        bubbles: true,
      });
      pagination.dispatchEvent(event);
    },

    // Programmatic API
    render(container, options = {}) {
      const {
        currentPage = 1,
        totalPages = 1,
        showFirstLast = true,
        maxVisible = 5,
      } = options;

      container.dataset.totalPages = totalPages;

      let html = "";

      if (showFirstLast) {
        html += `<button class="pagination-btn" data-action="first" ${
          currentPage <= 1 ? "disabled" : ""
        }>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
        </button>`;
      }

      html += `<button class="pagination-btn" data-action="prev" ${
        currentPage <= 1 ? "disabled" : ""
      }>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>`;

      // Page numbers
      const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (startPage > 1) {
        html += `<button class="pagination-btn pagination-page" data-page="1">1</button>`;
        if (startPage > 2) {
          html += `<span class="pagination-ellipsis">...</span>`;
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        const isAdjacent = Math.abs(i - currentPage) <= 1;
        html += `<button class="pagination-btn pagination-page ${
          i === currentPage ? "active" : ""
        } ${isAdjacent ? "adjacent" : ""}" data-page="${i}">${i}</button>`;
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-btn pagination-page" data-page="${totalPages}">${totalPages}</button>`;
      }

      html += `<button class="pagination-btn" data-action="next" ${
        currentPage >= totalPages ? "disabled" : ""
      }>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>`;

      if (showFirstLast) {
        html += `<button class="pagination-btn" data-action="last" ${
          currentPage >= totalPages ? "disabled" : ""
        }>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
        </button>`;
      }

      container.innerHTML = html;
      this.attach(container);
    },
  };

  // ================================================
  // FILE UPLOAD / DROPZONE
  // ================================================

  const ZenoDropzone = {
    init() {
      $$(".dropzone").forEach((dropzone) => {
        this.attach(dropzone);
      });
    },

    attach(dropzone) {
      const input = $(".dropzone-input", dropzone);
      const fileList = $(".file-list", dropzone);

      if (!input) return;

      const config = {
        maxSize: parseInt(dropzone.dataset.maxSize) || 10 * 1024 * 1024, // 10MB default
        maxFiles: parseInt(dropzone.dataset.maxFiles) || 10,
        accept: dropzone.dataset.accept || "*",
        multiple: input.hasAttribute("multiple"),
      };

      let files = [];

      // Drag events
      ["dragenter", "dragover"].forEach((event) => {
        dropzone.addEventListener(event, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach((event) => {
        dropzone.addEventListener(event, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove("dragover");
        });
      });

      // Handle drop
      dropzone.addEventListener("drop", (e) => {
        const droppedFiles = Array.from(e.dataTransfer.files);
        this.handleFiles(dropzone, droppedFiles, files, config, fileList);
      });

      // Handle file input change
      input.addEventListener("change", () => {
        const selectedFiles = Array.from(input.files);
        this.handleFiles(dropzone, selectedFiles, files, config, fileList);
        input.value = ""; // Reset input
      });

      // Store files reference
      dropzone._files = files;
    },

    handleFiles(dropzone, newFiles, files, config, fileList) {
      newFiles.forEach((file) => {
        // Check max files
        if (files.length >= config.maxFiles) {
          ZenoToast.warning(`Maximum ${config.maxFiles} files allowed`);
          return;
        }

        // Check file size
        if (file.size > config.maxSize) {
          ZenoToast.error(
            `File "${file.name}" is too large. Max size is ${this.formatSize(
              config.maxSize
            )}`
          );
          return;
        }

        // Check file type
        if (config.accept !== "*") {
          const acceptedTypes = config.accept.split(",").map((t) => t.trim());
          const fileType = file.type;
          const fileExt = "." + file.name.split(".").pop().toLowerCase();

          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
              return fileExt === type.toLowerCase();
            }
            if (type.endsWith("/*")) {
              return fileType.startsWith(type.replace("/*", "/"));
            }
            return fileType === type;
          });

          if (!isAccepted) {
            ZenoToast.error(`File type not allowed: ${file.name}`);
            return;
          }
        }

        // Add file
        const fileObj = {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "pending",
        };

        files.push(fileObj);
      });

      this.renderFileList(dropzone, files, fileList);
      dropzone.classList.toggle("has-files", files.length > 0);

      // Dispatch event
      const event = new CustomEvent("files-change", {
        detail: { files: files.map((f) => f.file) },
        bubbles: true,
      });
      dropzone.dispatchEvent(event);
    },

    renderFileList(dropzone, files, fileList) {
      if (!fileList) {
        fileList = document.createElement("div");
        fileList.className = "file-list";
        dropzone.appendChild(fileList);
      }

      fileList.innerHTML = files
        .map(
          (fileObj) => `
        <div class="file-item" data-id="${fileObj.id}">
          <div class="file-icon">
            ${this.getFileIcon(fileObj.file.type)}
          </div>
          <div class="file-info">
            <div class="file-name">${fileObj.name}</div>
            <div class="file-size">${this.formatSize(fileObj.size)}</div>
            ${
              fileObj.status === "uploading"
                ? `
              <div class="file-progress">
                <div class="file-progress-bar" style="width: ${fileObj.progress}%"></div>
              </div>
            `
                : ""
            }
          </div>
          ${
            fileObj.status === "success"
              ? `
            <svg class="file-status success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          `
              : fileObj.status === "error"
              ? `
            <svg class="file-status error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          `
              : `
            <button class="file-remove" data-id="${fileObj.id}">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          `
          }
        </div>
      `
        )
        .join("");

      // Attach remove handlers
      $$(".file-remove", fileList).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseFloat(btn.dataset.id);
          const index = files.findIndex((f) => f.id === id);
          if (index > -1) {
            files.splice(index, 1);
            this.renderFileList(dropzone, files, fileList);
            dropzone.classList.toggle("has-files", files.length > 0);

            const event = new CustomEvent("files-change", {
              detail: { files: files.map((f) => f.file) },
              bubbles: true,
            });
            dropzone.dispatchEvent(event);
          }
        });
      });
    },

    formatSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },

    getFileIcon(mimeType) {
      if (mimeType.startsWith("image/")) {
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
      }
      if (mimeType.startsWith("video/")) {
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`;
      }
      if (mimeType.startsWith("audio/")) {
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>`;
      }
      return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    },

    // API
    getFiles(dropzone) {
      return dropzone._files || [];
    },

    clearFiles(dropzone) {
      const files = dropzone._files || [];
      files.length = 0;
      const fileList = $(".file-list", dropzone);
      if (fileList) {
        fileList.innerHTML = "";
      }
      dropzone.classList.remove("has-files");
    },

    // Simulate upload progress
    simulateUpload(dropzone, onProgress, onComplete) {
      const files = dropzone._files || [];
      const fileList = $(".file-list", dropzone);

      files.forEach((fileObj, index) => {
        fileObj.status = "uploading";
        fileObj.progress = 0;

        const interval = setInterval(() => {
          fileObj.progress += Math.random() * 30;
          if (fileObj.progress >= 100) {
            fileObj.progress = 100;
            fileObj.status = "success";
            clearInterval(interval);

            if (onComplete) onComplete(fileObj);

            // Check if all done
            if (files.every((f) => f.status === "success")) {
              const event = new CustomEvent("upload-complete", {
                detail: { files },
                bubbles: true,
              });
              dropzone.dispatchEvent(event);
            }
          }

          if (onProgress) onProgress(fileObj);
          this.renderFileList(dropzone, files, fileList);
        }, 200 + Math.random() * 300);
      });
    },
  };

  // ================================================
  // TIME PICKER
  // ================================================

  const ZenoTimepicker = {
    init() {
      $$(".timepicker-wrapper").forEach((wrapper) => {
        this.attach(wrapper);
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        $$(".timepicker-wrapper.open").forEach((wrapper) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
            const input = $(".timepicker-input", wrapper);
            if (input) input.classList.remove("open");
          }
        });
      });
    },

    attach(wrapper) {
      const input = $(".timepicker-input", wrapper);
      const dropdown = $(".timepicker-dropdown", wrapper);

      if (!input || !dropdown) return;

      const config = {
        format: wrapper.dataset.format || "12h", // '12h' or '24h'
        minuteStep: parseInt(wrapper.dataset.minuteStep) || 5,
        defaultTime: wrapper.dataset.value || null,
      };

      let selectedHour = 12;
      let selectedMinute = 0;
      let selectedPeriod = "AM";

      // Parse default time
      if (config.defaultTime) {
        const [time, period] = config.defaultTime.split(" ");
        const [h, m] = time.split(":").map(Number);
        selectedHour = h;
        selectedMinute = m;
        if (period) selectedPeriod = period;
      }

      const render = () => {
        const is12h = config.format === "12h";
        const hours = is12h ? 12 : 24;
        const startHour = is12h ? 1 : 0;

        let hoursHtml = "";
        for (let h = startHour; h <= hours; h++) {
          const displayHour = is12h ? h : h.toString().padStart(2, "0");
          const isSelected = (is12h ? h : h) === selectedHour;
          hoursHtml += `<div class="timepicker-option ${
            isSelected ? "selected" : ""
          }" data-hour="${h}">${displayHour}</div>`;
        }
        if (!is12h) {
          // Remove hour 24, it should be 0-23
          hoursHtml = "";
          for (let h = 0; h < 24; h++) {
            const displayHour = h.toString().padStart(2, "0");
            const isSelected = h === selectedHour;
            hoursHtml += `<div class="timepicker-option ${
              isSelected ? "selected" : ""
            }" data-hour="${h}">${displayHour}</div>`;
          }
        }

        let minutesHtml = "";
        for (let m = 0; m < 60; m += config.minuteStep) {
          const displayMinute = m.toString().padStart(2, "0");
          const isSelected = m === selectedMinute;
          minutesHtml += `<div class="timepicker-option ${
            isSelected ? "selected" : ""
          }" data-minute="${m}">${displayMinute}</div>`;
        }

        dropdown.innerHTML = `
          <div class="timepicker-columns">
            <div class="timepicker-column" data-type="hours">${hoursHtml}</div>
            <div class="timepicker-separator">:</div>
            <div class="timepicker-column" data-type="minutes">${minutesHtml}</div>
            ${
              is12h
                ? `
              <div class="timepicker-period">
                <button class="timepicker-period-btn ${
                  selectedPeriod === "AM" ? "active" : ""
                }" data-period="AM">AM</button>
                <button class="timepicker-period-btn ${
                  selectedPeriod === "PM" ? "active" : ""
                }" data-period="PM">PM</button>
              </div>
            `
                : ""
            }
          </div>
        `;

        // Scroll selected options into view
        requestAnimationFrame(() => {
          $$(".timepicker-option.selected", dropdown).forEach((opt) => {
            opt.scrollIntoView({ block: "center" });
          });
        });

        attachHandlers();
      };

      const attachHandlers = () => {
        $$(".timepicker-option", dropdown).forEach((opt) => {
          opt.addEventListener("click", (e) => {
            e.stopPropagation();

            if (opt.dataset.hour !== undefined) {
              selectedHour = parseInt(opt.dataset.hour);
              $$("[data-hour]", dropdown).forEach((o) =>
                o.classList.remove("selected")
              );
              opt.classList.add("selected");
            }

            if (opt.dataset.minute !== undefined) {
              selectedMinute = parseInt(opt.dataset.minute);
              $$("[data-minute]", dropdown).forEach((o) =>
                o.classList.remove("selected")
              );
              opt.classList.add("selected");
            }

            updateInput();
          });
        });

        $$(".timepicker-period-btn", dropdown).forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedPeriod = btn.dataset.period;
            $$(".timepicker-period-btn", dropdown).forEach((b) =>
              b.classList.remove("active")
            );
            btn.classList.add("active");
            updateInput();
          });
        });
      };

      const updateInput = () => {
        const is12h = config.format === "12h";
        const hourDisplay = is12h
          ? selectedHour
          : selectedHour.toString().padStart(2, "0");
        const minuteDisplay = selectedMinute.toString().padStart(2, "0");
        const timeStr = is12h
          ? `${hourDisplay}:${minuteDisplay} ${selectedPeriod}`
          : `${hourDisplay}:${minuteDisplay}`;

        input.value = timeStr;

        // Dispatch event
        const event = new CustomEvent("timepicker-change", {
          detail: {
            hour: selectedHour,
            minute: selectedMinute,
            period: selectedPeriod,
            formatted: timeStr,
          },
          bubbles: true,
        });
        wrapper.dispatchEvent(event);
      };

      const positionDropdown = () => {
        const inputRect = input.getBoundingClientRect();
        const dropdownHeight = dropdown.scrollHeight || 250;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - inputRect.bottom;

        if (spaceBelow < dropdownHeight && inputRect.top > spaceBelow) {
          wrapper.classList.add("timepicker-up");
        } else {
          wrapper.classList.remove("timepicker-up");
        }
      };

      input.addEventListener("click", (e) => {
        e.stopPropagation();

        // Close other open timepickers
        $$(".timepicker-wrapper.open").forEach((w) => {
          if (w !== wrapper) {
            w.classList.remove("open");
            const inp = $(".timepicker-input", w);
            if (inp) inp.classList.remove("open");
          }
        });

        render();
        positionDropdown();
        wrapper.classList.toggle("open");
        input.classList.toggle("open");
      });

      // Initialize display
      if (config.defaultTime) {
        updateInput();
      }

      // Store API
      wrapper._timepicker = {
        getValue: () => ({
          hour: selectedHour,
          minute: selectedMinute,
          period: selectedPeriod,
        }),
        setValue: (hour, minute, period = "AM") => {
          selectedHour = hour;
          selectedMinute = minute;
          selectedPeriod = period;
          updateInput();
        },
      };
    },

    getValue(wrapper) {
      return wrapper._timepicker?.getValue();
    },

    setValue(wrapper, hour, minute, period) {
      wrapper._timepicker?.setValue(hour, minute, period);
    },
  };

  // ================================================
  // STEPS / WIZARD
  // ================================================

  const ZenoSteps = {
    init() {
      $$(".steps").forEach((steps) => {
        this.attach(steps);
      });
    },

    attach(stepsContainer) {
      const steps = $$(".step", stepsContainer);

      stepsContainer._steps = {
        current: 0,
        total: steps.length,

        goTo: (index) => {
          if (index < 0 || index >= steps.length) return;

          steps.forEach((step, i) => {
            step.classList.remove("active", "completed");
            if (i < index) {
              step.classList.add("completed");
            } else if (i === index) {
              step.classList.add("active");
            }
          });

          this.current = index;

          const event = new CustomEvent("step-change", {
            detail: { step: index, total: steps.length },
            bubbles: true,
          });
          stepsContainer.dispatchEvent(event);
        },

        next: () => {
          if (this.current < steps.length - 1) {
            stepsContainer._steps.goTo(this.current + 1);
          }
        },

        prev: () => {
          if (this.current > 0) {
            stepsContainer._steps.goTo(this.current - 1);
          }
        },

        setError: (index) => {
          if (steps[index]) {
            steps[index].classList.add("error");
          }
        },

        clearError: (index) => {
          if (steps[index]) {
            steps[index].classList.remove("error");
          }
        },
      };

      // Initialize first step as active if none are
      if (!$(".step.active", stepsContainer)) {
        steps[0]?.classList.add("active");
      }
    },

    goTo(container, index) {
      container._steps?.goTo(index);
    },

    next(container) {
      container._steps?.next();
    },

    prev(container) {
      container._steps?.prev();
    },
  };

  // ================================================
  // RATING (STARS)
  // ================================================

  const ZenoRating = {
    init() {
      $$(".rating").forEach((rating) => {
        this.attach(rating);
      });
    },

    attach(ratingEl) {
      const stars = $$(".rating-star", ratingEl);
      const valueEl = $(".rating-value", ratingEl);
      const isReadonly = ratingEl.classList.contains("readonly");
      const allowHalf = ratingEl.hasAttribute("data-allow-half");

      let currentValue = parseFloat(ratingEl.dataset.value) || 0;

      const updateDisplay = (value, isHover = false) => {
        stars.forEach((star, index) => {
          star.classList.remove("filled", "half");

          const starValue = index + 1;
          if (value >= starValue) {
            star.classList.add("filled");
          } else if (allowHalf && value >= starValue - 0.5) {
            star.classList.add("half", "filled");
          }
        });

        if (valueEl && !isHover) {
          valueEl.textContent = value.toFixed(allowHalf ? 1 : 0);
        }
      };

      const setValue = (value) => {
        currentValue = value;
        ratingEl.dataset.value = value;
        updateDisplay(value);

        const event = new CustomEvent("rating-change", {
          detail: { value },
          bubbles: true,
        });
        ratingEl.dispatchEvent(event);
      };

      if (!isReadonly) {
        stars.forEach((star, index) => {
          star.addEventListener("mouseenter", (e) => {
            let hoverValue = index + 1;

            if (allowHalf) {
              const rect = star.getBoundingClientRect();
              const isLeftHalf = e.clientX - rect.left < rect.width / 2;
              hoverValue = isLeftHalf ? index + 0.5 : index + 1;
            }

            updateDisplay(hoverValue, true);
          });

          star.addEventListener("mouseleave", () => {
            updateDisplay(currentValue);
          });

          star.addEventListener("click", (e) => {
            let newValue = index + 1;

            if (allowHalf) {
              const rect = star.getBoundingClientRect();
              const isLeftHalf = e.clientX - rect.left < rect.width / 2;
              newValue = isLeftHalf ? index + 0.5 : index + 1;
            }

            setValue(newValue);
          });
        });

        ratingEl.addEventListener("mouseleave", () => {
          updateDisplay(currentValue);
        });
      }

      // Initialize
      updateDisplay(currentValue);

      // Store API
      ratingEl._rating = {
        getValue: () => currentValue,
        setValue,
      };
    },

    getValue(ratingEl) {
      return ratingEl._rating?.getValue() || 0;
    },

    setValue(ratingEl, value) {
      ratingEl._rating?.setValue(value);
    },
  };

  // ================================================
  // PASSWORD INPUT
  // ================================================

  const ZenoPassword = {
    init() {
      $$(".password-wrapper").forEach((wrapper) => {
        this.attach(wrapper);
      });
    },

    attach(wrapper) {
      const input = $(".password-input", wrapper);
      const toggle = $(".password-toggle", wrapper);
      const strengthBar = $(".password-strength", wrapper);

      if (!input) return;

      // Toggle visibility
      if (toggle) {
        toggle.addEventListener("click", () => {
          const isPassword = input.type === "password";
          input.type = isPassword ? "text" : "password";

          toggle.innerHTML = isPassword
            ? `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`
            : `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
        });
      }

      // Strength indicator
      if (strengthBar) {
        const strengthText = $(".password-strength-text", wrapper);
        const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

        input.addEventListener("input", () => {
          const strength = this.calculateStrength(input.value);
          strengthBar.dataset.strength = strength;

          if (strengthText) {
            strengthText.textContent = strengthLabels[strength] || "";
          }

          const event = new CustomEvent("password-strength", {
            detail: { strength, label: strengthLabels[strength] },
            bubbles: true,
          });
          wrapper.dispatchEvent(event);
        });
      }
    },

    calculateStrength(password) {
      if (!password) return 0;

      let strength = 0;

      // Length
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;

      // Contains lowercase
      if (/[a-z]/.test(password)) strength += 0.5;

      // Contains uppercase
      if (/[A-Z]/.test(password)) strength += 0.5;

      // Contains numbers
      if (/[0-9]/.test(password)) strength += 0.5;

      // Contains special chars
      if (/[^a-zA-Z0-9]/.test(password)) strength += 0.5;

      return Math.min(4, Math.floor(strength));
    },
  };

  // ================================================
  // DRAWER / SLIDE PANEL
  // ================================================

  const ZenoDrawer = {
    activeDrawer: null,

    init() {
      $$(".drawer").forEach((drawer) => {
        this.attach(drawer);
      });
    },

    attach(drawer) {
      const closeBtn = $(".drawer-close", drawer);
      const overlay = $(`#${drawer.id}-overlay`);

      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.close(drawer.id);
        });
      }

      if (overlay) {
        overlay.addEventListener("click", () => {
          this.close(drawer.id);
        });
      }
    },

    open(drawerId) {
      const drawer = $(`#${drawerId}`);
      const overlay = $(`#${drawerId}-overlay`);

      if (!drawer) return;

      // Close any open drawer
      if (this.activeDrawer && this.activeDrawer !== drawer) {
        this.close(this.activeDrawer.id);
      }

      if (overlay) overlay.classList.add("active");
      drawer.classList.add("open");
      document.body.style.overflow = "hidden";
      this.activeDrawer = drawer;

      // Escape key handler
      const escHandler = (e) => {
        if (e.key === "Escape") {
          this.close(drawerId);
          document.removeEventListener("keydown", escHandler);
        }
      };
      document.addEventListener("keydown", escHandler);

      // Dispatch event
      const event = new CustomEvent("drawer-open", {
        detail: { id: drawerId },
        bubbles: true,
      });
      drawer.dispatchEvent(event);
    },

    close(drawerId) {
      const drawer = $(`#${drawerId}`);
      const overlay = $(`#${drawerId}-overlay`);

      if (!drawer) return;

      if (overlay) overlay.classList.remove("active");
      drawer.classList.remove("open");
      document.body.style.overflow = "";
      this.activeDrawer = null;

      // Dispatch event
      const event = new CustomEvent("drawer-close", {
        detail: { id: drawerId },
        bubbles: true,
      });
      drawer.dispatchEvent(event);
    },

    toggle(drawerId) {
      const drawer = $(`#${drawerId}`);
      if (drawer?.classList.contains("open")) {
        this.close(drawerId);
      } else {
        this.open(drawerId);
      }
    },
  };

  // ================================================
  // STATS COMPONENT
  // ================================================

  const ZenoStats = {
    init() {
      // Stats components are primarily presentational
      // This initialization can be used for dynamic updates or animations
      const statsCards = $$(".stats-card");

      statsCards.forEach((card) => {
        // Add animation on scroll into view
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
              }
            });
          },
          { threshold: 0.1 }
        );

        card.style.opacity = "0";
        card.style.transform = "translateY(10px)";
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(card);
      });
    },

    // Utility function to format numbers
    formatNumber(value, options = {}) {
      const {
        decimals = 0,
        thousandSeparator = ",",
        prefix = "",
        suffix = "",
      } = options;

      let num = parseFloat(value);
      if (isNaN(num)) return value;

      const formatted = num.toFixed(decimals);
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

      return prefix + parts.join(".") + suffix;
    },

    // Utility function to animate number counting
    animateValue(element, start, end, duration = 1000, options = {}) {
      const startTime = performance.now();
      const { formatNumber: formatFn = this.formatNumber, ...formatOptions } =
        options;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;

        if (element) {
          element.textContent = formatFn(current, formatOptions);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = formatFn(end, formatOptions);
        }
      };

      requestAnimationFrame(animate);
    },
  };

  // ================================================
  // COPY TO CLIPBOARD
  // ================================================

  const ZenoCopyToClipboard = {
    init() {
      // Initialize copy buttons
      $$("[data-copy]").forEach((button) => {
        this.attach(button);
      });

      // Initialize click-to-copy elements
      $$("[data-click-copy]").forEach((element) => {
        this.attachClickToCopy(element);
      });

      // Initialize code block copy buttons
      $$("pre").forEach((pre) => {
        const codeBlock = $("code", pre);
        if (codeBlock && !pre.querySelector(".copy-code-btn")) {
          this.attachCodeBlock(codeBlock);
        }
      });
    },

    attach(button) {
      const textToCopy = button.dataset.copy;
      const targetSelector = button.dataset.copyTarget;
      const successMessage = button.dataset.copySuccess || "Copied!";
      const showToast = button.dataset.copyToast !== "false";

      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        let text = textToCopy;

        // If target selector is provided, get text from that element
        if (targetSelector) {
          const target = $(targetSelector);
          if (target) {
            text = target.textContent || target.value || target.innerText;
          }
        }

        if (!text) return;

        try {
          await navigator.clipboard.writeText(text);
          this.showSuccess(button, successMessage, showToast);
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            this.showSuccess(button, successMessage, showToast);
          } catch (fallbackErr) {
            if (showToast) {
              ZenoToast.error("Failed to copy to clipboard");
            }
          }
          document.body.removeChild(textArea);
        }
      });
    },

    attachClickToCopy(element) {
      const originalText = element.textContent;
      const successMessage = element.dataset.clickCopySuccess || "Copied!";
      const showToast = element.dataset.clickCopyToast !== "false";

      element.style.cursor = "pointer";
      element.title = "Click to copy";

      element.addEventListener("click", async () => {
        const text = element.textContent || element.innerText;

        try {
          await navigator.clipboard.writeText(text);
          this.showSuccess(element, successMessage, showToast);
        } catch (err) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            this.showSuccess(element, successMessage, showToast);
          } catch (fallbackErr) {
            if (showToast) {
              ZenoToast.error("Failed to copy to clipboard");
            }
          }
          document.body.removeChild(textArea);
        }
      });
    },

    attachCodeBlock(codeBlock) {
      const pre = codeBlock.closest("pre");
      if (!pre || pre.querySelector(".copy-code-btn")) return;

      const button = document.createElement("button");
      button.className = "copy-code-btn";
      button.setAttribute("aria-label", "Copy code");
      button.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
      `;

      pre.style.position = "relative";
      pre.appendChild(button);

      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const text = codeBlock.textContent;

        try {
          await navigator.clipboard.writeText(text);
          this.showSuccess(button, "Code copied!", true);
        } catch (err) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            this.showSuccess(button, "Code copied!", true);
          } catch (fallbackErr) {
            ZenoToast.error("Failed to copy code");
          }
          document.body.removeChild(textArea);
        }
      });
    },

    showSuccess(element, message, showToast) {
      // Visual feedback
      const originalText = element.textContent;
      const originalHTML = element.innerHTML;

      if (element.classList.contains("copy-code-btn")) {
        element.innerHTML = `
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        `;
        setTimeout(() => {
          element.innerHTML = originalHTML;
        }, 2000);
      } else if (element.tagName === "BUTTON") {
        const originalContent = element.innerHTML;
        element.innerHTML = `
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          ${message}
        `;
        setTimeout(() => {
          element.innerHTML = originalContent;
        }, 2000);
      } else {
        const originalContent = element.textContent;
        element.textContent = message;
        element.style.color = "var(--success)";
        setTimeout(() => {
          element.textContent = originalContent;
          element.style.color = "";
        }, 2000);
      }

      // Toast notification
      if (showToast) {
        ZenoToast.success(message);
      }
    },

    // Programmatic API
    copy(text, options = {}) {
      const { successMessage = "Copied!", showToast = true } = options;

      return new Promise(async (resolve, reject) => {
        try {
          await navigator.clipboard.writeText(text);
          if (showToast) {
            ZenoToast.success(successMessage);
          }
          resolve(true);
        } catch (err) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            if (showToast) {
              ZenoToast.success(successMessage);
            }
            resolve(true);
          } catch (fallbackErr) {
            if (showToast) {
              ZenoToast.error("Failed to copy to clipboard");
            }
            reject(fallbackErr);
          }
          document.body.removeChild(textArea);
        }
      });
    },
  };

  // ================================================
  // BACK TO TOP BUTTON
  // ================================================

  const ZenoBackToTop = {
    init() {
      // Create button if it doesn't exist
      let button = $(".back-to-top");
      if (!button) {
        button = document.createElement("button");
        button.className = "back-to-top";
        button.setAttribute("aria-label", "Back to top");
        button.innerHTML = `
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
          </svg>
        `;
        document.body.appendChild(button);
      }

      this.attach(button);
    },

    attach(button) {
      // Show/hide based on scroll position
      const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
          button.classList.add("visible");
        } else {
          button.classList.remove("visible");
        }
      };

      window.addEventListener("scroll", toggleVisibility);
      toggleVisibility(); // Initial check

      // Scroll to top on click
      button.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    },
  };

  // ================================================
  // SHARE COMPONENT
  // ================================================

  const ZenoShare = {
    init() {
      $$("[data-share]").forEach((button) => {
        this.attach(button);
      });
    },

    attach(button) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();

        const shareData = {
          title: button.dataset.shareTitle || document.title,
          text: button.dataset.shareText || "",
          url: button.dataset.shareUrl || window.location.href,
        };

        // Use Web Share API if available
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            if (err.name !== "AbortError") {
              // Fallback to copy URL
              ZenoCopyToClipboard.copy(shareData.url, {
                successMessage: "Link copied to clipboard!",
              });
            }
          }
        } else {
          // Fallback: copy URL to clipboard
          ZenoCopyToClipboard.copy(shareData.url, {
            successMessage: "Link copied to clipboard!",
          });
        }
      });
    },

    // Programmatic API
    share(data) {
      if (navigator.share) {
        return navigator.share(data);
      } else {
        return ZenoCopyToClipboard.copy(data.url || window.location.href, {
          successMessage: "Link copied to clipboard!",
        });
      }
    },
  };

  // ================================================
  // SCREENSHOT COMPONENT (No Dependencies)
  // Uses native browser APIs: Canvas, SVG, and DOM
  // ================================================

  const ZenoScreenshot = {
    init() {
      // Auto-initialize buttons with data-screenshot attribute
      $$("[data-screenshot]").forEach((button) => {
        this.attach(button);
      });
    },

    attach(button) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        const selector = button.dataset.screenshot;
        const options = {
          format: button.dataset.screenshotFormat || "png",
          quality: parseFloat(button.dataset.screenshotQuality) || 1.0,
          download: button.dataset.screenshotDownload !== "false",
          filename: button.dataset.screenshotFilename || "screenshot",
          backgroundColor: button.dataset.screenshotBg || "#ffffff",
        };

        try {
          const element = selector ? $(selector) : document.body;
          if (!element) {
            ZenoToast.error("Element not found");
            return;
          }

          // Show loading state
          const originalText = button.textContent;
          button.disabled = true;
          if (button.textContent) {
            button.textContent = "Capturing...";
          }

          const blob = await this.capture(element, options);

          // Restore button state
          button.disabled = false;
          if (originalText) {
            button.textContent = originalText;
          }

          if (options.download) {
            this.download(blob, options.filename, options.format);
          } else {
            return blob;
          }
        } catch (error) {
          console.error("Screenshot error:", error);
          button.disabled = false;
          ZenoToast.error(
            "Failed to capture screenshot. Some browsers have restrictions on capturing styled content."
          );
        }
      });
    },

    /**
     * Capture an element as an image using native browser APIs
     * Uses multiple fallback methods for maximum compatibility
     * @param {HTMLElement} element - Element to capture
     * @param {Object} options - Capture options
     * @returns {Promise<Blob>} Image blob
     */
    async capture(element, options = {}) {
      const {
        format = "png",
        quality = 1.0,
        backgroundColor = "#ffffff",
        scale = window.devicePixelRatio || 1,
      } = options;

      const rect = element.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext("2d");

      // Scale context for high DPI
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }

      // Fill background
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Try multiple methods in order of reliability
      try {
        // Method 1: Try using data URL with SVG (better compatibility)
        return await this.captureUsingClone(
          element,
          canvas,
          ctx,
          width,
          height,
          format,
          quality
        );
      } catch (error1) {
        console.warn("Data URL method failed, trying blob URL:", error1);
        try {
          // Method 2: Try SVG foreignObject with blob URL
          const svgData = this.elementToSVG(element, width, height);
          await this.svgToCanvas(svgData, canvas, ctx, width, height);
          return await this.canvasToBlob(canvas, format, quality);
        } catch (error2) {
          console.warn(
            "Blob URL method failed, trying basic canvas rendering:",
            error2
          );
          try {
            // Method 3: Try to render text and basic shapes from element
            return await this.captureBasic(
              element,
              canvas,
              ctx,
              width,
              height,
              format,
              quality
            );
          } catch (error3) {
            console.warn("All methods failed:", error3);
            // Final fallback - at least return something
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, width, height);
            ctx.fillStyle = "#666";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Element: ${element.tagName}`, width / 2, height / 2);
            return await this.canvasToBlob(canvas, format, quality);
          }
        }
      }
    },

    /**
     * Convert element to SVG string with foreignObject
     */
    elementToSVG(element, width, height) {
      // Get inline styles from style tags
      const inlineStyles = Array.from(document.querySelectorAll("style"))
        .map((style) => style.textContent)
        .join("\n");

      // Get stylesheets (only same-origin to avoid CORS issues)
      const styles = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            // Only process same-origin stylesheets
            if (
              sheet.href &&
              !sheet.href.startsWith(window.location.origin) &&
              !sheet.href.startsWith("/") &&
              !sheet.href.startsWith("./")
            ) {
              return "";
            }
            return Array.from(sheet.cssRules || [])
              .map((rule) => {
                try {
                  return rule.cssText;
                } catch (e) {
                  return "";
                }
              })
              .filter(Boolean)
              .join("\n");
          } catch (e) {
            // CORS error or other issue - skip this stylesheet
            return "";
          }
        })
        .filter(Boolean)
        .join("\n");

      const html = element.outerHTML;
      const allStyles =
        styles || inlineStyles
          ? `<style>${styles}\n${inlineStyles}</style>`
          : "";

      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          ${allStyles}
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;box-sizing:border-box;">
              ${html}
            </div>
          </foreignObject>
        </svg>
      `;
    },

    /**
     * Convert SVG to canvas
     */
    svgToCanvas(svgData, canvas, ctx, width, height) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(url);
          reject(new Error("SVG load timeout"));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          try {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve();
          } catch (error) {
            URL.revokeObjectURL(url);
            reject(error);
          }
        };

        img.onerror = (error) => {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          reject(
            new Error(
              "Failed to load SVG image - browser security restrictions may apply"
            )
          );
        };

        img.src = url;
      });
    },

    /**
     * Capture using clone method - uses data URL encoding for better compatibility
     */
    async captureUsingClone(
      element,
      canvas,
      ctx,
      width,
      height,
      format,
      quality
    ) {
      return new Promise((resolve, reject) => {
        // Clone the element with all its children
        const clone = element.cloneNode(true);

        // Inline all computed styles first
        this.inlineStyles(clone);

        // Get all style rules that we can access
        const styleText = this.getAllAccessibleStyles();
        const html = clone.outerHTML;

        // Create SVG with data URL encoding
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <defs>
              <style type="text/css"><![CDATA[
                ${styleText}
              ]]></style>
            </defs>
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;box-sizing:border-box;">
                ${html}
              </div>
            </foreignObject>
          </svg>
        `;

        // Use data URL instead of blob URL for better compatibility
        const svgDataUrl =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgContent);

        const img = new Image();
        img.crossOrigin = "anonymous";

        const timeout = setTimeout(() => {
          reject(new Error("Image load timeout"));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          try {
            ctx.drawImage(img, 0, 0, width, height);
            this.canvasToBlob(canvas, format, quality)
              .then(resolve)
              .catch(reject);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to load SVG image"));
        };

        img.src = svgDataUrl;
      });
    },

    /**
     * Get all accessible CSS styles as text
     */
    getAllAccessibleStyles() {
      let styles = "";

      // Get inline style tags
      const styleTags = Array.from(document.querySelectorAll("style"));
      styleTags.forEach((tag) => {
        styles += tag.textContent + "\n";
      });

      // Get accessible stylesheets
      try {
        const sheets = Array.from(document.styleSheets);
        sheets.forEach((sheet) => {
          try {
            // Only process same-origin or inline stylesheets
            if (sheet.href) {
              const url = new URL(sheet.href, window.location.href);
              if (url.origin !== window.location.origin) {
                return; // Skip cross-origin
              }
            }

            const rules = sheet.cssRules || sheet.rules || [];
            for (let i = 0; i < rules.length; i++) {
              try {
                styles += rules[i].cssText + "\n";
              } catch (e) {
                // Skip rules we can't access
              }
            }
          } catch (e) {
            // Skip stylesheets we can't access (CORS)
          }
        });
      } catch (e) {
        // Fallback if stylesheet access fails
      }

      return styles;
    },

    /**
     * Inline computed styles into element and children
     */
    inlineStyles(element) {
      const allElements = [element, ...element.querySelectorAll("*")];
      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const style = el.style;

        // Copy important visual styles - more comprehensive list
        const props = [
          "color",
          "backgroundColor",
          "background",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "fontStyle",
          "lineHeight",
          "textAlign",
          "textDecoration",
          "padding",
          "paddingTop",
          "paddingRight",
          "paddingBottom",
          "paddingLeft",
          "margin",
          "marginTop",
          "marginRight",
          "marginBottom",
          "marginLeft",
          "border",
          "borderTop",
          "borderRight",
          "borderBottom",
          "borderLeft",
          "borderWidth",
          "borderStyle",
          "borderColor",
          "borderRadius",
          "boxShadow",
          "display",
          "flexDirection",
          "alignItems",
          "justifyContent",
          "flexWrap",
          "gap",
          "width",
          "height",
          "minWidth",
          "minHeight",
          "maxWidth",
          "maxHeight",
          "position",
          "top",
          "left",
          "right",
          "bottom",
          "transform",
          "opacity",
          "overflow",
          "overflowX",
          "overflowY",
          "zIndex",
          "verticalAlign",
          "whiteSpace",
          "wordWrap",
        ];

        props.forEach((prop) => {
          try {
            const value = computed.getPropertyValue(prop);
            if (
              value &&
              value !== "none" &&
              value !== "normal" &&
              value !== "auto" &&
              value !== "0px"
            ) {
              style.setProperty(prop, value, "important");
            }
          } catch (e) {
            // Skip properties that can't be read
          }
        });
      });
    },

    /**
     * Basic capture - renders text and basic visual elements
     */
    async captureBasic(element, canvas, ctx, width, height, format, quality) {
      // Get background color
      const bgColor = window.getComputedStyle(element).backgroundColor;
      if (
        bgColor &&
        bgColor !== "rgba(0, 0, 0, 0)" &&
        bgColor !== "transparent"
      ) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw border if exists
      const borderWidth =
        parseInt(window.getComputedStyle(element).borderWidth) || 0;
      if (borderWidth > 0) {
        ctx.strokeStyle =
          window.getComputedStyle(element).borderColor || "#000";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
          borderWidth / 2,
          borderWidth / 2,
          width - borderWidth,
          height - borderWidth
        );
      }

      // Try to render text content
      const text = element.textContent || element.innerText || "";
      if (text.trim()) {
        const color = window.getComputedStyle(element).color || "#000";
        const fontSize =
          parseInt(window.getComputedStyle(element).fontSize) || 16;
        const fontFamily =
          window.getComputedStyle(element).fontFamily || "sans-serif";

        ctx.fillStyle = color;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Simple text wrapping
        const words = text.trim().split(/\s+/);
        const lineHeight = fontSize * 1.2;
        let y = 10;
        let line = "";

        for (let word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width - 20 && line) {
            ctx.fillText(line, 10, y);
            line = word + " ";
            y += lineHeight;
            if (y > height - 10) break;
          } else {
            line = testLine;
          }
        }
        if (line && y <= height - 10) {
          ctx.fillText(line, 10, y);
        }
      }

      return await this.canvasToBlob(canvas, format, quality);
    },

    /**
     * Convert canvas to blob
     */
    canvasToBlob(canvas, format, quality) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          `image/${format}`,
          format === "jpeg" ? quality : undefined
        );
      });
    },

    /**
     * Download blob as file
     */
    download(blob, filename, format) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ZenoToast.success("Screenshot downloaded!");
    },

    /**
     * Copy screenshot to clipboard
     */
    async copyToClipboard(element, options = {}) {
      try {
        const blob = await this.capture(element, options);

        // Check if ClipboardItem is available
        if (window.ClipboardItem && navigator.clipboard.write) {
          const item = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([item]);
          ZenoToast.success("Screenshot copied to clipboard!");
          return true;
        } else {
          // Fallback: convert to data URL and copy
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  const item = new ClipboardItem({ [blob.type]: blob });
                  navigator.clipboard.write([item]).then(() => {
                    ZenoToast.success("Screenshot copied to clipboard!");
                  });
                }
              });
            };
          };
          reader.readAsDataURL(blob);
          return true;
        }
      } catch (error) {
        console.error("Clipboard error:", error);
        ZenoToast.error("Failed to copy to clipboard");
        return false;
      }
    },

    /**
     * Programmatic API: Capture element
     */
    async captureElement(selector, options = {}) {
      const element = typeof selector === "string" ? $(selector) : selector;
      if (!element) {
        throw new Error("Element not found");
      }
      return await this.capture(element, options);
    },
  };

  // ================================================
  // INITIALIZE ALL COMPONENTS
  // ================================================

  const ZenoUI = {
    init() {
      ZenoSidebar.init();
      ZenoMenuDropdown.init();
      ZenoTabs.init();
      ZenoAccordion.init();
      ZenoSegmented.init();
      ZenoStepper.init();
      ZenoSearchbar.init();
      ZenoChips.init();
      ZenoRange.init();
      ZenoFab.init();
      ZenoButtons.init();
      ZenoTabbar.init();
      ZenoSelect.init();
      ZenoMultiselect.init();
      ZenoAutocomplete.init();
      ZenoDualRange.init();
      ZenoTooltip.init();
      ZenoPopover.init();
      ZenoDatepicker.init();
      ZenoTable.init();
      ZenoPagination.init();
      ZenoDropzone.init();
      ZenoTimepicker.init();
      ZenoSteps.init();
      ZenoRating.init();
      ZenoPassword.init();
      ZenoDrawer.init();
      ZenoStats.init();
      ZenoCopyToClipboard.init();
      ZenoBackToTop.init();
      ZenoShare.init();
      ZenoScreenshot.init();
    },
  };

  // Auto-initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ZenoUI.init());
  } else {
    ZenoUI.init();
  }

  // Expose to global scope
  window.ZenoUI = ZenoUI;
  window.ZenoModal = ZenoModal;
  window.ZenoActionSheet = ZenoActionSheet;
  window.ZenoFullPageSheet = ZenoFullPageSheet;
  window.ZenoSidebar = ZenoSidebar;
  window.ZenoMenuDropdown = ZenoMenuDropdown;
  window.ZenoToast = ZenoToast;
  window.ZenoTabs = ZenoTabs;
  window.ZenoAccordion = ZenoAccordion;
  window.ZenoSegmented = ZenoSegmented;
  window.ZenoStepper = ZenoStepper;
  window.ZenoSearchbar = ZenoSearchbar;
  window.ZenoChips = ZenoChips;
  window.ZenoRange = ZenoRange;
  window.ZenoFab = ZenoFab;
  window.ZenoTabbar = ZenoTabbar;
  window.ZenoSelect = ZenoSelect;
  window.ZenoMultiselect = ZenoMultiselect;
  window.ZenoAutocomplete = ZenoAutocomplete;
  window.ZenoDualRange = ZenoDualRange;
  window.ZenoTooltip = ZenoTooltip;
  window.ZenoPopover = ZenoPopover;
  window.ZenoPosition = ZenoPosition;
  window.ZenoDatepicker = ZenoDatepicker;
  window.ZenoTable = ZenoTable;
  window.ZenoPagination = ZenoPagination;
  window.ZenoDropzone = ZenoDropzone;
  window.ZenoTimepicker = ZenoTimepicker;
  window.ZenoSteps = ZenoSteps;
  window.ZenoRating = ZenoRating;
  window.ZenoPassword = ZenoPassword;
  window.ZenoDrawer = ZenoDrawer;
  window.ZenoStats = ZenoStats;
  window.ZenoCopyToClipboard = ZenoCopyToClipboard;
  window.ZenoBackToTop = ZenoBackToTop;
  window.ZenoShare = ZenoShare;
  window.ZenoScreenshot = ZenoScreenshot;
})();
