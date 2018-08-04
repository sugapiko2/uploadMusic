console.log('program.js');
var $ = require('jQuery');
$(function($){
	var apiKey = 'AIzaSyDRDoGU_2jQ-HG1gPK-PSpeR4zmG2upqA8';
	function getResult(e){
		$.getJSON(
				'https://www.googleapis.com/youtube/v3/search?',
				{
					key: apiKey,
					'q': $('#keyword').val(),
					part: 'snippet',
					maxResults: 20,
					type: 'video',
				}
		)
		.done(function(data){
			console.log('called test');
			$('#result').empty();
			$.each(data.items, function(){
				$('#result').append(
					$('<a></a>')
						.attr({
							href: 'https://www.youtube.com/watch?v=' + this.id.videoId,
							target: 'blank'
						})
						.append(
							$('<img>')
							.addClass('thumbnail')
							.attr({
								src: this.snippet.thumbnails.medium.url,
								title: this.snippet.title
							})
						)
					)
				this.id.videoId;
			})
		})

	};
	$('#send').click(getResult);
});


