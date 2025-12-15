const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('rname').value.trim();
  const email = document.getElementById('remail').value.trim();
  const password = document.getElementById('rpassword').value;

  try {
  const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (data.success) {
      if (data.token) sessionStorage.setItem('token', data.token);
      if (data.email) sessionStorage.setItem('userEmail', data.email);
      window.location.href = data.redirect || '/';
    } else {
      alert(data.error || 'Ошибка регистрации');
    }

  } catch (err) {
    console.error(err);
    alert('Ошибка соединения с сервером');
  }
});
// toggle show/hide for registration password
const toggleRPassword = document.getElementById('toggleRPassword');
if(toggleRPassword){
  toggleRPassword.addEventListener('click', ()=>{
    const p = document.getElementById('rpassword');
    if(!p) return;
    if(p.type === 'password'){ p.type = 'text'; toggleRPassword.textContent = '🙈'; toggleRPassword.setAttribute('aria-label','Скрыть пароль'); }
    else { p.type = 'password'; toggleRPassword.textContent = '👁️'; toggleRPassword.setAttribute('aria-label','Показать пароль'); }
  });
}