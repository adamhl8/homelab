async function getInput(prompt: string) {
  process.stdout.write(prompt)
  for await (const line of console) {
    return line
  }
  return ""
}

export { getInput }
