// 角色创造器
class CharacterCreator {
    constructor() {
        this.isActive = false;
        this.character = {
            height: 135,
            hairColor: 'silver',
            hairstyle: 'twin-tails',
            bodyType: 'loli',
            clothing: 'none'
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        // 身高滑块
        const heightSlider = Utils.$('#height-slider');
        const heightValue = Utils.$('#height-value');
        
        if (heightSlider && heightValue) {
            heightSlider.addEventListener('input', (e) => {
                this.character.height = parseInt(e.target.value);
                heightValue.textContent = `${this.character.height}cm`;
                this.updateCharacterPreview();
            });
        }

        // 头发颜色选择
        const colorOptions = Utils.$$('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 移除其他选中状态
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                // 添加选中状态
                option.classList.add('selected');
                
                this.character.hairColor = option.dataset.color;
                this.updateCharacterPreview();
            });
        });

        // 发型选择
        const hairstyleSelect = Utils.$('#hairstyle-select');
        if (hairstyleSelect) {
            hairstyleSelect.addEventListener('change', (e) => {
                this.character.hairstyle = e.target.value;
                this.updateCharacterPreview();
            });
        }

        // 应用修改按钮
        const applyBtn = Utils.$('.apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyCharacterChanges();
            });
        }
    }

    show() {
        const creatorEl = Utils.$('#character-creator');
        if (creatorEl) {
            creatorEl.classList.remove('hidden');
            creatorEl.classList.add('animate-scaleIn');
            this.isActive = true;
            
            // 初始化默认值
            this.resetToDefaults();
            this.updateCharacterPreview();
        }
    }

    hide() {
        const creatorEl = Utils.$('#character-creator');
        if (creatorEl) {
            creatorEl.classList.add('animate-scaleOut');
            setTimeout(() => {
                creatorEl.classList.add('hidden');
                creatorEl.classList.remove('animate-scaleOut');
                this.isActive = false;
            }, 500);
        }
    }

    resetToDefaults() {
        // 重置身高滑块
        const heightSlider = Utils.$('#height-slider');
        const heightValue = Utils.$('#height-value');
        if (heightSlider && heightValue) {
            heightSlider.value = this.character.height;
            heightValue.textContent = `${this.character.height}cm`;
        }

        // 重置头发颜色
        const colorOptions = Utils.$$('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === this.character.hairColor) {
                option.classList.add('selected');
            }
        });

        // 重置发型
        const hairstyleSelect = Utils.$('#hairstyle-select');
        if (hairstyleSelect) {
            hairstyleSelect.value = this.character.hairstyle;
        }
    }

    updateCharacterPreview() {
        // 这里可以更新3D场景中的角色预览
        // 发送事件给场景管理器
        if (window.game && window.game.sceneManager) {
            window.game.sceneManager.updateCharacterAppearance(this.character);
        }

        // 添加视觉反馈
        this.showPreviewEffect();
    }

    showPreviewEffect() {
        // 创建预览效果动画
        const creatorEl = Utils.$('#character-creator');
        if (creatorEl) {
            creatorEl.style.boxShadow = '0 0 30px var(--primary-color)';
            setTimeout(() => {
                creatorEl.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
            }, 200);
        }
    }

    applyCharacterChanges() {
        // 播放应用动画
        const applyBtn = Utils.$('.apply-btn');
        if (applyBtn) {
            applyBtn.textContent = '应用中...';
            applyBtn.disabled = true;
            
            // 创建应用效果
            this.createApplyEffect();
            
            setTimeout(() => {
                applyBtn.textContent = '应用修改';
                applyBtn.disabled = false;
                
                // 通知游戏系统角色已更新
                this.notifyCharacterUpdate();
                
                // 隐藏创造器
                this.hide();
            }, 2000);
        }
    }

    createApplyEffect() {
        // 创建粒子爆发效果
        const creatorEl = Utils.$('#character-creator');
        if (!creatorEl) return;

        const rect = creatorEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 20; i++) {
            this.createParticle(centerX, centerY);
        }
    }

    createParticle(x, y) {
        const particle = Utils.createElement('div', 'character-particle');
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;

        document.body.appendChild(particle);

        // 随机方向和距离
        const angle = Utils.random(0, Math.PI * 2);
        const distance = Utils.random(50, 150);
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;

        // 动画
        gsap.to(particle, {
            x: endX - x,
            y: endY - y,
            opacity: 0,
            scale: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                document.body.removeChild(particle);
            }
        });
    }

    notifyCharacterUpdate() {
        // 发送自定义事件
        const event = new CustomEvent('characterUpdated', {
            detail: { character: this.character }
        });
        document.dispatchEvent(event);

        // 保存角色设置到本地存储
        Utils.saveToStorage('character-settings', this.character);

        // 显示成功提示
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        // 创建成功提示
        const message = Utils.createElement('div', 'success-message');
        message.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✨</div>
                <div class="success-text">角色外观已更新！</div>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--glass-bg);
            backdrop-filter: blur(15px);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            padding: 20px 30px;
            color: var(--text-light);
            z-index: 9999;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(message);

        // 动画显示
        gsap.fromTo(message, 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.3,
                ease: "back.out(1.7)"
            }
        );

        // 自动消失
        setTimeout(() => {
            gsap.to(message, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                onComplete: () => {
                    document.body.removeChild(message);
                }
            });
        }, 2000);
    }

    // 获取角色描述文本
    getCharacterDescription() {
        const descriptions = {
            height: {
                100: '娇小可爱',
                120: '小巧玲珑',
                135: '萝莉体型',
                150: '苗条身材',
                165: '标准身高',
                180: '高挑身材'
            },
            hairColor: {
                silver: '银白色',
                white: '纯白色',
                gray: '灰色'
            },
            hairstyle: {
                'twin-tails': '双马尾',
                'ponytail': '马尾',
                'long': '长发'
            }
        };

        const heightDesc = descriptions.height[this.character.height] || '特殊身高';
        const hairColorDesc = descriptions.hairColor[this.character.hairColor] || '特殊颜色';
        const hairstyleDesc = descriptions.hairstyle[this.character.hairstyle] || '特殊发型';

        return `${heightDesc}的身材，${hairColorDesc}的${hairstyleDesc}`;
    }

    // 加载保存的角色设置
    loadSavedCharacter() {
        const saved = Utils.loadFromStorage('character-settings');
        if (saved) {
            this.character = { ...this.character, ...saved };
        }
    }

    // 导出角色数据
    exportCharacter() {
        return {
            ...this.character,
            description: this.getCharacterDescription(),
            timestamp: Date.now()
        };
    }

    // 导入角色数据
    importCharacter(data) {
        if (data && typeof data === 'object') {
            this.character = { ...this.character, ...data };
            this.resetToDefaults();
            this.updateCharacterPreview();
        }
    }

    // 随机生成角色
    randomizeCharacter() {
        const heights = [100, 120, 135, 150, 165, 180];
        const colors = ['silver', 'white', 'gray'];
        const styles = ['twin-tails', 'ponytail', 'long'];

        this.character.height = Utils.randomChoice(heights);
        this.character.hairColor = Utils.randomChoice(colors);
        this.character.hairstyle = Utils.randomChoice(styles);

        this.resetToDefaults();
        this.updateCharacterPreview();
    }

    // 检查是否处于活动状态
    isCreatorActive() {
        return this.isActive;
    }

    // 销毁创造器
    destroy() {
        this.hide();
        // 清理事件监听器等
    }
}

// 导出角色创造器
window.CharacterCreator = CharacterCreator;
