const currentPage=document.body.dataset.page||'trials';
const pageQuery=(new URLSearchParams(location.search).get('q')||'').trim().slice(0,200);
if(pageQuery){$('headerQuery').value=pageQuery;$('search').value=pageQuery}
if(currentPage==='trials'&&typeof initializeDiseaseFocus==='function'&&initializeDiseaseFocus()){}
else if(currentPage==='trials'){resetRecentTrials();if(pageQuery){$('trialHeading').textContent='Clinical trials for '+pageQuery;$('contextArea').textContent='Search: '+pageQuery;document.querySelectorAll('[data-area]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')})}}
else if(currentPage==='reports')renderNews();
else if(currentPage==='saved'){savedMode=true;$('trialHeading').textContent='Your saved research';$('dataStatus').textContent='Saved locally in this browser. Open a trial to refresh its registry record.';renderTrials()}
else if(currentPage==='molecules'){const requestedCompound=new URLSearchParams(location.search).get('compound');if(requestedCompound)$('compound').value=requestedCompound.slice(0,200);try{const compound=sessionStorage.getItem('dh-inspect-compound');if(compound){if(!requestedCompound)$('compound').value=compound;sessionStorage.removeItem('dh-inspect-compound')}}catch{}loadMol()}
