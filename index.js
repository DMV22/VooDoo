document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://voodoo-sandbox.myshopify.com/products.json";
  const itemsPerPage = 24;
  let currentPage = 1;
  let cartItems = [];

  function fetchProducts(page) {
    const url = `${apiUrl}?limit=${itemsPerPage}&page=${page}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => displayProducts(data.products));
  }

  function displayProducts(products) {
    const productsList = document.getElementById("productsList");
    productsList.innerHTML = "";

    products.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("flex", "flex-col", "justify-between");

      const productImage = product.images[0]?.src;
      const productName = product.title;
      const productPrice = product.variants[0]?.price;

      productElement.innerHTML = `
        <img src="${productImage}" alt="Photo: product image" class="product-image p-3 border border-black border-solid rounded mb-[19px]">
        <div class="product-info">
          <div class="flex justify-between">
            <p class="text-sm leading-normal font-bold">${productName}</p>
            <p class="text-sm leading-normal font-medium">Condition</p>
          </div>
          <div class="flex justify-between">
            <p class="text-sm leading-normal font-bold">${productPrice} KR.</p>
            <p class="text-sm leading-normal font-normal">Slightly used</p>
          </div>
        </div>
        <button class="button-card text-sm font-bold uppercase leading-normal bg-black text-white rounded">
          Add to Cart
        </button>
      `;

      const addToCartButton = productElement.querySelector(".button-card");
      addToCartButton.addEventListener("click", () => {
        addToCart(product);
      });

      productsList.appendChild(productElement);
    });

    const totalPages = Math.ceil(461 / itemsPerPage);
    createPagination(totalPages);
  }

  function createPagination(totalPages) {
    const paginationElement = document.createElement("div");
    const displayRange = 2;
    const ellipsis = "...";

    paginationElement.classList.add("pagination-item");

    const addPageButton = (pageNumber, isActive) => {
      const pageButton = document.createElement("button");
      pageButton.textContent = pageNumber;
      pageButton.classList.add("pagination-button");
      if (isActive) {
        pageButton.classList.add("bg-black", "text-white");
      }
      pageButton.addEventListener("click", () => {
        if (pageNumber !== ellipsis) {
          currentPage = pageNumber;
          fetchAndDisplayProducts();
        }
      });
      return pageButton;
    };

    if (currentPage <= displayRange + 1) {
      for (let i = 1; i <= Math.min(totalPages, displayRange * 2 + 1); i++) {
        paginationElement.appendChild(addPageButton(i, i === currentPage));
      }
      if (totalPages > displayRange * 2 + 1) {
        if (totalPages > displayRange) {
          paginationElement.appendChild(addPageButton(ellipsis, false));
        }
        paginationElement.appendChild(addPageButton(totalPages, false));
      }
    } else if (currentPage >= totalPages - displayRange) {
      paginationElement.appendChild(addPageButton(1, false));
      if (totalPages > displayRange) {
        paginationElement.appendChild(addPageButton(ellipsis, false));
      }
      for (let i = totalPages - displayRange * 2; i <= totalPages; i++) {
        paginationElement.appendChild(addPageButton(i, i === currentPage));
      }
    } else {
      paginationElement.appendChild(addPageButton(1, false));
      if (totalPages > displayRange) {
        paginationElement.appendChild(addPageButton(ellipsis, false));
      }
      for (
        let i = currentPage - displayRange;
        i <= currentPage + displayRange;
        i++
      ) {
        paginationElement.appendChild(addPageButton(i, i === currentPage));
      }
      if (totalPages > displayRange) {
        paginationElement.appendChild(addPageButton(ellipsis, false));
      }
      paginationElement.appendChild(addPageButton(totalPages, false));
    }

    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";
    paginationContainer.appendChild(paginationElement);
  }

  function fetchAndDisplayProducts() {
    fetchProducts(currentPage);
  }

  function addToCart(product) {
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const cartProduct = { ...product, quantity: 1 };
      cartItems.push(cartProduct);
    }

    updateCart();
  }

  function removeFromCart(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId);
    updateCart();
  }

  function increaseQuantity(productId) {
    const cartItem = cartItems.find((item) => item.id === productId);
    cartItem.quantity += 1;
    updateCart();
  }

  function decreaseQuantity(productId) {
    const cartItem = cartItems.find((item) => item.id === productId);
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }
    updateCart();
  }

  function calculateTotal() {
    return cartItems.reduce(
      (total, item) => total + item.variants[0]?.price * item.quantity,
      0
    );
  }

  function updateCart() {
    const cartContainer = document.getElementById("cartContainer");
    cartContainer.innerHTML = "";

    cartItems.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.classList.add(
        "cart-item",
        "flex",
        "flex-row",
        "justify-between",
        "text-sm",
        "font-bold",
        "leading-normal"
      );

      const cartImgAndInfoElement = document.createElement("div");
      cartImgAndInfoElement.classList.add(
        "flex",
        "flex-row",
        "justify-between"
      );

      const itemImgElement = document.createElement("img");
      itemImgElement.classList.add("card-image");
      itemImgElement.src = item.images[0]?.src;
      cartImgAndInfoElement.appendChild(itemImgElement);

      const itemInfoWrapper = document.createElement("div");
      itemInfoWrapper.classList.add(
        "item-info-wrapper",
        "flex",
        "flex-col",
        "justify-between"
      );

      const itemNameElement = document.createElement("p");
      itemNameElement.textContent = item.title;
      itemInfoWrapper.appendChild(itemNameElement);

      const itemPriceElement = document.createElement("p");
      itemPriceElement.textContent = `${(
        item.variants[0]?.price * item.quantity
      ).toLocaleString()} KR.`;
      itemInfoWrapper.appendChild(itemPriceElement);

      const quantityWrapper = document.createElement("div");
      quantityWrapper.classList.add(
        "quantity-wrapper",
        "flex",
        "justify-between",
        "items-center"
      );

      const decreaseButton = document.createElement("button");
      decreaseButton.textContent = "-";
      decreaseButton.addEventListener("click", () => {
        decreaseQuantity(item.id);
      });
      quantityWrapper.appendChild(decreaseButton);

      const itemQuantityElement = document.createElement("p");
      itemQuantityElement.textContent = `${item.quantity}`;
      quantityWrapper.appendChild(itemQuantityElement);

      const increaseButton = document.createElement("button");
      increaseButton.textContent = "+";
      increaseButton.addEventListener("click", () => {
        increaseQuantity(item.id);
      });
      quantityWrapper.appendChild(increaseButton);

      itemInfoWrapper.appendChild(quantityWrapper);
      cartImgAndInfoElement.appendChild(itemInfoWrapper);
      cartItemElement.appendChild(cartImgAndInfoElement);

      const removeWrapper = document.createElement("div");
      removeWrapper.classList.add("remove-wrapper");

      const removeButton = document.createElement("img");
      removeButton.src = "./img/delete-bin.svg";
      removeButton.alt = "Delete";
      removeButton.classList.add("delete-icon", "cursor-pointer");
      removeButton.addEventListener("click", () => {
        removeFromCart(item.id);
      });
      removeWrapper.appendChild(removeButton);

      cartItemElement.appendChild(removeWrapper);
      cartContainer.appendChild(cartItemElement);
    });

    const cartTotalPrice = document.getElementById("cartTotalPrice");
    cartTotalPrice.innerHTML = `
      <p class="uppercase">Total</p>
    `;

    const totalElement = document.createElement("p");
    totalElement.textContent = `${calculateTotal().toLocaleString()} KR.`;
    cartTotalPrice.appendChild(totalElement);
  }

  fetchAndDisplayProducts();
});

/////////////////////////
const cartButton = document.querySelector(".shopping");
const cartSidebar = document.getElementById("cartSidebar");

const closeButton = document.querySelector(".close");

cartButton.addEventListener("click", () => {
  cartSidebar.classList.add("active");
});

closeButton.addEventListener("click", () => {
  cartSidebar.classList.remove("active");
});

/////////////////////////
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownContent = document.getElementById("dropdownContent");

let isDropdownOpen = false;

function toggleDropdown() {
  if (isDropdownOpen) {
    dropdownContent.classList.add("hidden");
  } else {
    dropdownContent.classList.remove("hidden");
  }
  isDropdownOpen = !isDropdownOpen;
}

dropdownBtn.addEventListener("click", toggleDropdown);
