document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const videoBtn = document.querySelector('.video-btn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const submitBtn = document.getElementById('submitBtn');
    const agreeCheckbox = document.getElementById('agree');
    
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
            document.body.style.overflow = 'auto';
        }
    }
    
    // Функция отправки формы
    function submitForm() {
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const communicationMethods = document.querySelectorAll('input[name="communication"]:checked');
        
        // Валидация
        if (!name || !name.value.trim()) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }
        
        if (!phone || !phone.value.trim()) {
            alert('Пожалуйста, введите номер телефона');
            return;
        }
        
        if (!communicationMethods || communicationMethods.length === 0) {
            alert('Пожалуйста, выберите хотя бы один способ связи');
            return;
        }
        
        if (!agreeCheckbox || !agreeCheckbox.checked) {
            alert('Необходимо согласие на обработку персональных данных');
            return;
        }
        
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
        const communicationCheckboxes = document.querySelectorAll('input[name="communication"]');
        
        if (name) name.value = '';
        if (phone) phone.value = '';
        if (communicationCheckboxes) {
            communicationCheckboxes.forEach(cb => cb.checked = false);
        }
        if (agreeCheckbox) agreeCheckbox.checked = false;
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
