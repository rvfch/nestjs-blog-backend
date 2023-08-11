// checks if a password has at least one uppercase letter and a number or special character
export const PASSWORD_REGEX =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

// checks if a string has only letters, numbers, spaces, apostrophes, dots and dashes
export const NAME_REGEX = /(^[\p{L}\d'\.\s\-]*$)/u;

// checks if a string is a valid slug, useful for usernames
export const SLUG_REGEX = /^[a-z\d]+(?:(\.|-|_)[a-z\d]+)*$/;

// validates if passwords are valid bcrypt hashes
export const BCRYPT_HASH = /\$2[abxy]?\$\d{1,2}\$[A-Za-z\d\./]{53}/;

// validates if password are valid argon2 hashes
export const ARGON2_HASH =
  /^\$argon2id\$v=(?:16|19)\$m=\d{1,10},t=\d{1,10},p=\d{1,3}(?:,keyid=[A-Za-z0-9+\/]{0,11}(?:,data=[A-Za-z0-9+\/]{0,43})?)?\$[A-Za-z0-9+\/]{11,64}\$[A-Za-z0-9+\/]{16,86}$/;
