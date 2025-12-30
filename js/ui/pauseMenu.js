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

// 暂停游戏
function pauseGame() {
    isPaused = true;
    currentState = STATE.PAUSED;
    // 显示暂停菜单
    showPauseMenu();
}

// 暂停后继续
function continueGame() {
    // 继续游戏
    isPaused = false;
    currentState = STATE.PLAYING;
    hidePauseMenu();
}

function restartGameFromPause() {
    // 从暂停状态重新开始游戏
    isPaused = false;
    currentState = STATE.PLAYING;
    continueGame();
    startGame();
}

function returnToMainMenuFromPause() {
    // 从暂停状态返回主菜单
    isPaused = false;
    currentState = STATE.MENU;
    hidePauseMenu();
    returnToMenu();
}
