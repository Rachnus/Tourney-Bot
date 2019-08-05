const TIERS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'challenger']

/**
 * Returns true if string passed as argument is a valid tier
 *
 * @param tier      tier name
 * @return bool
 */
function IsValidTier(tier)
{
	for(var i = 0; i < TIERS.length; i++)
	{
		if(tier === TIERS[i])
			return true;
	}
	return false;
}

module.exports = 
{
	tiers: TIERS,
	IsValidTier: IsValidTier
};
