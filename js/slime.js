class Slime extends Enemy{

	constructor(_game, _x, _y){
		super(_game, _x, _y, 20, 11);

		// Gfx
		this.sprite = game.sprites["slime"];

		this.decision_moving = 0;
		this.decision_change = 5.0;
		this.decision = this.move_left;

		this.jump_factor = 300.;
		this.jump_delay = 10. + Math.random() * 10;
	};

	update(dt){

		this.gfx_frame += dt;
		this.gfx_x = Math.floor(this.gfx_frame) % 5;

		this.decision_moving += dt;
		if(this.decision_moving > this.decision_change){
			this.decision_moving = 0.0;
			this.decision = Math.random() > 0.3 ? this.move_left : this.move_right;
		}
		this.decision(2.);

		this.jump_time += dt;
		if(this.jump_time > this.jump_delay){
		  this.jump_time = 0;
		  super.jump(this.jump_factor);
		}

		super.update(dt);
	};

}
