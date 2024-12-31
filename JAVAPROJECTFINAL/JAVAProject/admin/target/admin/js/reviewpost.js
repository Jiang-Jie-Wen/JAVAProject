const modal = document.getElementById('showmodal');
const posttitle = document.getElementById('posttitle');
const postcontext = document.getElementById('postcontext');
const addPostBtn = document.getElementById('addPostBtn');
const editPostBtn = document.getElementById('editPostBtn');
const delPostBtn = document.getElementById('delPostBtn');
const poststatusgroup = document.getElementById('poststatusgroup');
const poststatus = document.getElementById('poststatus');
let check = true;

async function generatePostList() {
    let posts;
    await fetch('LoadAllPosts')
    .then(response => {
        if (!response.ok) {
            throw new Error('無法讀取資料');
        }
        return response.json();
    })
    .then(data => {
        posts = data;
    })
    .catch(error => {
        console.error('錯誤:', error);
    });

    if(Object.keys(posts).length == 0){
        document.getElementById("emptyMessage").textContent = "無任何公告";
        return;
    }

    const postIds = Object.keys(posts); 
    const postListElement = document.getElementById('post-list');

    postIds.forEach(id => {
        const listItem = document.createElement('li');

        const productTitle = document.createElement('div');
        productTitle.classList.add('post-title');
        productTitle.innerHTML = posts[id].title;
        
        const detailButton = document.createElement('button');
        
        detailButton.textContent = '編輯公告';
        detailButton.onclick = function() {
            openModal(posts[id].id);
        };
        
        listItem.appendChild(productTitle);        
        listItem.appendChild(detailButton);
        
        postListElement.appendChild(listItem);
    })
}

window.onload = function() {
    fetch("CheckLogin")
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("Error:response is not OK");
        }
      })
      .then((data) => {
        if (data === "noLogin") {
          window.location.href = "login.html";
        }
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
    loadSidebar();
    generatePostList();
};

async function openModal(id) {   
    addPostBtn.style.display = 'none';     
    editPostBtn.style.display = 'inline-block';     
    delPostBtn.style.display = 'inline-block';
    poststatusgroup.style.display = 'block';
    editPostBtn.setAttribute('data-id', id);      
    delPostBtn.setAttribute('data-id', id);
    posttitle.classList.remove('incorrect');
    postcontext.classList.remove('incorrect');
    const data = {
        postid : String(id)
    };
    await fetch('LoadPostDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    .then(response => {
        if (!response.ok) {
            throw new Error('無法讀取資料');
        }
        return response.json();
    })
    .then(data => {
        posttitle.value = data[0].title;
        postcontext.value = data[0].context;
        poststatus.value = data[0].state;
    })
    .catch(error => {
        console.error('錯誤:', error);
    });
    
    modal.style.display = 'flex';
}

function addPost() {        
    addPostBtn.style.display = 'inline-block';     
    editPostBtn.style.display = 'none';     
    delPostBtn.style.display = 'none';      
    poststatusgroup.style.display = 'none';
    posttitle.value = ""; 
    postcontext.value = ""; 
    
    modal.style.display = 'flex';
}

function closeModal() {    
    modal.style.display = 'none';
}

function addnewPost() {        
    check = true;
    AddIncorrectClass(posttitle);
    AddIncorrectClass(postcontext);    
    if(check){
        const data = {
            title : posttitle.value,
            context : postcontext.value
        };
        fetch('AddPost', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(data)
          })
        .then(response => {
            if (!response.ok) {
                throw new Error('無法讀取資料');
            }
            return response.text();
        })
        .then(data => {
            if (data === "added") {
                alert("新增完成!");
                location.reload();
            }else{
                alert("錯誤!無法新增!");
            }
        })
        .catch(error => {
            console.error('錯誤:', error);
        });
    }
}

function updatePost() {        
    const id = editPostBtn.getAttribute('data-id');
    check = true;
    AddIncorrectClass(posttitle);
    AddIncorrectClass(postcontext);
    if(check){
        const data = {
            pid : id,
            title : posttitle.value,
            context : postcontext.value,
            state : poststatus.value
        };
        fetch('EditPost', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(data)
          })
        .then(response => {
            if (!response.ok) {
                throw new Error('無法讀取資料');
            }
            return response.text();
        })
        .then(data => {
            if (data === "edited") {
                alert("編輯完成!");
                location.reload();
            }else{
                alert("錯誤!無法編輯!");
            }
        })
        .catch(error => {
            console.error('錯誤:', error);
        });
    }
}

function deletePost() {        
    const id = delPostBtn.getAttribute('data-id');
    const data = {
        postid : String(id)
    };
    fetch('DeletePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    .then(response => {
        if (!response.ok) {
            throw new Error('無法讀取資料');
        }
        return response.text();
    })
    .then(data => {
        if (data === "deleted") {
            alert("刪除完成!");
            location.reload();
        }else{
            alert("錯誤!無法刪除!");
        }
    })
    .catch(error => {
        console.error('錯誤:', error);
    });
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none'; // 隱藏視窗
    }
}

function AddIncorrectClass(res){
    if(res.value === ''){
        res.classList.add('incorrect');
        if(check){
            alert("請填寫完整資訊!!!");
        }
        check = false;
    }
}

const allInputs = [posttitle,postcontext].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
      if(input.classList.contains('incorrect')){
        input.classList.remove('incorrect');
      }
    })
})