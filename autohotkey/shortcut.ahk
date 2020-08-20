#NoEnv
SetBatchLines, -1

js =
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

^+s:: RunJsFromChromeAddressBar(js)

RunJsFromChromeAddressBar(js, exe := "chrome.exe") {
  static WM_GETOBJECT := 0x3D
    , ROLE_SYSTEM_TEXT := 0x2A
    , STATE_SYSTEM_FOCUSABLE := 0x100000
    , SELFLAG_TAKEFOCUS := 0x1
  if !AccAddrBar {
    window := "ahk_class Chrome_WidgetWin_1 ahk_exe " . exe
    SendMessage, WM_GETOBJECT, 0, 1, Chrome_RenderWidgetHostHWND1, % window
    AccChrome := AccObjectFromWindow( WinExist(window) )
    AccAddrBar := SearchElement(AccChrome, {Role: ROLE_SYSTEM_TEXT, State: STATE_SYSTEM_FOCUSABLE})
  }
  AccAddrBar.accValue(0) := "javascript:" . js
  AccAddrBar.accSelect(SELFLAG_TAKEFOCUS, 0)
  ControlSend,, {Enter}, % window, Chrome Legacy Window
}

SearchElement(parentElement, params)
{
  found := true
  for k, v in params {
    try {
      if (k = "ChildCount")
        (parentElement.accChildCount != v && found := false)
      else if (k = "State")
        (!(parentElement.accState(0) & v) && found := false)
      else
        (parentElement["acc" . k](0) != v && found := false)
    }
    catch
      found := false
  } until !found
  if found
    Return parentElement

  for k, v in AccChildren(parentElement)
    if obj := SearchElement(v, params)
      Return obj
}

AccObjectFromWindow(hWnd, idObject = 0) {
  static IID_IDispatch   := "{00020400-0000-0000-C000-000000000046}"
    , IID_IAccessible := "{618736E0-3C3D-11CF-810C-00AA00389B71}"
    , OBJID_NATIVEOM  := 0xFFFFFFF0, VT_DISPATCH := 9, F_OWNVALUE := 1
    , h := DllCall("LoadLibrary", "Str", "oleacc", "Ptr")

  VarSetCapacity(IID, 16), idObject &= 0xFFFFFFFF
  DllCall("ole32\CLSIDFromString", "Str", idObject = OBJID_NATIVEOM ? IID_IDispatch : IID_IAccessible, "Ptr", &IID)
  if DllCall("oleacc\AccessibleObjectFromWindow", "Ptr", hWnd, "UInt", idObject, "Ptr", &IID, "PtrP", pAcc) = 0
    Return ComObject(VT_DISPATCH, pAcc, F_OWNVALUE)
}

AccChildren(Acc) {
  static VT_DISPATCH := 9
  Loop 1  {
    if ComObjType(Acc, "Name") != "IAccessible"  {
      error := "Invalid IAccessible Object"
      break
    }
    try cChildren := Acc.accChildCount
    catch
      Return ""
    Children := []
    VarSetCapacity(varChildren, cChildren*(8 + A_PtrSize*2), 0)
    res := DllCall("oleacc\AccessibleChildren", "Ptr", ComObjValue(Acc), "Int", 0, "Int", cChildren, "Ptr", &varChildren, "IntP", cChildren)
    if (res != 0) {
      error := "AccessibleChildren DllCall Failed"
      break
    }
    Loop % cChildren  {
      i := (A_Index - 1)*(A_PtrSize*2 + 8)
      child := NumGet(varChildren, i + 8)
      Children.Push( (b := NumGet(varChildren, i) = VT_DISPATCH) ? AccQuery(child) : child )
      ( b && ObjRelease(child) )
    }
  }
  if error
    ErrorLevel := error
  else
    Return Children.MaxIndex() ? Children : ""
}

AccQuery(Acc) {
  static IAccessible := "{618736e0-3c3d-11cf-810c-00aa00389b71}", VT_DISPATCH := 9, F_OWNVALUE := 1
  try Return ComObject(VT_DISPATCH, ComObjQuery(Acc, IAccessible), F_OWNVALUE)
}