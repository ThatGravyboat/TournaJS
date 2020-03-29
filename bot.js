const Eris = require("eris")
const fs = require('fs');
let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);
const bot = new Eris.CommandClient(config.guildInfo.discordToken, {}, {
    description: "DPL scrim bot",
    owner: "DPL",
    prefix: "!"
});
//Admin Roles
var scrimAdminRole = config.guildInfo.scrimAdminRole
var adminRole = config.guildInfo.adminRole
//Scrim Info
var scrimLogChannel = config.guildInfo.scrimLogChannel
var scrimSize = config.guildInfo.scrimSize
//Current Scrim Admins 
var eastScrimAdmin = ''
var westScrimAdmin = ''
var euScrimAdmin = ''
var saScrimAdmin = ''
var oceScrimAdmin = ''
var spScrimAdmin = ''
//Scrim Dashboard
var scrimDashboardMessageId = config.guildInfo.scrimDashBoardMessageId
//Scrim Channel IDS
var scrimEastChannel = config.scrimChannels.scrimEastChannel
var scrimWestChannel = config.scrimChannels.scrimEastChannel
var scrimEuChannel = config.scrimChannels.scrimEastChannel
var scrimOceChannel = config.scrimChannels.scrimEastChannel
var scrimSaChannel = config.scrimChannels.scrimEastChannel
var scrimSpChannel = config.scrimChannels.scrimEastChannel
//Scrim Active
var eastScrimActive = config.scrimActive.eastScrimActive
var westScrimActive = config.scrimActive.westScrimActive
var euScrimActive = config.scrimActive.euScrimActive
var saScrimActive = config.scrimActive.saScrimActive
var oceScrimActive = config.scrimActive.oceScrimActive
var spScrimActive = config.scrimActive.spScrimActive
//Guild ID
var guildId = config.guildInfo.guildID
//Current Scrim Players
var eastScrimPlayers = []
var westScrimPlayers = []
var euScrimPlayers = []
var saScrimPlayers = []
var oceScrimPlayers = []
var spScrimPlayers = []
//Scrim Log 
var eastPlayerTemp = []
var westPlayerTemp = []
var euPlayerTemp = []
var saPlayerTemp = []
var ocePlayerTemp = []
var spPlayerTemp = []
//Role Queue
var roleQueueProcess = false
var roleQueueRemoveProcess = false
var addRoleQueue = []
var removeRoleQueue = []

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("scrimdashboard",  (msg, args) => {
    const scrimDashboardMessage = {
        "embed": {
          "title": "Scrim Dashboard",
          "description": `
          Click the region you would like to start a scrim for.
          :flag_us: EAST: ${eastScrimAdmin}
          <:cali:662368255490523195> WEST: ${westScrimAdmin}
          :flag_eu: EU: ${euScrimAdmin}
          :flag_br: SA: ${saScrimAdmin}
          :flag_au: OCE: ${oceScrimAdmin}
          :flag_sg: SP: ${spScrimAdmin}`,
          "color": 5373696,
          "thumbnail": {
            "url": "https://webstockreview.net/images/play-icon-png.png"
          },
          "fields": [
            {
              "name": "Max Scrim Size",
              "value": scrimSize
            }
          ]
        }
      };
    bot.createMessage('693722254441447465', scrimDashboardMessage).then(function(message) {
        message.addReaction('🇺🇸')
        message.addReaction(':cali:662368255490523195')
        message.addReaction('🇪🇺')
        message.addReaction('🇧🇷')
        message.addReaction('🇦🇺')
        message.addReaction('🇸🇬')
        
        config.guildInfo.scrimDashBoardMessageId = message.id;
        
        fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
          if (err) return console.log(err);
        });
    })
});

bot.registerCommand("scrimsize",  (msg, args) => {
    scrimSize = args[0]
    updateDashboard()
});

bot.on("messageReactionAdd", (reactMessage, emoji, user) => {
    var usersRoles = bot.guilds.get(guildId).members.get(user).roles
    if (reactMessage.id === scrimDashboardMessageId && user !== '374042097461755915'){
        bot.getMessage('693722254441447465',scrimDashboardMessageId).then(message =>{
            if (emoji.id){message.removeReaction(`:${emoji.name}:${emoji.id}`, user)}
            else 
            message.removeReaction(emoji.name, user)
        })
        usersRoles.forEach(roles => {
            if (roles === scrimAdminRole) {
                switch (emoji.name) {
                    case '🇺🇸':
                        eastScrimAdmin = `<@${user}>`
                        makeScrimMessage('east', scrimSize)
                        updateDashboard()
                        break;
                    case 'cali':
                        westScrimAdmin = `<@${user}>`
                        makeScrimMessage('west', scrimSize)
                        updateDashboard()
                        break;
                    case '🇪🇺':
                        euScrimAdmin = `<@${user}>`
                        makeScrimMessage('eu', scrimSize)
                        updateDashboard()
                        break;
                    case '🇧🇷':
                        saScrimAdmin = `<@${user}>`
                        makeScrimMessage('sa', scrimSize)
                        updateDashboard()
                        break;
                    case '🇦🇺':
                        oceScrimAdmin = `<@${user}>`
                        makeScrimMessage('oce', scrimSize)
                        updateDashboard()
                        break;
                    case '🇸🇬':
                        spScrimAdmin = `<@${user}>`
                        makeScrimMessage('sp', scrimSize)
                        updateDashboard()
                        break;
                    default:
                        bot.createMessage(reactMessage.channel.id, '<@'+user+'> please dont add a reaction to the scrim dashboard message!').then(function(message) {
                            setTimeout(() => {
                                bot.deleteMessage(reactMessage.channel.id, message.id)
                            }, 5000);
                        })
                        break;
                }
            }
        })
    }
    if (reactMessage.id === config.scrimMessageIDs.eastScrimMessageId && user !== '374042097461755915'){
        switch (emoji.name) {
            case '🟦':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        if (eastScrimPlayers.length >= scrimSize){
                            for (i = 0; i < scrimSize; i++) {
                                addRoleQueue.push({user: eastScrimPlayers[i],id:eastScrimActive,});
                                eastPlayerTemp.push(bot.guilds.get(guildId).members.get(eastScrimPlayers[i]).username)
                            }
                            scrimLog('east')
                            if (roleQueueProcess === false){roleQueue()}
                            bot.removeMessageReactions(scrimEastChannel, config.scrimMessageIDs.eastScrimMessageId)
                            setTimeout(() => {bot.addMessageReaction(scrimEastChannel, config.scrimMessageIDs.eastScrimMessageId, '❌')}, 5000);
                        }
                    }
                })
                break;
            case '✅':
                if (eastScrimPlayers.length < scrimSize){eastScrimPlayers.push(user)}
                break;
            case '🟥':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        eastScrimPlayers.forEach(player => {
                            addRoleQueue.push({user: player,id:eastScrimActive,});
                            eastPlayerTemp.push(bot.guilds.get(guildId).members.get(player).username)
                        })
                        scrimLog('east')
                        if (roleQueueProcess === false){roleQueue()}
                        bot.removeMessageReactions(scrimEastChannel, config.scrimMessageIDs.eastScrimMessageId)
                        setTimeout(() => {bot.addMessageReaction(scrimEastChannel, config.scrimMessageIDs.eastScrimMessageId, '❌')}, 5000);
                    }
                })
                break;
            case '❌':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        eastScrimPlayers.forEach(player => {removeRoleQueue.push({user: player,id:eastScrimActive,});})
                        if (roleQueueRemoveProcess === false){roleQueueRemove()}
                        eastScrimAdmin = ''
                        eastScrimPlayers = []
                        bot.deleteMessage(scrimEastChannel, config.scrimMessageIDs.eastScrimMessageId)
                    }
                })
                break;
            default:
                break;
        }
    }
    if (reactMessage.id === config.scrimMessageIDs.westScrimMessageId && user !== '374042097461755915'){
        switch (emoji.name) {
            case '🟦':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        if (westScrimPlayers.length >= scrimSize){
                            for (i = 0; i < scrimSize; i++) {
                                addRoleQueue.push({user: westScrimPlayers[i],id:westScrimActive,});
                                westPlayerTemp.push(bot.guilds.get(guildId).members.get(westScrimPlayers[i]).username)
                            }
                            scrimLog('west')
                            if (roleQueueProcess === false){roleQueue()}
                            bot.removeMessageReactions(scrimWestChannel, config.scrimMessageIDs.westScrimMessageId)
                            setTimeout(() => {bot.addMessageReaction(scrimWestChannel, config.scrimMessageIDs.westScrimMessageId, '❌')}, 5000);
                        }
                    }
                })
                break;
            case '✅':
                if (westScrimPlayers.length < scrimSize){westScrimPlayers.push(user)}
                break;
            case '🟥':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        westScrimPlayers.forEach(player => {
                            addRoleQueue.push({user: player,id:westScrimActive,});
                            westPlayerTemp.push(bot.guilds.get(guildId).members.get(player).username)
                        })
                        scrimLog('west')
                        if (roleQueueProcess === false){roleQueue()}
                        bot.removeMessageReactions(scrimWestChannel, config.scrimMessageIDs.westScrimMessageId)
                        setTimeout(() => {bot.addMessageReaction(scrimWestChannel, config.scrimMessageIDs.westScrimMessageId, '❌')}, 5000);
                    }
                })
                break;
            case '❌':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        westScrimPlayers.forEach(player => {removeRoleQueue.push({user: player,id:westScrimActive,});})
                        if (roleQueueRemoveProcess === false){roleQueueRemove()}
                        westScrimAdmin = ''
                        westScrimPlayers = []
                        bot.deleteMessage(scrimWestChannel, config.scrimMessageIDs.westScrimMessageId)
                    }
                })
                break;
            default:
                break;
        }
    }
    if (reactMessage.id === config.scrimMessageIDs.euScrimMessageId && user !== '374042097461755915'){
        switch (emoji.name) {
            case '🟦':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        if (euScrimPlayers.length >= scrimSize){
                            for (i = 0; i < scrimSize; i++) {
                                addRoleQueue.push({user: euScrimPlayers[i],id:euScrimActive,});
                                euPlayerTemp.push(bot.guilds.get(guildId).members.get(euScrimPlayers[i]).username)
                            }
                            scrimLog('eu')
                            if (roleQueueProcess === false){roleQueue()}
                            bot.removeMessageReactions(scrimEuChannel, config.scrimMessageIDs.euScrimMessageId)
                            setTimeout(() => {bot.addMessageReaction(scrimEuChannel, config.scrimMessageIDs.euScrimMessageId, '❌')}, 5000);
                        }
                    }
                })
                break;
            case '✅':
                if (euScrimPlayers.length < scrimSize){euScrimPlayers.push(user)}
                break;
            case '🟥':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        euScrimPlayers.forEach(player => {
                            addRoleQueue.push({user: player,id:euScrimActive,});
                            euPlayerTemp.push(bot.guilds.get(guildId).members.get(player).username)
                        })
                        scrimLog('eu')
                        if (roleQueueProcess === false){roleQueue()}
                        bot.removeMessageReactions(scrimEuChannel, config.scrimMessageIDs.euScrimMessageId)
                        setTimeout(() => {bot.addMessageReaction(scrimEuChannel, config.scrimMessageIDs.euScrimMessageId, '❌')}, 5000);
                    }
                })
                break;
            case '❌':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        euScrimPlayers.forEach(player => {removeRoleQueue.push({user: player,id:euScrimActive,});})
                        if (roleQueueRemoveProcess === false){roleQueueRemove()}
                        euScrimAdmin = ''
                        euScrimPlayers = []
                        bot.deleteMessage(scrimEuChannel, config.scrimMessageIDs.euScrimMessageId)
                    }
                })
                break;
            default:
                break;
        }
    }
    if (reactMessage.id === config.scrimMessageIDs.saScrimMessageId && user !== '374042097461755915'){
        switch (emoji.name) {
            case '🟦':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        if (saScrimPlayers.length >= scrimSize){
                            for (i = 0; i < scrimSize; i++) {
                                addRoleQueue.push({user: saScrimPlayers[i],id:saScrimActive,});
                                saPlayerTemp.push(bot.guilds.get(guildId).members.get(saScrimPlayers[i]).username)
                            }
                            scrimLog('sa')
                            if (roleQueueProcess === false){roleQueue()}
                            bot.removeMessageReactions(scrimSaChannel, config.scrimMessageIDs.saScrimMessageId)
                            setTimeout(() => {bot.addMessageReaction(scrimSaChannel, config.scrimMessageIDs.saScrimMessageId, '❌')}, 5000);
                        }
                    }
                })
                break;
            case '✅':
                if (saScrimPlayers.length < scrimSize){saScrimPlayers.push(user)}
                break;
            case '🟥':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        saScrimPlayers.forEach(player => {
                            addRoleQueue.push({user: player,id:saScrimActive,});
                            saPlayerTemp.push(bot.guilds.get(guildId).members.get(player).username)
                        })
                        scrimLog('sa')
                        if (roleQueueProcess === false){roleQueue()}
                        bot.removeMessageReactions(scrimSaChannel, config.scrimMessageIDs.saScrimMessageId)
                        setTimeout(() => {bot.addMessageReaction(scrimSaChannel, config.scrimMessageIDs.saScrimMessageId, '❌')}, 5000);
                    }
                })
                break;
            case '❌':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        saScrimPlayers.forEach(player => {removeRoleQueue.push({user: player,id:saScrimActive,});})
                        if (roleQueueRemoveProcess === false){roleQueueRemove()}
                        saScrimAdmin = ''
                        saScrimPlayers = []
                        bot.deleteMessage(scrimSaChannel, config.scrimMessageIDs.saScrimMessageId)
                    }
                })
                break;
            default:
                break;
        }
    }
    if (reactMessage.id === config.scrimMessageIDs.oceScrimMessageId && user !== '374042097461755915'){
        switch (emoji.name) {
            case '🟦':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        if (oceScrimPlayers.length >= scrimSize){
                            for (i = 0; i < scrimSize; i++) {
                                addRoleQueue.push({user: oceScrimPlayers[i],id:oceScrimActive,});
                               ocePlayerTemp.push(bot.guilds.get(guildId).members.get(oceScrimPlayers[i]).username)
                            }
                            scrimLog('oce')
                            if (roleQueueProcess === false){roleQueue()}
                            bot.removeMessageReactions(scrimOceChannel, config.scrimMessageIDs.oceScrimMessageId)
                            setTimeout(() => {bot.addMessageReaction(scrimOceChannel, config.scrimMessageIDs.oceScrimMessageId, '❌')}, 5000);
                        }
                    }
                })
                break;
            case '✅':
                if (oceScrimPlayers.length < scrimSize){oceScrimPlayers.push(user)}
                break;
            case '🟥':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                       oceScrimPlayers.forEach(player => {
                            addRoleQueue.push({user: player,id:oceScrimActive,});
                           ocePlayerTemp.push(bot.guilds.get(guildId).members.get(player).username)
                        })
                        scrimLog('oce')
                        if (roleQueueProcess === false){roleQueue()}
                        bot.removeMessageReactions(scrimOceChannel, config.scrimMessageIDs.oceScrimMessageId)
                        setTimeout(() => {bot.addMessageReaction(scrimOceChannel, config.scrimMessageIDs.oceScrimMessageId, '❌')}, 5000);
                    }
                })
                break;
            case '❌':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        oceScrimPlayers.forEach(player => {removeRoleQueue.push({user: player,id:oceScrimActive,});})
                        if (roleQueueRemoveProcess === false){roleQueueRemove()}
                        oceScrimAdmin = ''
                        oceScrimPlayers = []
                        bot.deleteMessage(scrimOceChannel, config.scrimMessageIDs.oceScrimMessageId)
                    }
                })
                break;
            default:
                break;
        }
    }
    if (reactMessage.id === config.scrimMessageIDs.spScrimMessageId && user !== '374042097461755915'){
        switch (emoji.name) {
            case '🟦':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        if (spScrimPlayers.length >= scrimSize){
                            for (i = 0; i < scrimSize; i++) {
                                addRoleQueue.push({user: spScrimPlayers[i],id:spScrimActive,});
                               spPlayerTemp.push(bot.guilds.get(guildId).members.get(spScrimPlayers[i]).username)
                            }
                            scrimLog('sp')
                            if (roleQueueProcess === false){roleQueue()}
                            bot.removeMessageReactions(scrimSpChannel, config.scrimMessageIDs.spScrimMessageId)
                            setTimeout(() => {bot.addMessageReaction(scrimSpChannel, config.scrimMessageIDs.spScrimMessageId, '❌')}, 5000);
                        }
                    }
                })
                break;
            case '✅':
                if (spScrimPlayers.length < scrimSize){spScrimPlayers.push(user)}
                break;
            case '🟥':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                       spScrimPlayers.forEach(player => {
                            addRoleQueue.push({user: player,id:spScrimActive,});
                           spPlayerTemp.push(bot.guilds.get(guildId).members.get(player).username)
                        })
                        scrimLog('sp')
                        if (roleQueueProcess === false){roleQueue()}
                        bot.removeMessageReactions(scrimSpChannel, config.scrimMessageIDs.spScrimMessageId)
                        setTimeout(() => {bot.addMessageReaction(scrimSpChannel, config.scrimMessageIDs.spScrimMessageId, '❌')}, 5000);
                    }
                })
                break;
            case '❌':
                usersRoles.forEach(roles => {
                    if (roles === scrimAdminRole) {
                        spScrimPlayers.forEach(player => {removeRoleQueue.push({user: player,id:spScrimActive,});})
                        if (roleQueueRemoveProcess === false){roleQueueRemove()}
                        spScrimAdmin = ''
                        spScrimPlayers = []
                        bot.deleteMessage(scrimSpChannel, config.scrimMessageIDs.spScrimMessageId)
                    }
                })
                break;
            default:
                break;
        }
    }
})

bot.connect();

function makeScrimMessage(region, currentScrimSize) {
    const scrimMessage = {
        "embed": {
          "title": "Scrim Signup",
          "description": "Click the :white_check_mark: to sign up for the next set!!",
          "color": 16098851,
          "thumbnail": {
            "url": "https://cdn.discordapp.com/attachments/670828791010033664/676188290382036992/Kills.png"
          },
          "fields": [
            {
              "name": "Current Scrim Size: " + currentScrimSize,
              "value": "Scrim size is the amount of players \nthat are allowed to play in a scrim."
            },
            {
              "name": "For Scrim Organizers",
              "value": `click the  <:start:663144594401132603>  to start the scrim with FULL lobbies.
              click the  <:manual_start:663450072834375720>  to start the scrim with PARTIAL lobbies.
              click the  ❌  to end the scrim session.`
            }
          ]
        }
      };
    switch (region) {
        case 'east':
            bot.createMessage(scrimEastChannel, scrimMessage).then(function(message) {
                message.addReaction('✅')
                setTimeout(() => {
                    message.addReaction('🟦')
                    message.addReaction('🟥')
                }, 5000);

                config.scrimMessageIDs.eastScrimMessageId = message.id;
                
                fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
                  if (err) return console.log(err);
                });
            })
            break;
        case 'west':
            bot.createMessage(scrimWestChannel, scrimMessage).then(function(message) {
                message.addReaction('✅')
                setTimeout(() => {
                    message.addReaction('🟦')
                    message.addReaction('🟥')
                }, 5000);

                config.scrimMessageIDs.westScrimMessageId = message.id;
                
                fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
                  if (err) return console.log(err);
                });
            })
            break;
        case 'eu':
            bot.createMessage(scrimEuChannel, scrimMessage).then(function(message) {
                message.addReaction('✅')
                setTimeout(() => {
                    message.addReaction('🟦')
                    message.addReaction('🟥')
                }, 5000);

                config.scrimMessageIDs.euScrimMessageId = message.id;
                
                fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
                  if (err) return console.log(err);
                });
            })
            break;
        case 'sa':
            bot.createMessage(scrimSaChannel, scrimMessage).then(function(message) {
                message.addReaction('✅')
                setTimeout(() => {
                    message.addReaction('🟦')
                    message.addReaction('🟥')
                }, 5000);
    
                config.scrimMessageIDs.saScrimMessageId = message.id;
                    
                fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                });
            })
            break;
        case 'oce':
            bot.createMessage(scrimOceChannel, scrimMessage).then(function(message) {
                message.addReaction('✅')
                setTimeout(() => {
                    message.addReaction('🟦')
                    message.addReaction('🟥')
                }, 5000);
        
                config.scrimMessageIDs.oceScrimMessageId = message.id;
                    
                fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                });
            })
            break;
        case 'sp':
            bot.createMessage(scrimSpChannel, scrimMessage).then(function(message) {
                message.addReaction('✅')
                setTimeout(() => {
                    message.addReaction('🟦')
                    message.addReaction('🟥')
                }, 5000);
            
                config.scrimMessageIDs.spScrimMessageId = message.id;
                        
                fs.writeFile('config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                });
            })
            break;
        default:
            break;
    }
}
function updateDashboard(){
    const scrimDashboardMessage = {
        "embed": {
          "title": "Scrim Dashboard",
          "description": `
          Click the region you would like to start a scrim for.
          :flag_us: EAST: ${eastScrimAdmin}
          <:cali:662368255490523195> WEST: ${westScrimAdmin}
          :flag_eu: EU: ${euScrimAdmin}
          :flag_br: SA: ${saScrimAdmin}
          :flag_au: OCE: ${oceScrimAdmin}
          :flag_sg: SP: ${spScrimAdmin}`,
          "color": 5373696,
          "thumbnail": {
            "url": "https://webstockreview.net/images/play-icon-png.png"
          },
          "fields": [
            {
              "name": "Max Scrim Size",
              "value": scrimSize
            }
          ]
        }
      };
    bot.editMessage('693722254441447465', scrimDashboardMessageId, scrimDashboardMessage)
}
function roleQueue(){
    roleQueueProcess = true
    var roleQueueInterval = setInterval(function(){
        if (addRoleQueue[0]) {
            bot.addGuildMemberRole(guildId, addRoleQueue[0].user, addRoleQueue[0].id)
            console.log(addRoleQueue[0].user + 'added role added: true')
            addRoleQueue.splice(0,1);
        }
        else {
            clearInterval(roleQueueInterval)
            roleQueueProcess = false
        }
    }, 1500)
}
function roleQueueRemove(){
    roleQueueRemoveProcess = true
    var roleQueueRemoveInterval = setInterval(function(){
        if (removeRoleQueue[0]) {
            bot.removeGuildMemberRole(guildId, removeRoleQueue[0].user, removeRoleQueue[0].id)
            console.log(removeRoleQueue[0].user + 'added role added: false')
            removeRoleQueue.splice(0,1);
        }
        else {
            clearInterval(roleQueueRemoveInterval)
            roleQueueRemoveProcess = false
        }
    }, 1500)
}
function scrimLog(region){
    switch (region) {
        case 'east':
            var tempEastPlayerList = eastPlayerTemp.toString().replace(/,/g, '\n');
            bot.createMessage(scrimLogChannel,  '```USERS SIGNED UP FOR EAST: \n' + tempEastPlayerList + '```')
            tempEastPlayerList = ''
            eastPlayerTemp = []
            break;
    
        case 'west':
            var tempWestPlayerList = westPlayerTemp.toString().replace(/,/g, '\n');
            bot.createMessage(scrimLogChannel,  '```USERS SIGNED UP FOR WEST: \n' + tempWestPlayerList + '```')
            tempWestPlayerList = ''
            westPlayerTemp = []
            break;
        case 'eu':
            var tempEuPlayerList = euPlayerTemp.toString().replace(/,/g, '\n');
            bot.createMessage(scrimLogChannel,  '```USERS SIGNED UP FOR EU: \n' + tempEuPlayerList + '```')
            tempEuPlayerList = ''
            euPlayerTemp = []
            break;
        case 'sa':
            var tempSaPlayerList = saPlayerTemp.toString().replace(/,/g, '\n');
            bot.createMessage(scrimLogChannel,  '```USERS SIGNED UP FOR SA: \n' + tempSaPlayerList + '```')
            tempSaPlayerList = ''
            saPlayerTemp = []
            break;
        case 'oce':
            var tempOcePlayerList = ocePlayerTemp.toString().replace(/,/g, '\n');
            bot.createMessage(scrimLogChannel,  '```USERS SIGNED UP FOR OCE: \n' + tempOcePlayerList + '```')
            tempOcePlayerList = ''
            ocePlayerTemp = []
            break;
        case 'sp':
            var tempSpPlayerList = spPlayerTemp.toString().replace(/,/g, '\n');
            bot.createMessage(scrimLogChannel,  '```USERS SIGNED UP FOR SP: \n' + tempSpPlayerList + '```')
            tempSpPlayerList = ''
            spPlayerTemp = []
            break;

        default:
            break;
    }
}