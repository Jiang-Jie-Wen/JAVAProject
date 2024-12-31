const modal = document.getElementById('showmodal');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productCategory = document.getElementById('productCategory');
const productUnit = document.getElementById('productUnit');
const productImage = document.getElementById('productImage');
const passedBtn = document.getElementById('passedBtn');
const failedBtn = document.getElementById('failedBtn');
let check = true;

async function generateProductList() {
    let products;
    await fetch('LoadAllProducts')
    .then(response => {
        if (!response.ok) {
            throw new Error('無法讀取資料');
        }
        return response.json();
    })
    .then(data => {
        products = data;
    })
    .catch(error => {
        console.error('錯誤:', error);
    });

    if(Object.keys(products).length == 0){
        document.getElementById("emptyMessage").textContent = "無需要審核商品";
        return;
    }

    const productIds = Object.keys(products); 
    const productListElement = document.getElementById('product-list');

    productIds.forEach(id => {
        const listItem = document.createElement('li');

        const productInfo = document.createElement('div');
        productInfo.classList.add('product-info');

        const productImg = document.createElement('img');
        productImg.classList.add('product-img');
        productImg.src = `/picture/${products[id].pic}`;

        const productText = document.createElement('span');
        productText.classList.add('product-text');
        productText.textContent = products[id].title;        

        productInfo.appendChild(productText);
        
        const detailButton = document.createElement('button');        
        detailButton.textContent = '審核';       
        detailButton.onclick = function() {
            openModal(products[id].itemid);
        };
        

        listItem.appendChild(productImg);
        listItem.appendChild(productInfo);        
        listItem.appendChild(detailButton);
        
        productListElement.appendChild(listItem);
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
    generateProductList();
};

async function openModal(id) { 
    passedBtn.setAttribute('data-id', id);      
    failedBtn.setAttribute('data-id', id);

    const data = {
        itemid : String(id)
    };
    
    await fetch('LoadProductDetails', {
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
        productName.value = data[0].title; 
        productPrice.value = data[0].price; 
        productCategory.value = data[0].category;
        productUnit.value = data[0].unit; 
        productImage.src = `/picture/${data[0].pic}`; 
    })
    .catch(error => {
        console.error('錯誤:', error);
    });
    
    modal.style.display = 'flex';
}

function passed(){
    const id = passedBtn.getAttribute('data-id');
    review(id,"passed");
}

function failed(){
    const id = failedBtn.getAttribute('data-id');
    review(id,"failed");
}

function review(id,status) { 
    const data = {
        itemid : String(id),
        status : status
    };
    
    fetch('ReviewProduct', {
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
        if(data == "ok"){
            alert("審核完成");
        }else{
            alert("錯誤!無法完成操作!");
        }
        location.reload();
    })
    .catch(error => {
        console.error('錯誤:', error);
    });
    
    modal.style.display = 'flex';
}

function closeModal() {    
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none'; // 隱藏視窗
    }
}