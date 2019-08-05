const ROLE_NAMES = ['top', 'jungle', 'mid', 'adc', 'support'];

var ROLES =
{
	INVALID: -1,
	TOP: 0,
	JUNGLE: 1,
	MID: 2,
	ADC: 3,
	SUPPORT: 4,

	MAX_ROLES: 5
};

/**
 * Convert role name to role id (STRING > ENUM)
 *
 * @param role_name           role name
 * @return int
 */
function RoleNameToRoleId(role_name)
{
	for(var i = 0; i < ROLE_NAMES.length; i++)
	{
		if(role_name === ROLE_NAMES[i])
			return i;
	}
	return -1;
}

/**
 * Convert role id to role name (ENUM > STRING)
 *
 * @param role_id            role id
 * @return string
 */
function RoleIdToRoleName(role_id)
{
	return ROLE_NAMES[role_id];
}

/**
 * Returns true if role name is valid
 *
 * @param role_name          role name
 * @return bool
 */
function IsValidRoleName(role_name)
{
	for(var i = 0; i < ROLE_NAMES.length; i++)
	{
		if(ROLE_NAMES[i] === role_name)
			return true;
	}
	return false;
}

/**
 * Returns true if role id is valid
 *
 * @param role_id            role id
 * @return bool
 */
function IsValidRoleId(role_id)
{
	return role_id >= 0 && role_id < ROLES.MAX_ROLES;
}

module.exports =
{
	ROLE_NAMES:       ROLE_NAMES,
	ROLES:            ROLES,

	RoleNameToRoleId: RoleNameToRoleId,
	RoleIdToRoleName: RoleIdToRoleName,
	IsValidRoleName:  IsValidRoleName,
	IsValidRoleId:    IsValidRoleId
};
