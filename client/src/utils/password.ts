export const passwordIsValid = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=]).{8,}$/;
  return passwordRegex.test(password);
};

export const passwordValidationError =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
