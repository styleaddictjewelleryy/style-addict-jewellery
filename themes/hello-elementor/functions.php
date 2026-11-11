<?php
/**
 * Theme functions and definitions
 *
 * @package HelloElementor
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

define( 'HELLO_ELEMENTOR_VERSION', '3.1.0' );

if ( ! isset( $content_width ) ) {
	$content_width = 800; // Pixels.
}

if ( ! function_exists( 'hello_elementor_setup' ) ) {
	/**
	 * Set up theme support.
	 *
	 * @return void
	 */
	function hello_elementor_setup() {
		if ( is_admin() ) {
			hello_maybe_update_theme_version_in_db();
		}

		if ( apply_filters( 'hello_elementor_register_menus', true ) ) {
			register_nav_menus( [ 'menu-1' => esc_html__( 'Header', 'hello-elementor' ) ] );
			register_nav_menus( [ 'menu-2' => esc_html__( 'Footer', 'hello-elementor' ) ] );
		}

		if ( apply_filters( 'hello_elementor_post_type_support', true ) ) {
			add_post_type_support( 'page', 'excerpt' );
		}

		if ( apply_filters( 'hello_elementor_add_theme_support', true ) ) {
			add_theme_support( 'post-thumbnails' );
			add_theme_support( 'automatic-feed-links' );
			add_theme_support( 'title-tag' );
			add_theme_support(
				'html5',
				[
					'search-form',
					'comment-form',
					'comment-list',
					'gallery',
					'caption',
					'script',
					'style',
				]
			);
			add_theme_support(
				'custom-logo',
				[
					'height'      => 100,
					'width'       => 350,
					'flex-height' => true,
					'flex-width'  => true,
				]
			);

			/*
			 * Editor Style.
			 */
			add_editor_style( 'classic-editor.css' );

			/*
			 * Gutenberg wide images.
			 */
			add_theme_support( 'align-wide' );

			/*
			 * WooCommerce.
			 */
			if ( apply_filters( 'hello_elementor_add_woocommerce_support', true ) ) {
				// WooCommerce in general.
				add_theme_support( 'woocommerce' );
				// Enabling WooCommerce product gallery features (are off by default since WC 3.0.0).
				// zoom.
				add_theme_support( 'wc-product-gallery-zoom' );
				// lightbox.
				add_theme_support( 'wc-product-gallery-lightbox' );
				// swipe.
				add_theme_support( 'wc-product-gallery-slider' );
			}
		}
	}
}
add_action( 'after_setup_theme', 'hello_elementor_setup' );

function hello_maybe_update_theme_version_in_db() {
	$theme_version_option_name = 'hello_theme_version';
	// The theme version saved in the database.
	$hello_theme_db_version = get_option( $theme_version_option_name );

	// If the 'hello_theme_version' option does not exist in the DB, or the version needs to be updated, do the update.
	if ( ! $hello_theme_db_version || version_compare( $hello_theme_db_version, HELLO_ELEMENTOR_VERSION, '<' ) ) {
		update_option( $theme_version_option_name, HELLO_ELEMENTOR_VERSION );
	}
}

if ( ! function_exists( 'hello_elementor_display_header_footer' ) ) {
	/**
	 * Check whether to display header footer.
	 *
	 * @return bool
	 */
	function hello_elementor_display_header_footer() {
		$hello_elementor_header_footer = true;

		return apply_filters( 'hello_elementor_header_footer', $hello_elementor_header_footer );
	}
}

if ( ! function_exists( 'hello_elementor_scripts_styles' ) ) {
	/**
	 * Theme Scripts & Styles.
	 *
	 * @return void
	 */
	function hello_elementor_scripts_styles() {
		$min_suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		if ( apply_filters( 'hello_elementor_enqueue_style', true ) ) {
			wp_enqueue_style(
				'hello-elementor',
				get_template_directory_uri() . '/style' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}

		if ( apply_filters( 'hello_elementor_enqueue_theme_style', true ) ) {
			wp_enqueue_style(
				'hello-elementor-theme-style',
				get_template_directory_uri() . '/theme' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}

		if ( hello_elementor_display_header_footer() ) {
			wp_enqueue_style(
				'hello-elementor-header-footer',
				get_template_directory_uri() . '/header-footer' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}
	}
}
add_action( 'wp_enqueue_scripts', 'hello_elementor_scripts_styles' );

if ( ! function_exists( 'hello_elementor_register_elementor_locations' ) ) {
	/**
	 * Register Elementor Locations.
	 *
	 * @param ElementorPro\Modules\ThemeBuilder\Classes\Locations_Manager $elementor_theme_manager theme manager.
	 *
	 * @return void
	 */
	function hello_elementor_register_elementor_locations( $elementor_theme_manager ) {
		if ( apply_filters( 'hello_elementor_register_elementor_locations', true ) ) {
			$elementor_theme_manager->register_all_core_location();
		}
	}
}
add_action( 'elementor/theme/register_locations', 'hello_elementor_register_elementor_locations' );

if ( ! function_exists( 'hello_elementor_content_width' ) ) {
	/**
	 * Set default content width.
	 *
	 * @return void
	 */
	function hello_elementor_content_width() {
		$GLOBALS['content_width'] = apply_filters( 'hello_elementor_content_width', 800 );
	}
}
add_action( 'after_setup_theme', 'hello_elementor_content_width', 0 );

if ( ! function_exists( 'hello_elementor_add_description_meta_tag' ) ) {
	/**
	 * Add description meta tag with excerpt text.
	 *
	 * @return void
	 */
	function hello_elementor_add_description_meta_tag() {
		if ( ! apply_filters( 'hello_elementor_description_meta_tag', true ) ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		$post = get_queried_object();
		if ( empty( $post->post_excerpt ) ) {
			return;
		}

		echo '<meta name="description" content="' . esc_attr( wp_strip_all_tags( $post->post_excerpt ) ) . '">' . "\n";
	}
}
add_action( 'wp_head', 'hello_elementor_add_description_meta_tag' );

// Admin notice
if ( is_admin() ) {
	require get_template_directory() . '/includes/admin-functions.php';
}

// Settings page
require get_template_directory() . '/includes/settings-functions.php';

// Header & footer styling option, inside Elementor
require get_template_directory() . '/includes/elementor-functions.php';

if ( ! function_exists( 'hello_elementor_customizer' ) ) {
	// Customizer controls
	function hello_elementor_customizer() {
		if ( ! is_customize_preview() ) {
			return;
		}

		if ( ! hello_elementor_display_header_footer() ) {
			return;
		}

		require get_template_directory() . '/includes/customizer-functions.php';
	}
}
add_action( 'init', 'hello_elementor_customizer' );

if ( ! function_exists( 'hello_elementor_check_hide_title' ) ) {
	/**
	 * Check whether to display the page title.
	 *
	 * @param bool $val default value.
	 *
	 * @return bool
	 */
	function hello_elementor_check_hide_title( $val ) {
		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$current_doc = Elementor\Plugin::instance()->documents->get( get_the_ID() );
			if ( $current_doc && 'yes' === $current_doc->get_settings( 'hide_title' ) ) {
				$val = false;
			}
		}
		return $val;
	}
}
add_filter( 'hello_elementor_page_title', 'hello_elementor_check_hide_title' );

/**
 * BC:
 * In v2.7.0 the theme removed the `hello_elementor_body_open()` from `header.php` replacing it with `wp_body_open()`.
 * The following code prevents fatal errors in child themes that still use this function.
 */
if ( ! function_exists( 'hello_elementor_body_open' ) ) {
	function hello_elementor_body_open() {
		wp_body_open();
	}
}

/*View Cart and Checkout Redirection Code*/
add_filter( 'woocommerce_checkout_redirect_empty_cart', '__return_false' );
add_filter( 'woocommerce_checkout_update_order_review_expired', '__return_false' );

/**
 * Style Addict Custom Luxury Styles & Interactions Enqueue
 */
function style_addict_enqueue_custom_assets() {
	wp_enqueue_style(
		'style-addict-custom-luxury',
		get_template_directory_uri() . '/custom-style.css',
		[],
		time()
	);

	wp_enqueue_script(
		'style-addict-custom-interactions',
		get_template_directory_uri() . '/custom-script.js',
		[ 'jquery' ],
		time(),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'style_addict_enqueue_custom_assets', 999 );

/**
 * Auto-generate essential legal & e-commerce policy pages for Style Addict Jewellery
 * (Privacy Policy, Terms & Conditions, Refund & Return Policy, Shipping Policy)
 */
function style_addict_create_policy_pages() {
	if ( get_option( 'style_addict_policy_pages_v1_created' ) ) {
		return;
	}

	$pages = [
		'privacy-policy' => [
			'title'   => 'Privacy Policy',
			'content' => '<div class="sa-policy-page">
<h2>Privacy Policy</h2>
<p class="sa-policy-intro">At <strong>Style Addict Jewellery</strong> ("we", "our", or "us"), accessible from <em>styleaddictjewellery.com</em>, safeguarding the privacy and confidentiality of our esteemed patrons is of paramount importance. This Privacy Policy outlines the types of personal information collected, how it is safeguarded, and how it is utilized to deliver a personalized, secure shopping experience.</p>

<div class="sa-policy-highlight">
<p><strong>Commitment to Privacy:</strong> We strictly do not sell, rent, or trade your personal information to third parties for marketing purposes. All data collected is utilized solely to fulfill orders, enhance customer support, and personalize your experience with Style Addict Jewellery.</p>
</div>

<h3>1. Information We Collect</h3>
<p>When you browse our collections, create an account, or place an order, we may collect the following information:</p>
<ul>
<li><strong>Personal Identification Details:</strong> Full name, contact phone number, and email address.</li>
<li><strong>Shipping &amp; Billing Information:</strong> Complete postal address, landmark, PIN code, and recipient contact details.</li>
<li><strong>Transaction Information:</strong> Order history, transaction identifiers, and chosen payment method (Prepaid UPI/Card/NetBanking or COD). <em>Note: All electronic payments are processed through secure, RBI-authorized, PCI-DSS compliant payment gateways. We never store credit/debit card numbers, CVVs, or bank account credentials on our servers.</em></li>
<li><strong>Technical &amp; Browsing Data:</strong> IP address, device type, browser specifications, and cookie preferences to ensure website performance and prevent unauthorized activities.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<ul>
<li>To process, pack, and deliver your bespoke jewellery orders.</li>
<li>To send real-time SMS, WhatsApp, and email order confirmations, tracking links, and delivery updates.</li>
<li>To provide dedicated concierge and customer care support.</li>
<li>To detect, prevent, and mitigate fraud or security breaches.</li>
<li>To share exclusive collection previews, festive offers, and styling tips (only with your express consent, with easy one-click opt-out available).</li>
</ul>

<h3>3. Data Protection &amp; Security</h3>
<p>We deploy robust industry-standard 256-bit SSL encryption across our entire website. Administrative access to customer order databases is strictly restricted to authorized fulfillment personnel bound by confidentiality agreements.</p>

<h3>4. Third-Party Service Providers</h3>
<p>To deliver your jewellery safely, we partner with trusted third-party providers including insured logistics couriers (e.g., Blue Dart, Delhivery) and certified payment processors. These partners receive only the minimal necessary information required to perform their specific fulfillment services.</p>

<h3>5. Your Rights &amp; Choices</h3>
<p>You have the right to review, update, or request the deletion of your personal data stored with us at any time. You may also unsubscribe from promotional announcements via the unsubscribe link in our emails or by contacting our support team.</p>

<h3>6. Contact Our Grievance &amp; Privacy Officer</h3>
<p>For any queries, concerns, or requests regarding this Privacy Policy, please contact us at:</p>
<ul>
<li><strong>Brand Name:</strong> Style Addict Jewellery</li>
<li><strong>Official Website:</strong> <a href="https://styleaddictjewellery.com">styleaddictjewellery.com</a></li>
<li><strong>Customer Support Email:</strong> support@styleaddictjewellery.com</li>
</ul>
</div>',
		],
		'terms-and-conditions' => [
			'title'   => 'Terms and Conditions',
			'content' => '<div class="sa-policy-page">
<h2>Terms and Conditions</h2>
<p class="sa-policy-intro">Welcome to <strong>Style Addict Jewellery</strong>. By browsing, accessing, or placing an order on <em>styleaddictjewellery.com</em> ("Website"), you agree to comply with and be bound by the following terms, conditions, and store policies.</p>

<div class="sa-policy-highlight">
<p>Please review these terms carefully before placing an order. If you do not agree with any part of these terms, please refrain from using our Website.</p>
</div>

<h3>1. Handcrafted Jewellery &amp; Natural Variations</h3>
<p>Every creation at Style Addict Jewellery is handcrafted with meticulous artistry using premium stones, Kundan, and high-grade metals. Because of the bespoke handcrafted nature of our products and natural gemstone characteristics:</p>
<ul>
<li>Subtle variations in stone shades, facets, placement, and metallic luster may occur, making every individual piece unique.</li>
<li>Product images on our website are professionally photographed under controlled lighting; slight color differences may appear due to your screen resolution, monitor calibration, or ambient lighting conditions.</li>
</ul>

<h3>2. Pricing, Invoicing &amp; Availability</h3>
<ul>
<li>All prices displayed on styleaddictjewellery.com are in Indian National Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless indicated otherwise.</li>
<li>Prices and promotional offers are subject to modification without prior notice. However, once an order is confirmed, the purchase price remains fixed for that order.</li>
<li>In the rare event of a technical typographical pricing error, we reserve the right to contact you for resolution or cancel the affected order with a prompt full refund.</li>
</ul>

<h3>3. Order Acceptance &amp; Verification</h3>
<p>Receipt of an automated order confirmation email does not signify our final acceptance of an order. We reserve the right to accept, decline, or limit order quantities at our sole discretion, including cases where fraud screening flags potential risks, incorrect address details are provided, or stock is unavailable.</p>

<h3>4. Intellectual Property Rights</h3>
<p>All designs, jewelry photography, logos, graphic trademarks, video previews, and textual content displayed on this website are the intellectual property of Style Addict Jewellery. Any unauthorized reproduction, redistribution, or commercial duplication is strictly prohibited.</p>

<h3>5. User Conduct &amp; Account Responsibility</h3>
<p>If you create an account on our Website, you are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized account activity.</p>

<h3>6. Governing Law &amp; Dispute Jurisdiction</h3>
<p>These terms and conditions and any transactions conducted on this Website shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in India.</p>

<h3>7. Customer Support Inquiries</h3>
<p>For questions regarding our Terms and Conditions, please contact us at <strong>support@styleaddictjewellery.com</strong>.</p>
</div>',
		],
		'refund-and-return-policy' => [
			'title'   => 'Refund and Return Policy',
			'content' => '<div class="sa-policy-page">
<h2>Refund and Return Policy</h2>
<p class="sa-policy-intro">At <strong>Style Addict Jewellery</strong>, we take immense pride in the craftsmanship, luxury finish, and timeless quality of our collections. We want you to cherish your jewellery. If for any reason you are not completely delighted with your purchase, our dedicated team is here to assist you.</p>

<div class="sa-policy-highlight">
<p><strong>7-Day Easy Return &amp; Exchange:</strong> We offer a hassle-free 7-day return and exchange policy from the date of confirmed package delivery for eligible items.</p>
</div>

<h3>1. Eligibility Criteria for Returns &amp; Exchanges</h3>
<p>To qualify for a return or replacement, the item must fulfill the following conditions:</p>
<ul>
<li>The request must be initiated within <strong>7 days</strong> of delivery.</li>
<li>The jewellery piece must be <strong>unworn, undamaged, unaltered</strong>, and in its pristine original condition.</li>
<li>The item must be returned with all original <strong>Style Addict luxury packaging</strong>, tags, tamper-evident seals, pouches, and certificates intact.</li>
<li>Items showing signs of perfume, makeup, moisture, chemical damage, or wear cannot be accepted.</li>
</ul>

<h3>2. Damaged or Defective Items in Transit</h3>
<p>Each order undergoes thorough multi-point quality inspection before being sealed in insured tamper-evident packaging. In the unlikely event that your package arrives visibly damaged or defective:</p>
<ul>
<li>Please notify us within <strong>24 to 48 hours</strong> of delivery.</li>
<li>Please provide an unedited <strong>unboxing video and clear photographs</strong> of the outer parcel, shipping label, and the affected item. This is required to process claims with our transit insurance partners.</li>
<li>Upon verification, we will immediately arrange an express complimentary replacement or full refund.</li>
</ul>

<h3>3. Non-Returnable Items</h3>
<p>For hygiene and exclusivity reasons, the following items cannot be returned or refunded:</p>
<ul>
<li>Bespoke customized or personalized pieces made specifically to custom order.</li>
<li>Items purchased during final clearance or special promotional sales marked as Non-Returnable.</li>
</ul>

<h3>4. The Return Process &amp; Reverse Pickup</h3>
<ol>
<li><strong>Initiate Request:</strong> Email us at <strong>support@styleaddictjewellery.com</strong> with your Order ID, reason for return, and item photos.</li>
<li><strong>Reverse Pickup:</strong> Once approved, our courier partner will coordinate a convenient doorstep pickup from your registered address.</li>
<li><strong>Quality Verification:</strong> Upon receipt at our inspection warehouse, our quality control team will inspect the item within 48 business hours.</li>
</ol>

<h3>5. Refund Processing Timeline</h3>
<ul>
<li><strong>Prepaid Orders (Cards/UPI/NetBanking):</strong> Approved refunds are credited directly back to the original payment source within <strong>5 to 7 business days</strong>.</li>
<li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are processed via secure NEFT/IMPS bank transfer or instant Store Credit / Gift Voucher, as preferred by the customer.</li>
</ul>

<h3>6. Assistance &amp; Help</h3>
<p>Our concierge team is available to assist you Monday through Saturday, 10:00 AM – 7:00 PM IST via email at <strong>support@styleaddictjewellery.com</strong>.</p>
</div>',
		],
		'shipping-policy' => [
			'title'   => 'Shipping and Delivery Policy',
			'content' => '<div class="sa-policy-page">
<h2>Shipping and Delivery Policy</h2>
<p class="sa-policy-intro">At <strong>Style Addict Jewellery</strong>, we ensure that every precious jewellery creation reaches you safely, promptly, and beautifully presented in our signature luxury gift packaging.</p>

<div class="sa-policy-highlight">
<p><strong>Insured Transit &amp; Tamper-Evident Packaging:</strong> Every shipment is fully transit-insured and enclosed in discreet, tamper-proof outer boxes to ensure maximum security from our workshop to your doorstep.</p>
</div>

<h3>1. Order Processing &amp; Dispatch Timeline</h3>
<ul>
<li><strong>In-Stock Collections:</strong> Orders are verified, meticulously quality-checked, and dispatched within <strong>24 to 48 business hours</strong> of order placement.</li>
<li><strong>Handcrafted &amp; Made-to-Order Pieces:</strong> Specially crafted or customized jewellery requires 4 to 7 business days for hand-finishing prior to dispatch.</li>
<li>Orders placed on Sundays or national holidays are dispatched on the next working business day.</li>
</ul>

<h3>2. Estimated Delivery Timeframes</h3>
<p>Once dispatched from our facility, typical transit times across India are:</p>
<ul>
<li><strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2 to 4 business days.</li>
<li><strong>Tier 2 &amp; Tier 3 Cities / Rest of India:</strong> 4 to 6 business days.</li>
<li><strong>Remote Regional Areas:</strong> 5 to 7 business days.</li>
</ul>

<h3>3. Shipping Charges</h3>
<ul>
<li><strong>Prepaid Orders:</strong> We offer <strong>Complimentary Free Shipping</strong> across India on all prepaid orders (UPI, Cards, NetBanking).</li>
<li><strong>Cash on Delivery (COD):</strong> COD is available for select pin codes with a nominal handling charge displayed transparently at checkout.</li>
</ul>

<h3>4. Tracking Your Order</h3>
<p>As soon as your package leaves our fulfillment center, you will receive an automated shipping confirmation containing the <strong>Airway Bill (AWB) tracking number</strong> and a direct tracking link via SMS, WhatsApp, and email.</p>

<h3>5. Parcel Delivery &amp; Inspection Advice</h3>
<p>We advise patrons never to accept any parcel that appears visibly tampered with, opened, or resealed with unbranded tape. Please refuse delivery in such instances and inform our support team immediately at <strong>support@styleaddictjewellery.com</strong>.</p>

<h3>6. Address Accuracy</h3>
<p>Please ensure that your shipping address includes complete details (flat/house number, building, street, landmark, and 6-digit postal PIN code) along with an active phone number to guarantee uninterrupted delivery.</p>
</div>',
		],
	];

	foreach ( $pages as $slug => $data ) {
		$existing_page = get_page_by_path( $slug );
		if ( ! $existing_page ) {
			$found = get_posts( [
				'name'        => $slug,
				'post_type'   => 'page',
				'post_status' => 'any',
				'numberposts' => 1,
			] );
			if ( ! empty( $found ) ) {
				$existing_page = $found[0];
			}
		}

		if ( ! $existing_page ) {
			$page_id = wp_insert_post( [
				'post_title'     => $data['title'],
				'post_name'      => $slug,
				'post_content'   => $data['content'],
				'post_status'    => 'publish',
				'post_type'      => 'page',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			] );

			if ( 'privacy-policy' === $slug && $page_id && ! is_wp_error( $page_id ) ) {
				update_option( 'wp_page_for_privacy_policy', $page_id );
			}
		}
	}

	update_option( 'style_addict_policy_pages_v1_created', 1 );
}
add_action( 'init', 'style_addict_create_policy_pages' );

/**
 * Append Luxe Instagram link to footer social icons widget if not already present.
 */
function style_addict_footer_social_icons( $content, $widget ) {
	if ( 'social-icons' === $widget->get_name() && '37708728' === $widget->get_id() ) {
		if ( false === strpos( $content, 'styleaddictjewellery_luxe' ) ) {
			$luxe_icon = '<span class="elementor-grid-item sa-footer-social-item sa-footer-social-luxe"><a class="elementor-icon elementor-social-icon elementor-social-icon-instagram elementor-repeater-item-insta-luxe" href="https://www.instagram.com/styleaddictjewellery_luxe/" target="_blank" rel="noopener noreferrer" title="Instagram Luxe: @styleaddictjewellery_luxe" aria-label="Instagram Luxe: @styleaddictjewellery_luxe"><span class="elementor-screen-only">Instagram Luxe</span><svg class="e-font-icon-svg e-fab-instagram" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg><span class="sa-social-badge">Luxe</span></a></span>';
			// Insert before the closing wrapper tags
			$content = preg_replace( '/(<\/div>\s*<\/div>\s*<\/div>\s*$)/', $luxe_icon . '$1', $content );
		}
	}
	return $content;
}
add_filter( 'elementor/widget/render_content', 'style_addict_footer_social_icons', 10, 2 );

/**
 * Lucrative luxury Sale badge showing exact % OFF dynamically on all discounted products.
 */
function style_addict_custom_sale_flash( $html, $post, $product ) {
	if ( ! $product instanceof WC_Product ) {
		return $html;
	}

	$percentage = 0;

	if ( $product->is_type( 'variable' ) ) {
		$prices = $product->get_variation_prices();
		if ( ! empty( $prices['regular_price'] ) && ! empty( $prices['sale_price'] ) ) {
			foreach ( $prices['regular_price'] as $key => $regular_price ) {
				$sale_price = isset( $prices['sale_price'][ $key ] ) ? (float) $prices['sale_price'][ $key ] : 0;
				$reg_val    = (float) $regular_price;
				if ( $reg_val > 0 && $sale_price > 0 && $sale_price < $reg_val ) {
					$pct = (int) round( ( ( $reg_val - $sale_price ) / $reg_val ) * 100 );
					if ( $pct > $percentage ) {
						$percentage = $pct;
					}
				}
			}
		}
	} else {
		$regular = (float) $product->get_regular_price();
		$sale    = (float) $product->get_sale_price();
		if ( $regular > 0 && $sale > 0 && $sale < $regular ) {
			$percentage = (int) round( ( ( $regular - $sale ) / $regular ) * 100 );
		}
	}

	if ( $percentage > 0 ) {
		return '<span class="onsale sa-sale-badge"><span class="sa-sale-star">&#10022;</span> ' . esc_html( $percentage ) . '% OFF</span>';
	}

	return '<span class="onsale sa-sale-badge"><span class="sa-sale-star">&#10022;</span> SALE</span>';
}
add_filter( 'woocommerce_sale_flash', 'style_addict_custom_sale_flash', 20, 3 );

/**
 * Register "FAQs" Custom Post Type so admins can easily add/edit Q&As
 * from WordPress Dashboard -> FAQs -> Add New.
 */
function style_addict_register_faq_cpt() {
	register_post_type( 'sa_faq', [
		'labels' => [
			'name'               => 'FAQs',
			'singular_name'      => 'FAQ',
			'menu_name'          => 'FAQs',
			'name_admin_bar'     => 'FAQ',
			'add_new'            => 'Add New Question',
			'add_new_item'       => 'Add New FAQ Question',
			'edit_item'          => 'Edit FAQ Question',
			'new_item'           => 'New FAQ Question',
			'view_item'          => 'View FAQ',
			'all_items'          => 'All FAQs',
			'search_items'       => 'Search FAQs',
			'not_found'          => 'No FAQs found.',
			'not_found_in_trash' => 'No FAQs found in Trash.',
		],
		'public'              => false,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true,
		'menu_position'       => 26,
		'menu_icon'           => 'dashicons-editor-help',
		'supports'            => [ 'title', 'editor', 'page-attributes' ],
		'exclude_from_search' => true,
		'publicly_queryable'  => false,
	] );
}
add_action( 'init', 'style_addict_register_faq_cpt' );

/**
 * Customize Title placeholder inside "FAQs -> Add New" editor.
 */
function style_addict_faq_title_placeholder( $title, $post ) {
	if ( isset( $post->post_type ) && 'sa_faq' === $post->post_type ) {
		return 'Enter FAQ Question here...';
	}
	return $title;
}
add_filter( 'enter_title_here', 'style_addict_faq_title_placeholder', 10, 2 );

/**
 * Show "Order" column in Admin -> FAQs list table.
 */
function style_addict_faq_admin_columns( $columns ) {
	$columns['menu_order'] = 'Order';
	return $columns;
}
add_filter( 'manage_sa_faq_posts_columns', 'style_addict_faq_admin_columns' );

function style_addict_faq_admin_column_content( $column, $post_id ) {
	if ( 'menu_order' === $column ) {
		echo (int) get_post_field( 'menu_order', $post_id );
	}
}
add_action( 'manage_sa_faq_posts_custom_column', 'style_addict_faq_admin_column_content', 10, 2 );

/**
 * Auto-create the /faq/ page, seed starter FAQ items, and add FAQ link to the main navbar.
 */
function style_addict_setup_faq_page_and_menu() {
	if ( get_option( 'style_addict_faq_v1_setup' ) ) {
		return;
	}

	// 1. Ensure FAQ page exists
	$faq_page    = get_page_by_path( 'faq' );
	$faq_page_id = $faq_page ? $faq_page->ID : 0;

	if ( ! $faq_page_id ) {
		$created_id = wp_insert_post( [
			'post_title'     => 'FAQ',
			'post_name'      => 'faq',
			'post_content'   => '[sa_faq_accordion]',
			'post_status'    => 'publish',
			'post_type'      => 'page',
			'comment_status' => 'closed',
			'ping_status'    => 'closed',
		] );
		if ( $created_id && ! is_wp_error( $created_id ) ) {
			$faq_page_id = (int) $created_id;
		}
	}

	// 2. Seed starter FAQs if none exist yet
	$existing_faqs = get_posts( [
		'post_type'      => 'sa_faq',
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
	] );

	if ( empty( $existing_faqs ) ) {
		$starter_faqs = [
			[
				'title'   => 'How long does it take to dispatch and deliver my order?',
				'content' => '<p>Orders are dispatched within <strong>2&ndash;3 working days</strong> after order confirmation. Delivery across India typically takes 3&ndash;7 business days depending on your PIN code. You will receive tracking details via email, SMS, or WhatsApp once dispatched.</p>',
				'order'   => 1,
			],
			[
				'title'   => 'What are the shipping and Cash on Delivery (COD) charges?',
				'content' => '<ul><li><strong>Free Shipping:</strong> Complimentary shipping on all orders above &#8377;499.</li><li><strong>Standard Shipping:</strong> &#8377;49 delivery charge on orders below &#8377;499.</li><li><strong>Cash on Delivery (COD):</strong> Available across serviceable PIN codes at an additional charge of &#8377;99.</li></ul>',
				'order'   => 2,
			],
			[
				'title'   => 'What is your Return and Exchange policy?',
				'content' => '<p>Products are eligible for <strong>return within 3 days</strong> of delivery and <strong>exchange within 7 days</strong> of delivery.</p><p>All returned or exchanged items must be unused, in their original condition, with original tags and packaging intact.</p>',
				'order'   => 3,
			],
			[
				'title'   => 'How do I request a return, exchange, or report a damaged parcel?',
				'content' => '<p>Please email our customer care concierge at <a href="mailto:styleaddictjewelleryy@gmail.com">styleaddictjewelleryy@gmail.com</a> or call <a href="tel:+919830836837">+91 98308 36837</a> (9 AM &ndash; 6 PM) with your Order ID, reason for return/exchange, and an unedited unboxing video or clear photos if reporting transit damage.</p>',
				'order'   => 4,
			],
			[
				'title'   => 'How should I care for my handcrafted gold-plated & Kundan jewellery?',
				'content' => '<p>Our pieces are crafted with premium gold plating and anti-tarnish finishes. Avoid direct contact with perfume, water, hairspray, and harsh chemicals. Gently wipe with a soft dry cloth after every wear and store individually in a jewellery box or pouch.</p>',
				'order'   => 5,
			],
			[
				'title'   => 'Are online payments safe and encrypted on Style Addict Jewellery?',
				'content' => '<p>Yes. Every online payment via UPI, Credit/Debit Card, or NetBanking is protected with 256-bit SSL encryption and processed through RBI-authorized, PCI-DSS compliant payment gateways.</p>',
				'order'   => 6,
			],
		];

		foreach ( $starter_faqs as $item ) {
			wp_insert_post( [
				'post_title'     => $item['title'],
				'post_content'   => $item['content'],
				'post_status'    => 'publish',
				'post_type'      => 'sa_faq',
				'menu_order'     => $item['order'],
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			] );
		}
	}

	// 3. Add FAQ link to main WordPress navigation menu(s) containing Shop / Contact
	if ( $faq_page_id ) {
		$menus = wp_get_nav_menus();
		if ( ! empty( $menus ) && ! is_wp_error( $menus ) ) {
			foreach ( $menus as $menu ) {
				$items    = wp_get_nav_menu_items( $menu->term_id );
				$has_faq  = false;
				$is_main  = false;

				if ( is_array( $items ) ) {
					foreach ( $items as $item ) {
						$url = isset( $item->url ) ? untrailingslashit( $item->url ) : '';
						if ( (int) $item->object_id === $faq_page_id || preg_match( '#/faq$#i', $url ) || 0 === strcasecmp( trim( $item->title ), 'FAQ' ) ) {
							$has_faq = true;
						}
						if ( preg_match( '#/(shop|contact|contact-us)$#i', $url ) ) {
							$is_main = true;
						}
					}
				}

				if ( $is_main && ! $has_faq ) {
					wp_update_nav_menu_item( $menu->term_id, 0, [
						'menu-item-title'     => 'FAQ',
						'menu-item-object'    => 'page',
						'menu-item-object-id' => $faq_page_id,
						'menu-item-type'      => 'post_type',
						'menu-item-status'    => 'publish',
					] );
				}
			}
		}
	}

	update_option( 'style_addict_faq_v1_setup', 1 );
}
add_action( 'init', 'style_addict_setup_faq_page_and_menu', 25 );

/**
 * Render Interactive Luxury FAQ Accordion via [sa_faq_accordion] shortcode.
 */
function style_addict_faq_accordion_shortcode() {
	$faqs = get_posts( [
		'post_type'      => 'sa_faq',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => [
			'menu_order' => 'ASC',
			'date'       => 'ASC',
		],
	] );

	ob_start();
	?>
	<div id="sa-faq-page-wrapper" class="sa-faq-page-wrapper">
		<div class="sa-faq-header">
			<div class="sa-policy-badge">
				<span class="sa-sparkle">&#10022;</span> CUSTOMER CARE &amp; HELP CENTER <span class="sa-sparkle">&#10022;</span>
			</div>
			<h1 class="sa-faq-main-title">Frequently Asked Questions</h1>
			<p class="sa-faq-subtitle">Everything you need to know about orders, insured delivery, handcrafted care, returns, and exchanges.</p>
			<div class="sa-policy-divider">
				<span class="sa-divider-line"></span>
				<span class="sa-divider-gem">&#9830;</span>
				<span class="sa-divider-line"></span>
			</div>
		</div>

		<?php if ( ! empty( $faqs ) ) : ?>
			<div class="sa-faq-accordion-list">
				<?php foreach ( $faqs as $index => $faq ) :
					$is_first    = ( 0 === $index );
					$answer_html = wpautop( wp_kses_post( do_shortcode( $faq->post_content ) ) );
				?>
					<div class="sa-faq-item<?php echo $is_first ? ' sa-faq-active' : ''; ?>">
						<button type="button" class="sa-faq-question" aria-expanded="<?php echo $is_first ? 'true' : 'false'; ?>">
							<span class="sa-faq-q-text"><?php echo esc_html( get_the_title( $faq->ID ) ); ?></span>
							<span class="sa-faq-icon" aria-hidden="true"><?php echo $is_first ? '&minus;' : '+'; ?></span>
						</button>
						<div class="sa-faq-answer" style="display: <?php echo $is_first ? 'block' : 'none'; ?>;">
							<div class="sa-faq-answer-inner">
								<?php echo $answer_html; ?>
							</div>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		<?php else : ?>
			<div class="sa-faq-empty">
				<p>Questions and answers will be updated shortly. Please check back soon or reach out to our concierge team below.</p>
			</div>
		<?php endif; ?>

		<div class="sa-policy-support-card sa-faq-support-card">
			<div class="sa-support-icon">&#128142;</div>
			<div class="sa-support-body">
				<h4>Still Have a Question?</h4>
				<p>Our dedicated customer concierge team is always delighted to help with orders, styling advice, or policy inquiries.</p>
				<div class="sa-support-links">
					<a href="mailto:styleaddictjewelleryy@gmail.com" class="sa-support-btn sa-support-btn--email">
						<span>&#9993;</span> styleaddictjewelleryy@gmail.com
					</a>
					<a href="tel:+919830836837" class="sa-support-btn sa-support-btn--phone">
						<span>&#9742;</span> +91 98308 36837 (9 AM &ndash; 6 PM)
					</a>
				</div>
			</div>
		</div>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'sa_faq_accordion', 'style_addict_faq_accordion_shortcode' );



