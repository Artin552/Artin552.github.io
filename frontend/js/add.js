  // Для простоты: читаем изображение client-side как base64 и отправляем в JSON.
  document.getElementById('addForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const file = document.getElementById('photo').files[0];

    let imageBase64 = '';
    if(file){
      // читаем файл как base64
      imageBase64 = await new Promise((res,rej)=>{
        const fr = new FileReader();
        fr.onload = ()=> res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
    }

    // Пример POST-запроса к backend
    try{
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/listings',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          ...(token?{ Authorization: 'Bearer ' + token }: {})
        },
        body: JSON.stringify({
          title, category, price, description,
          imageBase64
        })
      });
      const data = await res.json();
      if(res.ok) {
        alert('Объявление добавлено, id=' + data.id);
        window.location.href = 'dashboard.html';
      } else {
        alert('Ошибка: ' + JSON.stringify(data));
      }
    }catch(e){
      alert('Не удалось отправить запрос к серверу');
      console.error(e);
    }
  });