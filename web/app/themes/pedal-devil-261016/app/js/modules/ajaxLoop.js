var ajaxLoop = (function($) {
	var self = this;

	var init = function() {
		_bind();
	};

	$.fn.capitalise = function() {
	    return this.each(function() {
	        var $this = $(this),
	            text = $this.text(),
	            tokens = text.split(" ").filter(function(t) {return t !== ""; }),
	            res = [],
	            i,
	            len,
	            component;
	        for (i = 0, len = tokens.length; i < len; i++) {
	            component = tokens[i];
	            res.push(component.substring(0, 1).toUpperCase());
	            res.push(component.substring(1));
	            res.push(" "); // put space back in
	        }
	        $this.text(res.join(""));
	    });
	};

	var pagination = function(page, maxPages) {
		$('.l-archive__row').append('<div class="col-md-12 page-counter"><p>Page ' + page + ' of ' + maxPages+ '</p></div>');
	};

	var getUrlParameter = function getUrlParameter(sParam) {
	    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	        sURLVariables = sPageURL.split('&'),
	        sParameterName,
	        i;

	    for (i = 0; i < sURLVariables.length; i++) {
	        sParameterName = sURLVariables[i].split('=');

	        if (sParameterName[0] === sParam) {
	            return sParameterName[1] === undefined ? true : sParameterName[1];
	        }
	    }
	};

	var _bind = function() {
		var posts_per_page = 3; // How many posts to show at once
		var page = 1; 			// Current page
		var loading = false;	// Is a request being made?
		var filter = null; 		// Filter posts by (default : null)
		var category = 'Latest Posts';
		var maxPages; 			// Amount of pages in archive
		var url; 				// URL to pass to ajax request
		var date; 				// Date of creation
		var initialLoad = true;

		if (getUrlParameter('filter')) {
			filter = getUrlParameter('filter');
			category = filter.replace(/\-/g, " ");
		} else {
			filter = null;
		}

		var load_posts = function(filter, category){
			if (loading === false) {
				loading = true;

				var tempScrollTop = $(window).scrollTop();
				tempScrollTop = tempScrollTop + 100;

				if (page === 1) {
					posts_per_page = 4;
				} else {
					posts_per_page = 3;	
				}

				if (filter) {
					url = '/wp-json/posts?type=post&filter[category_name]='+ filter +'&filter[posts_per_page]='+posts_per_page+'&page='+page;
				} else {
					url = '/wp-json/posts?type=post&filter[posts_per_page]='+posts_per_page+'&page='+page;
				}

				$.ajax( {
					type       : 'GET',
					url  	   : url,
					dataType   : 'json',

					beforeSend: function() {
						// Show loading gif
						$('.loading').show();
					},

					success: function ( data, textStatus, request ) {
						// Get amount of posts and divide by how many posts per page
						if (initialLoad) {
							maxPages = request.getResponseHeader('X-WP-Total') / (posts_per_page-1);
						} else {
							maxPages = request.getResponseHeader('X-WP-Total') / posts_per_page;
						}

						var maxPagesRound = Math.ceil(maxPages);

						// Hide loading gif
						$('.loading').hide();

						// Get amount of posts and divide by how many posts per page
						for (var i = 0; i < data.length; i++) {
							// Get first 20 words of content
							var excerpt = data[i].content.replace(/<\/?[^>]+>/gi, '');
								excerpt = excerpt.split(' ').slice(0,20).join(' ');

							// Format date
							date = moment(data[i].date).fromNow();

							var postThumb;
							var match = data[i].content.match(/<img[^>]+>/);

							if (data[i].thumb_url !== 'http://staging.bikedevil.net/wp/wp-includes/images/media/default.png') {

								postThumb = data[i].thumb_url;
							} else if (match !== null) {
							    var matchedText = match[0];
							    postThumb = $(match[0]).attr('src');
							} else {
								postThumb = Directory.url+'/app/img/logo/default.png';
							}

							if (i === 0 && initialLoad) {
								$('.l-archive__row').before('<h2 class="col-md-6 l-archive__title"><a href="/news">'+ category +'</a></h2>'
								);

								$('.l-archive__row').prepend(										
									'<div class="col-sm-12 l-archive__post l-archive__post--featured l-archive__post--'+i+'">'+
										'<a href="'+ data[i].link +'" class="l-archive__post--thumb-container" style="background-image: url('+postThumb+')">'+
										'</a>'+
										'<div class="l-archive__post--container">'+
											'<h3 class="l-archive__post--title"><a href="'+ data[i].link +'">'+ data[i].title +'</a></h3>'+
											'<p class="l-archive__post--meta">from '+ data[i].author.name + " | " + date +'</p>'+
											'<p class="l-archive__post--excerpt">'+ excerpt +'</p>'+
											'<a href="'+ data[i].link +'" class="b-button">Read More</a>'+
										'</div>'+
									'</div>'
								);
							} else {
								$('.l-archive__row').append(
									'<div class="col-sm-4 l-archive__post l-archive__post--'+i+' js-match-height">'+
										'<a href="'+ data[i].link +'" class="l-archive__post--thumb-container" style="background-image: url('+postThumb+')">'+
										'</a>'+
										'<div class="l-archive__post--container">'+
											'<h3 class="l-archive__post--title"><a href="'+ data[i].link +'">'+ data[i].title +'</a></h3>'+
											'<p class="l-archive__post--meta">from '+ data[i].author.name +
											'<p class="l-archive__post--date">'+ date +
											'<p class="l-archive__post--excerpt">'+ excerpt +'</p>'+
										'</div>'+
									'</div>'
								);
							}

							$('.l-archive__post--'+i).fadeIn(500);
						}

						$('.l-archive__title').capitalise();
						$('.js-match-height').matchHeight();
						var windowHeight = $(window).height();
						windowHeight = windowHeight - 100;

						pagination(page, maxPagesRound);

						$(window).scrollTop(tempScrollTop);

						initialLoad = false;
						page++;          // Increment page
						loading = false; // Request finished
					},

					error     : function(jqXHR, textStatus, errorThrown) {
						// Hide loading gif
						$('.loading').hide();

					},
				});
			}
		};

		$('.js-archive-filter').on('change.fs', function () {
		    var thisCat = this.value;
		    var thisText = $('.trigger').text();
		    var category;

		    // If all, show all posts
		    if (thisCat === 'all') {
		    	filter = null;
		    	category = 'Latest News';
		    } else {
		    	filter = thisCat;
		    	category = thisText;
		    }

		    $('.l-archive__title').remove();
		    $('.l-archive__row').empty();

		    //Reset pagination
		    page = 1;
		    initialLoad = true;
		    load_posts(filter, category);
		});

		if (is_archive && is_news === true) {
			$(window).scroll(function() {
				if(page <= maxPages && $(window).scrollTop() + $(window).height() == $(document).height() && is_device === null) {
					load_posts(filter);
				}
			});
		}

		$('.js-load-more').on('click', function(event) {
			event.preventDefault();

			if(page <= maxPages) {
				load_posts(filter);
			}
		});


		load_posts(filter, category);
	};

	return {
		init: init
	};

})(jQuery);

