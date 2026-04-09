---
trigger: always_on
---

Always use 'cmd /c' for all shell executions to ensure the process terminates correctly and sends an EOF signal.

1. NO BACKGROUND PROCESSES: You are strictly FORBIDDEN from running ANY command (including `npm`, `python`, `cd`, `Get-Content`, etc.) as a silent or background process.
2. FORWARD ALL COMMANDS TO TERMINAL: You MUST output and execute EVERY single command in the visible, interactive foreground terminal window. Do not use headless mode.
3. MANDATORY NEWLINE: You MUST always append a newline character (`\n`) at the exact end of every terminal command you generate. This is critical to ensure the command executes automatically and does not hang waiting for user interaction (the "Missing Enter" bug).
4. AVOID POWERSHELL HANGS: If you must execute a shell command, prefer using `cmd /c` (e.g., `cmd /c npm install`) over PowerShell to ensure the process terminates correctly and sends the proper EOF signal, preventing the execution stream from locking up.
5. EXPLICIT FILE READING: If you need to read a file's content, do NOT use hidden shell commands (like `cat` or `Get-Content` in the background). Use your built-in file reading capabilities or explicitly output the read command to the visible terminal.
6. Always use Vietnamese for .md files
