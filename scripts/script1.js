// Конфигурация API и путей к изображениям
const CONFIG = {
    API: {
        BASE_URL: 'https://corsproxy.io/?' + encodeURIComponent('https://sputnik-db.dotindex-team.ru'),
        ENDPOINTS: {
            PROFILES: '/long_poll_profiles/'
        }
    },
    IMAGES: {
        BASE_URL: 'https://sputnik-db.dotindex-team.ru/api/static/images/',
        LEVELS: 'level', // Базовое имя для картинок уровня
        EXTENSION: '.png'
    }
};

// Вспомогательная функция для определения картинки уровня по k
function getLevelImageName(k) {
    // k - номер полученного значка уровня (например, для уровня 17 -> k=15)
    // Используем переданный k напрямую
    return `${CONFIG.IMAGES.BASE_URL}${CONFIG.IMAGES.LEVELS}${k}${CONFIG.IMAGES.EXTENSION}`;
}

// Вспомогательная функция для формирования полного URL изображения
function getImageUrl(imageName) {
    return `${CONFIG.IMAGES.BASE_URL}${imageName}${CONFIG.IMAGES.EXTENSION}`;
}

// Основной класс для работы с профилями
class ProfilesManager {
    constructor() {
        this.container = document.querySelector('.container_for_employee');
        this.template = document.getElementById('profile-template');
        this.profiles = [];
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await this.loadProfiles();
            this.renderProfiles();
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError(error.message);
            
            // Для тестирования используем мок-данные
            console.log('Используем тестовые данные...');
            this.profiles = mockProfiles;
            this.renderProfiles();
        }
    }

    async loadProfiles() {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.PROFILES}`);
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.profiles || !Array.isArray(data.profiles)) {
                throw new Error('Некорректный формат данных');
            }
            
            this.profiles = data.profiles;
            this.sortProfilesByScore();
            
        } catch (error) {
            console.error('Ошибка загрузки профилей:', error);
            throw error;
        }
    }

    sortProfilesByScore() {
        // Сортируем по очкам (предполагаем, что stats содержит gb/yb/rb)
        this.profiles.sort((a, b) => {
            const getTotalScore = (profile) => {
                let total = 0;
                if (profile.stats) {
                    profile.stats.forEach(stat => {
                        if (stat.label === 'gb' || stat.label === 'yb' || stat.label === 'rb') {
                            total += stat.value || 0;
                        }
                    });
                }
                return total;
            };
            
            return getTotalScore(b) - getTotalScore(a);
        });
    }

    renderProfiles() {
        // Очищаем контейнер
        this.container.innerHTML = '';
        
        if (this.profiles.length === 0) {
            this.container.innerHTML = '<div class="loading">Нет данных о профилях</div>';
            return;
        }
        
        // Создаем профили для каждого сотрудника
        this.profiles.forEach((profileData, index) => {
            const profileElement = this.createProfileElement(profileData, index + 1);
            this.container.appendChild(profileElement);
        });
    }

    createProfileElement(profileData, place) {
        // Клонируем шаблон
        const profileElement = this.template.content.cloneNode(true).querySelector('.profile');
        
        // Заполняем данные
        this.updateProfileElement(profileElement, profileData, place);
        
        return profileElement;
    }

    updateProfileElement(element, profileData, place) {
        // Базовые данные
        element.querySelector('.name').textContent = profileData.name || 'Неизвестный';
        element.querySelector('.level').textContent = profileData.lvl || '0';
        
        // Место (позиция)
        this.updatePlaceElement(element.querySelector('.place'), place);
        
        // Аватар
        const imgProfile = element.querySelector('.img_profile');
        if (profileData.image_url) {
            imgProfile.src = getImageUrl(profileData.image_url.replace('.jpg', ''));
            imgProfile.alt = profileData.name || 'Аватар';
        }
        
        // Уровень (значок) - используем k для определения картинки
        const levelProfile = element.querySelector('.level_profile');
        if (profileData.k !== undefined && profileData.k !== null) {
            const levelImageUrl = getLevelImageName(profileData.k);
            levelProfile.src = levelImageUrl;
            levelProfile.alt = `Уровень ${profileData.lvl}`;
        }
        
        // Команда
        const teamImg = element.querySelector('.img_team');
        if (profileData.team) {
            const teamImageName = profileData.team.replace('.jpg', '');
            teamImg.src = getImageUrl(teamImageName);
            teamImg.alt = 'Команда';
        }
        
        // Очки (суммируем gb + yb + rb)
        const scoreElement = element.querySelector('.score');
        const totalScore = this.calculateTotalScore(profileData.stats);
        scoreElement.textContent = totalScore;
        
        // Прогресс и статистика gb/yb/rb
        const statsContainer = element.querySelector('.progress_stats_container');
        statsContainer.innerHTML = '';
        
        // Прогресс бар (если есть progress_percent)
        if (profileData.progress_percent !== undefined) {
            const progressBar = this.createProgressBar(profileData.progress_percent);
            statsContainer.appendChild(progressBar);
        }
        
        // Статистика gb, yb, rb
        this.renderGbYbRbStats(statsContainer, profileData.stats);
    }

    calculateTotalScore(stats) {
        let total = 0;
        if (stats && Array.isArray(stats)) {
            stats.forEach(stat => {
                if (stat.label === 'gb' || stat.label === 'yb' || stat.label === 'rb') {
                    total += stat.value || 0;
                }
            });
        }
        return total;
    }

    updatePlaceElement(placeElement, place) {
        placeElement.textContent = place;
        
        // Обновляем цвет места в зависимости от позиции
        if (place === 1) {
            placeElement.style.backgroundColor = '#FFD700'; // Золотой
            placeElement.style.color = '#000';
        } else if (place === 2) {
            placeElement.style.backgroundColor = '#C0C0C0'; // Серебряный
            placeElement.style.color = '#000';
        } else if (place === 3) {
            placeElement.style.backgroundColor = '#CD7F32'; // Бронзовый
            placeElement.style.color = '#000';
        } else {
            placeElement.style.backgroundColor = '#3479E9';
            placeElement.style.color = '#fff';
        }
    }

    createProgressBar(percent) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.width = '120px';
        
        progressContainer.innerHTML = `
            <div class="progress-label">Прогресс</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="progress-percent">${percent}%</div>
        `;
        
        return progressContainer;
    }

    renderGbYbRbStats(container, stats) {
        if (!stats || !Array.isArray(stats)) return;
        
        // Фильтруем только gb, yb, rb
        const relevantStats = stats.filter(stat => 
            stat.label === 'gb' || stat.label === 'yb' || stat.label === 'rb'
        );
        
        // Создаем элементы для каждой статистики
        relevantStats.forEach(stat => {
            const statElement = this.createGbYbRbStatElement(stat);
            container.appendChild(statElement);
        });
    }

    createGbYbRbStatElement(stat) {
        const statElement = document.createElement('div');
        statElement.className = `stat-row stat-${stat.label}`;
        
        // Определяем иконку в зависимости от типа
        let iconName = '';
        switch(stat.label) {
            case 'gb':
                iconName = 'gb_icon';
                break;
            case 'yb':
                iconName = 'yb_icon';
                break;
            case 'rb':
                iconName = 'rb_icon';
                break;
            default:
                iconName = 'default_icon';
        }
        
        const iconUrl = getImageUrl(iconName);
        
        statElement.innerHTML = `
            <img src="${iconUrl}" alt="${stat.label}" class="stat-icon-small">
            <div class="stat-content">
                <div class="stat-label-small">${this.getStatLabel(stat.label)}</div>
                <div class="stat-value-small">${stat.value || '0'}</div>
            </div>
        `;
        
        return statElement;
    }

    getStatLabel(statType) {
        switch(statType) {
            case 'gb':
                return 'GB';
            case 'yb':
                return 'YB';
            case 'rb':
                return 'RB';
            default:
                return statType.toUpperCase();
        }
    }

    showLoading() {
        this.container.innerHTML = '<div class="loading">Загрузка данных...</div>';
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error">
                Ошибка загрузки данных: ${message}
                <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3479E9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    async refreshData() {
        try {
            await this.loadProfiles();
            this.renderProfiles();
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const profilesManager = new ProfilesManager();
    
    // Опционально: обновление данных каждые 30 секунд
    // setInterval(() => profilesManager.refreshData(), 30000);
});

// Мок-данные для тестирования (имитируют структуру из Swagger)
const mockProfiles = [
    {
        name: "Артем Сотников",
        image_url: "photo_profile.jpg",
        team: "team_alpha.jpg",
        lvl: 17,
        k: 15, // Для уровня 17, последний полученный значок - 15
        progress_percent: 75,
        stats: [
            { label: "gb", value: 120, imgPath: "gb_icon.png" },
            { label: "yb", value: 85, imgPath: "yb_icon.png" },
            { label: "rb", value: 48, imgPath: "rb_icon.png" }
        ]
    },
    {
        name: "Мария Иванова",
        image_url: "avatar2.jpg",
        team: "team_beta.jpg",
        lvl: 22,
        k: 20, // Для уровня 22, последний полученный значок - 20
        progress_percent: 60,
        stats: [
            { label: "gb", value: 95, imgPath: "gb_icon.png" },
            { label: "yb", value: 67, imgPath: "yb_icon.png" },
            { label: "rb", value: 36, imgPath: "rb_icon.png" }
        ]
    },
    {
        name: "Иван Петров",
        image_url: "avatar3.jpg",
        team: "team_gamma.jpg",
        lvl: 12,
        k: 10, // Для уровня 12, последний полученный значок - 10
        progress_percent: 90,
        stats: [
            { label: "gb", value: 80, imgPath: "gb_icon.png" },
            { label: "yb", value: 45, imgPath: "yb_icon.png" },
            { label: "rb", value: 25, imgPath: "rb_icon.png" }
        ]
    }
];
