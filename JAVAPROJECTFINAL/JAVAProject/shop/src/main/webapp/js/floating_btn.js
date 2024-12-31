function loadFloatingBtn(){
    fetch('./floating_btn.html')
    .then(response => response.text())
    .then(data => {      
        document.getElementById('floating_btn').innerHTML = data;         
    })
    .catch(error => console.error('Error, 無法載入 floating_btn:', error));
}

function setFloatingBtn(height){    
    document.getElementById('floating_btn').style.bottom = `${height+10}px`;
}

function toggleDarkMode(){
    document.body.classList.toggle('darkmode');    
}

function triggerGoTop(){    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });      
}

window.addEventListener('scroll',() => {
    var unMoveBtnHeight = document.body.scrollHeight - window.innerHeight - document.getElementById('footer').scrollHeight;
    
    if(scrollY > unMoveBtnHeight){
        setFloatingBtn(scrollY - unMoveBtnHeight);
    }else{
        setFloatingBtn(0);
    }

    var btn = document.getElementById('gotop-button');
    if(scrollY > 50){
        btn.style.display = `flex`;        
    }else{
        btn.style.display = `none`;
    }
});