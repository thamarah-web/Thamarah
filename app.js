(function(){
'use strict';
var API=(window.THAMARAH&&window.THAMARAH.api)||'';
var ST={cat:'thamarah_catalog',cart:'thamarah_cart',code:'thamarah_code',pend:'thamarah_pending'};
function ls(k,v){try{if(v===undefined){var r=localStorage.getItem(k);return r?JSON.parse(r):null}if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}

var S={items:[],byId:{},site:{},ts:0,loaded:false,error:''};
var CATS_ICON=['🥬','🍎','🥘'];
var QS=[0.25,0.5];for(var q=1;q<=7;q+=.5)QS.push(q);
var QP=[1,2,3,4,5,6,7,8,9,10];
function ql(q,u){if(u)return q==1?'قطعة':q==2?'قطعتين':q+' قطع';return q==0.25?'250 جرام':q==0.5?'500 جرام':q+' ك'}
var DEF={tag:'سرعة . جودة . سعر',badge:'توصيل سريع أو بموعد تختاره',mf:'التوصيل السريع',mfs:'خلال 10 دقايق',ms:'التوصيل بموعد',mss:'اختار ساعة التسليم',c0:'الخضار',c1:'الفاكهة',c2:'الخضار الجاهز للطبخ',eta:'أقرب موعد للتوصيل',hours:'مواعيد العمل من 9 صباحاً حتى 9 مساءً',first:10,last:21,min:150,thanks:'افرح.. ثمرتك عند باب بيتك 😊',ct:'تواصل معنا',ft:'ثمرة · العبور، الحي التاسع'};
function tx(k){var v=S.site&&S.site[k];return (v===undefined||v===null||v==='')?DEF[k]:v}
function catName(i){return tx('c'+i)}

var payM='',cf={cn:'',cp:'',ab:'',aw:'',ap:'',ci:'',cc:''},KS={c:'',ok:null,busy:false},ktm=null,note='',MIN=150,mode='sched',slotKey='',mod=null,cat=0,cart={},qs='',sending=false,CS={c:'',r:null,busy:false},ctm=null;
var LOGO='logo.png';
(function(){try{var st=document.createElement('style');st.textContent='.n9{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-weight:700;font-size:1.08em;letter-spacing:0;unicode-bidi:isolate}.mode{justify-content:center}.mode.off{cursor:default;pointer-events:none;user-select:none}.mode.off b{font-size:15px}.zzp{width:78px;height:62px;margin:-4px 0 2px}.zzp text{font:700 12px sans-serif;fill:#a8786c}.zzp .z1{animation:zz 3s infinite}.zzp .z2{animation:zz 3s 1s infinite}.zzp .z3{animation:zz 3s 2s infinite}.zzp .zb{transform-box:fill-box;transform-origin:center;animation:br 3.4s ease-in-out infinite}@keyframes zz{0%{opacity:0;transform:translateY(5px)}35%{opacity:1}100%{opacity:0;transform:translateY(-7px)}}@keyframes br{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@media (prefers-reduced-motion:reduce){.zzp *{animation:none!important}}.adr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.adr input{text-align:center;padding:11px 6px;min-width:0}.wa{display:flex;justify-content:center;margin:0 0 14px}.cnote{font-size:12.5px;line-height:1.7;padding:7px 10px;margin:-2px 0 8px;border-radius:10px;text-align:right}.cnote.wait{color:var(--mute,#888)}.cnote.bad{background:#f6e4e6;color:#a52a3a}.tot.sm{font-size:14px;opacity:.85;margin-bottom:4px}.tot.dsc span:last-child{color:#2f7a3a}';document.head.appendChild(st)}catch(e){}})();

function per(h){return h<12?'الصبح':h<15?'الظهر':h<18?'العصر':h<21?'المساء':'بالليل'}
function fh(h){return (h%12||12)+' '+per(h)}
function cairoNow(){try{var p={};new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=+x.value});return {h:p.hour%24,m:p.minute,s:p.second}}catch(e){var d=new Date();return {h:d.getHours(),m:d.getMinutes(),s:d.getSeconds()}}}
function slots(){var d=cairoNow(),b=d.h+((d.m||d.s)?1:0),e=b+2,day=0;var F=+tx('first')||10,Lh=+tx('last')||21;if(e<F)e=F;if(e>Lh){e=F;day=1}var l=[];for(var t=e;t<=Lh;t++)l.push({k:day+'-'+t,d:day,h:t});return l}
function slotLabel(s){return (s.d?'بكرة':'اليوم')+' الساعة '+fh(s.h)}
function curSlot(){var l=slots();for(var i=0;i<l.length;i++)if(l[i].k===slotKey)return l[i];return l[0]}
// التوصيل السريع مقفول من 9 بالليل لحد 9 الصبح بتوقيت مصر
var FAST_FROM=9,FAST_TO=21;
function cairoHour(){return cairoNow().h}
function fastClosed(){var h=cairoHour();return h>=FAST_TO||h<FAST_FROM}
var SLEEP='<svg class="zzp" viewBox="0 0 100 80" aria-hidden="true"><defs><radialGradient id="zzpg" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#e2545f"/><stop offset=".55" stop-color="#b92d3a"/><stop offset="1" stop-color="#7c1724"/></radialGradient><linearGradient id="zzlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93ba6a"/><stop offset="1" stop-color="#4b7631"/></linearGradient></defs><rect x="8" y="60" width="62" height="13" rx="6.5" fill="#f4e7d8" stroke="#e2cdb6"/><g transform="rotate(-16 40 46)"><g class="zb"><path d="M33 25C20 20 13 9 17 3c11 2 18 11 16 22z" fill="url(#zzlg)"/><path d="M37 24c0-11 6-19 13-21 2 9-4 17-13 21z" fill="url(#zzlg)"/><path d="M25 10c3 5 6 9 8 14M43 9c-2 5-4 10-6 15" stroke="#3f6328" stroke-width=".8" fill="none" opacity=".6"/><circle cx="40" cy="46" r="21" fill="url(#zzpg)"/><path d="M47 28l2-9 3 6 3-7 1 7 6-4-3 8z" fill="#9a2230"/><ellipse cx="31" cy="36" rx="6.5" ry="3.5" fill="#fff" opacity=".28" transform="rotate(-32 31 36)"/><path d="M29 47q3.6 3.2 7.2 0M43 47q3.6 3.2 7.2 0" fill="none" stroke="#fff4ec" stroke-width="2.1" stroke-linecap="round"/><ellipse cx="28" cy="53" rx="3.2" ry="1.9" fill="#ff9aa8" opacity=".6"/><ellipse cx="52" cy="53" rx="3.2" ry="1.9" fill="#ff9aa8" opacity=".6"/><path d="M38 55q2 1.6 4 0" fill="none" stroke="#fff4ec" stroke-width="1.7" stroke-linecap="round"/></g></g><text class="z1" x="68" y="34">z</text><text class="z2" x="77" y="23">z</text><text class="z3" x="86" y="12">Z</text></svg>';
function dlText(){return mode==='sched'?'توصيل بموعد: '+slotLabel(curSlot()):'توصيل سريع ('+tx('mfs')+')'}
function dlShort(){return mode==='sched'?'موعد: '+slotLabel(curSlot()):'سريع'}

var root=document.getElementById('root');
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function money(n){return (Math.round(n*100)/100).toLocaleString('en-US')+' ج'}
function en(s){return String(s==null?'':s).replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632}).replace(/[۰-۹]/g,function(c){return c.charCodeAt(0)-1776})}
function item(id){return S.byId[id]}
function total(){var t=0;for(var k in cart){var x=item(k);if(x)t+=cart[k]*x.p}return t}
function opts(sel,u){return (sel?'':'<option value="" selected disabled>اختار</option>')+(u?QP:QS).map(function(q){return '<option value="'+q+'"'+(q==sel?' selected':'')+'>'+ql(q,u)+'</option>'}).join('')}
function nz(s){return String(s).toLowerCase().replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')}
function modeName(){return mode==='fast'?tx('mf'):tx('ms')}
function sph(){return 'ابحث في منتجات '+modeName()}
function srLabel(){return qs.trim()?'🔎 نتائج البحث في منتجات <b>'+esc(modeName())+'</b> فقط':''}
function co(c){return c==2?0:c==0?1:2}
function avail(x){return x&&!x.off&&x.p>0}
function saveCart(){ls(ST.cart,{cart:cart,mode:mode})}

var IC={"بقدونس":"h,#5a9a35,#3f7d28","بنجر":"b,#8e2a52,#4f8a2b","ثوم":"b,#f1ead8,#d9cfb0","جرجير":"h,#3f8a2f,#6aa83c","جزر":"c,#ee8a2c,#4f9a2b","خس":"w,#a9cf5a,#7fb23a","خيار":"l,#3f8a35,#2f6a28","شبت":"h,#7bb04a,#9ac75f","طماطم":"r,#d9362b,#4f8a2b","فاصوليا":"q,#5c9f35,#4a8a2a","فلفل أخضر رومي":"o,#4a9a35,#2f6a28","فلفل ألوان":"o,#e8a21c,#4a8a2a","فلفل حامي":"i,#c8321f,#3f7d28","قنة":"l,#8fb85a,#5a8a3a","قرنبيط":"w,#f2eddc,#7fb23a","قلقاس":"b,#a67c52,#6b8e3a","كابوتشا":"w,#b7d97a,#8fbf4f","كرنب أحمر":"w,#8b3a73,#6a2a5a","كزبرة":"h,#4f9a3a,#7bb24a","كوسة":"l,#9cc76a,#6a9a40","لفت":"b,#f3eef0,#8a4f8a","ليمون":"y,#f2d630,#fff3a0","ملوخية":"z,#3f7d2a,#2a5a1c","نعناع":"z,#5aa84a,#3f8a35","ورق عنب":"z,#6a9a3a,#4a7a2a",
"تفاح مصري":"r,#d94a2f,#4f8a2b","تفاح أمريكي":"r,#a8182a,#4f8a2b","تين":"b,#7a3f6a,#7a8a3a","جوافة":"r,#bcd86a,#4f8a2b","خوخ":"r,#f3a35a,#4f8a2b","رمان":"a,#b5172b,#7a1a2a","عنب أحمر":"g,#7a2a5a,#4f8a2b","عنب أخضر":"g,#a8cf4f,#4f8a2b","فراولة":"s,#d62839,#4f8a2b","كانتلوب":"m,#f0b36a,#4f8a2b","كمثرى":"p,#cfd85a,#4f8a2b","كيوي":"k,#8a6a3a,#7ab83a","مانجو زيدية":"x,#f0b020,#e0583a","مشمش":"r,#f2a03c,#4f8a2b","موز":"n,#f2d23c,#6b4a2a","يوسفي":"y,#f08a24,#fbd08a",
"فلفل محشي 1 كيلو":"v,#c8321f,#4a9a35","كرنب مسلوق ¼ كيلو":"v,#9cc76a,#6a9a3a","كوسة جاهزة محشي ½ كيلو":"v,#9cc76a,#e8b84a","ورق عنب جاهز 1 كيلو":"v,#6a9a3a,#4a7a2a","بنجر مسلوق مقطع":"v,#8e2a52,#c0507a","ثوم مقشر":"v,#efe3c4,#d9c68a","جزر مبشور":"v,#ee8a2c,#f5b060","خس مقطع":"v,#a9cf5a,#7fb23a","خضار مشكل للشوربة":"v,#ee8a2c,#4f9a2b","سبانخ قطف":"v,#3f7d2a,#5a9a35","فاصوليا مقطعة":"v,#5c9f35,#8fc05a","قلقاس مقطع مع سلق":"v,#a67c52,#d9b98a","كابوتشا مقطعة":"v,#b7d97a,#8fbf4f","كوسة مبشورة":"v,#9cc76a,#c8e09a","ملوخية قطف":"v,#3f7d2a,#2a5a1c"};
function icon(n){var s=IC[n];if(!s)return '';var p=s.split(','),k=p[0],a=p[1],b=p[2],o="<svg viewBox='0 0 100 100' width='100%' height='100%'>",e='</svg>',i,t='';
var hl="<ellipse cx='38' cy='44' rx='9' ry='6' fill='#fff' opacity='.3' transform='rotate(-30 38 44)'/>",lf="<path d='M52 30q14-12 24-4q-8 12-24 4z' fill='"+b+"'/>",st="<path d='M50 32q0-10 4-14' stroke='#6b4a2a' stroke-width='3' fill='none' stroke-linecap='round'/>",dk="stroke='rgba(0,0,0,.18)' fill='none' stroke-width='2'";
switch(k){
case 'r':return o+"<ellipse cx='50' cy='58' rx='30' ry='28' fill='"+a+"'/>"+hl+st+lf+e;
case 'a':return o+"<ellipse cx='50' cy='60' rx='30' ry='27' fill='"+a+"'/><path d='M38 36l4-12 8 7 8-7 4 12z' fill='"+b+"'/>"+hl+e;
case 'p':return o+"<path d='M50 20c-8 0-10 12-12 20-10 8-14 16-14 26 0 14 12 22 26 22s26-8 26-22c0-10-4-18-14-26-2-8-4-20-12-20z' fill='"+a+"'/>"+hl+"<path d='M50 22q2-8 6-10' stroke='#6b4a2a' stroke-width='3' fill='none'/><path d='M54 20q10-6 18 0q-8 8-18 0z' fill='"+b+"'/>"+e;
case 'l':return o+"<g transform='rotate(-35 50 50)'><rect x='10' y='39' width='80' height='24' rx='12' fill='"+a+"'/><rect x='4' y='44' width='12' height='14' rx='4' fill='"+b+"'/><rect x='22' y='44' width='56' height='4' rx='2' fill='#fff' opacity='.25'/></g>"+e;
case 'i':return o+"<path d='M26 30Q30 78 78 72' stroke='"+a+"' stroke-width='14' fill='none' stroke-linecap='round'/><path d='M22 28q-2-8 4-12' stroke='"+b+"' stroke-width='6' fill='none' stroke-linecap='round'/>"+e;
case 'c':return o+"<path d='M20 40Q60 30 90 60Q56 76 20 62Z' fill='"+a+"'/><path d='M44 46l6 8M62 52l5 7M34 52l5 6' "+dk+"/><ellipse cx='14' cy='38' rx='11' ry='5' fill='"+b+"' transform='rotate(-30 14 38)'/><ellipse cx='12' cy='50' rx='11' ry='5' fill='"+b+"'/><ellipse cx='14' cy='62' rx='11' ry='5' fill='"+b+"' transform='rotate(30 14 62)'/>"+e;
case 'h':for(i=-2;i<=2;i++)t+="<ellipse cx='50' cy='48' rx='9' ry='26' fill='"+(i%2?a:b)+"' transform='rotate("+i*20+" 50 86)'/>";return o+t+"<rect x='47' y='70' width='6' height='20' rx='3' fill='"+b+"'/>"+e;
case 'g':for(i=0;i<6;i++)t+="<circle cx='"+[36,50,64,43,57,50][i]+"' cy='"+[42,42,42,56,56,70][i]+"' r='10' fill='"+a+"'/>";return o+t+"<ellipse cx='36' cy='39' rx='3' ry='2' fill='#fff' opacity='.4'/><path d='M50 32q0-10 6-12' stroke='#6b4a2a' stroke-width='3' fill='none'/><path d='M54 22q10-8 18-2q-8 10-18 2z' fill='"+b+"'/>"+e;
case 'b':return o+"<path d='M50 24C52 36 76 42 76 64C76 78 64 86 50 86C36 86 24 78 24 64C24 42 48 36 50 24Z' fill='"+a+"'/><path d='M50 30V84M38 44Q34 66 42 82M62 44Q66 66 58 82' "+dk+"/><ellipse cx='44' cy='20' rx='5' ry='11' fill='"+b+"' transform='rotate(-15 44 20)'/><ellipse cx='57' cy='20' rx='5' ry='11' fill='"+b+"' transform='rotate(15 57 20)'/>"+e;
case 'w':return o+"<ellipse cx='50' cy='56' rx='36' ry='32' fill='"+b+"'/><ellipse cx='50' cy='56' rx='27' ry='24' fill='"+a+"'/><path d='M50 80V34M50 66Q36 60 30 48M50 66Q64 60 70 48' "+dk+"/>"+e;
case 'm':return o+"<circle cx='50' cy='56' r='32' fill='"+a+"'/><path d='M50 24Q36 56 50 88M50 24Q64 56 50 88M20 44Q50 54 80 44M20 68Q50 58 80 68' stroke='#fff' stroke-opacity='.5' fill='none' stroke-width='2'/><rect x='47' y='16' width='6' height='10' rx='3' fill='"+b+"'/>"+e;
case 'n':return o+"<path d='M18 34Q22 84 70 82Q86 80 90 66Q60 74 40 30Z' fill='"+a+"'/><path d='M18 34l4-8 6 4-2 8z' fill='"+b+"'/><path d='M44 40Q56 66 84 68' stroke='#fff' stroke-opacity='.4' stroke-width='3' fill='none'/>"+e;
case 'k':return o+"<ellipse cx='50' cy='54' rx='34' ry='28' fill='"+a+"'/><ellipse cx='50' cy='54' rx='28' ry='22' fill='"+b+"'/><ellipse cx='50' cy='54' rx='9' ry='7' fill='#f3f0c0'/><path d='M50 54L50 34M50 54L72 48M50 54L68 70M50 54L32 70M50 54L28 48' stroke='#e9f2a8' stroke-width='2'/><circle cx='50' cy='42' r='1.8'/><circle cx='64' cy='52' r='1.8'/><circle cx='58' cy='66' r='1.8'/><circle cx='42' cy='66' r='1.8'/><circle cx='36' cy='52' r='1.8'/>"+e;
case 'y':for(i=0;i<6;i++)t+="<path d='M50 56L"+(50+18*Math.cos(i*1.0472+0.5))+" "+(56+18*Math.sin(i*1.0472+0.5))+"' stroke='#fff' stroke-opacity='.6' stroke-width='2'/>";return o+"<circle cx='50' cy='56' r='32' fill='"+a+"'/><circle cx='50' cy='56' r='25' fill='"+b+"' opacity='.8'/>"+t+"<path d='M50 24q4-8 12-6q-4 8-12 6z' fill='#5a9a35'/>"+e;
case 'e':return o+"<path d='M30 34C20 54 30 82 60 82C82 82 86 60 70 46C58 34 44 24 30 34Z' fill='"+a+"'/>"+e;
case 'o':return o+"<path d='M30 38C18 44 22 78 36 84C46 88 56 88 64 84C78 78 82 44 70 38C60 34 40 34 30 38Z' fill='"+a+"'/>"+hl+"<path d='M50 38V22' stroke='"+b+"' stroke-width='6' stroke-linecap='round'/><path d='M40 40Q50 46 60 40' "+dk+"/>"+e;
case 'q':for(i=0;i<4;i++)t+="<path d='M"+(16+i*6)+" "+(84-i*3)+"Q"+(40+i*6)+" "+(50-i*4)+" "+(80-i*2)+" "+(18+i*6)+"' stroke='"+(i%2?a:b)+"' stroke-width='9' fill='none' stroke-linecap='round'/>";return o+t+e;
case 'z':return o+"<path d='M50 88C14 70 18 28 50 14C82 28 86 70 50 88Z' fill='"+a+"'/><path d='M50 88V24M50 66L32 52M50 52L68 40M50 40L38 30' stroke='"+b+"' stroke-width='3' fill='none' stroke-linecap='round'/>"+e;
case 's':for(i=0;i<8;i++)t+="<ellipse cx='"+[38,50,62,34,46,58,70,50][i]+"' cy='"+[48,46,48,60,60,60,58,72][i]+"' rx='1.8' ry='2.6' fill='#fbe48a'/>";return o+"<path d='M50 86C20 68 16 40 32 34C42 30 46 38 50 38C54 38 58 30 68 34C84 40 80 68 50 86Z' fill='"+a+"'/>"+t+"<path d='M34 36l16 6 16-6-8-10-8 8-8-8z' fill='"+b+"'/>"+e;
case 'x':return o+"<ellipse cx='50' cy='56' rx='36' ry='27' fill='"+a+"' transform='rotate(-25 50 56)'/><ellipse cx='60' cy='62' rx='22' ry='14' fill='"+b+"' opacity='.45' transform='rotate(-25 60 62)'/><path d='M30 36q6-12 18-10q-6 10-18 10z' fill='#5a9a35'/>"+e;
case 'v':for(i=0;i<5;i++)t+="<rect x='"+(24+i*11)+"' y='"+(36+(i%2)*5)+"' width='11' height='11' rx='3' fill='"+(i%2?b:a)+"' transform='rotate("+(i%2?12:-10)+" "+(30+i*11)+" 42)'/>";return o+t+"<path d='M14 50H86L80 82Q79 86 74 86H26Q21 86 20 82Z' fill='#fff' stroke='"+a+"' stroke-width='3'/><path d='M14 50H86' stroke='"+a+"' stroke-width='5' stroke-linecap='round'/><path d='M30 62V78M50 62V78M70 62V78' stroke='"+b+"' stroke-opacity='.45' stroke-width='3'/>"+e;
}return '';}

window.__imgErr=function(el){var s=el.getAttribute('src')||'';if(!el.dataset.r&&/^img\//.test(s)){el.dataset.r=1;el.setAttribute('src',s.replace(/^img\//,''));return}el.remove()};
function picOf(x){return x.img?'<img src="'+esc(x.img)+'" alt="" loading="lazy" onerror="__imgErr(this)">'+'<span class="fb">'+(icon(x.ik||x.n)||CATS_ICON[x.c])+'</span>':(icon(x.ik||x.n)||CATS_ICON[x.c])}
function unitOf(x){return x.u?' <small>/ القطعة</small>':' <small>/ الكيلو</small>'}

function listItems(){
 var av=mode!=='fast'?[0,1,2]:[0,1],q=nz(qs.trim());
 return S.items.filter(function(x){return av.indexOf(x.c)>-1&&avail(x)&&(q?nz(x.n).indexOf(q)>-1:x.c==cat)}).sort(function(a,b){return co(a.c)-co(b.c)||(a.o||999)-(b.o||999)||a.id-b.id})
}
function tileHtml(x){
 return '<div class="card"><div class="row" data-t="'+x.id+'"><div class="img">'+picOf(x)+'</div><div><div class="nm">'+esc(x.n)+'</div><div class="pr">'+money(x.p)+unitOf(x)+'</div></div>'+(cart[x.id]?'<span class="inc">'+ql(cart[x.id],x.u)+'</span>':'')+'</div></div>';
}
function gridInner(){
 var L=listItems(),h='';
 L.forEach(function(x){h+=tileHtml(x)});
 if(!L.length&&qs.trim()){var q=nz(qs.trim()),other=mode==='fast'&&S.items.some(function(x){return x.c==2&&avail(x)&&nz(x.n).indexOf(q)>-1});
  h='<div class="empty">مفيش نتائج لـ «'+esc(qs.trim())+'» في '+esc(modeName())+(other?'<br><button class="btn ghost" data-m="sched" style="margin-top:12px">موجود في التوصيل بموعد</button>':'')+'</div>'}
 else if(!L.length)h='<div class="empty">مفيش أصناف متاحة في القسم ده دلوقتي</div>';
 return h}
function updSearch(){
 document.getElementById('gr').innerHTML=gridInner();
 document.getElementById('sn').innerHTML=srLabel();
 document.getElementById('sx').style.display=qs?'':'none';
 document.querySelector('nav').classList.toggle('srch',!!qs.trim());
}

var ICO={wa:"<svg viewBox='0 0 32 32' aria-label='WhatsApp'><circle cx='16' cy='16' r='16' fill='#25D366'/><path fill='#fff' d='M16 6.5a9.4 9.4 0 0 0-8.1 14.2L6.5 25.5l4.9-1.3A9.4 9.4 0 1 0 16 6.5zm0 1.8a7.6 7.6 0 1 1-3.9 14.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.6 7.6 0 0 1 16 8.3z'/><path fill='#fff' d='M12.4 11.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.5 3.8 2.2.8 2.7.7 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.8-1.9z'/></svg>",ig:"<svg viewBox='0 0 32 32' aria-label='Instagram'><defs><linearGradient id='igg' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#feda75'/><stop offset='.35' stop-color='#fa7e1e'/><stop offset='.65' stop-color='#d62976'/><stop offset='1' stop-color='#4f5bd5'/></linearGradient></defs><rect width='32' height='32' rx='9' fill='url(#igg)'/><rect x='7' y='7' width='18' height='18' rx='5.5' fill='none' stroke='#fff' stroke-width='2'/><circle cx='16' cy='16' r='4.3' fill='none' stroke='#fff' stroke-width='2'/><circle cx='21.2' cy='10.8' r='1.2' fill='#fff'/></svg>",fb:"<svg viewBox='0 0 32 32' aria-label='Facebook'><circle cx='16' cy='16' r='16' fill='#1877F2'/><path fill='#fff' d='M17.5 26v-8.2h2.7l.5-3.3h-3.2v-2.1c0-.9.4-1.7 1.8-1.7h1.5V7.9s-1.3-.2-2.6-.2c-2.6 0-4.3 1.6-4.3 4.5v2.3h-2.8v3.3h2.8V26h3.6z'/></svg>"};
function waLink(n){var d=String(n||'').replace(/\D/g,'');if(d.charAt(0)==='0')d='20'+d.slice(1);return 'https://wa.me/'+d}
function sLink(u,base){u=String(u||'').trim();if(!u)return '';if(/^https?:\/\//i.test(u))return u;return base+u.replace(/^@/,'')}
function contactHtml(){
 var s=S.site||{},h='<div class="ct"><div class="ctt">'+esc(tx('ct'))+'</div><div class="cl">';
 if(s.phone)h+='<a class="ci" href="'+esc(waLink(s.phone))+'" target="_blank" rel="noopener">'+ICO.wa+'<span dir="ltr">'+esc(s.phone)+'</span></a>';
 if(s.ig)h+='<a class="ci" href="'+esc(sLink(s.ig,'https://instagram.com/'))+'" target="_blank" rel="noopener">'+ICO.ig+'<span>Instagram</span></a>';
 if(s.fb)h+='<a class="ci" href="'+esc(sLink(s.fb,'https://facebook.com/'))+'" target="_blank" rel="noopener">'+ICO.fb+'<span>Facebook</span></a>';
 return h+'</div></div>'}

function render(){
 document.body.style.overflow='';MIN=+tx('min')||150;
 var h='<header><img class="logo" src="'+LOGO+'" alt="ثمرة"><div class="orn"></div><div class="tag">'+esc(tx('tag'))+'</div><div class="badge">'+esc(tx('badge'))+'</div>'+'<div class="upd">للحي التاسع ودار مصر</div></header>';
 if(!S.loaded){
  h+=S.error?'<div class="empty"><div style="font-size:34px">😕</div>'+esc(S.error)+'<br><button class="btn" id="retry" style="margin-top:14px">حاول تاني</button>'+(S.site.phone?'<br><a class="btn ghost" style="margin-top:10px;display:inline-block;text-decoration:none" href="'+esc(waLink(S.site.phone))+'" target="_blank" rel="noopener">اطلب على الواتساب</a>':'')+'</div>'
   :'<div class="grid">'+Array(9).join('<div class="card sk"><div class="row"><div class="img"></div><div class="skl"></div><div class="skl s"></div></div></div>')+'</div>';
  root.innerHTML=h;return;
 }
 if(mode==='fast'&&fastClosed()){mode='sched';cat=2}
 h+='<div class="modes">'+[['fast',esc(tx('mf')),esc(tx('mfs'))],['sched',esc(tx('ms')),esc(tx('mss'))]].map(function(m){
  if(m[0]==='fast'&&fastClosed())return '<div class="mode off" aria-disabled="true">'+SLEEP+'<b>التوصيل السريع</b><small>يبدأ من <span class="n9">'+FAST_FROM+'</span> صباحًا</small></div>';
  return '<button class="mode'+(mode==m[0]?' on':'')+'" data-m="'+m[0]+'"><b>'+m[1]+'</b><small>'+m[2]+'</small></button>'}).join('')+'</div>';
 if(mode==='sched'){var L=slots(),cs=curSlot();h+='<div class="sched"><div class="e">'+esc(tx('eta'))+'</div><div class="t">'+slotLabel(L[0])+'</div><select id="slot">'+L.map(function(s){return '<option value="'+s.k+'"'+(s.k===cs.k?' selected':'')+'>'+slotLabel(s)+'</option>'}).join('')+'</select><small>'+esc(tx('hours'))+'</small></div>'}
 var av=mode!=='fast'?[2,0,1]:[0,1];if(av.indexOf(cat)<0)cat=av[0];var nt=note;note='';
 if(nt)h+='<div class="warn'+(nt.charAt(0)==='✓'?' ok':'')+'">'+esc(nt)+'</div>';
 h+='<div class="sb"><span class="si">🔍</span><input id="sq" type="search" autocomplete="off" placeholder="'+esc(sph())+'" value="'+esc(qs)+'"><button class="sx" id="sx" aria-label="مسح"'+(qs?'':' style="display:none"')+'>✕</button></div>';
 h+='<nav class="'+(qs?'srch':'')+'">'+av.map(function(i){return '<button data-c="'+i+'" class="'+(i==cat?'on':'')+'">'+esc(catName(i))+'</button>'}).join('')+'</nav><div class="sr" id="sn">'+srLabel()+'</div><div class="grid" id="gr">'+gridInner();
 h+='</div>'+contactHtml()+'<div class="ft">'+esc(tx('ft'))+'</div>';
 var n=Object.keys(cart).length,tot=total(),pct=Math.min(100,tot/MIN*100),full=tot>=MIN;
 h+='<div class="bar'+(n?' show':'')+'"><button id="oc" class="cb'+(full?' full':'')+'"><i class="fill" style="width:'+pct+'%"></i><span class="cr"><span>السلة · '+n+' صنف</span><b>'+money(tot)+'</b></span><span class="ch">'+(full?'وصلت للحد الأدنى، كمّل طلبك':'الحد الأدنى للطلب '+money(MIN)+' · باقي '+money(Math.ceil(MIN-tot)))+'</span></button></div>';
 h+='<div class="sheet" id="sh"><div class="panel" id="pn"></div></div><div id="md"></div>';
 root.innerHTML=h;
}
function modalHtml(){
 if(!mod)return '';var x=item(mod.id);if(!x)return '';var inCart=!!cart[x.id];
 return '<div class="ov" id="ov"><div class="dlg"><button class="x cl" id="mclose" aria-label="إغلاق">✕</button><div class="img big">'+picOf(x)+'</div><div class="nm big">'+esc(x.n)+'</div><div class="pr">'+money(x.p)+unitOf(x)+'</div><div class="wsel"><span>'+(x.u?'الكمية':'الوزن')+'</span><b id="wv">'+(mod.q?ql(mod.q,x.u):'اختار')+'</b><select id="mq">'+opts(mod.q,x.u)+'</select></div><div class="mt"><span>الإجمالي</span><b id="mt">'+(mod.q?money(x.p*mod.q):'—')+'</b></div><button class="btn wide" id="madd"'+(mod.q?'':' disabled')+'>'+(inCart?'تحديث السلة':'أضف للسلة')+'</button>'+(inCart?'<button class="btn ghost wide" id="mdel">حذف من السلة</button>':'')+'</div></div>';
}
function showModal(){document.getElementById('md').innerHTML=modalHtml();document.body.style.overflow=mod?'hidden':''}
function payLink(){var p=String((S.site||{}).pay||'').trim();return p?(/^https?:\/\//i.test(p)?p:'https://'+p):''}
function payHtml(){
 var s=S.site||{},h='<div class="cs"><div class="cst">طريقة الدفع</div><div class="pm"><button class="pmb'+(payM==='online'?' on':'')+'" data-pm="online">انستاباي</button><button class="pmb'+(payM==='cash'?' on':'')+'" data-pm="cash">كاش</button></div>';
 if(payM==='online')h+='<div class="pnote" style="margin-top:10px">برجاء ارسال إيصال التحويل على الواتساب</div>';
 h+='</div>';
 if(s.phone)h+='<div class="wa"><a class="ci" href="'+esc(waLink(s.phone))+'" target="_blank" rel="noopener">'+ICO.wa+'<span>اضغط للتواصل مع خدمة العملاء</span></a></div>';
 return h}
function both(){return !!en(cf.cc).trim()&&!!(cf.cn.trim()||cf.cp.trim()||cf.ab.trim()||cf.aw.trim()||cf.ap.trim()||cf.ci.trim())}
function adrOk(){return !!(cf.ab.trim()&&cf.aw.trim()&&cf.ap.trim())}
function adr(){return 'بلوك '+cf.ab.trim()+' - عمارة '+cf.aw.trim()+' - شقة '+cf.ap.trim()}
// كود العميل القديم لازم يكون موجود عندنا
var BADC='برجاء التأكد من كود العميل الخاص بك أو إضافة بياناتك في حالة كنت عميل جديد';
function kcode(){return en(cf.cc||'').trim()}
function custNote(){var c=kcode();return c&&KS.c===c&&!KS.busy&&KS.ok===false?'<div class="warn" style="margin:0">'+BADC+'</div>':''}
function updCust(){var n=document.getElementById('ccnote');if(n)n.innerHTML=custNote()}
function lookCust(c){KS={c:c,ok:null,busy:true};
 return fetch(API+(API.indexOf('?')>-1?'&':'?')+'api=cust&cc='+encodeURIComponent(c)).then(function(r){return r.json()}).then(function(j){if(KS.c===c){KS.ok=!!(j&&j.ok);KS.busy=false;updCust();updGo()}}).catch(function(){if(KS.c===c){KS.ok=null;KS.busy=false;updCust()}})}
function custChanged(){var c=kcode();clearTimeout(ktm);if(!c){KS={c:'',ok:null,busy:false};updCust();return}if(c===KS.c&&(KS.busy||KS.ok!==null))return;KS={c:c,ok:null,busy:true};updCust();ktm=setTimeout(function(){lookCust(c)},500)}
function ccode(){return en(cf.ci||'').trim().toUpperCase()}
function disc(){var r=CS.r,t=total();if(!r||!r.ok||CS.c!==ccode()||en(cf.cc).trim())return 0;if(r.type==='promo')return Math.min(r.amt||40,t);return Math.min(Math.round(t*(r.pct||20))/100,r.max||80)}
function sumHtml(){var t=total(),d=disc();if(!d)return '<div class="tot"><span>الإجمالي</span><span>'+money(t)+'</span></div>';
 return '<div class="tot sm"><span>المجموع</span><span>'+money(t)+'</span></div><div class="tot sm dsc"><span>الخصم'+(CS.r.type==='promo'?' (رمز ترويجي)':' (دعوة صديق)')+'</span><span>- '+money(d)+'</span></div><div class="tot"><span>الإجمالي بعد الخصم</span><span>'+money(Math.round((t-d)*100)/100)+'</span></div>'}
function codeNote(){var c=ccode();if(!c)return '';
 if(CS.busy||CS.c!==c)return '<div class="cnote wait">جاري التأكد من الرمز...</div>';
 var r=CS.r;if(!r)return '<div class="cnote wait">مش قادرين نتأكد من الرمز دلوقتي، هنتأكد منه مع تأكيد الطلب</div>';
 if(!r.ok)return '<div class="cnote bad">الرمز ده مش صحيح، اتأكد منه أو امسحه</div>';
 if(r.type==='promo')return '<div class="pnote cnote">✓ رمز ترويجي للعملاء الجدد: خصم '+(r.amt||40)+' ج من إجمالي الفاتورة</div>';
 return '<div class="pnote cnote" style="text-align:center">افرح .. ثمرتك عليها خصم '+(r.pct||20)+'% ☺️<div style="font-size:11px;opacity:.85;margin-top:2px">(بحد أقصى '+(r.max||80)+' ج)</div></div>'}
function updDisc(){var n=document.getElementById('cinote');if(n)n.innerHTML=codeNote();var d=document.getElementById('dsum');if(d)d.innerHTML=sumHtml()}
function lookCode(c){CS.c=c;CS.busy=true;CS.r=null;updDisc();
 return fetch(API+(API.indexOf('?')>-1?'&':'?')+'api=code&pc='+encodeURIComponent(c)).then(function(r){return r.json()}).then(function(j){if(CS.c===c){CS.r=j||{ok:false};CS.busy=false;updDisc()}return j}).catch(function(){if(CS.c===c){CS.busy=false;CS.r=null;updDisc()}return null})}
function codeChanged(){var c=ccode();clearTimeout(ctm);if(!c){CS={c:'',r:null,busy:false};updDisc();return}if(c===CS.c&&(CS.busy||CS.r))return;CS.c=c;CS.busy=true;CS.r=null;updDisc();ctm=setTimeout(function(){lookCode(c)},600)}
function formOk(){if(both())return false;var code=en(cf.cc).trim(),ph=en(cf.cp).replace(/\D/g,'');if(code)return !(KS.c===code&&KS.ok===false);return !!(cf.cn.trim()&&ph.length>=8&&adrOk())}
function readForm(){['cn','cp','ab','aw','ap','ci','cc'].forEach(function(k){var e=document.getElementById(k);if(e&&typeof e.value==='string')cf[k]=e.value})}
function showMsg(t,html){var m=document.getElementById('cmsg');if(m){if(html)m.innerHTML=t;else m.textContent=t;m.style.display='block';try{m.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}}else{try{alert(t)}catch(e){}}}
function updGo(){readForm();var b=document.getElementById('go'),okk=total()>=MIN&&formOk()&&!!payM;if(b){if(okk)b.removeAttribute('data-off');else b.setAttribute('data-off','1')}var m=document.getElementById('cmsg');if(m&&okk&&!sending)m.style.display='none';var w=document.getElementById('bw');if(w)w.style.display=both()?'block':'none';updDisc()}
function sheet(){
 var tot=total(),ok=tot>=MIN,saved=ls(ST.code);
 if(saved&&!cf.cc&&!cf.cn&&!cf.cp&&!cf.ab&&!cf.aw&&!cf.ap)cf.cc=String(saved);
 var h='<h2>سلتك</h2><div class="cs"><div class="cst">الأصناف</div>';
 Object.keys(cart).forEach(function(k){var x=item(k);if(!x)return;h+='<div class="li"><div class="n"><div class="ln">'+esc(x.n)+'</div><small>'+money(x.p*cart[k])+'</small></div><select data-q="'+k+'">'+opts(cart[k],x.u)+'</select><button class="x" data-r="'+k+'" aria-label="حذف">✕</button></div>'});
 h+='</div><div class="cs"><div id="dsum">'+sumHtml()+'</div><div class="dlr">'+esc(dlText())+'</div>';
 if(!ok)h+='<div class="warn">الحد الأدنى للطلب '+money(MIN)+'، باقي '+money(Math.ceil(MIN-tot))+' عشان تكمّل الطلب</div>';
 h+='</div><div class="cs"><div class="cst">بيانات العميل</div><div class="sec"><div class="sh">عميل جديد</div><input id="cn" placeholder="الاسم" value="'+esc(cf.cn)+'" autocomplete="name"><input id="cp" type="tel" placeholder="رقم التليفون" value="'+esc(cf.cp)+'" autocomplete="tel"><div class="adr"><input id="ab" placeholder="بلوك" value="'+esc(cf.ab)+'" autocomplete="off"><input id="aw" placeholder="عمارة" value="'+esc(cf.aw)+'" autocomplete="off"><input id="ap" placeholder="شقة" value="'+esc(cf.ap)+'" autocomplete="off"></div><input id="ci" placeholder="رمز دعوة صديقك / رمز ترويجي (اختياري)" value="'+esc(cf.ci)+'" autocomplete="off" autocapitalize="characters"><div id="cinote">'+codeNote()+'</div></div><div class="or">أو</div><div class="sec"><div class="sh">عميل قديم</div><input id="cc" placeholder="كود العميل" inputmode="numeric" value="'+esc(cf.cc)+'" autocomplete="off"><div id="ccnote">'+custNote()+'</div></div><div class="warn" id="bw" style="display:'+(both()?'block':'none')+';margin-top:10px">لا يمكن اختيار عميل جديد وقديم في نفس الوقت</div></div>'+payHtml()+'<div class="f"><div class="warn" id="cmsg" style="display:none"></div><button class="btn" id="go"'+(ok&&formOk()&&payM?'':' data-off="1"')+'>تأكيد الطلب</button><button class="btn ghost" id="cl">متابعة التسوق</button></div>';
 document.getElementById('pn').innerHTML=h;document.getElementById('sh').classList.add('show');
 if(ccode()&&CS.c!==ccode())codeChanged();
 if(kcode()&&KS.c!==kcode())custChanged();
}

function done(res){
 var msg=esc(tx('thanks')),sub=mode==='sched'?'موعد التوصيل: '+slotLabel(curSlot()):'',onl=payM==='online',s=S.site||{};
 if(res.code)ls(ST.code,String(res.code));
 cart={};mod=null;payM='';cf={cn:'',cp:'',ab:'',aw:'',ap:'',ci:'',cc:''};CS={c:'',r:null,busy:false};KS={c:'',ok:null,busy:false};saveCart();ls(ST.pend,null);render();
 document.getElementById('sh').classList.add('show');
 document.getElementById('pn').innerHTML='<div style="text-align:center;padding:10px 0 6px"><img class="logo" src="'+LOGO+'" alt="" style="width:120px"><div class="orn"></div><h2 style="font-size:28px;line-height:1.5">'+msg+'</h2>'+
  (res.id?'<div class="oid">رقم طلبك <b dir="ltr">#'+esc(res.id)+'</b></div>':'')+
  (res.disc>0?'<div class="pnote" style="margin:0 0 10px">🎁 خصم '+money(res.disc)+' — إجمالي فاتورتك '+money(res.total)+'</div>':'')+
  (sub?'<p style="color:var(--mute);margin:0 0 6px">'+esc(sub)+'</p>':'')+
  (res.isNew&&res.code?'<div class="newc">كود العميل بتاعك <b dir="ltr">'+esc(res.code)+'</b><br><small>احتفظ بيه، في الطلب الجاي اكتبه بس بدل بياناتك</small></div>':'')+
  (onl?'<div class="pnote" style="margin:6px 0 10px">برجاء ارسال إيصال التحويل على الواتساب</div>'+(s.phone?'<a class="btn" href="'+esc(waLink(s.phone))+'" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none;margin-bottom:8px">ابعت الإيصال على الواتساب</a>':''):'')+
  '<button class="btn" id="cl" style="margin-top:14px;width:100%">تمام</button></div>';
}

function rid(){var a='';try{var b=new Uint8Array(12);crypto.getRandomValues(b);for(var i=0;i<b.length;i++)a+=('0'+b[i].toString(16)).slice(-2)}catch(e){a=Date.now().toString(36)+Math.random().toString(36).slice(2)}return a}
function postJSON(body){
 return fetch(API,{method:'POST',body:JSON.stringify(body),redirect:'follow'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()});
}
function wait(ms){return new Promise(function(ok){setTimeout(ok,ms)})}
function checkStatus(k,tries){
 return fetch(API+(API.indexOf('?')>-1?'&':'?')+'api=status&k='+encodeURIComponent(k)).then(function(r){return r.json()}).then(function(j){if(j&&j.found)return {ok:true,id:j.id};if(tries<=1)return null;return wait(1800).then(function(){return checkStatus(k,tries-1)})}).catch(function(){if(tries<=1)return null;return wait(1800).then(function(){return checkStatus(k,tries-1)})});
}
function send(){
 if(sending)return;
 readForm();
 if(mode==='fast'&&fastClosed()){mode='sched';cat=2;saveCart();sheet();showMsg('التوصيل السريع يبدأ من <span class="n9">'+FAST_FROM+'</span> صباحًا، اختار ميعاد التوصيل وأكد طلبك',true);return}
 if(total()<MIN){showMsg('الحد الأدنى للطلب '+MIN+' ج');return}
 if(both()){showMsg('لا يمكن اختيار عميل جديد وقديم في نفس الوقت');return}
 var kc=kcode();
 if(kc&&KS.c===kc&&KS.ok===false){showMsg(BADC,true);return}
 if(!formOk()){showMsg('اكتب كود العميل القديم، أو املأ بيانات العميل الجديد كاملة (الاسم ورقم التليفون والبلوك والعمارة والشقة)');return}
 if(!payM){showMsg('اختار طريقة الدفع');return}
 if(!API){showMsg('الطلب مش متاح دلوقتي، كلمنا على الواتساب');return}
 var cc=en(cf.cc).trim(),ic=ccode();
 if(cc&&(KS.c!==cc||KS.busy)){var gk=document.getElementById('go');if(gk){gk.textContent='جاري التأكد من كود العميل...';gk.setAttribute('data-off','1')}
  sending=true;clearTimeout(ktm);lookCust(cc).then(function(){sending=false;if(gk)gk.textContent='تأكيد الطلب';updGo();if(KS.ok===false){showMsg(BADC,true);return}KS.busy=false;send()});return}
 if(!cc&&ic&&(CS.c!==ic||!CS.r)){var gb=document.getElementById('go');if(gb){gb.textContent='جاري التأكد من الرمز...';gb.setAttribute('data-off','1')}
  sending=true;lookCode(ic).then(function(){sending=false;if(gb)gb.textContent='تأكيد الطلب';updGo();if(CS.r)send();else showMsg('مش قادرين نتأكد من الرمز دلوقتي، جرب تاني أو امسح الرمز')});return}
 if(!cc&&ic&&CS.r&&!CS.r.ok){showMsg('رمز الدعوة / الرمز الترويجي مش صحيح، اتأكد منه أو امسحه');return}
 var body={api:'order',pay:payM==='online'?'اونلاين':'كاش',dl:dlShort(),total:Math.round(total()*100)/100,
  d:Object.keys(cart).map(function(k){var x=item(k);return [x.n,x.id,cart[k]]})};
 if(cc)body.code=cc;else{body.cn=cf.cn.trim();body.cp=en(cf.cp).trim();body.ca=adr();body.inv=ic}
 var sig=JSON.stringify(body),pend=ls(ST.pend);
 body.k=(pend&&pend.sig===sig)?pend.k:rid();
 ls(ST.pend,{k:body.k,sig:sig});
 sending=true;var b=document.getElementById('go');if(b){b.textContent='جاري إرسال طلبك...';b.setAttribute('data-off','1')}
 var m=document.getElementById('cmsg');if(m)m.style.display='none';
 function finish(res){
  sending=false;
  if(res&&res.ok){done(res);return}
  var bb=document.getElementById('go');if(bb){bb.textContent='تأكيد الطلب';updGo()}
  if(res&&res.code==='gone'&&res.items){
   var names=res.items.map(nz);Object.keys(cart).forEach(function(k){var x=item(k);if(x&&names.indexOf(nz(x.n))>-1)delete cart[k]});saveCart();
   loadCatalog(true).then(function(){render();if(Object.keys(cart).length){sheet();showMsg(res.msg+'، شيلناها من السلة. راجع طلبك واضغط تأكيد تاني')}else{note=res.msg;render()}});
   return;
  }
  if(res&&res.code==='badcode'){CS.r={ok:false};updDisc()}
  if(res&&res.code==='badcust'){KS={c:kcode(),ok:false,busy:false};updCust();updGo();showMsg(BADC,true);return}
  if(res&&res.msg){showMsg(res.msg);return}
  var s=S.site||{};
  showMsg('النت فيه مشكلة وطلبك ما وصلش لسه. دوس "تأكيد الطلب" تاني، مش هيتكرر'+(s.phone?'<br><a href="'+esc(waLink(s.phone))+'" target="_blank" rel="noopener">أو اطلب على الواتساب</a>':''),true);
 }
 postJSON(body).then(finish).catch(function(){
  // لو الرد ما وصلش، نبعت تاني بطريقة أبسط ونتأكد من وصوله
  fetch(API,{method:'POST',mode:'no-cors',body:JSON.stringify(body)}).catch(function(){}).then(function(){return wait(1500)}).then(function(){return checkStatus(body.k,5)}).then(finish);
 });
}

function apply(j){
 S.items=(j.items||[]).map(function(x){x.id=Number(x.id);return x});S.byId={};S.items.forEach(function(x){S.byId[x.id]=x});
 S.site=j.site||{};S.ts=j.ts||Date.now();S.loaded=true;S.error='';
 Object.keys(cart).forEach(function(k){if(!avail(item(k)))delete cart[k]});
}
function loadCatalog(force){
 if(!API){S.error='الموقع لسه متربطش، كلمنا على الواتساب';return Promise.resolve()}
 return fetch(API+(API.indexOf('?')>-1?'&':'?')+'api=catalog&t='+Date.now()).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(function(j){
  if(!j||!j.ok)throw new Error('bad');ls(ST.cat,j);apply(j);
 }).catch(function(){if(!S.loaded)S.error='مش قادرين نحمّل المنتجات دلوقتي، اتأكد من النت وجرب تاني'});
}

root.addEventListener('click',function(e){
 var t=e.target,d;
 if(t.id==='retry'){S.error='';render();loadCatalog().then(render);return}
 if(d=t.closest('[data-m]')){var nm=d.dataset.m;if(nm==='fast'){var rm=0;Object.keys(cart).forEach(function(k){var x=item(k);if(x&&x.c==2){delete cart[k];rm++}});if(rm)note='الخضار الجاهز للطبخ متاح مع التوصيل بموعد فقط، فاتشال من السلة';if(cat==2)cat=0}mode=nm;if(nm==='sched')cat=2;saveCart();render();return}
 if(d=t.closest('[data-c]')){cat=+d.dataset.c;qs='';render();return}
 if(d=t.closest('[data-t]')){var i=+d.dataset.t;mod={id:i,q:cart[i]||0};showModal();return}
 if(d=t.closest('[data-pm]')){readForm();payM=d.dataset.pm;if(payM==='online'){var pl=payLink();if(pl){try{window.open(pl,'_blank')}catch(er){}}}var sc=document.getElementById('pn').scrollTop;sheet();document.getElementById('pn').scrollTop=sc;return}
 if(d=t.closest('[data-r]')){readForm();delete cart[d.dataset.r];saveCart();render();if(Object.keys(cart).length)sheet();return}
 if(t.id==='sx'){qs='';var i2=document.getElementById('sq');i2.value='';updSearch();i2.focus();return}
 if(t.id==='mclose'||t.id==='ov'){mod=null;showModal();return}
 if(t.id==='madd'){if(!mod.q)return;cart[mod.id]=mod.q;mod=null;saveCart();render();return}
 if(t.id==='mdel'){delete cart[mod.id];mod=null;saveCart();render();return}
 if(t.closest('#oc')){sheet();return}
 if(t.id==='cl'||t.id==='sh'){if(sending)return;readForm();document.getElementById('sh').classList.remove('show');return}
 if(t.id==='go'){send();return}
});
var FID=['cn','cp','ab','aw','ap','ci','cc'];
['change','keyup','focusout'].forEach(function(ev){root.addEventListener(ev,function(e){var i=e.target&&e.target.id;if(FID.indexOf(i)>-1)updGo()})});
root.addEventListener('input',function(e){var iid=e.target.id;if(FID.indexOf(iid)>-1){cf[iid]=e.target.value;if(iid==='ci')codeChanged();if(iid==='cc')custChanged();updGo();return}if(iid==='sq'){qs=e.target.value;updSearch()}});
root.addEventListener('change',function(e){
 var t=e.target;
 if(t.id==='mq'){mod.q=+t.value;var x=item(mod.id);document.getElementById('wv').textContent=ql(mod.q,x.u);document.getElementById('mt').textContent=money(x.p*mod.q);document.getElementById('madd').disabled=false}
 else if(t.id==='slot'){slotKey=t.value;render()}
 else if(t.dataset.q){readForm();cart[t.dataset.q]=+t.value;saveCart();var s=document.getElementById('pn').scrollTop;render();sheet();document.getElementById('pn').scrollTop=s}
});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&Date.now()-S.ts>120000&&!document.querySelector('.sheet.show')&&!mod)loadCatalog().then(render)});

var wasClosed=fastClosed();
setInterval(function(){var c=fastClosed();if(c===wasClosed)return;wasClosed=c;if(c&&mode==='fast'){mode='sched';cat=2;saveCart()}if(!document.querySelector('.sheet.show')&&!mod)render()},60000);
(function init(){
 var c=ls(ST.cart);if(c&&c.cart)cart=c.cart;
 mode='sched';cat=2; // الموقع بيفتح دايماً على التوصيل بموعد
 var cached=ls(ST.cat);if(cached&&cached.ok)apply(cached);
 render();
 loadCatalog().then(function(){if(!document.querySelector('.sheet.show')&&!mod)render()});
})();
})();
