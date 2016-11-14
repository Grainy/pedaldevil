<?php

	if (!class_exists('Timber')){
		echo 'Timber not activated. Make sure you activate the plugin in <a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
		return;
	}

	$context = Timber::get_context();
	$post = new TimberPost();

	$postargs = array(
	    'post_type' => 'post',
	    'posts_per_page' => 3
	);

	$context['post'] = $post;
	$context['posts'] = Timber::get_posts($postargs);

	$templates = array('page-templates/front.twig');
	Timber::render($templates, $context);