if(!window._prewave_cookie){window._prewave_cookie={enable:[],disable:[],}}(function(){window.addEventListener('prewave.cookie.accept',function(e){var _prewave_cookie=window._prewave_cookie=window._prewave_cookie||{enable:[],disable:[]};_prewave_cookie.enable.forEach(function(enable){enable()})},!1);window.addEventListener('prewave.cookie.deny',function(e){var _prewave_cookie=window._prewave_cookie=window._prewave_cookie||{enable:[],disable:[]};_prewave_cookie.disable.forEach(function(disable){disable()})},!1)})();(function(){var _hsp=window._hsp=window._hsp||[];var _prewave_cookie=window._prewave_cookie=window._prewave_cookie||{enable:[],disable:[]};function disableHubspot(){console.log('hs-d');_hsp.push(['doNotTrack',{track:!1}])}
function enableHubspot(){console.log('hs-e');_hsp.push(['doNotTrack',{track:!0}])}
_prewave_cookie.enable.push(enableHubspot);_prewave_cookie.disable.push(disableHubspot);_hsp.push(['revokeCookieConsent']);_hsp.push(['doNotTrack'])})();(function(){var _prewave_cookie=window._prewave_cookie=window._prewave_cookie||{enable:[],disable:[]};function enableTagManager(){console.log('tm-e');var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=UA-121630761-1';s.type='text/javascript';s.async=!0;document.body.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('set','linker',{"domains":["www.prewave.com"]});gtag("js",new Date());gtag("config","UA-121630761-1",{"anonymize_ip":!0})}
_prewave_cookie.enable.push(enableTagManager)})();(function(){var _prewave_cookie=window._prewave_cookie=window._prewave_cookie||{enable:[],disable:[]};function withSlaask(cb){if(window._slaask){cb(window._slaask)}}
function loadSlaask(){window._slaaskSettings={key:'spk-ffc3c223-c8b3-49da-82fc-681da769f73e',};if(!window._slaask){var s=document.createElement('script');s.src='https://cdn.slaask.com/chat.js?'+Math.random();s.type='text/javascript';s.async=!0;document.body.appendChild(s)}else{withSlaask(function(s){s.identifyContact()})}}
function unloadSlaask(){withSlaask(function(s){s.destroy()})}})();window.jQuery(function($){function onCookieAnswer(cc){console.log('answered',cc.hasAnswered())
if(cc.hasAnswered()){console.log('hasConsented',cc.hasConsented())
var event=document.createEvent('Event');if(cc.hasConsented()){event.initEvent('prewave.cookie.accept',!0,!0)}else{event.initEvent('prewave.cookie.deny',!0,!0)}
window.dispatchEvent(event)}}
window.cookieconsent.initialise({position:'bottom',theme:'block',enabled:!0,palette:{popup:{background:'#1B2027',text:'rgb(198, 198, 198)',link:'rgb(0, 206, 181)'},button:{background:'rgb(0, 206, 181)',text:'rgb(249, 249, 249)',border:'transparent',link:'#4b4b4b'},highlight:{text:'rgb(80, 80, 80)',border:'transparent',background:'transparent',link:'#dedede'}},type:'opt-in-out',content:{message:'This website uses cookies to ensure you get the best experience.',dismiss:'Dismiss',allow:'Allow',deny:'Deny',link:'Learn more',href:'https://www.prewave.ai/privacy-policy',policy:'Cookie Policy'},compliance:{'opt-in-out':'<div class="cc-compliance cc-highlight">{{deny}}{{allow}}</div>',},cookie:{domain:"prewave.com"},revokable:!0,onStatusChange:function(status){console.log('onStatusChange',status);onCookieAnswer(this)},onInitialise:function(status){console.log('onInitialise',status);onCookieAnswer(this)},onPopupOpen:function(){$('#slaask-button').hide()},onPopupClose:function(){$('#slaask-button').show()},})})