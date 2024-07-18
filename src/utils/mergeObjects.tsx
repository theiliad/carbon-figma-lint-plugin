export type AnyObject = { [key: string]: any };

export function mergeObjects(obj1: AnyObject, obj2: AnyObject): AnyObject {
  let result: AnyObject = {};

  // Helper function to merge two values
  function mergeValues(value1: any, value2: any): any {
    if (typeof value1 === "number" && typeof value2 === "number") {
      return value1 + value2;
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.concat(value2);
    } else {
      return value2; // Default case: take the value from obj2
    }
  }

  // Add keys from obj1 to the result
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      result[key] = obj1[key];
    }
  }

  // Merge obj2 into the result
  for (let key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (result.hasOwnProperty(key)) {
        result[key] = mergeValues(result[key], obj2[key]);
      } else {
        result[key] = obj2[key];
      }
    }
  }

  return result;
}
