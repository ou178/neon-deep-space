// 游戏状态枚举
const STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAMEOVER: 'gameover',
    PAUSED: 'paused'
};

// 游戏状态和全局变量
let currentState = STATE.MENU;
let score = 0;
let highScore = localStorage.getItem('neon_wars_high_score') ? parseInt(localStorage.getItem('neon_wars_high_score')) : 0;
let currentEnergy = localStorage.getItem('neon_wars_energy') ? parseInt(localStorage.getItem('neon_wars_energy')) : 0;
let playerUpgrades = {};

// 添加暂停状态控制
let isPaused = false;

// 安全解析localStorage中的升级数据
try {
    const savedUpgrades = localStorage.getItem('neon_wars_upgrades');
    if (savedUpgrades) {
        playerUpgrades = JSON.parse(savedUpgrades);
    }
} catch (error) {
    console.error('Error parsing player upgrades from localStorage:', error);
    playerUpgrades = {};
}

// 游戏对象数组
let stars = [];
let bullets = [];
let enemies = [];
let enemyBullets = [];
let asteroids = [];
let particles = [];
let powerUps = [];
let boss = null;
let player = null;

// 游戏计时器和计数器
let freezeTimer = 0;
let enemySpawnTimer = 0;
let asteroidSpawnTimer = 0;
let powerUpSpawnTimer = 0;

// 游戏难度和里程碑
let currentMilestoneIndex = 0;
let bossMilestones = [500, 1000, 3000, 5000, 15000, 30000, 50000, 70000, 100000, 150000];
let difficultyFactor = 1;
let globalDifficultyMultiplier = 1;

// 全局升级加成
let globalDamageMult = 1;
let globalEnemySpeedMult = 1;
let globalRecoilMult = 1;
let globalFreezeDurationBonus = 0;
let globalOrbitRadiusAdd = 0;
let globalOrbitSpeedMult = 1;
let satelliteDamage = 2;

// 屏幕抖动效果
let shakeDuration = 0;
let shakeMagnitude = 0;

// 游戏元素引用
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const highScoreDisplay = document.getElementById('high-score-display');
const energyDisplay = document.getElementById('energy-display');
const shopScreen = document.getElementById('shop-screen');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const shopGrid = document.getElementById('shop-grid');
const shopEnergy = document.getElementById('shop-energy');
const finalScoreEl = document.getElementById('final-score');
const energyGainedEl = document.getElementById('energy-gained');
const hud = document.getElementById('hud');
const healthEl = document.getElementById('health');
const shieldEl = document.getElementById('shield-count');
const weaponEl = document.getElementById('weapon-level');
const speedEl = document.getElementById('speed-level');
const bombEl = document.getElementById('bomb-count');
const orbiterEl = document.getElementById('orbiter-count');
const dashText = document.getElementById('dash-text');
const dashBar = document.getElementById('dash-bar');
const weaponModeDisplay = document.getElementById('weapon-mode-display');
const muteBtn = document.getElementById('mute-btn');
const scoreEl = document.getElementById('score');

// 输入控制
const mouse = { x: 0, y: 0 };
const keys = { w: false, a: false, s: false, d: false, shift: false };
const mouseBtn = { left: false };

// 切换暂停状态函数
function togglePause() {
    if (currentState === STATE.PLAYING) {
        currentState = STATE.PAUSED;
        isPaused = true;
        // 显示暂停菜单
        showPauseMenu();
    } else if (currentState === STATE.PAUSED) {
        currentState = STATE.PLAYING;
        isPaused = false;
        // 隐藏暂停菜单
        hidePauseMenu();
    }
}

// 暂停菜单显示和隐藏函数
function showPauseMenu() {
    // 获取暂停菜单元素
    const pauseMenu = document.getElementById('pause-menu');
    // 更新暂停时的分数显示
    const pauseScoreEl = document.getElementById('pause-score');
    pauseScoreEl.textContent = score;
    // 显示暂停菜单
    pauseMenu.classList.remove('hidden');
    // 隐藏HUD
    hud.style.display = 'none';
}

function hidePauseMenu() {
    // 隐藏暂停菜单
    const pauseMenu = document.getElementById('pause-menu');
    pauseMenu.classList.add('hidden');
    // 显示HUD
    hud.style.display = 'flex';
}

// 重置存档逻辑
function resetSave() {
    if (confirm("确定要重置存档吗？\n这将清除所有能量、升级和历史最高分！")) {
        localStorage.removeItem('neon_wars_energy');
        localStorage.removeItem('neon_wars_upgrades');
        localStorage.removeItem('neon_wars_high_score');
        location.reload();
    }
}

// 商店逻辑
function renderShop() {
    shopGrid.innerHTML = '';
    UPGRADE_DEFS.forEach(def => {
        const level = playerUpgrades[def.id] || 0;
        const cost = def.baseCost * (level + 1);
        const isMaxed = level >= def.max;
        const canAfford = currentEnergy >= cost;

        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div class="shop-item-top">
                <span class="shop-item-title">${def.name}</span>
                <span class="shop-item-level">LV.${level} / ${def.max}</span>
            </div>
            <div class="shop-item-desc">${def.desc}</div>
            <button class="shop-item-btn" ${isMaxed ? 'disabled' : ''}>
                ${isMaxed ? 'MAXED' : `购买 (${cost} 能量)`}
            </button>
        `;

        const btn = item.querySelector('button');
        if (!isMaxed) {
            if (!canAfford) btn.disabled = true;
            btn.onclick = () => buyUpgrade(def.id, cost);
        }

        shopGrid.appendChild(item);
    });
    shopEnergy.innerText = currentEnergy.toLocaleString();
    energyDisplay.innerText = currentEnergy.toLocaleString();
}

function buyUpgrade(id, cost) {
    if (currentEnergy >= cost) {
        currentEnergy -= cost;
        playerUpgrades[id]++;
        saveGameData();
        renderShop();
    }
}

function saveGameData() {
    localStorage.setItem('neon_wars_energy', currentEnergy);
    localStorage.setItem('neon_wars_upgrades', JSON.stringify(playerUpgrades));
    localStorage.setItem('neon_wars_high_score', highScore);
}

// 暂停菜单按钮功能
function continueGame() {
    // 继续游戏
    isPaused = false;
    currentState = STATE.PLAYING;
    hidePauseMenu();
}

function restartGameFromPause() {
    // 从暂停状态重新开始游戏
    continueGame();
    startGame();
}

function returnToMainMenuFromPause() {
    // 从暂停状态返回主菜单
    isPaused = false;
    hidePauseMenu();
    returnToMenu();
}

function init() {
    resizeCanvas();
    stars = [];
    for (let i = 0; i < 100; i++) stars.push(new Star());
    highScoreDisplay.innerText = highScore.toLocaleString();
    energyDisplay.innerText = currentEnergy.toLocaleString();
    renderShop(); 

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', (e) => {
        if(e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
        if (e.key === 'Shift') {
            keys.shift = true;
            if (currentState === STATE.PLAYING) player.dash();
        }
        if (e.key.toLowerCase() === 'f' && currentState === STATE.PLAYING) {
            player.switchWeapon();
        }
        if (e.code === 'Space' && currentState === STATE.PLAYING) player.useBomb();
        // ESC键暂停功能
        if (e.key === 'Escape' && currentState === STATE.PLAYING) {
            togglePause();
        } else if (e.key === 'Escape' && currentState === STATE.PAUSED) {
            continueGame();
        }
    });
    window.addEventListener('keyup', (e) => { 
        if(e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; 
        if (e.key === 'Shift') keys.shift = false;
    });
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    window.addEventListener('mousedown', () => mouseBtn.left = true);
    window.addEventListener('mouseup', () => mouseBtn.left = false);

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('open-shop-btn').addEventListener('click', () => {
        renderShop();
        startScreen.classList.add('hidden');
        shopScreen.classList.remove('hidden');
    });
    document.getElementById('close-shop-btn').addEventListener('click', () => {
        shopScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });
    document.getElementById('return-menu-btn').addEventListener('click', returnToMenu); 
    muteBtn.addEventListener('click', () => AudioSys.toggleMute());

    // 绑定重置按钮
    document.getElementById('reset-save-btn').addEventListener('click', resetSave);
    
    // 绑定暂停菜单按钮
    document.getElementById('resume-btn').addEventListener('click', continueGame);
    document.getElementById('restart-pause-btn').addEventListener('click', restartGameFromPause);
    document.getElementById('return-menu-pause-btn').addEventListener('click', returnToMainMenuFromPause);

    requestAnimationFrame(gameLoop);
}

function resizeCanvas() { 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function returnToMenu() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    currentState = STATE.MENU;
    highScoreDisplay.innerText = highScore.toLocaleString();
    energyDisplay.innerText = currentEnergy.toLocaleString();
}

function startGame() {
    globalDamageMult = 1 + ((playerUpgrades.damage || 0) * 0.1);
    globalEnemySpeedMult = 1 - Math.min(0.5, ((playerUpgrades.enemySlow || 0) * 0.1)); 
    globalRecoilMult = 1 - Math.min(0.8, ((playerUpgrades.recoil || 0) * 0.2)); 
    globalFreezeDurationBonus = (playerUpgrades.freezeDuration || 0) * 60; 
    globalOrbitRadiusAdd = (playerUpgrades.satRadius || 0) * 10;
    globalOrbitSpeedMult = 1 + ((playerUpgrades.satRadius || 0) * 0.15);

    AudioSys.init();
    AudioSys.startBGM();
    score = 0;
    bullets = [];
    enemies = [];
    enemyBullets = [];
    asteroids = [];
    particles = [];
    powerUps = [];
    boss = null;
    scoreEl.innerText = score;
    healthEl.innerText = 100;
    shieldEl.innerText = 0;
    weaponEl.innerText = "LV.1";
    bombEl.innerText = 1;
    speedEl.innerText = "LV.1";
    orbiterEl.innerText = "0";
    
    player = new Player();
    
    // 确保所有升级值都有默认值，避免NaN计算
    player.health = 100 + ((playerUpgrades.health || 0) * 20);
    player.maxHealth = player.health; 
    player.bombs = 1 + (playerUpgrades.bomb || 0);
    player.maxBombs = 3 + (playerUpgrades.bomb || 0); 
    player.dashCooldownTime = 10000 - ((playerUpgrades.dashCD || 0) * 1000);
    if (player.dashCooldownTime < 2000) player.dashCooldownTime = 2000; 

    player.maxSatellites = 6 + (playerUpgrades.satellite || 0); 

    // --- 初始化卫星 ---
    const satelliteCount = playerUpgrades.satellite || 0;
    for(let i = 0; i < satelliteCount; i++) {
        // 传入索引 i 和 总数 satelliteCount
        player.orbiters.push(new Orbiter(i, satelliteCount));
    }

    currentState = STATE.PLAYING;
    freezeTimer = 0;
    difficultyFactor = 0.5;
    currentMilestoneIndex = 0; globalDifficultyMultiplier = 1;
    startScreen.classList.add('hidden');
    shopScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.style.display = 'flex';
    player.updateWeaponUI();
    updateHUD();
}

// 游戏开始时初始化
document.addEventListener('DOMContentLoaded', init);
