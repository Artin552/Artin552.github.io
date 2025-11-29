// Shared auth helper used by frontend pages
(function(){
  function inFrontendFolder(){
    return window.location.pathname.split('/').includes('frontend');
  }
  function dashboardHref(){
    return inFrontendFolder() ? 'dashboard.html' : 'frontend/dashboard.html';
  }
  function authHref(){
    return inFrontendFolder() ? 'auth.html' : 'frontend/auth.html';
  }
  function regHref(){
    return inFrontendFolder() ? 'reg.html' : 'frontend/reg.html';
  }
  function addHref(){
    return inFrontendFolder() ? 'add.html' : 'frontend/add.html';
  }

  function setupAuthLinks(){
    const container = document.querySelector('.auth-links');
    if(!container) return;
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const email = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    // remove existing children to avoid duplicates
    container.innerHTML = '';
    if(token && email){
      const profile = document.createElement('a');
      profile.href = dashboardHref();
      profile.className = 'btn secondary';
      profile.textContent = email;
      const logout = document.createElement('button');
      logout.className = 'btn';
      logout.textContent = 'Выйти';
      logout.addEventListener('click', ()=>{
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userEmail');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        // reload to reflect state
        window.location.reload();
      });
      container.appendChild(profile);
      container.appendChild(logout);
    } else {
      const login = document.createElement('a');
      login.href = authHref();
      login.textContent = 'Вход';
      const reg = document.createElement('a');
      reg.href = regHref();
      reg.textContent = 'Регистрация';
      container.appendChild(login);
      container.appendChild(reg);
      // add quick add button if desired
      const add = document.createElement('a');
      add.href = addHref();
      add.className = 'btn';
      add.textContent = 'Добавить';
      container.appendChild(add);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupAuthLinks);
  else setupAuthLinks();
})();