/**
 * Style Addict Jewellery - Custom Theme Interactions
 * 1. Mobile navigation & drawer outside-click closing
 * 2. Swarovski-style 50% 2-column product gallery preview with high-res images
 * 3. Swarovski-style expandable product detail accordions
 */
(function ($) {
    'use strict';

    $(document).ready(function () {
        /* ======================================================================
           1. MOBILE NAV & DRAWER OUTSIDE-CLICK CLOSING
           ====================================================================== */
        var touchMoved = false;

        $(document).on('touchstart', function () {
            touchMoved = false;
        });

        $(document).on('touchmove', function () {
            touchMoved = true;
        });

        function handleOutsideClick(e) {
            if (e.type === 'touchend' && touchMoved) {
                return;
            }

            // Close Elementor mobile nav menu if active and clicked outside
            var $activeToggle = $('.elementor-menu-toggle.elementor-active');
            if ($activeToggle.length) {
                var $target = $(e.target);
                if (!$target.closest('.elementor-menu-toggle').length &&
                    !$target.closest('.elementor-nav-menu--dropdown').length &&
                    !$target.closest('.elementor-nav-menu__container').length) {
                    $activeToggle.trigger('click');
                }
            }

            // Close WooCommerce / Elementor side-cart drawer if clicked outside
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

        $(document).on('touchend click', handleOutsideClick);

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


        /* ======================================================================
           2. SWAROVSKI-STYLE PRODUCT GALLERY (50% 2-COL THUMBNAILS & PREVIEW)
           ====================================================================== */
        function initSwarovskiProductGallery() {
            var $gallery = $('.woocommerce-product-gallery');
            if (!$gallery.length) return;

            var $mainImages = $gallery.find('.woocommerce-product-gallery__image img');
            var $thumbs = $gallery.find('.flex-control-thumbs li');

            // Upgrade thumbnail resolution from 100x100 to crisp high-res (600px/large)
            if ($thumbs.length && $mainImages.length) {
                $thumbs.each(function (index) {
                    var $mainImg = $mainImages.eq(index);
                    var highRes = $mainImg.attr('src') || $mainImg.attr('data-src') || $mainImg.attr('data-large_image');
                    if (highRes) {
                        var $thumbImg = $(this).find('img');
                        if ($thumbImg.length && $thumbImg.attr('src') !== highRes) {
                            $thumbImg.attr('src', highRes);
                        }
                    }
                });
            }

            // Sync active thumbnail state
            function syncActiveThumb() {
                $gallery.find('.flex-control-thumbs li').each(function () {
                    var $li = $(this);
                    if ($li.find('img').hasClass('flex-active')) {
                        $li.addClass('flex-active-thumb');
                    } else {
                        $li.removeClass('flex-active-thumb');
                    }
                });
            }

            // On thumbnail click: slide main preview and mark active
            $gallery.off('click.swarovskiThumb').on('click.swarovskiThumb', '.flex-control-thumbs li', function () {
                $gallery.find('.flex-control-thumbs li').removeClass('flex-active-thumb');
                $(this).addClass('flex-active-thumb');
                setTimeout(syncActiveThumb, 250);
            });

            syncActiveThumb();
        }

        // Initialize gallery immediately and on WooCommerce gallery init events
        initSwarovskiProductGallery();
        $(document).on('woocommerce_gallery_init', initSwarovskiProductGallery);
        setTimeout(initSwarovskiProductGallery, 400);
        setTimeout(initSwarovskiProductGallery, 1200);


        /* ======================================================================
           3. SWAROVSKI-STYLE RIGHT-COLUMN ACCORDIONS (EXPANDABLE DETAILS)
           ====================================================================== */
        function initSwarovskiProductAccordions() {
            if (!$('body').hasClass('single-product')) return;
            if ($('#sa-product-accordions').length) return;

            var $rightColumn = $('.elementor-60 .elementor-element.elementor-element-7ca7d0d5 .elementor-widget-wrap');
            if (!$rightColumn.length) {
                $rightColumn = $('.entry-summary, div.product .summary');
            }
            if (!$rightColumn.length) return;

            // 3.1 Insert "In Stock" Luxury Badge if not present
            if (!$('.sa-stock-badge').length) {
                var stockBadgeHTML = '<div class="sa-stock-badge"><span class="sa-stock-dot"></span> In Stock &mdash; Handcrafted &amp; Ready to Ship</div>';
                var $priceWidget = $('.elementor-element-298c0c30');
                if ($priceWidget.length) {
                    $priceWidget.after(stockBadgeHTML);
                } else if ($('.price').length) {
                    $('.price').first().after(stockBadgeHTML);
                }
            }

            // 3.2 Extract description content from WooCommerce tabs
            var $descPanel = $('#tab-description');
            var descHTML = '';
            if ($descPanel.length) {
                var $clone = $descPanel.clone();
                $clone.find('h2:first-child').remove();
                descHTML = $clone.html().trim();
            }

            if (!descHTML) {
                descHTML = '<p>Exquisite jewellery handcrafted with meticulous attention to detail, combining timeless royal heritage with modern luxury elegance. Crafted with premium high-grade stones and polished to a flawless lustrous finish.</p>';
            }

            // 3.3 Care & Maintenance Guide
            var careHTML = '<ul class="sa-accordion-list">' +
                '<li>Avoid direct contact with perfumes, deodorants, hairsprays, and lotions.</li>' +
                '<li>Remove your jewellery before showering, swimming, or washing hands.</li>' +
                '<li>Gently wipe each piece with a soft, lint-free microfiber cloth after every wear to preserve shine.</li>' +
                '<li>Store separately in our signature velvet pouch or an airtight zip-lock bag to prevent moisture and oxidation.</li>' +
                '</ul>';

            // 3.4 Shipping & Returns
            var shippingHTML = '<ul class="sa-accordion-list">' +
                '<li><strong>Fast Insured Delivery:</strong> Orders dispatched within 24-48 hours. Delivery within 3-5 business days across India.</li>' +
                '<li><strong>Luxury Signature Packaging:</strong> Arrives safely nestled in our premium Style Addict gift box.</li>' +
                '<li><strong>Hassle-Free Exchange:</strong> 7-day easy exchange and return policy for unworn pieces with tags intact.</li>' +
                '<li><strong>Complete Tracking:</strong> Real-time SMS and WhatsApp shipment updates provided upon dispatch.</li>' +
                '</ul>';

            // 3.5 Construct Swarovski-style Accordions HTML
            var accordionHTML = 
                '<div id="sa-product-accordions" class="sa-product-accordions">' +
                    '<div class="sa-accordion-item sa-accordion-active">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="true">' +
                            '<span>Description &amp; Details</span>' +
                            '<span class="sa-accordion-icon">&minus;</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: block;">' +
                            '<div class="sa-accordion-content">' + descHTML + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="sa-accordion-item">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="false">' +
                            '<span>Care &amp; Maintenance</span>' +
                            '<span class="sa-accordion-icon">+</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: none;">' +
                            '<div class="sa-accordion-content">' + careHTML + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="sa-accordion-item">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="false">' +
                            '<span>Shipping &amp; Returns</span>' +
                            '<span class="sa-accordion-icon">+</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: none;">' +
                            '<div class="sa-accordion-content">' + shippingHTML + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            $rightColumn.append(accordionHTML);

            // Accordion expand/collapse click handler
            $('#sa-product-accordions').on('click', '.sa-accordion-header', function (e) {
                e.preventDefault();
                var $btn = $(this);
                var $item = $btn.closest('.sa-accordion-item');
                var $body = $item.find('.sa-accordion-body');
                var isExpanded = $btn.attr('aria-expanded') === 'true';

                if (isExpanded) {
                    $body.slideUp(250);
                    $btn.attr('aria-expanded', 'false');
                    $item.removeClass('sa-accordion-active');
                    $btn.find('.sa-accordion-icon').text('+');
                } else {
                    $body.slideDown(250);
                    $btn.attr('aria-expanded', 'true');
                    $item.addClass('sa-accordion-active');
                    $btn.find('.sa-accordion-icon').html('&minus;');
                }
            });
        }

        initSwarovskiProductAccordions();
        setTimeout(initSwarovskiProductAccordions, 500);
    });
})(jQuery);
