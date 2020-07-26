/**
 * Показывает выпадающее меню при нажатии на указанный элемент
 * @param {string} id id dropdown-элемента
 *
 */
function showDropdown(id) {
  let x = document.getElementById(id);
  x.classList.toggle("w3-show");
}
function showAside() {
  let x = document.getElementsByTagName("aside")[0];
  x.classList.toggle("show-sidebar");
}
/**
 * 
 * @param {string} id id элемента-триггера (равен номеру дня)
 */
function showTooltip(id) {
  let x = document.querySelector('#tooltips #t'+id);
  let all = document.querySelectorAll("#tooltips > *");
  all.forEach(item => item.classList.remove("w3-show"))
  x.classList.add("w3-show");
}

function copy() {
  let x = document.querySelector("#email");
  navigator.clipboard.writeText("botsad-don@gmail.com");
  let t = x.innerHTML;
  x.innerHTML = "Адрес скопирован";
  setTimeout(() => x.innerHTML = t,2000);
}

async function deleteItem(latin) {
  await fetch(`/catalog/${latin}`,{method: "DELETE"}).then(location.reload());
}

async function editItem(id) {
  const res = await fetch(`/catalog/${id}.json`);
  const data = await res.json();
  console.log(data)
}