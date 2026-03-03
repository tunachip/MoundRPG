# RPG Architecture

GameManager = {
  state: GameState,
  playerData: EntityData,
  sessionId: number,
}

CombatState = {
  entities:  Array<CombatEntity>,
  moves:     Array<CombatMove>,
  blessings: Array<CombatBlessing>,
  listeners: Array<Listener>,
}

gameover = CombatLoop(player):
  encounter   = getEncounter(player)
  combatState = initializeCombatState(player, encounter)
  while True:
    choices   = Phase.GetActionChoices(combatState)
    turnOrder = Phase.CalculateTurnOrder(combatState, choices)
    for turn of turnOrder:
      result = Phase.ExecuteTurn(combatState, turn)
      if result.breaks && result.reason == 'gameover':
        return playerDead(combat)
    Phase.cleanup()

  if gameover:
    GameManager.state = ''
