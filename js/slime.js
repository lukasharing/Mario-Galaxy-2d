class Slime extends Enemy{

	constructor(_x, _y){
		super(_x, _y, 20, 11);

		// Gfx
		this.sprite = game.sprites["slime"];

		this.decision_moving = 0;
		this.decision_change = 5.0;
		this.decision = this.move_left;

		this.jump_factor = 15;
		this.jump_delay = 10.;
	};

	update(dt, game){

		this.gfx_frame += 0.5;
		this.gfx_id = Math.floor(this.gfx_frame) & 0x8;

		this.decision_moving += 0.1;
		if(this.decision_moving > this.decision_change){
			this.decision_moving = 0.0;
			this.decision = Math.random() > 0.3 ? this.move_left : this.move_right;
		}
		this.decision(0.2);

		super.update(dt, game);
	};

}
