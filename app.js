/* rehost.expert — interactions. All contact goes through the Google Form (no email links). */
(function(){
  var top=document.querySelector('.top');
  function onScroll(){top.classList.toggle('scrolled',window.scrollY>8);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  // mobile navigation: hamburger opens a panel; Esc / outside tap / a link closes it
  var navBtn=document.getElementById('nav-toggle'),navPanel=document.getElementById('nav-panel');
  if(top&&navBtn&&navPanel){
    var navBack=document.createElement('div');
    navBack.className='nav-backdrop';
    navBack.hidden=true;
    top.insertAdjacentElement('afterend',navBack);
    function navOpen(){
      navBtn.setAttribute('aria-expanded','true');
      navBtn.setAttribute('aria-label','Close menu');
      navPanel.hidden=false;
      navBack.hidden=false;
      top.classList.add('is-nav-open');
      document.body.classList.add('nav-open');
    }
    function navClose(opts){
      if(navPanel.hidden)return;
      var back=navPanel.contains(document.activeElement);
      navBtn.setAttribute('aria-expanded','false');
      navBtn.setAttribute('aria-label','Open menu');
      navPanel.hidden=true;
      navBack.hidden=true;
      top.classList.remove('is-nav-open');
      document.body.classList.remove('nav-open');
      if(back && !(opts&&opts.leaveFocus))navBtn.focus();
    }
    navBtn.addEventListener('click',function(e){e.stopPropagation();if(navPanel.hidden)navOpen();else navClose();});
    navBack.addEventListener('click',function(){navClose();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')navClose();});
    document.addEventListener('rehost:close-nav',function(){navClose({leaveFocus:true});});
    navPanel.addEventListener('click',function(e){if(e.target.closest('a'))navClose({leaveFocus:true});});
    if(window.matchMedia){
      var mq=window.matchMedia('(min-width:981px)');
      var onMq=function(ev){if(ev.matches)navClose();};
      if(mq.addEventListener)mq.addEventListener('change',onMq);
      else if(mq.addListener)mq.addListener(onMq);
    }
  }

  // reveal on scroll
  var rv=document.querySelectorAll('.rv,.stat');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rv.forEach(function(el){io.observe(el);});
  } else rv.forEach(function(el){el.classList.add('in');});

  // count-up stats
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nums=document.querySelectorAll('[data-count]');
  if(!reduce&&'IntersectionObserver' in window){
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var el=e.target,to=+el.dataset.count,t0=null;
      function step(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/1200);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);}
      el.textContent='0';requestAnimationFrame(step);});},{threshold:.4});
    nums.forEach(function(n){co.observe(n);});
  }

  // chat bubbles appear one by one
  var chat=document.getElementById('chat');
  if(chat){var bubs=chat.querySelectorAll('.bub');
    function play(){bubs.forEach(function(b,i){setTimeout(function(){b.classList.add('in');if(!reduce&&i>0)chat.scrollTo({top:b.offsetTop-60,behavior:'smooth'});},reduce?0:400+i*1100);});}
    if('IntersectionObserver' in window&&!reduce){var po=new IntersectionObserver(function(es){if(es[0].isIntersecting){play();po.disconnect();}},{threshold:.3});po.observe(chat);}else play();}

  // tabs (food / drink)
  var tabs=[].slice.call(document.querySelectorAll('[role=tab]'));
  function sel(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));p.hidden=!on;if(on)p.querySelectorAll('.rv').forEach(function(r){r.classList.add('in');});});}
  tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t);});t.addEventListener('keydown',function(e){var k=e.key,j=null;if(k==='ArrowRight')j=(i+1)%tabs.length;if(k==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;if(j!==null){e.preventDefault();sel(tabs[j]);tabs[j].focus();}});});

  // ---- shared contact details: selection panel + Get in touch (one validation, one saved copy in localStorage) ----
  var g=function(id){return document.getElementById(id);};
  var CKEYS=['name','biz','email','phone','site'],CKEY='rehost-contact-v1',cd={};
  try{var raw=JSON.parse(localStorage.getItem(CKEY)||'{}')||{};CKEYS.forEach(function(k){cd[k]=raw[k]||raw['f-'+k]||'';});if(!cd.site)cd.site=localStorage.getItem('rehost-site-v1')||'';}catch(e){CKEYS.forEach(function(k){cd[k]=cd[k]||'';});}
  function saveCd(){try{localStorage.setItem(CKEY,JSON.stringify(cd));}catch(e){}}
  // Pre-fill what we already know from an email or invoice link
  // (?name=&biz=&email=&phone=&site=&notes=&ref=). Aliases: business, website, url, message, help.
  var qNotes='';
  try{
    var lq=new URLSearchParams(location.search),lhit=false;
    var alias={business:'biz',website:'site',url:'site'};
    Object.keys(alias).forEach(function(a){if(!(lq.get(alias[a])||'').trim()&&(lq.get(a)||'').trim())lq.set(alias[a],lq.get(a));});
    CKEYS.forEach(function(k){var v=(lq.get(k)||'').trim().slice(0,120);if(v){cd[k]=v;lhit=true;}});
    if(lhit)saveCd();
    qNotes=(lq.get('notes')||lq.get('message')||lq.get('help')||'').trim().slice(0,1000);
  }catch(e){}
  function fillNotes(){if(!qNotes)return;['f-notes','c-help'].forEach(function(id){var el=g(id);if(el&&!el.value)el.value=qNotes;});}
  var EMPTY={name:'Please enter your name.',biz:'Please enter your business name.',email:'Please enter your email address.',phone:'Please enter your phone number.',site:'Please enter your website address.'};
  function fieldError(k,v){v=(v||'').trim();
    if(!v)return EMPTY[k];
    if(k==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return 'Please enter a valid email address, like you@yourbusiness.ie.';
    if(k==='phone'&&(v.replace(/\D/g,'').length<7||/[^\d\s()+.\-]/.test(v)))return 'Please enter a valid phone number, like 087 123 4567.';
    if(k==='site'&&(/\s/.test(v)||!/[a-z0-9-]\.[a-z]{2,}/i.test(v)))return 'Please enter a website address, like yourbusiness.ie.';
    return '';}
  var groups=[];
  function ContactGroup(pre,msgId,onChange){
    var grp={pre:pre,onChange:onChange};
    grp.show=function(k,msg){var el=g(pre+k),er=g(pre+k+'-err');if(!el)return;if(msg){el.setAttribute('aria-invalid','true');er.textContent=msg;er.hidden=false;}else{el.removeAttribute('aria-invalid');er.textContent='';er.hidden=true;}};
    grp.values=function(){var v={};CKEYS.forEach(function(k){v[k]=g(pre+k).value.trim();});return v;};
    grp.allOk=function(){return CKEYS.every(function(k){return !fieldError(k,g(pre+k).value);});};
    grp.validate=function(){var first=null;CKEYS.forEach(function(k){var m=fieldError(k,g(pre+k).value);grp.show(k,m);if(m&&!first)first=k;});
      var fm=g(msgId);if(first){fm.textContent='Please fill in all the required fields before sending.';fm.hidden=false;g(pre+first).focus();}else{fm.hidden=true;fm.textContent='';}
      return !first;};
    grp.tidy=function(k){var el=g(pre+k);if(el.getAttribute('aria-invalid')&&!fieldError(k,el.value))grp.show(k,'');if(!g(msgId).hidden&&grp.allOk())g(msgId).hidden=true;};
    CKEYS.forEach(function(k){var el=g(pre+k);el.value=cd[k]||'';
      el.addEventListener('input',function(){cd[k]=el.value;saveCd();
        groups.forEach(function(o){if(o!==grp){var x=g(o.pre+k);if(x.value!==el.value)x.value=el.value;o.tidy(k);}if(o.onChange)o.onChange();});
        grp.tidy(k);});
      el.addEventListener('blur',function(){if(el.getAttribute('aria-invalid'))grp.show(k,fieldError(k,el.value));});});
    groups.push(grp);return grp;}
  // Send values to the Google Form: a normal HTML form POST into a hidden iframe (no relay, no email links).
  function gfSend(fid,v,btn,label,done){
    var post=g(fid+'-post'),sink=g(fid+'-sink'),t=btn.querySelector('.csend-t')||btn.lastChild,timer;
    post.querySelectorAll('[data-k]').forEach(function(inp){inp.value=v[inp.dataset.k]||'';});
    function finish(ok){sink.removeEventListener('load',onLoad);clearTimeout(timer);btn.disabled=false;btn.classList.remove('sending');t.textContent=label;done(ok);}
    function onLoad(){finish(true);}
    sink.addEventListener('load',onLoad);
    btn.disabled=true;btn.classList.add('sending');t.textContent='Sending\u2026';
    timer=setTimeout(function(){finish(false);},20000);
    post.submit();}

  // Get in touch form
  if(g('c-form')){
    var cgrp=ContactGroup('c-','c-msg',null),cform=g('c-form'),cthx=g('c-thanks');
    cform.addEventListener('submit',function(e){e.preventDefault();
      if(!cgrp.validate())return;
      var v=cgrp.values();v.help=g('c-help').value.trim();
      gfSend('c',v,g('c-send'),'Send message',function(ok){
        var m=g('c-msg');
        if(!ok){m.textContent='Sorry, that didn\u2019t send. Please try again, or use the Google Form link below.';m.hidden=false;return;}
        cform.hidden=true;cthx.hidden=false;g('c-help').value='';
        g('c-card').scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});cthx.focus({preventScroll:true});});});
    g('c-again').addEventListener('click',function(){cthx.hidden=true;cform.hidden=false;g('c-help').focus();});
  }
  fillNotes();

  // services picker
  var rows=[].slice.call(document.querySelectorAll('.svc'));
  if(!rows.length||!document.getElementById('send'))return;
  var KEY='rehost-picks-v7',state={picks:{},extras:{}};
  try{var raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{};state.picks=raw.picks||{};state.extras=raw.extras||{};}catch(e){state={picks:{},extras:{}};}
  function extrasOf(r){return r.querySelectorAll('.svc-extras input, .svc-extras select');}
  function extrasOn(r,on){extrasOf(r).forEach(function(el){el.disabled=!on;});}
  function readExtras(r){
    var i=r.dataset.i,x={},freq=r.querySelector('#s'+i+'-freq'),name=r.querySelector('#s'+i+'-name'),custom=r.querySelector('#s'+i+'-custom'),mon=r.querySelector('#s'+i+'-mon'),rep=r.querySelector('#s'+i+'-replies'),draft=r.querySelector('#s'+i+'-draft');
    if(freq)x.freq=freq.value;if(name)x.name=name.value;if(custom)x.custom=custom.value;if(mon)x.mon=!!mon.checked;if(rep)x.replies=!!rep.checked;if(draft)x.draft=!!draft.checked;
    return x;}
  function writeExtras(r,x){
    if(!x)return;
    var i=r.dataset.i,freq=r.querySelector('#s'+i+'-freq'),name=r.querySelector('#s'+i+'-name'),custom=r.querySelector('#s'+i+'-custom'),mon=r.querySelector('#s'+i+'-mon'),rep=r.querySelector('#s'+i+'-replies'),draft=r.querySelector('#s'+i+'-draft');
    if(freq&&x.freq)freq.value=x.freq;if(name&&typeof x.name==='string')name.value=x.name;if(custom&&typeof x.custom==='string')custom.value=x.custom;if(mon)mon.checked=!!x.mon;if(rep)rep.checked=!!x.replies;if(draft)draft.checked=!!x.draft;}
  function isPicked(v){return v==='yes'||v==='maybe';}
  function syncCustom(r){
    var i=r.dataset.i,freq=r.querySelector('#s'+i+'-freq'),wrap=r.querySelector('.freq-custom');
    if(!wrap)return;
    var on=isPicked(state.picks[i])&&freq&&freq.value==='Custom';
    wrap.hidden=!on;
    var inp=wrap.querySelector('input');if(inp)inp.disabled=!on;}
  rows.forEach(function(r){
    var i=r.dataset.i;
    if(state.picks[i]){var inp=r.querySelector('input[type=radio][value="'+state.picks[i]+'"]');if(inp){inp.checked=true;r.dataset.v=state.picks[i];}}
    writeExtras(r,state.extras[i]);
    extrasOn(r,isPicked(state.picks[i]));
    syncCustom(r);
    r.addEventListener('change',function(e){
      if(e.target.matches('input[type=radio][name="s'+i+'"]')){
        state.picks[i]=e.target.value;r.dataset.v=e.target.value;extrasOn(r,isPicked(e.target.value));
      }
      syncCustom(r);
      if(r.dataset.extra)state.extras[i]=readExtras(r);
      save();render();});});
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
  var $=function(id){return document.getElementById(id);};
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
  function pick(v){return rows.filter(function(r){return state.picks[r.dataset.i]===v;});}
  function nm(r){return r.dataset.name.replace(/&amp;/g,'&');}
  function label(r){
    var n=nm(r),x=isPicked(state.picks[r.dataset.i])?(state.extras[r.dataset.i]||readExtras(r)):{},bits=[];
    if(x.name&&x.name.trim())n=n+': '+x.name.trim();
    if(x.mon)bits.push('Message monitoring');
    if(x.replies)bits.push('AI assisted replies');
    if(x.draft)bits.push('AI assistant for drafting replies');
    if(bits.length)n+=' — '+bits.join(', ');
    if(x.freq==='Custom'){var c=(x.custom||'').trim();n+=' — Custom'+(c?': '+c:'');}
    else if(x.freq)n+=' — '+x.freq;
    return n;}
  function suggest(yes){
    var names=yes.map(nm),has=function(a){return a.some(function(x){return names.indexOf(x)>-1;});};
    if(!names.length)return null;
    var pkg=has(['Instagram','Facebook','AI Email inbox management','WhatsApp morning summary','Posts','X (Twitter)','TikTok','Google reviews','Other review sites'])?'Full service':has(['Area pages with maps','News and events page','Listings and directories','Book Direct & Availability Calendar'])?'Growth':'Essentials';
    var add=names.filter(function(x){return /ordering automation|SEO|AI consultation/.test(x);});
    if(add.length===names.length)pkg=null;
    return {pkg:pkg,add:add};
  }
  function render(){
    var y=pick('yes'),m=pick('maybe'),n=pick('no'),left=rows.length-y.length-m.length-n.length;
    $('c-yes').textContent=y.length;$('c-maybe').textContent=m.length;$('c-no').textContent=n.length;$('c-left').textContent=left;
    var tot=rows.length,mt=document.querySelector('.meter');
    mt.querySelector('.y').style.width=(y.length/tot*100)+'%';mt.querySelector('.m').style.width=(m.length/tot*100)+'%';mt.querySelector('.n').style.width=(n.length/tot*100)+'%';
    $('sum-sub').textContent=(y.length+m.length+n.length)?(left?left+' still to decide.':'All '+tot+' decided. Nice one.'):'Nothing picked yet. Choose Yes, Maybe or No for each service.';
    var h='';
    if(y.length)h+='<h4>Yes</h4><ul>'+y.map(function(r){return '<li>'+esc(label(r))+'</li>';}).join('')+'</ul>';
    if(m.length)h+='<h4>Maybe</h4><ul>'+m.map(function(r){return '<li>'+esc(label(r))+'</li>';}).join('')+'</ul>';
    $('chosen').innerHTML=h||'<p class="empty">Your Yes and Maybe picks will appear here.</p>';
    var s=suggest(y),sg=$('suggest');
    if(s){sg.hidden=false;sg.innerHTML=(s.pkg?'Closest package: <b>'+s.pkg+'</b>'+(s.add.length?' + '+s.add.length+' extra'+(s.add.length>1?'s':''):''):'<b>'+esc(s.add.join(', '))+'</b> on its own, or with any package')+'. <a href="#packages" style="color:#5eead4">See packages</a>';}else sg.hidden=true;
    updateGroupPicked();
  }
  function updateGroupPicked(){
    document.querySelectorAll('#svc-list .group').forEach(function(g){
      var el=g.querySelector('.group-picked');if(!el)return;
      var n=[].slice.call(g.querySelectorAll('.svc')).filter(function(r){return isPicked(state.picks[r.dataset.i]);}).length;
      if(n){el.hidden=false;el.textContent=n+' picked';}else{el.hidden=true;el.textContent='';}
    });
  }
  function setGroupOpen(g,open){
    g.classList.toggle('is-open',!!open);
    var btn=g.querySelector('.group-toggle'),panel=g.querySelector('.group-body');
    if(btn)btn.setAttribute('aria-expanded',open?'true':'false');
    if(panel){
      panel.setAttribute('aria-hidden',open?'false':'true');
      if(open) panel.removeAttribute('inert');
      else panel.setAttribute('inert','');
    }
  }
  (function(){
    var groups=[].slice.call(document.querySelectorAll('#svc-list .group'));
    var mobile=window.matchMedia('(max-width:640px)').matches;
    groups.forEach(function(g,i){setGroupOpen(g, !mobile && i===0);});
    groups.forEach(function(g){
      var btn=g.querySelector('.group-toggle');if(!btn)return;
      btn.addEventListener('click',function(){setGroupOpen(g,!g.classList.contains('is-open'));});
    });
  })();
  // live search: filter cards by title and description; does not change picks
  var clearSvcSearch=function(){};
  (function(){
    var input=$('svc-q'),clear=$('svc-q-clear'),empty=$('svc-q-status'),form=$('svc-search');
    if(!input)return;
    var groups=[].slice.call(document.querySelectorAll('#svc-list .group'));
    var saved=null;
    function hay(r){
      var n=r.querySelector('.svc-name'),p=r.querySelector('h4 + p');
      return ((n?n.textContent:'')+' '+(p?p.textContent:'')).toLowerCase();
    }
    function filter(){
      var raw=input.value||'',q=raw.trim().toLowerCase();
      if(clear)clear.hidden=!raw;
      if(!q){
        rows.forEach(function(r){r.hidden=false;});
        groups.forEach(function(g,i){g.hidden=false;if(saved)setGroupOpen(g,saved[i]);});
        saved=null;
        if(empty){empty.hidden=true;empty.textContent='';}
        return;
      }
      if(!saved)saved=groups.map(function(g){return g.classList.contains('is-open');});
      var any=0;
      groups.forEach(function(g){
        var hits=0;
        [].slice.call(g.querySelectorAll('.svc')).forEach(function(r){
          var on=hay(r).indexOf(q)!==-1;
          r.hidden=!on;
          if(on)hits++;
        });
        g.hidden=!hits;
        if(hits){setGroupOpen(g,true);any+=hits;}
      });
      if(empty){
        if(any){empty.hidden=true;empty.textContent='';}
        else{empty.hidden=false;empty.textContent='No services match';}
      }
    }
    input.addEventListener('input',filter);
    if(form)form.addEventListener('submit',function(e){e.preventDefault();});
    if(clear)clear.addEventListener('click',function(){input.value='';filter();input.focus();});
    input.addEventListener('keydown',function(e){if(e.key==='Escape'&&input.value){e.preventDefault();input.value='';filter();}});
    clearSvcSearch=function(){input.value='';filter();};
  })();
  // share/copy a stable link to one service; does not change picks
  var CANON='https://rehost.expert/';
  function serviceUrl(id){return CANON+'#'+id;}
  function isMobileShare(){
    return !!(navigator.share && (window.matchMedia('(max-width:640px)').matches || window.matchMedia('(pointer: coarse)').matches));
  }
  function copyText(text,done){
    function fallback(){
      var ta=document.createElement('textarea');
      ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);ta.select();
      var ok=false;try{ok=document.execCommand('copy');}catch(e){}
      document.body.removeChild(ta);done(ok);
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){done(true);}).catch(fallback);
    } else fallback();
  }
  function linkToast(btn,msg){
    var tip=document.getElementById('svc-link-toast');
    if(!tip){
      tip=document.createElement('div');
      tip.id='svc-link-toast';
      tip.className='svc-link-toast';
      tip.setAttribute('role','status');
      tip.setAttribute('aria-live','polite');
      document.body.appendChild(tip);
    }
    tip.textContent=msg;tip.hidden=false;
    var r=btn.getBoundingClientRect(),pad=8;
    var w=tip.offsetWidth,h=tip.offsetHeight;
    var left=Math.min(Math.max(pad,r.left+r.width/2-w/2),window.innerWidth-w-pad);
    var top=r.top-h-8;if(top<pad)top=r.bottom+8;
    tip.style.left=left+'px';tip.style.top=top+'px';
    clearTimeout(linkToast.t);
    linkToast.t=setTimeout(function(){tip.hidden=true;},2000);
  }
  function shareLink(btn,url,title){
    function copied(){linkToast(btn,'Link copied');}
    if(isMobileShare()){
      var payload={title:title,text:title,url:url};
      var shareOk=!navigator.canShare||navigator.canShare(payload);
      if(shareOk){
        navigator.share(payload).catch(function(){copyText(url,function(ok){if(ok)copied();});});
        return;
      }
    }
    copyText(url,function(ok){if(ok)copied();});
  }
  rows.forEach(function(r){
    var btn=r.querySelector('.svc-link:not(.group-link)');if(!btn)return;
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      if(!r.id)return;
      shareLink(btn,serviceUrl(r.id),nm(r));
    });
  });
  document.querySelectorAll('.group-link').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var g=btn.closest('.group');if(!g||!g.id)return;
      var title=(g.querySelector('.group-title')||{}).textContent||'services';
      shareLink(btn,serviceUrl(g.id),title+' services');
    });
  });
  var flashT=null;
  function flashTarget(el){
    el.classList.remove('is-target');
    void el.offsetWidth;
    el.classList.add('is-target');
    clearTimeout(flashT);
    flashT=setTimeout(function(){el.classList.remove('is-target');},2500);
  }
  function openPickerHash(){
    var h=(location.hash||'').replace(/^#/,'');
    if(/^services-[a-z0-9-]+$/.test(h)){
      var g=document.getElementById(h);
      if(!g||!g.classList.contains('group'))return;
      clearSvcSearch();
      g.classList.add('in');
      setGroupOpen(g,true);
      flashTarget(g);
      setTimeout(function(){g.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});},360);
      return;
    }
    if(!/^service-[a-z0-9-]+$/.test(h))return;
    var card=document.getElementById(h);
    if(!card||!card.classList.contains('svc'))return;
    clearSvcSearch();
    var g=card.closest('.group');
    if(g){g.classList.add('in');setGroupOpen(g,true);}
    flashTarget(card);
    setTimeout(function(){card.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});},360);
  }
  window.addEventListener('hashchange',openPickerHash);
  if(/^#services?-/.test(location.hash||''))setTimeout(openPickerHash,0);

  function selectionText(){
    var L=['Services selection:',''];
    ['yes','maybe','no'].forEach(function(v){var list=pick(v);if(!list.length)return;L.push((v==='yes'?'Yes':v==='maybe'?'Maybe':'No')+' ('+list.length+')');list.forEach(function(r){L.push('- '+label(r)+' ['+r.dataset.area+']');});L.push('');});
    var undec=rows.filter(function(r){return !state.picks[r.dataset.i];}).length;
    if(undec)L.push('Not decided: '+undec+' service'+(undec>1?'s':''),'');
    var s=suggest(pick('yes'));if(s)L.push(s.pkg?'Closest package: '+s.pkg+(s.add.length?' + '+s.add.join(', '):''):'Extras only: '+s.add.join(', '),'');
    var notes=$('f-notes').value.trim();if(notes)L.push('Notes:',notes);
    if(LEADREF)L.push('','Lead ref: '+LEADREF+' (from email)');
    return L.join('\n').trim();
  }
  // Email lead tracking: ?ref=CK-123&site=example.ie (kept for the visit; site pre-fills the form)
  var LEADREF='',qs=new URLSearchParams(location.search);
  try{var rr=(qs.get('ref')||'').toUpperCase();if(/^(CK-\d{1,4}|RE-INV-\d{4})$/.test(rr))sessionStorage.setItem('leadref',rr);LEADREF=sessionStorage.getItem('leadref')||'';}catch(e){}
  fillNotes();
  var pgrp=ContactGroup('f-','form-msg',null);
  var thanks=$('sel-thanks');
  $('sel-form').addEventListener('submit',function(e){e.preventDefault();thanks.hidden=true;
    if(!pgrp.validate())return;
    var v=pgrp.values();v.help=selectionText();
    gfSend('sel',v,$('send'),'Send my selection',function(ok){
      var m=$('form-msg');
      if(!ok){m.textContent='Sorry, that didn\u2019t send. Please try again.';m.hidden=false;return;}
      thanks.hidden=false;thanks.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest'});});});
  // "Book an AI consultation": mark AI consultation as Yes and jump to the selection panel
  function pickAI(){var r=rows.filter(function(x){return nm(x)==='AI consultation';})[0];if(!r)return;
    state.picks[r.dataset.i]='yes';r.dataset.v='yes';var inp=r.querySelector('input[value=yes]');if(inp)inp.checked=true;save();render();
    var g=r.closest('.group');if(g)setGroupOpen(g,true);
    var p=document.querySelector('aside.summary');if(p)p.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    var first=CKEYS.map(function(k){return $('f-'+k);}).filter(function(x){return !x.value.trim();})[0];if(first)setTimeout(function(){first.focus({preventScroll:true});},400);}
  document.querySelectorAll('[data-pick-ai]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();pickAI();});});
  $('reset').addEventListener('click',function(){state={picks:{},extras:{}};save();rows.forEach(function(r){delete r.dataset.v;r.querySelectorAll('input[type=radio]').forEach(function(i){i.checked=false;});r.querySelectorAll('.svc-extras input[type=text]').forEach(function(i){i.value='';});r.querySelectorAll('.svc-extras input[type=checkbox]').forEach(function(i){i.checked=false;});r.querySelectorAll('.svc-extras select').forEach(function(s){s.selectedIndex=s.querySelector('option[selected]')?Math.max(0,[].slice.call(s.options).findIndex(function(o){return o.hasAttribute('selected');})):0;});extrasOn(r,false);syncCustom(r);});render();});
  render();
  if(/[?&]pick=ai\b/.test(location.search))setTimeout(pickAI,300);
})();

// Info buttons: click/tap toggles a short explanation popover. Esc / outside click / focus leaving closes it.
(function(){
  var btns=[].slice.call(document.querySelectorAll('.info-btn'));
  if(!btns.length)return;
  var layer=document.createElement('div');
  layer.id='info-layer';
  document.body.appendChild(layer);
  var openBtn=null,openPop=null;
  function place(btn,pop){
    pop.hidden=false;
    var r=btn.getBoundingClientRect(),pad=8,vw=window.innerWidth,vh=window.innerHeight;
    var w=Math.min(320,vw-pad*2);
    pop.style.width=w+'px';
    var ph=pop.offsetHeight;
    var left=r.left+r.width/2-w/2,minL=pad,maxL=vw-w-pad;
    var col=document.getElementById('svc-list');
    if(col){var cr=col.getBoundingClientRect();if(cr.width>=w+pad*2){minL=Math.max(minL,cr.left+pad);maxL=Math.min(maxL,cr.right-w-pad);}}
    left=Math.min(Math.max(minL,left),maxL);
    var top=r.bottom+pad;
    if(top+ph>vh-pad && r.top-pad-ph>=pad)top=r.top-pad-ph;
    else if(top+ph>vh-pad)top=Math.max(pad,vh-ph-pad);
    pop.style.left=left+'px';
    pop.style.top=top+'px';
  }
  function closeInfo(){
    if(!openBtn)return;
    openBtn.setAttribute('aria-expanded','false');
    openBtn.removeAttribute('aria-describedby');
    if(openPop)openPop.hidden=true;
    openBtn=null;openPop=null;
  }
  function openInfo(btn){
    var id=btn.getAttribute('aria-controls'),pop=id&&document.getElementById(id);
    if(!pop)return;
    if(openBtn===btn){closeInfo();return;}
    closeInfo();
    layer.appendChild(pop);
    btn.setAttribute('aria-expanded','true');
    btn.setAttribute('aria-describedby',id);
    openBtn=btn;openPop=pop;
    place(btn,pop);
  }
  btns.forEach(function(btn){
    var pop=document.getElementById(btn.getAttribute('aria-controls'));
    if(pop)layer.appendChild(pop);
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      openInfo(btn);
    });
  });
  document.addEventListener('click',function(e){
    if(!openBtn)return;
    if(openBtn.contains(e.target)||(openPop&&openPop.contains(e.target)))return;
    closeInfo();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&openBtn){var b=openBtn;closeInfo();b.focus();}
  });
  document.addEventListener('focusin',function(e){
    if(!openBtn)return;
    if(openBtn===e.target||openBtn.contains(e.target)||(openPop&&openPop.contains(e.target)))return;
    closeInfo();
  });
  window.addEventListener('resize',function(){if(openBtn&&openPop)place(openBtn,openPop);});
  window.addEventListener('scroll',function(){if(openBtn&&openPop)place(openBtn,openPop);},true);
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href="#what-is-ai"], a[href="#what-is-seo"]');
    if(!a)return;
    e.stopPropagation();
    closeInfo();
  },true);
})();

// nav: underline the active menu item (clicked, scrolled-to, or #hash on load) and set aria-current
(function(){
  var links=[].slice.call(document.querySelectorAll('.menu a[href], .nav-panel-menu a[href]')),items=[];
  var here=location.pathname.replace(/\/$/,'/index.html').split('/').pop()||'index.html';
  links.forEach(function(a){var h=a.getAttribute('href'),i=h.indexOf('#');if(i<0)return;
    var pg=h.slice(0,i);if(pg&&pg!==here)return;
    var el=document.getElementById(h.slice(i+1));if(el)items.push({a:a,el:el,id:el.id});});
  // a link to the page you're on (e.g. Contact us on contact.html) stays underlined
  links.forEach(function(a){if(a.getAttribute('href')===here&&here!=='index.html'){a.classList.add('is-active');a.setAttribute('aria-current','page');}});
  if(!items.length)return;
  var cur=null,lockT=0,locked=false;
  function set(it){if(it===cur)return;cur=it;
    items.forEach(function(x){var on=x===it;x.a.classList.toggle('is-active',on);if(on)x.a.setAttribute('aria-current','true');else x.a.removeAttribute('aria-current');});}
  function spy(){if(locked)return;
    var y=window.innerHeight*.35,best=null,bestTop=-Infinity;
    items.forEach(function(x){if(!x.el)return;var r=x.el.getBoundingClientRect();if(r.top<=y&&r.bottom>90&&r.top>bestTop){best=x;bestTop=r.top;}});
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4){var last=null,lt=-Infinity;items.forEach(function(x){if(!x.el)return;var t=x.el.getBoundingClientRect().top;if(t<window.innerHeight&&t>lt){last=x;lt=t;}});if(last)best=last;}
    set(best);}
  var lockEnd=0;
  function unlock(){locked=false;spy();}
  function lock(fresh){var now=Date.now();if(fresh)lockEnd=now+1500;locked=true;clearTimeout(lockT);lockT=setTimeout(unlock,Math.max(0,Math.min(200,lockEnd-now)));}
  items.forEach(function(x){x.a.addEventListener('click',function(){set(x);lock(true);});});
  window.addEventListener('scroll',function(){if(locked)lock();else requestAnimationFrame(spy);},{passive:true});
  window.addEventListener('resize',spy);
  window.addEventListener('hashchange',function(){var h=location.hash.slice(1);items.forEach(function(x){if(x.id===h)set(x);});});
  var h0=location.hash.slice(1),f=items.filter(function(x){return x.id===h0;})[0];
  if(f){set(f);lock(true);}else spy();
})();

// site search: client-side index, dialog in the header on every page
(function(){
  var root=document.getElementById('site-search');
  if(!root)return;
  var back=document.getElementById('site-search-back');
  var dialog=document.getElementById('site-search-dialog');
  var form=document.getElementById('site-search-form');
  var input=document.getElementById('site-search-q');
  var clearBtn=document.getElementById('site-search-clear');
  var closeBtn=document.getElementById('site-search-close');
  var status=document.getElementById('site-search-status');
  var list=document.getElementById('site-search-results');
  var openers=[].slice.call(document.querySelectorAll('[data-open-search]'));
  var index=null, loading=false, pending=null, active=-1, opener=null, links=[];

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
  function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
  function tokens(s){return norm(s).replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(function(t){return t.length>=2;});}

  function setExpanded(on){
    openers.forEach(function(b){b.setAttribute('aria-expanded',on?'true':'false');});
  }

  function loadIndex(cb){
    if(index){if(cb)cb();return;}
    if(loading){pending=cb;return;}
    var link=document.getElementById('site-search-index');
    var url=link?link.getAttribute('href'):'search-index.json';
    loading=true;
    fetch(url,{credentials:'same-origin'}).then(function(r){
      if(!r.ok)throw new Error('index');
      return r.json();
    }).then(function(data){
      index=Array.isArray(data)?data:[];
      loading=false;
      var fn=pending||cb;pending=null;
      if(fn)fn();
    }).catch(function(){
      loading=false;index=[];pending=null;
      if(!root.hidden) status.textContent='Search is unavailable right now.';
    });
  }

  function highlight(s,terms){
    var out=esc(s);
    terms.slice().sort(function(a,b){return b.length-a.length;}).forEach(function(t){
      out=out.replace(new RegExp('('+escRe(t)+')','gi'),'<mark>$1</mark>');
    });
    return out;
  }

  function snippet(text,terms){
    var raw=text||'';
    var lower=norm(raw);
    var at=-1,len=0;
    terms.forEach(function(t){
      var i=lower.indexOf(t);
      if(i>=0&&(at<0||i<at)){at=i;len=t.length;}
    });
    if(at<0){
      var s=raw.slice(0,160);
      return esc(s)+(raw.length>160?'\u2026':'');
    }
    var start=Math.max(0,at-36), end=Math.min(raw.length,at+len+110);
    var cut=(start>0?'\u2026':'')+raw.slice(start,end)+(end<raw.length?'\u2026':'');
    return highlight(cut,terms);
  }

  function score(item,terms,q){
    var title=norm(item.title), crumb=norm(item.crumb||''), text=norm(item.text||'');
    var hay=title+' '+crumb+' '+text;
    for(var i=0;i<terms.length;i++){if(hay.indexOf(terms[i])<0)return 0;}
    var s=0;
    terms.forEach(function(t){
      if(title===t)s+=40;
      else if(title.indexOf(t)===0)s+=28;
      else if(title.indexOf(t)>=0)s+=20;
      if(crumb.indexOf(t)>=0)s+=8;
      if(text.indexOf(t)>=0)s+=2;
    });
    if(title.indexOf(norm(q))===0)s+=12;
    return s;
  }

  function setActive(n){
    if(!links.length){active=-1;return;}
    if(n<0)n=links.length-1;
    if(n>=links.length)n=0;
    active=n;
    links.forEach(function(a,i){
      var on=i===active;
      a.classList.toggle('is-active',on);
      if(on)a.setAttribute('aria-selected','true');else a.removeAttribute('aria-selected');
    });
    links[active].scrollIntoView({block:'nearest'});
  }

  function render(q){
    var terms=tokens(q);
    clearBtn.hidden=!q;
    list.innerHTML='';
    links=[];
    active=-1;
    if(!terms.length){
      status.textContent='Type to search pages and services.';
      return;
    }
    if(!index){
      status.textContent='Loading search\u2026';
      return;
    }
    var hits=index.map(function(item){
      var s=score(item,terms,q);
      return s?{item:item,s:s}:null;
    }).filter(Boolean).sort(function(a,b){return b.s-a.s||a.item.title.length-b.item.title.length;}).slice(0,8);
    if(!hits.length){
      status.textContent='No matching pages or services.';
      return;
    }
    status.textContent=hits.length===1?'1 result':(hits.length+' results');
    hits.forEach(function(h,i){
      var li=document.createElement('li');
      li.setAttribute('role','option');
      var a=document.createElement('a');
      a.href=h.item.url;
      a.id='site-search-hit-'+i;
      a.innerHTML='<span class="site-search-rtitle">'+highlight(h.item.title,terms)+'</span>'+
        (h.item.crumb?'<span class="site-search-rcrumb">'+esc(h.item.crumb)+'</span>':'')+
        '<span class="site-search-rsnip">'+snippet(h.item.text,terms)+'</span>';
      a.addEventListener('click',function(){closeSearch();});
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });
  }

  function openSearch(from){
    opener=from||document.activeElement;
    document.dispatchEvent(new CustomEvent('rehost:close-nav'));
    root.hidden=false;
    setExpanded(true);
    document.body.classList.add('search-open');
    input.focus();
    input.select();
    loadIndex(function(){render(input.value);});
    if(!input.value) status.textContent='Type to search pages and services.';
  }

  function closeSearch(){
    if(root.hidden)return;
    root.hidden=true;
    setExpanded(false);
    document.body.classList.remove('search-open');
    active=-1;
    if(opener&&typeof opener.focus==='function')opener.focus();
  }

  openers.forEach(function(btn){
    btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openSearch(btn);});
  });
  if(closeBtn)closeBtn.addEventListener('click',function(){closeSearch();});
  if(back)back.addEventListener('click',function(){closeSearch();});
  if(clearBtn)clearBtn.addEventListener('click',function(){input.value='';render('');input.focus();});
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    if(links[active]||links[0]) (links[active]||links[0]).click();
  });
  input.addEventListener('input',function(){render(input.value);});
  root.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();closeSearch();return;}
    if(e.key==='ArrowDown'){e.preventDefault();if(links.length)setActive(active+1);}
    else if(e.key==='ArrowUp'){e.preventDefault();if(links.length)setActive(active<0?links.length-1:active-1);}
    else if(e.key==='Tab'&&dialog){
      var nodes=[input,clearBtn.hidden?null:clearBtn,closeBtn].concat(links).filter(function(el){return el&&!el.disabled;});
      if(!nodes.length)return;
      var i=nodes.indexOf(document.activeElement);
      if(e.shiftKey){
        if(i<=0){e.preventDefault();nodes[nodes.length-1].focus();}
      }else if(i===nodes.length-1||i<0){e.preventDefault();nodes[0].focus();}
    }
  });
})();
