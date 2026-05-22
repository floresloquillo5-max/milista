import { AppState } from '../state';
import { saveLists } from '../utils/storage';
import { escapeHtml, formatUSD, parseFloatFromLocalString } from '../utils/format';
import { $, $empty, createElement, showToast, truncate, showConfirmModal } from '../utils/dom';
import { updateTotals } from './finances';

function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function addProduct(): void {
  const nameInput = document.getElementById('prodName') as HTMLInputElement | null;
  const qtyInput = document.getElementById('prodQty') as HTMLInputElement | null;
  const unitInput = document.getElementById('prodUnit') as HTMLInputElement | null;
  const priceInput = document.getElementById('prodPrice') as HTMLInputElement | null;

  if (!nameInput || !qtyInput || !priceInput) return;

  const name = truncate(nameInput.value.trim(), 50);
  const qty = parseInt(qtyInput.value) || 1;
  const unit = truncate(unitInput ? unitInput.value.trim() : '', 20);
  const price = parseFloat(priceInput.value) || 0;

  if (!name) {
    showToast('⚠️ Ingresa el nombre del producto');
    return;
  }

  const product = {
    id: generateId(),
    name,
    qty,
    unit,
    price,
    checked: true,
  };

  AppState.getProducts().push(product);
  saveLists();
  renderProducts();
  updateTotals();
  nameInput.value = '';
  qtyInput.value = '1';
  if (unitInput) unitInput.value = '';
  priceInput.value = '';
  nameInput.focus();
}

export function renderProducts(): void {
  const container = document.getElementById('productList');
  if (!container) return;

  const products = AppState.getProducts();

  if (products.length === 0) {
    container.innerHTML = '';
    container.appendChild(
      createElement('div', { className: 'empty-state' }, [
        createElement('div', { className: 'empty-icon' }, ['🛒']),
        createElement('p', {}, ['Tu lista está vacía.', createElement('br'), 'Agrega productos para empezar.']),
      ])
    );
    return;
  }

  $empty(container);
  const fragment = document.createDocumentFragment();

  products.forEach(p => {
    const item = createElement('div', {
      className: 'product-item' + (p.checked ? '' : ' checked'),
      'data-id': String(p.id),
    });

    const checkLabel = createElement('label', { className: 'product-check' });
    const checkInput = createElement('input', { type: 'checkbox' });
    if (p.checked) checkInput.setAttribute('checked', '');
    checkLabel.appendChild(checkInput);

    const info = createElement('div', { className: 'product-info' });
    const nameSpan = createElement('div', { className: 'product-name' });
    const unitBadge = p.unit ? ' <span class="unit-badge">' + escapeHtml(p.unit) + '</span>' : '';
    nameSpan.innerHTML = escapeHtml(p.name) + unitBadge;
    info.appendChild(nameSpan);

    const details = createElement('div', { className: 'product-details' });
    details.textContent = `${p.qty} × ${formatUSD(p.price)} = ${formatUSD(p.qty * p.price)}`;
    info.appendChild(details);

    item.appendChild(checkLabel);
    item.appendChild(info);

    const actions = createElement('div', { className: 'product-actions' });
    const editBtn = createElement('button', {
      className: 'btn-icon product-edit-btn',
      'data-action': 'edit',
      'data-id': String(p.id),
      'aria-label': 'Editar ' + p.name,
      title: 'Editar',
    });
    editBtn.textContent = '✏️';
    const deleteBtn = createElement('button', {
      className: 'btn-icon product-delete-btn',
      'data-action': 'delete',
      'data-id': String(p.id),
      'aria-label': 'Eliminar ' + p.name,
      title: 'Eliminar',
    });
    deleteBtn.textContent = '🗑️';
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(actions);

    fragment.appendChild(item);
  });

  container.appendChild(fragment);
  updateTotals();
}

export function toggleProduct(id: number): void {
  const products = AppState.getProducts();
  const p = products.find(x => x.id === id);
  if (p) {
    p.checked = !p.checked;
    saveLists();
    renderProducts();
    updateTotals();
  }
}

export function deleteProduct(id: number): void {
  const products = AppState.getProducts();
  const idx = products.findIndex(x => x.id === id);
  if (idx !== -1) {
    products.splice(idx, 1);
    saveLists();
    renderProducts();
    updateTotals();
  }
}

export function clearList(): void {
  const products = AppState.getProducts();
  if (products.length === 0) { showToast('📭 Lista vacía'); return; }
  showConfirmModal(
    '🗑️ Borrar Lista',
    '¿Eliminar todos los productos de esta lista?',
    'Borrar Todo',
    () => {
      AppState.setProducts([]);
      saveLists();
      renderProducts();
      updateTotals();
    }
  );
}

export function enableEditProduct(id: number): void {
  const products = AppState.getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const item = document.querySelector(`.product-item[data-id="${id}"]`);
  if (!item) return;

  const info = item.querySelector('.product-info');
  if (!info) return;

  info.innerHTML = `
    <div class="edit-form-inline">
      <div class="edit-field"><label>Producto</label><input type="text" id="edit_name_${id}" value="${escapeHtml(p.name)}"></div>
      <div class="edit-field"><label>Cant</label><input type="text" id="edit_qty_${id}" value="${p.qty}" inputmode="numeric"></div>
      <div class="edit-field"><label>Und</label><input type="text" id="edit_unit_${id}" value="${escapeHtml(p.unit)}"></div>
      <div class="edit-field"><label>Precio</label><input type="text" id="edit_price_${id}" value="${p.price.toFixed(2)}" inputmode="numeric"></div>
      <div class="edit-actions">
        <button class="btn btn-sm btn-primary" data-id="${id}" data-action="saveEdit" aria-label="Guardar cambios">💾 Guardar</button>
        <button class="btn btn-sm btn-outline" data-id="${id}" data-action="cancelEdit" aria-label="Cancelar edición">✕ Cancelar</button>
      </div>
    </div>`;
}

export function saveEditProduct(id: number): void {
  const products = AppState.getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const nameInput = document.getElementById(`edit_name_${id}`) as HTMLInputElement | null;
  const qtyInput = document.getElementById(`edit_qty_${id}`) as HTMLInputElement | null;
  const unitInput = document.getElementById(`edit_unit_${id}`) as HTMLInputElement | null;
  const priceInput = document.getElementById(`edit_price_${id}`) as HTMLInputElement | null;

  if (!nameInput || !qtyInput || !priceInput) return;

  const newName = truncate(nameInput.value.trim(), 50);
  const newQty = Math.round(parseFloatFromLocalString(qtyInput.value)) || p.qty;
  const newUnit = truncate(unitInput ? unitInput.value.trim() : p.unit, 20);
  const newPrice = parseFloatFromLocalString(priceInput.value) || p.price;

  if (!newName) { showToast('⚠️ El nombre no puede estar vacío'); return; }

  p.name = newName;
  p.qty = newQty;
  p.unit = newUnit;
  p.price = newPrice;

  saveLists();
  renderProducts();
  updateTotals();
}

export function cancelEditProduct(id: number): void {
  renderProducts();
}
