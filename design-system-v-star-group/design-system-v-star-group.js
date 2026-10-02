/* Catalog interactions only. No fetch, storage, application API or business logic. */
(() => {
  'use strict';
  const root = document.querySelector('.vsg');
  if (!root) return;
  const toast = document.getElementById('toast');
  function notify(message) {
    toast.hidden = false;
    document.getElementById('toast-message').textContent = message;
  }
  document.getElementById('toast-close').addEventListener('click', () => { toast.hidden = true; });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-toast],[data-dialog]');
    if (!button) return;
    if (button.dataset.toast) notify(button.dataset.toast);
    if (button.dataset.dialog) document.getElementById(button.dataset.dialog).showModal();
  });
  root.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      const messages = { created:'Демо: черновик создан', deleted:'Демо: удаление подтверждено', saved:'Демо: настройки сохранены' };
      if (messages[dialog.returnValue]) notify(messages[dialog.returnValue]);
      dialog.returnValue = '';
    });
  });
  const form = document.getElementById('demo-form');
  const channelPlatform = document.getElementById('catalog-channel-platform');
  const updateChannelFields = () => {
    root.querySelectorAll('[data-vk-only]').forEach(field => { field.hidden = channelPlatform.value !== 'vk'; });
  };
  channelPlatform.addEventListener('change', updateChannelFields);
  updateChannelFields();
  form.addEventListener('submit', event => { event.preventDefault(); notify('Демо: форма проверена. Данные не отправлены.'); });
  form.addEventListener('reset', () => {
    document.getElementById('range-output').textContent = '3';
    document.getElementById('file-output').textContent = '';
  });
  document.getElementById('post-range').addEventListener('input', event => { document.getElementById('range-output').textContent = event.target.value; });
  document.getElementById('demo-file').addEventListener('change', event => {
    document.getElementById('file-output').textContent = event.target.files[0]?.name || '';
  });
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight:(index+1)%tabs.length, ArrowLeft:(index-1+tabs.length)%tabs.length, Home:0, End:tabs.length-1 }[event.key];
      if (next === undefined) return;
      event.preventDefault(); selectTab(tabs[next]); tabs[next].focus();
    });
  });
  root.querySelectorAll('.vsg-segment button').forEach(button => {
    button.addEventListener('click', () => {
      button.parentElement.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.getElementById('view-output').textContent = `Выбран вид: ${button.textContent}`;
    });
  });
  const rows = [
    [['Разминка перед тренировкой','VK','Опубликовано','success','22 сен, 09:00'],['Пять минут для себя','Telegram','На проверке','warning','22 сен, 14:00'],['Движение каждый день','VK','Генерация','info','22 сен, 18:00']],
    [['Восстановление после нагрузки','VK','Черновик','','23 сен, 09:00'],['Начинаем с малого','Telegram','Пауза','paused','23 сен, 14:00'],['План на выходные','VK','Ошибка','danger','23 сен, 18:00']]
  ];
  function renderPage(page) {
    const body = document.getElementById('demo-table-body'); body.replaceChildren();
    rows[page-1].forEach(([title,channel,status,tone,date]) => {
      const tr = document.createElement('tr');
      [title,channel,status,date].forEach((text,index) => {
        const td = document.createElement('td');
        if (index === 2) { const badge = document.createElement('span'); badge.className = `vsg-badge${tone ? ` vsg-badge--${tone}` : ''}`; badge.textContent = text; td.append(badge); }
        else td.textContent = text;
        tr.append(td);
      });
      const action = document.createElement('td'); const button = document.createElement('button');
      button.className = 'vsg-button vsg-button--ghost vsg-button--small'; button.textContent = 'Подробнее';
      button.setAttribute('aria-label',`Подробнее: ${title}`); button.dataset.toast = `Демо: «${title}» · ${status}`;
      action.append(button); tr.append(action); body.append(tr);
    });
    root.querySelectorAll('[data-page]').forEach(button => {
      if (Number(button.dataset.page) === page) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('page-output').textContent = `Страница ${page} из 2`;
  }
  root.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => renderPage(Number(button.dataset.page))));
  renderPage(1);
  document.getElementById('pattern-toggle').addEventListener('click', event => {
    const button = event.currentTarget; const enabled = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed',String(enabled)); button.textContent = enabled ? 'Приостановить' : 'Включить расписание';
    const status = document.getElementById('pattern-status'); status.textContent = enabled ? 'Активно' : 'На паузе';
    status.className = `vsg-badge vsg-badge--${enabled ? 'success' : 'paused'}`;
  });
  root.querySelectorAll('.vsg-tooltip').forEach(tip => {
    tip.addEventListener('keydown', event => { if (event.key === 'Escape') tip.dataset.dismissed = ''; });
    ['mouseleave','focusout'].forEach(type => tip.addEventListener(type, () => delete tip.dataset.dismissed));
  });
  const links = [...root.querySelectorAll('.catalog-sidebar nav a')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if (!visible) return;
    links.forEach(link => { if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  }, {rootMargin:'-5% 0px -65% 0px', threshold:0});
  root.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
})();
