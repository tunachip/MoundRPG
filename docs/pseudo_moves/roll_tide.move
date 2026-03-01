[NOTES]
Basic Water Attack.
When Cast, Attunes Caster to Water & Deals 2 Water Damage to Chosen Target.

[METADATA]

NAME									Roll Tide
TYPE									attack
SPEED									normal
ELEMENT								water
BASE_DAMAGE						2
BASE_ITERATIONS				1
CAN_CHAIN							true
CAN_BE_CHAINED_INTO		true

[OPERATIONS]

FROM_ACTIVE
	1. applyAttunement
		TARGET			caster
		ELEMENT			this.element

	2. loop
		ITERATIONS	this.iterations
		OPERATIONS
		1. attack
			TARGET				choice
			ELEMENT				this.element
			BASE_DAMAGE		this.baseDamage

FROM_BANKED
	1. applyAttunement
		TARGET			caster
		ELEMENT			this.element

	2. activateMove
		TARGET			this

FROM_ON_COOLDOWN

WHILE_ACTIVE

WHILE_BANKED

WHILE_ON_COOLDOWN

