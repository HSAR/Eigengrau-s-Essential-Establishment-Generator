/* global setup */
setup.createSocioPolitics = function (town) {
  console.groupCollapsed('Creating sociopolitics!')
  // ecoIde and polSource are now set in the createTown.js function
  var polIde = setup.townData.politicalIdeology[town.politicalIdeology]
  // // give those ideologies some descriptions
  town = Object.assign(town, setup.townData.economicIdeology[town.economicIdeology].descriptors)
  // // data
  town = Object.assign(town, setup.townData.politicalIdeology[town.politicalIdeology].data)

  // deletes town leaders if they are defined. Commented out because I'd prefer to leave ex-prime ministers in than delete somebody's valuable NPC.
  // if (town.leader) {
  //   delete State.variables.npcs[town.leader.key]
  //   delete town.leader
  // }
  // if (town.ruler) {
  //   delete State.variables.npcs[town.ruler.key]
  //   delete town.ruler
  // }

  setup.createTownLeader = function (town) {
    town.leaderType = setup.townData.politicalIdeology[town.politicalIdeology].data.leaderType || 'commoners'
    if (typeof polIde.leaderTraits !== 'undefined') {
      town.leader = setup.createNPC(town, setup.townData.politicalIdeology[town.politicalIdeology].leaderTraits)
    } else {
      console.log('Invalid political ideology of ' + town.politicalIdeology + '. Leader defaulting to random NPC...')
      town.leader = setup.createNPC(town, {
        profession: 'politician'
      })
    }
    return town
  }

  switch (town.politicalSource) {
    case 'absolute monarchy':
      switch (town.politicalIdeology) {
        case 'autocracy':
          town.dualLeaders = false
          console.log('Loaded autocratic absolute monarchy')
          town.leader = setup.createNPC(town, { background: 'noble', profession: 'noble' })
          // switch (town.ruler.gender) {
          //   case 'woman':
          //     town.rulerType = 'Queen'
          //     break
          //   default:
          //     town.rulerType = 'King'
          //     break
          // }
          break
        default:
          console.log('Loaded a ' + town.politicalIdeologyIC + ' absolute monarchy')
          setup.createTownLeader(town)
          town.dualLeaders = true
          town.ruler = setup.createNPC(town, { title: 'Royal Highness', background: 'noble', profession: 'noble' })
      }
      break
    case 'constitutional monarchy':
      switch (town.politicalIdeology) {
        case 'autocracy':
          town.dualLeaders = true
          console.log('Loaded autocratic constitutional monarchy')
          town.ruler = setup.createNPC(town, { title: 'Royal Highness', background: 'noble', profession: 'noble' })
          town.leader = setup.createNPC(town, { title: 'Lord', background: 'noble', profession: 'politician' })
          // switch (town.ruler.gender) {
          //   case 'woman':
          //     town.rulerType = 'Queen'
          //     break
          //   default:
          //     town.rulerType = 'King'
          //     break
          // }
          break
        default:
          console.log('Loaded a ' + town.politicalIdeologyIC + ' constitutional monarchy')
          town.ruler = setup.createNPC(town, { title: 'Royal Highness', background: 'noble', profession: 'noble' })
          setup.createTownLeader(town)
      }
      break
    default:
      console.log('Loaded a ' + town.politicalIdeologyIC + ' ' + town.politicalSource)
      setup.createTownLeader(town)
      town.dualLeaders = false
  }

  // switch (town.politicalIdeology) {
  //   case 'autocracy':
  //     switch (town.politicalSource) {
  //       case 'absolute monarchy':
  //         town.dualLeaders = false
  //         console.log('Loaded autocratic absolute monarchy')
  //         town.leader = setup.createNPC(town, { background: 'noble', profession: 'noble' })
  //         switch (town.ruler.gender) {
  //           case 'woman':
  //             town.rulerType = 'Queen'
  //             break
  //           default:
  //             town.rulerType = 'King'
  //             break
  //         }
  //         break
  //       case 'constitutional monarchy':
  //         town.dualLeaders = true
  //         console.log('Loaded autocratic constitutional monarchy')
  //         town.ruler = setup.createNPC(town, { title: 'Royal Highness', background: 'noble', profession: 'noble' })
  //         town.leader = setup.createNPC(town, { title: 'Lord', background: 'noble', profession: 'politician' })
  //         // town.politicalSourceDescription = "<<print _town.leader.title.toUpperFirst()>> <<profile _town.leader>> is the supreme ruler, and all laws and affairs are governed by the crowns' will."
  //         switch (town.ruler.gender) {
  //           case 'man':
  //             town.rulerType = 'King'
  //             break
  //           case 'woman':
  //             town.rulerType = 'Queen'
  //             break
  //           default:
  //             town.rulerType = 'the supreme leader'
  //         }
  //         break
  //       default:
  //         town.leaderType = 'the supreme leader'
  //         town.dualLeaders = false
  //         town.leader = setup.createNPC(town, { title: 'Lord', background: 'noble', profession: 'politician' })
  //     }
  //     break
  //   default:
  //     town.dualLeaders = false
  //     town.leaderType = polIde.data.leaderType || 'commoners'
  //     if (typeof polIde.leaderTraits !== 'undefined') {
  //       town.leader = setup.createNPC(polIde.leaderTraits)
  //     } else {
  //       console.log('Invalid political ideology of ' + town.politicalIdeology + '. Leader defaulting to random NPC...')
  //       town.leader = setup.createNPC(town)
  //     }
  // }
  console.log('Town faction leadership...')
  if (polIde.data.isFaction === true) {
    console.log('Loading ruling faction...')
    delete State.variables.npcs[town.leader.key]
    delete town.leader
    var type = polIde.data.governmentType
    if (polIde.data.governmentType !== setup.factionData.type[type]) {
      console.log('No faction that matches ' + polIde.data.governmentType + '. Creating random faction instead...')
      town.factions['leader'] = setup.createFaction(town, {
        leadershipType: 'individual',
        isPoliticalPower: true
      })
    } else {
      town.factions['leader'] = setup.createFaction(town, {
        leadershipType: 'individual',
        isPoliticalPower: true,
        type: polIde.data.governmentType
      })
    }
    town.leader = town.factions['leader'].leader
    town.leaderType = '<<link ' + JSON.stringify(town.factions['leader'].name) + '>><<set $selected to {key: ' + JSON.stringify(town.factions['leader'].key) + '}>><<goto "FactionProfile">><</link>>'
  } else if (polIde.data.isFaction === false && town.factions['leader']) {
    delete town.factions['leader']
  }

  console.groupEnd();
  return town
}
