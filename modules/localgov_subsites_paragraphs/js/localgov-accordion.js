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
      function expandPane(button, pane) {
        button.setAttribute('aria-expanded', 'true');
        pane.classList.add(openClass);
      }

      function collapsePane(button, pane) {
        button.setAttribute('aria-expanded', 'false');
        pane.classList.remove(openClass);
      }

      const accordionPanes = accordion.querySelectorAll('.accordion-pane');
      const numberOfPanes = accordionPanes.length;
      const initClass = 'accordion--initialised';
      const openClass = 'accordion-pane__content--open';
      const breakpoint = accordion.dataset.accordionTabsSwitch || null;
      const mq = window.matchMedia(`(max-width: '${breakpoint}')`);

      const create = function create() {
        // Only initialise accordion if it hasn't already been done.
        if (accordion.classList.contains(initClass)) {
          return;
        }

        for (let i = 0; i < numberOfPanes; i++) {
          const pane = accordionPanes[i];
          const content = pane.querySelectorAll('.accordion-pane__content');
          const title = pane.querySelectorAll('.accordion-pane__title');
          const titleText = title[0].textContent;
          const button = document.createElement('button');
          const text = document.createTextNode(titleText);
          const id = `accordion-content-${index}-${i}`;

          // Add id attribute to all pane content elements.
          content[0].setAttribute('id', id);

          // Add show/hide button to each accordion title.
          button.appendChild(text);
          // Add an initially hidden icon which can be used if required to make accordions fit GDS standard
          button.innerHTML += "<span class='accordion-icon' aria-hidden='true'></span>";
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-controls', id);

          // Add click event listener to the show/hide button.
          button.addEventListener('click', e => {
            const targetPaneId = e.target.getAttribute('aria-controls');
            const targetPane = accordion.querySelectorAll(`#${targetPaneId}`);
            const openPane = accordion.querySelectorAll(`.${openClass}`);

            // Check the current state of the button and the content it controls.
            if (e.target.getAttribute('aria-expanded') === 'false') {
              // Close currently open pane.
              if (openPane.length) {
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
          });

          // Add show/hide button to each accordion pane title element.
          title[0].children[0].innerHTML = '';
          title[0].children[0].appendChild(button);
        }

        // Add init class.
        accordion.classList.add(initClass);
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
