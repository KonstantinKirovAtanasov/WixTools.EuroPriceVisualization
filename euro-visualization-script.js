const RATE_EUR = 1.95583;
const REGEX = /(?:лв\.?|BGN)(?:\s*|&nbsp;|\u00A0)?(\d+(?:[.,]\d{0,2})?)|(\d+(?:[.,]\d{0,2})?)|(\d(?: ['\u00A0,&nbsp;]\d)*(?:[.,]\d{2}))(?:\s*|&nbsp;|\u00A0)?(лв\.?|BGN)/g;
const DIGIT_REGEX = /^\d+(?:[.,]\d+)?$/;

function convertPriceText(text, noDecimalPoint) {
  const match = [...text.matchAll(REGEX)];
  if (!match || match.length === 0) return;

  let numberStr = null;
  if (match.length === 1) {
    if (match[0][0] && match[0][0].match(DIGIT_REGEX)) numberStr = match[0][0];
    if (match[0][1] && match[0][1].match(DIGIT_REGEX)) numberStr = match[0][1];
    if (match[0][2] && match[0][2].match(DIGIT_REGEX)) numberStr = match[0][2];
  } else {
    if (match[0][0] && match[0][0].match(DIGIT_REGEX) && match[1][0] && match[1][0].match(DIGIT_REGEX))
      numberStr = match[0][0] + match[1][0];
    else if (match[0][1] && match[1][0] && match[1][0].match(DIGIT_REGEX))
      numberStr = match[0][1].replace(',', '').replace(' ', '') + match[1][0];
  }
  if (!numberStr) return;

  const number = parseFloat(numberStr.replace(',', '.'));
  if (isNaN(number)) return;

  if(noDecimalPoint) return (number / RATE_EUR).toFixed(0);
  return (number / RATE_EUR).toFixed(2).replace('.', ',');
}

function appendEUR(el, eur, contextColor, contextFontSize) {
  if (el.querySelector(".eur-price") || el.innerHTML.includes("€")) return;
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

function convertWithInnerText(selectors, noDecimalPoint) {
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (NotIncludesLeva(el)) return;
      if (el.innerText.includes("€")) return;
      if (el.innerHTML.includes("€")) return;
      const eur = convertPriceText(el.innerText,noDecimalPoint);
      if (eur) el.innerText += `/ ${eur} €`;
    });
  });
}

function convertWithAppending(selectors) {
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (NotIncludesLeva(el)) return;
      if (el.querySelector(".eur-price")) return;
      if (el.innerHTML.includes("€")) return;
      const eur = convertPriceText(el.innerText);
      if (eur) { appendEUR(el, eur, el.style.color, el.style.fontSize); return;}
    });
  });
}

function NotIncludesLeva(el) {
  return !el.innerText.includes("лв")
    && !el.innerText.startsWith("BGN")
    && !el.innerText.endsWith("BGN")
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
    const p = div.querySelector("p, h2, span, div");
    if (!p || NotIncludesLeva(p) || p.querySelector(".eur-price") || p.innerHTML.includes("€")) return;
    const eur = convertPriceText(p.innerText);
    if (eur){ appendEUR(p, eur); return; }
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

// Checkout
function convertCheckout() {
  convertWithAppending([
    '[data-hook="total-row-value"] span',
    '[data-hook="total-row-value"]',
    '[data-hook="LineItemDataHooks.Price"]'
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
// Side cart
function convertSideCartPrices() {
  convertWithInnerText([
    '[data-hook="CartItemDataHook.totalPrice"] div div',
    '[data-hook="Footer.subtotalValue"]',
    '[data-wix-line-item-price="CartItemDataHook.price"]'
  ]);
}
// Checkout & Order Summary
function convertCheckoutSummaryPrices() {
  convertWithInnerText([
    '[data-hook="FoldableSummarySectionDataHook.total"]',
    '[data-hook="payment-checkout-summary-plan-price"]'
  ]);
}

// Thank You Page prices
function convertThankYouPrices() {
  convertWithInnerText([
    '[data-hook="ProductLineItemDataHook.totalPrice"]',
    '[data-hook="subtotal-row-value"]',
    '[data-hook="challenge-pricing"]'
  ]);
}

// Filter
function convertFilter() {
  convertWithInnerText([
    '[data-hook="filter-type-PRICE "] span'
  ], true);
  const forChange = document.querySelectorAll('[data-hook="filter-type-PRICE "] span');
  forChange.forEach((el) => {
    el.style.fontSize = '17px';
  })
}

// Shipping
function convertShipping() {
  convertWithAppending([
    '[data-hook="dropdown-option"]'
  ]);
}

// Convert members page
function convertMembers() {
  convertWithInnerText([
    '[data-hook="subtotal"]',
    '[data-hook="shipping"]',
    '[data-hook="tax-0"]',
    '[data-hook="total"]',
    '[data-hook="product-total"]',
    '[data-hook="product-price"]',
    '[data-hook="value"]'
  ]);
}
// Convert all
function convertAllPrices() {
  convertCategoryPrices();
  convertProductPagePrice();
  convertCartTotals();
  convertSideCartPrices();
  convertCheckoutSummaryPrices();
  convertThankYouPrices();
  convertFilter();
  convertCheckout();
}

window.addEventListener("load", () => {
  setTimeout(() => {
    const interval = setInterval(() => {
      convertAllPrices();
    }, 200);
  }, 150);

  
  setTimeout(() => {
    const interval = setInterval(() => {
      attachDeleteOnContinue();
    }, 1200);
  }, 1500);

// Delete elements added on click of the continue button
// --- DELETE ELEMENTS ON CONTINUE BUTTON CLICK (VANILLA JS) ---
  function safeRemove(el) {
  if (!el) return;
  if (typeof el.remove === "function") {
    el.remove();
  } else if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function deleteElements(selectors) {
  selectors.forEach(function (selector) {
    var nodes = document.querySelectorAll(selector);
    nodes.forEach
      ? nodes.forEach(function (el) {console.log(el); safeRemove(el); })
      : Array.prototype.forEach.call(nodes, function (el) {console.log(el); safeRemove(el); });
  });
}

  function isMobileScreen() {
      return window.matchMedia("(max-width: 768px)").matches;
  }
  
  function attachDeleteOnContinue() {
    const btn = document.querySelector('[data-hook="place-order-button"]');
    if (!btn) return;
    console.log(btn);
    if(isMobileScreen()) deleteElements([".eur-price"]);

    if (btn.dataset.listenerAttached) return;
    btn.dataset.listenerAttached = "true";

    if(!isMobileScreen()) btn.addEventListener("click", function () {
      deleteElements([
        ".eur-price",
      ]);

      console.log("Selected elements deleted after continue click.");
    });
  }

  const observer = new MutationObserver(attachDeleteOnContinue);
  observer.observe(document.body, { childList: true, subtree: true });
  attachDeleteOnContinue();
});
