// 主游戏类
class Game {
    constructor() {
        this.isInitialized = false;
        this.currentState = 'loading';
        this.sceneManager = null;
        this.storyManager = null;
        this.characterCreator = null;
        this.itemCreator = null;
        this.settings = {
            sfxVolume: 70,
            bgmVolume: 50,
            textSpeed: 'normal',
            themeMode: 'dark'
        };

        this.init();
    }

    async init() {
        try {
            // 显示加载屏幕
            this.showLoadingScreen();

            // 加载设置
            this.loadSettings();

            // 初始化管理器
            await this.initializeManagers();

            // 设置事件监听器
            this.setupEventListeners();

            // 减少加载时间用于测试
            await Utils.delay(1000);

            // 隐藏加载屏幕，显示主菜单
            this.hideLoadingScreen();
            this.showMainMenu();

            this.isInitialized = true;
            this.currentState = 'menu';

            console.log('游戏初始化完成');
        } catch (error) {
            console.error('游戏初始化失败:', error);
        }
    }

    showLoadingScreen() {
        const loadingScreen = Utils.$('#loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = Utils.$('#loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('animate-fadeOut');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.classList.remove('animate-fadeOut');
            }, 600);
        }
    }

    showMainMenu() {
        const mainMenu = Utils.$('#main-menu');
        if (mainMenu) {
            mainMenu.classList.remove('hidden');
            mainMenu.classList.add('animate-fadeIn');
        }
    }

    hideMainMenu() {
        const mainMenu = Utils.$('#main-menu');
        if (mainMenu) {
            mainMenu.classList.add('animate-fadeOut');
            setTimeout(() => {
                mainMenu.classList.add('hidden');
                mainMenu.classList.remove('animate-fadeOut');
            }, 600);
        }
    }

    async initializeManagers() {
        // 初始化场景管理器
        this.sceneManager = new SceneManager();

        // 初始化故事管理器
        this.storyManager = new StoryManager();

        // 初始化角色创造器
        this.characterCreator = new CharacterCreator();
        this.characterCreator.loadSavedCharacter();

        // 初始化物品创造器
        this.itemCreator = new ItemCreator();
        this.itemCreator.loadCreatedItems();
    }

    setupEventListeners() {
        // 主菜单按钮
        const startBtn = Utils.$('.start-btn');
        const chapterBtn = Utils.$('.chapter-btn');
        const settingsBtn = Utils.$('.settings-btn');
        const aboutBtn = Utils.$('.about-btn');

        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (chapterBtn) chapterBtn.addEventListener('click', () => this.showChapterSelect());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettings());
        if (aboutBtn) aboutBtn.addEventListener('click', () => this.showAbout());

        // 章节选择
        const chapterCards = Utils.$$('.chapter-card');
        chapterCards.forEach(card => {
            card.addEventListener('click', () => {
                const chapter = parseInt(card.dataset.chapter);
                this.startChapter(chapter);
            });
        });

        const backBtn = Utils.$('.back-btn');
        if (backBtn) backBtn.addEventListener('click', () => this.showMainMenu());

        // 游戏控制
        const menuToggle = Utils.$('.menu-toggle');
        if (menuToggle) menuToggle.addEventListener('click', () => this.toggleGameMenu());

        // 设置面板
        const closeSettings = Utils.$('.close-settings');
        if (closeSettings) closeSettings.addEventListener('click', () => this.hideSettings());

        // 设置控件
        this.setupSettingsControls();

        // 自定义事件监听
        document.addEventListener('characterUpdated', (e) => this.onCharacterUpdated(e));
        document.addEventListener('creationCompleted', (e) => this.onCreationCompleted(e));

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupSettingsControls() {
        const sfxVolume = Utils.$('#sfx-volume');
        const bgmVolume = Utils.$('#bgm-volume');
        const textSpeed = Utils.$('#text-speed');
        const themeMode = Utils.$('#theme-mode');

        if (sfxVolume) {
            sfxVolume.value = this.settings.sfxVolume;
            sfxVolume.addEventListener('input', (e) => {
                this.settings.sfxVolume = parseInt(e.target.value);
                this.saveSettings();
            });
        }

        if (bgmVolume) {
            bgmVolume.value = this.settings.bgmVolume;
            bgmVolume.addEventListener('input', (e) => {
                this.settings.bgmVolume = parseInt(e.target.value);
                this.saveSettings();
            });
        }

        if (textSpeed) {
            textSpeed.value = this.settings.textSpeed;
            textSpeed.addEventListener('change', (e) => {
                this.settings.textSpeed = e.target.value;
                if (this.storyManager) {
                    this.storyManager.setTextSpeed(this.settings.textSpeed);
                }
                this.saveSettings();
            });
        }

        if (themeMode) {
            themeMode.value = this.settings.themeMode;
            themeMode.addEventListener('change', (e) => {
                this.settings.themeMode = e.target.value;
                this.applyTheme(this.settings.themeMode);
                this.saveSettings();
            });
        }
    }

    startGame() {
        this.startChapter(1);
    }

    startChapter(chapterNumber) {
        this.hideMainMenu();
        this.hideChapterSelect();

        // 显示游戏界面
        const gameContainer = Utils.$('#game-container');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            gameContainer.classList.add('animate-fadeIn');
        }

        // 加载章节场景
        if (this.sceneManager) {
            switch (chapterNumber) {
                case 1:
                    this.sceneManager.createChapter1Scene();
                    break;
                case 2:
                    this.sceneManager.createChapter2Scene();
                    break;
                case 3:
                    this.sceneManager.createChapter3Scene();
                    break;
                case 4:
                    this.sceneManager.createChapter4Scene();
                    break;
                case 5:
                    this.sceneManager.createChapter5Scene();
                    break;
            }
        }

        // 加载章节故事
        if (this.storyManager) {
            this.storyManager.loadChapter(chapterNumber);
        }

        // 根据章节显示特殊功能
        this.setupChapterFeatures(chapterNumber);

        this.currentState = 'playing';
    }

    setupChapterFeatures(chapterNumber) {
        // 第三章：显示角色创造器
        if (chapterNumber === 3) {
            setTimeout(() => {
                this.showInteractionHint('点击创建镜子并修改角色外观');
                setTimeout(() => {
                    this.characterCreator.show();
                }, 2000);
            }, 5000);
        }

        // 第四章：显示物品创造器
        if (chapterNumber === 4) {
            setTimeout(() => {
                this.showInteractionHint('点击创造神奇的物品');
                setTimeout(() => {
                    this.itemCreator.show();
                }, 2000);
            }, 3000);
        }
    }

    showInteractionHint(text) {
        const hintEl = Utils.$('#interaction-hint');
        const hintText = Utils.$('.hint-text');

        if (hintEl && hintText) {
            hintText.textContent = text;
            hintEl.classList.remove('hidden');
            hintEl.classList.add('animate-fadeIn');

            setTimeout(() => {
                hintEl.classList.add('animate-fadeOut');
                setTimeout(() => {
                    hintEl.classList.add('hidden');
                    hintEl.classList.remove('animate-fadeOut');
                }, 600);
            }, 3000);
        }
    }

    showChapterSelect() {
        this.hideMainMenu();
        const chapterSelect = Utils.$('#chapter-select');
        if (chapterSelect) {
            chapterSelect.classList.remove('hidden');
            chapterSelect.classList.add('animate-fadeIn');
        }
    }

    hideChapterSelect() {
        const chapterSelect = Utils.$('#chapter-select');
        if (chapterSelect) {
            chapterSelect.classList.add('animate-fadeOut');
            setTimeout(() => {
                chapterSelect.classList.add('hidden');
                chapterSelect.classList.remove('animate-fadeOut');
            }, 600);
        }
    }

    showSettings() {
        const settingsPanel = Utils.$('#settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.remove('hidden');
            settingsPanel.classList.add('animate-fadeIn');
        }
    }

    hideSettings() {
        const settingsPanel = Utils.$('#settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.add('animate-fadeOut');
            setTimeout(() => {
                settingsPanel.classList.add('hidden');
                settingsPanel.classList.remove('animate-fadeOut');
            }, 600);
        }
    }

    showAbout() {
        alert('第一卷 进入幻想 - 网页动画游戏\n\n基于原创故事制作的交互式体验\n\n版本: 1.0.0');
    }

    toggleGameMenu() {
        // 这里可以实现游戏内菜单
        console.log('游戏菜单切换');
    }

    onCharacterUpdated(event) {
        console.log('角色已更新:', event.detail.character);
        // 可以在这里添加额外的角色更新逻辑
    }

    onCreationCompleted(event) {
        console.log('物品创造完成:', event.detail.item);
        // 可以在这里添加物品创造完成的逻辑
    }

    handleKeyboard(event) {
        switch (event.key) {
            case 'Escape':
                if (this.currentState === 'playing') {
                    this.toggleGameMenu();
                }
                break;
            case 'F11':
                event.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    applyTheme(theme) {
        document.body.className = theme === 'light' ? 'light-theme' : '';
    }

    loadSettings() {
        const saved = Utils.loadFromStorage('game-settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
        this.applyTheme(this.settings.themeMode);
    }

    saveSettings() {
        Utils.saveToStorage('game-settings', this.settings);
    }

    // 获取游戏状态
    getGameState() {
        return {
            currentState: this.currentState,
            currentChapter: this.storyManager ? this.storyManager.currentChapter : 1,
            settings: this.settings,
            character: this.characterCreator ? this.characterCreator.character : null,
            createdItems: this.itemCreator ? this.itemCreator.getCreatedItems() : []
        };
    }

    // 保存游戏进度
    saveProgress() {
        const gameState = this.getGameState();
        Utils.saveToStorage('game-progress', gameState);
    }

    // 加载游戏进度
    loadProgress() {
        const saved = Utils.loadFromStorage('game-progress');
        if (saved) {
            // 恢复游戏状态
            if (saved.currentChapter && this.storyManager) {
                this.startChapter(saved.currentChapter);
            }
        }
    }

    // 重置游戏
    resetGame() {
        if (confirm('确定要重置游戏吗？这将清除所有进度和设置。')) {
            Utils.removeFromStorage('game-progress');
            Utils.removeFromStorage('game-settings');
            Utils.removeFromStorage('character-settings');
            Utils.removeFromStorage('created-items');

            // 重新加载页面
            window.location.reload();
        }
    }

    // 销毁游戏
    destroy() {
        if (this.sceneManager) this.sceneManager.destroy();
        if (this.storyManager) this.storyManager.destroy();
        if (this.characterCreator) this.characterCreator.destroy();
        if (this.itemCreator) this.itemCreator.destroy();
    }
}

// 当页面加载完成时启动游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

// 导出游戏类
window.Game = Game;
