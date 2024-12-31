function changeForm(){
    document.getElementById("form-login").classList.toggle("form-show");
    document.getElementById("form-register").classList.toggle("form-show");
}

const loginbtn = document.getElementById("login_btn");
const forgetbtn = document.getElementById("forget_btn");
const registerbtn = document.getElementById("register_btn");

const login_error = document.getElementById("login-error-message");
const register_error = document.getElementById("register-error-message");

const input_account = document.getElementById("account-input");
const input_password = document.getElementById("password-input");

const input_email = document.getElementById("email-input");
const input_name = document.getElementById("name-input");
const input_registerpwd = document.getElementById("registerpwd-input");
const input_checkpwd = document.getElementById("checkpwd-input");
let check = true;

function AddIncorrectClass(res,errortext,text){
    if(res.value === ''){
        res.parentElement.classList.add('incorrect');
        errortext.innerHTML = text;
        check = false;
    }
}

function CompareRegex(res,regex,errortext,text){
    if(!regex.test(res.value)){
        res.parentElement.classList.add('incorrect');
        if(errortext.innerHTML == ''){
            errortext.innerHTML = text;
            check = false;
        }
    }
}

function ComparePassword(errortext){
    if(input_registerpwd.value !== input_checkpwd.value){
        if(errortext.innerHTML == ''){
            register_error.innerHTML = '密碼輸入不相同!';
            check = false;
        }        
    }
}

loginbtn.addEventListener('click',(e)=>{
    check = true;
    AddIncorrectClass(input_account,login_error,"資料未填寫完成");
    AddIncorrectClass(input_password,login_error,"資料未填寫完成");
    CompareRegex(input_account,/^.*@.*$/,login_error,'帳號格式不正確');
    if(check){
        const data = {
            account : input_account.value,
            password : input_password.value
        };
        fetch("Login", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then((response) => {
            if (response.ok) {
              return response.text();
            } else {
              throw new Error("Error:response is not OK");
            }
          })
          .then((data) => {
            if (data === "correct") {
              window.location.href = "../member/edituser.html";
            }else if(data === "PwdError"){
              input_password.value = "";
              AddIncorrectClass(input_password, login_error,"密碼錯誤");
            }else{
              input_account.value = "";
              input_password.value = "";
              AddIncorrectClass(input_account, login_error,"無此使用者");
              AddIncorrectClass(input_password, login_error,"無此使用者");
            }
          })
          .catch((error) => {
            console.error("Error sending request:", error);
          });
    }
})

registerbtn.addEventListener('click',(e)=>{
    check = true;
    AddIncorrectClass(input_email,register_error,"資料未填寫完成");
    AddIncorrectClass(input_name,register_error,"資料未填寫完成");
    AddIncorrectClass(input_registerpwd,register_error,"資料未填寫完成");
    AddIncorrectClass(input_checkpwd,register_error,"資料未填寫完成");
    CompareRegex(input_email,/^.*@.*$/,register_error,'信箱格式不正確');CompareRegex(input_registerpwd,/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,12}$/,register_error,'密碼格式不正確');
    // 包含大小寫英文 數字 長度為8~12
    
    ComparePassword(register_error);
    if(check){
      const data = {
        email : input_email.value,
        name : input_name.value,
        passwd : input_registerpwd.value
      };
      fetch("Register", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            throw new Error("Error:response is not OK");
          }
        })
        .then((data) => {
          console.log(data);
          if (data === "correct") {
            alert("註冊成功!");
            window.location.href = "login.html";
          }else{
            alert("此信箱已註冊!");
            input_email.value = "";
            input_name.value = "";
            input_registerpwd.value = "";
            input_checkpwd.value = "";
          }
        })
        .catch((error) => {
          console.error("Error sending request:", error);
        });        
    }
})

const allInputs = [input_account, input_password, input_email, input_name,input_registerpwd,input_checkpwd].filter(input => input != null);

allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if(input.parentElement.classList.contains('incorrect')){
      input.parentElement.classList.remove('incorrect');
      login_error.innerText = '';
      register_error.innerText = '';
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
        if (data !== "noLogin") {
          window.location.href = "../member/edituser.html";
        }
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
  
      input_account.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          input_password.focus();
        }
      });
      
      input_password.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          loginbtn.click();
        }
      });

      input_email.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          input_name.focus();
        }
      });

      input_name.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          input_registerpwd.focus();
        }
      });

      input_registerpwd.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          input_checkpwd.focus();
        }
      });

      input_checkpwd.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          registerbtn.click();
        }
      });
  };