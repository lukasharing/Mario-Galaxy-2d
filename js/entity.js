class Entity extends Shape{

	constructor(_game, _x, _y, _w, _h){
		super(_x, _y)
		super.rectangle(_w, _h);
		this.game = _game;
		this.velocity = new Vector(0.01, 0.01);
		this.acceleration = new Vector(0.0, 0.0);

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
		console.log(factor);
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

	update(dt){
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
		let gravity_vector = this.coordSystem[1].scale(-0.98 * 100.0);
		this.position = this.position.add(this.velocity.scale(dt));
		this.velocity = this.velocity.scale(friction).add(gravity_vector.scale(dt));

		// Get all intersections
		const intersect_shapes = this.intersect_shapes(this.game.floor);
		this.isTouchingFloor = false;

		if(intersect_shapes.length > 0){
			// TEST: objectOver should be the object who which the player needs to be pushed furthest away
			let collision_forces = new Vector();
			let rotation_angle = 0.0;
			intersect_shapes.forEach(collided => {
				collision_forces = collision_forces.add(collided.repulsive_force);
				if(collided.repulsive_force.normalize().dot(this.coordSystem[1]) > 0.0){
					this.isTouchingFloor = true;
					// Conservation of momentum, object placed on top of other should rotate together
					if(collided.body.angular_velocity != 0.0){
						// Vector Center of entity to the center of the planet
						let vb = this.position.subtract(collided.body.position);
						// Rotate Vector To the new position
						let vr = vb.rotate(collided.body.angular_velocity);
						// Calculate Rotation Displacement
						let ds = vr.subtract(vb);
						// Add to delta "changes"
						rotation_angle += collided.body.angular_velocity;
						collision_forces = collision_forces.add(ds);
					}
				}
			});

			this.rotate(rotation_angle * dt);
			this.position = this.position.add(collision_forces);
			this.objectOver = intersect_shapes[0].body;
		}else{
			// The object who has the biggest attractive force will be our "planet"
			this.objectOver = this.game.force_in_point(this.position).body;
		}

		// Keep always the parent as gravitating object
		this.objectOver = this.objectOver.parent !== null ? this.objectOver.parent : this.objectOver;

		// If there exist a segment where the "player's shadows" cast over from the element we are gravitating,
		// The vector of the segment and its perpendicular will be our system coordinate
		let new_coord = this.game.nearest_side(this.position, this.objectOver); // Get the ID.

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
