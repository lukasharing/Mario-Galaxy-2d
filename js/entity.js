class Entity extends Shape{

	constructor(_game, _x, _y, _w, _h){
		super(_x, _y)
		super.rectangle(_w, _h);
		this.game = _game;
		this.velocity = new Vector(0.01, 0.01);

		// Gfx
		this.sprite = null;
		this.gfx_x = 0;
		this.gfx_y = 0;
		this.gfx_frame = 0;

		// Physics
		this.coordSystem = [new Vector(0.0, 0.0, 0.0), new Vector(0.0, 0.0, 0.0)];
		this.objectOver = null;
		
		this.isJumping = false;

		this.isTouchingFloor = false;
		this.friction = 0.98;

		// Direction
		this.x_last_dir = 0;
		this.x_direction = 0;
		this.y_direction = 0;

		// Common Properties
		this.life = 100;
		this.max_life = 100;
		this.healing_time = 0;
	};
	
	get alive(){ return this.life > 0; };

	move_left(force = 1.0){
		this.velocity = this.velocity.add(this.coordSystem[0].scale(force));
	};

	move_right(force = 1.0){
		this.velocity = this.velocity.subtract(this.coordSystem[0].scale(force));
	};

	jump(factor = 20.0){
		if(this.isJumping < 0){
			this.isTouchingFloor = false;
			this.isJumping = 4;
			this.velocity = this.velocity.add(this.coordSystem[1].scale(factor));
		}
	};

	draw(ctx){
		
		this.x_last_dir = Math.abs(this.x_direction) < EPSILON ?  this.x_last_dir : -Math.sign(this.x_direction)
		this.x_direction = this.coordSystem[0].dot(this.velocity);
		this.y_direction = this.coordSystem[1].dot(this.velocity);

		ctx.save();
			ctx.translate(this.position.x, this.position.y);
			ctx.rotate(this.rotation);
			ctx.scale(this.x_last_dir, 1.0);
			ctx.drawImage(
				this.sprite.image,
				this.gfx_x * this.sprite.size.x,
				this.gfx_y * this.sprite.size.y,
				this.sprite.size.x,
				this.sprite.size.y,
				-(this.sprite.size.x >> 1),
				-(this.sprite.size.y >> 1),
				this.sprite.size.x,
				this.sprite.size.y
			);
		ctx.restore();
	};

	update(dt, game){
		let friction = 0.0;
		// If the floor is being touched
		if(this.isTouchingFloor){
			--this.isJumping;
			friction = 0.75; // Friction on the floor
		}else{
			// On the air
			friction = Math.sign(this.coordSystem[1].dot(this.velocity)) > 0 ? 0.9 : 0.93;
		}

		// Rotating the collision Box
		let angle = Math.atan2(this.coordSystem[1].x, -this.coordSystem[1].y);
		let df = angle - this.rotation;
		if(Math.abs(df) > EPSILON){ this.rotate(df); }

		/* Update Forces */
		// Friction interaction
		this.velocity = this.velocity.scale(friction);
		// Add Gravity
		let last_velocity_state = this.velocity.subtract(this.coordSystem[1]);

		// Get all intersections
		// 1. Simulate Fake Gravity ()
		this.position = this.position.add(last_velocity_state);
		const intersect_shapes = this.intersect_shapes(game.floor);
		this.isTouchingFloor = false;

		if(intersect_shapes.length > 0){
			intersect_shapes.forEach(e => {
				this.position = this.position.add(e.repulsive_force);
				this.isTouchingFloor |= e.repulsive_force.normalize().dot(this.coordSystem[1]) > 0.0;
			});

			this.objectOver = intersect_shapes[0].body;
		}else{
			// The object who has the biggest attractive force will be our "planet"
			this.objectOver = game.force_in_point(this.position).body;
		}
		// 2. Remove Gravity Simulation
		this.position = this.position.subtract(last_velocity_state);

		// 3. Apply Real Gravity
		this.velocity = last_velocity_state;
		this.position = this.position.add(this.velocity);

		// Conservation of momentum, object placed on top of other should rotate together
		// TODO: Check if set this.objectOver = first floor.
		if(this.objectOver.angular_velocity != 0.0){
			this.rotate(this.objectOver.angular_velocity);
			let vb = new Vector(this.position.x - this.objectOver.position.x, this.position.y - this.objectOver.position.y);
			let vr = vb.rotate(this.objectOver.angular_velocity);
			let ds = vr.subtract(vb);
			this.position = this.position.add(ds);
		}

		// Keep always the parent as gravitating object
		this.objectOver = this.objectOver.parent !== null ? this.objectOver.parent : this.objectOver;

		// If there exist a segment where the "player's shadows" cast over from the element we are gravitating,
		// The vector of the segment and its perpendicular will be our system coordinate
		let new_coord = game.nearest_side(this.position, this.objectOver); // Get the ID.

		if(new_coord >= 0){ // If we find
			this.coordSystem[1] = this.objectOver.normals[new_coord];
		}else{ // If we dont find any near segment.
			// Lets find the corner
			let nearest_edge = this.objectOver.edges().map(e => e.subtract(this.position)).sort((a, b) => (a.length - b.length))[0].normalize().scale(-1);
			this.coordSystem[1] = nearest_edge;
		}
		this.coordSystem[0] = this.coordSystem[1].perpendicular().scale(-1);
	};

}
