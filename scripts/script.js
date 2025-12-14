document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const videoBtn = document.querySelector('.video-btn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const submitBtn = document.getElementById('submitBtn');
    const agreeCheckbox = document.getElementById('agree');
    const methodButtons = document.querySelectorAll('.method-option');
    
    // Открытие модального окна при клике на видео
    if (videoBtn) {
        videoBtn.addEventListener('click', function() {
            openModal();
        });
    }
    
    // Закрытие модального окна
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeModalFunc();
        });
    }
    
    // Закрытие при клике вне модального окна
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModalFunc();
            }
        });
    }
    
    // Обработка отправки формы
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            submitForm();
        });
    }
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModalFunc();
        }
    });
    
    // Для демонстрации: если видео недоступно, заменяем на заглушку
    if (videoBtn) {
        videoBtn.addEventListener('error', function() {
            replaceVideoWithFallback();
        });
    }

    if (methodButtons.length > 0) {
        methodButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Удаляем класс active у всех кнопок и сбрасываем стили
                methodButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = 'rgb(255 255 255 / 5%)';
                    btn.style.color = '#fff';
                });
                
                // Добавляем класс active и меняем стили только для выбранной кнопки
                this.classList.add('active');
                this.style.backgroundColor = '#fff';
                this.style.color = '#000';
                
                // Сохраняем выбранный способ связи в скрытом поле
                const methodType = this.id === 'wh-button' ? 'whatsapp' : 
                                 this.id === 'tg-button' ? 'telegram' : 'phone';
                updateSelectedMethod(methodType);
            });
        });
    }
    
    // Функция открытия модального окна
    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Функция закрытия модального окна
    function closeModalFunc() {
        if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Полностью сбрасываем все стили скролла
        document.body.style.overflow = '';
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        
        // Также для html элемента
        document.documentElement.style.overflow = '';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.overflowY = 'auto';
        
        // Убираем возможный padding-right, который мог добавиться из-за скроллбара
        document.body.style.paddingRight = '0';
        document.documentElement.style.paddingRight = '0';
        
        // Убираем класс затемнения
        const container = document.querySelector('.container');
        if (container) {
            container.classList.remove('blurred-background');
        }
      }
    }
    
    // Функция отправки формы
    function submitForm() {
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const communicationMethods = document.querySelectorAll('input[name="communication"]:checked');

        // Проверяем, выбран ли способ связи (активная кнопка)
        const selectedMethodButton = document.querySelector('.method-option.active');
        
        // Валидация
        if (!name || !name.value.trim()) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }
        
        if (!phone || !phone.value.trim()) {
            alert('Пожалуйста, введите номер телефона');
            return;
        }
        
        if (!selectedMethodButton) {
            alert('Пожалуйста, выберите способ связи');
            return;
        }
        
        if (!agreeCheckbox || !agreeCheckbox.checked) {
            alert('Необходимо согласие на обработку персональных данных');
            return;
        }

        // Получаем выбранный способ связи
        const selectedMethod = selectedMethodButton.id === 'wh-button' ? 'whatsapp' : 
                              selectedMethodButton.id === 'tg-button' ? 'telegram' : 'phone';
        
        // Сбор данных формы
        const formData = {
            name: name.value.trim(),
            phone: phone.value.trim(),
            communicationMethods: Array.from(communicationMethods).map(cb => cb.value)
        };
        
        // Здесь можно добавить отправку данных на сервер
        console.log('Данные формы:', formData);
        
        // Показать сообщение об успехе
        alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
        
        // Закрыть модальное окно
        closeModalFunc();
        
        // Очистить форму
        resetForm();
    }
    
    // Функция сброса формы
    function resetForm() {
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        
        if (name) name.value = '';
        if (phone) phone.value = '';
        if (agreeCheckbox) agreeCheckbox.checked = false;
        
        // Сбрасываем выбор способов связи
        resetMethodSelection();
    }

    // Функция сброса выбора способов связи
    function resetMethodSelection() {
        if (methodButtons.length > 0) {
            methodButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = 'rgb(255 255 255 / 5%)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                btn.style.color = '#fff';
            });
            
            // Удаляем скрытое поле с выбранным методом
            const hiddenInput = document.getElementById('selected-method');
            if (hiddenInput) {
                hiddenInput.remove();
            }
        }
    }
    
    // Функция обновления выбранного способа связи
    function updateSelectedMethod(methodType) {
        // Удаляем старое скрытое поле, если оно существует
        const oldHiddenInput = document.getElementById('selected-method');
        if (oldHiddenInput) {
            oldHiddenInput.remove();
        }
        
        // Создаем новое скрытое поле с выбранным значением
        const methodsList = document.querySelector('.methods-list');
        if (methodsList) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'selected-method';
            hiddenInput.name = 'preferred-method';
            hiddenInput.value = methodType;
            methodsList.appendChild(hiddenInput);
        }
    }
    
    // Функция замены видео на заглушку при ошибке загрузки
    function replaceVideoWithFallback() {
        console.log('Видео не найдено, используем заглушку');
        
        const videoWrapper = document.querySelector('.video-btn-wrapper');
        if (!videoWrapper) return;
        
        // Создаем градиентную анимацию как заглушку
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        canvas.className = 'video-fallback';
        const ctx = canvas.getContext('2d');
        
        let angle = 0;
        function drawGradient() {
            angle += 0.02;
            const gradient = ctx.createLinearGradient(
                0, 0, 
                80 * Math.cos(angle), 80 * Math.sin(angle)
            );
            gradient.addColorStop(0, '#4facfe');
            gradient.addColorStop(1, '#00f2fe');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 80, 80);
            
            requestAnimationFrame(drawGradient);
        }
        
        drawGradient();
        
        // Заменяем видео на canvas
        const videoElement = videoWrapper.querySelector('.video-btn');
        if (videoElement) {
            videoWrapper.removeChild(videoElement);
        }
        videoWrapper.appendChild(canvas);
        
        // Добавляем стили и обработчик события
        canvas.style.borderRadius = '50%';
        canvas.style.cursor = 'pointer';
        canvas.style.display = 'block';
        canvas.addEventListener('click', openModal);
    }
    
    // Добавляем возможность открытия модального окна из других мест (опционально)
    window.openContactModal = openModal;
    window.closeContactModal = closeModalFunc;
});
