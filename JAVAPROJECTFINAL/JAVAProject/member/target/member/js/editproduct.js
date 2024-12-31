const modal = document.getElementById('showmodal');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productCategory = document.getElementById('productCategory');
const productUnit = document.getElementById('productUnit');
const productImage = document.getElementById('productImage');
const addProductBtn = document.getElementById('addProductBtn');
const editProductBtn = document.getElementById('editProductBtn');
const delProductBtn = document.getElementById('delProductBtn');
let check = true;
let loginuser = "";

async function generateProductList() {
    let products;
    const data = {
        userId : loginuser        
      };
    await fetch('LoadAllProducts', {
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
        return response.json();
    })
    .then(data => {        
        products = data;
    })
    .catch(error => {
        console.error('錯誤:', error);
    });

    if(Object.keys(products).length == 0){
        document.getElementById("emptyMessage").textContent = "無上架商品";
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
        productImg.src = `../picture/${products[id].pic}`;

        const productText = document.createElement('span');
        productText.classList.add('product-text');
        productText.textContent = products[id].title;        

        productInfo.appendChild(productText);
        
        const detailButton = document.createElement('button');
        if(products[id].state == "0"){   //判斷狀態是否為審核
            detailButton.textContent = '審核中';
            detailButton.classList.add("unclickBtn");           
        }else if(products[id].state == "1"){
            detailButton.textContent = '未通過';
            detailButton.classList.add("unpassBtn");     
            detailButton.onclick = function() {
                openModal(products[id].itemid);
            };
        }else{
            detailButton.textContent = '編輯商品';
            detailButton.onclick = function() {
                openModal(products[id].itemid);
            };
        }
        

        listItem.appendChild(productImg);
        listItem.appendChild(productInfo);        
        listItem.appendChild(detailButton);
        
        productListElement.appendChild(listItem);
    })
}

async function onloadProductCategory() {
    await fetch('LoadCategoryList')
    .then(response => {
        if (!response.ok) {
            throw new Error('無法讀取資料');
        }
        return response.json();
    })
    .then(data => {
        Object.keys(data).forEach(id =>{
            const option = document.createElement('option');
            option.value = data[id].id;
            option.textContent = data[id].title;
            productCategory.appendChild(option);
        })
    })
    .catch(error => {
        console.error('錯誤:', error);
    });
}

window.onload = async function() {
    await fetch("../../shop/CheckLogin")
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("Error:response is not OK");
        }
      })
      .then((data) => {
        loginuser = data;
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
    if(loginuser === "noLogin"){
        window.location.href = "../shop/login.html";
    }else{
        loadSidebar();
        generateProductList();
        onloadProductCategory();
    }        
};


async function openModal(id) {   
    addProductBtn.style.display = 'none';     
    editProductBtn.style.display = 'inline-block';     
    delProductBtn.style.display = 'inline-block';
    editProductBtn.setAttribute('data-id', id);      
    delProductBtn.setAttribute('data-id', id);   
    
    const data = {
        itemid : String(id)        
      };    
    
    await fetch('LoadProductDetails', {
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
        return response.json();
    })
    .then(data => {
        productName.value = data[0].title; 
        productPrice.value = data[0].price; 
        productCategory.value = data[0].cid;
        productUnit.value = data[0].unit; 
    })
    .catch(error => {
        console.error('錯誤:', error);
    });
    
    modal.style.display = 'flex';
}

function addProduct() {        
    addProductBtn.style.display = 'inline-block';     
    editProductBtn.style.display = 'none';     
    delProductBtn.style.display = 'none';  
    productName.value = ""; 
    productPrice.value = ""; 
    productCategory.selectedIndex = 0;
    productUnit.value = ""; 
    productImage.value = ""; 
    
    modal.style.display = 'flex';
}

function closeModal() {    
    modal.style.display = 'none';
}

async function addnewProduct(){
    check = true;
    AddIncorrectClass(productName);
    AddIncorrectClass(productPrice);
    AddIncorrectClass(productUnit);
    AddIncorrectClass(productImage);
    if(check){
        const file = productImage.files[0];
        let fileName = "nochange";
        if(file){
            const formData = new FormData();
            formData.append('file', file);

            await fetch('UpdateFile', { 
                method: 'POST',
                body: formData,
              })
              .then(response => response.json())
              .then(data => {
                fileName = data.fileName;
              })
              .catch(error => {
                alert('錯誤!圖片無法上傳!');
                console.error(error);
                return;
              });
        }
        const data={
            uid : loginuser,
            title : productName.value,
            price : productPrice.value,
            category : productCategory.value,
            unit : productUnit.value,
            pic : fileName
        };
        fetch('AddProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(data)
          })
          .then(response => response.text())
          .then(data => {
            if(data == "added"){
                alert('新增完成!');
                location.reload();
            }else{
                alert('錯誤!無法新增!');
            }
          })
          .catch(error => {
                alert('錯誤!無法新增!');
          });
    }
}

async function updateProduct(){
    const id = editProductBtn.getAttribute('data-id');
    check = true;
    AddIncorrectClass(productName);
    AddIncorrectClass(productPrice);
    AddIncorrectClass(productUnit);
    if(check){
        const file = productImage.files[0];
        let fileName = "nochange";
        if(file){
            const formData = new FormData();
            formData.append('file', file);

            await fetch('UpdateFile', { 
                method: 'POST',
                body: formData,
              })
              .then(response => response.json())
              .then(data => {
                fileName = data.fileName;
              })
              .catch(error => {
                alert('錯誤!圖片無法上傳!');
                console.error(error);
              });
        }

        const data={
            itemid : String(id),
            title : productName.value,
            price : productPrice.value,
            category : productCategory.value,
            unit : productUnit.value,
            pic : fileName
        };
        await fetch('EditProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(data)
          })
          .then(response => response.text())
          .then(data => {
            if(data == "edited"){
                alert('更新完成!');
                location.reload();
            }else{
                alert('錯誤!無法更新!');
            }
          })
          .catch(error => {
                alert('錯誤!無法更新!');
          });
    }    
}

function deleteProduct(){
    const id = delProductBtn.getAttribute('data-id');
    const data = {
        itemid : String(id)        
      };    
    
    fetch('DeleteProduct', {
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

const allInputs = [productName,productPrice,productUnit,productImage].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
      if(input.classList.contains('incorrect')){
        input.classList.remove('incorrect');
      }
    })
})