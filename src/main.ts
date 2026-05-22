import { AppState } from './state';
import { loadLists, loadFinanceData, loadSavedRate } from './utils/storage';
import { fetchRate } from './modules/exchangeRate';
import { loadThemeFromStorage, setupMenu, setupFaq, adjustLayoutForScreen, switchToMainView, toggleListManagement, copyDonation, toggleTheme } from './modules/ui';
import { renderListTitle, switchList, createNewList, copyCurrentList, deleteCurrentList, exportCurrentList, openImportModal, closeImportModal, handleImportListFile, editListName, closeRenameModal, saveListName, updateListSelector, showPromptModal, closePromptModal, confirmPromptModal } from './modules/lists';
import { addProduct, toggleProduct, deleteProduct, clearList, renderProducts, enableEditProduct, saveEditProduct, cancelEditProduct } from './modules/products';
import { toggleManualInput, swapConversion, calculateConversion, calculateCoverage, calculateImaginary, calculateByWeight, addWeightProductToList } from './modules/calculator';
import { addTransaction, useCurrentListTotal, setSavingsGoal, deleteSavingsGoal, addSavingsContribution, renderFinanceSummary, renderSavingsGoal, setDefaultTransactionDate, renderTransactionHistory, renderCharts, renderStatistics, exportTransactionsCSV, exportTransactionsJSON, importTransactionsCSV, handleImportCsvFile, deleteTransaction, clearAllTransactions, showRandomTip, toggleDebtForm, addDebt, deleteDebt, markDebtPayment, renderDebts, showTransactionDetail, closeTxDetailModal } from './modules/finances';
import { renderCalendar, navigateCalendar, selectCalendarDay, toggleQuickForm, closeQuickForm, saveQuickTransaction, exportCalendarMonth, toggleMonthPicker, jumpToMonth, deleteFromCalendar } from './modules/calendar';
import { setupNotifications } from './modules/notifications';
import { setupBarcodeScanner, stopScanner } from './modules/scanner';
import { backupAllData, restoreAllData, handleRestoreFile } from './modules/backup';
import { showToast, showConfirmModal, closeConfirmModal, executeConfirmAction, getLastBackupDate, setLastBackupDate } from './utils/dom';
import { updateTotals } from './modules/finances';

document.addEventListener('DOMContentLoaded', () => {
  loadLists();
  loadSavedRate();
  fetchRate();
  loadThemeFromStorage();
  adjustLayoutForScreen();
  window.addEventListener('resize', adjustLayoutForScreen);

  loadFinanceData();
  renderFinanceSummary();
  renderSavingsGoal();
  setupMenu();
  setupFaq();
  setDefaultTransactionDate();

  showRandomTip();
  document.body.classList.add('main-view-active');

  /* Prompt modal enter key */
  const promptInput = document.getElementById('promptInput');
  promptInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') confirmPromptModal();
  });

  /* Scanner close */
  document.getElementById('scannerCloseBtn')?.addEventListener('click', () => {
    stopScanner();
    showToast('✋ Escaneo cancelado');
  });

  /* ===== BUTTON EVENT LISTENERS ===== */

  document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('logoBtn')?.addEventListener('click', switchToMainView);
  document.getElementById('logoBtn')?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') switchToMainView();
  });
  document.getElementById('listManagementToggle')?.addEventListener('click', toggleListManagement);

  /* List management */
  document.getElementById('listSelect')?.addEventListener('change', (e: Event) => {
    const select = e.target as HTMLSelectElement;
    switchList(select.value);
  });
  document.getElementById('createNewListBtn')?.addEventListener('click', createNewList);
  document.getElementById('copyListBtn')?.addEventListener('click', copyCurrentList);
  document.getElementById('exportListBtn')?.addEventListener('click', exportCurrentList);
  document.getElementById('openImportBtn')?.addEventListener('click', openImportModal);
  document.getElementById('deleteListBtn')?.addEventListener('click', deleteCurrentList);

  /* Products */
  document.getElementById('addProductBtn')?.addEventListener('click', addProduct);
  document.getElementById('clearListBtn')?.addEventListener('click', clearList);
  document.getElementById('shareListBtn')?.addEventListener('click', exportCurrentList);

  /* Calculator */
  document.getElementById('swapConvBtn')?.addEventListener('click', swapConversion);
  document.getElementById('calcCoverageBtn')?.addEventListener('click', calculateCoverage);
  document.getElementById('calcImagBtn')?.addEventListener('click', calculateImaginary);
  document.getElementById('weightAddBtn')?.addEventListener('click', addWeightProductToList);

  /* Calculator auto-calc on input/change */
  document.getElementById('convAmount')?.addEventListener('input', calculateConversion);
  document.getElementById('convFrom')?.addEventListener('change', calculateConversion);
  document.getElementById('manualToggle')?.addEventListener('change', toggleManualInput);
  document.getElementById('weightProdName')?.addEventListener('input', calculateByWeight);
  document.getElementById('weightPricePerKg')?.addEventListener('input', calculateByWeight);
  document.getElementById('weightKg')?.addEventListener('input', calculateByWeight);

  /* Cashea level change updates totals */
  document.getElementById('casheaLevel')?.addEventListener('change', updateTotals);

  /* Finances */
  document.getElementById('addTransactionBtn')?.addEventListener('click', addTransaction);
  document.getElementById('useListTotalBtn')?.addEventListener('click', useCurrentListTotal);
  document.getElementById('setSavingsGoalBtn')?.addEventListener('click', setSavingsGoal);
  document.getElementById('deleteSavingsGoalBtn')?.addEventListener('click', deleteSavingsGoal);
  document.getElementById('addContributionBtn')?.addEventListener('click', addSavingsContribution);
  document.getElementById('toggleDebtFormBtn')?.addEventListener('click', toggleDebtForm);
  document.getElementById('addDebtBtn')?.addEventListener('click', addDebt);
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportTransactionsCSV);
  document.getElementById('exportJsonBtn')?.addEventListener('click', exportTransactionsJSON);
  document.getElementById('backupBtn')?.addEventListener('click', backupAllData);
  document.getElementById('restoreBtn')?.addEventListener('click', restoreAllData);
  document.getElementById('restoreFileInput')?.addEventListener('change', handleRestoreFile);
  document.getElementById('importCsvBtn')?.addEventListener('click', importTransactionsCSV);
  document.getElementById('importCsvInput')?.addEventListener('change', handleImportCsvFile);

  /* Modals */
  document.getElementById('closeImportBtn')?.addEventListener('click', closeImportModal);
  document.getElementById('selectImportFileBtn')?.addEventListener('click', () => {
    document.getElementById('importFileInput')?.click();
  });
  document.getElementById('importFileInput')?.addEventListener('change', handleImportListFile);
  document.getElementById('cancelRenameBtn')?.addEventListener('click', closeRenameModal);
  document.getElementById('saveRenameBtn')?.addEventListener('click', saveListName);
  document.getElementById('cancelPromptBtn')?.addEventListener('click', closePromptModal);
  document.getElementById('confirmPromptBtn')?.addEventListener('click', confirmPromptModal);
  document.getElementById('cancelConfirmBtn')?.addEventListener('click', closeConfirmModal);
  document.getElementById('confirmActionBtn')?.addEventListener('click', executeConfirmAction);
  document.getElementById('closeTxDetailBtn')?.addEventListener('click', closeTxDetailModal);

  /* Donation cards */
  document.querySelectorAll('.donation-card').forEach(card => {
    card.addEventListener('click', () => {
      const copyText = (card as HTMLElement).dataset.copy;
      if (copyText) copyDonation(copyText);
    });
  });

  /* ===== EVENT DELEGATION ===== */

  /* Calendar: day clicks */
  const calGrid = document.getElementById('calGrid');
  calGrid?.addEventListener('click', (e: Event) => {
    const dayEl = (e.target as HTMLElement).closest('.cal-day') as HTMLElement | null;
    if (!dayEl) return;
    if (dayEl.classList.contains('cal-other-month')) {
      const idx = Array.from(dayEl.parentNode!.children).indexOf(dayEl);
      const weekdayPos = (idx - 7) % 7;
      if (weekdayPos < 3) navigateCalendar(1);
      else navigateCalendar(-1);
      return;
    }
    selectCalendarDay(dayEl);
  });

  document.getElementById('calPrevBtn')?.addEventListener('click', () => navigateCalendar(-1));
  document.getElementById('calNextBtn')?.addEventListener('click', () => navigateCalendar(1));

  /* Calendar: day list delete buttons */
  document.getElementById('calDayList')?.addEventListener('click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest('.history-delete') as HTMLElement | null;
    if (btn && btn.dataset.txid) deleteFromCalendar(parseInt(btn.dataset.txid));
  });

  document.getElementById('calQuickAddBtn')?.addEventListener('click', toggleQuickForm);
  document.getElementById('qfSaveBtn')?.addEventListener('click', saveQuickTransaction);
  document.getElementById('qfCancelBtn')?.addEventListener('click', closeQuickForm);
  document.getElementById('calExportBtn')?.addEventListener('click', exportCalendarMonth);
  document.getElementById('calTitle')?.addEventListener('click', toggleMonthPicker);

  document.getElementById('calMpGrid')?.addEventListener('click', (e: Event) => {
    const item = (e.target as HTMLElement).closest('.cal-mp-item') as HTMLElement | null;
    if (item && item.dataset.m !== undefined) jumpToMonth(item.dataset.m);
  });

  /* Calendar touch swipe */
  let calTouchStartX = 0;
  let calTouchStartY = 0;
  if (calGrid) {
    calGrid.addEventListener('touchstart', (e: TouchEvent) => {
      calTouchStartX = e.touches[0].clientX;
      calTouchStartY = e.touches[0].clientY;
    }, { passive: true });
    calGrid.addEventListener('touchend', (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - calTouchStartX;
      const dy = e.changedTouches[0].clientY - calTouchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dy) < Math.abs(dx) * 0.7) {
        if (dx < 0) navigateCalendar(1);
        else navigateCalendar(-1);
      }
    }, { passive: true });
  }

  /* Product list delegation */
  const productList = document.getElementById('productList');
  productList?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;

    /* Checkbox toggle */
    const checkInput = target.closest('.product-check input[type="checkbox"]') as HTMLInputElement | null;
    if (checkInput) {
      const item = checkInput.closest('.product-item') as HTMLElement | null;
      if (item && item.dataset.id) toggleProduct(parseInt(item.dataset.id));
      return;
    }

    /* Click anywhere on product-item to toggle (but not on interactive children) */
    const itemDiv = target.closest('.product-item') as HTMLElement | null;
    if (itemDiv && itemDiv.dataset.id &&
        !target.closest('[data-action]') &&
        !target.closest('input, button, select, textarea, label')) {
      toggleProduct(parseInt(itemDiv.dataset.id));
      return;
    }

    /* Edit button */
    const editBtn = target.closest('[data-action="edit"]') as HTMLElement | null;
    if (editBtn && editBtn.dataset.id) {
      enableEditProduct(parseInt(editBtn.dataset.id));
      return;
    }

    /* Delete button */
    const deleteBtn = target.closest('[data-action="delete"]') as HTMLElement | null;
    if (deleteBtn && deleteBtn.dataset.id) {
      deleteProduct(parseInt(deleteBtn.dataset.id));
      return;
    }

    /* Save edit */
    const saveBtn = target.closest('[data-action="saveEdit"]') as HTMLElement | null;
    if (saveBtn && saveBtn.dataset.id) {
      saveEditProduct(parseInt(saveBtn.dataset.id));
      return;
    }

    /* Cancel edit */
    const cancelBtn = target.closest('[data-action="cancelEdit"]') as HTMLElement | null;
    if (cancelBtn && cancelBtn.dataset.id) {
      cancelEditProduct(parseInt(cancelBtn.dataset.id));
      return;
    }
  });

  /* Transaction history delegation */
  document.getElementById('transactionHistory')?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;

    const deleteBtn = target.closest('.history-delete') as HTMLElement | null;
    if (deleteBtn && deleteBtn.dataset.txid) {
      deleteTransaction(parseInt(deleteBtn.dataset.txid));
      return;
    }

    const clearBtn = target.closest('#clearAllTxBtn') as HTMLElement | null;
    if (clearBtn) {
      clearAllTransactions();
      return;
    }

    const txRow = target.closest('.history-row') as HTMLElement | null;
    if (txRow && txRow.dataset.txid) {
      const tx = AppState.state.transactions.find(t => t.id === parseInt(txRow.dataset.txid || '0'));
      if (tx) showTransactionDetail(tx);
    }
  });

  /* Debts delegation */
  document.getElementById('debtsList')?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;

    const payBtn = target.closest('[data-action="markDebtPayment"]') as HTMLElement | null;
    if (payBtn && payBtn.dataset.id) {
      markDebtPayment(parseInt(payBtn.dataset.id));
      return;
    }

    const delBtn = target.closest('[data-action="deleteDebt"]') as HTMLElement | null;
    if (delBtn && delBtn.dataset.id) {
      deleteDebt(parseInt(delBtn.dataset.id));
      return;
    }
  });

  /* Modal overlay clicks to close */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e: Event) => {
      if (e.target === overlay) {
        const id = overlay.id;
        if (id === 'importModal') closeImportModal();
        else if (id === 'renameModal') closeRenameModal();
        else if (id === 'promptModal') closePromptModal();
        else if (id === 'confirmModal') closeConfirmModal();
        else if (id === 'txDetailModal') closeTxDetailModal();
      }
    });
  });

  /* List management: open triggers updateListSelector */
  window.addEventListener('listmanagement:open', () => {
    updateListSelector();
  });

  /* Finance update event */
  window.addEventListener('finance:updated', () => {
    renderFinanceSummary();
    renderCharts();
    renderStatistics();
    renderTransactionHistory();
    renderDebts();
  });

  /* Add from weight calculator */
  window.addEventListener('product:addFromWeight', () => {
    addProduct();
  });

  /* Deferred setup */
  setTimeout(() => {
    setupBarcodeScanner();
    setupNotifications();
    renderTransactionHistory();
    renderCharts();
    renderStatistics();
    renderDebts();
    renderProducts();
    renderListTitle();
  }, 100);

  /* ===== OFFLINE INDICATOR ===== */
  const offlineIndicator = document.getElementById('offlineIndicator');
  function updateOnlineStatus(): void {
    if (!offlineIndicator) return;
    if (navigator.onLine) {
      offlineIndicator.classList.remove('visible');
    } else {
      offlineIndicator.classList.add('visible');
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateOnlineStatus();
  });
  setInterval(updateOnlineStatus, 3000);
  updateOnlineStatus();

  /* ===== FORCE COLOR EMOJI (Chrome desktop fix) ===== */
  (function forceColorEmoji(): void {
    if (!CSS.supports?.('font-variant-emoji', 'emoji')) {
      const emojiRx = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const done = new Set<HTMLElement>();
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        if (!emojiRx.test(node.textContent || '')) continue;
        const p = node.parentElement;
        if (p && !done.has(p)) {
          done.add(p);
          p.style.setProperty('font-family', "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif", 'important');
        }
      }
    }
  })();

  /* ===== AUTO-BACKUP REMINDER (every 7 days) ===== */
  const lastBackup = getLastBackupDate();
  if (lastBackup) {
    const daysSince = Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000);
    if (daysSince >= 7) {
      setTimeout(() => {
        showConfirmModal(
          '💾 ¿Respaldar?',
          `Han pasado ${daysSince} días desde tu último respaldo. ¿Quieres descargar uno ahora?`,
          'Descargar Backup',
          () => {
            backupAllData();
            setLastBackupDate(new Date().toISOString());
          }
        );
      }, 3000);
    }
  }
  /* Set backup date when backup is made */
  document.getElementById('backupBtn')?.addEventListener('click', () => {
    setLastBackupDate(new Date().toISOString());
  });

  /* ===== PULL-TO-REFRESH for product list ===== */
  const productListEl = document.getElementById('productList');
  if (productListEl) {
    let pullStartY = 0;
    let pulling = false;
    const pullIndicator = document.getElementById('pullIndicator');
    productListEl.addEventListener('touchstart', (e: TouchEvent) => {
      if (window.scrollY <= 0 && productListEl.scrollTop <= 0) {
        pullStartY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });
    productListEl.addEventListener('touchmove', (e: TouchEvent) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - pullStartY;
      if (dy > 60 && pullIndicator) {
        pullIndicator.classList.add('visible');
        pullIndicator.innerHTML = '<span class="spinner">🔄</span> Suelta para refrescar';
      }
    }, { passive: true });
    productListEl.addEventListener('touchend', () => {
      if (pulling && pullIndicator && pullIndicator.classList.contains('visible')) {
        pullIndicator.innerHTML = '<span class="spinner">🔄</span> Refrescando...';
        renderProducts();
        updateTotals();
        setTimeout(() => {
          pullIndicator.classList.remove('visible');
          showToast('✅ Lista actualizada');
        }, 500);
      }
      pulling = false;
    }, { passive: true });
  }
});
