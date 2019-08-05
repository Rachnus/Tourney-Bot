function FixDiscordLaneRole(role)
{
    role = role.toLowerCase();
	return role = role.charAt(0).toUpperCase() + role.slice(1);
}

function RemoveLaneRoles(guildmember, guild)
{
    var roleTop     = guild.roles.find(role => role.name === "Top");
    var roleJungle  = guild.roles.find(role => role.name === "Jungle");
    var roleMid     = guild.roles.find(role => role.name === "Mid");
    var roleAdc     = guild.roles.find(role => role.name === "Adc");
    var roleSupport = guild.roles.find(role => role.name === "Support");

    guildmember.removeRole(roleTop);
    guildmember.removeRole(roleJungle);
    guildmember.removeRole(roleMid);
    guildmember.removeRole(roleAdc);
    guildmember.removeRole(roleSupport);
}

function RemoveLaneRole(guildmember, guild, role_name)
{
    var role = guild.roles.find(role => role.name === role_name);
    guildmember.removeRole(role);
}

function AddLaneRole(guildmember, guild, role_name)
{
    var role = guild.roles.find(role => role.name === role_name);
    guildmember.addRole(role);
}

module.exports =
{
	FixDiscordLaneRole: FixDiscordLaneRole,
    RemoveLaneRoles:    RemoveLaneRoles
};
