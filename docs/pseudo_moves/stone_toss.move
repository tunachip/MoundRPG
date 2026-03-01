[NOTES]
Basic Stone Attack.
When Cast, Attunes Caster to Stone & Deals 2 Stone Damage to Chosen Target.

[METADATA]

NAME									Stone Toss
TYPE									attack
SPEED									normal
ELEMENT								stone
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
	E	LEMENT			this.element

	2. activateMove
		TARGET			this

FROM_ON_COOLDOWN

WHILE_ACTIVE

WHILE_BANKED

WHILE_ON_COOLDOWN

