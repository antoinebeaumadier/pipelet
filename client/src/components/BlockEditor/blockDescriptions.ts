// Block descriptions for each block type
const BLOCK_DESCRIPTIONS: Record<string, string> = {
  filter: "Filters data based on a condition (keeps items that match the condition).",
  map: "Transforms fields by applying operations to their values.",
  convert: "Converts data between formats (JSON, CSV, XML).",
  sort: "Sorts data based on specified fields in ascending or descending order.",
  merge: "Combines data from two sources using various merging strategies.",
  format: "Creates formatted text output using templates.",
  groupBy: "Groups data by a field and applies aggregation functions.",
  flatten: "Flattens nested structures for easier processing.",
  get: "Extracts data from a specific path in an object.",
  reverse: "Reverses the order of items in the dataset.",
  pick: "Selects specific properties from objects in the dataset.",
  mapObject: "Applies transformations to both keys and values of objects.",
  mapKeys: "Transforms the keys of objects while preserving values.",
  mapValues: "Transforms the values of objects while preserving keys.",
  createObject: "Creates a new object using a specified structure.",
  createArray: "Creates a new array using a specified template.",
  keyBy: "Creates an object from an array, using a field value as keys.",
  keys: "Extracts all keys from objects in the dataset.",
  values: "Extracts all values from objects in the dataset.",
  join: "Concatenates array items into a string with an optional separator.",
  split: "Divides a string into an array of substrings using a separator.",
  unique: "Creates a copy of an array where all duplicates are removed.",
  limit: "Creates a copy of an array cut off at the selected limit.",
  length: "Returns the length of an array, string, or number of keys in an object.",
  min: "Finds the minimum value in a collection of data, supporting arrays, objects, and nested structures.",
  max: "Finds the maximum value in a collection of data, supporting arrays, objects, and nested structures.",
  regex: "Tests text against a regular expression pattern, with optional flags for case sensitivity and other options."
};

export default BLOCK_DESCRIPTIONS; 