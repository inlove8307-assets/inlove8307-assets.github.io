javascript: window.load = function(){
  function requestData(url, type, callback){
    return fetch(url)
    .then(function(response){
      if (response.ok) {
        switch(type){
          case 'text': return response.text();
          case 'blob': return response.blob();
        }
      }
    })
    .then(function(response){
      callback(response);
    });
  }

  function flickr(){
    var regexp = [/\/photos\/[\w-_@]+\/[\d]+\//g, /\/photos\/[\w-_@]+\/[\d]+\/sizes\/[\w]+\//g, /\([\d]+ &times; [\d]+\)/g, /live.staticflickr.com\/[\d]+\/[\w-_@]+\.[\D]{3}/g]
      , style = document.createElement('style');

    style.textContent = '\
    .anchor {display:inline-flex;justify-content:center;align-items:center;position:absolute;top:4px;left:4px;z-index:10;padding:0 4px;height:20px;border:1px solid rgba(0, 0, 0, 0.5);border-radius:5px;background-color:rgba(255, 255, 255, 0.5);font-size:13px;line-height:1;color:rgb(0, 0, 0)!important;text-decoration:none;}\
    .anchor:hover {background-color:rgb(255, 255, 255, 1);}';

    document.querySelector('body').appendChild(style);
    document.addEventListener('mouseover', function(event){
      var target = event.target
        , parent = target.parentNode;

      if (target.tagName == 'A' && target.classList.contains('overlay') && !parent.dataset.fetch) {
        requestData([location.origin, target.href.match(regexp[0])[0], 'sizes/'].join(''), 'text', function(text){
          var array = [text.match(regexp[1]), text.match(regexp[2])]
            , link = array[0][0].match(/\/o\//g) || array[0][array[0].length-1]
            , size = array[0][0].match(/\/o\//g) ? array[1][0] : array[1][array[1].length-1]
            , anchor;

          anchor = document.createElement('a');
          anchor.setAttribute('class', 'anchor');
          anchor.setAttribute('href', link);
          anchor.setAttribute('target', '_blank');
          anchor.innerHTML = size;
          parent.appendChild(anchor);
        });

        parent.dataset.fetch = true;
      }
    });

    document.addEventListener('click', function(event){
      if (event.target.classList.contains('anchor')) {
        requestData(event.target.getAttribute('href'), 'text', function(text){
          var array = text.match(regexp[3])
            , url = ['https://', array[array.length-1]].join('');

          requestData(url, 'blob', function(blob){
            var reader = new FileReader();

            reader.readAsDataURL(blob);
            reader.onloadend = function(){
              var anchor = document.createElement('a');

              url = url.split('/');
              anchor.setAttribute('href', reader.result);
              anchor.setAttribute('download', url[url.length-1]);
              anchor.click();
            }
          });
        });

        event.preventDefault();
      }
    });
  }

  function wallhaven(){
    document.addEventListener('click', function(event){
      if (event.target.classList.contains('preview')) {
        requestData(event.target.href, 'text', function(text){
          var array = text.match(/https:\/\/w.wallhaven.cc\/full\/[\w]+\/wallhaven-[\w]+\.[\D]{3}/g);
          var url = array[0];

          requestData(url, 'blob', function(blob){
            var reader = new FileReader();

            reader.readAsDataURL(blob);
            reader.onloadend = function(){
              var anchor = document.createElement('a');

              url = url.split('/');
              anchor.setAttribute('href', reader.result);
              anchor.setAttribute('download', url[url.length-1]);
              anchor.click();
            }
          });
        });

        event.preventDefault();
      }
    });
  }

  switch(location.host){
    case 'www.flickr.com': flickr(); break;
    case 'wallhaven.cc': wallhaven(); break;
  }
}();


/*
/photos/134104188@N07/50212337213/sizes/sq/(75 × 75)
/photos/134104188@N07/50212337213/sizes/q/(150 × 150)
/photos/134104188@N07/50212337213/sizes/t/(100 × 67)
/photos/134104188@N07/50212337213/sizes/s/(240 × 160)
/photos/134104188@N07/50212337213/sizes/n/(320 × 213)
/photos/134104188@N07/50212337213/sizes/w/(400 × 267)
/photos/134104188@N07/50212337213/sizes/m/(500 × 334)
/photos/134104188@N07/50212337213/sizes/z/(640 × 427)
/photos/134104188@N07/50212337213/sizes/c/(800 × 534)
/photos/134104188@N07/50212337213/sizes/h/(1024 × 683)
/photos/134104188@N07/50212337213/sizes/k/(1600 × 1067)
/photos/134104188@N07/50212337213/sizes/3k/(2048 × 1366)
/photos/134104188@N07/50212337213/sizes/4k/(3072 × 2049)
/photos/134104188@N07/50212337213/sizes/5k/(4096 × 2732)
/photos/134104188@N07/50212337213/sizes/6k/(5120 × 3415)
(6144 × 4098)



*/