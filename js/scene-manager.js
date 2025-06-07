// 3D场景管理器
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.animationId = null;
        this.objects = [];
        this.particles = [];
        this.currentChapter = 1;

        this.init();
    }

    init() {
        // 检查Three.js是否加载
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }

        // 获取画布
        this.canvas = Utils.$('#game-canvas');
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }

        try {
            // 创建场景
            this.scene = new THREE.Scene();

            // 创建相机
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.z = 5;

            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x0f0619, 1);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // 添加基础光照
            this.setupLighting();

            // 监听窗口大小变化
            window.addEventListener('resize', () => this.onWindowResize());

            // 开始渲染循环
            this.animate();
        } catch (error) {
            console.error('Scene initialization failed:', error);
        }
    }

    setupLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xB186D6, 0.3);
        this.scene.add(ambientLight);

        // 主光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // 紫色点光源
        const pointLight = new THREE.PointLight(0xB186D6, 1, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
    }

    // 创建第一章场景（学校）
    createChapter1Scene() {
        this.clearScene();
        this.currentChapter = 1;

        // 创建教室环境
        this.createClassroom();

        // 添加懒散的氛围效果
        this.createDrowsinessEffect();
    }

    // 创建第二章场景（回家路上）
    createChapter2Scene() {
        this.clearScene();
        this.currentChapter = 2;

        // 创建汽车内部环境
        this.createCarInterior();

        // 添加移动的风景
        this.createMovingLandscape();
    }

    // 创建第三章场景（进入梦境）
    createChapter3Scene() {
        this.clearScene();
        this.currentChapter = 3;

        // 创建星空环境
        this.createStarField();

        // 添加梦境转换效果
        this.createDreamTransition();

        // 创建镜子
        this.createMirror();
    }

    // 创建第四章场景（创造物品）
    createChapter4Scene() {
        this.clearScene();
        this.currentChapter = 4;

        // 继续星空环境
        this.createStarField();

        // 添加创造工作台
        this.createCreationWorkspace();

        // 添加光团效果
        this.createLightOrb();
    }

    // 创建第五章场景（蓝色能量球）
    createChapter5Scene() {
        this.clearScene();
        this.currentChapter = 5;

        // 继续星空环境
        this.createStarField();

        // 创建蓝色能量球
        this.createEnergyOrb();

        // 创建系统面板
        this.createSystemPanels();
    }

    createClassroom() {
        // 创建桌子
        const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
        const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(0, -1, 0);
        this.scene.add(desk);
        this.objects.push(desk);

        // 创建窗户光线
        const windowLight = new THREE.SpotLight(0xffffff, 0.5);
        windowLight.position.set(-5, 2, 5);
        windowLight.target.position.set(0, 0, 0);
        this.scene.add(windowLight);
        this.scene.add(windowLight.target);
    }

    createDrowsinessEffect() {
        // 创建模糊粒子效果
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = Utils.random(-10, 10);
            positions[i + 1] = Utils.random(-5, 5);
            positions[i + 2] = Utils.random(-5, 5);
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xB186D6,
            size: 0.1,
            transparent: true,
            opacity: 0.3
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.objects.push(particleSystem);
    }

    createCarInterior() {
        // 创建座椅
        const seatGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, -0.5, 0);
        this.scene.add(seat);
        this.objects.push(seat);

        // 创建车窗框架
        const windowGeometry = new THREE.PlaneGeometry(3, 2);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.3
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-2, 0, 0);
        window.rotation.y = Math.PI / 2;
        this.scene.add(window);
        this.objects.push(window);
    }

    createMovingLandscape() {
        // 创建移动的风景元素
        for (let i = 0; i < 10; i++) {
            const treeGeometry = new THREE.ConeGeometry(0.2, 1, 8);
            const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);

            tree.position.set(
                Utils.random(-20, 20),
                Utils.random(-2, 0),
                Utils.random(-10, -5)
            );

            this.scene.add(tree);
            this.objects.push(tree);
        }
    }

    createStarField() {
        // 创建星空背景
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            starPositions[i] = Utils.random(-100, 100);
            starPositions[i + 1] = Utils.random(-100, 100);
            starPositions[i + 2] = Utils.random(-100, -10);
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.objects.push(stars);

        // 添加星空旋转动画
        stars.userData.animate = () => {
            stars.rotation.y += 0.001;
            stars.rotation.x += 0.0005;
        };
    }

    createDreamTransition() {
        // 创建梦境转换的螺旋效果
        const spiralGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
        const spiralMaterial = new THREE.MeshBasicMaterial({
            color: 0xB186D6,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < 5; i++) {
            const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
            spiral.position.z = i * -2;
            spiral.scale.set(1 + i * 0.2, 1 + i * 0.2, 1);
            this.scene.add(spiral);
            this.objects.push(spiral);

            spiral.userData.animate = () => {
                spiral.rotation.z += 0.02 + i * 0.005;
                spiral.material.opacity = 0.6 * Math.sin(Date.now() * 0.001 + i);
            };
        }
    }

    createMirror() {
        // 创建镜子
        const mirrorGeometry = new THREE.PlaneGeometry(2, 3);
        const mirrorMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        mirror.position.set(0, 0, -1);
        this.scene.add(mirror);
        this.objects.push(mirror);

        // 添加镜子边框
        const frameGeometry = new THREE.RingGeometry(1.5, 1.7, 32);
        const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xC0C0C0 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 0, -0.9);
        this.scene.add(frame);
        this.objects.push(frame);
    }

    createCreationWorkspace() {
        // 创建创造工作台
        const workspaceGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
        const workspaceMaterial = new THREE.MeshLambertMaterial({
            color: 0xB186D6,
            transparent: true,
            opacity: 0.3
        });

        const workspace = new THREE.Mesh(workspaceGeometry, workspaceMaterial);
        workspace.position.set(0, -2, 0);
        this.scene.add(workspace);
        this.objects.push(workspace);

        workspace.userData.animate = () => {
            workspace.rotation.y += 0.01;
            workspace.material.opacity = 0.3 + 0.2 * Math.sin(Date.now() * 0.002);
        };
    }

    createLightOrb() {
        // 创建光团
        const orbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const orbMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0, 1, 0);
        this.scene.add(orb);
        this.objects.push(orb);

        // 添加光团动画
        orb.userData.animate = () => {
            orb.position.y = 1 + 0.3 * Math.sin(Date.now() * 0.003);
            orb.material.opacity = 0.8 + 0.2 * Math.sin(Date.now() * 0.005);
            orb.rotation.x += 0.01;
            orb.rotation.y += 0.015;
        };

        // 添加光团粒子效果
        this.createOrbParticles(orb);
    }

    createOrbParticles(orb) {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const radius = Utils.random(0.5, 2);
            const theta = Utils.random(0, Math.PI * 2);
            const phi = Utils.random(0, Math.PI);

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.cos(phi);
            positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        orb.add(particleSystem);

        particleSystem.userData.animate = () => {
            particleSystem.rotation.y += 0.02;
            particleSystem.rotation.x += 0.01;
        };
    }

    createEnergyOrb() {
        // 创建蓝色能量球
        const orbGeometry = new THREE.SphereGeometry(1, 32, 32);
        const orbMaterial = new THREE.MeshBasicMaterial({
            color: 0x0080ff,
            transparent: true,
            opacity: 0.7
        });

        const energyOrb = new THREE.Mesh(orbGeometry, orbMaterial);
        energyOrb.position.set(0, 0, 0);
        this.scene.add(energyOrb);
        this.objects.push(energyOrb);

        // 添加能量球动画
        energyOrb.userData.animate = () => {
            energyOrb.rotation.x += 0.005;
            energyOrb.rotation.y += 0.01;
            energyOrb.scale.setScalar(1 + 0.1 * Math.sin(Date.now() * 0.003));
        };

        // 创建不规则积木组合
        this.createIrregularBlocks(energyOrb);
    }

    createIrregularBlocks(parent) {
        const blockCount = 20;

        for (let i = 0; i < blockCount; i++) {
            const width = Utils.random(0.1, 0.3);
            const height = Utils.random(0.1, 0.4);
            const depth = Utils.random(0.1, 0.3);

            const blockGeometry = new THREE.BoxGeometry(width, height, depth);
            const blockMaterial = new THREE.MeshBasicMaterial({
                color: 0x0080ff,
                transparent: true,
                opacity: 0.5
            });

            const block = new THREE.Mesh(blockGeometry, blockMaterial);

            // 随机位置在球体表面
            const radius = 1.2;
            const theta = Utils.random(0, Math.PI * 2);
            const phi = Utils.random(0, Math.PI);

            block.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );

            block.rotation.set(
                Utils.random(0, Math.PI),
                Utils.random(0, Math.PI),
                Utils.random(0, Math.PI)
            );

            parent.add(block);

            block.userData.animate = () => {
                block.rotation.x += Utils.random(-0.02, 0.02);
                block.rotation.y += Utils.random(-0.02, 0.02);
                block.rotation.z += Utils.random(-0.02, 0.02);
            };
        }
    }

    createSystemPanels() {
        // 创建蓝色系统面板
        const panelGeometry = new THREE.PlaneGeometry(2, 1.5);
        const panelMaterial = new THREE.MeshBasicMaterial({
            color: 0x0080ff,
            transparent: true,
            opacity: 0.4
        });

        for (let i = 0; i < 3; i++) {
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.set(
                (i - 1) * 3,
                Utils.random(-1, 1),
                -2
            );
            panel.rotation.y = (i - 1) * 0.3;

            this.scene.add(panel);
            this.objects.push(panel);

            panel.userData.animate = () => {
                panel.material.opacity = 0.4 + 0.2 * Math.sin(Date.now() * 0.002 + i);
            };
        }
    }

    clearScene() {
        // 清除所有对象
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.objects = [];
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // 更新所有对象的动画
        this.objects.forEach(obj => {
            if (obj.userData.animate) {
                obj.userData.animate();
            }
        });

        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clearScene();
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// 导出场景管理器
window.SceneManager = SceneManager;
