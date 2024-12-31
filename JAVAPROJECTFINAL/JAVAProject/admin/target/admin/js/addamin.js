const addadmin = document.getElementById('addadmin');
const account = document.getElementById('account');
const password = document.getElementById('password');
const checkpassword = document.getElementById('check-password');
let check = true;

addadmin.addEventListener("click",function(){
    check = true;
    AddIncorrectClass(account);
    AddIncorrectClass(password);
    AddIncorrectClass(checkpassword);
    CompareRegex();
    ComparePassword();
    if(check){
        alert("註冊成功");
    }
})

function AddIncorrectClass(res){
    if(res.value === ''){
        res.classList.add('incorrect');
        if(check){
            alert("請填寫完整資訊!!!");
        }
        check = false;
    }
}

function CompareRegex(){
    let regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,12}$/;
    if(!regex.test(password.value)){
        if(check){
            alert("密碼格式不正確!!!");
            password.classList.add('incorrect');
            password.value = "";
            checkpassword.value = "";
        }
        check = false;
    }
}

function ComparePassword(){    
    if(password.value !== checkpassword.value){
        if(check){
            alert("密碼輸入不相同，請重新輸入!");
            checkpassword.classList.add('incorrect');
            checkpassword.value = "";
        }
        check = false;      
    }
}

const allInputs = [account,password].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
      if(input.classList.contains('incorrect')){
        input.classList.remove('incorrect');
      }
    })
})
    
window.onload = function () {
    fetch("CheckLogin")
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("Error:response is not OK");
        }
      })
      .then((data) => {
        console.log(data);
        if (data === "noLogin") {
          window.location.href = "login.html";
        }
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
};

