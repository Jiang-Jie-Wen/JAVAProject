function togglesidebar(){
    document.querySelector(".sidebar").classList.toggle("open");
}

function loadSidebar(){
    fetch('./sidebar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar').innerHTML = data;
    })
    .catch(error => console.error('Error, 無法載入 sidebar:', error));
}