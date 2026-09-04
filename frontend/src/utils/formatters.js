export const formatGameTypeLabel = (type) => {
    if (!type) return 'GAME';

    if (type.startsWith('Cup Comp North - ')) {
        const sub = type.replace('Cup Comp North - ', '');
        const shortSub = sub
            .replace('Checking ', 'CHK')
            .replace('Non-Check ', 'N-CHK')
            .replace("Women's", 'W')
            .trim();
        return `${shortSub} NORTH`;
    }

    if (type.startsWith('Cup Comp South - ')) {
        const sub = type.replace('Cup Comp South - ', '');
        const shortSub = sub
            .replace('Checking ', 'CHK')
            .replace('Non-Check ', 'N-CHK')
            .replace("Women's", 'W')
            .trim();
        return `${shortSub} SOUTH`;
    }

    if (type.startsWith('National Championships - ')) {
        const sub = type.replace('National Championships - ', '');
        const shortSub = sub
            .replace('Checking ', 'CHK ')
            .replace('Womens ', 'WMS ')
            .replace('Non-Check ', 'N-CHK ');
        return `${shortSub.toUpperCase()} NATS`;
    }

    return type.toUpperCase();
};

export const formatTeamName = (team) => {
    if (!team) return '';
    if (team.shortName && team.shortName.includes('-')) {
        return team.shortName.replace('-', ' ');
    }
    return team.shortName || team.name;
};