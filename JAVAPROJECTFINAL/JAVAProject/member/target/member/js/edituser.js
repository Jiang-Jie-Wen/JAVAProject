const name_input = document.getElementById('name');
const email_input = document.getElementById('email');
const phone_input = document.getElementById('phone');
const address_input = document.getElementById('address');

const new_pwd_input = document.getElementById('new-password');
const confirm_pwd_input = document.getElementById('confirm-password');

let check = true;
let errortext = "";
let loginuser = "";

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
        const data = {
            userId : loginuser
          };
        fetch('LoadUserDetails', {
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
                name_input.value = data[0].name;
                email_input.value = data[0].email;
                if(data[0].phone != undefined){
                    phone_input.value = data[0].phone;
                }
                if(data[0].address != undefined){
                    address_input.value = data[0].address;
                }                
            })
            .catch(error => {
                console.error('錯誤:', error);
            });
    }  
};

function AddIncorrectClass(res){
    if(res.value === ''){
        res.classList.add('incorrect');
        errortext = "請填寫完整資訊!!!";
        check = false;
    }
}

function CompareRegex(res,regex,text){
    if(!regex.test(res.value)){
        res.classList.add('incorrect');        
        check = false;
        if(errortext === ""){
            errortext = text;
        }
    }
}

function ComparePassword(){    
    if(new_pwd_input.value !== confirm_pwd_input.value){
        check = false;
        if(errortext === ""){
            errortext = "密碼輸入不相同，請重新輸入";
        }         
    }
}

document.getElementById('save_btn').addEventListener('click', function() {
    check = true;
    errortext = "";
    AddIncorrectClass(name_input);
    AddIncorrectClass(email_input);
    AddIncorrectClass(phone_input);
    AddIncorrectClass(address_input);
    CompareRegex(email_input,/^.*@.*$/,"信箱格式不正確!!");
    CompareRegex(phone_input,/[0-9]{10}/,"電話格式不正確!!");
    if(check){
        const data = {
            userId : loginuser,
            name : name_input.value,
            email : email_input.value,
            phone : phone_input.value,
            address : address_input.value
          };
        fetch('EditUserDetails', {
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
                if(data == "edited"){
                    alert("個人資訊已更新!!!");
                }else{
                    alert("錯誤，無法更新!!!");
                }                
            })
            .catch(error => {
                console.error('錯誤:', error);
            });
        
    }else{
        alert(errortext);
    }
});

document.getElementById('change_btn').addEventListener('click', function() {
    check = true;
    errortext = "";
    AddIncorrectClass(new_pwd_input);
    AddIncorrectClass(confirm_pwd_input);
    CompareRegex(new_pwd_input,/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,12}$/,'密碼格式不正確(長度8~12 包含英文大小寫及數字)');
    ComparePassword();
    if(check){
        
        const data = {
            userId : loginuser,
            password : new_pwd_input.value
          };
        fetch('ChangePassword', {
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
                if(data == "changed"){
                    alert("密碼變更完成!!!");                    
                }else{
                    alert("錯誤，無法更新!!!");
                }     
                new_pwd_input.value = "";
                confirm_pwd_input.value = "";            
            })
            .catch(error => {
                console.error('錯誤:', error);
            });
    }else{
        alert(errortext);
        new_pwd_input.value = "";
        confirm_pwd_input.value = "";
    }
});

const allInputs = [name_input, email_input, phone_input, address_input,new_pwd_input,confirm_pwd_input].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
      if(input.classList.contains('incorrect')){
        input.classList.remove('incorrect');
      }
    })
})