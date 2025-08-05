const RATE = 1.95583;
const REGEX = /(\d+(?:[.,]\d+)?)&nbsp;лв\.|лв(\d+(?:[.,]\d+)?)/g;

function convertPriceText(bgnText) {
  const cleaned = bgnText.match(REGEX);
  if(!cleaned || cleaned.lenght == 0) return;

  const bgn = parseFloat(cleaned[0]);
  if (isNaN(bgn)) return null;
  return (bgn / RATE).toFixed(2);
}

function appendEUR(el, eur, contextColor, contextFontSize) {
  if (el.querySelector(".eur-price")) return;
  const eurSpan = document.createElement("span");
  eurSpan.className = "eur-price";
  eurSpan.textContent = `/ ${eur} €`;
  eurSpan.style.cssText = `
    font-size: ${contextFontSize|| "1em"};
    color: ${contextColor || "FFFFFF"};
    margin-left: 6px;
    white-space: nowrap;
  `;
  el.appendChild(eurSpan);
}

function convertWithInnerText(selectors) {
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (!el.innerText.includes("лв")) return;
      if (el.innerText.includes("€")) return;
      const eur = convertPriceText(el.innerText, );
      if (eur) el.innerText += `/ ${eur} €`;
    });
  });
}

function convertWithAppending(selectors) {
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (!el.innerText.includes("лв")) return;
      if (el.querySelector(".eur-price")) return;
      const eur = convertPriceText(el.innerText);
      if (eur) appendEUR(el, eur, el.style.color, el.style.fontSize);
    });
  });
}

// Category and product listings
function convertCategoryPrices() {
  convertWithAppending([
    '[data-hook="product-item-price-to-pay"]',
    '[data-hook="formatted-primary-price"]',
    '[data-hook="challenge-pricing"]'
  ]);
}

// Individual product page
function convertProductPagePrice() {
  const richTextDivs = document.querySelectorAll('div[data-testid="richTextElement"]');
  richTextDivs.forEach((div) => {
    const p = div.querySelector("p, h2, span");
    if (!p || !p.innerText.includes("лв") || p.querySelector(".eur-price")) return;
    const eur = convertPriceText(p.innerText);
    if (eur) appendEUR(p, eur);
  });
}

// Cart page totals
function convertCartTotals() {
  convertWithAppending([
    '[data-hook="SubTotals.subtotalText"]',
    '[data-hook="Total.formattedValue"]',
    '[data-hook="TotalShipping.estimatedShipping"]',
    'dd[data-hook="SubTotals.subtotalText"]',
    'dd[data-hook="Total.formattedValue"]',
    'dd[data-hook="TotalShipping.estimatedShipping"]'
  ]);
}

// Side cart
function convertSideCartPrices() {
  convertWithAppending([
    '[data-hook="CartItemDataHook.price"]',
    '[data-hook="CartItemDataHook.totalPrice"] div',
    '[data-hook="Footer.subtotalValue"]',
    '[data-hook="cart-widget-item-price"]',
    '[data-hook="cart-widget-total"]'
  ]);
}

// Checkout & Order Summary
function convertCheckoutSummaryPrices() {
  convertWithInnerText([
    '[data-hook="FoldableSummarySectionDataHook.total"]',
    '[data-hook="LineItemDataHooks.Price"]',
    '[data-hook="total-row-value"] span',
    '[data-hook="payment-checkout-summary-plan-price"]'
  ]);
}

// Thank You Page prices
function convertThankYouPrices() {
  convertWithInnerText([
    '[data-hook="ProductLineItemDataHook.totalPrice"]',
    '[data-hook="subtotal-row-value"]',
    '[data-hook="total-row-value"]'
  ]);
}

// Filter
function convertFilter() {
  convertWithAppending([
    '[data-hook="filter-type-PRICE"]'
  ]);
}

// Shipping
function convertShipping() {
  convertWithAppending([
    '[data-hook="dropdown-option"]'
  ]);
}

// Convert all

let areHeavyItemsConverted = false;
function convertAllPrices() {
  convertCategoryPrices();
  convertProductPagePrice();
  convertCartTotals();
  convertSideCartPrices();
  convertCheckoutSummaryPrices();
  convertThankYouPrices();
  if(!areHeavyItemsConverted){
    convertShipping();
    convertFilter();
    areHeavyItemsConverted = true;
  }
}

window.addEventListener("load", () => {
  setTimeout(() => {
    convertAllPrices();
    setInterval(convertAllPrices, 900);
  }, 750);
});