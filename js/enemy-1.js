class Enemy1 extends Enemy{

	constructor(_x, _y){
		super(_x, _y, 15, 16);

		// Gfx
		this.sprite = game.sprites["enemy-1"];

		this.decision_moving = 0;
		this.decision_change = 5.0;
		this.decision = this.move_left;

		this.jump_factor = 15;
		this.jump_delay = 10. + Math.random() * 10;
	};

	update(dt, game){

		this.gfx_frame += 0.1;
		this.gfx_id = Math.floor(this.gfx_frame) % 3;

		this.decision_moving += 0.1;
		if(this.decision_moving > this.decision_change){
			this.decision_moving = 0.0;
			this.decision = Math.random() > 0.3 ? this.move_left : this.move_right;
		}
		this.decision(0.2);

		this.jump_time += 0.1; // dt
		if(this.jump_time > this.jump_delay){
		  this.jump_time = 0;
		  super.jump(this.jump_factor);
		}

		super.update(dt, game);
	};

}
