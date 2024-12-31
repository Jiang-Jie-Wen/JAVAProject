const post_container = document.getElementById("post-container");

function toggleContent(id){    
    const showContext = document.getElementById("content"+id);
    if(showContext.style.display == 'none'){
      const data = {
        postid : id
      };
      if(showContext.innerHTML.trim() == ""){
        fetch('LoadPostContext', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('未讀取到text資料');
            }
            return response.text();
          })
          .then(data => {    
            showContext.innerHTML = data;
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
      showContext.style.display = 'block';
    }else{
      showContext.style.display = 'none';
    }
}

window.onload = function(){
  loadFooter();
  loadNavbar();
  loadFloatingBtn();

fetch('LoadPostServlet')
  .then(response => {
    if (!response.ok) {
      throw new Error('未讀取到json資料');
    }
    return response.json();
  })
  .then(data => {
    data.forEach(item => {
        const newchild = document.createElement('div');
        newchild.classList.add("post-list");
        newchild.innerHTML = `
            <div class="announcement" onclick="toggleContent(${item.id})">
              <div class="post-header">
                <h2>${item.title}</h2><span>${item.date}</span>
              </div>                
              <div id="content${item.id}" class="content" style="display:none">
              </div>
            </div>
        `;
        post_container.appendChild(newchild);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
}