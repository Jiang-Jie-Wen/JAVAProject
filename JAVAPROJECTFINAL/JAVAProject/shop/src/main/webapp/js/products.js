const product_container = document.getElementById("product-container");
const pagination = document.getElementById("pagination");
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
let page = params.get('page');
const commdity = params.get('commdity');
const sortby = params.get('sortby');
const searchs = params.get('search');

window.onload = async function(){  
  loadFooter();
  loadNavbar();
  loadFloatingBtn();
  loadCategoryList();
  let data;

  if(commdity == null){
    data = {
      commdity: "0",
      searchs: ""
    };
  }else{
    data = {
      commdity: String(commdity),
      searchs: searchs
    };
  }

  await fetch('GetMaxPage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('未讀取到json資料');
    }
    return response.text();
  })
  .then(data => {
    const maxPage = Math.ceil(data/12);
    
    if(page == null){
      page = 1;
    }
    if(page > maxPage){
      page = maxPage;
    }
    let link = "product.html?";
    const url = new URL(window.location.href);
    if(commdity != null){
      link += `commdity=${commdity}&sortby=${sortby}&search=${searchs}&page=`;
    }else{
      link += "page=";
    }
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="${link}1" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;
    if(page > 1){
      pagination.innerHTML += `<li class="page-item"><a class="page-link" href="${link+(Number(page)-1)}">${(Number(page)-1)}</a></li>`;
    }
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="${link+page}">${page}</a></li>`;
    if(page < maxPage){
      pagination.innerHTML += `<li class="page-item"><a class="page-link" href="${link+(Number(page)+1)}">${(Number(page)+1)}</a></li>`;
    }      
    pagination.innerHTML +=`
      <li class="page-item">
        <a class="page-link" href="${link}${maxPage}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
  });

  if(commdity == null){
    data = {
      commdity: "0",
      sortby: "new",
      searchs: "",
      page : String(page)
    };
  }else{
    data = {
      commdity: String(commdity),
      sortby: sortby,
      searchs: searchs,
      page : String(page)
    };
  }

  await fetch('Search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('未讀取到json資料');
    }
    return response.json();
  })
  .then(data => {
    product_container.innerHTML = "";
    let count = 0;
    data.forEach(item => {
        const newchild = document.createElement('div');
        newchild.classList.add("product-card");
        newchild.innerHTML = `            
            <img src="../picture/${item.pic}" alt="" class="card-img" />
            <div class="product-info">
            <span class="card-title">${item.title}</span>
            <span class="card-type">${item.category}</span>            
            <span class="card-price">$${item.price}</span>
            <button class="add-cart" onclick="addcart(${item.itemid})">
                <i class="fa-solid fa-cart-shopping"></i>
            </button>
            </div>
        `;
        product_container.appendChild(newchild);
        count++;
    });
    while(count < 12){
      const newchild = document.createElement('div');
      newchild.classList.add("product-card-empty");
      newchild.innerHTML = ``;
      product_container.appendChild(newchild);
      count++;
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function search(){
  let commdity = document.getElementById("commdity").value;
  let sortby = document.getElementById("sortby").value;
  let search = document.getElementById("search").value;
  window.location.href = `product.html?commdity=${commdity}&sortby=${sortby}&search=${search}&page=${page}`;
}

function addcart(id){
  let cart = JSON.parse(localStorage.getItem('cart')) || {};
  let name = String(id);
  if (cart[name]) {
    cart[name].qty += 1; // 如果商品已存在，數量+1
  } else {
    cart[name] = { qty: 1 }; // 否則新增商品並設置數量為 1
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  setCartItemCount();
}

function loadCategoryList(){
  
  fetch('LoadCategoryList')
  .then(response => {
    if (!response.ok) {
      throw new Error('未讀取到json資料');
    }
    return response.json();
  })
  .then(data => {
      const commdity = document.getElementById('commdity');
      data.forEach(item => {
        commdity.innerHTML += `<option value="${item.id}">${item.title}</option>`;
      })
    });
}