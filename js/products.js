/* PRODUTOS — carrossel + fullscreen + navegação manual + comprar */
const produtos=[
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/boina.png",link:"https://meli.la/1qQswxt"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/bone01.png",link:"https://mercadolivre.com/sec/1J5NsnW"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/camiseta06.png",link:"https://meli.la/2JjcmJ8"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/camiseta01.png",link:"https://meli.la/24zu96X"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/camiseta04.png",link:"https://meli.la/1F3kSsp"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/touca.png",link:"https://meli.la/2BcECX6"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/camiseta_beat_apurado.png",link:"https://www.stickermule.com/br/beatapurado/item/20534691?origin=PUBLIC_PROFILE"},
 {img:"https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/fone.png",link:"https://meli.la/21Bn5CW"}
];
let prodIdx=0;
const productImg=document.getElementById("produto-img");
function showProduct(index){
 prodIdx=(index+produtos.length)%produtos.length;
 const p=produtos[prodIdx];
 productImg.src=p.img;
 productImg.dataset.link=p.link;
}
function trocarProduto(){showProduct(prodIdx+1)}
showProduct(0);setInterval(trocarProduto,5000);

const productModal=document.getElementById("productModal"),productZoom=document.getElementById("productZoom"),productBuyModal=document.getElementById("productBuyModal");
function openProduct(index){
 showProduct(index);
 const p=produtos[prodIdx];
 productZoom.src=p.img;productBuyModal.href=p.link;
 productModal.classList.add("active");productModal.setAttribute("aria-hidden","false");productBuyModal.style.display="inline-block";
}
document.getElementById("produtoFrame").addEventListener("click",()=>openProduct(prodIdx));
function closeProduct(){productModal.classList.remove("active");productModal.setAttribute("aria-hidden","true")}
document.getElementById("closeProduct").addEventListener("click",closeProduct);
document.getElementById("productPrev").addEventListener("click",e=>{e.stopPropagation();openProduct(prodIdx-1)});
document.getElementById("productNext").addEventListener("click",e=>{e.stopPropagation();openProduct(prodIdx+1)});
productModal.addEventListener("click",e=>{if(e.target===productModal)closeProduct()});
