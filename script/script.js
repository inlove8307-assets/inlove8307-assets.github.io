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
      var style = document.createElement('style');

      style.textContent = '\
      .anchors {position:absolute;top:50%;left:50%;z-index:10;transform:translate(-50%, -50%);}\
      .anchor {display:inline-flex;justify-content:center;align-items:center;margin-bottom:4px;margin-right:4px;padding:0 4px;height:20px;border-radius:5px;background-color:rgba(255, 255, 255, 0.5);font-size:14px;line-height:1;color:rgb(0, 0, 0)!important;}\
      .anchor:hover {background-color:rgb(255, 255, 255, 1);}';

      document.querySelector('body').appendChild(style);

      document.addEventListener('mouseover', function(event){
        var parent, anchors, url;

        if (event.target.tagName == 'A' && event.target.classList.contains('overlay')) {
          parent = event.target.parentNode;

          if (parent.dataset.fetch) return;

          anchors = document.createElement('span');
          anchors.setAttribute('class', 'anchors');
          parent.appendChild(anchors);
          url = [location.origin, event.target.href.match(/\/photos\/[\w-_@]+\/[\d]+\//g)[0], 'sizes/'].join('');

          requestData([url].join(''), 'text', function(text){
            var array = text.match(/\/photos\/[\w-_@]+\/[\d]+\/sizes\/[\w]+\//g)
              , sizes = text.match(/\([\d]+ &times; [\d]+\)/g)
              , anchor;

            while(array.length){
              if (array[0].match(/\/o\//g) || !array[1]) {
                anchor = document.createElement('a');
                anchor.setAttribute('class', 'anchor');
                anchor.setAttribute('href', array[0]);
                anchor.setAttribute('target', '_blank');
                anchor.innerHTML = sizes[0];
                anchors.appendChild(anchor);
              }

              array.shift();
              sizes.shift();
            }
          });

          parent.dataset.fetch = true;
        }
      });

      document.addEventListener('click', function(event){
        if (event.target.classList.contains('anchor')) {
          requestData(event.target.getAttribute('href'), 'text', function(text){
            var array = text.match(/live.staticflickr.com\/[\d]+\/[\w-_@]+\.[\D]{3}/g)
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