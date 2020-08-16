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

  function downloadImage(blob, url){
    var reader = new FileReader();

    reader.readAsDataURL(blob);
    reader.onloadend = function(){
      var anchor = document.createElement('a');

      url = url.split('/');
      anchor.setAttribute('href', reader.result);
      anchor.setAttribute('download', url[url.length-1]);
      anchor.click();
    }
  }

  function flickr(){
    var regexp = [/\/photos\/[\w-_@]+\/[\d]+\//g, /\/photos\/[\w-_@]+\/[\d]+\/sizes\/[\w]+\//g, /\([\d]+ &times; [\d]+\)/g, /live.staticflickr.com\/[\d]+\/[\w-_@]+\.[\D]{3}/g]
      , style = document.createElement('style');

    style.textContent = '\
    .anchor {position:absolute;top:4px;left:4px;z-index:10;padding:2px 4px;border:1px solid rgba(0, 0, 0, 0.5);border-radius:5px;background-color:rgba(255, 255, 255, 0.5);font-size:13px;line-height:1;color:rgb(0, 0, 0)!important;}\
    .anchor:hover {background-color:rgb(255, 255, 255, 1);}';

    document.querySelector('body').appendChild(style);
    document.addEventListener('mouseover', function(event){
      var target = event.target
        , parent = target.parentNode;

      if (target.tagName == 'A' && target.classList.contains('overlay') && !parent.dataset.fetch) {
        requestData([location.origin, target.href.match(regexp[0])[0], 'sizes/'].join(''), 'text', function(text){
          var array = [text.match(regexp[1]), text.match(regexp[2])]
            , link = array[0][0].match(/\/o\//g) ? array[0][0] : array[0][array[0].length-1]
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
            downloadImage(blob, url);
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
            downloadImage(blob, url);
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