/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }