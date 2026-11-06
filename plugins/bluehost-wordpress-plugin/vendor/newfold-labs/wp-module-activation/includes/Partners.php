<?php
/**
 * Partners.
 *
 * @package NewfoldLabs\WP\Module\Activation
 */

namespace NewfoldLabs\WP\Module\Activation;

use NewfoldLabs\WP\ModuleLoader\Container;
use NewfoldLabs\WP\Module\Activation\Partners\CreativeMail;
use NewfoldLabs\WP\Module\Activation\Partners\MonsterInsights;
use NewfoldLabs\WP\Module\Activation\Partners\OptinMonster;
use NewfoldLabs\WP\Module\Activation\Partners\WpForms;

/**
 * Partner class.
 */
class Partners {

	/**
	 * Dependency injection container.
	 *
	 * @var Container
	 */
	protected $container;

	/**
	 * Constructor.
	 *
	 * @param Container $container The plugin container.
	 */
	public function __construct( Container $container ) {
		$this->container = $container;

		$is_fresh_install = $container->has( 'isFreshInstallation' ) ? $container->get( 'isFreshInstallation' ) : false;
		if ( $is_fresh_install ) {
			update_option( 'nfd_module_activation_fresh_install', true );
		} else {
			update_option( 'nfd_module_activation_fresh_install', false );
		}

		$creative_mail    = new CreativeMail();
		$optin_monster    = new OptinMonster();
		$wp_forms         = new WpForms();
		$monster_insights = new MonsterInsights();

		$creative_mail->init();
		$optin_monster->init();
		$wp_forms->init();
		$monster_insights->init();
	}
}
