/** Pure helpers shared by the catalog and React consumers. No application data. */
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function queryRows(rows, {search='',status='',direction='asc',page=1,pageSize=5}={}) {
  const filtered=rows.filter(row => (!status || row.status===status) && row.name.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru')))
    .sort((a,b) => a.name.localeCompare(b.name,'ru')*(direction==='desc' ? -1 : 1));
  const safeSize=Math.max(1,Math.floor(Number(pageSize)||5));
  const pages=Math.max(1,Math.ceil(filtered.length/safeSize));
  const current=Math.min(pages,Math.max(1,Math.floor(Number(page)||1)));
  return {rows:filtered.slice((current-1)*safeSize,current*safeSize),total:filtered.length,page:current,pages};
}
export function validateImage(file, maxBytes=5*1024*1024) {
  if (!file) return 'Выберите изображение.';
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) return 'Поддерживаются PNG, JPEG и WebP.';
  if (file.size>maxBytes) return 'Файл больше 5 МБ. Выберите изображение меньшего размера.';
  return '';
}
export function validateDateRange(start,end) {
  if(!start||!end) return 'Выберите начало и конец периода.';
  if(start>end) return 'Конец периода не может быть раньше начала.';
  return '';
}
export const stateDefinitions = {
  initial:{title:'Загружаем данные',text:'Подготавливаем рабочую область.',tone:'info',action:''},
  refreshing:{title:'Обновляем данные',text:'Предыдущие данные остаются доступны до завершения обновления.',tone:'info',action:''},
  empty:{title:'Объектов пока нет',text:'Создайте первый объект, чтобы начать работу.',tone:'info',action:'Создать объект'},
  noResults:{title:'Ничего не найдено',text:'Попробуйте другой запрос или сбросьте фильтры.',tone:'info',action:'Сбросить фильтры'},
  error:{title:'Не удалось загрузить данные',text:'Введённые данные сохранены в форме. Попробуйте ещё раз.',tone:'danger',action:'Повторить загрузку'},
  success:{title:'Изменения сохранены',text:'Обновлённая версия доступна в рабочем пространстве.',tone:'success',action:''},
  forbidden:{title:'Недостаточно прав',text:'Для редактирования нужна роль редактора. Данные доступны только для чтения.',tone:'warning',action:'Посмотреть права'},
  offline:{title:'Нет соединения',text:'Показаны ранее загруженные данные. Отправка временно недоступна.',tone:'warning',action:'Проверить соединение'},
  expired:{title:'Сессия завершена',text:'Войдите снова, чтобы продолжить работу.',tone:'warning',action:'Войти'},
  dirty:{title:'Есть несохранённые изменения',text:'Сохраните изменения или отмените их перед выходом.',tone:'warning',action:'Сохранить изменения'},
  conflict:{title:'Объект изменён другим пользователем',text:'Сравните версии перед сохранением. Ваши изменения не перезаписаны.',tone:'warning',action:'Сравнить версии'},
  partial:{title:'Выполнено частично',text:'8 объектов обработано, 2 требуют проверки. Успешные операции не повторяются.',tone:'warning',action:'Показать проблемные объекты'},
  unknown:{title:'Результат операции неизвестен',text:'Сервер мог завершить действие до обрыва соединения. Сначала проверьте его статус.',tone:'warning',action:'Проверить статус'},
  unavailable:{title:'Функция временно недоступна',text:'Сервис находится на обслуживании. Остальные разделы продолжают работать.',tone:'warning',action:'Открыть другие разделы'}
};
