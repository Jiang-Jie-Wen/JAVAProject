const showCart = document.getElementById('showCart');
const totalPrice = document.getElementById('totalPrice');

let productDetails = {};
let loginuser = "";

function displayCart(){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (Object.keys(cart).length === 0) {
        alert('購物車沒有商品');
        window.location.href = 'product.html';
        return;
    }
    const productIds = Object.keys(cart);  

    if (Object.keys(productDetails).length > 0){
        let total = 0;
        productIds.forEach(id => {
            const item = cart[id];
            const product = productDetails[id];
            if (product) {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('cart-item');

                const itemTotal = product.price * item.qty;
                total += itemTotal;

                itemDiv.innerHTML = `
                    <div class="name">${product.title}</div>
                    <div class="price">$${product.price}</div>
                    <div class="qty">數量:${item.qty}</div>
                    <div class="totalPrice">總計:$${itemTotal}</div>                    
                `;

                showCart.appendChild(itemDiv);
            }else{
                alert(`部分商品(商品id=${id})已經下架，從購物車中移除`);
                delete cart[id];
                localStorage.setItem('cart', JSON.stringify(cart));                
            }
        });
        totalPrice.innerHTML = `總金額:$${total}`;
    }

        
    
}

async function getProductDetails(){
    const cart = JSON.parse(localStorage.getItem('cart'));
    const keysList = Object.keys(cart).join(',');
    const data = { keys: keysList };
    try{
        await fetch('LoadProductDetails',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
        .then(response => {        
            return response.json();  
        })
        .then(data => {
            productDetails = data;
        })
        .catch(error => {
            console.error('error:', error);
        });
    }catch(error){
        console.error('Error:', error);
    }    
}

window.onload = async function() {    
    await fetch("CheckLogin")
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
        window.location.href = "./login.html";
    }else{
        loadFooter();
        loadNavbar();
        loadFloatingBtn();
        await getProductDetails();
        displayCart();
    }    
};

const nameInput = document.getElementById('name');
const addressInput = document.getElementById('address');
const phoneInput = document.getElementById('phone');
let check = true;

function submitForm(){
    check = true;
    AddIncorrectClass(nameInput);
    AddIncorrectClass(addressInput);
    AddIncorrectClass(phoneInput);
    CompareRegex(phoneInput,/[0-9]{10}/,"電話格式不正確!!");
    if(check){
        const data = { 
            name : nameInput.value, 
            address : addressInput.value, 
            phone : phoneInput.value,
            user : loginuser,
            cart : localStorage.getItem('cart').toString()
        };

        fetch('SubmitOrder',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(data)
          })
        .then(response => {        
            return response.text();  
        })
        .then(data => {
            if(data == "ok"){
                alert("訂單已送出!");
                localStorage.removeItem("cart");
                window.location.href = "product.html";
            }else{
                alert("錯誤，訂單無法送出!");
            }
        })
        .catch(error => {
            console.error('error:', error);
        });

        alert("送出!!!");
    }
}

function AddIncorrectClass(res){
    if(res.value === ''){
        res.classList.add('incorrect');
        errortext = "請填寫完整資訊!!!";
        if(check){
            alert("請填寫完整資訊!!!");
        }        
        check = false;
    }
}

function CompareRegex(res,regex,text){
    if(!regex.test(res.value)){
        res.classList.add('incorrect'); 
        if(check){
            alert("電話格式不正確!!!");
        }       
        check = false;                
    }
}

const allInputs = [nameInput,addressInput,phoneInput].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
      if(input.classList.contains('incorrect')){
        input.classList.remove('incorrect');
      }
    })
})

const checkbox = document.getElementById("checkInfo");
let memberInfo = {};
checkbox.addEventListener("change", async function() {    
    if (checkbox.checked) {
        if(Object.keys(memberInfo).length == 0){
            await fetch('LoadUserDetails')
            .then(response => {
                if (!response.ok) {
                    throw new Error('無法讀取資料');
                }
                return response.json();
            })
            .then(data => {
                memberInfo = data;
            })
            .catch(error => {
                console.error('錯誤:', error);
            });
        }
        nameInput.value = memberInfo[0].name;
        nameInput.classList.remove('incorrect');
        addressInput.value = memberInfo[0].address;
        addressInput.classList.remove('incorrect');
        phoneInput.value = memberInfo[0].phone;
        phoneInput.classList.remove('incorrect');
    } else {
        nameInput.value = "";
        addressInput.value = "";
        phoneInput.value = "";
    }
  });