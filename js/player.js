class Player extends Entity{

	constructor(_game, _x, _y, _w, _h){
		super(_game, _x, _y)
		super.rectangle(10, 14);

		// Gfx
		this.sprite = game.sprites["player"];
	};

	draw(ctx){
		// Update Gfx index
		if(!this.isTouchingFloor){
			this.gfx_x = Math.sign(this.y_direction) > 0 ? 2 : 3;
		}else{
			if(Math.abs(this.x_direction) > 1){
				++this.gfx_frame;
				this.gfx_x = (this.gfx_frame >> 3) & 1;
			}else{
				this.gfx_frame = 0;
				this.gfx_x = 0;
			}
		}
		super.draw(ctx);
	};

	shoot(damage){



	};

	update(dt, game){

		super.update(dt, game);

	};

}
