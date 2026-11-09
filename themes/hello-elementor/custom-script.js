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
            // If an old accordion exists (e.g. with Shipping & Returns), remove it to rebuild cleanly with Description, Features, Care
            if ($('#sa-product-accordions').length) {
                if ($('#sa-product-accordions:contains("Shipping")').length || !$('#sa-product-accordions:contains("Features")').length) {
                    $('#sa-product-accordions').remove();
                } else {
                    return;
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

            // 3.4 Construct the 3 Segmented Dropdowns: Description, Features, and Care
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

            // Also add Quick Policy Links to Store Column in the footer
            var $storeCol = $('.elementor-element-314f1659 .elementor-widget-wrap');
            if ($storeCol.length && !$('#sa-footer-store-policies').length) {
                var storePoliciesHTML = 
                    '<div id="sa-footer-store-policies" class="sa-footer-store-policies">' +
                        '<h6 class="sa-footer-subheading">Quick Policies</h6>' +
                        '<ul class="sa-footer-policy-list">' +
                            '<li><a href="/privacy-policy/">Privacy Policy</a></li>' +
                            '<li><a href="/terms-conditions/">Terms &amp; Conditions</a></li>' +
                            '<li><a href="/shipping-delivery-policy/">Shipping &amp; Delivery</a></li>' +
                            '<li><a href="/refund-and-return-policy/">Refund &amp; Return Policy</a></li>' +
                            '<li><a href="/cancellation-policy/">Cancellation Policy</a></li>' +
                        '</ul>' +
                    '</div>';
                $storeCol.append(storePoliciesHTML);
            }
        }

        initFooterPolicies();
        setTimeout(initFooterPolicies, 400);

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
                                '<a href="tel:+919830836837" class="sa-support-btn sa-support-btn--phone">' +
                                    '<span>&#9742;</span> +91 98308 36837 (9 AM &ndash; 6 PM)' +
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
    });
})(jQuery);
