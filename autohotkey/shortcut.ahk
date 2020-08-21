#NoEnv
SetBatchLines, -1

#Include, %A_LineFile%\..\Chrome.ahk\Chrome.ahk

JS =
(
  (function(){
    function requestData(url, type, callback){
      return fetch(url)
      .then(function(response){
        if(response.ok){
          switch(type){
            case 'text': return response.text();
            case 'blob': return response.blob();
            default: return response;
          }
        }
      })
      .then(function(response){
        callback(response);
      });
    }

    function parseHtml(string, callback){
      var parser = new DOMParser()
        , html = parser.parseFromString(string, 'text/html');

      callback(html);
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
      var style = document.createElement('style');

      style.textContent += '.anchor {position:absolute;top:4px;left:4px;z-index:10;padding:2px 4px;border:1px solid rgba(0, 0, 0, 0.5);border-radius:5px;background-color:rgba(255, 255, 255, 0.5);font-size:13px;line-height:1;color:rgb(0, 0, 0)!important;}';
      style.textContent += '.anchor:hover {background-color:rgb(255, 255, 255, 1);}';
      document.querySelector('body').appendChild(style);

      document.addEventListener('mouseover', function(event){
        var target = event.target
          , parent = target.parentNode
          , url;

        if(target.tagName == 'A' && target.classList.contains('overlay') && !parent.dataset.fetch){
          url = [location.origin, target.href.match(/\/photos\/[\w-_@]+\/[\d]+\//g)[0], 'sizes/sq/'].join('');

          requestData(url, 'text', function(text){
            var links = text.match(/\/photos\/[\w-_@]+\/[\d]+\/sizes\/[\w]+\//g)
              , sizes = text.match(/\([\d]+ &times; [\d]+\)/g)
              , hasOrigin = links[0].match(/\/o\//g)
              , anchor = document.createElement('a');

            anchor.setAttribute('class', 'anchor');
            anchor.setAttribute('href', hasOrigin ? links[0] : links[links.length-1]);
            anchor.innerHTML = hasOrigin ? sizes[0] : sizes[sizes.length-1];
            parent.appendChild(anchor);
          });

          parent.dataset.fetch = true;
        }
      });

      document.addEventListener('click', function(event){
        if(event.target.classList.contains('anchor')){
          requestData(event.target.getAttribute('href'), 'text', function(text){
            var url = text.match(/src="https:\/\/live.staticflickr.com\/[\d]+\/[\w]+\.[\D]{3}"/g)[0].split(/"/)[1];

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
        if(event.target.classList.contains('preview')){
          requestData(event.target.href, 'text', function(text){
            var url = text.match(/https:\/\/w.wallhaven.cc\/full\/[\w]+\/wallhaven-[\w]+\.[\D]{3}/g)[0];

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
  }());
)
return

#c::
Run, %A_ProgramFiles% (x86)\Google\Chrome\Application\chrome.exe "--remote-debugging-port=9222"
return

#f::
if WinExist("ahk_exe Chrome.exe")
{
  Page := Chrome.GetPage()
  Page.Call("Page.navigate", {"url": "https://flickr.com/"})
  Page.Disconnect()
}
return

#d::
if WinExist("ahk_exe Chrome.exe")
{
  Page := Chrome.GetPage()
  Page.Evaluate(JS)
  Page.Disconnect()
}
return