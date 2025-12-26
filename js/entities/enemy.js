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
        this.collisionDamage = config.collisionDamage; // 添加碰撞伤害属性
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