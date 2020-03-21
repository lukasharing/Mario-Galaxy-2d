class Bullet extends Entity{

	constructor(_x, _y){
		super(_x, _y, 10, 10);

		// Gfx
		this.sprite = game.sprites["bullet"];
		this.gfx_y = 1;
	};

	update(dt, game){


	};

}
