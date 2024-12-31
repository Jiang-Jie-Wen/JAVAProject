let productDetails = {};

function displayCart(){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart');
    const emptyMessage = document.getElementById('emptyMessage');
    cartContainer.innerHTML = '';

    if (Object.keys(cart).length === 0) {
        emptyMessage.textContent = '購物車沒有商品';
        document.getElementById('totalPrice').textContent = 0;
        return;
    } else {
        emptyMessage.textContent = '';
    }

    const productIds = Object.keys(cart);  

    if (Object.keys(productDetails).length > 0){
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('cart-header');
        headerDiv.innerHTML = `
            <span class="header-flex-2">商品名稱</span>
            <span class="header-flex-1">單價</span>
            <span class="header-flex-1">數量</span>
            <span class="header-flex-1">金額</span>
            <span class="header-flex-1"></span>
        `;
        cartContainer.appendChild(headerDiv);

        let totalPrice = 0;

        productIds.forEach(id => {
            const item = cart[id];
            const product = productDetails[id];
            if (product) {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('cart-item');

                const itemTotal = product.price * item.qty;
                totalPrice += itemTotal;

                itemDiv.innerHTML = `
                    <span class="name">${product.title}</span>
                    <span class="price">$${product.price}</span>
                    <span class="qty"><input type="number" value="${item.qty}" min="1" max="99" onchange="updateQuantity(${id}, this.value)"></span>
                    <span class="total-price">$${itemTotal}</span>
                    <div class="actions">
                        <button onclick="removeItem(${id})">刪除</button>
                    </div>
                `;

                cartContainer.appendChild(itemDiv);
            }else{
                alert(`部分商品(商品id=${id})已經下架，從購物車中移除`);
                delete cart[id];
                localStorage.setItem('cart', JSON.stringify(cart));                
            }
        });

        document.getElementById('totalPrice').textContent = totalPrice;
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

function updateQuantity(index, quantity) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    if (quantity <= 1) quantity = 1;
    if (quantity >= 99) quantity = 99;
    cart[index].qty = parseInt(quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    delete cart[index];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    setCartItemCount();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(Object.keys(cart).length === 0){
        alert('未選購任何商品');
        return;
    }
    window.location.href = 'checkout.html';
}

window.onload = async function() {
    loadFooter();
    loadNavbar();
    loadFloatingBtn();
    await getProductDetails();
    displayCart();
};