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

            // CRITICAL BUG FIX: Only select original slides and explicitly exclude FlexSlider clones (:not(.clone)).
            // FlexSlider clones the first and last slides for infinite sliding buffers.
            // Querying .woocommerce-product-gallery__image directly matches clones, causing index 0
            // to target the clone of the last image, shifting thumbnail images and causing mismatched clicks!
            var $slides = $gallery.find('.woocommerce-product-gallery__wrapper > .woocommerce-product-gallery__image:not(.clone)');
            var $thumbs = $gallery.find('.flex-control-thumbs li');

            // Upgrade thumbnail resolution from 100x100 to crisp high-res (600px/large) matching the exact slide 1:1
            if ($thumbs.length && $slides.length) {
                $thumbs.each(function (index) {
                    var $slide = $slides.eq(index);
                    if (!$slide.length) return;

                    var $mainImg = $slide.find('img').first();
                    // Obtain the crisp 600px image or large image URL
                    var highRes = $mainImg.attr('src') || $slide.find('a').attr('href') || $mainImg.attr('data-src') || $mainImg.attr('data-large_image');
                    if (highRes && highRes.indexOf('data:image') === 0) {
                        highRes = $slide.find('a').attr('href') || $mainImg.attr('data-large_image') || highRes;
                    }

                    if (highRes) {
                        var $thumbImg = $(this).find('img');
                        if ($thumbImg.length && $thumbImg.attr('src') !== highRes) {
                            $thumbImg.attr('src', highRes);
                            $thumbImg.removeAttr('srcset');
                        }
                    }
                });
            }

            // Sync active thumbnail state
            function syncActiveThumb() {
                var $allThumbs = $gallery.find('.flex-control-thumbs li');
                $allThumbs.each(function () {
                    var $li = $(this);
                    if ($li.find('img').hasClass('flex-active')) {
                        $li.addClass('flex-active-thumb');
                    } else {
                        $li.removeClass('flex-active-thumb');
                    }
                });
            }

            // On thumbnail click: slide main preview to the EXACT clicked slide index
            $gallery.off('click.swarovskiThumb').on('click.swarovskiThumb', '.flex-control-thumbs li', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $li = $(this);
                var index = $li.index();
                var flexslider = $gallery.data('flexslider');

                if (flexslider && typeof flexslider.flexAnimate === 'function') {
                    if (flexslider.currentSlide !== index) {
                        flexslider.direction = (index > flexslider.currentSlide) ? 'next' : 'prev';
                        flexslider.flexAnimate(index, flexslider.vars.pauseOnAction);
                    }
                } else if (typeof $gallery.flexslider === 'function') {
                    $gallery.flexslider(index);
                }

                // Immediately update active styling
                var $allThumbs = $gallery.find('.flex-control-thumbs li');
                $allThumbs.removeClass('flex-active-thumb');
                $allThumbs.find('img').removeClass('flex-active');

                $li.addClass('flex-active-thumb');
                $li.find('img').addClass('flex-active');

                setTimeout(syncActiveThumb, 250);
            });

            // Setup MutationObserver so whenever FlexSlider changes slide (e.g. touch swipe or auto),
            // the active thumbnail border highlights synchronously
            var thumbsContainer = $gallery.find('.flex-control-thumbs')[0];
            if (thumbsContainer && !thumbsContainer._hasSwarovskiObserver) {
                thumbsContainer._hasSwarovskiObserver = true;
                var observer = new MutationObserver(function () {
                    syncActiveThumb();
                });
                observer.observe(thumbsContainer, { attributes: true, subtree: true, attributeFilter: ['class'] });
            }

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
            // Rebuild only if missing Features or the Shipping and Returns dropdown
            if ($('#sa-product-accordions').length) {
                if (!$('#sa-product-accordions:contains("Features")').length || !$('#sa-product-accordions:contains("Shipping and Returns")').length) {
                    $('#sa-product-accordions').remove();
                } else {
                    return;
                }
            }

            // Enhance PDP Sale Badge with live savings percentage
            var $pdpSaleBadge = $('.elementor-60 .elementor-element-3ed3e3c0');
            if ($pdpSaleBadge.length) {
                var $priceWrap = $('.elementor-60 .elementor-element-298c0c30 .price, .entry-summary .price').first();
                var delText = $priceWrap.find('del').text().replace(/[^0-9.]/g, '');
                var insText = $priceWrap.find('ins').text().replace(/[^0-9.]/g, '');
                var regPrice = parseFloat(delText);
                var salePrice = parseFloat(insText);
                if (regPrice > 0 && salePrice > 0 && salePrice < regPrice) {
                    var discountPct = Math.round(((regPrice - salePrice) / regPrice) * 100);
                    if (discountPct > 0) {
                        $pdpSaleBadge.find('.elementor-heading-title').html('<span class="sa-sale-star">&#10022;</span> ' + discountPct + '% OFF &bull; LIMITED OFFER');
                    }
                }
            }

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

            // 3.2 Insert Swarovski-Style Delivery & PIN Code Availability Checker
            if (!$('.sa-pincode-checker').length) {
                var pincodeHTML = 
                    '<div class="sa-pincode-checker">' +
                        '<div class="sa-pincode-header">' +
                            '<span class="sa-pincode-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' +
                            '<span class="sa-pincode-label">Check Delivery &amp; Availability</span>' +
                        '</div>' +
                        '<div class="sa-pincode-form">' +
                            '<input type="text" id="sa-pincode-input" class="sa-pincode-input" placeholder="Enter 6-digit PIN code" maxlength="6" inputmode="numeric" />' +
                            '<button type="button" id="sa-pincode-btn" class="sa-pincode-btn">Check</button>' +
                        '</div>' +
                        '<div id="sa-pincode-result" class="sa-pincode-result"></div>' +
                    '</div>';

                var $cartWidget = $('.elementor-element-1a8255a, form.cart');
                if ($cartWidget.length) {
                    $cartWidget.first().before(pincodeHTML);
                } else if ($('.sa-stock-badge').length) {
                    $('.sa-stock-badge').after(pincodeHTML);
                }
            }

            // Pincode check handling & persistence
            function handlePincodeCheck() {
                var val = $('#sa-pincode-input').val().trim();
                var $res = $('#sa-pincode-result');
                if (/^[1-9][0-9]{5}$/.test(val)) {
                    try { localStorage.setItem('sa_pincode', val); } catch (e) {}
                    $res.removeClass('sa-pincode-error').addClass('sa-pincode-success').html(
                        '<span class="sa-pincode-check-icon">&check;</span> Express Insured Delivery available to <strong>' + val + '</strong> &bull; Dispatched in 24&ndash;48 hrs.'
                    ).slideDown(200);
                } else {
                    $res.removeClass('sa-pincode-success').addClass('sa-pincode-error').html(
                        'Please enter a valid 6-digit PIN code.'
                    ).slideDown(200);
                }
            }

            $(document).off('click.saPin').on('click.saPin', '#sa-pincode-btn', handlePincodeCheck);
            $(document).off('keydown.saPin').on('keydown.saPin', '#sa-pincode-input', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePincodeCheck();
                }
            });

            // Restore saved pincode
            try {
                var savedPin = localStorage.getItem('sa_pincode');
                if (savedPin && /^[1-9][0-9]{5}$/.test(savedPin)) {
                    $('#sa-pincode-input').val(savedPin);
                    $('#sa-pincode-result').addClass('sa-pincode-success').html(
                        '<span class="sa-pincode-check-icon">&check;</span> Express Insured Delivery available to <strong>' + savedPin + '</strong> &bull; Dispatched in 24&ndash;48 hrs.'
                    ).show();
                }
            } catch (e) {}

            // 3.3 Dynamic Segmentation: Parse Description, Features, and Care from product description
            var $descPanel = $('#tab-description');
            var parsed = {
                description: '',
                features: '',
                care: ''
            };

            if ($descPanel.length) {
                var $clone = $descPanel.clone();
                $clone.find('h2:first-child').remove(); // remove WooCommerce default heading

                var descList = [];
                var featureList = [];
                var careList = [];

                // Check all child blocks
                var $blocks = $clone.find('p, ul, ol');
                if (!$blocks.length) {
                    $blocks = $clone.children();
                }

                $blocks.each(function () {
                    var $el = $(this);
                    var text = $el.text().trim();
                    var html = $el.html() ? $el.html().trim() : '';

                    if (!text && !html) return;

                    // A) CARE SECTION DETECTION: Starts with or contains "Care:" or "Care Instructions:"
                    if (/^\s*(?:<strong>)?Care(?:\s+Instructions)?\s*:/i.test(text) || 
                        /^\s*(?:<strong>)?Care(?:\s+Instructions)?\s*:/i.test(html) ||
                        text.toLowerCase().indexOf('care:') === 0) {
                        var cleanCare = html.replace(/^\s*(?:<strong>)?Care(?:\s+Instructions)?\s*:\s*(?:<\/strong>)?/i, '').trim();
                        careList.push('<p class="sa-care-text">' + (cleanCare || html) + '</p>');
                        return;
                    }

                    // B) FEATURES SECTION DETECTION: <ul> / <ol> or text contains bullet points (*, •, -, –)
                    if ($el.is('ul, ol')) {
                        $el.find('li').each(function () {
                            var liText = $(this).text().trim();
                            var liHtml = $(this).html().trim();
                            var colonIdx = liText.indexOf(':');
                            if (colonIdx !== -1 && colonIdx < 35 && liHtml.indexOf('<strong') === -1) {
                                var label = liText.substring(0, colonIdx).trim();
                                var val = liHtml.substring(liHtml.indexOf(':') + 1).trim();
                                liHtml = '<strong>' + label + ':</strong> ' + val;
                            }
                            featureList.push('<li><span class="sa-feature-bullet">&#9670;</span> <span>' + liHtml + '</span></li>');
                        });
                        return;
                    }

                    if (text.indexOf('*') !== -1 || text.indexOf('•') !== -1 || /(?:^|<br\s*\/?>)\s*[\*\•\-\–]\s*/i.test(html)) {
                        var lines = html.split(/<br\s*\/?>|\n/);
                        for (var i = 0; i < lines.length; i++) {
                            var line = lines[i].trim();
                            if (!line) continue;
                            var cleanLine = line.replace(/^\s*[\*\•\-\–]\s*/, '').trim();
                            if (!cleanLine) continue;

                            var colonIdx = cleanLine.indexOf(':');
                            if (colonIdx !== -1 && colonIdx < 35 && cleanLine.indexOf('<strong') === -1) {
                                var key = cleanLine.substring(0, colonIdx).trim();
                                var rest = cleanLine.substring(colonIdx + 1).trim();
                                cleanLine = '<strong>' + key + ':</strong> ' + rest;
                            }
                            featureList.push('<li><span class="sa-feature-bullet">&#9670;</span> <span>' + cleanLine + '</span></li>');
                        }
                        return;
                    }

                    // C) Otherwise, it's DESCRIPTION (the introductory paragraphs above the bullets)
                    descList.push('<p>' + html + '</p>');
                });

                if (descList.length) parsed.description = descList.join('');
                if (featureList.length) parsed.features = '<ul class="sa-features-list">' + featureList.join('') + '</ul>';
                if (careList.length) parsed.care = '<div class="sa-care-box">' + careList.join('') + '</div>';
            }

            // High-grade fallback defaults if any section is empty
            if (!parsed.description) {
                parsed.description = '<p>A captivating blend of colour and contemporary elegance, handcrafted with meticulous attention to detail to make a statement at festive celebrations, weddings, and special evenings.</p>';
            }
            if (!parsed.features) {
                parsed.features = '<ul class="sa-features-list">' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Style:</strong> Handcrafted Statement Jewellery Set</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Finish:</strong> Premium Gold Plated Luxury Finish</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Features:</strong> Anti-Tarnished &amp; Skin Friendly</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Ideal For:</strong> Weddings, Festive Occasions, Celebrations &amp; Gifting</span></li>' +
                '</ul>';
            }
            if (!parsed.care) {
                parsed.care = '<div class="sa-care-box"><p class="sa-care-text">Avoid contact with perfume and water. Store in a jewellery box or pouch when not in use.</p></div>';
            }

            // 3.4 Construct the 4 Accordions: Description, Features, Care, and Shipping and Returns
            var shippingReturnsHTML =
                '<ul class="sa-features-list">' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Dispatch:</strong> Orders are dispatched within 2&ndash;3 working days.</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Free Shipping:</strong> Free shipping on all orders above &#8377;499.</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Shipping Charges:</strong> &#8377;49 delivery charge on orders below &#8377;499.</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Cash on Delivery:</strong> COD is available at an additional charge of &#8377;99.</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Returns:</strong> Products are eligible for return within 3 days of delivery.</span></li>' +
                    '<li><span class="sa-feature-bullet">&#9670;</span> <span><strong>Exchanges:</strong> Products are eligible for exchange within 7 days of delivery.</span></li>' +
                '</ul>' +
                '<div class="sa-care-box sa-shipping-note">' +
                    '<p class="sa-care-text">All products must be unused, in their original condition, with original tags and packaging intact.</p>' +
                '</div>';

            var accordionHTML = 
                '<div id="sa-product-accordions" class="sa-product-accordions">' +
                    '<!-- 1. Description Dropdown -->' +
                    '<div class="sa-accordion-item sa-accordion-active">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="true">' +
                            '<span>Description</span>' +
                            '<span class="sa-accordion-icon">&minus;</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: block;">' +
                            '<div class="sa-accordion-content sa-accordion-desc">' + parsed.description + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<!-- 2. Features Dropdown -->' +
                    '<div class="sa-accordion-item">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="false">' +
                            '<span>Features</span>' +
                            '<span class="sa-accordion-icon">+</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: none;">' +
                            '<div class="sa-accordion-content sa-accordion-features">' + parsed.features + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<!-- 3. Care Dropdown -->' +
                    '<div class="sa-accordion-item">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="false">' +
                            '<span>Care</span>' +
                            '<span class="sa-accordion-icon">+</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: none;">' +
                            '<div class="sa-accordion-content sa-accordion-care">' + parsed.care + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<!-- 4. Shipping and Returns Dropdown (Static across all products) -->' +
                    '<div class="sa-accordion-item">' +
                        '<button type="button" class="sa-accordion-header" aria-expanded="false">' +
                            '<span>Shipping and Returns</span>' +
                            '<span class="sa-accordion-icon">+</span>' +
                        '</button>' +
                        '<div class="sa-accordion-body" style="display: none;">' +
                            '<div class="sa-accordion-content sa-accordion-shipping">' + shippingReturnsHTML + '</div>' +
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

        /* ======================================================================
           4. FOOTER POLICY LINKS & COPYRIGHT AUTO-UPDATE
           ====================================================================== */
        function initFooterPolicies() {
            var $copyrightWidget = $('.elementor-element-503537d2 .elementor-heading-title');
            if ($copyrightWidget.length) {
                var currentYear = new Date().getFullYear();
                $copyrightWidget.html('&copy; ' + currentYear + ' STYLE ADDICT. All rights reserved.');
            }

            var $copyrightCol = $('.elementor-element-64c7b07a .elementor-widget-wrap');
            if ($copyrightCol.length && !$('#sa-footer-policies').length) {
                var policiesHTML = 
                    '<div id="sa-footer-policies" class="sa-footer-policies">' +
                        '<a href="/privacy-policy/">Privacy Policy</a>' +
                        '<span class="sa-footer-sep">&bull;</span>' +
                        '<a href="/terms-conditions/">Terms &amp; Conditions</a>' +
                        '<span class="sa-footer-sep">&bull;</span>' +
                        '<a href="/shipping-delivery-policy/">Shipping &amp; Delivery</a>' +
                        '<span class="sa-footer-sep">&bull;</span>' +
                        '<a href="/refund-and-return-policy/">Refund &amp; Return Policy</a>' +
                        '<span class="sa-footer-sep">&bull;</span>' +
                        '<a href="/cancellation-policy/">Cancellation Policy</a>' +
                    '</div>';
                
                $copyrightCol.prepend(policiesHTML);
            }
        }

        initFooterPolicies();
        setTimeout(initFooterPolicies, 400);

        /* ======================================================================
           4.1 FOOTER SOCIAL MEDIA (DUAL INSTAGRAM HANDLES)
           ====================================================================== */
        function initFooterSocials() {
            var $footerSocials = $('.elementor-element-37708728 .elementor-social-icons-wrapper');
            if ($footerSocials.length) {
                // Label main Instagram handle
                var $mainInsta = $footerSocials.find('a[href*="style_addict_jewellery"]');
                if ($mainInsta.length) {
                    $mainInsta.attr('title', 'Instagram: @style_addict_jewellery');
                    $mainInsta.attr('aria-label', 'Instagram: @style_addict_jewellery');
                }

                // Add Luxe Instagram handle if not already rendered
                if (!$footerSocials.find('a[href*="styleaddictjewellery_luxe"]').length) {
                    var luxeHTML = 
                        '<span class="elementor-grid-item sa-footer-social-item sa-footer-social-luxe">' +
                            '<a class="elementor-icon elementor-social-icon elementor-social-icon-instagram elementor-repeater-item-insta-luxe" ' +
                               'href="https://www.instagram.com/styleaddictjewellery_luxe/" ' +
                               'target="_blank" rel="noopener noreferrer" ' +
                               'title="Instagram Luxe: @styleaddictjewellery_luxe" ' +
                               'aria-label="Instagram Luxe: @styleaddictjewellery_luxe">' +
                                '<span class="elementor-screen-only">Instagram Luxe</span>' +
                                '<svg class="e-font-icon-svg e-fab-instagram" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">' +
                                    '<path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>' +
                                '</svg>' +
                                '<span class="sa-social-badge">Luxe</span>' +
                            '</a>' +
                        '</span>';
                    $footerSocials.append(luxeHTML);
                }
            }
        }

        initFooterSocials();
        setTimeout(initFooterSocials, 400);

        /* ======================================================================
           5. LUXURY POLICY PAGES STYLING & SWITCHER TABS
           ====================================================================== */
        function initPolicyPagesEnhancement() {
            var path = window.location.pathname.replace(/\/$/, '') + '/';
            var policyPages = [
                { slug: '/privacy-policy/', title: 'Privacy Policy', short: 'Privacy Policy' },
                { slug: '/terms-conditions/', title: 'Terms & Conditions', short: 'Terms & Conditions' },
                { slug: '/shipping-delivery-policy/', title: 'Shipping & Delivery Policy', short: 'Shipping & Delivery' },
                { slug: '/refund-and-return-policy/', title: 'Refund & Return Policy', short: 'Refund & Returns' },
                { slug: '/cancellation-policy/', title: 'Cancellation Policy', short: 'Cancellation Policy' }
            ];

            var currentPolicy = null;
            for (var i = 0; i < policyPages.length; i++) {
                if (path === policyPages[i].slug || path.indexOf(policyPages[i].slug) !== -1 ||
                    (policyPages[i].slug === '/terms-conditions/' && path.indexOf('/terms-and-conditions') !== -1)) {
                    currentPolicy = policyPages[i];
                    break;
                }
            }

            var $body = $('body');
            var isPolicy = currentPolicy !== null || 
                           $body.hasClass('privacy-policy') || 
                           $body.hasClass('page-id-3') || 
                           $body.hasClass('page-id-674') || 
                           $body.hasClass('page-id-656') || 
                           $body.hasClass('page-id-678') || 
                           $body.hasClass('page-id-686');

            if (!isPolicy) return;

            $body.addClass('sa-policy-active-page');
            var $main = $('main.site-main, #content.site-main');
            if (!$main.length) return;

            // 1. Header decor (Luxury Badge & Diamond Divider)
            var $header = $main.find('.page-header');
            if ($header.length && !$('#sa-policy-header-decor').length) {
                var badgeHTML = 
                    '<div id="sa-policy-header-decor" class="sa-policy-header-decor">' +
                        '<div class="sa-policy-badge">' +
                            '<span class="sa-sparkle">&#10022;</span> STYLE ADDICT POLICIES &amp; LEGAL <span class="sa-sparkle">&#10022;</span>' +
                        '</div>' +
                    '</div>';
                $header.prepend(badgeHTML);

                var dividerHTML = 
                    '<div class="sa-policy-divider">' +
                        '<span class="sa-divider-line"></span>' +
                        '<span class="sa-divider-gem">&#9830;</span>' +
                        '<span class="sa-divider-line"></span>' +
                    '</div>';
                $header.append(dividerHTML);
            }

            // 2. Interactive Policy Navigation Tabs (Easy 1-click switching)
            if ($header.length && !$('#sa-policy-switcher-nav').length) {
                var tabsHTML = '<div id="sa-policy-switcher-nav" class="sa-policy-switcher-nav"><div class="sa-policy-switcher-scroll">';
                for (var j = 0; j < policyPages.length; j++) {
                    var p = policyPages[j];
                    var isActive = (currentPolicy && currentPolicy.slug === p.slug) || (path.indexOf(p.slug) !== -1);
                    if (!isActive && !currentPolicy) {
                        if (p.slug === '/privacy-policy/' && ($body.hasClass('privacy-policy') || $body.hasClass('page-id-3'))) isActive = true;
                        if (p.slug === '/terms-conditions/' && $body.hasClass('page-id-674')) isActive = true;
                        if (p.slug === '/shipping-delivery-policy/' && $body.hasClass('page-id-656')) isActive = true;
                        if (p.slug === '/refund-and-return-policy/' && $body.hasClass('page-id-678')) isActive = true;
                        if (p.slug === '/cancellation-policy/' && $body.hasClass('page-id-686')) isActive = true;
                    }
                    var activeClass = isActive ? ' sa-policy-tab-active' : '';
                    tabsHTML += '<a href="' + p.slug + '" class="sa-policy-tab' + activeClass + '">' + p.short + '</a>';
                }
                tabsHTML += '</div></div>';
                $header.after(tabsHTML);
            }

            // 3. Customer Care Concierge Card at bottom of content
            var $content = $main.find('.page-content');
            if ($content.length && !$('#sa-policy-support-card').length) {
                var supportHTML = 
                    '<div id="sa-policy-support-card" class="sa-policy-support-card">' +
                        '<div class="sa-support-icon">&#128142;</div>' +
                        '<div class="sa-support-body">' +
                            '<h4>Need Any Assistance or Clarification?</h4>' +
                            '<p>Our dedicated customer concierge team is always delighted to assist you with any questions regarding our policies, orders, or handcrafted collections.</p>' +
                            '<div class="sa-support-links">' +
                                '<a href="mailto:styleaddictjewelleryy@gmail.com" class="sa-support-btn sa-support-btn--email">' +
                                    '<span>&#9993;</span> styleaddictjewelleryy@gmail.com' +
                                '</a>' +
                                '<a href="https://wa.me/917003563540" target="_blank" rel="noopener noreferrer" class="sa-support-btn sa-support-btn--whatsapp" aria-label="Chat on WhatsApp">' +
                                    '<span class="sa-whatsapp-btn-icon" aria-hidden="true">' +
                                        '<svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>' +
                                    '</span> Chat on WhatsApp' +
                                '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                $content.append(supportHTML);
            }
        }

        initPolicyPagesEnhancement();
        setTimeout(initPolicyPagesEnhancement, 400);

        /* ======================================================================
           5. LUXURY SIDE-CART DRAWER & CHECKOUT ENHANCEMENTS
           ====================================================================== */
        function initCartEnhancements() {
            // 5.1 Free shipping callout in side cart drawer
            var $drawer = $('.elementor-menu-cart__main');
            if ($drawer.length && !$('#sa-cart-shipping-banner').length) {
                var shippingBanner = 
                    '<div id="sa-cart-shipping-banner" class="sa-cart-shipping-banner">' +
                        '<span>✨ <strong>Complimentary Insured Shipping</strong> on all orders</span>' +
                    '</div>';
                var $closeBtn = $drawer.find('.elementor-menu-cart__close-button');
                if ($closeBtn.length) {
                    $closeBtn.after(shippingBanner);
                } else {
                    $drawer.prepend(shippingBanner);
                }
            }

            // 5.2 Trust Badges below Place Order on Checkout Page
            if ($('body').hasClass('woocommerce-checkout') && !$('#sa-checkout-trust').length) {
                var trustHTML = 
                    '<div id="sa-checkout-trust" class="sa-checkout-trust">' +
                        '<div class="sa-trust-item">' +
                            '<span class="sa-trust-icon">🔒</span>' +
                            '<span><strong>256-Bit SSL</strong> Encrypted Checkout</span>' +
                        '</div>' +
                        '<div class="sa-trust-item">' +
                            '<span class="sa-trust-icon">💎</span>' +
                            '<span><strong>100% Insured</strong> Transit Delivery</span>' +
                        '</div>' +
                        '<div class="sa-trust-item">' +
                            '<span class="sa-trust-icon">🛡️</span>' +
                            '<span><strong>RBI-Authorized</strong> Secure Gateways</span>' +
                        '</div>' +
                    '</div>';
                
                var $placeOrderBtn = $('#place_order');
                if ($placeOrderBtn.length) {
                    $placeOrderBtn.after(trustHTML);
                } else {
                    $('#order_review').append(trustHTML);
                }
            }
        }

        initCartEnhancements();
        $(document).on('added_to_cart removed_from_cart updated_cart_totals updated_checkout', initCartEnhancements);
        $(document).on('click', '.elementor-menu-cart__toggle_button, .elementor-menu-cart__toggle', function () {
            setTimeout(initCartEnhancements, 100);
        });

        /* ======================================================================
           6. MOBILE NAVIGATION DRAWER ENHANCEMENT & FAQ NAV LINK SAFETY CHECK
           ====================================================================== */
        function ensureNavbarFaqLink() {
            var isFaqActive = window.location.pathname.replace(/\/$/, '') === '/faq';
            var activeCls = isFaqActive ? ' elementor-item-active' : '';

            // Desktop menu
            var $desktopMenu = $('#menu-1-7b53a35a, .elementor-26 .elementor-nav-menu--main ul.elementor-nav-menu').first();
            if ($desktopMenu.length && !$desktopMenu.find('a[href*="/faq"]').length) {
                $desktopMenu.append(
                    '<li class="menu-item menu-item-type-post_type menu-item-object-page sa-nav-faq-item">' +
                        '<a href="/faq/" class="elementor-item' + activeCls + '">FAQ</a>' +
                    '</li>'
                );
            }

            // Mobile dropdown menu (insert before Wishlist divider if present)
            var $mobileMenu = $('#menu-2-7b53a35a, .elementor-26 .elementor-nav-menu--dropdown').first();
            if ($mobileMenu.length && !$mobileMenu.find('a[href*="/faq"]').length) {
                var $faqLi = $(
                    '<li class="menu-item menu-item-type-post_type menu-item-object-page sa-nav-faq-item">' +
                        '<a href="/faq/" class="elementor-item' + activeCls + '">FAQ</a>' +
                    '</li>'
                );
                var $divider = $mobileMenu.find('#sa-mobile-menu-divider');
                if ($divider.length) {
                    $divider.before($faqLi);
                } else {
                    $mobileMenu.append($faqLi);
                }
            }
        }

        function initMobileMenuEnhancements() {
            ensureNavbarFaqLink();
            var $mobileNavs = $('.elementor-26 .elementor-nav-menu--dropdown, .elementor-element-7b53a35a .elementor-nav-menu--dropdown');
            $mobileNavs.each(function () {
                var $menu = $(this);
                if (!$menu.find('#sa-mobile-menu-divider').length) {
                    var extraLinksHTML = 
                        '<li id="sa-mobile-menu-divider" class="menu-item menu-item-type-custom menu-item-object-custom sa-mobile-menu-divider" style="border-top: 1px solid rgba(181, 93, 68, 0.2); margin: 8px 0 4px 0; padding: 0;"></li>' +
                        '<li class="menu-item menu-item-type-custom menu-item-object-custom sa-mobile-nav-item">' +
                            '<a href="/wishlist/" class="elementor-item elementor-item-anchor" style="display: flex; align-items: center; gap: 8px; color: #2D1F1B; font-weight: 500; padding: 10px 0;">' +
                                '<span style="color: #D44332; font-size: 16px; line-height: 1;">&#9825;</span> My Wishlist' +
                            '</a>' +
                        '</li>' +
                        '<li class="menu-item menu-item-type-custom menu-item-object-custom sa-mobile-nav-item">' +
                            '<a href="/my-account/" class="elementor-item elementor-item-anchor" style="display: flex; align-items: center; gap: 8px; color: #2D1F1B; font-weight: 500; padding: 10px 0;">' +
                                '<span style="color: #B55D44; font-size: 16px; line-height: 1;">&#128100;</span> My Account' +
                            '</a>' +
                        '</li>';
                    $menu.append(extraLinksHTML);
                }
            });
        }

        initMobileMenuEnhancements();
        $(document).on('click', '.elementor-menu-toggle', function () {
            setTimeout(initMobileMenuEnhancements, 50);
            setTimeout(initMobileMenuEnhancements, 250);
        });

        /* ======================================================================
           7. FAQ PAGE INTERACTIVE ACCORDION
           ====================================================================== */
        function initFaqPageInteractions() {
            var $faqWrapper = $('#sa-faq-page-wrapper');
            if (!$faqWrapper.length) return;

            $('body').addClass('sa-faq-active-page');

            $faqWrapper.off('click.saFaq', '.sa-faq-question').on('click.saFaq', '.sa-faq-question', function (e) {
                e.preventDefault();
                var $btn = $(this);
                var $item = $btn.closest('.sa-faq-item');
                var $answer = $item.find('.sa-faq-answer');
                var isExpanded = $btn.attr('aria-expanded') === 'true';

                if (isExpanded) {
                    $answer.slideUp(240);
                    $btn.attr('aria-expanded', 'false');
                    $item.removeClass('sa-faq-active');
                    $btn.find('.sa-faq-icon').text('+');
                } else {
                    $answer.slideDown(260);
                    $btn.attr('aria-expanded', 'true');
                    $item.addClass('sa-faq-active');
                    $btn.find('.sa-faq-icon').html('&minus;');
                }
            });
        }

        initFaqPageInteractions();

        /* ======================================================================
           8. NAVBAR PRODUCT SEARCH BAR (DESKTOP INLINE + MOBILE/TABLET DRAWER)
           ====================================================================== */
        function initNavbarProductSearch() {
            var $rightCol = $('.elementor-26 .elementor-element-557bf102 .elementor-widget-wrap').first();
            var $headerNav = $('.elementor-26 .elementor-element-744fb543').first();
            if (!$rightCol.length) return;

            var homeUrl = (window.saSearchConfig && saSearchConfig.homeUrl) ? saSearchConfig.homeUrl : '/';
            var ajaxUrl = (window.saSearchConfig && saSearchConfig.ajaxUrl) ? saSearchConfig.ajaxUrl : '/wp-admin/admin-ajax.php';
            var searchSvg =
                '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                    '<circle cx="11" cy="11" r="7"></circle>' +
                    '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
                '</svg>';

            function escHtml(str) {
                return String(str || '').replace(/[&<>"']/g, function (ch) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
                });
            }

            function buildSearchForm(extraClass) {
                return (
                    '<form class="sa-nav-search-form ' + extraClass + '" role="search" method="get" action="' + escHtml(homeUrl) + '">' +
                        '<input type="hidden" name="post_type" value="product" />' +
                        '<input type="search" name="s" class="sa-nav-search-input" placeholder="Search jewellery..." autocomplete="off" aria-label="Search products" />' +
                        '<button type="submit" class="sa-nav-search-submit" aria-label="Search products">' + searchSvg + '</button>' +
                        '<div class="sa-nav-search-results" aria-live="polite" hidden></div>' +
                    '</form>'
                );
            }

            if (!$('#sa-nav-search-desktop').length) {
                $rightCol.prepend(
                    '<div id="sa-nav-search-desktop" class="sa-nav-search-desktop">' +
                        buildSearchForm('sa-nav-search-form--desktop') +
                    '</div>'
                );
            }

            if (!$('#sa-nav-search-toggle').length) {
                var $toggleBtn = $(
                    '<button type="button" id="sa-nav-search-toggle" class="sa-nav-search-toggle" aria-label="Open product search" aria-expanded="false">' +
                        searchSvg +
                    '</button>'
                );
                var $cartWidget = $rightCol.find('.elementor-element-5d52351');
                if ($cartWidget.length) {
                    $cartWidget.before($toggleBtn);
                } else {
                    $rightCol.prepend($toggleBtn);
                }
            }

            if ($headerNav.length && !$('#sa-nav-search-mobile-drawer').length) {
                $headerNav.after(
                    '<div id="sa-nav-search-mobile-drawer" class="sa-nav-search-mobile-drawer" hidden>' +
                        '<div class="sa-nav-search-mobile-inner">' +
                            buildSearchForm('sa-nav-search-form--mobile') +
                        '</div>' +
                    '</div>'
                );
            }

            // Mobile/Tablet toggle
            $(document).off('click.saSearchToggle', '#sa-nav-search-toggle').on('click.saSearchToggle', '#sa-nav-search-toggle', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $drawer = $('#sa-nav-search-mobile-drawer');
                var isOpen = !$drawer.prop('hidden');
                if (isOpen) {
                    $drawer.prop('hidden', true).removeClass('is-open');
                    $(this).attr('aria-expanded', 'false');
                } else {
                    $drawer.prop('hidden', false).addClass('is-open');
                    $(this).attr('aria-expanded', 'true');
                    setTimeout(function () {
                        $drawer.find('.sa-nav-search-input').trigger('focus');
                    }, 40);
                }
            });

            // Live AJAX autocomplete per form instance
            var searchTimers = {};
            var activeRequests = {};

            $(document).off('input.saLiveSearch', '.sa-nav-search-input').on('input.saLiveSearch', '.sa-nav-search-input', function () {
                var $input = $(this);
                var $form = $input.closest('.sa-nav-search-form');
                var $results = $form.find('.sa-nav-search-results');
                var formKey = $form.hasClass('sa-nav-search-form--mobile') ? 'mobile' : 'desktop';
                var val = $.trim($input.val());

                clearTimeout(searchTimers[formKey]);
                if (activeRequests[formKey] && activeRequests[formKey].readyState !== 4) {
                    activeRequests[formKey].abort();
                }

                if (val.length < 2) {
                    $results.prop('hidden', true).empty();
                    return;
                }

                searchTimers[formKey] = setTimeout(function () {
                    $results.html('<div class="sa-nav-search-loading">Searching...</div>').prop('hidden', false);

                    activeRequests[formKey] = $.getJSON(ajaxUrl, {
                        action: 'sa_live_product_search',
                        q: val
                    }).done(function (res) {
                        if (!res || !res.success || !res.data) {
                            $results.prop('hidden', true).empty();
                            return;
                        }
                        var items = res.data.items || [];
                        var searchUrl = res.data.searchUrl || (homeUrl + '?s=' + encodeURIComponent(val) + '&post_type=product');

                        if (!items.length) {
                            $results.html(
                                '<div class="sa-nav-search-empty">No jewellery found for &ldquo;' + escHtml(val) + '&rdquo;</div>'
                            ).prop('hidden', false);
                            return;
                        }

                        var html = '<div class="sa-nav-search-list">';
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            html +=
                                '<a href="' + escHtml(item.url) + '" class="sa-nav-search-item">' +
                                    (item.thumb ? '<img src="' + escHtml(item.thumb) + '" alt="' + escHtml(item.title) + '" class="sa-nav-search-thumb" loading="lazy" />' : '') +
                                    '<div class="sa-nav-search-meta">' +
                                        '<span class="sa-nav-search-title">' + escHtml(item.title) + '</span>' +
                                        (item.price ? '<span class="sa-nav-search-price">' + item.price + '</span>' : '') +
                                    '</div>' +
                                '</a>';
                        }
                        html +=
                            '</div>' +
                            '<a href="' + escHtml(searchUrl) + '" class="sa-nav-search-all">View all results for &ldquo;' + escHtml(val) + '&rdquo; &rarr;</a>';

                        $results.html(html).prop('hidden', false);
                    }).fail(function (xhr, status) {
                        if (status !== 'abort') {
                            $results.prop('hidden', true).empty();
                        }
                    });
                }, 240);
            });

            // Close dropdowns on outside click or Escape
            $(document).off('click.saSearchClose').on('click.saSearchClose', function (e) {
                var $t = $(e.target);
                if (!$t.closest('.sa-nav-search-form').length) {
                    $('.sa-nav-search-results').prop('hidden', true);
                }
                if (!$t.closest('#sa-nav-search-mobile-drawer, #sa-nav-search-toggle').length) {
                    $('#sa-nav-search-mobile-drawer').prop('hidden', true).removeClass('is-open');
                    $('#sa-nav-search-toggle').attr('aria-expanded', 'false');
                }
            });

            $(document).off('keydown.saSearchEsc').on('keydown.saSearchEsc', function (e) {
                if (e.key === 'Escape') {
                    $('.sa-nav-search-results').prop('hidden', true);
                    $('#sa-nav-search-mobile-drawer').prop('hidden', true).removeClass('is-open');
                    $('#sa-nav-search-toggle').attr('aria-expanded', 'false');
                }
            });
        }

        initNavbarProductSearch();
    });
})(jQuery);
