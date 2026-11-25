// 2nd Chance — JavaScript compartilhado
const money = value => Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const getCart = () => JSON.parse(localStorage.getItem("2c-cart") || "[]");
const saveCart = cart => { localStorage.setItem("2c-cart",JSON.stringify(cart)); updateCartCount(); };
function updateCartCount(){const el=document.getElementById("cart-count");if(el)el.textContent=getCart().reduce((sum,item)=>sum+item.qty,0);}
function toast(message){const el=document.getElementById("toast");if(!el)return;el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200);}
function addToCart(name,price){const cart=getCart();const found=cart.find(item=>item.name===name);if(found)found.qty++;else cart.push({name,price:Number(price),qty:1});saveCart(cart);toast("Produto adicionado à sacola!");}
document.addEventListener("DOMContentLoaded",()=>{
  updateCartCount();
  const toggle=document.getElementById("menu-toggle"),nav=document.getElementById("main-nav");
  if(toggle&&nav)toggle.addEventListener("click",()=>nav.classList.toggle("open"));
  document.querySelectorAll(".add-cart").forEach(btn=>btn.addEventListener("click",()=>addToCart(btn.dataset.name,btn.dataset.price)));
  // Ordenação simples dos cards estáticos
  const sort=document.getElementById("sort-products"),grid=document.getElementById("product-grid");
  if(sort&&grid)sort.addEventListener("change",()=>{const cards=[...grid.children];if(sort.value!=="default")cards.sort((a,b)=>{const pa=Number(a.querySelector("strong")?.textContent.replace("R$","").replace(".","").replace(",","."))||0;const pb=Number(b.querySelector("strong")?.textContent.replace("R$","").replace(".","").replace(",","."))||0;return sort.value==="low"?pa-pb:pb-pa;});cards.forEach(card=>grid.appendChild(card));});
  // API 1: Fake Store API (página Tênis)
  async function loadFakeStore(){const target=document.getElementById("api-products"),status=document.getElementById("api-status");if(!target)return;status.textContent="Buscando produtos na Fake Store API...";target.innerHTML="";try{const response=await fetch("https://fakestoreapi.com/products?limit=6");if(!response.ok)throw new Error("Falha na API");const products=await response.json();products.forEach(p=>{const card=document.createElement("article");card.className="product-card api-card";card.innerHTML=`<img class="product-image" src="${p.image}" alt="${p.title}"><div class="product-info"><span class="product-tag">API FAKE STORE</span><h3>${p.title}</h3><p>${p.category}</p><strong>${money(p.price)}</strong><button class="small-btn">Adicionar ao carrinho</button></div>`;card.querySelector("button").addEventListener("click",()=>addToCart(p.title,p.price));target.appendChild(card);});status.textContent=`${products.length} produtos recebidos da API.`;}catch(error){status.textContent="Não foi possível carregar a API. Confira sua conexão e tente novamente.";}}
  if(document.getElementById("api-products")){loadFakeStore();document.getElementById("reload-api").addEventListener("click",loadFakeStore);}
  // API 2: DummyJSON (página Acessórios)
  async function loadDummy(){const target=document.getElementById("dummy-products"),status=document.getElementById("dummy-status");if(!target)return;status.textContent="Buscando produtos na DummyJSON...";target.innerHTML="";try{const response=await fetch("https://dummyjson.com/products/category/mens-shirts?limit=6");if(!response.ok)throw new Error("Falha na API");const data=await response.json();data.products.forEach(p=>{const card=document.createElement("article");card.className="product-card api-card";card.innerHTML=`<img class="product-image" src="${p.thumbnail}" alt="${p.title}"><div class="product-info"><span class="product-tag">API DUMMYJSON</span><h3>${p.title}</h3><p>${p.category}</p><strong>${money(p.price)}</strong><button class="small-btn">Adicionar ao carrinho</button></div>`;card.querySelector("button").addEventListener("click",()=>addToCart(p.title,p.price));target.appendChild(card);});status.textContent=`${data.products.length} produtos recebidos da API.`;}catch(error){status.textContent="Não foi possível carregar a API. Confira sua conexão e tente novamente.";}}
  if(document.getElementById("dummy-products")){loadDummy();document.getElementById("reload-dummy").addEventListener("click",loadDummy);}
  // Lookbook: gera uma combinação
  const looks=[["Urban básico","Camiseta oversized + calça cargo + tênis neutro."],["Monocromático","Camiseta preta + calça preta + acessório prateado."],["Vintage casual","Camiseta estampada + jeans reto + boné."],["Conforto street","Moletom amplo + calça jogger + tênis casual."]];
  const lookBtn=document.getElementById("new-look");if(lookBtn)lookBtn.addEventListener("click",()=>{const look=looks[Math.floor(Math.random()*looks.length)];document.getElementById("look-title").textContent=look[0];document.getElementById("look-description").textContent=look[1];});
  // Guia de tamanhos
  const sizeBtn=document.getElementById("size-check");if(sizeBtn)sizeBtn.addEventListener("click",()=>{const n=Number(document.getElementById("chest").value),out=document.getElementById("size-result");if(!n){out.textContent="Digite uma medida válida.";return;}out.textContent=n<=96?"Tamanho sugerido: P":n<=103?"Tamanho sugerido: M":n<=110?"Tamanho sugerido: G":n<=118?"Tamanho sugerido: GG":"Consulte a loja para medidas especiais.";});
  // Carrinho
  function renderCart(){const target=document.getElementById("cart-items");if(!target)return;const cart=getCart();target.innerHTML="";if(!cart.length){target.innerHTML="<p>Sua sacola está vazia. Explore as categorias para adicionar produtos.</p>";}cart.forEach((item,index)=>{const row=document.createElement("div");row.className="cart-row";row.innerHTML=`<div><strong>${item.name}</strong><p>${money(item.price)} • Quantidade: ${item.qty}</p></div><strong>${money(item.price*item.qty)}</strong><button aria-label="Remover item">Remover</button>`;row.querySelector("button").addEventListener("click",()=>{const updated=getCart();updated.splice(index,1);saveCart(updated);renderCart();});target.appendChild(row);});const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);document.getElementById("cart-total").textContent=money(total);}
  if(document.getElementById("cart-items")){renderCart();document.getElementById("clear-cart").addEventListener("click",()=>{saveCart([]);renderCart();toast("Carrinho limpo.");});}
  // API 3: ViaCEP (consulta real de CEP)
  const cepForm=document.getElementById("cep-form");if(cepForm)cepForm.addEventListener("submit",async event=>{event.preventDefault();const cep=document.getElementById("cep").value.replace(/\D/g,""),status=document.getElementById("cep-status");if(cep.length!==8){status.textContent="Digite um CEP com 8 números.";return;}status.textContent="Consultando ViaCEP...";try{const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`);const data=await response.json();if(data.erro)throw new Error("CEP não encontrado");document.getElementById("street").value=data.logradouro||"Não informado";document.getElementById("district").value=data.bairro||"Não informado";document.getElementById("city").value=data.localidade||"";document.getElementById("state").value=data.uf||"";status.textContent="Endereço encontrado!";}catch(error){status.textContent="CEP não encontrado. Confira os números e tente novamente."; }});
  // Formulário de contato demonstrativo
  const contact=document.getElementById("contact-form");if(contact)contact.addEventListener("submit",event=>{event.preventDefault();document.getElementById("contact-status").textContent="Mensagem validada! (Envio demonstrativo, sem servidor conectado.)";contact.reset();});
});
// Marca no menu a página em que o usuário está
(function () {
  const atual = decodeURIComponent(location.pathname.split('/').pop()) || 'FCBstore.html';

  document.querySelectorAll('.main-nav a').forEach(link => {
    link.removeAttribute('aria-current');
    if (link.getAttribute('href') === atual) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
