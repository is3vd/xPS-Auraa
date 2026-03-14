// إعدادات Supabase من config.js
const supabaseUrl = config.supabaseUrl;
const supabaseKey = config.supabaseKey;
const whatsappNumber = config.whatsappNumber;

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// المنتجات (فاضية من الأول)
let products = [];
let cart = [];
let currentProductForDetails = null;

// تحميل المنتجات من Supabase
async function loadProducts() {
  const { data, error } = await supabaseClient.from("products").select("*");
  if (error) {
    console.error("Error loading products:", error);
  } else {
    products = data || [];
    renderProducts();
  }
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

// عرض المنتجات

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="product-img" onclick="showProductDetails(${product.id})">
          <div class="product-info">
              <h3 class="product-title" onclick="showProductDetails(${product.id})">${product.name}</h3>
              <p class="product-price">${product.price} $</p>
              <button class="add-btn" onclick="addToCart(${product.id})">أضف للسلة</button>
              <button class="view-details" onclick="showProductDetails(${product.id})">عرض التفاصيل</button>
          </div>
      `;
    grid.appendChild(card);
  });


// فتح/إغلاق السلة
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// فتح/إغلاق نافذة إضافة منتج
function openAddProductModal() {
  document.getElementById("addProductModal").classList.add("active");
}

function closeAddProductModal() {
  document.getElementById("addProductModal").classList.remove("active");
}

// معاينة الصورة
function previewImage(url) {
  const preview = document.getElementById("imagePreview");
  const error = document.getElementById("imageError");

  if (
    url &&
    (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png"))
  ) {
    preview.src = url;
    preview.classList.add("show");
    error.style.display = "none";
  } else {
    preview.classList.remove("show");
    error.style.display = "block";
  }
}

// عرض تفاصيل المنتج
function showProductDetails(id) {
  const product = products.find((p) => p.id === id);
  if (product) {
    currentProductForDetails = product;
    document.getElementById("detailImage").src = product.image;
    document.getElementById("detailName").innerText = product.name;
    document.getElementById("detailPrice").innerText = product.price + " $";
    document.getElementById("detailSizes").innerText =
      product.sizes || "غير متوفر";
    document.getElementById("detailDescription").innerText =
      product.description || "لا يوجد وصف";

    // عرض الصور الإضافية
    const thumbnailsContainer = document.getElementById("imageThumbnails");
    thumbnailsContainer.innerHTML = "";

    if (product.image2) {
      const thumb = document.createElement("img");
      thumb.src = product.image2;
      thumb.className = "thumbnail active";
      thumb.onclick = () => {
        document.getElementById("detailImage").src = product.image2;
        document
          .querySelectorAll(".thumbnail")
          .forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
      };
      thumbnailsContainer.appendChild(thumb);
    }

    document.getElementById("productDetailsModal").classList.add("active");
    document.getElementById("detailsOverlay").classList.add("active");
  }
}

function closeProductDetails() {
  document.getElementById("productDetailsModal").classList.remove("active");
  document.getElementById("detailsOverlay").classList.remove("active");
}

function addToCartFromDetails() {
  if (currentProductForDetails) {
    addToCart(currentProductForDetails.id);
    closeProductDetails();
  }
}

// إضافة للسلة
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (product) {
    cart.push(product);
    updateCartUI();
  }
}

// تحديث واجهة السلة
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const totalPriceEl = document.getElementById("totalPrice");

  cartCount.innerText = cart.length;

  let total = 0;
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p style="text-align: center; color: #777; margin-top: 20px;">السلة فارغة</p>';
  } else {
    cart.forEach((item, index) => {
      total += parseFloat(item.price);
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
              <img src="${item.image}" alt="${item.name}">
              <div class="cart-item-details">
                  <h4>${item.name}</h4>
                  <p>${item.price} $</p>
              </div>
              <span class="remove-item" onclick="removeFromCart(${index})">حذف</span>
          `;
      cartItemsContainer.appendChild(itemEl);
    });
  }
  totalPriceEl.innerText = total + " $";
}

// حذف من السلة
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// تأكيد الشراء - إرسال على الواتساب
function confirmPurchase() {
  if (cart.length === 0) {
    alert("السلة فارغة!");
    return;
  }

  // تجميع تفاصيل الطلب
  let orderDetails = "🛍️ *طلب جديد من PS Aura*\n\n";
  let total = 0;
  cart.forEach((item) => {
    orderDetails += `▪️ ${item.name} - ${item.price} $\n`;
    total += parseFloat(item.price);
  });
  orderDetails += `\n💰 *المجموع الكلي: ${total} $*`;

  // فتح الواتساب
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderDetails)}`;
  window.open(whatsappUrl, "_blank");
}

// إضافة منتج جديد
document
  .getElementById("addProductForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("pName").value;
    const price = document.getElementById("pPrice").value;
    const image = document.getElementById("pImg").value;
    const image2 = document.getElementById("pImg2").value;
    const sizes = document.getElementById("pSizes").value;
    const description = document.getElementById("pDescription").value;

    const newProduct = {
      name: name,
      price: price,
      image: image,
      image2: image2 || null,
      sizes: sizes,
      description: description,
    };

    // حفظ في Supabase
    const { data, error } = await supabaseClient
      .from("products")
      .insert([newProduct])
      .select();

    if (error) {
      console.error("Error adding product:", error);
      alert("حدث خطأ في حفظ المنتج!");
    } else {
      products.push(data[0]); // إضافة المنتج المحفوظ (مع ID)
      renderProducts();
      closeAddProductModal();
      this.reset();
      alert("تمت إضافة المنتج بنجاح!");
    }
  });
