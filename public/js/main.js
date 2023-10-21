////////////////Плавный скрол по якорям
$("body").on('click', '[href*="#"]:not(.linknotanchor)', function(e){
  var fixed_offset = 20;
  $('html,body').stop().animate({ scrollTop: $(this.hash).offset().top - fixed_offset }, 400);
  e.preventDefault();
});

////////////////9 точек верхнего меню
$(".toprightmenu").click(function() {
  $(".topmenu").toggleClass('active');
  $('.topopen').toggle();
  $('.topclose').toggle();
});

////////////////Открытие результатов теста
$("#checkresult").click(function() {
  $("#result").show();
});

////////////////Открытие внешних ссылок в новой вкладке
$(document).ready( function() {
	var c_host = document.location.host.replace(/www\./, '');
	$(document.body).on('click', 'a', function() {
		if (this.href && this.href.indexOf(c_host) == -1) {
			$(this).attr('target', '_blank');
		}
	});
});

/*Передаю данные из подсказок .varrange в input с id=rangetarget*/
const varRanges = document.querySelectorAll('.varrange');
varRanges.forEach(varRange => {
  varRange.addEventListener('click', () => {
    const target = document.getElementById(varRange.dataset.target);
    target.value = varRange.dataset.rate;
  });
});


////////////////Скопировать ссылки и iframe калькулятора
function handleClick(event) {
  const shareButton = event.currentTarget;
  const originalText = shareButton.innerHTML;
  // Заменяем текст на "готово"
  shareButton.innerHTML = '<b><span class="material-symbols-rounded">done</span> готово</b>';
  // Копируем содержимое в буфер обмена
  navigator.clipboard.writeText(shareButton.dataset.copyText);
  // Через 5 секунд восстанавливаем исходный текст
  setTimeout(() => {
    shareButton.innerHTML = originalText;
  }, 1000);
}
// Находим элементы с нужными id
const linkButton = document.getElementById('copylink');
const frameButton = document.getElementById('copyframe');
// Добавляем обработчики клика на эти элементы
linkButton.addEventListener('click', handleClick);
frameButton.addEventListener('click', handleClick);
// Устанавливаем содержимое для копирования для каждого элемента
linkButton.dataset.copyText = window.location.href;
frameButton.dataset.copyText = `<iframe src="${window.location.href}page" style="margin:20px 0;height:500px;width:100%;max-width:800px;border:none;"></iframe>`;


////////////////Крашу ползунки range
function updateRangeValue(event) {
  const numberInput = event.target;
  const rangeInput = numberInput.nextElementSibling.nextElementSibling;
  const min = rangeInput.min;
  const max = rangeInput.max;
  const value = numberInput.value;

  rangeInput.value = value;
  rangeInput.style.backgroundSize = (value - min) * 100 / (max - min) + "% 100%";
}
function updateNumberValue(event) {
  const rangeInput = event.target;
  const numberInput = rangeInput.previousElementSibling.previousElementSibling;
  const min = rangeInput.min;
  const max = rangeInput.max;
  const value = rangeInput.value;
  
  numberInput.value = value;
  rangeInput.style.backgroundSize = (value - min) * 100 / (max - min) + "% 100%";
}

const numrangeLabels = document.querySelectorAll('.numrange');

numrangeLabels.forEach(function(label) {
  const numberInput = label.querySelector('input[type="number"]');
  const rangeInput = label.querySelector('input[type="range"]');
  
  numberInput.addEventListener('input', updateRangeValue);
  rangeInput.addEventListener('input', updateNumberValue);
});