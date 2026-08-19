export function getAccessState(user) {
  const defaultState = {
    canPost: false,
    canJoinClubs: false,
    canRSVP: false,
    canDMStudents: false,
    canBecomeAmbassador: false,
    canConnectWithAmbassador: false,
    canAcceptConnection: false,
    canUseCampusHub: false,
    feedMode: 'read-only'
  };

  if (!user) return defaultState;

  // Super Admin Override
  if (user.email === 'ranadeepsen2004@gmail.com') {
    return {
      canPost: true,
      canJoinClubs: true,
      canRSVP: true,
      canDMStudents: true,
      canBecomeAmbassador: true,
      canConnectWithAmbassador: true, // Prospective feature
      canAcceptConnection: true,      // Ambassador feature
      canUseCampusHub: true,
      canVerifyID: true,              // Admin feature
      feedMode: 'full'
    };
  }

  if (!user.profileCompleted) return defaultState;

  if (user.user_type === 'prospective' && user.status === 'verified') {
    return {
      ...defaultState,
      canConnectWithAmbassador: true,
      feedMode: 'read-only'
    };
  }

  if (user.user_type === 'current' && user.status === 'verified') {
    return {
      canPost: true,
      canJoinClubs: true,
      canRSVP: true,
      canDMStudents: true,
      canBecomeAmbassador: true,
      canConnectWithAmbassador: false,
      canAcceptConnection: user.isAmbassador,
      canUseCampusHub: true,
      canVerifyID: true, // Enabled for testing purposes
      feedMode: 'full'
    };
  }

  return defaultState;
}
