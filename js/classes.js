class Particle {
    constructor(x, y, color, velocity) {
        this.x = x; this.y = y; this.color = color; this.velocity = velocity;
        this.alpha = 1; this.friction = 0.96; this.life = Math.random() * 0.03 + 0.02; this.size = Math.random() * 3 + 1;
    }
    update() { this.velocity.x *= this.friction; this.velocity.y *= this.friction; this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= this.life; }
    draw() {
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
}

class Star {
    constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 1.5; this.speed = Math.random() * 0.5 + 0.1; this.opacity = Math.random(); }
    update() { this.x -= this.speed; if (this.x < 0) { this.x = canvas.width; this.y = Math.random() * canvas.height; } }
    draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x; this.y = y; this.type = type; this.radius = 12; this.angle = 0; this.pulse = 0;
    }
    update() { this.angle += 0.05; this.pulse += 0.1; this.y += 0.5; }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        const scale = 1 + Math.sin(this.pulse) * 0.1; ctx.scale(scale, scale); ctx.rotate(this.angle);
        if (this.type === 'health') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#0f0'; ctx.strokeStyle = '#0f0'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(10, 0); ctx.lineTo(0, 12); ctx.lineTo(-10, 0); ctx.closePath(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke();
        } else if (this.type === 'weapon') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#fa0'; ctx.strokeStyle = '#fa0'; ctx.fillStyle = 'rgba(255, 170, 0, 0.2)'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (this.type === 'freeze') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#0ff'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.beginPath(); for(let i=0; i<6; i++){ ctx.lineTo(Math.cos(i*Math.PI/3)*10, Math.sin(i*Math.PI/3)*10); ctx.lineTo(0,0); } ctx.stroke();
        } else if (this.type === 'bomb') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#f00'; ctx.strokeStyle = '#f00'; ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke();
        } else if (this.type === 'orbiter') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.strokeStyle = '#fff'; ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, -4, 2, 0, Math.PI*2); ctx.fill();
        } else if (this.type === 'speed') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#f0f'; ctx.strokeStyle = '#f0f'; ctx.fillStyle = 'rgba(255, 0, 255, 0.2)'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(6, 0); ctx.lineTo(-2, 0); ctx.lineTo(2, 10); ctx.lineTo(-4, 0); ctx.lineTo(0, 0); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
    }
}

// --- 卫星类 ---
class Orbiter {
    constructor(index, total) {
        // 计算角度：(当前索引 / 总数) * 360度
        // 这样可以确保卫星均匀分布在圆周上
        this.angle = total > 0 ? (index / total) * Math.PI * 2 : 0;
        
        this.distance = 35 + globalOrbitRadiusAdd;
        this.speed = 0.08 * globalOrbitSpeedMult;
        this.radius = 5;
    }
    update(player) {
        this.angle += this.speed;
        this.x = player.x + Math.cos(this.angle) * this.distance;
        this.y = player.y + Math.sin(this.angle) * this.distance;
    }
    draw() {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.arc(player.x, player.y, this.distance, this.angle - 0.5, this.angle + 0.5);
        ctx.stroke();
        ctx.restore();
    }
}

class Asteroid {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.radius = Math.random() * 30 + 20;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.2;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.maxHp = Math.floor(this.radius / 8) * 1000; 
        this.hp = this.maxHp;
        this.score = 1;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        this.vertices = [];
        const numVerts = 8;
        for(let i=0; i<numVerts; i++) {
            const theta = (Math.PI * 2 / numVerts) * i;
            const r = this.radius * (0.8 + Math.random() * 0.4);
            this.vertices.push({
                x: Math.cos(theta) * r,
                y: Math.sin(theta) * r
            });
        }
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#444';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000';
        ctx.beginPath();
        this.vertices.forEach((v, i) => {
            if (i === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (this.hp < this.maxHp) {
            ctx.rotate(-this.rotation);
            ctx.fillStyle = '#555';
            ctx.fillRect(-this.radius, this.radius + 5, this.radius * 2, 3);
            ctx.fillStyle = '#fff';
            ctx.fillRect(-this.radius, this.radius + 5, this.radius * 2 * (this.hp / this.maxHp), 3);
        }
        ctx.restore();
    }
    takeDamage(amount) {
        this.hp -= amount;
        createExplosion(this.x, this.y, '#888', 1);
        return this.hp <= 0;
    }
}

class Bullet {
    constructor(x, y, velocity, radius, damage, pierce, life, color) { 
        this.x = x; this.y = y; this.velocity = velocity; 
        this.radius = radius || 3; this.color = color;
        this.damage = damage;
        this.pierce = pierce || 1; 
        this.life = life !== undefined ? life : Infinity;
        this.maxLife = life !== undefined ? life : Infinity;
    }
    update() { 
        this.x += this.velocity.x; this.y += this.velocity.y;
        if (this.life !== Infinity) this.life--;
    }
    draw() {
        ctx.save();
        let alpha = 1;
        if (this.life !== Infinity) alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.fillStyle = this.color;
        if (this.pierce > 3) {
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
            ctx.fillRect(-20, -this.radius, 40, this.radius * 2);
        } else {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

class EnemyBullet {
    constructor(x, y, velocity) { this.x = x; this.y = y; this.velocity = velocity; this.radius = 4; this.color = '#f05'; }
    update() { this.x += this.velocity.x; this.y += this.velocity.y; }
    draw() {
        ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = this.color; ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y); ctx.rotate(Date.now() / 100);
        ctx.fillRect(-this.radius, -this.radius, this.radius*2, this.radius*2); ctx.restore();
    }
}

class Enemy {
    constructor(x, y) {
        let rand = Math.random() * 100; let typeIdx = 0;
        let bonus = Math.min(score / 2500, 40); 
        if (rand < 60 - bonus) typeIdx = 0; 
        else if (rand < 75 - bonus * 0.5) typeIdx = 1; 
        else if (rand < 85 - bonus * 0.3) typeIdx = 2; 
        else if (rand < 90 - bonus * 0.2) typeIdx = 3; 
        else if (rand < 95 - bonus * 0.1) typeIdx = 4; 
        else typeIdx = 5; 

        const config = ENEMY_TYPES[typeIdx];
        this.x = x; this.y = y; this.type = config.type; this.color = config.color; 
        this.maxHp = config.hp; this.score = config.score; this.radius = config.radius; this.sides = config.sides; this.angle = 0; 
        this.baseSpeed = config.speed;
        this.spinSpeed = (Math.random() * 0.1 - 0.05) * (4 / (typeIdx + 1)); 
        this.hp = Math.ceil(this.maxHp * globalDifficultyMultiplier);
    }

    update(player) {
        if (freezeTimer > 0) return;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const currentSpeed = this.baseSpeed * difficultyFactor * globalEnemySpeedMult; 
        this.x += Math.cos(angle) * currentSpeed;
        this.y += Math.sin(angle) * currentSpeed;
        this.angle += this.spinSpeed;
    }

    draw() {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
        ctx.shadowBlur = 15; ctx.shadowColor = this.color; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.type === 'circle' || this.type === 'diamond') {
            if(this.type === 'diamond') {
                ctx.moveTo(0, -this.radius); ctx.lineTo(this.radius, 0); ctx.lineTo(0, this.radius); ctx.lineTo(-this.radius, 0);
            } else {
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            }
        } else {
            for (let i = 0; i < this.sides; i++) { 
                const theta = i * 2 * Math.PI / this.sides; 
                const x = this.radius * Math.cos(theta); const y = this.radius * Math.sin(theta); 
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); 
            } 
        }
        ctx.closePath(); ctx.stroke(); ctx.fillStyle = this.color + '33'; ctx.fill();
        if (this.hp < this.maxHp) {
            ctx.rotate(-this.angle); ctx.fillStyle = '#f00'; ctx.fillRect(-15, this.radius + 5, 30, 3); ctx.fillStyle = '#0f0'; ctx.fillRect(-15, this.radius + 5, 30 * (this.hp / this.maxHp), 3);
        }
        ctx.restore();
    }
    takeDamage(amount) { 
        this.hp -= amount; 
        createExplosion(this.x, this.y, '#fff', 2); 
        return this.hp <= 0; 
    }
}

class Boss {
    constructor(level) {
        this.level = level;
        this.x = canvas.width / 2; this.y = -100;
        this.radius = 60 + (level * 5); 
        this.color = '#f0f'; 
        this.maxHp = Math.floor(50 * Math.pow(2, level - 1));
        this.hp = this.maxHp;
        this.score = 50 * level;
        this.speed = 1.2 + (level * 0.3);
        this.angle = 0; this.active = false; this.lastShot = 0; 
        this.fireRate = Math.max(200, 2000 - (level * 300)); 
        this.entered = false;
    }
    update(player) {
        if (!this.entered) {
            this.y += 2; if (this.y > 150) { this.entered = true; this.active = true; AudioSys.playPowerUp('bomb'); } return;
        }
        this.x += Math.sin(Date.now() / 1000) * (2 + this.level * 0.2); 
        if (this.y < 150) this.y += 0.5;
        this.angle += 0.02 + (this.level * 0.005);
        if (Date.now() - this.lastShot > this.fireRate) { this.shoot(player); this.lastShot = Date.now(); }
    }
    shoot(player) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const spread = 0.15 + (this.level * 0.01);
        const count = 3 + Math.floor(this.level / 2);
        const startAngle = angle - ((count - 1) * spread) / 2;

        for(let i=0; i<count; i++) {
            const finalAngle = startAngle + i * spread;
            const vel = 6 + (this.level * 0.5);
            enemyBullets.push(new EnemyBullet(this.x, this.y, { x: Math.cos(finalAngle) * vel, y: Math.sin(finalAngle) * vel }));
        }
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        if (!this.entered) {
            ctx.globalAlpha = Math.abs(Math.sin(Date.now() / 200)); ctx.fillStyle = '#f0f'; ctx.font = '30px Arial'; ctx.fillText("WARNING BOSS", -90, 0);
        }
        ctx.rotate(this.angle); ctx.shadowBlur = 30; ctx.shadowColor = this.color; ctx.strokeStyle = this.color; ctx.lineWidth = 4;
        ctx.beginPath(); for (let i = 0; i < 8; i++) { const theta = i * 2 * Math.PI / 8; const r = (i % 2 === 0) ? this.radius : this.radius * 0.6; const x = r * Math.cos(theta); const y = r * Math.sin(theta); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 0, 255, 0.2)'; ctx.fill(); ctx.rotate(-this.angle * 2); ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        if (this.entered) {
            ctx.save(); ctx.fillStyle = '#f00'; ctx.fillRect(canvas.width/2 - 100, 50, 200, 10); ctx.fillStyle = '#f0f'; ctx.fillRect(canvas.width/2 - 100, 50, 200 * (this.hp / this.maxHp), 10); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(canvas.width/2 - 100, 50, 200, 10); ctx.restore();
        }
    }
    takeDamage(amount) {
        this.hp -= amount; createExplosion(this.x + (Math.random()-0.5)*50, this.y + (Math.random()-0.5)*50, '#f0f', 5); if (this.hp % (Math.max(5, this.maxHp * 0.1)) === 0) AudioSys.playExplosion(true); return this.hp <= 0;
    }
}

class Player {
    constructor() {
        this.x = canvas.width / 2; this.y = canvas.height / 2;
        this.radius = 15; this.color = '#0ff';
        this.velocity = { x: 0, y: 0 }; this.speed = 5; this.friction = 0.92; this.angle = 0;
        this.health = 100; this.maxHealth = 100; this.shield = 0; this.weaponLevel = 1; this.lastShot = 0;
        this.bombs = 1; this.maxBombs = 3; this.speedLevel = 1; this.orbiters = []; 
        this.maxSatellites = 6;
        
        this.dashCooldownTime = 10000; 
        this.lastDash = Date.now() - 10000; // 确保dash一开始就处于就绪状态
        this.dashDistance = 200; 
        this.dashDuration = 300; 
        this.isInvincible = false; 
        this.invincibleTimer = null; 

        this.weaponIndex = 0; 
        this.currentWeapon = WEAPON_TYPES[this.weaponIndex];
    }

    switchWeapon() {
        this.weaponIndex = (this.weaponIndex + 1) % WEAPON_TYPES.length;
        this.currentWeapon = WEAPON_TYPES[this.weaponIndex];
        this.updateWeaponUI();
        AudioSys.playPowerUp('speed');
    }

    updateWeaponUI() {
        const config = WEAPON_CONFIG[this.currentWeapon];
        let colorClass = "text-yellow";
        if (this.currentWeapon === 'shotgun') colorClass = "text-orange";
        if (this.currentWeapon === 'sniper') colorClass = "text-cyan";
        
        weaponModeDisplay.className = `hud-item ${colorClass}`;
        weaponModeDisplay.innerText = `武器: ${config.name} [F]`;
    }

    update(deltaTime) {
        if (keys.w) this.velocity.y -= 0.5; if (keys.s) this.velocity.y += 0.5;
        if (keys.a) this.velocity.x -= 0.5; if (keys.d) this.velocity.x += 0.5;

        const speed = Math.hypot(this.velocity.x, this.velocity.y);
        if (speed > this.speed) { const ratio = this.speed / speed; this.velocity.x *= ratio; this.velocity.y *= ratio; }

        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.x += this.velocity.x; this.y += this.velocity.y;

        if (this.x < this.radius) { 
            this.x = this.radius; 
            this.velocity.x = Math.abs(this.velocity.x) * 0.5; 
        }
        if (this.x > canvas.width - this.radius) { 
            this.x = canvas.width - this.radius; 
            this.velocity.x = -Math.abs(this.velocity.x) * 0.5; 
        }
        if (this.y < this.radius) { 
            this.y = this.radius; 
            this.velocity.y = Math.abs(this.velocity.y) * 0.5; 
        }
        if (this.y > canvas.height - this.radius) { 
            this.y = canvas.height - this.radius; 
            this.velocity.y = -Math.abs(this.velocity.y) * 0.5; 
        }

        this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

        const stats = WEAPON_CONFIG[this.currentWeapon].getStats(this.weaponLevel);
        if (mouseBtn.left && Date.now() - this.lastShot > stats.rate) { this.shoot(stats); }

        if (keys.w || keys.a || keys.s || keys.d) {
            if (Math.random() < 0.5) particles.push(new Particle(this.x - Math.cos(this.angle) * 15, this.y - Math.sin(this.angle) * 15, 'rgba(0, 255, 255, 0.5)', { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }));
        }
        this.orbiters.forEach(o => o.update(this));
    }

    draw() {
        this.orbiters.forEach(o => o.draw());
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
        if (this.isInvincible) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 20) * 0.4; 
        }
        if (this.shield > 0) {
            ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2);
            ctx.strokeStyle = '#0f0'; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = '#0f0'; ctx.setLineDash([5, 5]);
            ctx.rotate(-Date.now() / 500); ctx.stroke(); ctx.setLineDash([]); ctx.rotate(Date.now() / 500);
        }
        ctx.shadowBlur = 20; ctx.shadowColor = this.color; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-10, -10); ctx.lineTo(-5, 0); ctx.lineTo(-10, 10); ctx.closePath(); ctx.stroke();
        let coreColor = 'rgba(0, 255, 255, 0.1)'; if(this.weaponLevel >= 3) coreColor = 'rgba(255, 170, 0, 0.3)'; if(this.weaponLevel >= 5) coreColor = 'rgba(255, 50, 50, 0.4)';
        ctx.fillStyle = coreColor; ctx.fill(); ctx.restore();
    }

    shoot(stats) {
        const count = stats.count; const spread = stats.spread;
        let startAngle = this.angle;
        if (count === 1) startAngle = this.angle;
        else if (count % 2 === 1) startAngle = this.angle - ((count - 1) / 2) * spread;
        else startAngle = this.angle - ((count / 2) * spread) + (spread / 2);

        for (let i = 0; i < count; i++) {
            const finalAngle = startAngle + (i * spread);
            const velocity = { x: Math.cos(finalAngle) * stats.velocity, y: Math.sin(finalAngle) * stats.velocity };
            bullets.push(new Bullet(
                this.x + Math.cos(finalAngle) * 15, 
                this.y + Math.sin(finalAngle) * 15, 
                velocity, 
                stats.radius, 
                stats.damage * globalDamageMult, 
                stats.pierce,
                stats.life,
                WEAPON_CONFIG[this.currentWeapon].color
            ));
        }
        this.lastShot = Date.now();
        const recoilForce = (0.5 + count * 0.1) * globalRecoilMult;
        this.velocity.x -= Math.cos(this.angle) * recoilForce; 
        this.velocity.y -= Math.sin(this.angle) * recoilForce;
        AudioSys.playShoot(this.currentWeapon);
    }

    useBomb() {
        if (this.bombs > 0) {
            this.bombs--; bombEl.innerText = this.bombs;
            screenShake(40, 50); AudioSys.playExplosion(true);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; ctx.fillRect(0,0, canvas.width, canvas.height);
            enemies.forEach(e => { createExplosion(e.x, e.y, e.color, 20); score += e.score; });
            asteroids.forEach(a => { createExplosion(a.x, a.y, '#888', 10); score += a.score; });
            enemies = []; enemyBullets = []; asteroids = []; scoreEl.innerText = score;
        }
    }

    dash() {
        const now = Date.now();
        if (now - this.lastDash >= this.dashCooldownTime) {
            const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
            for(let i=0; i<10; i++) {
                particles.push(new Particle(this.x, this.y, '#0ff', { 
                    x: (Math.random()-0.5) * 5 - Math.cos(angle)*2, 
                    y: (Math.random()-0.5) * 5 - Math.sin(angle)*2 
                }));
            }
            this.x += Math.cos(angle) * this.dashDistance;
            this.y += Math.sin(angle) * this.dashDistance;

            this.isInvincible = true;
            if (this.invincibleTimer) clearTimeout(this.invincibleTimer);
            this.invincibleTimer = setTimeout(() => { this.isInvincible = false; }, this.dashDuration);

            this.lastDash = now;
            screenShake(5, 5);
            AudioSys.playDash();
        }
    }
}