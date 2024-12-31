const modal = document.getElementById('showmodal');
let loginuser = "";

async function generateOrderList() {
    let orders = "";
    const data = {
        userId : loginuser        
      };
    await fetch('LoadSellOrders', {
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
        orders = data;
    })
    .catch(error => {
        console.error('錯誤:', error);
    });

    if(orders.length == 0){
        document.getElementById("emptyMessage").textContent = "查無訂單";
        return;
    }

    const orderListElement = document.getElementById('order-list');
    orders.forEach(order => {
        const listItem = document.createElement('li');
        
        const orderInfo = document.createElement('div');
        orderInfo.classList.add('order-info');
        
        const orderText = document.createElement('span');
        orderText.classList.add('order-text');
        orderText.textContent = "ORD" + order.orderId.toString().padStart(5, "0");;
        
        const orderDate = document.createElement('span');
        orderDate.classList.add('order-date');
        orderDate.textContent = `日期: ${order.date}`;

        orderInfo.appendChild(orderText);
        orderInfo.appendChild(orderDate);
        
        const detailButton = document.createElement('button');
        if(order.isshiped == 0){
            detailButton.textContent = '顯示明細(未出貨)';
        }else{
            detailButton.textContent = '顯示明細(已出貨)';
            detailButton.classList.add("close-btn");
        }        
        detailButton.onclick = function() {
            openModal(order.orderId,order.date,order.name,order.phone,order.address,order.isshiped);
        };

        listItem.appendChild(orderInfo);
        listItem.appendChild(detailButton);
        
        orderListElement.appendChild(listItem);
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
        generateOrderList();
    }
};

async function openModal(orderId,date,name,phone,address,islock) {    
    const modalContent = modal.querySelector('.modal-content');
    let content = "";    
    let total = 0;
     
    const data = {
        oid : String(orderId)        
      };
    
    await fetch('LoadSellOrderDetails', {
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
        content += `
        <div id="deliveryNote">
            <div class="modal-header">
                <span class="modal-span">訂單編號：${"ORD" + orderId.toString().padStart(5, "0")}</span><span>日期：${date}</span><br>
            </div>
            <div class="modal-header">
                <span class="modal-span">訂購人:${name}</span><span>電話:${phone}</span><br>
            </div>
            <div class="modal-header">
                <span class="modal-span">地址:${address}</span><br>
            </div>
            <div class="modal-header">
                <span class="modal-flex-2">商品名稱</span>
                <span class="modal-flex-1">單價</span>
                <span class="modal-flex-1">數量</span>
                <span class="modal-flex-1">金額</span>
            </div>
        `; 
        data.forEach(item => {
            content += `
                <div class="modal-body">
                    <span class="modal-flex-2">${item.title}</span>
                    <span class="modal-flex-1">$${item.price}</span>
                    <span class="modal-flex-1">${item.qty}</span>
                    <span class="modal-flex-1">$${item.price * item.qty}</span>
                </div>
            `; 
            total += item.price * item.qty;
        });
    })
    .catch(error => {
        console.error('錯誤:', error);
    });

    content += `
            <div class="total">總金額:$${total}</div>
        </div>
        <div class="btngroup">
    `;

    if(islock == 0){           //修改判斷顯示不同按鈕
        content += `<button class="print-btn" onclick="printOrder('${orderId}')">列印出貨單</button>`;
    }else{
        content += `<button class="disabled-btn">出訂單已列印</button>`;
    }
    
    content += `   <button class="close-btn" onclick="closeModal()">關閉</button>            
        </div>   
    `;    
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

async function printOrder(id){
    const data = {
        oid : id        
      };
    await fetch('ShipOrder', {
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
    .then(async data => {
        if(data == "changed"){
            const invoiceContent = document.getElementById('deliveryNote').outerHTML;    
            let style = "";

            await fetch('css/fulfillment.css')
            .then(response => response.text())
            .then(styles => {                        
                style = styles;
                style += `
                    \n#deliveryNote {
                    width:600px;
                }`;    
            })
            .catch(error => {
                console.log('無法加載外部CSS文件: ' + error);
            });
            const fullContent = "<html><head><style>" + style + "</style></head><body>" + invoiceContent + "</body></html>";             
            const blob = new Blob([fullContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${"ORD" + id.toString().padStart(5, "0")}出貨單.html`;
            link.click();   
            alert("已列印出貨單!");
            location.reload();
        }else{
            alert("錯誤!無法列印出貨單!");            
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