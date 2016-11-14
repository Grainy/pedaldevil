<?php
	/*
	Template Name: Claims Care
	*/

	if (!class_exists('Timber')){
		echo 'Timber not activated. Make sure you activate the plugin in <a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
		return;
	}

	$context = Timber::get_context();
	$post = new TimberPost();

	$context['args'] = array (
		'container'       => 'nav',
		'before'          => '',
		'after'           => '',
		'show_on_front'   => true,
		'network'         => false,
		'show_title'      => true,
		'show_browse'     => false,
		'echo'            => true
	);

	$context['post'] = $post;

	$templates = array('page-claims-care.twig');
	Timber::render($templates, $context);
