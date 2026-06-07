import { marked } from "marked";
import { createTerminalRenderer, darkTheme } from "marked-terminal-renderer";

marked.use(createTerminalRenderer(darkTheme()));

export { marked };
