/**
 * @file
 * Localgov Accordion behaviour.
 */

(Drupal => {
  Drupal.behaviors.localgovAccordion = {
    /**
     * Attach accordion behaviour.
     *
     * @param {object} context
     *   DOM object.
     */
    attach(context) {
      const accordions = context.querySelectorAll('.accordion');

      for (let i = 0; i < accordions.length; i++) {
        this.init(accordions[i], i);
      }
    },

    /**
     * Initialise accordion.
     *
     * @param {HTMLElement} accordion
     *   Accordion element.
     * @param {number} index
     *   Accordion element index.
     */
    init: function init(accordion, index) {
      /**
       * Expands one accordion pane, setting aria-expanded on button.
       *
       * @param {HTMLElement} button
       *   The button associated with the pane to expand.
       * @param {HTMLElement} pane
       *   The pane to expand.
       */
      function expandPane(button, pane) {
        button.setAttribute('aria-expanded', 'true');
        pane.classList.add(openClass);
      }

      /**
       * Collapses one accordion pane, setting aria-expanded on button.
       *
       * @param {HTMLElement} button
       *   The button associated with the pane to collapse.
       * @param {HTMLElement} pane
       *   The pane to collapse.
       */
      function collapsePane(button, pane) {
        button.setAttribute('aria-expanded', 'false');
        pane.classList.remove(openClass);
      }

      /**
       * Toggles all accordion panes open or closed.
       *
       * Used both as an event listener callback, and called directly.
       */
      function toggleAll() {
        const labelEl = showHideButton.querySelector('.accordion-text');
        const nextState = showHideButton.getAttribute('aria-expanded') !== 'true';

        showHideButtonLabel.textContent = showHideButton.dataset[nextState ? 'hideAll' : 'showAll'];
        showHideButton.setAttribute('aria-expanded', nextState);

        for (let i = 0; i < numberOfPanes; i++) {
          const currentButton = accordionPanes[i].querySelector('[aria-controls]');
          const currentPane = accordionPanes[i].querySelector('.accordion-pane__content');

          if (nextState) {
            expandPane(currentButton, currentPane);

          } else {
            collapsePane(currentButton, currentPane);
          }
        }
      }

      /**
       * Gets the state of the accordion: all expanded, all collapsed, or mixed.
       *
       * @return {number}
       *   Returns a numeric value according to state:
       *
       *     - all expanded: 1
       *     - all collapsed: 0
       *     - mixed: -1
       */
      function getAccordionState() {
        const expandedPanes = accordion.querySelectorAll(`.${openClass}`).length;
        return expandedPanes
           ? (expandedPanes === numberOfPanes ? 1 : -1)
           : 0;
      }

      const accordionPanes = accordion.querySelectorAll('.accordion-pane');
      const numberOfPanes = accordionPanes.length;
      const initClass = 'accordion--initialised';
      const openClass = 'accordion-pane__content--open';
      const breakpoint = accordion.dataset.accordionTabsSwitch || null;
      const mq = window.matchMedia(`(max-width: '${breakpoint}')`);
      const displayShowHide = accordion.hasAttribute('data-accordion-display-show-hide');
      const allowMultiple = displayShowHide || accordion.hasAttribute('data-accordion-allow-multiple');
      let showHideButton;
      let showHideButtonLabel;

      const create = function create() {
        // Only initialise accordion if it hasn't already been done.
        if (accordion.classList.contains(initClass)) {
          return;
        }

        for (let i = 0; i < numberOfPanes; i++) {
          const pane = accordionPanes[i];
          const content = pane.querySelectorAll('.accordion-pane__content');
          const title = pane.querySelectorAll('.accordion-pane__title');
          const button = title.querySelectorAll('button');
          const id = `accordion-content-${index}-${i}`;

          // Add id attribute to all pane content elements.
          content[0].setAttribute('id', id);

          // Add aria-controls id to button
          button.setAttribute('aria-controls', id);

          // Add click event listener to the show/hide button.
          button.addEventListener('click', e => {
            const targetPaneId = e.target.getAttribute('aria-controls');
            const targetPane = accordion.querySelectorAll(`#${targetPaneId}`);
            const openPane = accordion.querySelectorAll(`.${openClass}`);

            // Check the current state of the button and the content it controls.
            if (e.target.getAttribute('aria-expanded') === 'false') {
              // Close currently open pane.
              if (openPane.length && !allowMultiple) {
                const openPaneId = openPane[0].getAttribute('id');
                const openPaneButton = accordion.querySelectorAll(
                  `[aria-controls="${openPaneId}"]`,
                );

                collapsePane(openPaneButton[0], openPane[0]);
              }

              // Show new pane.
              expandPane(e.target, targetPane[0]);
            } else {
              // If target pane is currently open, close it.
              collapsePane(e.target, targetPane[0]);
            }

            if (showHideButton) {
              const accordionState = getAccordionState();
              const toggleState = showHideButton.getAttribute('aria-expanded') === 'true';

              if (
                (accordionState === 1 && !toggleState) ||
                (!accordionState && toggleState)
              ) {
                toggleAll();
              }
            }
          });

          if (displayShowHide) {
            showHideButton = accordion.querySelector('.accordion-toggle-all');
            showHideButton.hidden = false;
            showHideButton.addEventListener('click', toggleAll);
            showHideButtonLabel = showHideButton.querySelector('.accordion-text');
          }

          // Add init class.
          accordion.classList.add(initClass);

          // Add show/hide button to each accordion pane title element.
          title[0].children[0].innerHTML = '';
          title[0].children[0].appendChild(button);
        }
      };

      const destroy = () => {
        for (let i = 0; i < numberOfPanes; i++) {
          // Remove buttons from accordion pane titles.
          const button = accordion
            .querySelectorAll('.accordion-pane__title')
            [i].querySelectorAll('button');
          if (button.length > 0) {
            button[0].outerHTML = button[0].innerHTML;
          }

          // Remove id attributes from pane content elements.
          accordionPanes[i]
            .querySelectorAll('.accordion-pane__content')[0]
            .removeAttribute('id');

          // Remove open class from accordion pane's content elements.
          if (
            accordionPanes[i]
              .querySelectorAll('.accordion-pane__content')[0]
              .classList.contains(openClass)
          ) {
            accordionPanes[i]
              .querySelectorAll('.accordion-pane__content')[0]
              .classList.remove(openClass);
          }
        }

        if (displayShowHide) {
          showHideButton.hidden = true;
          showHideButton.removeEventListener('click', toggleAll);
        }

        // Remove accordion init class.
        accordion.classList.remove(initClass);
      };

      const breakpointCheck = function breakpointCheck() {
        if (mq.matches || breakpoint === null) {
          create();
        } else {
          destroy();
        }
      };

      // Trigger create/destroy functions at different screen widths
      // based on the value of data-accordion-tabs-switch attribute.
      if (window.matchMedia) {
        mq.addListener(() => {
          breakpointCheck();
        });
        breakpointCheck();
      }
    },
  };
})(Drupal);
