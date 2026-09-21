// Minimum deposit amounts, centralized here so they can be tuned (e.g. for
// testing) in one place instead of hunting through every form that validates
// a deposit amount. Mirrors Billion_Doller_Backend/config/depositLimits.js -
// keep both in sync if you change one.
export const MIN_DEPOSIT_USD = 1;
export const MIN_DEPOSIT_INR = 10;
