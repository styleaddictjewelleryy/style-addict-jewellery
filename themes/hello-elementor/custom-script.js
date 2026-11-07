/**
 * Style Addict Jewellery - Custom Theme Interactions
 * Handles mobile navigation outside click, drawer closing, and keyboard accessibility
 */
(function ($) {
    'use strict';

    $(document).ready(function () {
        var touchMoved = false;

        // Track touch moves so scrolling doesn't accidentally trigger a close
        $(document).on('touchstart', function () {
            touchMoved = false;
        });

        $(document).on('touchmove', function () {
            touchMoved = true;
        });

        // Handler to close mobile nav menu & side drawers when clicking/tapping outside
        function handleOutsideClick(e) {
            // Ignore if user was scrolling on mobile touch
            if (e.type === 'touchend' && touchMoved) {
                return;
            }

            // Close Elementor mobile nav menu if active and clicked outside
            var $activeToggle = $('.elementor-menu-toggle.elementor-active');
            if ($activeToggle.length) {
                var $target = $(e.target);

                // If click/tap is NOT inside the menu toggle and NOT inside the dropdown menu container
                if (!$target.closest('.elementor-menu-toggle').length &&
                    !$target.closest('.elementor-nav-menu--dropdown').length &&
                    !$target.closest('.elementor-nav-menu__container').length) {
                    
                    // Trigger click on the toggle button to close via Elementor's native toggleMenu()
                    $activeToggle.trigger('click');
                }
            }

            // Also check for WooCommerce / Elementor side-cart drawer
            var $openCart = $('.elementor-menu-cart--shown');
            if ($openCart.length) {
                var $cartTarget = $(e.target);
                if (!$cartTarget.closest('.elementor-menu-cart__main').length &&
                    !$cartTarget.closest('.elementor-menu-cart__toggle').length &&
                    !$cartTarget.closest('.elementor-menu-cart__toggle_button').length) {
                    $openCart.find('.elementor-menu-cart__close-button').first().trigger('click');
                }
            }
        }

        // Bind both touchend and click for universal mobile & desktop support
        $(document).on('touchend click', handleOutsideClick);

        // Close on ESC key for accessibility
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                var $activeToggle = $('.elementor-menu-toggle.elementor-active');
                if ($activeToggle.length) {
                    $activeToggle.trigger('click');
                }

                var $openCart = $('.elementor-menu-cart--shown');
                if ($openCart.length) {
                    $openCart.find('.elementor-menu-cart__close-button').first().trigger('click');
                }
            }
        });
    });
})(jQuery);
