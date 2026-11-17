const currentPage=document.body.dataset.page||'trials';
if(currentPage==='trials')loadTrials();
else if(currentPage==='reports')renderNews();
else if(currentPage==='saved'){savedMode=true;$('trialHeading').textContent='Your saved research';$('dataStatus').textContent='Saved locally in this browser. Open a trial to refresh its registry record.';renderTrials()}
else if(currentPage==='molecules'){try{const compound=sessionStorage.getItem('dh-inspect-compound');if(compound){$('compound').value=compound;sessionStorage.removeItem('dh-inspect-compound')}}catch{}loadMol()}
