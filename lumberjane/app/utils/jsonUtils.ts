//Helper functions for working with JSON

const convertToJSON = (inputStr: string): string => {
  // Preprocess the input by removing quotes and condensing spaces
  inputStr = inputStr.replace(/[\'\"]/g, '')
  inputStr = inputStr.replace(/\s+/g, ' ').trim()

  // Initialize variables
  const newStr: string[] = []
  let lookingForFirstAlpha = true
  let lastAlphaPosNewStr = -1 // Position of the last alphanumeric character in the new string

  // Virtual cursor to iterate through characters
  let i = 0
  while (i < inputStr.length) {
    const c = inputStr[i]

    if (/\w/.test(c)) { // Alphanumeric character found
      if (lookingForFirstAlpha) {
        newStr.push('"') // Insert quote before first alphanumeric
        lookingForFirstAlpha = false
      }
      lastAlphaPosNewStr = newStr.length // Record position in the new string
    } else if (/\s/.test(c)) {
      // Space found, just continue
      i++
      continue
    } else if (['{', '}', '[', ']', ':', ','].includes(c)) {
      // Structural character found
      if (!lookingForFirstAlpha) {
        // Insert quote after last alphanumeric
        newStr.splice(lastAlphaPosNewStr + 1, 0, '"')
        lookingForFirstAlpha = true
      }
    }

    // Add the current character to the new string
    newStr.push(c)
    i++
  }

  // Handle trailing word without structural character
  if (!lookingForFirstAlpha) {
    newStr.splice(lastAlphaPosNewStr + 1, 0, '"')
  }

  // Convert to string and handle trailing commas
  let result = newStr.join('')
  result = result.replace(/\s*,\s*([}\]])/g, '$1') // Remove trailing commas before } or ]

  return result
}


const isValidJSON = (value: string) => {
  if(value == '' || value === "{}") return true
  else {
    try {
      const convertedValue = convertToJSON(value)
      JSON.parse(convertedValue)
      return true
    } catch (e) {
      return false
    }
  }
}

export { convertToJSON, isValidJSON }