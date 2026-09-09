// Minimum withdrawal amounts, centralized here so they can be tuned (e.g. for
// testing) in one place instead of hunting through every form that validates
// a withdrawal amount. Mirrors Billion_Doller_Backend/config/withdrawalLimits.js -
// keep both in sync if you change one.
export const MIN_WITHDRAWAL_USD = 1;
export const MIN_WITHDRAWAL_INR = 10;
