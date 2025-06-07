// 物品创造器
class ItemCreator {
    constructor() {
        this.isActive = false;
        this.isCreating = false;
        this.createdItems = [];
        this.currentCreation = null;
        
        this.itemTemplates = {
            robe: {
                name: '黑袍',
                description: '神秘的黑色长袍，带有兜帽',
                creationTime: 3000,
                materials: ['黑色丝线', '雾气', '幻想能量'],
                effects: ['隐蔽', '神秘感', '魔法防护']
            },
            sleepwear: {
                name: '白色睡衣',
                description: '柔软舒适的白色丝绸睡衣',
                creationTime: 2500,
                materials: ['光团', '丝绸', '舒适感'],
                effects: ['舒适', '优雅', '安眠']
            },
            book: {
                name: '魔法书',
                description: '星空封面的神秘魔法书，带有紫色水晶书签',
                creationTime: 4000,
                materials: ['星空图案', '紫色水晶', '银链', '无尽书页'],
                effects: ['创造', '修改', '分析', '收录', '连接']
            }
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        // 创造按钮
        const createBtns = Utils.$$('.create-btn');
        createBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const itemType = btn.dataset.item;
                this.startCreation(itemType);
            });
        });
    }

    show() {
        const creatorEl = Utils.$('#item-creator');
        if (creatorEl) {
            creatorEl.classList.remove('hidden');
            creatorEl.classList.add('animate-scaleIn');
            this.isActive = true;
            
            // 重置界面状态
            this.resetInterface();
        }
    }

    hide() {
        const creatorEl = Utils.$('#item-creator');
        if (creatorEl) {
            creatorEl.classList.add('animate-scaleOut');
            setTimeout(() => {
                creatorEl.classList.add('hidden');
                creatorEl.classList.remove('animate-scaleOut');
                this.isActive = false;
            }, 500);
        }
    }

    resetInterface() {
        // 显示创造选项，隐藏进度
        const optionsEl = Utils.$('.creation-options');
        const progressEl = Utils.$('.creation-progress');
        
        if (optionsEl) optionsEl.classList.remove('hidden');
        if (progressEl) progressEl.classList.add('hidden');
        
        // 重置按钮状态
        const createBtns = Utils.$$('.create-btn');
        createBtns.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        
        this.isCreating = false;
        this.currentCreation = null;
    }

    startCreation(itemType) {
        if (this.isCreating) return;
        
        const template = this.itemTemplates[itemType];
        if (!template) return;

        this.isCreating = true;
        this.currentCreation = {
            type: itemType,
            template: template,
            startTime: Date.now(),
            progress: 0
        };

        // 切换到创造进度界面
        this.showCreationProgress();
        
        // 开始创造动画
        this.animateCreation();
        
        // 通知场景管理器开始创造效果
        this.notifyCreationStart(itemType);
    }

    showCreationProgress() {
        const optionsEl = Utils.$('.creation-options');
        const progressEl = Utils.$('.creation-progress');
        const progressText = Utils.$('.progress-text');
        
        if (optionsEl) optionsEl.classList.add('hidden');
        if (progressEl) progressEl.classList.remove('hidden');
        
        if (progressText && this.currentCreation) {
            progressText.textContent = `正在创造${this.currentCreation.template.name}...`;
        }
    }

    animateCreation() {
        if (!this.currentCreation) return;

        const { template } = this.currentCreation;
        const duration = template.creationTime;
        const startTime = Date.now();

        // 创造阶段
        const phases = [
            { name: '收集材料', duration: 0.3 },
            { name: '构建形态', duration: 0.4 },
            { name: '注入能量', duration: 0.2 },
            { name: '完成创造', duration: 0.1 }
        ];

        let currentPhase = 0;
        let phaseStartTime = startTime;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 更新当前阶段
            const phaseProgress = (elapsed - (phaseStartTime - startTime)) / (duration * phases[currentPhase].duration);
            
            if (phaseProgress >= 1 && currentPhase < phases.length - 1) {
                currentPhase++;
                phaseStartTime = Date.now();
            }

            // 更新进度文本
            const progressText = Utils.$('.progress-text');
            if (progressText) {
                progressText.textContent = `${phases[currentPhase].name} - ${Math.round(progress * 100)}%`;
            }

            // 更新场景效果
            this.updateCreationEffect(progress, phases[currentPhase].name);

            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                this.completeCreation();
            }
        };

        updateProgress();
    }

    updateCreationEffect(progress, phaseName) {
        // 通知场景管理器更新创造效果
        if (window.game && window.game.sceneManager) {
            window.game.sceneManager.updateCreationEffect(progress, phaseName, this.currentCreation.type);
        }

        // 更新创造动画的视觉效果
        const animationEl = Utils.$('.creation-animation');
        if (animationEl) {
            const hue = progress * 360;
            animationEl.style.borderTopColor = `hsl(${hue}, 70%, 60%)`;
            animationEl.style.transform = `rotate(${progress * 720}deg) scale(${1 + progress * 0.5})`;
        }
    }

    completeCreation() {
        if (!this.currentCreation) return;

        const item = {
            id: Utils.generateUUID(),
            type: this.currentCreation.type,
            template: this.currentCreation.template,
            createdAt: Date.now(),
            quality: this.calculateQuality()
        };

        // 添加到已创造物品列表
        this.createdItems.push(item);

        // 播放完成效果
        this.playCompletionEffect(item);

        // 保存到本地存储
        this.saveCreatedItems();

        // 通知游戏系统
        this.notifyCreationComplete(item);

        // 延迟后隐藏创造器
        setTimeout(() => {
            this.hide();
        }, 2000);
    }

    calculateQuality() {
        // 基于创造时间和随机因素计算品质
        const baseQuality = 0.7;
        const randomFactor = Utils.random(0.1, 0.3);
        const timeFactor = this.currentCreation ? 
            Math.min((Date.now() - this.currentCreation.startTime) / this.currentCreation.template.creationTime, 1) : 1;
        
        return Math.min(baseQuality + randomFactor + timeFactor * 0.2, 1);
    }

    playCompletionEffect(item) {
        // 更新进度文本
        const progressText = Utils.$('.progress-text');
        if (progressText) {
            progressText.innerHTML = `
                <div class="completion-message">
                    <div class="completion-icon">✨</div>
                    <div class="completion-text">${item.template.name} 创造完成！</div>
                    <div class="completion-quality">品质: ${Math.round(item.quality * 100)}%</div>
                </div>
            `;
        }

        // 创建完成粒子效果
        this.createCompletionParticles();

        // 播放成功音效（如果有的话）
        this.playSuccessSound();
    }

    createCompletionParticles() {
        const creatorEl = Utils.$('#item-creator');
        if (!creatorEl) return;

        const rect = creatorEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 创建多个粒子
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.createParticle(centerX, centerY);
            }, i * 50);
        }
    }

    createParticle(x, y) {
        const particle = Utils.createElement('div', 'creation-particle');
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 8px;
            height: 8px;
            background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 0 10px var(--primary-color);
        `;

        document.body.appendChild(particle);

        // 随机运动
        const angle = Utils.random(0, Math.PI * 2);
        const distance = Utils.random(100, 200);
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;

        gsap.to(particle, {
            x: endX - x,
            y: endY - y,
            opacity: 0,
            scale: 0,
            rotation: Utils.random(0, 360),
            duration: Utils.random(1, 2),
            ease: "power2.out",
            onComplete: () => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }
        });
    }

    playSuccessSound() {
        // 这里可以播放成功音效
        // 由于是纯前端项目，可以使用Web Audio API或预加载的音频文件
    }

    notifyCreationStart(itemType) {
        const event = new CustomEvent('creationStarted', {
            detail: { itemType, template: this.itemTemplates[itemType] }
        });
        document.dispatchEvent(event);
    }

    notifyCreationComplete(item) {
        const event = new CustomEvent('creationCompleted', {
            detail: { item }
        });
        document.dispatchEvent(event);
    }

    saveCreatedItems() {
        Utils.saveToStorage('created-items', this.createdItems);
    }

    loadCreatedItems() {
        const saved = Utils.loadFromStorage('created-items', []);
        this.createdItems = saved;
    }

    getCreatedItems() {
        return this.createdItems;
    }

    getItemByType(type) {
        return this.createdItems.filter(item => item.type === type);
    }

    hasCreatedItem(type) {
        return this.createdItems.some(item => item.type === type);
    }

    // 获取创造统计
    getCreationStats() {
        const stats = {
            totalItems: this.createdItems.length,
            averageQuality: 0,
            itemTypes: {}
        };

        if (this.createdItems.length > 0) {
            stats.averageQuality = this.createdItems.reduce((sum, item) => sum + item.quality, 0) / this.createdItems.length;
            
            this.createdItems.forEach(item => {
                stats.itemTypes[item.type] = (stats.itemTypes[item.type] || 0) + 1;
            });
        }

        return stats;
    }

    // 重置所有创造的物品
    resetCreatedItems() {
        this.createdItems = [];
        this.saveCreatedItems();
    }

    // 检查是否处于活动状态
    isCreatorActive() {
        return this.isActive;
    }

    // 检查是否正在创造
    isCurrentlyCreating() {
        return this.isCreating;
    }

    // 销毁创造器
    destroy() {
        this.hide();
        if (this.isCreating) {
            this.isCreating = false;
            this.currentCreation = null;
        }
    }
}

// 导出物品创造器
window.ItemCreator = ItemCreator;
