(()=>{var e,t={641:()=>{function e(e,t){e.map((function(e){if(e.isIntersecting){var o,n=e.target.querySelector(".number");o=1==n.dataset.withDecimal?parseFloat(n.dataset.endValue):parseFloat(n.dataset.endValue.replace(/[.,]/g,"")),gsap.fromTo(n,{innerText:0},{innerText:o,duration:2,ease:"power1.in",onUpdate:function(){var e;1==n.dataset.withDecimal?n.innerText=parseFloat(n.innerText).toFixed(1):n.innerText=(e=Math.round(n.innerText))>=1e5?e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,"."):e.toString()}}),t.unobserve(e.target)}}))}jQuery(document).ready((function(t){t(".navigation-toggle").click((function(){t(this).toggleClass("menu-is-open"),t(".main-navigation").toggleClass("is-open"),t("body").toggleClass("navigation-is-open")})),t(".main-navigation a").click((function(e){t(".navigation-toggle").removeClass("menu-is-open"),t(".main-navigation").removeClass("is-open"),t("body").removeClass("navigation-is-open")})),t(".open-faq a").click((function(){var e=t(this).attr("href");t(e).find(".faq-block-question").trigger("click")})),t(".open-modal .wp-block-button__link").click((function(e){e.preventDefault();var o=t(this).attr("href");t(o).toggleClass("active")})),t(".popup-close").click((function(e){e.preventDefault(),t(".modal-wrapper").removeClass("active"),t("body").removeClass("navigation-is-open")}));var o=document.querySelectorAll(".animated-number");o&&o.forEach((function(t){new IntersectionObserver(e,{root:null,threshold:[0]}).observe(t)}));var n=document.querySelectorAll(".faq-block-item"),i=function(e){var t=e.querySelector(".faq-block-answer");e.classList.remove("is-active"),t.style.maxHeight=null};n.forEach((function(e){var t=e.querySelector(".faq-block-question"),o=e.querySelector(".faq-block-answer");t.onclick=function(){o.style.maxHeight?i(e):(n.forEach((function(e){return i(e)})),function(e){var t=e.querySelector(".faq-block-answer");e.classList.add("is-active"),t.style.maxHeight=t.scrollHeight+50+"px"}(e))}})),document.querySelectorAll(".slider-init")&&document.querySelectorAll(".slider-init").forEach((function(e){tns({container:e,items:1,slideBy:"page",autoplay:!0,controls:!1,navPosition:"bottom",gutter:50,autoplayButtonOutput:!1,autoplayButton:!1})})),document.querySelector(".columns-with-popup")&&(t(".columns-with-popup .open-popup").click((function(e){e.preventDefault();var o=t(this).attr("href");t(o).toggleClass("active"),t("body").toggleClass("navigation-is-open")})),t(".popup-close").click((function(e){e.preventDefault(),t(".overlay-item").removeClass("active"),t("body").removeClass("navigation-is-open")}))),document.querySelector(".team-wrapper")&&(gsap.registerPlugin(ScrollTrigger),ScrollTrigger.batch(".team-item",{onEnter:function(e){gsap.to(e,{autoAlpha:1,y:0,stagger:.2,duration:1.25})},once:!0}));var a=document.getElementById("ast-scroll-top");a.addEventListener("click",(function(){document.documentElement.scrollTo({top:0,behavior:"smooth"})})),document.addEventListener("scroll",(function(){document.documentElement.scrollHeight,document.documentElement.clientHeight,document.documentElement.scrollTop>500?a.classList.add("active"):a.classList.remove("active")}))}))},553:()=>{},655:()=>{},906:()=>{},62:()=>{},264:()=>{},684:()=>{},821:()=>{},130:()=>{},862:()=>{},677:()=>{},662:()=>{},320:()=>{},765:()=>{}},o={};function n(e){var i=o[e];if(void 0!==i)return i.exports;var a=o[e]={exports:{}};return t[e](a,a.exports,n),a.exports}n.m=t,e=[],n.O=(t,o,i,a)=>{if(!o){var r=1/0;for(u=0;u<e.length;u++){for(var[o,i,a]=e[u],l=!0,c=0;c<o.length;c++)(!1&a||r>=a)&&Object.keys(n.O).every((e=>n.O[e](o[c])))?o.splice(c--,1):(l=!1,a<r&&(r=a));if(l){e.splice(u--,1);var s=i();void 0!==s&&(t=s)}}return t}a=a||0;for(var u=e.length;u>0&&e[u-1][2]>a;u--)e[u]=e[u-1];e[u]=[o,i,a]},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={660:0,571:0,767:0,9:0,195:0,311:0,338:0,193:0,746:0,483:0,648:0,598:0,679:0,463:0};n.O.j=t=>0===e[t];var t=(t,o)=>{var i,a,[r,l,c]=o,s=0;if(r.some((t=>0!==e[t]))){for(i in l)n.o(l,i)&&(n.m[i]=l[i]);if(c)var u=c(n)}for(t&&t(o);s<r.length;s++)a=r[s],n.o(e,a)&&e[a]&&e[a][0](),e[a]=0;return n.O(u)},o=self.webpackChunkunderscores=self.webpackChunkunderscores||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})(),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(641))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(862))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(677))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(662))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(320))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(765))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(553))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(655))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(906))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(62))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(264))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(684))),n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(821)));var i=n.O(void 0,[571,767,9,195,311,338,193,746,483,648,598,679,463],(()=>n(130)));i=n.O(i)})();