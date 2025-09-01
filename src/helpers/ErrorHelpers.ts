import { ZodError } from "zod";

/*
 * Each key is the field name and the value is the error message.
 *
 * @param err - The error object, usually a ZodError or any other error
 * @param customMsg - Optional custom message if the error is not a ZodError
 * @returns An object where keys are field names and values are error messages
 */
export function errorMessage(err: any, customMsg: string | null = null): Record<string, string> {
    const formatted: Record<string, string> = {};
  
    if (err instanceof ZodError) {
        for (const issue of err.issues) {
            // Use the first path element as field, or "unknown" if path is empty
            const field = issue.path.length > 0 ? String(issue.path[0]) : "unknown";
        
            // Only take the first error per field
            if (!formatted[field]) {
                formatted[field] = makeMessage(issue);
            }
        }

        return formatted;
    } else {
        return customMsg || (err.message || "An unknown error occurred");
    }
}

/*
 * Converts a Zod error (or any other error) into an array of objects
 * where each object contains a 'field' and 'message' key.
 *
 * @param err - The error object, usually a ZodError or any other error
 * @param customMsg - Optional custom message if the error is not a ZodError
 * @returns An array of objects, each with { field, message }
 */
export function errorMessageArr(err: any, customMsg: string | null = null): { field: string; message: any }[] {
    const formatted: Record<string, string> = {};

    if (err instanceof ZodError) {
        for (const issue of err.issues) {
            // Use the first path element as field, or "unknown" if path is empty
            const field = issue.path.length > 0 ? String(issue.path[0]) : "unknown";

            // Only take the first error per field
            if (!formatted[field]) {
                formatted[field] = makeMessage(issue);
            }
        }

        // Convert the record into an array
        return Object.entries(formatted).map(([field, message]) => ({ field, message }));
    } else {
        return customMsg || (err.message || "An unknown error occurred");
    }
}

/**
 * Converts a Zod validation issue into a readable error message.
 * 
 * @param issue - The ZodIssue object from Zod validation
 * @returns A human-readable error message string
 */
function makeMessage(issue: any): string {
    // Get the field name from the first element of the path; default to "unknown"
    const field = issue.path.length > 0 ? String(issue.path[0]) : "unknown";

    // Start with Zod's default message
    let errorMsg = issue.message;
    
    if (issue.code == 'too_small') {
        // If the minimum allowed characters is greater than 1, show length requirement Otherwise, consider it "required" (for empty strings)
        errorMsg = issue.minimum > 1 ? `The ${fieldName(field)} field must be at least ${issue.minimum} characters.` : `${fieldName(field)} is required`;
    } else if (issue.code == 'too_big') {
        // Maximum length validation
        errorMsg = `The ${fieldName(field)} field must be less than or equal to ${issue.maximum} characters.`;
    } else if (issue.code == 'invalid_type') {
        // Missing field (undefined) → required
        errorMsg = `${fieldName(field)} is required`;
    }

    return errorMsg;
}

/**
 * Converts a string (usually a field name) into "Title Case" and replaces underscores with spaces.
 * Example: "first_name" → "First Name"
 * 
 * @param str - The string to format
 * @returns Formatted string in title case
 */
function fieldName(str: string): string {
    return str
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
}