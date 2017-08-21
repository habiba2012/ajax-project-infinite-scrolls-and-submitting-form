var pageCount = 1;

function getAJAX(url, containerID, callback, targetID) {
  if(targetID) {
    url = url + ' #' + targetID;
    $('#' + containerID).load(url);
  } else {
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      beforeSend: function() {
        $("#" + containerID).append('<span id="loading">Loading...</span>');
      },      
      success: function(data) {
        console.log("success");
        $("#loading").remove();
        callback(data);
      },
      error: function(xhr, textStatus, errorThrown) {
        console.log("There was an error");
        console.log(xhr);
        $("#" + containerID).html('<p class="error">Oops there was an error: ' + xhr.statusText + '</p>');
      }
    }); 
  };
};

function evalMovieQuery(formData) {
  if(formData) {
    var query = 'http://www.omdbapi.com/?';
    // evaluate submitted title
    var title = $('#movieTitle').val();
    console.log(title);
    if(title && title.length > 3) {
      title = "s=" + title;
    } else {
      return false;
    }
    // evaluate optional submitted year
    var year = $('#movieYear').val();
    if(year) year = "\&y=" + year; 
    // build and return query string
    var page = "\&page=" + pageCount;
    var type = "\&r=" + "json";
    query += title + year + type + page;
    console.log(query);
    return query;
  } else {
    return false;
  }
}

function getMovies(json) {
  $.each(json.Search, function(index, val) {
    var entry = $("<li class='movie clearfix'></li>");
    entry.append('<span id="loading' + index + '">Loading...</span>');

    $.ajax({
      url: 'http://www.omdbapi.com/?i=' + val.imdbID + "\&plot=short\&r=json",
      type: 'GET',
      dataType: 'json',
      beforeSend: function() {
        $("#target").append(entry);
      },
      success: function(json) {
        console.log(json);
        entry.empty();
        // $("#loading" + index).remove();
        displayMovie(json, entry);
      },
      error: function(xhr, error, status) {
        console.log(status);
        console.log(error);
      }
    });
  });
}

function displayMovie(movie, entry) {
  console.log(movie.Poster);
  if(movie.Poster && movie.Poster != 'N/A') {
    entry.append("<img class='poster' src='" + movie.Poster + "'>");
  } else  {
    entry.append("<div class='filler'></div>")
  };
  entry.append("<h3>" + movie.Title + "</h3>");
  var popularity;
  if(movie.imdbRating < 4) {
    popularity = 'unpopular';
  } else if (movie.imdbRating >= 4 && movie.imdbRating < 8) {
    popularity = 'ok';
  } else {
    popularity = 'popular';
  }
  entry.append("<p class='movie-year'>Year: " + movie.Year + " | " + "Rating: " + "<span class='" + popularity + "'>" + movie.imdbRating + "</span>" + "</p>");
  entry.append("<h4>Plot Summary</h4>");
  entry.append("<p class='plot'>" + movie.Plot + "</p>");
  entry.append("<h4>Awards</h4>");
  entry.append("<p class='awards'>" + movie.Awards + "</p>");
}

function listen() {
  var form = $("#movieChooser");

  $('body').on('click', '#loadMovies', function(event) {
    event.preventDefault();
    $("#target").empty();
    var query = evalMovieQuery(form);
    if(query) {
      getAJAX(query, 'target', getMovies);
    } else {
      $("#target").append("Please type a valid title (3+ characters).").show();
    }
    $('.year').hide();
    return false;
  });

  $(document).on('scroll', function(event) {  
    var viewportHeight = $(window).height();
    var docHeight = $(document).height();
    var position = $(document).scrollTop();
    if(position >= docHeight - viewportHeight - 700) {
      console.log("Loading more results...");
      pageCount +=1;
      var query = evalMovieQuery(form);
      if(query) {
        getAJAX(query, 'target', getMovies);
      } else {
        $("#target").append("Please type a valid title (3+ characters).").show();
      }
    }
  });

  $(document).on('keyup', '#movieTitle', function(event) {
    $('.year').fadeIn();
  });
}

$(document).ready(function() {
  listen();
});